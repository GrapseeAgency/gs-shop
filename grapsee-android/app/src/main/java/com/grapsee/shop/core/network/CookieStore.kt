package com.grapsee.shop.core.network

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.serialization.builtins.MapSerializer
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.builtins.serializer
import okhttp3.Cookie
import okhttp3.CookieJar
import okhttp3.HttpUrl
import okhttp3.HttpUrl.Companion.toHttpUrlOrNull
import com.grapsee.shop.BuildConfig

data class SessionState(
    val checking: Boolean = false,
    val loggedIn: Boolean = false,
    val email: String? = null,
    val name: String? = null,
)

/**
 * Persistent cookie jar + session store.
 *
 * The backend's auth is NextAuth v4 cookie-session (httpOnly
 * `next-auth.session-token`, no Bearer tokens), so the whole session lives in
 * this jar. Cookies survive restarts and are shared with the WebView so the
 * native and web halves of the app behave as one logged-in user.
 */
class CookieStore(context: Context) : CookieJar {

    private val prefs: SharedPreferences = try {
        val master = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()
        EncryptedSharedPreferences.create(
            context, "grapsee_secure_prefs", master,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
        )
    } catch (t: Throwable) {
        // Keystore can fail on some devices; degrade to memory-only rather than crash.
        context.getSharedPreferences("grapsee_insecure_prefs", Context.MODE_PRIVATE)
    }

    private val serializer = MapSerializer(String.serializer(), ListSerializer(String.serializer()))

    /** host -> list of "name=value; Domain=...; Path=..." cookie strings */
    private val cookies: MutableMap<String, List<String>> = readCookies()

    private val _session = MutableStateFlow(
        SessionState(
            loggedIn = sessionCookie() != null,
            email = prefs.getString(KEY_EMAIL, null),
            name = prefs.getString(KEY_NAME, null),
        ),
    )
    val session: StateFlow<SessionState> = _session.asStateFlow()

    @Synchronized
    override fun loadForRequest(url: HttpUrl): List<Cookie> {
        val out = mutableListOf<Cookie>()
        val hosts = cookies.keys.filter { host ->
            url.host == host || url.host.endsWith(".$host")
        }
        for (host in hosts) {
            for (raw in cookies[host].orEmpty()) {
                Cookie.parse(url, raw)?.let { out += it }
            }
        }
        // Dedupe by name, last write wins (NextAuth rotates csrf tokens).
        return out.distinctBy { it.name }
    }

    @Synchronized
    override fun saveFromResponse(url: HttpUrl, newCookies: List<Cookie>) {
        val bucket = this.cookies[url.host].orEmpty().toMutableList()
        for (cookie in newCookies) {
            bucket.removeAll { it.startsWith("${cookie.name}=") }
            bucket += cookie.toString()
        }
        this.cookies[url.host] = bucket
        persist()
    }

    /** The NextAuth session token for [host] (e.g. to sync into the WebView). */
    @Synchronized
    fun cookieFor(host: String, name: String = "next-auth.session-token"): String? {
        for (candidate in listOf(host, host.removePrefix("www."))) {
            cookies[candidate]?.forEach { raw ->
                if (raw.startsWith("$name=")) return raw.substringBefore(';').substringAfter('=')
            }
        }
        // Fall back to any host whose cookie jar holds this session cookie.
        cookies.values.forEach { bucket ->
            bucket.forEach { raw ->
                if (raw.startsWith("$name=")) return raw.substringBefore(';').substringAfter('=')
            }
        }
        return null
    }

    /** Import cookies captured from the WebView (header form: "k=v; k2=v2"). */
    @Synchronized
    fun importFromWebView(url: String, header: String) {
        val httpUrl = url.toHttpUrlOrNull() ?: return
        val bucket = cookies[httpUrl.host].orEmpty().toMutableList()
        for (pair in header.split(';')) {
            val raw = pair.trim()
            if (!raw.contains('=')) continue
            val name = raw.substringBefore('=').trim()
            if (name.isEmpty() || name.startsWith("__Host-")) continue
            bucket.removeAll { it.startsWith("$name=") }
            bucket += raw
        }
        cookies[httpUrl.host] = bucket
        persist()
        refreshSessionFromCookies()
    }

    @Synchronized
    fun clear() {
        cookies.clear()
        persist()
        prefs.edit().remove(KEY_EMAIL).remove(KEY_NAME).apply()
        _session.value = SessionState()
    }

    fun setProfile(email: String?, name: String?) {
        prefs.edit().putString(KEY_EMAIL, email).putString(KEY_NAME, name).apply()
        _session.value = _session.value.copy(loggedIn = email != null, email = email, name = name)
    }

    private fun refreshSessionFromCookies() {
        val loggedIn = sessionCookie() != null
        val current = _session.value
        if (loggedIn != current.loggedIn) {
            _session.value = current.copy(loggedIn = loggedIn, email = prefs.getString(KEY_EMAIL, null))
        }
    }

    private fun sessionCookie(): String? = cookieFor(BuildConfig.API_BASE_URL.toHttpUrlOrNull()?.host ?: "")

    private fun readCookies(): MutableMap<String, List<String>> = runCatching {
        prefs.getString(KEY_COOKIES, null)?.let { raw ->
            Wire.json.decodeFromString(serializer, raw)
        }
    }.getOrNull()?.toMutableMap() ?: mutableMapOf()

    @Synchronized
    private fun persist() {
        prefs.edit().putString(KEY_COOKIES, Wire.json.encodeToString(serializer, cookies)).apply()
    }

    private companion object {
        const val KEY_COOKIES = "cookies_json"
        const val KEY_EMAIL = "user_email"
        const val KEY_NAME = "user_name"
    }
}
