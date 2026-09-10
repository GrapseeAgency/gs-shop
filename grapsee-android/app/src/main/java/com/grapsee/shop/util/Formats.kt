package com.grapsee.shop.util

import com.grapsee.shop.BuildConfig

object Media {
    /**
     * The backend stores some media as absolute URLs and some as
     * root-relative paths; root-relative paths are served by the web app.
     */
    fun resolve(url: String?): String? {
        if (url.isNullOrBlank()) return null
        if (url.startsWith("http://") || url.startsWith("https://")) return url
        val base = BuildConfig.WEB_BASE_URL.trimEnd('/')
        return if (url.startsWith("/")) base + url else "$base/$url"
    }
}

object Format {
    /** Web parity: Intl.NumberFormat('en-US', USD) — always 2 decimals. */
    fun price(value: Double): String {
        return "$" + java.text.NumberFormat.getNumberInstance(java.util.Locale.US).apply {
            maximumFractionDigits = 2
            minimumFractionDigits = 2
        }.format(value)
    }

    fun compactCount(value: Int): String = when {
        value >= 1_000_000 -> "%.1fM".format(value / 1_000_000f)
        value >= 1_000 -> "%.1fk".format(value / 1_000f)
        else -> value.toString()
    }
}
