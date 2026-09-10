package com.grapsee.shop.core.update

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/** Update-logic contract: every parsing decision the updater makes. */
class UpdateCheckTest {

    // ---- version comparison ----

    @Test fun newerPatch() = assertTrue(UpdateLogic.isNewer("v1.0.1", "1.0.0"))

    @Test fun newerMinor() = assertTrue(UpdateLogic.isNewer("1.1.0", "1.0.9"))

    @Test fun newerMajor() = assertTrue(UpdateLogic.isNewer("2.0.0", "1.9.9"))

    @Test fun sameIsNotNewer() = assertFalse(UpdateLogic.isNewer("v1.0.0", "1.0.0"))

    @Test fun olderIsNotNewer() = assertFalse(UpdateLogic.isNewer("1.0.0", "1.0.1"))

    @Test fun blankLatestNeverNewer() = assertFalse(UpdateLogic.isNewer("", "1.0.0"))

    @Test fun junkLatestNeverNewer() {
        assertFalse(UpdateLogic.isNewer("nightly", "1.0.0"))
        assertFalse(UpdateLogic.isNewer("latest", "0.0.1"))
        assertFalse(UpdateLogic.isNewer("???", "0.0.0"))
    }

    @Test fun missingSegmentsTreatedAsZero() {
        assertFalse(UpdateLogic.isNewer("1.0", "1.0.0"))
        assertTrue(UpdateLogic.isNewer("1.0.1", "1.0"))
    }

    @Test fun preReleaseSuffixIgnoredNumerically() {
        // releases/latest never serves prereleases; numeric core still decides.
        assertTrue(UpdateLogic.isNewer("v1.2.0-beta", "1.1.9"))
        assertFalse(UpdateLogic.isNewer("v1.1.0-beta", "1.1.0"))
    }

    @Test fun whitespaceTolerated() = assertTrue(UpdateLogic.isNewer("  v1.0.1\n", "1.0.0"))

    // ---- asset picking ----

    private fun asset(name: String, size: Long = 10L) =
        UpdateLogic.Asset(name, "https://example.com/$name", size)

    @Test fun noApkGivesNull() {
        assertNull(UpdateLogic.pickApk(listOf(asset("notes.txt"), asset("app.zip"))))
    }

    @Test fun emptyListGivesNull() {
        assertNull(UpdateLogic.pickApk(emptyList()))
    }

    @Test fun exactReleaseAssetWinsOverBiggerAbiSplit() {
        val picked = UpdateLogic.pickApk(
            listOf(
                asset("app-arm64.apk", size = 99L),
                asset("GrapseeShop-v1.1.0.apk", size = 10L),
            ),
        )
        assertEquals("GrapseeShop-v1.1.0.apk", picked?.name)
    }

    @Test fun largestApkWinsWithoutExactMatch() {
        val picked = UpdateLogic.pickApk(
            listOf(asset("a.apk", size = 5L), asset("b.apk", size = 50L)),
        )
        assertEquals("b.apk", picked?.name)
    }

    @Test fun blankUrlsDisqualified() {
        val picked = UpdateLogic.pickApk(
            listOf(UpdateLogic.Asset("GrapseeShop-v9.apk", "", 99L), asset("app.apk", size = 5L)),
        )
        assertEquals("app.apk", picked?.name)
    }

    @Test fun apkMatchIsCaseInsensitive() {
        val picked = UpdateLogic.pickApk(listOf(asset("APP.APK", size = 5L)))
        assertEquals("APP.APK", picked?.name)
    }

    // ---- filename safety ----

    @Test fun tagBecomesSafeFile() {
        assertEquals("1.1.0.apk", UpdateLogic.safeFileName("v1.1.0"))
        assertEquals("1.1.0.apk", UpdateLogic.safeFileName("1.1.0"))
    }

    @Test fun hostileTagSanitized() {
        val name = UpdateLogic.safeFileName("../../etc/passwd")
        assertFalse(name.contains("/"))
        assertTrue(name.endsWith(".apk"))
    }

    @Test fun blankTagFallsBack() {
        assertEquals("update.apk", UpdateLogic.safeFileName(""))
        assertEquals("update.apk", UpdateLogic.safeFileName("///"))
    }

    // ---- error messages ----

    @Test fun rateLimitExplained() {
        val msg = UpdateLogic.githubError(403, "API rate limit exceeded for 1.2.3.4.")
        assertTrue(msg.contains("rate limit", ignoreCase = true))
    }

    @Test fun missingReleaseExplained() {
        assertTrue(UpdateLogic.githubError(404, null).contains("No releases"))
    }

    @Test fun serverErrorKeepsCode() {
        assertTrue(UpdateLogic.githubError(500, null).contains("500"))
    }

    @Test fun apiMessageExtracted() {
        assertEquals(
            "Not Found",
            UpdateLogic.apiMessage("""{"message":"Not Found","documentation_url":"x"}"""),
        )
    }

    @Test fun apiMessageAbsentGivesNull() {
        assertNull(UpdateLogic.apiMessage("""{"tag_name":"v1"}"""))
        assertNull(UpdateLogic.apiMessage("not json at all"))
        assertNull(UpdateLogic.apiMessage(""))
    }
}
