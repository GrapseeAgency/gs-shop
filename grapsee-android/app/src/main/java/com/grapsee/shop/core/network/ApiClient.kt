package com.grapsee.shop.core.network

import com.grapsee.shop.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.builtins.ListSerializer
import okhttp3.FormBody
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException
import java.util.concurrent.TimeUnit

data class PagedProducts(
    val items: List<Product>,
    val total: Int,
    val page: Int,
    val totalPages: Int,
) {
    val hasMore: Boolean get() = page < totalPages
}

data class AuthResult(val success: Boolean, val email: String?, val name: String?, val error: String?)

/**
 * The single HTTP surface for native screens. Talks to the shop-backend Next.js
 * API directly (BuildConfig.API_BASE_URL); the session lives in [CookieStore].
 */
object ApiClient {

    val apiBase: String = BuildConfig.API_BASE_URL
    val webBase: String = BuildConfig.WEB_BASE_URL

    val cookies: CookieStore by lazy { CookieStore(AppContext.get()) }

    private val client: OkHttpClient by lazy {
        OkHttpClient.Builder()
            .cookieJar(cookies)
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(25, TimeUnit.SECONDS)
            .followRedirects(true)
            .build()
    }

    private val jsonMedia = "application/json; charset=utf-8".toMediaType()

    // ---------------------------------------------------------------- products

    suspend fun categories(): List<Category> = withContext(Dispatchers.IO) {
        Wire.parseCategories(get("/api/categories"))
    }

    suspend fun products(
        page: Int = 1,
        limit: Int = 20,
        featured: Boolean? = null,
        trending: Boolean? = null,
        new: Boolean? = null,
        deals: Boolean? = null,
        categoryId: String? = null,
        sort: String? = null,
    ): PagedProducts = withContext(Dispatchers.IO) {
        val url = "$apiBase/api/products".toHttpUrl().newBuilder().apply {
            addQueryParameter("page", page.toString())
            addQueryParameter("limit", limit.toString())
            featured?.let { addQueryParameter("featured", "true") }
            trending?.let { addQueryParameter("trending", "true") }
            new?.let { addQueryParameter("new", "true") }
            deals?.let { addQueryParameter("deals", "true") }
            categoryId?.let { addQueryParameter("category", it) } // backend expects categoryId, not slug
            sort?.let { addQueryParameter("sort", it) }
        }.build()

        val body = get(url.toString())
        val envelope = runCatching { Wire.json.decodeFromString(ProductsEnvelope.serializer(), body) }.getOrNull()
        PagedProducts(
            items = envelope?.data.orEmpty().ifEmpty { Wire.parseProducts(body) },
            total = envelope?.total ?: 0,
            page = envelope?.page ?: page,
            totalPages = envelope?.totalPages ?: 1,
        )
    }

    suspend fun search(query: String, page: Int = 1, limit: Int = 30): PagedProducts = withContext(Dispatchers.IO) {
        val url = "$apiBase/api/products/search".toHttpUrl().newBuilder()
            .addQueryParameter("q", query)
            .addQueryParameter("page", page.toString())
            .addQueryParameter("limit", limit.toString())
            .build()
        val body = get(url.toString())
        val envelope = runCatching { Wire.json.decodeFromString(ProductsEnvelope.serializer(), body) }.getOrNull()
        // Fall back to a bare array (the web handles both shapes).
        val items = envelope?.data ?: Wire.parseProducts(body)
        PagedProducts(
            items = items,
            total = envelope?.total ?: items.size,
            page = envelope?.page ?: page,
            totalPages = envelope?.totalPages ?: 1,
        )
    }

    suspend fun product(id: String): Product = withContext(Dispatchers.IO) {
        val list = Wire.parseProducts(get("/api/products/$id"))
        list.firstOrNull() ?: throw IOException("Product not found")
    }

    suspend fun inventory(productId: String): Inventory = withContext(Dispatchers.IO) {
        val body = get("/api/inventory/$productId")
        runCatching { Wire.json.decodeFromString(Inventory.serializer(), body) }.getOrElse { Inventory() }
    }

    suspend fun todaysPicks(): List<DailyPickDto> = withContext(Dispatchers.IO) {
        val body = runCatching { get("/api/todays-pick") }.getOrElse { return@withContext emptyList() }
        val el = runCatching { Wire.json.parseToJsonElement(body) }.getOrNull() ?: return@withContext emptyList()
        val arr = when (el) {
            is kotlinx.serialization.json.JsonArray -> el
            is kotlinx.serialization.json.JsonObject -> (el["picks"] ?: el["data"]) as? kotlinx.serialization.json.JsonArray
            else -> null
        } ?: return@withContext emptyList()
        runCatching {
            Wire.json.decodeFromString(
                kotlinx.serialization.builtins.ListSerializer(DailyPickDto.serializer()), arr.toString(),
            )
        }.getOrElse { emptyList() }
    }

    suspend fun reviews(limit: Int = 4): List<ReviewDto> = withContext(Dispatchers.IO) {
        val body = runCatching { get("/api/reviews?limit=$limit") }.getOrElse { return@withContext emptyList() }
        runCatching { Wire.parseProducts(body) } // ensure no crash path
        val el = runCatching { Wire.json.parseToJsonElement(body) }.getOrNull() ?: return@withContext emptyList()
        val arr = when (el) {
            is kotlinx.serialization.json.JsonArray -> el
            is kotlinx.serialization.json.JsonObject -> (el["data"] ?: el["reviews"]) as? kotlinx.serialization.json.JsonArray
            else -> null
        } ?: return@withContext emptyList()
        runCatching {
            Wire.json.decodeFromString(
                kotlinx.serialization.builtins.ListSerializer(ReviewDto.serializer()), arr.toString(),
            )
        }.getOrElse { emptyList() }
    }

    suspend fun trackView(productId: String) = withContext(Dispatchers.IO) {
        runCatching { post("/api/products/$productId/view", emptyBody()) }
        Unit
    }

    suspend fun recommended(limit: Int = 6): List<Product> = withContext(Dispatchers.IO) {
        val body = runCatching { get("/api/products/recommendations?limit=$limit") }.getOrElse { return@withContext emptyList() }
        runCatching { Wire.parseProducts(body) }.getOrElse { emptyList() }
    }

    suspend fun luxuryProducts(limit: Int = 3): List<Product> = withContext(Dispatchers.IO) {
        val body = runCatching { get("/api/luxury-zone") }.getOrElse { return@withContext emptyList() }
        val el = runCatching { Wire.json.parseToJsonElement(body) }.getOrNull() ?: return@withContext emptyList()
        val arr = when (el) {
            is kotlinx.serialization.json.JsonArray -> el
            is kotlinx.serialization.json.JsonObject ->
                (el["products"] ?: el["data"]) as? kotlinx.serialization.json.JsonArray
            else -> null
        } ?: return@withContext emptyList()
        runCatching { Wire.parseProducts(arr.toString()) }.getOrElse { emptyList() }.take(limit)
    }

