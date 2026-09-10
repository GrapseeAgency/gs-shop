package com.grapsee.shop.core.web

import android.app.DownloadManager
import android.content.ActivityNotFoundException
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.os.VibrationEffect
import android.os.Vibrator
import android.webkit.CookieManager
import android.webkit.JavascriptInterface
import android.webkit.URLUtil
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import com.grapsee.shop.BuildConfig
import com.grapsee.shop.core.network.ApiClient
import com.grapsee.shop.core.push.PushManager

/**
 * The Kotlin <-> JavaScript bridge. Registered as `window.GrapseeNative` inside
 * every WebView page. The web app can detect native mode via
 * `window.GrapseeNative.isNativeApp()` or the `GrapseeAndroid/x.y` UA suffix.
 */
class NativeBridge(private val activity: AppCompatActivity) {

    @JavascriptInterface
    fun isNativeApp(): Boolean = true

    @JavascriptInterface
    fun platform(): String = "android"

    @JavascriptInterface
    fun appVersion(): String = BuildConfig.VERSION_NAME

    @JavascriptInterface
    fun share(title: String, url: String) {
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_SUBJECT, title)
            putExtra(Intent.EXTRA_TEXT, listOf(title, url).filter { it.isNotBlank() }.joinToString("\n"))
        }
        activity.startActivity(Intent.createChooser(intent, "Share via"))
    }

    @JavascriptInterface
    fun toast(message: String) {
        activity.runOnUiThread { Toast.makeText(activity, message, Toast.LENGTH_SHORT).show() }
    }

    @JavascriptInterface
    fun haptic() {
        val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val manager = activity.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? android.os.VibratorManager
            manager?.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            activity.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        } ?: return
        vibrator.vibrate(VibrationEffect.createOneShot(12, VibrationEffect.DEFAULT_AMPLITUDE))
    }

    @JavascriptInterface
    fun copyToClipboard(text: String) {
        val cm = activity.getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager ?: return
        cm.setPrimaryClip(ClipData.newPlainText("Grapsee", text))
        toast("Copied")
    }

    @JavascriptInterface
    fun openInBrowser(url: String) {
        runCatching {
            activity.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
        }
    }

    @JavascriptInterface
    fun pushToken(): String = runCatching { PushManager.tokenBlocking() }.getOrDefault("")

    /**
     * Biometric prompt. The web side registers a listener before calling:
     * `window.addEventListener('grapsee-biometric', e => e.detail = {id, success})`.
     */
    @JavascriptInterface
    fun authenticateBiometric(reason: String, callbackId: String) {
        activity.runOnUiThread {
            val fragmentActivity = activity as? FragmentActivity
            if (fragmentActivity == null ||
                BiometricManager.from(activity).canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_WEAK) !=
                BiometricManager.BIOMETRIC_SUCCESS
            ) {
                emitBiometric(callbackId, false)
                return@runOnUiThread
            }
            val prompt = BiometricPrompt(
                fragmentActivity,
                ContextCompat.getMainExecutor(activity),
                object : BiometricPrompt.AuthenticationCallback() {
                    override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) =
                        emitBiometric(callbackId, true)

                    override fun onAuthenticationError(errorCode: Int, errString: CharSequence) =
                        emitBiometric(callbackId, false)
                },
            )
            prompt.authenticate(
                BiometricPrompt.PromptInfo.Builder()
                    .setTitle("Confirm it's you")
                    .setSubtitle(reason)
                    .setAllowedAuthenticators(BiometricManager.Authenticators.BIOMETRIC_WEAK or BiometricManager.Authenticators.DEVICE_CREDENTIAL)
                    .build(),
            )
        }
    }

    private fun emitBiometric(callbackId: String, success: Boolean) {
        val js = "window.dispatchEvent(new CustomEvent('grapsee-biometric',{detail:{id:'$callbackId',success:$success}}));"
        WebHolder.current?.evaluateJavascript(js, null)
    }
}

/** Access to the active WebView for async bridge callbacks. */
object WebHolder {
    var current: android.webkit.WebView? = null
}

/**
 * Shared cookie plumbing: pushes the native session cookie into the WebView
 * (so web pages see the logged-in user) and captures cookies set by web pages
 * back into the native jar (so SSO flows on the web side stick).
 */
object WebCookieSync {

    fun pushToWebView() {
        val manager = CookieManager.getInstance()
        manager.setAcceptCookie(true)

        val sessionToken = ApiClient.cookies.cookieFor(Uri.parse(ApiClient.apiBase).host ?: "")
        if (sessionToken != null) {
            for (origin in listOf(ApiClient.webBase, ApiClient.apiBase)) {
                manager.setCookie(origin, "next-auth.session-token=$sessionToken; Path=/")
            }
        }
        manager.flush()
    }

    fun captureFromWebView(url: String) {
        val header = CookieManager.getInstance().getCookie(url) ?: return
        ApiClient.cookies.importFromWebView(url, header)
    }
}

/** Handles non-web links and file downloads coming out of WebView pages. */
object WebExternals {

    /** Returns true when [url] should stay inside the in-app WebView. */
    fun isInternal(url: Uri): Boolean {
        if (url.scheme !in listOf("http", "https")) return false
        val webHost = Uri.parse(ApiClient.webBase).host ?: return false
        val apiHost = Uri.parse(ApiClient.apiBase).host
        val host = url.host ?: return false
        return host == webHost || host == apiHost || host.endsWith(".$webHost")
    }

    fun openExternally(context: Context, url: Uri): Boolean {
        val parsed = if (url.scheme == "intent") {
            runCatching { Intent.parseUri(url.toString(), Intent.URI_INTENT_SCHEME) }.getOrNull() ?: return false
        } else {
            Intent(Intent.ACTION_VIEW, url)
        }
        parsed.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        return try {
            context.startActivity(parsed)
            true
        } catch (_: ActivityNotFoundException) {
            // intent:// fallback URL
            val fallback = parsed.getStringExtra("browser_fallback_url")
            if (fallback != null) {
                runCatching { context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(fallback))) }
                true
            } else false
        }
    }

    fun download(context: Context, url: String, contentDisposition: String?, mimeType: String?) {
        val manager = context.getSystemService(Context.DOWNLOAD_SERVICE) as? DownloadManager ?: return
        val request = DownloadManager.Request(Uri.parse(url)).apply {
            val name = URLUtil.guessFileName(url, contentDisposition, mimeType)
            setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, name)
            setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
            mimeType?.let { setMimeType(it) }
        }
        runCatching { manager.enqueue(request) }
    }
}
