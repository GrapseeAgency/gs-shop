package com.grapsee.shop.core.update

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.content.FileProvider
import com.grapsee.shop.BuildConfig
import com.grapsee.shop.core.network.AppContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.File
import java.util.concurrent.TimeUnit

/**
 * In-app live updater backed by GitHub Releases.
 *
 * Flow: check() compares the latest release tag against the installed
 * versionName → UI shows "new version available" → download() streams the
 * APK with 0–100 progress → install() fires the system installer (the user
 * confirms, enabling "install unknown apps" for Grapsee if asked).
 *
 * Hardening rules (all covered by [UpdateCheckTest] where pure):
 * - unknown/blank tags and versions NEVER trigger a prompt (fail closed);
 * - exact release asset preferred, otherwise the largest APK wins;
 * - downloads go to a `.tmp` file and are renamed only when the byte count
 *   matches `Content-Length` (truncation can never reach the installer);
 * - partial files are deleted on any failure; concurrent downloads and
 *   check-during-download are refused by a mutex + state guard;
 * - GitHub 403/429 surfaces as an explicit rate-limit message with retries.
 */
object AppUpdater {

    @Serializable
    private data class ReleaseAsset(val name: String = "", val browser_download_url: String = "", val size: Long = 0L)

    @Serializable
    private data class Release(val tag_name: String = "", val name: String? = null, val body: String? = null, val assets: List<ReleaseAsset> = emptyList())

    data class UpdateInfo(val version: String, val notes: String, val apkUrl: String)

    sealed interface State {
        data object Idle : State
        data object Checking : State
        data object UpToDate : State
        data class Available(val info: UpdateInfo) : State
        /** percent < 0 means the size is unknown — show an indeterminate bar. */
        data class Downloading(val percent: Int) : State
        data object InstallReady : State
        data class Error(val message: String) : State
    }

    private val json = Json { ignoreUnknownKeys = true; explicitNulls = false }
    private val client: OkHttpClient by lazy {
        OkHttpClient.Builder()
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .build()
    }

    private val _state = MutableStateFlow<State>(State.Idle)
    val state: StateFlow<State> = _state.asStateFlow()

    private val ioMutex = Mutex()
    private var apkFile: File? = null
    private var pending: UpdateInfo? = null

    fun repoSlug(): String = "${BuildConfig.UPDATE_OWNER}/${BuildConfig.UPDATE_REPO}"

    fun isConfigured(): Boolean =
        BuildConfig.UPDATE_OWNER != "OWNER" && BuildConfig.UPDATE_REPO != "REPO"

    private fun apiGet(url: String): String {
        val req = Request.Builder()
            .url(url)
            .header("Accept", "application/vnd.github+json")
            .header("X-GitHub-Api-Version", "2022-11-28")
            .build()
        client.newCall(req).execute().use { resp ->
            val body = resp.body?.string().orEmpty()
            if (!resp.isSuccessful) {
                throw IllegalStateException(UpdateLogic.githubError(resp.code, UpdateLogic.apiMessage(body)))
            }
            if (body.isBlank()) throw IllegalStateException("Empty response from GitHub")
            return body
        }
    }

    suspend fun check(): Unit = withContext(Dispatchers.IO) {
        if (_state.value is State.Downloading) return@withContext
        if (!isConfigured()) {
            _state.value = State.Error("Updater not configured (UPDATE_OWNER/UPDATE_REPO)")
            return@withContext
        }
        _state.value = State.Checking
        var attempt = 0
        var lastError: Throwable? = null
        // Retry transient failures (5xx / I/O), never 4xx client errors.
        while (attempt < 3) {
            runCatching {
                val body = apiGet("https://api.github.com/repos/${repoSlug()}/releases/latest")
                val release = json.decodeFromString(Release.serializer(), body)
                if (release.tag_name.isBlank()) throw IllegalStateException("Release has no tag")
                val apk = UpdateLogic.pickApk(
                    release.assets.map { UpdateLogic.Asset(it.name, it.browser_download_url, it.size) },
                ) ?: throw IllegalStateException("No installable APK in ${release.tag_name}")
                if (apk.url.isBlank() || !(apk.url.startsWith("https://") || apk.url.startsWith("http://"))) {
                    throw IllegalStateException("Bad download URL in release")
                }
                if (UpdateLogic.isNewer(release.tag_name, BuildConfig.VERSION_NAME)) {
                    val info = UpdateInfo(
                        version = release.tag_name,
                        notes = release.body.orEmpty().take(500),
                        apkUrl = apk.url,
                    )
                    pending = info
                    _state.value = State.Available(info)
                } else {
                    // Never offer a stale pending download once the check says current.
                    pending = null
                    _state.value = State.UpToDate
                }
            }.onSuccess { return@withContext }
                .onFailure { t ->
                    lastError = t
                    val transient = t.message?.contains("HTTP 5") == true ||
                        t is java.io.IOException ||
                        t.message?.contains("Unable to resolve host") == true
                    if (!transient) {
                        _state.value = State.Error(t.message ?: "Update check failed")
                        return@withContext
                    }
                    attempt++
                    if (attempt < 3) delay(1500L * attempt)
                }
        }
        _state.value = State.Error(lastError?.message ?: "Update check failed")
    }