    suspend fun collections(featured: Boolean = true): List<CollectionDto> = withContext(Dispatchers.IO) {
        val body = runCatching { get("/api/collections?featured=$featured") }.getOrElse { return@withContext emptyList() }
        val el = runCatching { Wire.json.parseToJsonElement(body) }.getOrNull() ?: return@withContext emptyList()
        val arr = when (el) {
            is kotlinx.serialization.json.JsonArray -> el
            is kotlinx.serialization.json.JsonObject -> (el["data"] ?: el["collections"]) as? kotlinx.serialization.json.JsonArray
            else -> null
        } ?: return@withContext emptyList()
        runCatching {
            Wire.json.decodeFromString(ListSerializer(CollectionDto.serializer()), arr.toString())
        }.getOrElse { emptyList() }
    }

    suspend fun blogPosts(limit: Int = 2): List<BlogPostDto> = withContext(Dispatchers.IO) {
        val body = runCatching { get("/api/blogs?limit=$limit") }.getOrElse { return@withContext emptyList() }
        val el = runCatching { Wire.json.parseToJsonElement(body) }.getOrNull() ?: return@withContext emptyList()
        val arr = when (el) {
            is kotlinx.serialization.json.JsonArray -> el
            is kotlinx.serialization.json.JsonObject -> (el["data"] ?: el["posts"]) as? kotlinx.serialization.json.JsonArray
            else -> null
        } ?: return@withContext emptyList()
        runCatching {
            Wire.json.decodeFromString(ListSerializer(BlogPostDto.serializer()), arr.toString())
        }.getOrElse { emptyList() }
    }

    suspend fun brands(): List<BrandDto> = withContext(Dispatchers.IO) {
        val body = runCatching { get("/api/brands") }.getOrElse { return@withContext emptyList() }
        val el = runCatching { Wire.json.parseToJsonElement(body) }.getOrNull() ?: return@withContext emptyList()
        val arr = when (el) {
            is kotlinx.serialization.json.JsonArray -> el
            is kotlinx.serialization.json.JsonObject -> (el["data"] ?: el["brands"]) as? kotlinx.serialization.json.JsonArray
            else -> null
        } ?: return@withContext emptyList()
        runCatching {
            Wire.json.decodeFromString(ListSerializer(BrandDto.serializer()), arr.toString())
        }.getOrElse { emptyList() }.filter { it.id.isNotEmpty() && it.name.isNotEmpty() }
    }

    /** Commerce batch: dedicated list endpoints (bare array or {products|data}). */
    suspend fun flashSale(): List<Product> = withContext(Dispatchers.IO) {
        productListFrom("/api/flash-sale", "products")
    }

    suspend fun auctions(): List<Product> = withContext(Dispatchers.IO) {
        productListFrom("/api/auctions", "auctions")
    }

    suspend fun preorder(): List<Product> = withContext(Dispatchers.IO) {
        productListFrom("/api/preorder", "products")
    }

    suspend fun bundles(): List<Product> = withContext(Dispatchers.IO) {
        productListFrom("/api/bundles", "products")
    }

    suspend fun collectionProducts(id: String): List<Product> = withContext(Dispatchers.IO) {
        productListFrom("/api/collections/$id", "products")
    }

    private suspend fun productListFrom(path: String, key: String): List<Product> {
        val body = runCatching { get(path) }.getOrElse { return emptyList() }
        val el = runCatching { Wire.json.parseToJsonElement(body) }.getOrNull() ?: return emptyList()
        val arr = when (el) {
            is kotlinx.serialization.json.JsonArray -> el
            is kotlinx.serialization.json.JsonObject ->
                (el[key] ?: el["data"]) as? kotlinx.serialization.json.JsonArray
            else -> null
        } ?: return emptyList()
        return runCatching { Wire.parseProducts(arr.toString()) }.getOrElse { emptyList() }
    }

    /** Content batch endpoints (all fail-soft). */
    suspend fun blogPost(slug: String): BlogPostDto? = withContext(Dispatchers.IO) {
        val body = runCatching { get("/api/blogs/$slug") }.getOrNull() ?: return@withContext null
        val el = runCatching { Wire.json.parseToJsonElement(body) }.getOrNull() ?: return@withContext null
        val obj = when (el) {
            is kotlinx.serialization.json.JsonObject ->
                (el["data"] as? kotlinx.serialization.json.JsonObject) ?: el
            else -> return@withContext null
        }
        runCatching { Wire.json.decodeFromString(BlogPostDto.serializer(), obj.toString()) }.getOrNull()
    }

    suspend fun communityPosts(): List<CommunityPostDto> = withContext(Dispatchers.IO) {
        dtoListFrom("/api/community/posts", "posts", CommunityPostDto.serializer())
    }

    suspend fun forumTopics(): List<ForumTopicDto> = withContext(Dispatchers.IO) {
        dtoListFrom("/api/forum", "topics", ForumTopicDto.serializer())
    }

    suspend fun forumTopic(id: String): ForumTopicDto? = withContext(Dispatchers.IO) {
        val body = runCatching { get("/api/forum/$id") }.getOrNull() ?: return@withContext null
        val el = runCatching { Wire.json.parseToJsonElement(body) }.getOrNull() ?: return@withContext null
        val obj = when (el) {
            is kotlinx.serialization.json.JsonObject ->
                ((el["topic"] ?: el["data"]) as? kotlinx.serialization.json.JsonObject) ?: el
            else -> return@withContext null
        }
        runCatching { Wire.json.decodeFromString(ForumTopicDto.serializer(), obj.toString()) }.getOrNull()
    }

    suspend fun events(): List<ShopEventDto> = withContext(Dispatchers.IO) {
        dtoListFrom("/api/events", "events", ShopEventDto.serializer())
    }

    suspend fun productVideos(): List<ProductVideoDto> = withContext(Dispatchers.IO) {
        dtoListFrom("/api/product-videos", "videos", ProductVideoDto.serializer())
    }

    suspend fun quizQuestions(): List<QuizQuestionDto> = withContext(Dispatchers.IO) {
        dtoListFrom("/api/product-quiz", "questions", QuizQuestionDto.serializer())
    }

    suspend fun quizSubmit(answers: Map<String, String>): List<Product> = withContext(Dispatchers.IO) {
        val payload = buildString {
            append("{\"answers\":{")
            append(answers.entries.joinToString(",") { (k, v) -> "\"$k\":\"$v\"" })
            append("}}")
        }
        val body = runCatching { post("/api/product-quiz", payload.toRequestBody(jsonMedia)) }.getOrNull()
            ?: return@withContext emptyList()
        val el = runCatching { Wire.json.parseToJsonElement(body) }.getOrNull() ?: return@withContext emptyList()
        val arr = when (el) {
            is kotlinx.serialization.json.JsonArray -> el
            is kotlinx.serialization.json.JsonObject ->
                (el["recommendations"] ?: el["products"] ?: el["data"]) as? kotlinx.serialization.json.JsonArray
            else -> null
        } ?: return@withContext emptyList()
        runCatching { Wire.parseProducts(arr.toString()) }.getOrElse { emptyList() }
    }

