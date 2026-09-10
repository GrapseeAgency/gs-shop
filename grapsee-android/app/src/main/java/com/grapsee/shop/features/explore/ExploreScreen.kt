package com.grapsee.shop.features.explore

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.grapsee.shop.ui.theme.Bottle
import com.grapsee.shop.ui.theme.Jade

/**
 * The Explore tab — the web app's quick menu: mall floors, service categories
 * and every feature destination, mirroring the homepage tile grid and footer.
 */
data class Link(val label: String, val emoji: String, val tint: Color, val route: String)

private val categories = listOf(
    Link("Websites", "🌐", Color(0xFF06B6D4), "/category"),
    Link("eCommerce", "🛒", Color(0xFF10B981), "/category"),
    Link("Digital Marketing", "📈", Color(0xFFF97316), "/category"),
    Link("Mobile Apps", "📱", Color(0xFF3B82F6), "/category"),
    Link("Design", "🎨", Color(0xFFEC4899), "/category"),
    Link("AI & ML", "🤖", Color(0xFFA855F7), "/category"),
    Link("DevOps", "⚙️", Color(0xFF64748B), "/category"),
    Link("APIs", "🔌", Color(0xFF6366F1), "/category"),
)

private val shopping = listOf(
    Link("All Products", "📦", Color(0xFF10B981), "/category"),
    Link("Flash Sale", "⚡", Color(0xFFEF4444), "/flash-sale"),
    Link("Deals", "🏷", Color(0xFFF97316), "/deals"),
    Link("Collections", "🗂", Color(0xFF3B82F6), "/collections"),
    Link("Bundles", "🎁", Color(0xFF8B5CF6), "/bundles"),
    Link("Luxury Zone", "👑", Color(0xFFEAB308), "/luxury"),
    Link("Auctions", "🔨", Color(0xFFEF4444), "/auctions"),
    Link("Pre-order", "📅", Color(0xFF3B82F6), "/preorder"),
    Link("All Features", "🧩", Color(0xFF6366F1), "/features"),
)

private val features = listOf(
    Link("Group Buy", "🤝", Color(0xFF22C55E), "/group-buy"),
    Link("Price Drop Alerts", "📉", Color(0xFFEF4444), "/price-drop"),
    Link("Installments", "💳", Color(0xFF3B82F6), "/installment"),
    Link("Trade-In", "📱", Color(0xFF06B6D4), "/trade-in"),
    Link("Try Before Buy", "🏡", Color(0xFF8B5CF6), "/try-before-buy"),
    Link("Mystery Reward", "🎁", Color(0xFFF59E0B), "/mystery-reward"),
    Link("Digital Downloads", "💾", Color(0xFF6366F1), "/digital-downloads"),
    Link("Outfit Maker", "👕", Color(0xFFEC4899), "/outfit-maker"),
    Link("Rent Products", "🎬", Color(0xFF14B8A6), "/rental"),
    Link("Spin & Win", "🎡", Color(0xFFF59E0B), "/spin-win"),
    Link("Daily Check-in", "🗓", Color(0xFF10B981), "/daily-checkin"),
    Link("Mini Games", "🎮", Color(0xFFA855F7), "/mini-games"),
)

private val community = listOf(
    Link("Community", "👥", Color(0xFF3B82F6), "/community"),
    Link("Live Shopping", "🔴", Color(0xFFEF4444), "/live"),
    Link("Blog", "📰", Color(0xFF64748B), "/blog"),
    Link("Reviews", "⭐", Color(0xFFEAB308), "/reviews"),
    Link("Referrals", "🧑‍🤝‍🧑", Color(0xFF10B981), "/referrals"),
    Link("Affiliate", "💲", Color(0xFF22C55E), "/affiliate"),
    Link("Events", "🎪", Color(0xFFF97316), "/events"),
    Link("Forum", "💬", Color(0xFF3B82F6), "/forum"),
)

private val services = listOf(
    Link("Gift Wrap", "🎁", Color(0xFFEC4899), "/gift-wrapping"),
    Link("Code Quality", "🛡", Color(0xFF3B82F6), "/code-quality"),
    Link("Open Source", "💚", Color(0xFF22C55E), "/open-source"),
    Link("Student", "🎓", Color(0xFFF97316), "/student-discount"),
    Link("Protected", "✅", Color(0xFF22C55E), "/delivery-protection"),
    Link("Resources", "🏆", Color(0xFFEAB308), "/tech-library"),
    Link("Warranty", "📜", Color(0xFF64748B), "/warranty-center"),
    Link("Returns", "↩️", Color(0xFFEF4444), "/returns"),
    Link("Track Order", "🚚", Color(0xFF3B82F6), "/track"),
    Link("Support", "🎧", Color(0xFF10B981), "/help"),
)

