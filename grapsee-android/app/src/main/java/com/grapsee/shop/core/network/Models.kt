package com.grapsee.shop.core.network

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonPrimitive

/**
 * Wire models for the Grapsee backend (shop-backend Next.js API).
 *
 * The backend is Prisma/NextAuth based: `id` (not `_id`), and `images`/`features`
 * arrive as JSON-encoded strings, so they are decoded lazily by helpers here.
 */
@Serializable
data class Product(
    val id: String = "",
    val name: String = "",
    val slug: String? = null,
    val description: String? = null,
    val price: Double = 0.0,
    val comparePrice: Double? = null,
    val categoryId: String? = null,
    val imageUrl: String? = null,
    val images: String? = null,
    val features: String? = null,
    val inventory: Int = 0,
    val discount: Int = 0,
    val rating: Double = 0.0,
    val reviewCount: Int = 0,
    val isFeatured: Boolean = false,
    val isNew: Boolean = false,
    val isTrending: Boolean = false,
    val isFlashDeal: Boolean = false,
    val createdAt: String? = null,
    val category: Category? = null,
    // Extra fields only present on the detail endpoint (/api/products/[id]).
    val discountPercentage: Double? = null,
    val isOnSale: Boolean? = null,
    val averageRating: Double? = null,
    val relatedProducts: List<Product> = emptyList(),
) {
    /** `images` is a JSON string like "[\"url\"]"; falls back to [imageUrl]. */
    fun imageUrls(): List<String> {
        val parsed = images?.let { raw ->
            runCatching { Json.parseToJsonElement(raw) }.getOrNull()
        }
        val list = when (parsed) {
            is JsonArray -> parsed.mapNotNull { runCatching { it.jsonPrimitive.content }.getOrNull() }
            else -> emptyList()
        }
        return (list + listOfNotNull(imageUrl)).filter { it.isNotBlank() }.distinct()
    }

    fun featureList(): List<String> {
        val parsed = features?.let { raw ->
            runCatching { Json.parseToJsonElement(raw) }.getOrNull()
        }
        return when (parsed) {
            is JsonArray -> parsed.mapNotNull { runCatching { it.jsonPrimitive.content }.getOrNull() }
            else -> emptyList()
        }
    }

    /** True when a percent discount is derivable from comparePrice. */
    fun percentOff(): Int? {
        val compare = comparePrice ?: return null
        if (compare <= price || compare <= 0.0) return null
        // Web uses Math.round (product-card.tsx), not truncation.
        return kotlin.math.round((compare - price) / compare * 100).toInt().coerceIn(0, 100).takeIf { it > 0 }
    }
}

@Serializable
data class Category(
    val id: String = "",
    val name: String = "",
    val slug: String? = null,
    val description: String? = null,
    val icon: String? = null,
    val imageUrl: String? = null,
    val bannerUrl: String? = null,
    val color: String? = null,
    val order: Int = 0,
    val isFeatured: Boolean = false,
)

@Serializable
data class ProductsEnvelope(
    val data: List<Product>? = null,
    val total: Int = 0,
    val page: Int = 1,
    val totalPages: Int = 1,
)

@Serializable
data class Inventory(
    val inventory: Int = 0,
    val isAvailable: Boolean = true,
    val isSoldOut: Boolean = false,
)

@Serializable
data class CartProduct(
    val id: String = "",
    val name: String = "",
    val price: Double = 0.0,
    val comparePrice: Double? = null,
    val imageUrl: String? = null,
    val slug: String? = null,
)

/** Server cart model (kept for future migration off the local cart). */
@Serializable
data class CartItemDto(
    val id: String = "",
    val productId: String = "",
    val quantity: Int = 1,
    val product: CartProduct? = null,
)

@Serializable
data class CartEnvelope(
    val success: Boolean? = null,
    val data: List<CartItemDto> = emptyList(),
    val total: Double = 0.0,
    val count: Int = 0,
)

@Serializable
data class OrderItemDto(
    val id: String = "",
    val productId: String? = null,
    val productName: String = "",
    val price: Double = 0.0,
    val quantity: Int = 0,
    val imageUrl: String? = null,
)