    suspend fun liveStreams(): List<LiveStreamDto> = withContext(Dispatchers.IO) {
        dtoListFrom("/api/live-shopping/streams", "streams", LiveStreamDto.serializer())
    }

    /** Rewards batch (auth-gated actions return null for guests). */
    suspend fun validateCoupon(code: String): CouponResult? = withContext(Dispatchers.IO) {
        val body = runCatching {
            post("/api/coupons/validate", "{\"code\":\"$code\"}".toRequestBody(jsonMedia))
        }.getOrNull() ?: return@withContext null
        runCatching { Wire.json.decodeFromString(CouponResult.serializer(), body) }.getOrNull()
    }

    suspend fun wallet(): WalletDto? = withContext(Dispatchers.IO) {
        val body = runCatching { get("/api/wallet") }.getOrNull() ?: return@withContext null
        val el = runCatching { Wire.json.parseToJsonElement(body) }.getOrNull() ?: return@withContext null
        val obj = when (el) {
            is kotlinx.serialization.json.JsonObject ->
                ((el["data"] ?: el["wallet"]) as? kotlinx.serialization.json.JsonObject) ?: el
            else -> return@withContext null
        }
        runCatching { Wire.json.decodeFromString(WalletDto.serializer(), obj.toString()) }.getOrNull()
    }

    suspend fun checkinStatus(): CheckinStatus? = withContext(Dispatchers.IO) {
        val body = runCatching { get("/api/daily-checkin") }.getOrNull() ?: return@withContext null
        runCatching { Wire.json.decodeFromString(CheckinStatus.serializer(), body) }.getOrNull()
    }

    suspend fun checkin(): CheckinStatus? = withContext(Dispatchers.IO) {
        val body = runCatching { post("/api/daily-checkin", emptyBody()) }.getOrNull() ?: return@withContext null
        runCatching { Wire.json.decodeFromString(CheckinStatus.serializer(), body) }.getOrNull()
    }

    suspend fun mysteryStatus(): MysteryStatus? = withContext(Dispatchers.IO) {
        val body = runCatching { get("/api/mystery-reward") }.getOrNull() ?: return@withContext null
        runCatching { Wire.json.decodeFromString(MysteryStatus.serializer(), body) }.getOrNull()
    }

    suspend fun mysteryClaim(): Boolean = withContext(Dispatchers.IO) {
        runCatching { post("/api/mystery-reward", emptyBody()) }.isSuccess
    }

    suspend fun loyaltyTiers(): List<LoyaltyTierDto> = withContext(Dispatchers.IO) {
        dtoListFrom("/api/loyalty-tiers", "tiers", LoyaltyTierDto.serializer())
    }

    suspend fun giftCards(): List<GiftCardDto> = withContext(Dispatchers.IO) {
        dtoListFrom("/api/gift-cards", "giftCards", GiftCardDto.serializer())
    }

    suspend fun giftCardRedeem(code: String): Boolean = withContext(Dispatchers.IO) {
        runCatching {
            val res = post("/api/gift-cards/redeem", "{\"code\":\"$code\"}".toRequestBody(jsonMedia))
            !res.contains("\"error\"")
        }.getOrElse { false }
    }

    suspend fun rewardsSummary(): RewardsSummary? = withContext(Dispatchers.IO) {
        val body = runCatching { get("/api/rewards") }.getOrNull() ?: return@withContext null
        runCatching { Wire.json.decodeFromString(RewardsSummary.serializer(), body) }.getOrNull()
    }

    suspend fun rewardsDailyClaim(): Boolean = withContext(Dispatchers.IO) {
        runCatching { post("/api/rewards/daily", emptyBody()) }.isSuccess
    }

    suspend fun spinPrizes(): List<String> = withContext(Dispatchers.IO) {
        val body = runCatching { get("/api/spin-prizes") }.getOrNull() ?: return@withContext emptyList()
        val el = runCatching { Wire.json.parseToJsonElement(body) }.getOrNull() ?: return@withContext emptyList()
        val arr = when (el) {
            is kotlinx.serialization.json.JsonArray -> el
            is kotlinx.serialization.json.JsonObject ->
                (el["prizes"] ?: el["data"]) as? kotlinx.serialization.json.JsonArray
            else -> null
        } ?: return@withContext emptyList()
        arr.mapNotNull { (it as? kotlinx.serialization.json.JsonPrimitive)?.content }
    }

    /** Orders batch (fail-soft; auth-gated actions return null/false for guests). */
    suspend fun returns(): List<ReturnDto> = withContext(Dispatchers.IO) {
        dtoListFrom("/api/returns", "returns", ReturnDto.serializer())
    }

    suspend fun requestReturn(orderId: String, reason: String): Boolean = withContext(Dispatchers.IO) {
        runCatching {
            val res = post("/api/returns", "{\"orderId\":\"$orderId\",\"reason\":\"$reason\"}".toRequestBody(jsonMedia))
            !res.contains("\"error\"")
        }.getOrElse { false }
    }

    /** Generic primitive-map call for calculator/quote endpoints with varying shapes. */
    suspend fun rawMap(path: String, payload: String? = null): Map<String, String> = withContext(Dispatchers.IO) {
        val body = runCatching {
            if (payload == null) get(path) else post(path, payload.toRequestBody(jsonMedia))
        }.getOrNull() ?: return@withContext emptyMap()
        val el = runCatching { Wire.json.parseToJsonElement(body) }.getOrNull() ?: return@withContext emptyMap()
        flatten(el)
    }

    private fun flatten(el: kotlinx.serialization.json.JsonElement, prefix: String = ""): Map<String, String> {
        val out = mutableMapOf<String, String>()
        when (el) {
            is kotlinx.serialization.json.JsonObject -> {
                val obj = if (prefix.isEmpty() && el.containsKey("data") && el["data"] is kotlinx.serialization.json.JsonObject) {
                    el["data"] as kotlinx.serialization.json.JsonObject
                } else el
                obj.entries.forEach { (k, v) ->
                    val label = if (prefix.isEmpty()) k else "$prefix $k"
                    when (v) {
                        is kotlinx.serialization.json.JsonPrimitive -> if (!v.isString || v.content.isNotBlank()) {
                            out[label] = v.content
                        }
                        is kotlinx.serialization.json.JsonObject -> out.putAll(flatten(v, label))
                        else -> Unit
                    }
                }
            }
            else -> Unit
        }
        return out.filterKeys { !it.equals("success", ignoreCase = true) }
    }

    suspend fun tradeInProducts(): List<Product> = withContext(Dispatchers.IO) {
        productListFrom("/api/trade-in", "tradeInProducts")
    }

    suspend fun requestTrial(productId: String): Boolean = withContext(Dispatchers.IO) {
        runCatching {
            val res = post("/api/try-before-buy/trial", "{\"productId\":\"$productId\"}".toRequestBody(jsonMedia))
            !res.contains("\"error\"")
        }.getOrElse { false }
    }