private val account = listOf(
    Link("Rewards", "🏅", Color(0xFF10B981), "/rewards"),
    Link("Voucher Center", "🏷", Color(0xFFF97316), "/voucher"),
    Link("VIP Club", "👑", Color(0xFFEAB308), "/vip"),
    Link("Wallet", "👛", Color(0xFF3B82F6), "/wallet"),
    Link("Wishlist", "❤️", Color(0xFFEF4444), "/wishlist"),
    Link("Notifications", "🔔", Color(0xFF64748B), "/notifications"),
    Link("Seller Center", "🏪", Color(0xFFF59E0B), "/seller-center"),
    Link("Settings", "⚙️", Color(0xFF64748B), "/settings"),
)

@Composable
fun ExploreScreen(
    onCategory: (String, String) -> Unit,
    onWeb: (String) -> Unit,
    onList: (String, String) -> Unit = { _, _ -> },
    onCollections: () -> Unit = {},
    onWishlist: () -> Unit = {},
    onNative: ((String) -> Boolean)? = null,
) {
    // Commerce + content batches: curated destinations go native; tail stays on WebView.
    fun resolve(route: String) {
        if (onNative?.invoke(route) == true) return
        when (route) {
            "/flash-sale" -> onList("flash-sale", "Flash Sale")
            "/deals" -> onList("deals", "Deals")
            "/luxury" -> onList("luxury", "Luxury Zone")
            "/collections" -> onCollections()
            "/preorder" -> onList("preorder", "Pre-order")
            "/auctions" -> onList("auctions", "Auctions")
            "/bundles" -> onList("bundles", "Bundles")
            "/wishlist" -> onWishlist()
            else -> onWeb(route)
        }
    }
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = androidx.compose.foundation.layout.PaddingValues(bottom = 24.dp),
    ) {
        item {
            Column(
                Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
                    .clip(RoundedCornerShape(20.dp))
                    .background(Brush.horizontalGradient(listOf(Jade, Bottle)))
                    .padding(20.dp),
            ) {
                Text("Explore the Mall", style = MaterialTheme.typography.headlineSmall, color = Color.White)
                Text(
                    "Every service, feature and corner of Grapsee",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color.White.copy(alpha = 0.9f),
                )
            }
        }

        item { GroupTitle("Browse by service") }
        item { LinkGrid(categories, ::resolve) }

        item { GroupTitle("Shop") }
        item { LinkGrid(shopping, ::resolve) }

        item { GroupTitle("Features & fun") }
        item { LinkGrid(features, ::resolve) }

        item { GroupTitle("Community") }
        item { LinkGrid(community, ::resolve) }

        item { GroupTitle("Services") }
        item { LinkGrid(services, ::resolve) }

        item { GroupTitle("Account & rewards") }
        item { LinkGrid(account, ::resolve) }
    }
}

@Composable
private fun GroupTitle(title: String) {
    Text(
        title,
        style = MaterialTheme.typography.titleMedium,
        modifier = Modifier.padding(horizontal = 16.dp, vertical = 10.dp),
    )
}

@Composable
private fun LinkGrid(links: List<Link>, onWeb: (String) -> Unit) {
    Column(Modifier.padding(horizontal = 16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        links.chunked(4).forEach { row ->
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                row.forEach { link ->
                    Surface(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(14.dp))
                            .clickable { onWeb(link.route) },
                        color = MaterialTheme.colorScheme.surface,
                        tonalElevation = 1.dp,
                    ) {
                        Column(
                            Modifier.fillMaxWidth().padding(vertical = 12.dp, horizontal = 4.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(6.dp),
                        ) {
                            Box(
                                Modifier
                                    .size(32.dp)
                                    .clip(CircleShape)
                                    .background(link.tint.copy(alpha = 0.12f)),
                                contentAlignment = Alignment.Center,
                            ) { Text(link.emoji, style = MaterialTheme.typography.bodyMedium) }
                            Text(
                                link.label,
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.SemiBold,
                                maxLines = 1,
                            )
                        }
                    }
                }
                repeat(4 - row.size) { Spacer(Modifier.weight(1f)) }
            }
        }
    }
}