@Serializable
data class OrderDto(
    val id: String = "",
    val total: Double = 0.0,
    val discount: Double = 0.0,
    val status: String = "pending",
    val paymentMethod: String? = null,
    val customerName: String? = null,
    val createdAt: String? = null,
    val items: List<OrderItemDto> = emptyList(),
)

@Serializable
data class SessionUser(
    val id: String? = null,
    val name: String? = null,
    val email: String? = null,
    val role: String? = null,
)

@Serializable
data class SessionDto(
    val user: SessionUser? = null,
    val expires: String? = null,
) {
    val isLoggedIn: Boolean get() = user?.email != null
}

@Serializable
data class CsrfDto(val csrfToken: String = "")

/** Mirrors the web cart's zustand CartItem shape (src/lib/store.ts). */
@Serializable
data class CartLine(
    val id: String,
    val productId: String,
    val name: String,
    val price: Double,
    val quantity: Int,
    val imageUrl: String? = null,
    @SerialName("basePrice") val basePrice: Double = price,
)

@Serializable
data class DailyPickDto(
    val id: String = "",
    val productId: String? = null,
    val votes: Int = 0,
    val upvotes: Int = 0,
    val product: Product? = null,
)

@Serializable
data class ReviewDto(
    val id: String = "",
    val rating: Double = 0.0,
    val comment: String? = null,
    val text: String? = null,
    val content: String? = null,
    val userName: String? = null,
    val user: SessionUser? = null,
) {
    val body: String? get() = comment ?: text ?: content
    val author: String? get() = userName ?: user?.name ?: user?.email
}

@Serializable
data class CollectionDto(
    val id: String = "",
    val title: String = "",
    val name: String? = null,
    val description: String? = null,
    val type: String? = null,
    val productCount: Int = 0,
    val isFeatured: Boolean = false,
) {
    val displayTitle: String get() = title.ifEmpty { name.orEmpty() }
}

@Serializable
data class BlogPostDto(
    val id: String = "",
    val slug: String = "",
    val title: String = "",
    val excerpt: String? = null,
    val content: String? = null,
    val body: String? = null,
    val author: String? = null,
    val category: String? = null,
    val readTime: Int = 0,
    val likes: Int = 0,
    val createdAt: String? = null,
) {
    val fullBody: String? get() = content ?: body
}

@Serializable
data class BrandDto(
    val id: String = "",
    val name: String = "",
    val slug: String? = null,
    val logo: String? = null,
    val icon: String? = null,
    val description: String? = null,
    val category: String? = null,
    val isFeatured: Boolean = false,
) {
    val mark: String? get() = icon ?: logo
}

/** Content batch DTOs (all lenient — unknown keys ignored). */
@Serializable
data class CommunityPostDto(
    val id: String = "",
    val content: String? = null,
    val text: String? = null,
    val author: String? = null,
    val userName: String? = null,
    val likes: Int = 0,
    val likeCount: Int = 0,
    val commentCount: Int = 0,
    val createdAt: String? = null,
    val imageUrl: String? = null,
) {
    val body: String get() = content ?: text.orEmpty()
    val authorName: String get() = author ?: userName ?: "Member"
    val likeTotal: Int get() = if (likes != 0) likes else likeCount
}

@Serializable
data class ForumTopicDto(
    val id: String = "",
    val title: String = "",
    val content: String? = null,
    val body: String? = null,
    val category: String? = null,
    val replyCount: Int = 0,
    val replies: Int = 0,
    val author: String? = null,
    val createdAt: String? = null,
) {
    val text: String get() = content ?: body.orEmpty()
    val totalReplies: Int get() = if (replyCount != 0) replyCount else replies
}

@Serializable
data class ShopEventDto(
    val id: String = "",
    val title: String = "",
    val name: String? = null,
    val type: String? = null,
    val description: String? = null,
    val startTime: String? = null,
    val endTime: String? = null,
    val imageUrl: String? = null,
) {
    val displayTitle: String get() = title.ifEmpty { name.orEmpty() }
}