    suspend fun rentalProducts(): List<Product> = withContext(Dispatchers.IO) {
        productListFrom("/api/rental", "products")
    }

    suspend fun myRentals(): List<RentalDto> = withContext(Dispatchers.IO) {
        val body = runCatching { get("/api/rental") }.getOrNull() ?: return@withContext emptyList()
        val el = runCatching { Wire.json.parseToJsonElement(body) }.getOrNull() ?: return@withContext emptyList()
        val arr = ((el as? kotlinx.serialization.json.JsonObject)?.get("userRentals")
            ?: (el as? kotlinx.serialization.json.JsonObject)?.get("rentals")) as? kotlinx.serialization.json.JsonArray
            ?: return@withContext emptyList()
        runCatching { Wire.json.decodeFromString(ListSerializer(RentalDto.serializer()), arr.toString()) }.getOrElse { emptyList() }
    }

    suspend fun requestRental(productId: String): Boolean = withContext(Dispatchers.IO) {
        runCatching {
            val res = post("/api/rental", "{\"productId\":\"$productId\"}".toRequestBody(jsonMedia))
            !res.contains("\"error\"")
        }.getOrElse { false }
    }

    suspend fun downloadProducts(): List<Product> = withContext(Dispatchers.IO) {
        productListFrom("/api/digital-downloads", "products")
    }

    suspend fun myDownloads(): List<DownloadDto> = withContext(Dispatchers.IO) {
        val body = runCatching { get("/api/digital-downloads") }.getOrNull() ?: return@withContext emptyList()
        val el = runCatching { Wire.json.parseToJsonElement(body) }.getOrNull() ?: return@withContext emptyList()
        val arr = (el as? kotlinx.serialization.json.JsonObject)?.get("myDownloads") as? kotlinx.serialization.json.JsonArray
            ?: return@withContext emptyList()
        runCatching { Wire.json.decodeFromString(ListSerializer(DownloadDto.serializer()), arr.toString()) }.getOrElse { emptyList() }
    }

    suspend fun groupBuys(): List<GroupBuyDto> = withContext(Dispatchers.IO) {
        dtoListFrom("/api/group-buy", "groupBuys", GroupBuyDto.serializer())
    }

    suspend fun joinGroupBuy(id: String): Boolean = withContext(Dispatchers.IO) {
        runCatching {
            val res = post("/api/group-buy", "{\"id\":\"$id\"}".toRequestBody(jsonMedia))
            !res.contains("\"error\"")
        }.getOrElse { false }
    }

    suspend fun priceDrops(): List<Product> = withContext(Dispatchers.IO) {
        val body = runCatching { get("/api/price-drop") }.getOrNull() ?: return@withContext emptyList()
        val el = runCatching { Wire.json.parseToJsonElement(body) }.getOrNull() ?: return@withContext emptyList()
        val data = (el as? kotlinx.serialization.json.JsonObject)?.get("data") as? kotlinx.serialization.json.JsonObject
        val arr = data?.get("products") as? kotlinx.serialization.json.JsonArray
            ?: (el as? kotlinx.serialization.json.JsonObject)?.get("products") as? kotlinx.serialization.json.JsonArray
            ?: return@withContext emptyList()
        runCatching { Wire.parseProducts(arr.toString()) }.getOrElse { emptyList() }
    }

    suspend fun trackPriceAlert(productId: String): Boolean = withContext(Dispatchers.IO) {
        runCatching {
            val res = post("/api/price-drop", "{\"productId\":\"$productId\"}".toRequestBody(jsonMedia))
            !res.contains("\"error\"")
        }.getOrElse { false }
    }

    /** Services + Account batch (fail-soft). */
    suspend fun giftOptions(): Map<String, List<String>> = withContext(Dispatchers.IO) {
        val map = rawMapGet("/api/gift-wrapping")
        // designs/ribbons arrive as JSON arrays — handled by giftOptionsRaw below.
        mapOf("info" to map.values.toList())
    }

    suspend fun giftOptionsRaw(): Pair<List<String>, List<String>> = withContext(Dispatchers.IO) {
        val body = runCatching { get("/api/gift-wrapping") }.getOrNull() ?: return@withContext Pair(emptyList(), emptyList())
        val el = runCatching { Wire.json.parseToJsonElement(body) }.getOrNull() as? kotlinx.serialization.json.JsonObject
            ?: return@withContext Pair(emptyList(), emptyList())
        fun strings(key: String): List<String> {
            val arr = el[key] as? kotlinx.serialization.json.JsonArray ?: return emptyList()
            return arr.mapNotNull {
                when (it) {
                    is kotlinx.serialization.json.JsonPrimitive -> it.content
                    is kotlinx.serialization.json.JsonObject ->
                        (it["name"] ?: it["label"] ?: it["title"])?.let { p -> (p as? kotlinx.serialization.json.JsonPrimitive)?.content }
                    else -> null
                }
            }
        }
        Pair(strings("designs"), strings("ribbonColors"))
    }

    suspend fun codeQualitySubscribe(planId: String): Boolean = withContext(Dispatchers.IO) {
        simplePost("/api/code-quality/subscribe", "{\"planId\":\"$planId\"}")
    }

    suspend fun studentStatus(): Map<String, String> = withContext(Dispatchers.IO) {
        rawMap("/api/student-discount/check")
    }

    suspend fun studentRequest(data: Map<String, String>): Boolean = withContext(Dispatchers.IO) {
        val payload = "{" + data.entries.joinToString(",") { (k, v) -> "\"$k\":\"$v\"" } + "}"
        simplePost("/api/student-discount/request", payload)
    }

    suspend fun techResources(): List<TechResourceDto> = withContext(Dispatchers.IO) {
        dtoListFrom("/api/tech-library", "resources", TechResourceDto.serializer())
    }

    suspend fun techUnlock(resourceId: String, pointsCost: Int): Boolean = withContext(Dispatchers.IO) {
        simplePost("/api/tech-library/download", "{\"resourceId\":\"$resourceId\",\"pointsCost\":$pointsCost}")
    }

    suspend fun sellerStatus(): Map<String, String> = withContext(Dispatchers.IO) {
        rawMap("/api/seller-center")
    }

    suspend fun sellerApply(data: Map<String, String>): Boolean = withContext(Dispatchers.IO) {
        val payload = "{" + data.entries.joinToString(",") { (k, v) -> "\"$k\":\"$v\"" } + "}"
        simplePost("/api/seller-onboarding", payload)
    }

    suspend fun openProjects(): List<OpenProjectDto> = withContext(Dispatchers.IO) {
        dtoListFrom("/api/open-source/projects", "projects", OpenProjectDto.serializer())
    }

    suspend fun protectionSubscribe(planId: String): Boolean = withContext(Dispatchers.IO) {
        simplePost("/api/delivery-protection/subscribe", "{\"planId\":\"$planId\"}")
    }