    suspend fun download(): Unit = withContext(Dispatchers.IO) {
        val info = pending
        if (info == null) {
            _state.value = State.Error("Nothing to download — check again")
            return@withContext
        }
        // Single-flight: refuse while another download owns the mutex.
        if (!ioMutex.tryLock()) return@withContext
        try {
            _state.value = State.Downloading(0)
            runCatching {
                val req = Request.Builder().url(info.apkUrl).header("Accept", "application/octet-stream").build()
                client.newCall(req).execute().use { resp ->
                    if (!resp.isSuccessful) {
                        throw IllegalStateException("Download HTTP ${resp.code}")
                    }
                    val body = resp.body ?: throw IllegalStateException("Empty download body")
                    val total = body.contentLength()
                    val dir = File(AppContext.get().filesDir, "updates").apply { mkdirs() }
                    val tmp = File(dir, UpdateLogic.safeFileName(info.version) + ".tmp")
                    val final = File(dir, UpdateLogic.safeFileName(info.version))
                    // Drop any stale partial from a previous failed run.
                    if (tmp.exists()) tmp.delete()
                    try {
                        body.byteStream().use { input ->
                            tmp.outputStream().use { output ->
                                val buffer = ByteArray(64 * 1024)
                                var downloaded = 0L
                                var lastPercent = -1
                                if (total <= 0) _state.value = State.Downloading(-1)
                                while (true) {
                                    val read = input.read(buffer)
                                    if (read == -1) break
                                    output.write(buffer, 0, read)
                                    downloaded += read
                                    if (total > 0) {
                                        val percent = ((downloaded * 100) / total).toInt().coerceIn(0, 100)
                                        if (percent != lastPercent) {
                                            lastPercent = percent
                                            _state.value = State.Downloading(percent)
                                        }
                                    }
                                }
                                output.flush()
                            }
                        }
                        if (total > 0 && tmp.length() != total) {
                            throw IllegalStateException("Truncated download (${tmp.length()}/$total bytes)")
                        }
                        if (tmp.length() < 1_000_000) {
                            throw IllegalStateException("Download too small to be an APK (${tmp.length()} bytes)")
                        }
                        if (final.exists()) final.delete()
                        if (!tmp.renameTo(final)) throw IllegalStateException("Could not stage update file")
                        apkFile = final
                        _state.value = State.InstallReady
                    } finally {
                        if (tmp.exists()) tmp.delete()
                    }
                }
            }.onFailure {
                _state.value = State.Error(it.message ?: "Download failed")
            }
        } finally {
            if (ioMutex.isLocked) ioMutex.unlock()
        }
    }

    /** Fires the system installer. False = opened unknown-sources settings or a launch failure. */
    fun install(context: Context): Boolean {
        // Memory-only handle is lost on process death — recover the staged file.
        val file = apkFile?.takeIf { it.exists() && it.length() > 1_000_000 }
            ?: stagedApk(context)?.also { apkFile = it }
            ?: run {
                _state.value = State.Error("Update file missing — download again")
                return false
            }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
            !context.packageManager.canRequestPackageInstalls()
        ) {
            runCatching {
                context.startActivity(
                    Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:${context.packageName}"))
                        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
                )
            }.onFailure {
                _state.value = State.Error("Cannot open install-permission settings")
            }
            return false
        }
        return runCatching {
            val uri = FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", file)
            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(uri, "application/vnd.android.package-archive")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
            true
        }.onFailure {
            _state.value = State.Error("Installer would not start (${it.message})")
        }.getOrDefault(false)
    }

    fun reset() {
        pending = null
        _state.value = State.Idle
    }

    /** Newest staged APK over 1MB, if a previous run left one behind. */
    private fun stagedApk(context: Context): File? {
        return runCatching {
            val dir = File(context.filesDir, "updates")
            dir.listFiles { f -> f.isFile && f.name.endsWith(".apk") && !f.name.endsWith(".tmp") && f.length() > 1_000_000 }
                ?.maxByOrNull { it.lastModified() }
        }.getOrNull()
    }
}