@Serializable
data class ProductVideoDto(
    val id: String = "",
    val title: String = "",
    val name: String? = null,
    val url: String? = null,
    val videoUrl: String? = null,
    val thumbnail: String? = null,
    val duration: Int = 0,
    val productId: String? = null,
) {
    val displayTitle: String get() = title.ifEmpty { name.orEmpty() }
    val playUrl: String? get() = videoUrl ?: url
}

@Serializable
data class QuizQuestionDto(
    val id: String = "",
    val question: String = "",
    val options: List<String> = emptyList(),
)

@Serializable
data class LiveStreamDto(
    val id: String = "",
    val title: String = "",
    val status: String? = null,
    val thumbnail: String? = null,
    val viewerCount: Int = 0,
    val streamUrl: String? = null,
    val url: String? = null,
) {
    val playUrl: String? get() = streamUrl ?: url
    val isLive: Boolean get() = status?.equals("live", ignoreCase = true) == true
}

/** Rewards batch DTOs (all lenient). */
@Serializable
data class CouponResult(
    val valid: Boolean = false,
    val code: String? = null,
    val discount: Double = 0.0,
    val discountAmount: Double = 0.0,
    val type: String? = null,
    val label: String? = null,
    val error: String? = null,
)

@Serializable
data class WalletDto(
    val balance: Double = 0.0,
    val currency: String? = null,
)

@Serializable
data class CheckinStatus(
    val checkedIn: Boolean = false,
    val streak: Int = 0,
    val streakDays: Int = 0,
    val points: Int = 0,
    val todayPoints: Int = 0,
) {
    val currentStreak: Int get() = if (streak != 0) streak else streakDays
}

@Serializable
data class MysteryStatus(
    val canClaim: Boolean = false,
    val nextClaimTime: String? = null,
    val possibleRewards: List<String> = emptyList(),
)

@Serializable
data class LoyaltyTierDto(
    val name: String = "",
    val pointsThreshold: Int = 0,
    val benefits: List<String> = emptyList(),
    val current: Boolean = false,
)

@Serializable
data class GiftCardDto(
    val id: String = "",
    val code: String = "",
    val balance: Double = 0.0,
    val amount: Double = 0.0,
    val status: String? = null,
) {
    val value: Double get() = if (balance != 0.0) balance else amount
}

@Serializable
data class RewardsSummary(
    val rewardsPoints: Int = 0,
    val points: Int = 0,
    val loyaltyTier: String? = null,
    val tier: String? = null,
    val nextTierPoints: Int = 0,
    val isGuest: Boolean = true,
) {
    val totalPoints: Int get() = if (rewardsPoints != 0) rewardsPoints else points
    val tierName: String get() = loyaltyTier ?: tier ?: "bronze"
}

object Wire {
    val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
        coerceInputValues = true
        explicitNulls = false
    }

    /** Products endpoints return either a bare array or `{ data: [...] }` — accept both. */
    fun parseProducts(body: String): List<Product> {
        val el = runCatching { json.parseToJsonElement(body) }.getOrNull() ?: return emptyList()
        return when (el) {
            is JsonArray -> json.decodeFromString(kotlinx.serialization.builtins.ListSerializer(Product.serializer()), body)
            is JsonObject -> {
                val data = el["data"]
                if (data is JsonArray) {
                    json.decodeFromString(ProductsEnvelope.serializer(), body).data.orEmpty()
                } else {
                    // Single product object (detail endpoint).
                    listOf(json.decodeFromString(Product.serializer(), body))
                }
            }
            else -> emptyList()
        }
    }

    fun parseCategories(body: String): List<Category> {
        val el = runCatching { json.parseToJsonElement(body) }.getOrNull() ?: return emptyList()
        return when (el) {
            is JsonArray -> json.decodeFromString(
                kotlinx.serialization.builtins.ListSerializer(Category.serializer()), body,
            )
            is JsonObject -> el["data"]?.let { data ->
                runCatching { json.decodeFromString(kotlinx.serialization.builtins.ListSerializer(Category.serializer()), data.toString()) }.getOrNull()
            } ?: emptyList()
            else -> emptyList()
        }
    }
}

/** Orders batch DTOs (all lenient). */
@Serializable
data class ReturnDto(
    val id: String = "",
    val orderId: String = "",
    val status: String? = null,
    val reason: String? = null,
    val createdAt: String? = null,
)

