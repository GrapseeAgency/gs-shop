package com.grapsee.shop.features.home

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.animation.core.RepeatMode
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material.icons.outlined.Send
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import com.grapsee.shop.core.network.ApiClient
import com.grapsee.shop.core.network.BlogPostDto
import com.grapsee.shop.core.network.BrandDto
import com.grapsee.shop.core.network.Category
import com.grapsee.shop.core.network.CollectionDto
import com.grapsee.shop.core.network.DailyPickDto
import com.grapsee.shop.core.network.Product
import com.grapsee.shop.core.network.ReviewDto
import com.grapsee.shop.core.network.ShopEventDto
import com.grapsee.shop.ui.components.ErrorState
import com.grapsee.shop.ui.components.PriceText
import com.grapsee.shop.ui.components.ProductCard
import com.grapsee.shop.ui.components.ProductCardCompact
import com.grapsee.shop.ui.components.RatingRow
import com.grapsee.shop.ui.theme.Bottle
import com.grapsee.shop.ui.theme.Emerald
import com.grapsee.shop.ui.theme.Jade
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.math.cos
import kotlin.math.sin

data class HomeUiState(
    val picks: List<DailyPickDto> = emptyList(),
    val reviews: List<ReviewDto> = emptyList(),
    val recommended: List<Product> = emptyList(),
    val events: List<ShopEventDto> = emptyList(),
    val luxury: List<Product> = emptyList(),
    val collections: List<CollectionDto> = emptyList(),
    val posts: List<BlogPostDto> = emptyList(),
    val brands: List<BrandDto> = emptyList(),
    val categories: List<Category> = emptyList(),
    val deals: List<Product> = emptyList(),
    val trending: List<Product> = emptyList(),
    val newArrivals: List<Product> = emptyList(),
    val featured: List<Product> = emptyList(),
    val products: List<Product> = emptyList(),
    val page: Int = 1,
    val totalPages: Int = 1,
    val loading: Boolean = true,
    val loadingMore: Boolean = false,
    val error: String? = null,
)

class HomeViewModel : ViewModel() {
    var ui by mutableStateOf(HomeUiState())
        private set

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            ui = ui.copy(loading = true, error = null)
            runCatching {
                coroutineScope {
                    val picks = async { ApiClient.todaysPicks() }
                    val reviews = async { ApiClient.reviews(4) }
                    val recommended = async { ApiClient.recommended(6) }
                    val events = async { ApiClient.events() }
                    val luxury = async { ApiClient.luxuryProducts(3) }
                    val collections = async { ApiClient.collections(true) }
                    val posts = async { ApiClient.blogPosts(2) }
                    val brands = async { ApiClient.brands() }
                    val categories = async { ApiClient.categories() }
                    val deals = async { ApiClient.products(deals = true, limit = 10) }
                    val trending = async { ApiClient.products(trending = true, limit = 10) }
                    val arrivals = async { ApiClient.products(new = true, limit = 10) }
                    val featured = async { ApiClient.products(featured = true, limit = 10) }
                    val products = async { ApiClient.products(page = 1, limit = 20) }
                    val paged = products.await()
                    HomeUiState(
                        picks = picks.await(),
                        reviews = reviews.await(),
                        recommended = recommended.await(),
                        events = events.await(),
                        luxury = luxury.await(),
                        collections = collections.await(),
                        posts = posts.await(),
                        brands = brands.await(),
                        categories = categories.await(),
                        deals = deals.await().items,
                        trending = trending.await().items,
                        newArrivals = arrivals.await().items,
                        featured = featured.await().items,
                        products = paged.items,
                        totalPages = paged.totalPages,
                        loading = false,
                    )
                }
            }.onSuccess { loaded ->
                ui = loaded
            }.onFailure { t ->
                ui = ui.copy(loading = false, error = t.message ?: "Failed to load")
            }
        }
    }

    fun loadMore() {
        if (ui.loadingMore || ui.page >= ui.totalPages) return
        viewModelScope.launch {
            ui = ui.copy(loadingMore = true)
            runCatching { ApiClient.products(page = ui.page + 1, limit = 20) }
                .onSuccess { next ->
                    ui = ui.copy(
                        products = ui.products + next.items,
                        page = next.page,
                        totalPages = next.totalPages,
                        loadingMore = false,
                    )
                }
                .onFailure { ui = ui.copy(loadingMore = false) }
        }
    }
}

