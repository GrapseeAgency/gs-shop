package com.grapsee.shop.core.web

import android.graphics.Bitmap
import android.view.ViewGroup
import android.webkit.CookieManager
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.compose.BackHandler
import androidx.appcompat.app.AppCompatActivity
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import com.grapsee.shop.BuildConfig
import com.grapsee.shop.core.cart.CartStore
import com.grapsee.shop.core.network.ApiClient
import org.json.JSONObject

/**
 * The permanent home of every route that hasn't (or needn't) been converted to
 * Compose. Loads the existing Next.js page inside a hardened WebView with the
 * native session synced in, a progress bar, a native offline/error state, and
 * the [NativeBridge] exposed to page scripts as `window.GrapseeNative`.
 *
 * [cartHandoff]: before loading [url], seed the web origin's
 * `grapsee-shop-cart` localStorage with the native cart so the web checkout
 * sees exactly the items the user built natively.
 */
@Composable
fun WebViewScreen(
    url: String,
    modifier: Modifier = Modifier,
    cartHandoff: Boolean = false,
    onPageVisited: ((String) -> Unit)? = null,
) {
    val context = LocalContext.current
    val activity = context as? AppCompatActivity

    var progress by remember(url) { mutableIntStateOf(0) }
    var errorMessage by remember(url) { mutableStateOf<String?>(null) }

    val webView = remember(url) {
        WebView(context).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT,
            )
            WebHolder.current = this
            configureHardened()
            if (activity != null) {
                addJavascriptInterface(NativeBridge(activity), "GrapseeNative")
            }
            webChromeClient = object : WebChromeClient() {
                override fun onProgressChanged(view: WebView?, newProgress: Int) {
                    progress = newProgress
                }
            }
            setDownloadListener { link, _, contentDisposition, mimeType, _ ->
                WebExternals.download(context, link, contentDisposition, mimeType)
            }
            CookieManager.getInstance().setAcceptThirdPartyCookies(this, true)
        }
    }

    DisposableEffect(webView) {
        onDispose {
            if (WebHolder.current === webView) WebHolder.current = null
            webView.stopLoading()
            webView.destroy()
        }
    }

    fun newClient(): WebViewClient = object : WebViewClient() {
        override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
            val link = request.url
            if (WebExternals.isInternal(link)) return false
            return WebExternals.openExternally(view.context, link)
        }

        override fun onPageStarted(view: WebView, pageUrl: String?, favicon: Bitmap?) {
            WebCookieSync.pushToWebView()
        }

        override fun onPageFinished(view: WebView, pageUrl: String?) {
            progress = 100
            pageUrl?.let {
                WebCookieSync.captureFromWebView(it)
                onPageVisited?.invoke(it)
            }
            view.evaluateJavascript(nativeMarkerJs(), null)
        }

        override fun doUpdateVisitedHistory(view: WebView, pageUrl: String?, isReload: Boolean) {
            pageUrl?.let {
                WebCookieSync.captureFromWebView(it)
                onPageVisited?.invoke(it)
            }
        }

        override fun onReceivedError(view: WebView, request: WebResourceRequest, error: WebResourceError) {
            if (!request.isForMainFrame) return
            errorMessage = error.description?.toString().orEmpty().ifBlank { "Check your connection and try again." }
        }

        override fun onReceivedHttpError(view: WebView, request: WebResourceRequest, errorResponse: android.webkit.WebResourceResponse) {
            if (!request.isForMainFrame) return
            errorMessage = "The server returned an error (HTTP ${errorResponse.statusCode})."
        }
    }

    fun load(target: String) {
        errorMessage = null
        progress = 5
        WebCookieSync.pushToWebView()
        if (cartHandoff) {
            // Two-phase load: commit any page on the target origin first (a 404
            // is fine), seed the web cart's localStorage, then load for real.
            val preload = ApiClient.webBase.trimEnd('/') + "/grapsee-native-preload"
            webView.webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: WebView, pageUrl: String?) {
                    val payload = JSONObject.quote(CartStore.zustandPayload(CartStore.lines.value))
                    view.evaluateJavascript(
                        "try{localStorage.setItem('grapsee-shop-cart',$payload);}catch(e){}",
                        null,
                    )
                    view.webViewClient = newClient()
                    view.loadUrl(target)
                }
            }
            webView.loadUrl(preload)
        } else {
            webView.webViewClient = newClient()
            webView.loadUrl(target)
        }
    }

    LaunchedEffect(url, cartHandoff) {
        load(url)
    }

    BackHandler(enabled = webView.canGoBack()) {
        webView.goBack()
    }

    Column(modifier.fillMaxSize()) {
        if (progress in 1..99) {
            LinearProgressIndicator(
                progress = { progress / 100f },
                modifier = Modifier.fillMaxWidth(),
                color = MaterialTheme.colorScheme.primary,
                trackColor = MaterialTheme.colorScheme.surfaceVariant,
            )
        }

        if (errorMessage != null) {
            ErrorRetry(
                message = errorMessage.orEmpty(),
                onRetry = { load(url) },
                modifier = Modifier.weight(1f),
            )
        } else {
            AndroidView(
                factory = { webView },
                modifier = Modifier.weight(1f),
            )
        }
    }
}

private fun WebView.configureHardened() {
    with(settings) {
        javaScriptEnabled = true
        domStorageEnabled = true
        databaseEnabled = false
        allowFileAccess = false
        allowContentAccess = false
        loadsImagesAutomatically = true
        mediaPlaybackRequiresUserGesture = true
        javaScriptCanOpenWindowsAutomatically = false
        setGeolocationEnabled(false)
        setSupportZoom(false)
        builtInZoomControls = false
        displayZoomControls = false
        useWideViewPort = true
        loadWithOverviewMode = true
        cacheMode = WebSettings.LOAD_DEFAULT
        if (BuildConfig.DEBUG) safeBrowsingEnabled = true
        mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
        userAgentString = "$userAgentString GrapseeAndroid/${BuildConfig.VERSION_NAME}"
    }
    isFocusableInTouchMode = true
}

/** `window.GrapseeNative` exposes the bridge; this marker helps CSS/JS adapt. */
private fun nativeMarkerJs(): String =
    "window.GrapseeNativeInfo={platform:'android',version:'${BuildConfig.VERSION_NAME}',native:true};" +
        "if(document.documentElement)document.documentElement.classList.add('grapsee-native');"

@Composable
private fun ErrorRetry(message: String, onRetry: () -> Unit, modifier: Modifier = Modifier) {
    Box(modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text("Couldn't load this page", style = MaterialTheme.typography.titleMedium)
            Text(
                message.take(140),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Button(onClick = onRetry) { Text("Retry") }
        }
    }
}