    suspend fun darkStore(): DarkStoreDto? = withContext(Dispatchers.IO) {
        val body = runCatching { get("/api/dark-store") }.getOrNull() ?: return@withContext null
        val el = runCatching { Wire.json.parseToJsonElement(body) }.getOrNull() as? kotlinx.serialization.json.JsonObject
            ?: return@withContext null
        val data = (el["data"] as? kotlinx.serialization.json.JsonObject) ?: el
        val products = ((data["products"] as? kotlinx.serialization.json.JsonArray)?.toString())?.let {
            runCatching { Wire.parseProducts(it) }.getOrElse { emptyList() }
        }.orEmpty()
        DarkStoreDto(
            isOpen = (data["isOpen"] as? kotlinx.serialization.json.JsonPrimitive)?.content == "true",
            nextEvent = (data["nextEvent"] as? kotlinx.serialization.json.JsonPrimitive)?.content,
            products = products,
        )
    }

    suspend fun loyaltyCalc(amount: Double): Map<String, String> = withContext(Dispatchers.IO) {
        rawMap("/api/loyalty-calculator", "{\"purchaseAmount\":$amount}")
    }

    suspend fun miniQuiz(): List<QuizQuestionDto> = withContext(Dispatchers.IO) {
        val body = runCatching { post("/api/mini-games", "{\"gameType\":\"quiz\"}".toRequestBody(jsonMedia)) }.getOrNull()
            ?: return@withContext emptyList()
        val el = runCatching { Wire.json.parseToJsonElement(body) }.getOrNull() as? kotlinx.serialization.json.JsonObject
            ?: return@withContext emptyList()
        val game = el["game"] as? kotlinx.serialization.json.JsonObject
        val arr = (game?.get("questions") ?: el["questions"]) as? kotlinx.serialization.json.JsonArray
            ?: return@withContext emptyList()
        runCatching { Wire.json.decodeFromString(ListSerializer(QuizQuestionDto.serializer()), arr.toString()) }.getOrElse { emptyList() }
    }

    suspend fun topReviewers(): List<TopReviewerDto> = withContext(Dispatchers.IO) {
        val body = runCatching { get("/api/review-megaphone") }.getOrNull() ?: return@withContext emptyList()
        val el = runCatching { Wire.json.parseToJsonElement(body) }.getOrNull() as? kotlinx.serialization.json.JsonObject
            ?: return@withContext emptyList()
        val data = (el["data"] as? kotlinx.serialization.json.JsonObject) ?: el
        val arr = (data["reviewers"] as? kotlinx.serialization.json.JsonArray) ?: return@withContext emptyList()
        runCatching { Wire.json.decodeFromString(ListSerializer(TopReviewerDto.serializer()), arr.toString()) }.getOrElse { emptyList() }
    }

    suspend fun notifications(): List<NotificationDto> = withContext(Dispatchers.IO) {
        dtoListFrom("/api/notifications", "notifications", NotificationDto.serializer())
    }

    suspend fun notificationsMarkAllRead(): Boolean = withContext(Dispatchers.IO) {
        runCatching {
            val res = put("/api/notifications", "{\"markAll\":true}".toRequestBody(jsonMedia))
            !res.contains("\"error\"")
        }.getOrElse { false }
    }

    suspend fun notificationPrefs(): Map<String, String> = withContext(Dispatchers.IO) {
        rawMap("/api/notifications/preferences")
    }

    suspend fun notificationPrefsSet(enabled: Boolean): Boolean = withContext(Dispatchers.IO) {
        runCatching {
            val res = put("/api/notifications/preferences", "{\"push\":$enabled}".toRequestBody(jsonMedia))
            !res.contains("\"error\"")
        }.getOrElse { false }
    }

    suspend fun helpIndex(): HelpIndexDto? = withContext(Dispatchers.IO) {
        val body = runCatching { get("/api/help") }.getOrNull() ?: return@withContext null
        runCatching { Wire.json.decodeFromString(HelpIndexDto.serializer(), body) }.getOrNull()
    }

    suspend fun helpArticle(slug: String): HelpArticleDto? = withContext(Dispatchers.IO) {
        val body = runCatching { get("/api/help/$slug") }.getOrNull() ?: return@withContext null
        val el = runCatching { Wire.json.parseToJsonElement(body) }.getOrNull() as? kotlinx.serialization.json.JsonObject
            ?: return@withContext null
        val obj = ((el["article"] ?: el["data"]) as? kotlinx.serialization.json.JsonObject) ?: el
        runCatching { Wire.json.decodeFromString(HelpArticleDto.serializer(), obj.toString()) }.getOrNull()
    }

    suspend fun contactInfo(): Map<String, String> = withContext(Dispatchers.IO) {
        val body = runCatching { get("/api/contact") }.getOrNull() ?: return@withContext emptyMap()
        val el = runCatching { Wire.json.parseToJsonElement(body) }.getOrNull() as? kotlinx.serialization.json.JsonObject
            ?: return@withContext emptyMap()
        val info = (el["contact"] as? kotlinx.serialization.json.JsonObject) ?: el
        flatten(info)
    }

    suspend fun contactSend(name: String, email: String, message: String): Boolean = withContext(Dispatchers.IO) {
        simplePost("/api/contact", "{\"name\":\"$name\",\"email\":\"$email\",\"message\":\"$message\"}")
    }

    suspend fun sitemap(): SitemapDto? = withContext(Dispatchers.IO) {
        val body = runCatching { get("/api/sitemap-data") }.getOrNull() ?: return@withContext null
        runCatching { Wire.json.decodeFromString(SitemapDto.serializer(), body) }.getOrNull()
    }

    suspend fun affiliateInfo(): Map<String, String> = withContext(Dispatchers.IO) {
        val body = runCatching { get("/api/affiliate") }.getOrNull() ?: return@withContext emptyMap()
        val el = runCatching { Wire.json.parseToJsonElement(body) }.getOrNull() as? kotlinx.serialization.json.JsonObject
            ?: return@withContext emptyMap()
        val info = ((el["programInfo"] ?: el["data"]) as? kotlinx.serialization.json.JsonObject) ?: el
        flatten(info)
    }

    suspend fun affiliateJoin(): Boolean = withContext(Dispatchers.IO) {
        simplePost("/api/affiliate", "{}")
    }

    suspend fun subscribeEmail(email: String): Boolean = withContext(Dispatchers.IO) {
        if (simplePost("/api/email-subscribe", "{\"email\":\"$email\"}")) return@withContext true
        simplePost("/api/newsletter", "{\"email\":\"$email\"}")
    }

    /** Info batch (fail-soft). */
    suspend fun stores(city: String = ""): List<StoreDto> = withContext(Dispatchers.IO) {
        val path = if (city.isBlank()) "/api/stores" else "/api/stores?city=${java.net.URLEncoder.encode(city, "UTF-8")}"
        dtoListFrom(path, "stores", StoreDto.serializer())
    }

    suspend fun priceAlerts(): List<PriceAlertDto> = withContext(Dispatchers.IO) {
        dtoListFrom("/api/price-alerts", "priceAlerts", PriceAlertDto.serializer())
    }

