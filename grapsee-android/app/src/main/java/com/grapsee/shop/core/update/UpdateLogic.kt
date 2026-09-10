package com.grapsee.shop.core.update

/**
 * Pure, Android-free update logic — every branch is unit-tested
 * ([UpdateCheckTest]). [AppUpdater] is only the I/O shell around it.
 */
internal object UpdateLogic {

    /** Split "v1.2.3", "1.2", "release-4" into numeric segments. */
    fun segments(version: String): List<Int> {
        val stripped = version.trim().trimStart('v', 'V')
        if (stripped.isEmpty()) return emptyList()
        return stripped.split(".", "-", "_", "+")
            .mapNotNull { token ->
                // Accept leading-numeric tokens like "3beta" -> 3? No:
                // strict — a tag made only of junk has NO segments (unknown).
                token.toIntOrNull()
            }
    }

    /**
     * True when [latest] is strictly newer than [current].
     * Unknown/blank latest is NEVER newer (fail closed, no phantom prompts).
     */
    fun isNewer(latest: String, current: String): Boolean {
        val a = segments(latest)
        if (a.isEmpty()) return false
        val b = segments(current)
        for (i in 0 until maxOf(a.size, b.size)) {
            val x = a.getOrElse(i) { 0 }
            val y = b.getOrElse(i) { 0 }
            if (x != y) return x > y
        }
        return false
    }

    data class Asset(val name: String, val url: String, val size: Long)

    /**
     * Pick the APK to install: exact release asset first
     * (`GrapseeShop-*.apk`), then the largest remaining `.apk`
     * (abi-split/debug leftovers lose). Null when nothing qualifies.
     */
    fun pickApk(assets: List<Asset>): Asset? {
        val apks = assets.filter { it.name.endsWith(".apk", ignoreCase = true) && it.url.isNotBlank() }
        if (apks.isEmpty()) return null
        return apks.firstOrNull { it.name.startsWith("GrapseeShop-", ignoreCase = true) }
            ?: apks.maxByOrNull { it.size }
    }

    /** Tags become filenames — strip anything the filesystem would hate. */
    fun safeFileName(version: String, fallback: String = "update"): String {
        val clean = version.trim().trimStart('v', 'V')
            .replace(Regex("[^A-Za-z0-9._-]+"), "_")
            .trim('_', '.', '-')
            .take(32)
        return (if (clean.isEmpty()) fallback else clean) + ".apk"
    }

    /** Human message for GitHub API failures (rate limits say so explicitly). */
    fun githubError(code: Int, apiMessage: String?): String {
        val detail = apiMessage?.take(140)?.trim().orEmpty()
        return when (code) {
            404 -> "No releases published yet" + (if (detail.isNotEmpty()) ": $detail" else "")
            403, 429 -> "GitHub rate limit hit — try again in a minute" +
                (if (detail.isNotEmpty()) " ($detail)" else "")
            else -> "GitHub HTTP $code" + (if (detail.isNotEmpty()) ": $detail" else "")
        }
    }

    /** Pull "message" out of a GitHub error JSON body, if present. */
    fun apiMessage(body: String): String? {
        val match = Regex("\"message\"\\s*:\\s*\"((?:[^\"\\\\]|\\\\.)*)\"").find(body)
        return match?.groupValues?.getOrNull(1)
            ?.replace("\\\"", "\"")
            ?.replace("\\\\", "\\")
            ?.take(140)
    }
}