@Serializable
data class RentalDto(
    val id: String = "",
    val productId: String = "",
    val status: String? = null,
    val startDate: String? = null,
    val endDate: String? = null,
    val totalPrice: Double = 0.0,
)

@Serializable
data class DownloadDto(
    val productId: String = "",
    val productName: String? = null,
    val downloadsRemaining: Int = 0,
    val totalDownloads: Int = 0,
)

@Serializable
data class GroupBuyDto(
    val id: String = "",
    val title: String? = null,
    val name: String? = null,
    val productId: String? = null,
    val discount: Double = 0.0,
    val discountPercent: Double = 0.0,
    val joined: Boolean = false,
    val endsAt: String? = null,
    val product: Product? = null,
) {
    val displayTitle: String get() = title ?: name ?: product?.name.orEmpty()
    val deal: Double get() = if (discount != 0.0) discount else discountPercent
}

@Serializable
data class SavedOutfit(
    val id: String = "",
    val name: String = "",
    val productIds: List<String> = emptyList(),
    val productNames: List<String> = emptyList(),
)

/** Services + Account batch DTOs (all lenient). */@Serializable
data class TechResourceDto(
    val id: String = "",
    val title: String? = null,
    val name: String? = null,
    val type: String? = null,
    val category: String? = null,
    val pointsCost: Int = 0,
    val points: Int = 0,
    val description: String? = null,
) {
    val displayTitle: String get() = title ?: name.orEmpty()
    val cost: Int get() = if (pointsCost != 0) pointsCost else points
}

@Serializable
data class OpenProjectDto(
    val id: String = "",
    val name: String = "",
    val title: String? = null,
    val description: String? = null,
    val url: String? = null,
    val stars: Int = 0,
) {
    val displayTitle: String get() = title ?: name
}

@Serializable
data class DarkStoreDto(
    val isOpen: Boolean = false,
    val nextEvent: String? = null,
    val products: List<Product> = emptyList(),
)

@Serializable
data class TopReviewerDto(
    val id: String = "",
    val name: String? = null,
    val userName: String? = null,
    val reviewsCount: Int = 0,
    val reviews: Int = 0,
    val badge: String? = null,
    val badgeName: String? = null,
) {
    val displayName: String get() = name ?: userName ?: "Reviewer"
    val totalReviews: Int get() = if (reviewsCount != 0) reviewsCount else reviews
    val medal: String get() = badge ?: badgeName ?: "★"
}

@Serializable
data class NotificationDto(
    val id: String = "",
    val title: String = "",
    val message: String? = null,
    val body: String? = null,
    val isRead: Boolean = false,
    val read: Boolean = false,
    val createdAt: String? = null,
    val link: String? = null,
) {
    val text: String get() = message ?: body.orEmpty()
    val seen: Boolean get() = isRead || read
}

@Serializable
data class HelpArticleRef(
    val id: String = "",
    val slug: String? = null,
    val title: String = "",
)

@Serializable
data class HelpIndexDto(
    val categories: List<String> = emptyList(),
    val popularArticles: List<HelpArticleRef> = emptyList(),
    val total: Int = 0,
)

@Serializable
data class HelpArticleDto(
    val id: String = "",
    val slug: String? = null,
    val title: String = "",
    val content: String? = null,
    val body: String? = null,
    val category: String? = null,
) {
    val fullBody: String get() = content ?: body.orEmpty()
}

@Serializable
data class SitemapLink(
    val label: String = "",
    val title: String? = null,
    val href: String = "",
    val url: String? = null,
) {
    val text: String get() = label.ifEmpty { title.orEmpty() }
    val path: String get() = href.ifEmpty { url.orEmpty() }
}

@Serializable
data class SitemapSection(
    val title: String = "",
    val name: String? = null,
    val links: List<SitemapLink> = emptyList(),
) {
    val heading: String get() = title.ifEmpty { name.orEmpty() }
}

@Serializable
data class SitemapDto(
    val sections: List<SitemapSection> = emptyList(),
)

