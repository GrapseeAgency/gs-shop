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
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
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
 */
object AppUpdater {

    @Serializable
    private data class ReleaseAsset(val name: String = "", val browser_download_url: String = "")

    @Serializable
    private data class Release(val tag_name: String = "", val name: String? = null, val body: String? = null, val assets: List<ReleaseAsset> = emptyList())

    data class UpdateInfo(val version: String, val notes: String, val apkUrl: String)

    sealed interface State {
        data object Idle : State
        data object Checking : State
        data object UpToDate : State
        data class Available(val info: UpdateInfo) : State
        data class Downloading(val percent: Int) : State
        data object InstallReady : State
        data class Error(val message: String) : State
    }

    private val json = Json { ignoreUnknownKeys = true }
    private val client: OkHttpClient by lazy {
        OkHttpClient.Builder()
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .build()
    }

    private val _state = MutableStateFlow<State>(State.Idle)
    val state: StateFlow<State> = _state.asStateFlow()

    private var apkFile: File? = null
    private var pending: UpdateInfo? = null

    fun repoSlug(): String = "${BuildConfig.UPDATE_OWNER}/${BuildConfig.UPDATE_REPO}"

    fun isConfigured(): Boolean =
        BuildConfig.UPDATE_OWNER != "OWNER" && BuildConfig.UPDATE_REPO != "REPO"

    /** Newer-than-installed? Compares numeric segments of v-prefixed tags. */
    internal fun isNewer(latest: String, current: String): Boolean {
        fun parts(v: String): List<Int> =
            v.trim().trimStart('v', 'V').split(".", "-", "+").mapNotNull { it.toIntOrNull() }
        val a = parts(latest)
        val b = parts(current)
        for (i in 0 until maxOf(a.size, b.size)) {
            val x = a.getOrElse(i) { 0 }
            val y = b.getOrElse(i) { 0 }
            if (x != y) return x > y
        }
        return false
    }

    suspend fun check(): Unit = withContext(Dispatchers.IO) {
        if (!isConfigured()) {
            _state.value = State.Error("Updater not configured (UPDATE_OWNER/UPDATE_REPO)")
            return@withContext
        }
        _state.value = State.Checking
        runCatching {
            val req = Request.Builder()
                .url("https://api.github.com/repos/${repoSlug()}/releases/latest")
                .header("Accept", "application/vnd.github+json")
                .build()
            client.newCall(req).execute().use { resp ->
                if (!resp.isSuccessful) throw IllegalStateException("GitHub HTTP ${resp.code}")
                val release = json.decodeFromString(Release.serializer(), resp.body?.string().orEmpty())
                val apk = release.assets.firstOrNull { it.name.endsWith(".apk", ignoreCase = true) }
                    ?: throw IllegalStateException("No APK asset in latest release")
                if (isNewer(release.tag_name, BuildConfig.VERSION_NAME)) {
                    val info = UpdateInfo(
                        version = release.tag_name,
                        notes = release.body.orEmpty().take(500),
                        apkUrl = apk.browser_download_url,
                    )
                    pending = info
                    _state.value = State.Available(info)
                } else {
                    _state.value = State.UpToDate
                }
            }
        }.onFailure {
            _state.value = State.Error(it.message ?: "Update check failed")
        }
    }

    suspend fun download(): Unit = withContext(Dispatchers.IO) {
        val info = pending ?: return@withContext
        _state.value = State.Downloading(0)
        runCatching {
            val req = Request.Builder().url(info.apkUrl).header("Accept", "application/octet-stream").build()
            client.newCall(req).execute().use { resp ->
                if (!resp.isSuccessful) throw IllegalStateException("Download HTTP ${resp.code}")
                val body = resp.body ?: throw IllegalStateException("Empty download body")
                val total = body.contentLength()
                val context = AppContext.get()
                val outFile = File(context.filesDir, "updates/grapsee-${info.version}.apk").apply { parentFile?.mkdirs() }
                body.byteStream().use { input ->
                    outFile.outputStream().use { output ->
                        val buffer = ByteArray(64 * 1024)
                        var downloaded = 0L
                        var lastPercent = -1
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
                    }
                }
                apkFile = outFile
                _state.value = State.InstallReady
            }
        }.onFailure {
            _state.value = State.Error(it.message ?: "Download failed")
        }
    }

    /** Fires the system installer. Returns false when the unknown-sources screen was opened instead. */
    fun install(context: Context): Boolean {
        val file = apkFile?.takeIf { it.exists() } ?: return false
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
            !context.packageManager.canRequestPackageInstalls()
        ) {
            context.startActivity(
                Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:${context.packageName}"))
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
            )
            return false
        }
        val uri = FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", file)
        val intent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(uri, "application/vnd.android.package-archive")
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
        return true
    }

    fun reset() {
        _state.value = State.Idle
    }
}