    suspend fun priceAlertCreate(productId: String, productName: String, targetPrice: Double): Boolean = withContext(Dispatchers.IO) {
        simplePost(
            "/api/price-alerts",
            "{\"productId\":\"$productId\",\"productName\":\"${productName.replace("\"", "")}\",\"targetPrice\":$targetPrice}",
        )
    }

    suspend fun priceAlertDelete(id: String): Boolean = withContext(Dispatchers.IO) {
        runCatching {
            val res = deleteWithBody("/api/price-alerts", "{\"id\":\"$id\"}".toRequestBody(jsonMedia))
            !res.contains("\"error\"")
        }.getOrElse { false }
    }

    suspend fun subscriptionPlans(): List<SubscriptionPlanDto> = withContext(Dispatchers.IO) {
        val body = runCatching { get("/api/subscriptions/plans") }.getOrNull() ?: return@withContext emptyList()
        val el = runCatching { Wire.json.parseToJsonElement(body) }.getOrNull() ?: return@withContext emptyList()
        val arr = when (el) {
            is kotlinx.serialization.json.JsonArray -> el
            is kotlinx.serialization.json.JsonObject ->
                (el["plans"] ?: el["data"]) as? kotlinx.serialization.json.JsonArray
            else -> null
        } ?: return@withContext emptyList()
        runCatching { Wire.json.decodeFromString(ListSerializer(SubscriptionPlanDto.serializer()), arr.toString()) }.getOrElse { emptyList() }
    }

    suspend fun digitalItems(kind: String): List<DigitalItemDto> = withContext(Dispatchers.IO) {
        val body = runCatching { get("/api/digital/$kind") }.getOrNull() ?: return@withContext emptyList()
        val el = runCatching { Wire.json.parseToJsonElement(body) }.getOrNull() ?: return@withContext emptyList()
        val arr = when (el) {
            is kotlinx.serialization.json.JsonArray -> el
            is kotlinx.serialization.json.JsonObject ->
                (el["data"] ?: el[kind]) as? kotlinx.serialization.json.JsonArray
            else -> null
        } ?: return@withContext emptyList()
        runCatching { Wire.json.decodeFromString(ListSerializer(DigitalItemDto.serializer()), arr.toString()) }.getOrElse { emptyList() }
    }

    /** Tools wave-2 (fail-soft). */
    suspend fun taxDeductions(): List<DeductionDto> = withContext(Dispatchers.IO) {
        dtoListFrom("/api/money-savers/tax-refund", "deductions", DeductionDto.serializer())
    }

    suspend fun priceLock(productId: String, deposit: Double = 100.0, days: Int = 30): Boolean = withContext(Dispatchers.IO) {
        simplePost("/api/money-savers/price-lock", "{\"productId\":\"$productId\",\"depositAmount\":$deposit,\"lockDays\":$days}")
    }

    suspend fun unitPriceCompare(items: List<Map<String, Any>>): List<UnitPriceItemDto> = withContext(Dispatchers.IO) {
        val payload = "{\"products\":[" + items.joinToString(",") { m ->
            "{" + m.entries.joinToString(",") { (k, v) -> "\"$k\":" + (if (v is Number) v.toString() else "\"$v\"") } + "}"
        } + "]}"
        val body = runCatching { post("/api/utilities/unit-price-calculator", payload.toRequestBody(jsonMedia)) }.getOrNull()
            ?: return@withContext emptyList()
        val el = runCatching { Wire.json.parseToJsonElement(body) }.getOrNull() as? kotlinx.serialization.json.JsonObject
            ?: return@withContext emptyList()
        val arr = (el["products"] as? kotlinx.serialization.json.JsonArray) ?: return@withContext emptyList()
        runCatching { Wire.json.decodeFromString(ListSerializer(UnitPriceItemDto.serializer()), arr.toString()) }.getOrElse { emptyList() }
    }

    suspend fun smartReorder(modification: String = ""): Boolean = withContext(Dispatchers.IO) {
        simplePost("/api/time-savers/smart-reorder", "{\"modification\":\"$modification\"}")
    }

    /** Tools wave-3 (fail-soft). */
    suspend fun testimonials(): List<TestimonialDto> = withContext(Dispatchers.IO) {
        val body = runCatching { get("/api/testimonials") }.getOrNull() ?: return@withContext emptyList()
        val el = runCatching { Wire.json.parseToJsonElement(body) }.getOrNull() as? kotlinx.serialization.json.JsonObject
            ?: return@withContext emptyList()
        val arr = (el["testimonials"] as? kotlinx.serialization.json.JsonArray) ?: return@withContext emptyList()
        runCatching { Wire.json.decodeFromString(ListSerializer(TestimonialDto.serializer()), arr.toString()) }.getOrElse { emptyList() }
    }

    /** Home-fidelity endpoints (fail-soft). */
    suspend fun trendingSearches(): List<TrendingTermDto> = withContext(Dispatchers.IO) {
        val body = runCatching { get("/api/trending-searches") }.getOrNull() ?: return@withContext emptyList()
        val el = runCatching { Wire.json.parseToJsonElement(body) }.getOrNull() as? kotlinx.serialization.json.JsonObject
            ?: return@withContext emptyList()
        if ((el["success"] as? kotlinx.serialization.json.JsonPrimitive)?.content != "true") return@withContext emptyList()
        val arr = (el["searches"] as? kotlinx.serialization.json.JsonArray) ?: return@withContext emptyList()
        runCatching { Wire.json.decodeFromString(ListSerializer(TrendingTermDto.serializer()), arr.toString()) }
            .getOrElse { emptyList() }
            .filter { it.term.isNotBlank() }
            .take(10)
    }

    suspend fun publicStats(): PublicStatsDto? = withContext(Dispatchers.IO) {
        val body = runCatching { get("/api/public-stats") }.getOrNull() ?: return@withContext null
        runCatching { Wire.json.decodeFromString(PublicStatsDto.serializer(), body) }.getOrNull()
    }

    /** Tools wave-4 (fail-soft). */
    suspend fun smsOrder(phone: String, message: String): String? = withContext(Dispatchers.IO) {
        val body = runCatching {
            post("/api/time-savers/sms-order", "{\"phoneNumber\":\"$phone\",\"message\":\"$message\"}".toRequestBody(jsonMedia))
        }.getOrNull() ?: return@withContext null
        val el = runCatching { Wire.json.parseToJsonElement(body) }.getOrNull() as? kotlinx.serialization.json.JsonObject
        (el?.get("reply") as? kotlinx.serialization.json.JsonPrimitive)?.content
            ?: (el?.get("message") as? kotlinx.serialization.json.JsonPrimitive)?.content
    }

    suspend fun shopAutocomplete(query: String): List<String> = withContext(Dispatchers.IO) {
        val body = runCatching { get("/api/time-savers/shopping-list-autocomplete?q=" + java.net.URLEncoder.encode(query, "UTF-8")) }.getOrNull()
            ?: return@withContext emptyList()
        val el = runCatching { Wire.json.parseToJsonElement(body) }.getOrNull() as? kotlinx.serialization.json.JsonObject
            ?: return@withContext emptyList()
        ((el["suggestions"] as? kotlinx.serialization.json.JsonArray)
            ?: (el["data"] as? kotlinx.serialization.json.JsonArray))?.mapNotNull {
            (it as? kotlinx.serialization.json.JsonPrimitive)?.content
                ?: ((it as? kotlinx.serialization.json.JsonObject)?.get("name") as? kotlinx.serialization.json.JsonPrimitive)?.content
        }.orEmpty()
    }

    suspend fun trackedDocuments(): List<TrackedDocumentDto> = withContext(Dispatchers.IO) {
        dtoListFrom("/api/reminders/document-expiry", "documents", TrackedDocumentDto.serializer())
    }

    suspend fun trackDocument(type: String, number: String, expiry: String): Boolean = withContext(Dispatchers.IO) {
        simplePost("/api/reminders/document-expiry", "{\"documentType\":\"$type\",\"documentNumber\":\"$number\",\"expiryDate\":\"$expiry\"}")
    }

    suspend fun vehicles(): List<VehicleDto> = withContext(Dispatchers.IO) {
        dtoListFrom("/api/reminders/vehicle-service", "vehicles", VehicleDto.serializer())
    }

    suspend fun addVehicle(name: String, type: String, lastService: String, odometer: String): Map<String, String> = withContext(Dispatchers.IO) {
        val body = runCatching {
            post(
                "/api/reminders/vehicle-service",
                "{\"vehicleName\":\"$name\",\"vehicleType\":\"$type\",\"lastServiceDate\":\"$lastService\",\"odometer\":\"${odometer.toDoubleOrNull() ?: 0}\"}".toRequestBody(jsonMedia),
            )
        }.getOrNull() ?: return@withContext emptyMap()
        val el = runCatching { Wire.json.parseToJsonElement(body) }.getOrNull() as? kotlinx.serialization.json.JsonObject
            ?: return@withContext emptyMap()
        val vehicle = (el["vehicle"] as? kotlinx.serialization.json.JsonObject)
        val out = mutableMapOf<String, String>()
        (el["status"] as? kotlinx.serialization.json.JsonPrimitive)?.let { out["status"] = it.content }
        (el["message"] as? kotlinx.serialization.json.JsonPrimitive)?.let { out["message"] = it.content }
        vehicle?.forEach { (k, v) -> if (v is kotlinx.serialization.json.JsonPrimitive) out[k] = v.content }
        out
    }

    suspend fun legalGenerate(type: String, jurisdiction: String, parties: String, terms: String): Map<String, String> = withContext(Dispatchers.IO) {
        rawMap("/api/legal/generate", "{\"documentType\":\"$type\",\"jurisdiction\":\"$jurisdiction\",\"parties\":\"$parties\",\"terms\":\"$terms\"}")
    }

    suspend fun formCreate(title: String, fields: List<String>): Map<String, String> = withContext(Dispatchers.IO) {
        val fieldsJson = fields.joinToString(",") { "\"$it\"" }
        rawMap("/api/forms/create", "{\"title\":\"$title\",\"fields\":[$fieldsJson]}")
    }

    suspend fun resumeGenerate(template: String, name: String, summary: String): Map<String, String> = withContext(Dispatchers.IO) {
        rawMap("/api/resume/generate", "{\"template\":\"$template\",\"data\":{\"name\":\"$name\",\"summary\":\"$summary\"}}")
    }

    suspend fun insuranceClaim(productId: String, issue: String, damageType: String): Map<String, String> = withContext(Dispatchers.IO) {
        val body = runCatching {
            post("/api/money-savers/insurance-claim", "{\"productId\":\"$productId\",\"issue\":\"$issue\",\"damageType\":\"$damageType\"}".toRequestBody(jsonMedia))
        }.getOrNull() ?: return@withContext emptyMap()
        val el = runCatching { Wire.json.parseToJsonElement(body) }.getOrNull() as? kotlinx.serialization.json.JsonObject
            ?: return@withContext emptyMap()
        val out = mutableMapOf<String, String>()
        (el["message"] as? kotlinx.serialization.json.JsonPrimitive)?.let { out["message"] = it.content }
        ((el["claim"] as? kotlinx.serialization.json.JsonObject))?.forEach { (k, v) ->
            if (v is kotlinx.serialization.json.JsonPrimitive) out["claim $k"] = v.content
        }
        out
    }

    suspend fun managedSubscriptions(): List<ManagedSubscriptionDto> = withContext(Dispatchers.IO) {
        dtoListFrom("/api/lifestyle/subscription-manager", "subscriptions", ManagedSubscriptionDto.serializer())
    }

    suspend fun managedSubscriptionAdd(name: String, amount: Double, frequency: String): Boolean = withContext(Dispatchers.IO) {
        simplePost(
            "/api/lifestyle/subscription-manager",
            "{\"action\":\"add\",\"subscription\":{\"name\":\"$name\",\"amount\":$amount,\"frequency\":\"$frequency\"}}",
        )
    }

    suspend fun managedSubscriptionCancel(id: String): Boolean = withContext(Dispatchers.IO) {
        simplePost("/api/lifestyle/subscription-manager", "{\"action\":\"cancel\",\"subscriptionId\":\"$id\"}")
    }

    suspend fun halalCheck(barcode: String): HalalResultDto? = withContext(Dispatchers.IO) {
        val body = runCatching {
            post("/api/lifestyle/halal-checker", "{\"barcode\":\"$barcode\"}".toRequestBody(jsonMedia))
        }.getOrNull() ?: return@withContext null
        runCatching { Wire.json.decodeFromString(HalalResultDto.serializer(), body) }.getOrNull()
    }

    suspend fun certPrograms(): List<CertProgramDto> = withContext(Dispatchers.IO) {        val body = runCatching { get("/api/certifications/programs") }.getOrNull() ?: return@withContext emptyList()
        val el = runCatching { Wire.json.parseToJsonElement(body) }.getOrNull() ?: return@withContext emptyList()
        val arr = when (el) {
            is kotlinx.serialization.json.JsonArray -> el
            is kotlinx.serialization.json.JsonObject ->
                (el["programs"] ?: el["data"]) as? kotlinx.serialization.json.JsonArray
            else -> null
        } ?: return@withContext emptyList()
        runCatching { Wire.json.decodeFromString(ListSerializer(CertProgramDto.serializer()), arr.toString()) }.getOrElse { emptyList() }
    }

    private suspend fun simplePost(path: String, payload: String): Boolean {
        return runCatching {
            val res = post(path, payload.toRequestBody(jsonMedia))
            !res.contains("\"error\"")
        }.getOrElse { false }
    }

    private suspend fun rawMapGet(path: String): Map<String, String> {
        return rawMap(path)
    }

    private suspend fun <T> dtoListFrom(
        path: String,
        key: String,
        serializer: kotlinx.serialization.KSerializer<T>,
    ): List<T> {
        val body = runCatching { get(path) }.getOrElse { return emptyList() }
        val el = runCatching { Wire.json.parseToJsonElement(body) }.getOrNull() ?: return emptyList()
        val arr = when (el) {
            is kotlinx.serialization.json.JsonArray -> el
            is kotlinx.serialization.json.JsonObject ->
                (el[key] ?: el["data"]) as? kotlinx.serialization.json.JsonArray
            else -> null
        } ?: return emptyList()
        return runCatching {
            Wire.json.decodeFromString(ListSerializer(serializer), arr.toString())
        }.getOrElse { emptyList() }
    }

    // ------------------------------------------------------------------ orders

    suspend fun orders(email: String): List<OrderDto> = withContext(Dispatchers.IO) {
        val url = "$apiBase/api/orders".toHttpUrl().newBuilder()
            .addQueryParameter("email", email)
            .build()
        val body = get(url.toString())
        parseOrderList(body)
    }

    suspend fun order(orderId: String): OrderDto = withContext(Dispatchers.IO) {
        val body = get("/api/orders/$orderId")
        parseOrder(body)
    }

    /** Tolerates bare arrays, {data:[]}, and {orders:[]} envelopes like the web. */
    private fun parseOrderList(body: String): List<OrderDto> {
        val el = runCatching { Wire.json.parseToJsonElement(body) }.getOrNull()
        val arr = when (el) {
            is kotlinx.serialization.json.JsonArray -> el
            is kotlinx.serialization.json.JsonObject ->
                (el["data"] ?: el["orders"]) as? kotlinx.serialization.json.JsonArray
            else -> null
        } ?: return runCatching {
            Wire.json.decodeFromString(ListSerializer(OrderDto.serializer()), body)
        }.getOrElse { emptyList() }
        return runCatching {
            Wire.json.decodeFromString(ListSerializer(OrderDto.serializer()), arr.toString())
        }.getOrElse { emptyList() }
    }

    /** Tolerates bare objects and {data:{}} / {order:{}} wrappers. */
    private fun parseOrder(body: String): OrderDto {
        val el = runCatching { Wire.json.parseToJsonElement(body) }.getOrNull()
        val obj = when (el) {
            is kotlinx.serialization.json.JsonObject ->
                ((el["data"] ?: el["order"]) as? kotlinx.serialization.json.JsonObject) ?: el
            else -> null
        } ?: return Wire.json.decodeFromString(OrderDto.serializer(), body)
        return runCatching { Wire.json.decodeFromString(OrderDto.serializer(), obj.toString()) }
            .getOrElse { Wire.json.decodeFromString(OrderDto.serializer(), body) }
    }

    // -------------------------------------------------------------------- auth

    /**
     * NextAuth v4 credentials flow: fetch a CSRF token, post the credentials
     * callback (which sets the httpOnly session cookie into our jar), then read
     * the session back to confirm.
     */
    suspend fun login(email: String, password: String): AuthResult = withContext(Dispatchers.IO) {
        runCatching {
            val csrf = Wire.json.decodeFromString(
                CsrfDto.serializer(),
                get("/api/auth/csrf"),
            ).csrfToken

            val form = FormBody.Builder()
                .add("csrfToken", csrf)
                .add("email", email)
                .add("password", password)
                .add("callbackUrl", apiBase)
                .add("json", "true")
                .build()
            client.newCall(Request.Builder().url("$apiBase/api/auth/callback/credentials").post(form).build())
                .execute().use { it.body?.string() }

            val sessionBody = get("/api/auth/session")
            val session = Wire.json.decodeFromString(SessionDto.serializer(), sessionBody)
            if (session.isLoggedIn) {
                cookies.setProfile(session.user?.email, session.user?.name)
                AuthResult(true, session.user?.email, session.user?.name, null)
            } else {
                AuthResult(false, null, null, "Invalid email or password")
            }
        }.getOrElse { AuthResult(false, null, null, it.message ?: "Login failed") }
    }

    suspend fun logout() = withContext(Dispatchers.IO) {
        runCatching {
            val csrf = Wire.json.decodeFromString(CsrfDto.serializer(), get("/api/auth/csrf")).csrfToken
            val form = FormBody.Builder()
                .add("csrfToken", csrf)
                .add("callbackUrl", apiBase)
                .add("json", "true")
                .build()
            client.newCall(Request.Builder().url("$apiBase/api/auth/signout").post(form).build())
                .execute().use { it.body?.string() }
        }
        cookies.clear()
    }

    suspend fun refreshSession() = withContext(Dispatchers.IO) {
        val session = runCatching {
            Wire.json.decodeFromString(SessionDto.serializer(), get("/api/auth/session"))
        }.getOrNull()
        if (session?.isLoggedIn == true) {
            cookies.setProfile(session.user?.email, session.user?.name)
        } else if (!cookies.session.value.loggedIn) {
            // No cookie and no session: stay logged out.
            cookies.setProfile(null, null)
        }
    }

    // ------------------------------------------------------------------ plumbing

    private fun resolve(pathOrUrl: String): String =
        if (pathOrUrl.startsWith("http")) pathOrUrl else apiBase.trimEnd('/') + pathOrUrl

    private fun emptyBody(): okhttp3.RequestBody = "{}".toRequestBody(jsonMedia)

    private fun get(url: String): String =
        client.newCall(Request.Builder().url(resolve(url)).get().build()).execute().use { resp ->
            val body = resp.body?.string().orEmpty()
            if (!resp.isSuccessful) throw IOException("HTTP ${resp.code}: ${url.takeLast(48)}")
            body
        }

    private fun post(url: String, body: okhttp3.RequestBody): String =
        client.newCall(Request.Builder().url(resolve(url)).post(body).build()).execute().use { resp ->
            val text = resp.body?.string().orEmpty()
            if (!resp.isSuccessful) throw IOException("HTTP ${resp.code}: ${url.takeLast(48)}")
            text
        }

    private fun put(url: String, body: okhttp3.RequestBody): String =
        client.newCall(Request.Builder().url(resolve(url)).put(body).build()).execute().use { resp ->
            val text = resp.body?.string().orEmpty()
            if (!resp.isSuccessful) throw IOException("HTTP ${resp.code}: ${url.takeLast(48)}")
            text
        }

    private fun delete(url: String): String =
        client.newCall(Request.Builder().url(resolve(url)).delete().build()).execute().use { resp ->
            val text = resp.body?.string().orEmpty()
            if (!resp.isSuccessful) throw IOException("HTTP ${resp.code}: ${url.takeLast(48)}")
            text
        }

    private fun deleteWithBody(url: String, body: okhttp3.RequestBody): String =
        client.newCall(Request.Builder().url(resolve(url)).delete(body).build()).execute().use { resp ->
            val text = resp.body?.string().orEmpty()
            if (!resp.isSuccessful) throw IOException("HTTP ${resp.code}: ${url.takeLast(48)}")
            text
        }
}