/** Info batch DTOs (all lenient). */
@Serializable
data class StoreDto(
    val id: String = "",
    val name: String = "",
    val city: String? = null,
    val address: String? = null,
    val phone: String? = null,
    val hours: String? = null,
    val isOpen: Boolean = false,
    val formattedDistance: String? = null,
    val distance: Double? = null,
)

@Serializable
data class PriceAlertDto(
    val id: String = "",
    val productId: String = "",
    val productName: String? = null,
    val targetPrice: Double = 0.0,
    val currentPrice: Double? = null,
    val active: Boolean = true,
    val createdAt: String? = null,
)

@Serializable
data class SubscriptionPlanDto(
    val id: String = "",
    val name: String = "",
    val description: String? = null,
    val monthlyPrice: Double = 0.0,
    val yearlyPrice: Double? = null,
    val features: List<String> = emptyList(),
    val billingPeriod: String? = null,
)

@Serializable
data class DigitalItemDto(
    val id: String = "",
    val title: String? = null,
    val name: String? = null,
    val description: String? = null,
    val price: Double = 0.0,
    val category: String? = null,
    val level: String? = null,
    val duration: String? = null,
    val language: String? = null,
    val instructor: String? = null,
    val previewUrl: String? = null,
    val downloadUrl: String? = null,
) {
    val displayTitle: String get() = title ?: name.orEmpty()
}

@Serializable
data class CertProgramDto(
    val id: String = "",
    val title: String = "",
    val description: String? = null,
)

/** Tools wave-2 DTOs (all lenient). */
@Serializable
data class DeductionDto(
    val id: String = "",
    val title: String? = null,
    val name: String? = null,
    val amount: Double = 0.0,
    val category: String? = null,
) {
    val displayTitle: String get() = title ?: name.orEmpty()
}

@Serializable
data class UnitPriceItemDto(
    val id: String = "",
    val name: String = "",
    val price: Double = 0.0,
    val quantity: Double = 0.0,
    val unit: String = "pcs",
    val unitPrice: Double = 0.0,
    val unitPriceDisplay: String? = null,
    val isBest: Boolean = false,
)

@Serializable
data class HalalResultDto(
    val status: String? = null,
    val reason: String? = null,
    val barcode: String? = null,
    val productId: String? = null,
)

/** Tools wave-3 DTOs (all lenient). */
@Serializable
data class ManagedSubscriptionDto(
    val id: String = "",
    val name: String = "",
    val amount: Double = 0.0,
    val frequency: String? = null,
    val nextBillingDate: String? = null,
)

/** Tools wave-4 DTOs (all lenient). */
@Serializable
data class TrackedDocumentDto(
    val id: String = "",
    val type: String? = null,
    val documentType: String? = null,
    val number: String? = null,
    val documentNumber: String? = null,
    val expiryDate: String? = null,
    val daysUntil: Int = 0,
) {
    val kind: String get() = type ?: documentType.orEmpty()
    val ref: String get() = number ?: documentNumber.orEmpty()
}

@Serializable
data class VehicleDto(
    val id: String = "",
    val name: String? = null,
    val vehicleName: String? = null,
    val type: String? = null,
    val vehicleType: String? = null,
    val status: String? = null,
    val dueInMonths: Double = 0.0,
) {
    val displayName: String get() = name ?: vehicleName.orEmpty()
    val kind: String get() = type ?: vehicleType.orEmpty()
}

/** Home-fidelity DTOs. */
@Serializable
data class TrendingTermDto(
    val term: String = "",
    val hitCount: Int = 0,
) {
    val countLabel: String get() = if (hitCount > 1000) "${"%.1f".format(hitCount / 1000.0)}K" else hitCount.toString()
}

@Serializable
data class PublicStatsDto(
    val products: Int = 0,
    val users: Int = 0,
    val averageRating: Double = 0.0,
    val totalReviews: Int = 0,
)

/** Testimonials (web: /api/testimonials -> {testimonials:[...]}). */
@Serializable
data class TestimonialDto(
    val id: String = "",
    val name: String = "",
    val role: String? = null,
    val company: String? = null,
    val avatar: String? = null,
    val rating: Double = 5.0,
    val text: String = "",
)
