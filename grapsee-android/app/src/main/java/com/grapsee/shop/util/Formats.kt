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
    fun price(value: Double): String {
        val whole = value.toInt()
        val hasCents = (value - whole) > 0.004
        val formatted = java.text.NumberFormat.getIntegerInstance().apply {
            maximumFractionDigits = if (hasCents) 2 else 0
            minimumFractionDigits = if (hasCents) 2 else 0
        }.format(value)
        return "$$formatted"
    }

    fun compactCount(value: Int): String = when {
        value >= 1_000_000 -> "%.1fM".format(value / 1_000_000f)
        value >= 1_000 -> "%.1fk".format(value / 1_000f)
        else -> value.toString()
    }
}