/** Navigation surface for home sections; [onWeb] opens the matching web route. */
data class HomeNav(
    val onProduct: (String) -> Unit,
    val onCategory: (String, String) -> Unit,
    val onSearch: () -> Unit,
    val onList: (String, String) -> Unit,
    val onWeb: (String) -> Unit,
    val onCollections: () -> Unit = {},
    val onCollection: (String) -> Unit = {},
    /** Return true when the route was handled natively (fallback is WebView). */
    val onNative: ((String) -> Boolean)? = null,
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onProduct: (String) -> Unit,
    onCategory: (String, String) -> Unit,
    onSearch: () -> Unit,
    onList: (String, String) -> Unit,
    onWeb: (String) -> Unit,
    onCollections: () -> Unit = {},
    onCollection: (String) -> Unit = {},
    onNative: ((String) -> Boolean)? = null,
    vm: HomeViewModel = viewModel(),
) {
    val state = vm.ui
    val nav = remember(onProduct, onCategory, onSearch, onList, onWeb, onCollections, onCollection, onNative) {
        HomeNav(onProduct, onCategory, onSearch, onList, onWeb, onCollections, onCollection, onNative)
    }
    // Content batch: route through native screens first, WebView as fallback.
    fun go(route: String) {
        if (nav.onNative?.invoke(route) != true) nav.onWeb(route)
    }

    when {
        state.loading -> HomeSkeleton()
        state.error != null && state.products.isEmpty() ->
            ErrorState(state.error, onRetry = vm::load, modifier = Modifier.fillMaxSize())
        else -> PullToRefreshBox(
            isRefreshing = state.loading && state.products.isNotEmpty(),
            onRefresh = vm::load,
            modifier = Modifier.fillMaxSize(),
        ) {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = androidx.compose.foundation.layout.PaddingValues(bottom = 24.dp),
            ) {
                // 1. Hero carousel
                item { HeroCarousel() }

                // 2. Categories
                item {
                    SectionBlock("Categories", "🛍") {
                        LazyRow(
                            contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 16.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                        ) {
                            items(state.categories, key = { it.id }) { category ->
                                CategoryPill(category) { nav.onCategory(category.id, category.name) }
                            }
                        }
                    }
                }

                // 3. Trending searches
                item {
                    SectionBlock("Trending searches", "🔥") {
                        LazyRow(
                            contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 16.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                        ) {
                            items(trendingSearches) { term ->
                                Surface(
                                    shape = RoundedCornerShape(20.dp),
                                    color = MaterialTheme.colorScheme.surfaceVariant,
                                    modifier = Modifier.clip(RoundedCornerShape(20.dp)).clickable { nav.onSearch() },
                                ) {
                                    Text(
                                        term,
                                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
                                        style = MaterialTheme.typography.labelMedium,
                                    )
                                }
                            }
                        }
                    }
                }

                // 4. Flash deals with countdown
                if (state.deals.isNotEmpty()) {
                    item {
                        SectionBlock("Flash deals", "⚡", action = "See all", onAction = { nav.onList("deals", "Flash deals") }) {
                            CountdownBar()
                            Spacer(Modifier.height(8.dp))
                            LazyRow(
                                contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 16.dp),
                                horizontalArrangement = Arrangement.spacedBy(12.dp),
                            ) {
                                items(state.deals, key = { it.id }) { product ->
                                    ProductCardCompact(product) { nav.onProduct(product.id) }
                                }
                            }
                        }
                    }
                }

                // 5. Personalized recommendations (web: Recommended For You)
                val recommended = state.recommended.ifEmpty { state.trending }
                if (recommended.isNotEmpty()) {
                    item {
                        SectionBlock("Recommended For You", "🎯", action = "More", onAction = { nav.onSearch() }) {
                            LazyRow(
                                contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 16.dp),
                                horizontalArrangement = Arrangement.spacedBy(12.dp),
                            ) {
                                items(recommended.take(6), key = { it.id }) { product ->
                                    ProductCardCompact(product) { nav.onProduct(product.id) }
                                }
                            }
                        }
                    }
                }

                // 6. Live events (web: EventsSection — MEGA_SALE / FLASH_SALE / AUCTION)
                if (state.events.isNotEmpty()) {
                    item {
                        SectionBlock("Live Events", "🎪", action = "All Events", onAction = { go("/events") }) {
                            LazyRow(
                                contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 16.dp),
                                horizontalArrangement = Arrangement.spacedBy(12.dp),
                            ) {
                                items(state.events.take(3), key = { it.id }) { event ->
                                    val (mode, title) = when (event.type?.uppercase()) {
                                        "FLASH_SALE" -> "flash-sale" to "Flash Sale"
                                        "AUCTION" -> "auctions" to "Auctions"
                                        else -> "deals" to "Mega Sale"
                                    }
                                    Surface(
                                        shape = RoundedCornerShape(16.dp),
                                        color = MaterialTheme.colorScheme.surface,
                                        tonalElevation = 1.dp,
                                        modifier = Modifier.width(260.dp).clip(RoundedCornerShape(16.dp)).clickable { nav.onList(mode, title) },
                                    ) {
                                        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                            Text(
                                                (event.type ?: "SALE").replace("_", " "),
                                                style = MaterialTheme.typography.labelSmall,
                                                fontWeight = FontWeight.Bold,
                                                color = MaterialTheme.colorScheme.primary,
                                            )
                                            Text(event.displayTitle, style = MaterialTheme.typography.titleMedium, maxLines = 2, overflow = TextOverflow.Ellipsis)
                                            if (!event.description.isNullOrEmpty()) {
                                                Text(event.description.orEmpty(), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 2, overflow = TextOverflow.Ellipsis)
                                            }
                                            Text("Shop now →", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.primary)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // 7. Mall directory — Shop by Floor
                item { MallDirectory(nav) }

                // 8. Trending products
                if (state.trending.isNotEmpty()) {
                    item {
                        SectionBlock("Trending now", "📈", action = "See all", onAction = { nav.onList("trending", "Trending now") }) {
                            LazyRow(
                                contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 16.dp),
                                horizontalArrangement = Arrangement.spacedBy(12.dp),
                            ) {
                                items(state.trending, key = { it.id }) { product ->
                                    ProductCardCompact(product) { nav.onProduct(product.id) }
                                }
                            }
                        }
                    }
                }

                // 9. New arrivals
                if (state.newArrivals.isNotEmpty()) {
                    item {
                        SectionBlock("New arrivals", "✨", action = "See all new", onAction = { nav.onList("new", "New arrivals") }) {
                            LazyRow(
                                contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 16.dp),
                                horizontalArrangement = Arrangement.spacedBy(12.dp),
                            ) {
                                items(state.newArrivals, key = { it.id }) { product ->
                                    ProductCardCompact(product) { nav.onProduct(product.id) }
                                }
                            }
                        }
                    }
                }

                // 10. Promo banner carousel (web: PromoBanner — 6 promos)
                item { PromoCarousel(nav) }

                // 11. Daily picks — real data from /api/todays-pick with voting
                item {
                    val picks = state.picks.ifEmpty { emptyList() }
                    var myVotes by remember { mutableStateOf(setOf<String>()) }
                    SectionBlock(
                        "Today's Picks", "🗓",
                        action = "Vote daily", onAction = { go("/daily-checkin") },
                        badge = if (picks.isNotEmpty()) "${picks.size} picks" else null,
                    ) {
                        NextPickCountdown()
                        Spacer(Modifier.height(8.dp))
                        Row(
                            Modifier.padding(horizontal = 16.dp),
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                        ) {
                            picks.take(2).forEachIndexed { index, pick ->
                                DailyPickCard(
                                    rank = index + 1,
                                    name = pick.product?.name ?: "Special pick",
                                    price = pick.product?.price ?: 0.0,
                                    comparePrice = pick.product?.comparePrice,
                                    productId = pick.productId ?: pick.product?.id ?: pick.id,
                                    votes = pick.votes + if ((pick.productId ?: pick.product?.id ?: pick.id) in myVotes) 1 else 0,
                                    voted = (pick.productId ?: pick.product?.id ?: pick.id) in myVotes,
                                    onVote = {
                                        val id = pick.productId ?: pick.product?.id ?: pick.id
                                        myVotes = if (id in myVotes) myVotes - id else myVotes + id
                                    },
                                    onClick = { pick.product?.let { nav.onProduct(it.id) } },
                                    modifier = Modifier.weight(1f),
                                )
                            }
                            if (picks.isEmpty()) {
                                EmptyPickPlaceholder(Modifier.weight(1f), nav)
                                EmptyPickPlaceholder(Modifier.weight(1f), nav)
                            }
                        }
                        Spacer(Modifier.height(6.dp))
                        Text(
                            "🗳 ${myVotes.size + 105} total votes today",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(horizontal = 16.dp),
                        )
                    }
                }

                // 12. Luxury Zone (web: LuxuryZone — premium tier excellence)
                val luxury = state.luxury.ifEmpty { state.featured.filter { (it.comparePrice ?: it.price) >= it.price }.take(3) }
                if (luxury.isNotEmpty()) {
                    item {
                        SectionBlock("Luxury Zone", "👑", action = "Explore Luxury", onAction = { nav.onList("luxury", "Luxury Zone") }) {
                            Column(
                                Modifier.padding(horizontal = 16.dp),
                                verticalArrangement = Arrangement.spacedBy(10.dp),
                            ) {
                                Text(
                                    "Premium tier excellence",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                )
                                luxury.take(3).forEach { product ->
                                    Surface(
                                        shape = RoundedCornerShape(16.dp),
                                        color = MaterialTheme.colorScheme.surface,
                                        tonalElevation = 1.dp,
                                        modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).clickable { nav.onProduct(product.id) },
                                    ) {
                                        Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                            Box(
                                                Modifier.size(44.dp).clip(RoundedCornerShape(12.dp))
                                                    .background(Color(0xFFF59E0B).copy(alpha = 0.15f)),
                                                contentAlignment = Alignment.Center,
                                            ) { Text("💎", style = MaterialTheme.typography.titleMedium) }
                                            Column(Modifier.weight(1f)) {
                                                Text(product.name, style = MaterialTheme.typography.titleSmall, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                                com.grapsee.shop.ui.components.PriceText(product.price, product.comparePrice)
                                            }
                                            Surface(color = Color(0xFFF59E0B), shape = RoundedCornerShape(8.dp)) {
                                                Text(
                                                    "Premium",
                                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                                    style = MaterialTheme.typography.labelSmall,
                                                    color = Color.White,
                                                    fontWeight = FontWeight.Bold,
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // Curated Collections (web: CollectionsPreview — hand-picked for you)
                if (state.collections.isNotEmpty()) {
                    item {
                        SectionBlock("Curated Collections", "🗂", action = "View All", onAction = { nav.onCollections() }) {
                            LazyRow(
                                contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 16.dp),
                                horizontalArrangement = Arrangement.spacedBy(12.dp),
                            ) {
                                items(state.collections.take(8), key = { it.id }) { collection ->
                                    Surface(
                                        shape = RoundedCornerShape(16.dp),
                                        color = MaterialTheme.colorScheme.surface,
                                        tonalElevation = 1.dp,
                                        modifier = Modifier.width(180.dp).clip(RoundedCornerShape(16.dp)).clickable { nav.onCollection(collection.id) },
                                    ) {
                                        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                            Text("✨", style = MaterialTheme.typography.titleMedium)
                                            Text(collection.displayTitle, style = MaterialTheme.typography.titleSmall, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                            Text(
                                                collection.description.orEmpty().ifEmpty { "Hand-picked for you" },
                                                style = MaterialTheme.typography.bodySmall,
                                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                                maxLines = 2,
                                                overflow = TextOverflow.Ellipsis,
                                            )
                                            Text(
                                                "${collection.productCount} items",
                                                style = MaterialTheme.typography.labelSmall,
                                                color = MaterialTheme.colorScheme.primary,
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // 13. Voucher + VIP tiles
                item {
                    TwoTiles(
                        TileSpec("Voucher Center", "Save more with coupons", "🏷", Color(0xFFF97316)) { go("/voucher") },
                        TileSpec("VIP Club", "Exclusive perks & rewards", "👑", Color(0xFFF59E0B)) { go("/vip") },
                    )
                }

                // 14. Featured products
                if (state.featured.isNotEmpty()) {
                    item {
                        SectionBlock("Featured Products", "⭐", action = "View all", onAction = { nav.onList("featured", "Featured") }) {
                            ProductGrid(state.featured.take(4), nav.onProduct)
                        }
                    }
                }

                // 15. Recently viewed (real history; empty state matches web)
                item {
                    RecentlyViewedSection(nav)
                }

                // 16. Stats
                item { StatsGrid(state.products.size) }

                // 17. All products
                item {
                    SectionBlock("All Products", "📦", badge = "${state.products.size} items") content@{
                        ProductGrid(state.products, nav.onProduct)
                        Spacer(Modifier.height(10.dp))
                        Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                            Text(
                                when {
                                    state.loadingMore -> "Loading more…"
                                    state.page < state.totalPages -> "Load more"
                                    else -> "You've reached the end"
                                },
                                color = MaterialTheme.colorScheme.primary,
                                style = MaterialTheme.typography.labelLarge,
                                modifier = Modifier
                                    .clip(RoundedCornerShape(12.dp))
                                    .clickable(enabled = !state.loadingMore && state.page < state.totalPages) { vm.loadMore() }
                                    .padding(horizontal = 16.dp, vertical = 8.dp),
                            )
                        }
                    }
                }

                // 18. Testimonials — real reviews from /api/reviews
                if (state.reviews.isNotEmpty()) {
                    item {
                        SectionBlock("What members say", "💬") {
                            LazyRow(
                                contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 16.dp),
                                horizontalArrangement = Arrangement.spacedBy(12.dp),
                            ) {
                                items(state.reviews, key = { it.id.ifEmpty { it.body.orEmpty() } }) { review ->
                                    Surface(
                                        shape = RoundedCornerShape(16.dp),
                                        color = MaterialTheme.colorScheme.surface,
                                        tonalElevation = 1.dp,
                                        modifier = Modifier.width(240.dp),
                                    ) {
                                        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                            Row(horizontalArrangement = Arrangement.spacedBy(2.dp)) {
                                                repeat(review.rating.toInt().coerceIn(0, 5)) {
                                                    Icon(
                                                        Icons.Filled.Star,
                                                        contentDescription = null,
                                                        tint = Color(0xFFFBBF24),
                                                        modifier = Modifier.size(12.dp),
                                                    )
                                                }
                                            }
                                            Text(
                                                review.body.orEmpty(),
                                                style = MaterialTheme.typography.bodySmall,
                                                maxLines = 4,
                                                overflow = TextOverflow.Ellipsis,
                                            )
                                            Text(
                                review.author.orEmpty(),
                                                style = MaterialTheme.typography.labelSmall,
                                                color = MaterialTheme.colorScheme.primary,
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // Blog preview (web: BlogPreview — 2 latest posts)
                if (state.posts.isNotEmpty()) {
                    item {
                        SectionBlock("From the Blog", "📰", action = "Read All", onAction = { go("/blog") }) {
                            Column(
                                Modifier.padding(horizontal = 16.dp),
                                verticalArrangement = Arrangement.spacedBy(10.dp),
                            ) {
                                state.posts.take(2).forEach { post ->
                                    Surface(
                                        shape = RoundedCornerShape(16.dp),
                                        color = MaterialTheme.colorScheme.surface,
                                        tonalElevation = 1.dp,
                                        modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).clickable { go("/blog/${post.slug.ifEmpty { post.id }}") },
                                    ) {
                                        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                                                if (!post.category.isNullOrEmpty()) {
                                                    Surface(color = MaterialTheme.colorScheme.primary.copy(alpha = 0.12f), shape = RoundedCornerShape(6.dp)) {
                                                        Text(
                                                            post.category.orEmpty(),
                                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                                                            style = MaterialTheme.typography.labelSmall,
                                                            color = MaterialTheme.colorScheme.primary,
                                                        )
                                                    }
                                                }
                                                if (post.readTime > 0) {
                                                    Text(
                                                        "${post.readTime} min read",
                                                        style = MaterialTheme.typography.labelSmall,
                                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                                    )
                                                }
                                            }
                                            Text(post.title, style = MaterialTheme.typography.titleSmall, maxLines = 2, overflow = TextOverflow.Ellipsis)
                                            if (!post.excerpt.isNullOrEmpty()) {
                                                Text(
                                                    post.excerpt.orEmpty(),
                                                    style = MaterialTheme.typography.bodySmall,
                                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                                    maxLines = 2,
                                                    overflow = TextOverflow.Ellipsis,
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // 19. Community
                item {
                    ListBanner(
                        emoji = "👥",
                        title = "Community",
                        subtitle = "Join our growing community of members",
                        action = "Join Now",
                        onAction = { go("/community") },
                    )
                }

                // 20. Live shopping
                item {
                    ListBanner(
                        emoji = "🔴",
                        title = "Live Shopping",
                        subtitle = "Watch, chat & shop in real-time",
                        tint = Color(0xFFEF4444),
                        onAction = { go("/live") },
                    )
                }

                // 21. FAQ / Help center
                item { FaqSection(nav) }

                // 20b. Brand carousel (web: BrandCarousel — hidden when no valid brands)
                if (state.brands.isNotEmpty()) {
                    item {
                        SectionBlock("Top Brands", "🏢", action = "All Brands", onAction = { go("/brands") }) {
                            LazyRow(
                                contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 16.dp),
                                horizontalArrangement = Arrangement.spacedBy(12.dp),
                            ) {
                                items(state.brands, key = { it.id }) { brand ->
                                    Surface(
                                        shape = RoundedCornerShape(16.dp),
                                        color = MaterialTheme.colorScheme.surface,
                                        tonalElevation = 1.dp,
                                        modifier = Modifier.width(140.dp).clip(RoundedCornerShape(16.dp)).clickable { go("/brands") },
                                    ) {
                                        Column(
                                            Modifier.padding(14.dp),
                                            horizontalAlignment = Alignment.CenterHorizontally,
                                            verticalArrangement = Arrangement.spacedBy(4.dp),
                                        ) {
                                            Box(
                                                Modifier.size(40.dp).clip(CircleShape)
                                                    .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)),
                                                contentAlignment = Alignment.Center,
                                            ) {
                                                Text(
                                                    brand.name.take(1).uppercase(),
                                                    style = MaterialTheme.typography.titleMedium,
                                                    color = MaterialTheme.colorScheme.primary,
                                                )
                                            }
                                            Text(brand.name, style = MaterialTheme.typography.labelLarge, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                            if (!brand.category.isNullOrEmpty()) {
                                                Text(
                                                    brand.category.orEmpty(),
                                                    style = MaterialTheme.typography.labelSmall,
                                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // 22. Newsletter
                item { NewsletterCard(nav) }

                // 23. Rewards program
                item { RewardsCard(nav) }

                // Quick Help (web: HelpQuickLinks — orders / cart / wishlist / rewards)
                item {
                    SectionBlock("Quick Help", "🆘", action = "Help Center", onAction = { go("/help") }) {
                        IconTileGrid(
                            null,
                            listOf(
                                TileSpec("Orders", "", "📦", Color(0xFF3B82F6)) { go("/orders") },
                                TileSpec("Returns", "", "↩️", Color(0xFFF97316)) { go("/returns") },
                                TileSpec("Contact", "", "💬", Color(0xFF10B981)) { go("/contact") },
                                TileSpec("Rewards", "", "🏆", Color(0xFFEAB308)) { go("/rewards") },
                            ),
                        )
                    }
                }

                // 24. Customer reviews
                item {
                    ListBanner(
                        emoji = "⭐",
                        title = "Customer Reviews",
                        subtitle = "4.8 · Based on verified customer reviews",
                        action = "See All",
                        onAction = { go("/reviews") },
                    )
                }

                // 25. Quick links
                item {
                    IconTileGrid(
                        "Quick Links",
                        listOf(
                            TileSpec("Bundles", "", "📦", Color(0xFF3B82F6)) { nav.onList("bundles", "Bundles") },
                            TileSpec("Style", "", "🎨", Color(0xFFEC4899)) { go("/style-guide") },
                            TileSpec("Affiliate", "", "💲", Color(0xFF22C55E)) { go("/affiliate") },
                            TileSpec("Sitemap", "", "🗺", Color(0xFFA855F7)) { go("/sitemap") },
                        ),
                    )
                }

                // 26. Group buy
                item {
                    ListBanner(
                        emoji = "🤝",
                        title = "Buy Together, Save Together",
                        subtitle = "Up to 60% off when you join a group buy",
                        action = "Join Now",
                        onAction = { go("/group-buy") },
                    )
                }

                // 27. Price drop alerts
                item {
                    ListBanner(
                        emoji = "📉",
                        title = "Price Drop Alerts",
                        subtitle = "Track price drops on your favorite items",
                        tint = Color(0xFFEF4444),
                        onAction = { go("/price-drop") },
                    )
                }

                // 28. Installments + Trade-in
                item {
                    TwoTiles(
                        TileSpec("Installments", "0% EMI plans", "💳", Color(0xFF3B82F6)) { go("/installment") },
                        TileSpec("Trade-In", "Up to 55% value", "📱", Color(0xFF06B6D4)) { go("/trade-in") },
                    )
                }

                // 29. Try at home + Mystery reward
                item {
                    TwoTiles(
                        TileSpec("Try at Home", "Try before you buy", "🏡", Color(0xFF8B5CF6)) { go("/try-before-buy") },
                        TileSpec("Mystery Reward", "Reveal your prize!", "🎁", Color(0xFFF59E0B)) { go("/mystery-reward") },
                    )
                }

                // 30. Digital downloads
                item {
                    SectionBlock("Digital Downloads", "💾", action = "Browse All", onAction = { go("/digital-downloads") }) {
                        IconTileGrid(
                            null,
                            listOf(
                                TileSpec("eBooks", "", "📚", Color(0xFF3B82F6)) { go("/digital-downloads") },
                                TileSpec("Software", "", "💿", Color(0xFF6B7280)) { go("/digital-downloads") },
                                TileSpec("Templates", "", "🎨", Color(0xFFA855F7)) { go("/digital-downloads") },
                                TileSpec("Courses", "", "🎓", Color(0xFF6366F1)) { go("/digital-downloads") },
                            ),
                        )
                    }
                }

                // 31. Outfit maker + rent
                item {
                    TwoTiles(
                        TileSpec("Outfit Maker", "Create your look", "👕", Color(0xFFEC4899)) { go("/outfit-maker") },
                        TileSpec("Rent Products", "From 500/day", "🎬", Color(0xFF14B8A6)) { go("/rental") },
                    )
                }

                // 32. Services
                item {
                    IconTileGrid(
                        "Services",
                        listOf(
                            TileSpec("Gift Wrap", "", "🎁", Color(0xFFEC4899)) { go("/gift-wrapping") },
                            TileSpec("Code Quality", "", "🛡", Color(0xFF3B82F6)) { go("/code-quality") },
                            TileSpec("Open Source", "", "💚", Color(0xFF22C55E)) { go("/open-source") },
                            TileSpec("Student", "", "🎓", Color(0xFFF97316)) { go("/student-discount") },
                            TileSpec("Protected", "", "✅", Color(0xFF22C55E)) { go("/delivery-protection") },
                            TileSpec("Resources", "", "🏆", Color(0xFFEAB308)) { go("/tech-library") },
                        ),
                        columns = 3,
                    )
                }

                // 33. Seller + reviewers
                item {
                    TwoTiles(
                        TileSpec("Become a Seller", "Earn up to 95%", "🏪", Color(0xFFF59E0B)) { go("/seller-center") },
                        TileSpec("Top Reviewers", "Community stars", "📢", Color(0xFFA855F7)) { go("/review-megaphone") },
                    )
                }

                // 34. More features
                item {
                    IconTileGrid(
                        "More Features",
                        listOf(
                            TileSpec("Videos", "", "🎬", Color(0xFFEF4444)) { go("/product-videos") },
                            TileSpec("Quiz", "", "🧩", Color(0xFFA855F7)) { go("/product-quiz") },
                            TileSpec("Calc", "", "🧮", Color(0xFFF97316)) { go("/loyalty-calculator") },
                            TileSpec("Shipping", "", "🚚", Color(0xFF3B82F6)) { go("/shipping-calculator") },
                            TileSpec("Group", "", "🤝", Color(0xFF22C55E)) { go("/group-buy") },
                            TileSpec("Dark", "", "🌙", Color(0xFF6366F1)) { go("/dark-store") },
                            TileSpec("Drop", "", "📉", Color(0xFFEF4444)) { go("/price-drop") },
                            TileSpec("Mystery", "", "🎁", Color(0xFFF59E0B)) { go("/mystery-reward") },
                        ),
                    )
                }

                // 23. Mall footer (web: MallFooter — SHOP / SERVICES / SUPPORT / OUR PRODUCTS)
                item { MallFooter(nav) }

                item {
                    Text(
                        "You've seen it all! ✨",
                        modifier = Modifier.fillMaxWidth().padding(vertical = 20.dp),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
        }
    }
}

private val trendingSearches = listOf("websites", "mobile apps", "devops", "UI/UX design", "AI/ML", "dashboards", "eBooks", "branding")

// ---------------------------------------------------------------- components

@Composable
private fun SectionBlock(
    title: String,
    emoji: String,
    action: String? = null,
    badge: String? = null,
    onAction: () -> Unit = {},
    content: @Composable () -> Unit,
) {
    Column(Modifier.padding(vertical = 8.dp)) {
        Row(
            Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(
                Modifier
                    .size(30.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center,
            ) {
                Text(emoji, style = MaterialTheme.typography.labelLarge)
            }
            Spacer(Modifier.width(10.dp))
            Text(
                title,
                style = MaterialTheme.typography.titleLarge,
                modifier = Modifier.weight(1f),
            )
            if (badge != null) {
                Surface(color = MaterialTheme.colorScheme.primary.copy(alpha = 0.08f), shape = RoundedCornerShape(50)) {
                    Text(
                        badge,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 3.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.primary,
                    )
                }
            }
            if (action != null) {
                Text(
                    action,
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .clickable(onClick = onAction)
                        .padding(4.dp),
                )
            }
        }
        content()
    }
}

@Composable
private fun HeroCarousel() {
    // Faithful port of the web hero: same 4 slides, badges, dual CTAs and
    // animated artwork, redrawn natively (the web uses animated SVG; we use
    // Compose Canvas — the "liquid aurora" / WebGL feel included).
    val slides = listOf(
        HeroSlide(
            id = 1, badge = "Welcome to Grapsee Mall", title = "Build Your", highlight = "Digital Empire",
            description = "Premium websites, apps & DevOps — crafted by elite engineers. Your one-stop digital shopping mall.",
            cta = "Shop Now", ctaSecondary = "Browse All Products", accent = Color(0xFF10B981), art = HeroArt.WINDOWS,
            onCta = { 0 },
        ),
        HeroSlide(
            id = 2, badge = "Flash Deals Live", title = "Up to", highlight = "50% OFF",
            description = "Limited-time deals on digital services. Don't miss the biggest sale of the season!",
            cta = "Grab Deals", ctaSecondary = "View All Deals", accent = Color(0xFFF97316), art = HeroArt.BOLT,
            onCta = { 1 },
        ),
        HeroSlide(
            id = 3, badge = "New Arrivals", title = "Next-Gen Tech,", highlight = "Built for You",
            description = "AI-powered tools and next-gen applications — the sharpest digital products in one marketplace.",
            cta = "Explore Tech", ctaSecondary = "Browse AI Tools", accent = Color(0xFF8B5CF6), art = HeroArt.CHIP,
            onCta = { 2 },
        ),
        HeroSlide(
            id = 4, badge = "Creative Studio", title = "Design That", highlight = "Actually Sells",
            description = "UI kits, brand templates & design systems built by professionals.",
            cta = "Shop Designs", ctaSecondary = "Browse UI Kits", accent = Color(0xFFE879F9), art = HeroArt.PALETTE,
            onCta = { 3 },
        ),
    )
    val nav = LocalHeroNav.current
    val pagerState = rememberPagerState(pageCount = { slides.size })

    // Auto-advance every 5s like the web hero.
    LaunchedEffect(pagerState) {
        while (true) {
            delay(5000)
            val next = (pagerState.currentPage + 1) % slides.size
            pagerState.animateScrollToPage(next)
        }
    }

    HorizontalPager(
        state = pagerState,
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
    ) { index ->
        val slide = slides[index]
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 1.dp,
            modifier = Modifier.fillMaxWidth(),
        ) {
            Row(
                Modifier
                    .fillMaxWidth()
                    .background(Brush.linearGradient(listOf(slide.accent.copy(alpha = 0.16f), Color.Transparent)))
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Column(Modifier.weight(1.2f), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        Box(
                            Modifier
                                .size(6.dp)
                                .clip(CircleShape)
                                .background(if (slide.id <= 2) MaterialTheme.colorScheme.error else slide.accent),
                        )
                        Text(
                            slide.badge,
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = slide.accent,
                        )
                    }
                    Row {
                        Text(slide.title + " ", style = MaterialTheme.typography.titleLarge)
                        Text(
                            slide.highlight,
                            style = MaterialTheme.typography.titleLarge,
                            color = slide.accent,
                            fontWeight = FontWeight.ExtraBold,
                        )
                    }
                    Text(
                        slide.description,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Spacer(Modifier.height(4.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        HeroButton(slide.cta, filled = true, accent = slide.accent) {
                            when (slide.onCta()) {
                                1 -> nav.onList("deals", "Flash deals")
                                2 -> nav.onList("new", "New arrivals")
                                3 -> if (nav.onNative?.invoke("/digital-downloads") != true) nav.onWeb("/digital-downloads")
                                else -> if (nav.onNative?.invoke("/category") != true) nav.onWeb("/category")
                            }
                        }
                        HeroButton(slide.ctaSecondary, filled = false, accent = slide.accent) {
                            when (slide.onCta()) {
                                1 -> nav.onList("deals", "Flash deals")
                                else -> if (nav.onNative?.invoke("/category") != true) nav.onSearch()
                            }
                        }
                    }
                }
                HeroArtwork(slide.art, slide.accent, Modifier.weight(1f))
            }
        }
    }
}

/** CompositionLocal so hero slides can navigate without threading params. */
val LocalHeroNav = compositionLocalOf<HomeNav> {
    error("HeroNav not provided")
}

@Composable
private fun HeroButton(label: String, filled: Boolean, accent: Color, onClick: () -> Unit) {
    Surface(
        shape = RoundedCornerShape(10.dp),
        color = if (filled) accent else Color.Transparent,
        border = if (filled) null else androidx.compose.foundation.BorderStroke(1.dp, accent.copy(alpha = 0.5f)),
        modifier = Modifier.clip(RoundedCornerShape(10.dp)).clickable(onClick = onClick),
    ) {
        Text(
            label,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
            style = MaterialTheme.typography.labelSmall,
            color = if (filled) Color.White else accent,
            fontWeight = FontWeight.Bold,
        )
    }
}

enum class HeroArt { WINDOWS, BOLT, CHIP, PALETTE }

@Composable
private fun HeroArtwork(art: HeroArt, accent: Color, modifier: Modifier = Modifier) {
    val transition = rememberInfiniteTransition(label = "heroArt")
    val t by transition.animateFloat(
        initialValue = 0f, targetValue = 1f,
        animationSpec = infiniteRepeatable(tween(3000), RepeatMode.Restart), label = "t",
    )
    val blink by transition.animateFloat(
        initialValue = 1f, targetValue = 0.25f,
        animationSpec = infiniteRepeatable(tween(700), RepeatMode.Reverse), label = "blink",
    )
    Canvas(modifier.height(150.dp)) {
        val w = size.width
        val h = size.height
        // Ambient aurora — the web's liquid-aurora/WebGL vibe, drawn natively.
        drawCircle(
            brush = Brush.radialGradient(
                listOf(accent.copy(alpha = 0.20f), Color.Transparent),
                center = Offset(w * (0.5f + 0.15f * sin(t * 2f * Math.PI.toFloat())), h * 0.35f),
                radius = w * 0.55f,
            ),
            radius = w * 0.55f,
            center = Offset(w * (0.5f + 0.15f * sin(t * 2f * Math.PI.toFloat())), h * 0.35f),
        )
        // Drifting ambient particles.
        val dots = listOf(
            Triple(0.9f, 0.15f, accent), Triple(0.1f, 0.3f, Color(0xFF6366F1)),
            Triple(0.08f, 0.85f, Color(0xFFF59E0B)), Triple(0.92f, 0.9f, Color(0xFFE879F9)),
        )
        dots.forEachIndexed { i, (fx, fy, c) ->
            val phase = (t + i * 0.25f) % 1f
            drawCircle(
                color = c.copy(alpha = 0.7f * (1f - kotlin.math.abs(phase - 0.5f))),
                radius = 5f + 3f * phase,
                center = Offset(w * fx, h * (fy + 0.05f * sin(phase * 6.28f))),
            )
        }
        when (art) {
            HeroArt.WINDOWS -> {
                // Back window (code editor)
                drawRoundRect(accent.copy(alpha = 0.10f), Offset(w * 0.28f, h * 0.10f), Size(w * 0.62f, h * 0.52f), CornerRadius(12f))
                drawRoundRect(accent.copy(alpha = 0.22f), Offset(w * 0.28f, h * 0.10f), Size(w * 0.62f, h * 0.13f), CornerRadius(12f))
                val codeW = (0.28f + 0.12f * sin(t * 6.28f)) * w
                drawRoundRect(accent.copy(alpha = 0.5f), Offset(w * 0.33f, h * 0.34f), Size(codeW, 7f), CornerRadius(4f))
                drawRoundRect(accent.copy(alpha = 0.28f), Offset(w * 0.33f, h * 0.44f), Size(w * 0.42f, 6f), CornerRadius(4f))
                drawRoundRect(accent.copy(alpha = 0.28f), Offset(w * 0.33f, h * 0.52f), Size(w * 0.32f, 6f), CornerRadius(4f))
                // Main card
                drawRoundRect(Color.White, Offset(w * 0.06f, h * 0.40f), Size(w * 0.48f, h * 0.42f), CornerRadius(16f))
                drawRoundRect(accent, Offset(w * 0.06f, h * 0.40f), Size(w * 0.48f, h * 0.12f), CornerRadius(16f))
                drawCircle(Color(0xFFFBBF24).copy(alpha = blink), 6f, Offset(w * 0.48f, h * 0.46f))
                // Revenue card
                drawRoundRect(Color.White, Offset(w * 0.60f, h * 0.52f), Size(w * 0.36f, h * 0.30f), CornerRadius(12f))
                drawRoundRect(accent.copy(alpha = 0.85f), Offset(w * 0.64f, h * 0.72f), Size(w * (0.1f + 0.12f * t), 8f), CornerRadius(4f))
                // Live badge
                drawRoundRect(accent.copy(alpha = 0.92f), Offset(w * 0.60f, h * 0.88f), Size(w * 0.30f, h * 0.11f), CornerRadius(20f))
            }
            HeroArt.BOLT -> {
                drawCircle(accent.copy(alpha = 0.18f * blink), w * 0.42f, Offset(w * 0.5f, h * 0.5f), style = Stroke(width = 3f))
                drawCircle(accent.copy(alpha = 0.12f), w * 0.30f, Offset(w * 0.5f, h * 0.5f), style = Stroke(width = 4f))
                val bolt = Path().apply {
                    moveTo(w * 0.56f, h * 0.12f)
                    lineTo(w * 0.44f, h * 0.52f)
                    lineTo(w * 0.53f, h * 0.52f)
                    lineTo(w * 0.46f, h * 0.90f)
                    lineTo(w * 0.68f, h * 0.44f)
                    lineTo(w * 0.57f, h * 0.44f)
                    close()
                }
                drawPath(bolt, Brush.verticalGradient(listOf(Color(0xFFFBBF24), accent, Color(0xFFEF4444))))
            }
            HeroArt.CHIP -> {
                drawRoundRect(accent.copy(alpha = 0.16f), Offset(w * 0.2f, h * 0.2f), Size(w * 0.6f, h * 0.6f), CornerRadius(20f))
                drawRoundRect(accent, Offset(w * 0.32f, h * 0.32f), Size(w * 0.36f, h * 0.36f), CornerRadius(12f), style = Stroke(5f))
                for (i in 0..3) {
                    val p = i / 3f
                    drawLine(accent.copy(alpha = 0.5f + 0.4f * blink), Offset(w * (0.24f + 0.18f * p), h * 0.16f), Offset(w * (0.24f + 0.18f * p), h * 0.30f), 5f)
                    drawLine(accent.copy(alpha = 0.5f), Offset(w * (0.24f + 0.18f * p), h * 0.70f), Offset(w * (0.24f + 0.18f * p), h * 0.84f), 5f)
                }
                drawCircle(Color.White.copy(alpha = blink), 8f, Offset(w * 0.5f, h * 0.5f))
            }
            HeroArt.PALETTE -> {
                listOf(Color(0xFFEC4899), Color(0xFF8B5CF6), Color(0xFF3B82F6), accent).forEachIndexed { i, c ->
                    drawCircle(
                        c.copy(alpha = 0.75f),
                        w * 0.16f,
                        Offset(w * (0.35f + 0.16f * cos(t * 6.28f + i)), h * (0.35f + 0.14f * sin(t * 6.28f + i * 1.6f))),
                    )
                }
                drawRoundRect(Color.White, Offset(w * 0.15f, h * 0.68f), Size(w * 0.7f, h * 0.14f), CornerRadius(16f))
                drawRoundRect(accent.copy(alpha = 0.6f * blink), Offset(w * 0.2f, h * 0.72f), Size(w * 0.35f, 8f), CornerRadius(4f))
            }
        }
    }
}

private data class HeroSlide(
    val id: Int,
    val badge: String,
    val title: String,
    val highlight: String,
    val description: String,
    val cta: String,
    val ctaSecondary: String,
    val accent: Color,
    val art: HeroArt,
    val onCta: () -> Int,
)

@Composable
private fun CategoryPill(category: Category, onClick: () -> Unit) {
    Surface(
        shape = RoundedCornerShape(14.dp),
        color = MaterialTheme.colorScheme.surfaceVariant,
        modifier = Modifier
            .clip(RoundedCornerShape(14.dp))
            .clickable(onClick = onClick),
    ) {
        Row(
            Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Box(
                Modifier
                    .size(26.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center,
            ) { Text("🛍", style = MaterialTheme.typography.labelSmall) }
            Text(category.name, style = MaterialTheme.typography.labelLarge, maxLines = 1)
        }
    }
}

@Composable
private fun CountdownBar() {
    var remaining by remember { mutableStateOf("--h --m --s") }
    LaunchedEffect(Unit) {
        while (true) {
            val now = java.util.Calendar.getInstance()
            val end = (now.clone() as java.util.Calendar).apply {
                set(java.util.Calendar.HOUR_OF_DAY, 0)
                set(java.util.Calendar.MINUTE, 0)
                set(java.util.Calendar.SECOND, 0)
                add(java.util.Calendar.DAY_OF_MONTH, 1)
            }
            val diff = (end.timeInMillis - now.timeInMillis).coerceAtLeast(0)
            remaining = String.format(
                "%02dh %02dm %02ds",
                diff / 3_600_000, diff / 60_000 % 60, diff / 1_000 % 60,
            )
            delay(1000)
        }
    }
    Row(
        Modifier
            .padding(horizontal = 16.dp)
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(MaterialTheme.colorScheme.error.copy(alpha = 0.10f))
            .padding(horizontal = 12.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Text("⏰", style = MaterialTheme.typography.labelMedium)
        Text(
            "This weekend only — ends in $remaining",
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.error,
            fontWeight = FontWeight.Bold,
        )
    }
}

/** "Next picks in HHh MMm SSs" until midnight — mirrors the web DailyPicks timer. */
@Composable
private fun NextPickCountdown() {
    var remaining by remember { mutableStateOf("") }
    LaunchedEffect(Unit) {
        while (true) {
            val now = java.util.Calendar.getInstance()
            val end = (now.clone() as java.util.Calendar).apply {
                set(java.util.Calendar.HOUR_OF_DAY, 0)
                set(java.util.Calendar.MINUTE, 0)
                set(java.util.Calendar.SECOND, 0)
                add(java.util.Calendar.DAY_OF_MONTH, 1)
            }
            val diff = (end.timeInMillis - now.timeInMillis).coerceAtLeast(0)
            remaining = String.format(
                "%02dh %02dm %02ds", diff / 3_600_000, diff / 60_000 % 60, diff / 1_000 % 60,
            )
            delay(1000)
        }
    }
    Surface(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 4.dp),
        shape = RoundedCornerShape(10.dp),
        color = MaterialTheme.colorScheme.primary.copy(alpha = 0.06f),
    ) {
        Row(
            Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Text("⏱ Next picks in", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(remaining, style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun DailyPickCard(
    rank: Int,
    name: String,
    price: Double,
    comparePrice: Double?,
    productId: String,
    votes: Int,
    voted: Boolean,
    onVote: () -> Unit,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Surface(
        shape = RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.surface,
        tonalElevation = 1.dp,
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .clickable(onClick = onClick),
    ) {
        Column {
            Box(
                Modifier
                    .fillMaxWidth()
                    .height(72.dp)
                    .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.8f)),
                contentAlignment = Alignment.Center,
            ) {
                Row(
                    Modifier
                        .align(Alignment.TopStart)
                        .padding(6.dp)
                        .fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    Surface(shape = CircleShape, color = Color.White.copy(alpha = 0.25f)) {
                        Text(
                            "#$rank",
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 1.dp),
                            style = MaterialTheme.typography.labelSmall,
                            color = Color.White,
                        )
                    }
                    Text(
                        "🔥 ${if (voted) "Trending" else "Today"}",
                        style = MaterialTheme.typography.labelSmall,
                        color = Color.White.copy(alpha = 0.9f),
                    )
                }
                Text(
                    name.split(" ").take(2).joinToString(" "),
                    color = Color.White,
                    style = MaterialTheme.typography.titleMedium,
                    maxLines = 1,
                )
            }
            Column(Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(name, style = MaterialTheme.typography.titleSmall, maxLines = 1, overflow = TextOverflow.Ellipsis)
                PriceText(price, comparePrice)
                // Vote row — Details / Add pattern from the web
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = if (voted) MaterialTheme.colorScheme.primary.copy(alpha = 0.15f) else MaterialTheme.colorScheme.surfaceVariant,
                        modifier = Modifier.clip(RoundedCornerShape(8.dp)).clickable(onClick = onVote),
                    ) {
                        Text(
                            if (voted) "▲ $votes voted" else "▲ Vote ($votes)",
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            style = MaterialTheme.typography.labelSmall,
                            color = if (voted) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface,
                        )
                    }
                    Text("Details", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.primary)
                }
            }
        }
    }
}

@Composable
private fun EmptyPickPlaceholder(modifier: Modifier = Modifier, nav: HomeNav) {
    Surface(
        shape = RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
        modifier = modifier.height(140.dp).clip(RoundedCornerShape(16.dp)).clickable { nav.onSearch() },
    ) {
        Box(contentAlignment = Alignment.Center) {
            Text(
                "Picks refresh at midnight",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

@Composable
private fun MallDirectory(nav: HomeNav) {
    Column(Modifier.padding(vertical = 8.dp)) {
        SectionHeaderRow("Shop by Floor", "👑", subtitle = "Browse like a real mall")
        LazyRow(
            contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            items(floors) { floor ->
                Surface(
                    shape = RoundedCornerShape(18.dp),
                    color = MaterialTheme.colorScheme.surface,
                    tonalElevation = 1.dp,
                    modifier = Modifier
                        .width(210.dp)
                        .clip(RoundedCornerShape(18.dp))
                        .clickable { if (nav.onNative?.invoke("/category") != true) nav.onWeb("/category") },
                ) {
                    Column {
                        Box(
                            Modifier
                                .fillMaxWidth()
                                .height(92.dp)
                                .background(Brush.linearGradient(listOf(floor.tint.copy(alpha = 0.35f), MaterialTheme.colorScheme.surface))),
                            contentAlignment = Alignment.Center,
                        ) {
                            Text(floor.emoji, style = MaterialTheme.typography.headlineLarge)
                        }
                        Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text(
                                "FLOOR ${floor.id} ›",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                fontWeight = FontWeight.ExtraBold,
                            )
                            Text(floor.name, style = MaterialTheme.typography.titleMedium)
                            Text(
                                floor.subtitle,
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                            Spacer(Modifier.height(4.dp))
                            Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                floor.tags.take(2).forEach { tag ->
                                    Surface(
                                        color = MaterialTheme.colorScheme.primary.copy(alpha = 0.08f),
                                        shape = RoundedCornerShape(6.dp),
                                    ) {
                                        Text(
                                            tag,
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                            style = MaterialTheme.typography.labelSmall,
                                            color = MaterialTheme.colorScheme.primary,
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

private data class Floor(val id: Int, val name: String, val subtitle: String, val emoji: String, val tint: Color, val tags: List<String>)

private val floors = listOf(
    Floor(1, "Electronics & Tech", "Websites, Apps & DevOps", "💻", Color(0xFF06B6D4), listOf("Websites", "Mobile Apps")),
    Floor(2, "Fashion & Lifestyle", "Design & Branding", "👕", Color(0xFFEC4899), listOf("UI/UX", "Branding")),
    Floor(3, "Home & Living", "Productivity & Tools", "🏠", Color(0xFF10B981), listOf("Dashboards", "Automation")),
    Floor(4, "Premium & Luxury", "Enterprise Solutions", "👑", Color(0xFFF59E0B), listOf("Enterprise", "AI/ML")),
)

@Composable
private fun PromoCarousel(nav: HomeNav) {
    // Faithful port of web PromoBanner: same 6 promos, same order, same CTAs.
    val promos = listOf(
        PromoSpec("🔥", "HOT", "Mega Sale", "This Weekend Only", "Save up to 50% on all digital services. Premium quality at unbeatable prices.", "Shop Sale", Color(0xFFF59E0B), { nav.onList("deals", "Flash deals") }),
        PromoSpec("🚚", "FREE", "Free Delivery", "Limited Time Offer", "Free delivery on all orders this week. No minimum purchase required!", "Order Now", Color(0xFF10B981), { nav.onSearch() }),
        PromoSpec("🎁", "BOGO", "Buy 1 Get 1", "BOGO Deals", "Buy any service and get a second one free. Mix and match across categories!", "Claim Offer", Color(0xFFF43F5E), { nav.onList("deals", "Flash deals") }),
        PromoSpec("📦", "BUNDLE", "Bundle & Save", "Custom Packages", "Bundle services together and save up to 40% on custom packages.", "Build Bundle", Color(0xFF8B5CF6), { nav.onSearch() }),
        PromoSpec("⚡", "FLASH", "Flash Deal", "Ends in Hours", "Lightning deals refresh every few hours. Grab them before they're gone.", "Shop Flash", Color(0xFFEF4444), { nav.onList("deals", "Flash deals") }),
        PromoSpec("👑", "CLUB", "Premium Club", "Join & Save 20%", "Members save 20% on every order plus early access to new drops.", "Join Club", Color(0xFFEAB308), { if (nav.onNative?.invoke("/vip") != true) nav.onWeb("/vip") }),
    )
    val pagerState = androidx.compose.foundation.pager.rememberPagerState(pageCount = { promos.size })
    Column {
        androidx.compose.foundation.pager.HorizontalPager(
            state = pagerState,
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
        ) { index ->
            val promo = promos[index]
            Surface(
                modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(20.dp)).clickable { promo.onClick() },
                color = MaterialTheme.colorScheme.surface,
                tonalElevation = 1.dp,
            ) {
                Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Box(
                        Modifier.size(44.dp).clip(CircleShape).background(promo.accent.copy(alpha = 0.12f)),
                        contentAlignment = Alignment.Center,
                    ) { Text(promo.emoji, style = MaterialTheme.typography.titleLarge) }
                    Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                        Surface(color = promo.accent, shape = RoundedCornerShape(6.dp)) {
                            Text(
                                "${promo.badge} · ${promo.subtitle.uppercase()}",
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                style = MaterialTheme.typography.labelSmall,
                                color = Color.White,
                                fontWeight = FontWeight.Bold,
                            )
                        }
                        Text(promo.title, style = MaterialTheme.typography.titleLarge)
                        Text(promo.description, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    Surface(color = MaterialTheme.colorScheme.primary, shape = RoundedCornerShape(10.dp)) {
                        Text(
                            promo.cta + " →",
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                            style = MaterialTheme.typography.labelLarge,
                            color = MaterialTheme.colorScheme.onPrimary,
                        )
                    }
                }
            }
        }
        Row(Modifier.fillMaxWidth().padding(bottom = 4.dp), horizontalArrangement = Arrangement.Center) {
            repeat(promos.size) { i ->
                val selected = pagerState.currentPage == i
                Box(
                    Modifier.padding(horizontal = 3.dp).size(if (selected) 8.dp else 6.dp).clip(CircleShape)
                        .background(if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant),
                )
            }
        }
    }
}

private data class PromoSpec(
    val emoji: String,
    val badge: String,
    val title: String,
    val subtitle: String,
    val description: String,
    val cta: String,
    val accent: Color,
    val onClick: () -> Unit,
)

@Composable
private fun RecentlyViewedSection(nav: HomeNav) {
    val history by com.grapsee.shop.core.history.RecentlyViewedStore.items.collectAsState()
    LaunchedEffect(Unit) { com.grapsee.shop.core.history.RecentlyViewedStore.start() }
    val scope = androidx.compose.runtime.rememberCoroutineScope()
    if (history.isEmpty()) {
        EmptyHistoryCard { nav.onSearch() }
    } else {
        SectionBlock(
            "Recently Viewed", "🕒",
            action = "Clear", onAction = { scope.launch { com.grapsee.shop.core.history.RecentlyViewedStore.clear() } },
        ) {
            LazyRow(
                contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                items(history.reversed(), key = { it.id }) { product ->
                    ProductCardCompact(product) { nav.onProduct(product.id) }
                }
            }
        }
    }
}

@Composable
private fun EmptyHistoryCard(onBrowse: () -> Unit) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        shape = RoundedCornerShape(18.dp),
        color = MaterialTheme.colorScheme.surface,
        tonalElevation = 1.dp,
    ) {
        Column(
            Modifier.fillMaxWidth().padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text("🕒", style = MaterialTheme.typography.headlineMedium)
            Text("No Browsing History", style = MaterialTheme.typography.titleMedium)
            Text(
                "Start exploring products and they'll appear here",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = MaterialTheme.colorScheme.primary,
                modifier = Modifier.clip(RoundedCornerShape(12.dp)).clickable(onClick = onBrowse),
            ) {
                Text(
                    "🔍  Browse Products",
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 10.dp),
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.onPrimary,
                )
            }
        }
    }
}

@Composable
private fun StatsGrid(productCount: Int) {
    val cells = listOf(
        Triple("😊", productCount.toString(), "PRODUCTS"),
        Triple("🌐", "99.9%", "UPTIME"),
        Triple("🎧", "24/7", "SUPPORT"),
        Triple("⭐", "4.8", "RATING"),
        Triple("💬", "0", "REVIEWS"),
        Triple("👥", "0", "MEMBERS"),
    )
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        shape = RoundedCornerShape(18.dp),
        color = MaterialTheme.colorScheme.surface,
        tonalElevation = 1.dp,
    ) {
        Column(Modifier.fillMaxWidth().padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Text("Trusted Worldwide", style = MaterialTheme.typography.titleLarge, color = MaterialTheme.colorScheme.primary)
            Text(
                "Numbers that speak for themselves",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(14.dp))
            cells.chunked(3).forEach { row ->
                Row(
                    Modifier.fillMaxWidth().padding(vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceEvenly,
                ) {
                    row.forEach { (emoji, value, label) ->
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Box(
                                Modifier
                                    .size(34.dp)
                                    .clip(CircleShape)
                                    .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)),
                                contentAlignment = Alignment.Center,
                            ) { Text(emoji, style = MaterialTheme.typography.bodyMedium) }
                            Spacer(Modifier.height(4.dp))
                            Text(value, style = MaterialTheme.typography.titleMedium)
                            Text(label, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ListBanner(
    emoji: String,
    title: String,
    subtitle: String,
    tint: Color = MaterialTheme.colorScheme.primary,
    action: String? = null,
    onAction: () -> Unit = {},
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 6.dp)
            .clip(RoundedCornerShape(16.dp))
            .clickable(onClick = onAction),
        color = MaterialTheme.colorScheme.surface,
        tonalElevation = 1.dp,
    ) {
        Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Box(
                Modifier
                    .size(42.dp)
                    .clip(CircleShape)
                    .background(tint.copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center,
            ) { Text(emoji, style = MaterialTheme.typography.titleMedium) }
            Column(Modifier.weight(1f)) {
                Text(title, style = MaterialTheme.typography.titleSmall)
                Text(subtitle, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            if (action != null) {
                Text(action, style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.primary)
            } else {
                Text("›", style = MaterialTheme.typography.titleLarge, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}

@Composable
private fun TwoTiles(a: TileSpec, b: TileSpec) {
    Row(
        Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 6.dp),
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        FeatureTile(a, Modifier.weight(1f))
        FeatureTile(b, Modifier.weight(1f))
    }
}

data class TileSpec(val title: String, val subtitle: String, val emoji: String, val tint: Color, val onClick: () -> Unit)

@Composable
private fun FeatureTile(spec: TileSpec, modifier: Modifier = Modifier) {
    Surface(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .clickable(onClick = spec.onClick),
        color = MaterialTheme.colorScheme.surface,
        tonalElevation = 1.dp,
    ) {
        Column(Modifier.padding(14.dp)) {
            Box(
                Modifier
                    .size(34.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(spec.tint.copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center,
            ) { Text(spec.emoji, style = MaterialTheme.typography.bodyLarge) }
            Spacer(Modifier.height(8.dp))
            Text(spec.title, style = MaterialTheme.typography.titleSmall)
            if (spec.subtitle.isNotBlank()) {
                Text(spec.subtitle, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}

@Composable
private fun IconTileGrid(title: String?, specs: List<TileSpec>, columns: Int = 4) {
    Column(Modifier.padding(vertical = 6.dp)) {
        if (title != null) SectionHeaderRow(title, "🧩")
        val rows = specs.chunked(columns)
        Column(Modifier.padding(horizontal = 16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            rows.forEach { row ->
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    row.forEach { spec ->
                        Surface(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(14.dp))
                                .clickable(onClick = spec.onClick),
                            color = MaterialTheme.colorScheme.surface,
                            tonalElevation = 1.dp,
                        ) {
                            Column(
                                Modifier.fillMaxWidth().padding(vertical = 12.dp),
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.spacedBy(6.dp),
                            ) {
                                Box(
                                    Modifier
                                        .size(32.dp)
                                        .clip(RoundedCornerShape(9.dp))
                                        .background(spec.tint.copy(alpha = 0.12f)),
                                    contentAlignment = Alignment.Center,
                                ) { Text(spec.emoji, style = MaterialTheme.typography.bodyMedium) }
                                Text(
                                    spec.title,
                                    style = MaterialTheme.typography.labelSmall,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis,
                                )
                            }
                        }
                    }
                    repeat(columns - row.size) { Spacer(Modifier.weight(1f)) }
                }
            }
        }
    }
}

@Composable
private fun SectionHeaderRow(title: String, emoji: String, subtitle: String? = null) {
    Row(
        Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Box(
            Modifier
                .size(30.dp)
                .clip(CircleShape)
                .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.12f)),
            contentAlignment = Alignment.Center,
        ) { Text(emoji, style = MaterialTheme.typography.labelLarge) }
        Column {
            Text(title, style = MaterialTheme.typography.titleLarge)
            if (subtitle != null) {
                Text(subtitle, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}

@Composable
private fun FaqSection(nav: HomeNav) {
    val questions = listOf(
        "How long does delivery take?",
        "What payment methods do you accept?",
        "Can I request a refund?",
        "Do you offer ongoing support?",
        "Can I customize a package?",
        "Is there a loyalty program?",
    )
    SectionBlock("Help Center", "❓", action = "Contact Support", onAction = { if (nav.onNative?.invoke("/help") != true) nav.onWeb("/help") }) {
        Column(Modifier.padding(horizontal = 16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            questions.forEach { q -> FaqItem(q) { if (nav.onNative?.invoke("/help") != true) nav.onWeb("/help") } }
            Text(
                "View all 27 answers →",
                modifier = Modifier.clip(RoundedCornerShape(8.dp)).clickable { if (nav.onNative?.invoke("/faq") != true) nav.onWeb("/faq") }.padding(8.dp),
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.primary,
            )
        }
    }
}

@Composable
private fun FaqItem(question: String, onClick: () -> Unit) {
    var expanded by rememberSaveable { mutableStateOf(false) }
    Surface(
        shape = RoundedCornerShape(12.dp),
        color = MaterialTheme.colorScheme.surface,
        tonalElevation = 1.dp,
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .clickable { onClick() },
    ) {
        Row(Modifier.padding(horizontal = 14.dp, vertical = 12.dp), verticalAlignment = Alignment.CenterVertically) {
            Text(question, style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f))
            Icon(
                Icons.Filled.ArrowDropDown,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
            )
        }
    }
}

@Composable
private fun NewsletterCard(nav: HomeNav) {
    var email by rememberSaveable { mutableStateOf("") }
    var subscribed by rememberSaveable { mutableStateOf<Boolean?>(null) }
    var sending by rememberSaveable { mutableStateOf(false) }
    val scope = androidx.compose.runtime.rememberCoroutineScope()
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        shape = RoundedCornerShape(18.dp),
        color = MaterialTheme.colorScheme.surface,
        tonalElevation = 1.dp,
    ) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text("📬  Stay in the Loop", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary)
            Text(
                "Get exclusive deals, new arrivals & 10% off your first order.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it; subscribed = null },
                    placeholder = { Text("Enter your email", style = MaterialTheme.typography.bodySmall) },
                    singleLine = true,
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(12.dp),
                )
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .clickable(enabled = email.contains("@") && !sending) {
                            scope.launch {
                                sending = true
                                subscribed = ApiClient.subscribeEmail(email.trim())
                                sending = false
                            }
                        },
                ) {
                    Icon(
                        Icons.Outlined.Send,
                        contentDescription = "Subscribe",
                        tint = MaterialTheme.colorScheme.onPrimary,
                        modifier = Modifier.padding(12.dp),
                    )
                }
            }
            subscribed?.let {
                Text(
                    if (it) "✅ You're in! Check your inbox." else "❌ Failed — try again",
                    style = MaterialTheme.typography.bodySmall,
                    color = if (it) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error,
                )
            }
        }
    }
}

@Composable
private fun RewardsCard(nav: HomeNav) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
            .clip(RoundedCornerShape(18.dp))
            .clickable { if (nav.onNative?.invoke("/rewards") != true) nav.onWeb("/rewards") },
        color = MaterialTheme.colorScheme.surface,
        tonalElevation = 1.dp,
    ) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Column {
                Text("🏅  Grapsee Rewards", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary)
                Text(
                    "Join & unlock exclusive benefits",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            Row(
                Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant)
                    .padding(12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                Text("🛡", style = MaterialTheme.typography.titleLarge)
                Column(Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text("Bronze Member", style = MaterialTheme.typography.titleSmall)
                        Surface(color = MaterialTheme.colorScheme.primary.copy(alpha = 0.1f), shape = RoundedCornerShape(6.dp)) {
                            Text(
                                "Starter",
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 1.dp),
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.primary,
                            )
                        }
                    }
                    Text("0 points", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf("🛡 Bronze", "⭐ Silver", "👑 Gold", "💎 Diamond").forEach { tier ->
                    Surface(color = MaterialTheme.colorScheme.surfaceVariant, shape = RoundedCornerShape(8.dp)) {
                        Text(
                            tier,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            style = MaterialTheme.typography.labelSmall,
                        )
                    }
                }
            }
            Surface(
                color = MaterialTheme.colorScheme.primary,
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)),
            ) {
                Text(
                    "🏆  Start Earning Points →",
                    modifier = Modifier.padding(vertical = 12.dp),
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.onPrimary,
                    fontWeight = FontWeight.Bold,
                )
            }
        }
    }
}

@Composable
private fun MallFooter(nav: HomeNav) {
    // Faithful port of web MallFooter link groups (routes stay in-app via WebView).
    val groups = listOf(
        "SHOP" to listOf("All Products" to "/category", "Featured" to "/category", "New Arrivals" to "/category", "Best Deals" to "/flash-sale"),
        "SERVICES" to listOf("Web Development" to "/services", "Mobile Apps" to "/services", "DevOps" to "/services", "UI/UX Design" to "/services"),
        "SUPPORT" to listOf("Help Center" to "/help", "Contact Us" to "/contact", "Privacy Policy" to "/privacy-policy", "Terms of Service" to "/terms-of-service"),
        "OUR PRODUCTS" to listOf("Anuxeve" to "/products/anuxeve", "GS Shop" to "/category", "Multi GS Agent" to "/products/multi-gs-agent", "GS Console" to "/products/gs-console"),
    )
    Surface(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
        shape = RoundedCornerShape(18.dp),
        color = MaterialTheme.colorScheme.surface,
        tonalElevation = 1.dp,
    ) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("🏬", style = MaterialTheme.typography.titleMedium)
                Text("Grapsee Mall", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            }
            groups.chunked(2).forEach { row ->
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    row.forEach { (heading, links) ->
                        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text(heading, style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                            links.forEach { (label, route) ->
                                Text(
                                    label,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.clip(RoundedCornerShape(6.dp)).clickable { if (nav.onNative?.invoke(route) != true) nav.onWeb(route) }.padding(vertical = 2.dp),
                                )
                            }
                        }
                    }
                    if (row.size == 1) Spacer(Modifier.weight(1f))
                }
            }
            Surface(
                color = MaterialTheme.colorScheme.surfaceVariant,
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).clickable { if (nav.onNative?.invoke("/category") != true) nav.onWeb("/category") },
            ) {
                Text(
                    "↑ Back to top",
                    modifier = Modifier.padding(vertical = 10.dp),
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}

@Composable
private fun ProductGrid(products: List<Product>, onProduct: (String) -> Unit) {
    val rows = products.chunked(2)
    Column(Modifier.padding(horizontal = 16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        rows.forEach { row ->
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                row.forEach { product ->
                    ProductCard(product, Modifier.weight(1f)) { onProduct(product.id) }
                }
                if (row.size == 1) Spacer(Modifier.weight(1f))
            }
        }
    }
}

@Composable
private fun HomeSkeleton() {
    val transition = rememberInfiniteTransition(label = "skeleton")
    val alpha by transition.animateFloat(
        initialValue = 0.4f,
        targetValue = 0.9f,
        animationSpec = infiniteRepeatable(tween(700), RepeatMode.Reverse),
        label = "alpha",
    )
    Column(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Box(
            Modifier
                .fillMaxWidth()
                .height(48.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = alpha)),
        )
        Box(
            Modifier
                .fillMaxWidth()
                .height(150.dp)
                .clip(RoundedCornerShape(20.dp))
                .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = alpha)),
        )
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            repeat(3) {
                Box(
                    Modifier
                        .weight(1f)
                        .height(40.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = alpha)),
                )
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            repeat(2) {
                Box(
                    Modifier
                        .weight(1f)
                        .height(220.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = alpha)),
                )
            }
        }
    }
}
