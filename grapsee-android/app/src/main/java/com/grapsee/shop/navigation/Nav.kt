package com.grapsee.shop.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material.icons.outlined.LocationOn
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material.icons.outlined.ShoppingCart
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.navArgument
import androidx.navigation.navDeepLink
import com.grapsee.shop.BuildConfig
import com.grapsee.shop.core.cart.CartStore
import com.grapsee.shop.core.network.ApiClient
import com.grapsee.shop.core.web.WebViewScreen
import com.grapsee.shop.features.auth.LoginScreen
import com.grapsee.shop.features.explore.ExploreScreen
import com.grapsee.shop.features.cart.CartScreen
import com.grapsee.shop.features.category.CategoryScreen
import com.grapsee.shop.features.home.HomeScreen
import com.grapsee.shop.features.list.ProductListScreen
import com.grapsee.shop.features.orders.OrderDetailScreen
import com.grapsee.shop.features.orders.OrdersScreen
import com.grapsee.shop.features.product.ProductScreen
import com.grapsee.shop.features.profile.ProfileScreen
import com.grapsee.shop.features.search.SearchScreen
import com.grapsee.shop.features.wishlist.WishlistScreen
import kotlinx.coroutines.launch

object Routes {
    const val HOME = "home"
    const val EXPLORE = "explore"
    const val SEARCH = "search"
    const val SEARCH_QUERY_PATTERN = "search/query/{query}"
    const val CART = "cart"
    const val ORDERS = "orders"
    const val PROFILE = "profile"
    const val LOGIN = "login"

    const val PRODUCT_PATTERN = "product/{productId}"
    const val CATEGORY_PATTERN = "category/{categoryId}?name={name}"
    const val LIST_PATTERN = "list/{mode}?title={title}"
    const val ORDER_PATTERN = "order/{orderId}"
    const val WEB_PATTERN = "web?url={url}"
    const val CHECKOUT = "checkout"
    const val WISHLIST = "wishlist"
    const val COLLECTIONS = "collections"
    const val COLLECTION_PATTERN = "collection/{collectionId}"
    const val BLOG = "blog"
    const val BLOG_POST_PATTERN = "blogpost/{slug}"
    const val BRANDS = "brands"
    const val REVIEWS = "reviews"
    const val COMMUNITY = "community"
    const val EVENTS = "events"
    const val FORUM = "forum"
    const val FORUM_TOPIC_PATTERN = "forumtopic/{topicId}"
    const val VIDEOS = "videos"
    const val VIDEO_PLAYER_PATTERN = "videoplayer?title={title}&url={url}&productId={productId}"
    const val QUIZ = "quiz"
    const val LIVE = "live"
    const val VOUCHER = "voucher"
    const val VIP = "vip"
    const val WALLET = "wallet"
    const val CHECKIN = "checkin"
    const val MYSTERY = "mystery"
    const val LOYALTY = "loyalty"
    const val GIFTCARDS = "giftcards"
    const val REFERRALS = "referrals"
    const val REWARDS = "rewards"
    const val TRACK = "track"
    const val RETURNS = "returns"
    const val SHIPPING = "shipping"
    const val INSTALLMENTS = "installments"
    const val TRADEIN = "tradein"
    const val TRY = "trybefore"
    const val OUTFIT = "outfit"
    const val RENTAL = "rental"
    const val DOWNLOADS = "downloads"
    const val GROUPBUY = "groupbuy"
    const val PRICEDROP = "pricedrop"
    const val GIFTWRAP = "giftwrap"
    const val CODEQUALITY = "codequality"
    const val STUDENT = "student"
    const val WARRANTY = "warranty"
    const val TECHLIB = "techlib"
    const val SELLER = "seller"
    const val OPENSOURCE = "opensource"
    const val SHIELD = "shield"
    const val DARKSTORE = "darkstore"
    const val LOYALTYCALC = "loyaltycalc"
    const val MINIGAMES = "minigames"
    const val TOPREVIEWERS = "topreviewers"
    const val NOTIFICATIONS = "notifications"
    const val HELP = "help"
    const val HELP_ARTICLE_PATTERN = "helparticle/{slug}"
    const val CONTACT = "contact"
    const val SITEMAP = "sitemap"
    const val SETTINGS = "settings"
    const val AFFILIATE = "affiliate"
    const val EMAILSUB = "emailsub"
    const val ALLCATEGORIES = "allcategories"
    const val STYLEGUIDE = "styleguide"
    const val ABOUT = "about"
    const val PRIVACY = "privacy"
    const val TERMS = "terms"
    const val FAQFULL = "faqfull"
    const val COMPARE = "compare"
    const val RECENTFULL = "recentfull"
    const val STORES = "stores"
    const val PRICEALERTS = "pricealerts"
    const val SUBSCRIPTIONS = "subscriptions"
    const val DIGITAL = "digital"
    const val DIGITAL_PATTERN = "digital/{kind}"
    const val CERTS = "certs"
    const val FEATURES = "features"
    const val EMI = "emi"
    const val CURRENCY = "currency"
    const val TIP = "tip"
    const val FUEL = "fuel"
    const val MEASURE = "measure"
    const val CARBON = "carbon"
    const val ROI = "roi"
    const val RESALE = "resale"
    const val INSTCOMPARE = "instcompare"
    const val TAXREFUND = "taxrefund"
    const val PRICELOCK = "pricelock"
    const val UNITPRICE = "unitprice"
    const val SMARTREORDER = "smartreorder"
    const val GIFTMATCHER = "giftmatcher"
    const val STYLEQUIZ = "stylequiz"
    const val ALLERGY = "allergy"
    const val HALAL = "halal"
    const val SUBMANAGER = "submanager"
    const val COLORADVISOR = "coloradvisor"
    const val SIZEPREDICTOR = "sizepredictor"
    const val DISCOUNTSTACK = "discountstack"
    const val DEALAUTH = "dealauth"
    const val SPECCOMPARE = "speccompare"
    const val SMSORDER = "smsorder"
    const val BODYTYPE = "bodytype"
    const val USECASEMATCHER = "usecasematcher"
    const val WARDROBE = "wardrobe"
    const val REVTOKENS = "revtokens"
    const val TRENDFORECASTER = "trendforecaster"
    const val EVENTSTYLIST = "eventstylist"
    const val SHOPAUTOCOMPLETE = "shopautocomplete"
    const val DOCEXPIRY = "docexpiry"
    const val VEHICLE = "vehicle"
    const val LEGALDOCS = "legaldocs"
    const val FORMBUILDER = "formbuilder"
    const val RESUMEBUILDER = "resumebuilder"
    const val INSURANCE = "insurance"
    const val AITOOLS = "aitools"
    const val AICHAT = "aichat"
    const val AUDITS = "audits"
    const val GUIDES = "guides"
    const val CICD = "cicd"
    const val ENVSETUP = "envsetup"
    const val DBSCHEMAS = "dbschemas"
    const val NOTION = "notion"
    const val TUTORIALS = "tutorials"

    fun product(id: String) = "product/$id"
    fun category(id: String, name: String) = "category/$id?name=${android.net.Uri.encode(name)}"
    fun list(mode: String, title: String) = "list/$mode?title=${android.net.Uri.encode(title)}"
    fun order(id: String) = "order/$id"
    fun digital(kind: String = "courses") = "digital/$kind"
    fun collections() = "collections"
    fun collection(id: String) = "collection/$id"
    fun blogPost(slug: String) = "blogpost/${android.net.Uri.encode(slug)}"
    fun forumTopic(id: String) = "forumtopic/$id"
    fun videoPlayer(title: String, url: String, productId: String) =
        "videoplayer?title=${android.net.Uri.encode(title)}&url=${android.net.Uri.encode(url)}&productId=${android.net.Uri.encode(productId)}"
    fun searchQuery(query: String) = "search/query/${android.net.Uri.encode(query)}"
    fun web(url: String) = "web?url=${android.net.Uri.encode(url)}"
}

private data class Tab(
    val route: String,
    val label: String,
    val icon: ImageVector,
    val selectedIcon: ImageVector,
)

// Mirrors the web app's bottom navigation: Home / Explore / Cart / Wishlist / Profile.
private val tabs = listOf(
    Tab(Routes.HOME, "Home", Icons.Outlined.Home, Icons.Filled.Home),
    Tab(Routes.EXPLORE, "Explore", Icons.Outlined.LocationOn, Icons.Filled.LocationOn),
    Tab(Routes.CART, "Cart", Icons.Outlined.ShoppingCart, Icons.Filled.ShoppingCart),
    Tab(Routes.WISHLIST, "Wishlist", Icons.Outlined.FavoriteBorder, Icons.Filled.Favorite),
    Tab(Routes.PROFILE, "Profile", Icons.Outlined.Person, Icons.Filled.Person),
)

private val bottomRoutes = setOf(Routes.HOME, Routes.EXPLORE, Routes.CART, Routes.WISHLIST, Routes.PROFILE)

@Composable
fun GrapseeAppRoot(navController: NavHostController) {
    LaunchedEffect(Unit) {
        ApiClient.refreshSession()
    }

    val backStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = backStackEntry?.destination?.route
    val cartCount by CartStore.count.collectAsState(initial = 0)

    Scaffold(
        bottomBar = {
            if (currentRoute in bottomRoutes) {
                NavigationBar {
                    tabs.forEach { tab ->
                        val selected = currentRoute == tab.route
                        NavigationBarItem(
                            selected = selected,
                            onClick = {
                                navController.navigate(tab.route) {
                                    popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon = {
                                if (tab.route == Routes.CART && cartCount > 0) {
                                    BadgedBox(badge = {
                                        Badge { Text(if (cartCount > 99) "99+" else cartCount.toString()) }
                                    }) {
                                        Icon(
                                            if (selected) tab.selectedIcon else tab.icon,
                                            contentDescription = tab.label,
                                        )
                                    }
                                } else {
                                    Icon(
                                        if (selected) tab.selectedIcon else tab.icon,
                                        contentDescription = tab.label,
                                    )
                                }
                            },
                            label = { Text(tab.label) },
                        )
                    }
                }
            }
        },
    ) { padding ->
        // Live-updater gate: new-version dialog + 0–100% download + installer.
        com.grapsee.shop.features.update.UpdateGate()
        // Content batch resolver: home/explore links land on native screens.
        fun resolveContent(route: String): Boolean {
            when {
                route == "/blog" -> navController.navigate(Routes.BLOG)
                route.startsWith("/blog/") -> navController.navigate(Routes.blogPost(route.removePrefix("/blog/")))
                route == "/brands" -> navController.navigate(Routes.BRANDS)
                route == "/reviews" -> navController.navigate(Routes.REVIEWS)
                route == "/community" -> navController.navigate(Routes.COMMUNITY)
                route == "/events" -> navController.navigate(Routes.EVENTS)
                route == "/forum" -> navController.navigate(Routes.FORUM)
                route.startsWith("/forum/") -> navController.navigate(Routes.forumTopic(route.removePrefix("/forum/")))
                route == "/product-videos" -> navController.navigate(Routes.VIDEOS)
                route == "/product-quiz" -> navController.navigate(Routes.QUIZ)
                route == "/live" -> navController.navigate(Routes.LIVE)
                route == "/voucher" -> navController.navigate(Routes.VOUCHER)
                route == "/vip" -> navController.navigate(Routes.VIP)
                route == "/wallet" -> navController.navigate(Routes.WALLET)
                route == "/daily-checkin" -> navController.navigate(Routes.CHECKIN)
                route == "/mystery-reward" -> navController.navigate(Routes.MYSTERY)
                route == "/loyalty" -> navController.navigate(Routes.LOYALTY)
                route == "/gift-cards" -> navController.navigate(Routes.GIFTCARDS)
                route == "/referrals" -> navController.navigate(Routes.REFERRALS)
                route == "/rewards" -> navController.navigate(Routes.REWARDS)
                route == "/track" -> navController.navigate(Routes.TRACK)
                route == "/returns" -> navController.navigate(Routes.RETURNS)
                route == "/shipping-calculator" -> navController.navigate(Routes.SHIPPING)
                route == "/installment" -> navController.navigate(Routes.INSTALLMENTS)
                route == "/trade-in" -> navController.navigate(Routes.TRADEIN)
                route == "/try-before-buy" -> navController.navigate(Routes.TRY)
                route == "/outfit-maker" -> navController.navigate(Routes.OUTFIT)
                route == "/rental" -> navController.navigate(Routes.RENTAL)
                route == "/digital-downloads" -> navController.navigate(Routes.DOWNLOADS)
                route == "/group-buy" -> navController.navigate(Routes.GROUPBUY)
                route == "/price-drop" -> navController.navigate(Routes.PRICEDROP)
                route == "/gift-wrapping" -> navController.navigate(Routes.GIFTWRAP)
                route == "/code-quality" -> navController.navigate(Routes.CODEQUALITY)
                route == "/student-discount" -> navController.navigate(Routes.STUDENT)
                route == "/warranty-center" -> navController.navigate(Routes.WARRANTY)
                route == "/tech-library" -> navController.navigate(Routes.TECHLIB)
                route == "/seller-center" -> navController.navigate(Routes.SELLER)
                route == "/open-source" -> navController.navigate(Routes.OPENSOURCE)
                route == "/delivery-protection" -> navController.navigate(Routes.SHIELD)
                route == "/dark-store" -> navController.navigate(Routes.DARKSTORE)
                route == "/loyalty-calculator" -> navController.navigate(Routes.LOYALTYCALC)
                route == "/mini-games" -> navController.navigate(Routes.MINIGAMES)
                route == "/review-megaphone" -> navController.navigate(Routes.TOPREVIEWERS)
                route == "/notifications" -> navController.navigate(Routes.NOTIFICATIONS)
                route == "/help" -> navController.navigate(Routes.HELP)
                route.startsWith("/help/") -> navController.navigate("helparticle/${route.removePrefix("/help/")}")
                route.startsWith("/templates/") -> navController.navigate(Routes.digital("templates"))
                route == "/contact" -> navController.navigate(Routes.CONTACT)
                route == "/sitemap" -> navController.navigate(Routes.SITEMAP)
                route == "/settings" -> navController.navigate(Routes.SETTINGS)
                route == "/affiliate" -> navController.navigate(Routes.AFFILIATE)
                route == "/email-subscribe" -> navController.navigate(Routes.EMAILSUB)
                route == "/cart" -> navController.navigate(Routes.CART)
                route == "/checkout" || route.startsWith("/checkout/") -> navController.navigate(Routes.CHECKOUT)
                route.startsWith("/order-success") -> navController.navigate(Routes.ORDERS)
                route == "/category" -> navController.navigate(Routes.ALLCATEGORIES)
                route == "/orders" -> navController.navigate(Routes.ORDERS)
                route == "/style-guide" -> navController.navigate(Routes.STYLEGUIDE)
                route == "/about" -> navController.navigate(Routes.ABOUT)
                route == "/privacy" || route == "/privacy-policy" -> navController.navigate(Routes.PRIVACY)
                route == "/terms" || route == "/terms-of-service" -> navController.navigate(Routes.TERMS)
                route == "/faq" -> navController.navigate(Routes.FAQFULL)
                route == "/compare" -> navController.navigate(Routes.COMPARE)
                route == "/recently-viewed" -> navController.navigate(Routes.RECENTFULL)
                route == "/stores" -> navController.navigate(Routes.STORES)
                route == "/price-alerts" -> navController.navigate(Routes.PRICEALERTS)
                route == "/subscriptions" -> navController.navigate(Routes.SUBSCRIPTIONS)
                route == "/digital" -> navController.navigate(Routes.digital())
                route == "/courses" -> navController.navigate(Routes.digital("courses"))
                route == "/templates" -> navController.navigate(Routes.digital("templates"))
                route == "/ui-kits" -> navController.navigate(Routes.digital("ui-kits"))
                route == "/snippets" -> navController.navigate(Routes.digital("snippets"))
                route == "/loyalty-tiers" -> navController.navigate(Routes.LOYALTY)
                route == "/referral-system" -> navController.navigate(Routes.REFERRALS)
                route == "/subscriptions" -> navController.navigate(Routes.SUBSCRIPTIONS)
                route == "/certifications" -> navController.navigate(Routes.CERTS)
                route == "/features" -> navController.navigate(Routes.FEATURES)
                route == "/emi-calculator" -> navController.navigate(Routes.EMI)
                route == "/currency-converter" -> navController.navigate(Routes.CURRENCY)
                route == "/tip-calculator" -> navController.navigate(Routes.TIP)
                route == "/fuel-cost-calculator" -> navController.navigate(Routes.FUEL)
                route == "/measurement-converter" -> navController.navigate(Routes.MEASURE)
                route == "/carbon-calculator" -> navController.navigate(Routes.CARBON)
                route == "/roi-calculator" -> navController.navigate(Routes.ROI)
                route == "/resale-calculator" -> navController.navigate(Routes.RESALE)
                route == "/installment-compare" -> navController.navigate(Routes.INSTCOMPARE)
                route == "/tax-refund" -> navController.navigate(Routes.TAXREFUND)
                route == "/price-lock" -> navController.navigate(Routes.PRICELOCK)
                route == "/unit-price-calculator" -> navController.navigate(Routes.UNITPRICE)
                route == "/smart-reorder" -> navController.navigate(Routes.SMARTREORDER)
                route == "/gift-matcher" -> navController.navigate(Routes.GIFTMATCHER)
                route == "/style-quiz" -> navController.navigate(Routes.STYLEQUIZ)
                route == "/allergy-checker" -> navController.navigate(Routes.ALLERGY)
                route == "/halal-checker" -> navController.navigate(Routes.HALAL)
                route == "/subscription-manager" -> navController.navigate(Routes.SUBMANAGER)
                route == "/color-advisor" -> navController.navigate(Routes.COLORADVISOR)
                route == "/size-predictor" -> navController.navigate(Routes.SIZEPREDICTOR)
                route == "/discount-stacking" -> navController.navigate(Routes.DISCOUNTSTACK)
                route == "/deal-authenticity" -> navController.navigate(Routes.DEALAUTH)
                route == "/spec-compare" -> navController.navigate(Routes.SPECCOMPARE)
                route == "/sms-order" -> navController.navigate(Routes.SMSORDER)
                route == "/body-type" -> navController.navigate(Routes.BODYTYPE)
                route == "/use-case-matcher" -> navController.navigate(Routes.USECASEMATCHER)
                route == "/wardrobe-planner" -> navController.navigate(Routes.WARDROBE)
                route == "/revision-tokens" -> navController.navigate(Routes.REVTOKENS)
                route == "/trend-forecaster" -> navController.navigate(Routes.TRENDFORECASTER)
                route == "/event-stylist" -> navController.navigate(Routes.EVENTSTYLIST)
                route == "/shopping-list-autocomplete" -> navController.navigate(Routes.SHOPAUTOCOMPLETE)
                route == "/document-expiry" -> navController.navigate(Routes.DOCEXPIRY)
                route == "/vehicle-service" -> navController.navigate(Routes.VEHICLE)
                route == "/legal-documents" -> navController.navigate(Routes.LEGALDOCS)
                route == "/form-builder" -> navController.navigate(Routes.FORMBUILDER)
                route == "/resume-builder" -> navController.navigate(Routes.RESUMEBUILDER)
                route == "/insurance-claim" -> navController.navigate(Routes.INSURANCE)
                route == "/ai-tools" -> navController.navigate(Routes.AITOOLS)
                route == "/ai-chatbot" -> navController.navigate(Routes.AICHAT)
                route == "/audits" -> navController.navigate(Routes.AUDITS)
                route == "/guides" -> navController.navigate(Routes.GUIDES)
                route == "/cicd" -> navController.navigate(Routes.CICD)
                route == "/env-setup" -> navController.navigate(Routes.ENVSETUP)
                route == "/database-schemas" -> navController.navigate(Routes.DBSCHEMAS)
                route == "/notion-templates" -> navController.navigate(Routes.NOTION)
                route == "/short-tutorials" -> navController.navigate(Routes.TUTORIALS)
                else -> return false
            }
            return true
        }
        val heroNav = com.grapsee.shop.features.home.HomeNav(
            onProduct = { navController.navigate(Routes.product(it)) },
            onCategory = { id, name -> navController.navigate(Routes.category(id, name)) },
            onSearch = { navController.navigate(Routes.SEARCH) },
            onList = { mode, title -> navController.navigate(Routes.list(mode, title)) },
            onWeb = { navController.navigate(Routes.web(it)) },
            onCollections = { navController.navigate(Routes.collections()) },
            onCollection = { navController.navigate(Routes.collection(it)) },
            onSearchQuery = { navController.navigate(Routes.searchQuery(it)) },
            onCart = { navController.navigate(Routes.CART) },
            onWishlist = { navController.navigate(Routes.WISHLIST) },
            onNative = ::resolveContent,
        )
        androidx.compose.runtime.CompositionLocalProvider(
            com.grapsee.shop.features.home.LocalHeroNav provides heroNav,
        ) {
        NavHost(
            navController = navController,
            startDestination = Routes.HOME,
            modifier = Modifier.padding(padding),
        ) {
            composable(Routes.HOME) {
                HomeScreen(
                    onProduct = { navController.navigate(Routes.product(it)) },
                    onCategory = { id, name -> navController.navigate(Routes.category(id, name)) },
                    onSearch = { navController.navigate(Routes.SEARCH) },
                    onList = { mode, title -> navController.navigate(Routes.list(mode, title)) },
                    onWeb = { navController.navigate(Routes.web(it)) },
                    onCollections = { navController.navigate(Routes.collections()) },
                    onCollection = { navController.navigate(Routes.collection(it)) },
                    onSearchQuery = { navController.navigate(Routes.searchQuery(it)) },
                    onCart = { navController.navigate(Routes.CART) },
                    onWishlist = { navController.navigate(Routes.WISHLIST) },
                    onNative = ::resolveContent,
                )
            }

            composable(Routes.EXPLORE) {
                ExploreScreen(
                    onCategory = { id, name -> navController.navigate(Routes.category(id, name)) },
                    onWeb = { navController.navigate(Routes.web(it)) },
                    onList = { mode, title -> navController.navigate(Routes.list(mode, title)) },
                    onCollections = { navController.navigate(Routes.collections()) },
                    onWishlist = { navController.navigate(Routes.WISHLIST) },
                    onNative = ::resolveContent,
                )
            }

            composable(Routes.SEARCH) {
                SearchScreen(onProduct = { navController.navigate(Routes.product(it)) })
            }

            composable(
                Routes.SEARCH_QUERY_PATTERN,
                arguments = listOf(navArgument("query") { type = NavType.StringType; defaultValue = "" }),
            ) { entry ->
                SearchScreen(
                    onProduct = { navController.navigate(Routes.product(it)) },
                    initialQuery = entry.arguments?.getString("query").orEmpty(),
                )
            }

            composable(Routes.CART) {
                CartScreen(
                    onProduct = { navController.navigate(Routes.product(it)) },
                    onCheckout = { navController.navigate(Routes.CHECKOUT) },
                    onLogin = { navController.navigate(Routes.LOGIN) },
                )
            }

            composable(Routes.ORDERS) {
                OrdersScreen(
                    onProduct = { navController.navigate(Routes.product(it)) },
                    onOrder = { navController.navigate(Routes.order(it)) },
                    onLogin = { navController.navigate(Routes.LOGIN) },
                )
            }

            composable(Routes.WISHLIST) {
                WishlistScreen(onProduct = { navController.navigate(Routes.product(it)) })
            }

            composable(Routes.PROFILE) {
                ProfileScreen(
                    onLogin = { navController.navigate(Routes.LOGIN) },
                    onWeb = { navController.navigate(Routes.web(it)) },
                    onOrders = {
                        navController.navigate(Routes.ORDERS) {
                            popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    },
                    onWishlist = { navController.navigate(Routes.WISHLIST) },
                    onList = { mode, title -> navController.navigate(Routes.list(mode, title)) },
                )
            }

            composable(Routes.LOGIN) {
                LoginScreen(onDone = { navController.popBackStack() })
            }

            composable(
                Routes.PRODUCT_PATTERN,
                arguments = listOf(navArgument("productId") { type = NavType.StringType }),
                deepLinks = listOf(
                    navDeepLink { uriPattern = "grapsee://product/{productId}" },
                    navDeepLink { uriPattern = "${BuildConfig.WEB_BASE_URL}/product/{productId}" },
                ),
            ) { entry ->
                ProductScreen(
                    productId = entry.arguments?.getString("productId").orEmpty(),
                    onBack = { navController.popBackStack() },
                    onProduct = { navController.navigate(Routes.product(it)) },
                    onCategory = { id, name -> navController.navigate(Routes.category(id, name)) },
                    onRelated = { navController.navigate(Routes.product(it)) },
                )
            }

            composable(
                Routes.CATEGORY_PATTERN,
                arguments = listOf(
                    navArgument("categoryId") { type = NavType.StringType },
                    navArgument("name") { type = NavType.StringType; defaultValue = "" },
                ),
                deepLinks = listOf(
                    navDeepLink { uriPattern = "grapsee://category/{categoryId}" },
                    navDeepLink { uriPattern = "${BuildConfig.WEB_BASE_URL}/category/{categoryId}" },
                ),
            ) { entry ->
                CategoryScreen(
                    categoryId = entry.arguments?.getString("categoryId").orEmpty(),
                    categoryName = entry.arguments?.getString("name").orEmpty(),
                    onBack = { navController.popBackStack() },
                    onProduct = { navController.navigate(Routes.product(it)) },
                )
            }

            composable(
                Routes.LIST_PATTERN,
                arguments = listOf(
                    navArgument("mode") { type = NavType.StringType },
                    navArgument("title") { type = NavType.StringType; defaultValue = "" },
                ),
            ) { entry ->
                ProductListScreen(
                    mode = entry.arguments?.getString("mode").orEmpty(),
                    title = entry.arguments?.getString("title").orEmpty(),
                    onBack = { navController.popBackStack() },
                    onProduct = { navController.navigate(Routes.product(it)) },
                )
            }

            composable(
                Routes.ORDER_PATTERN,
                arguments = listOf(navArgument("orderId") { type = NavType.StringType }),
            ) { entry ->
                OrderDetailScreen(
                    orderId = entry.arguments?.getString("orderId").orEmpty(),
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.COLLECTIONS) {
                com.grapsee.shop.features.commerce.CollectionsScreen(
                    onBack = { navController.popBackStack() },
                    onCollection = { navController.navigate(Routes.collection(it)) },
                )
            }

            composable(
                Routes.COLLECTION_PATTERN,
                arguments = listOf(navArgument("collectionId") { type = NavType.StringType }),
            ) { entry ->
                com.grapsee.shop.features.commerce.CollectionDetailScreen(
                    collectionId = entry.arguments?.getString("collectionId").orEmpty(),
                    onBack = { navController.popBackStack() },
                    onProduct = { navController.navigate(Routes.product(it)) },
                )
            }

            // Content batch destinations (all native).
            composable(Routes.BLOG) {
                com.grapsee.shop.features.content.BlogScreen(
                    onBack = { navController.popBackStack() },
                    onPost = { navController.navigate(Routes.blogPost(it)) },
                )
            }

            composable(
                Routes.BLOG_POST_PATTERN,
                arguments = listOf(navArgument("slug") { type = NavType.StringType }),
            ) { entry ->
                com.grapsee.shop.features.content.BlogPostScreen(
                    slug = entry.arguments?.getString("slug").orEmpty(),
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.BRANDS) {
                com.grapsee.shop.features.content.BrandsScreen(
                    onBack = { navController.popBackStack() },
                    onBrand = { name -> navController.navigate(Routes.list("brand:$name", name)) },
                )
            }

            composable(Routes.REVIEWS) {
                com.grapsee.shop.features.content.ReviewsScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.COMMUNITY) {
                com.grapsee.shop.features.content.CommunityScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.EVENTS) {
                com.grapsee.shop.features.content.EventsScreen(
                    onBack = { navController.popBackStack() },
                    onEvent = { navController.navigate(Routes.web("/events/$it")) },
                )
            }

            composable(Routes.FORUM) {
                com.grapsee.shop.features.content.ForumScreen(
                    onBack = { navController.popBackStack() },
                    onTopic = { navController.navigate(Routes.forumTopic(it)) },
                )
            }

            composable(
                Routes.FORUM_TOPIC_PATTERN,
                arguments = listOf(navArgument("topicId") { type = NavType.StringType }),
            ) { entry ->
                com.grapsee.shop.features.content.ForumTopicScreen(
                    topicId = entry.arguments?.getString("topicId").orEmpty(),
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.VIDEOS) {
                com.grapsee.shop.features.content.VideosScreen(
                    onBack = { navController.popBackStack() },
                    onVideo = { video ->
                        navController.navigate(Routes.videoPlayer(video.displayTitle, video.playUrl.orEmpty(), video.productId.orEmpty()))
                    },
                )
            }

            composable(
                Routes.VIDEO_PLAYER_PATTERN,
                arguments = listOf(
                    navArgument("title") { type = NavType.StringType; defaultValue = "" },
                    navArgument("url") { type = NavType.StringType; defaultValue = "" },
                    navArgument("productId") { type = NavType.StringType; defaultValue = "" },
                ),
            ) { entry ->
                com.grapsee.shop.features.content.VideoPlayerScreen(
                    video = com.grapsee.shop.core.network.ProductVideoDto(
                        id = entry.arguments?.getString("url").orEmpty(),
                        title = entry.arguments?.getString("title").orEmpty(),
                        videoUrl = entry.arguments?.getString("url"),
                        productId = entry.arguments?.getString("productId")?.ifEmpty { null },
                    ),
                    onBack = { navController.popBackStack() },
                    onProduct = { navController.navigate(Routes.product(it)) },
                )
            }

            composable(Routes.QUIZ) {
                com.grapsee.shop.features.content.QuizScreen(
                    onBack = { navController.popBackStack() },
                    onProduct = { navController.navigate(Routes.product(it)) },
                )
            }

            composable(Routes.LIVE) {
                com.grapsee.shop.features.content.LiveScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            // Rewards batch destinations (all native).
            composable(Routes.VOUCHER) {
                com.grapsee.shop.features.rewards.VoucherScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.VIP) {
                com.grapsee.shop.features.rewards.VipScreen(
                    onBack = { navController.popBackStack() },
                    onLogin = { navController.navigate(Routes.LOGIN) },
                )
            }

            composable(Routes.WALLET) {
                com.grapsee.shop.features.rewards.WalletScreen(
                    onBack = { navController.popBackStack() },
                    onLogin = { navController.navigate(Routes.LOGIN) },
                )
            }

            composable(Routes.CHECKIN) {
                com.grapsee.shop.features.rewards.CheckinScreen(
                    onBack = { navController.popBackStack() },
                    onLogin = { navController.navigate(Routes.LOGIN) },
                )
            }

            composable(Routes.MYSTERY) {
                com.grapsee.shop.features.rewards.MysteryScreen(
                    onBack = { navController.popBackStack() },
                    onLogin = { navController.navigate(Routes.LOGIN) },
                )
            }

            composable(Routes.LOYALTY) {
                com.grapsee.shop.features.rewards.LoyaltyScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.GIFTCARDS) {
                com.grapsee.shop.features.rewards.GiftCardsScreen(
                    onBack = { navController.popBackStack() },
                    onLogin = { navController.navigate(Routes.LOGIN) },
                )
            }

            composable(Routes.REFERRALS) {
                com.grapsee.shop.features.rewards.ReferralsScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.REWARDS) {
                com.grapsee.shop.features.rewards.RewardsScreenFull(
                    onBack = { navController.popBackStack() },
                    onLogin = { navController.navigate(Routes.LOGIN) },
                    onTiers = { navController.navigate(Routes.LOYALTY) },
                )
            }

            // Orders batch destinations (all native).
            composable(Routes.TRACK) {
                com.grapsee.shop.features.ordertools.TrackScreen(
                    onBack = { navController.popBackStack() },
                    onOrder = { navController.navigate(Routes.order(it)) },
                )
            }

            composable(Routes.RETURNS) {
                com.grapsee.shop.features.ordertools.ReturnsScreen(
                    onBack = { navController.popBackStack() },
                    onLogin = { navController.navigate(Routes.LOGIN) },
                )
            }

            composable(Routes.SHIPPING) {
                com.grapsee.shop.features.ordertools.ShippingScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.INSTALLMENTS) {
                com.grapsee.shop.features.ordertools.InstallmentsScreen(
                    onBack = { navController.popBackStack() },
                    onLogin = { navController.navigate(Routes.LOGIN) },
                )
            }

            composable(Routes.TRADEIN) {
                com.grapsee.shop.features.ordertools.TradeInScreen(
                    onBack = { navController.popBackStack() },
                    onProduct = { navController.navigate(Routes.product(it)) },
                )
            }

            composable(Routes.TRY) {
                com.grapsee.shop.features.ordertools.TryScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.OUTFIT) {
                com.grapsee.shop.features.ordertools.OutfitMakerScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.RENTAL) {
                com.grapsee.shop.features.ordertools.RentalScreen(
                    onBack = { navController.popBackStack() },
                    onProduct = { navController.navigate(Routes.product(it)) },
                    onLogin = { navController.navigate(Routes.LOGIN) },
                )
            }

            composable(Routes.DOWNLOADS) {
                com.grapsee.shop.features.ordertools.DownloadsScreen(
                    onBack = { navController.popBackStack() },
                    onProduct = { navController.navigate(Routes.product(it)) },
                )
            }

            composable(Routes.GROUPBUY) {
                com.grapsee.shop.features.ordertools.GroupBuyScreen(
                    onBack = { navController.popBackStack() },
                    onProduct = { navController.navigate(Routes.product(it)) },
                )
            }

            composable(Routes.PRICEDROP) {
                com.grapsee.shop.features.ordertools.PriceDropScreen(
                    onBack = { navController.popBackStack() },
                    onProduct = { navController.navigate(Routes.product(it)) },
                )
            }

            // Services batch destinations (all native).
            composable(Routes.GIFTWRAP) {
                com.grapsee.shop.features.services.GiftWrapScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.CODEQUALITY) {
                com.grapsee.shop.features.services.CodeQualityScreen(
                    onBack = { navController.popBackStack() },
                    onLogin = { navController.navigate(Routes.LOGIN) },
                )
            }

            composable(Routes.STUDENT) {
                com.grapsee.shop.features.services.StudentScreen(
                    onBack = { navController.popBackStack() },
                    onLogin = { navController.navigate(Routes.LOGIN) },
                )
            }

            composable(Routes.WARRANTY) {
                com.grapsee.shop.features.services.WarrantyScreen(
                    onBack = { navController.popBackStack() },
                    onContact = { navController.navigate(Routes.CONTACT) },
                )
            }

            composable(Routes.TECHLIB) {
                com.grapsee.shop.features.services.TechLibraryScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.SELLER) {
                com.grapsee.shop.features.services.SellerScreen(
                    onBack = { navController.popBackStack() },
                    onLogin = { navController.navigate(Routes.LOGIN) },
                )
            }

            composable(Routes.OPENSOURCE) {
                com.grapsee.shop.features.services.OpenSourceScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.SHIELD) {
                com.grapsee.shop.features.services.DeliveryShieldScreen(
                    onBack = { navController.popBackStack() },
                    onLogin = { navController.navigate(Routes.LOGIN) },
                )
            }

            composable(Routes.DARKSTORE) {
                com.grapsee.shop.features.services.DarkStoreScreen(
                    onBack = { navController.popBackStack() },
                    onProduct = { navController.navigate(Routes.product(it)) },
                )
            }

            composable(Routes.LOYALTYCALC) {
                com.grapsee.shop.features.services.LoyaltyCalcScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.MINIGAMES) {
                com.grapsee.shop.features.services.MiniGamesScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.TOPREVIEWERS) {
                com.grapsee.shop.features.services.TopReviewersScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            // Account batch destinations (all native).
            composable(Routes.NOTIFICATIONS) {
                com.grapsee.shop.features.account.NotificationsScreen(
                    onBack = { navController.popBackStack() },
                    onLogin = { navController.navigate(Routes.LOGIN) },
                    onOpen = { route ->
                        if (!resolveContent(route)) navController.navigate(Routes.web(route))
                    },
                )
            }

            composable(Routes.HELP) {
                com.grapsee.shop.features.account.HelpScreen(
                    onBack = { navController.popBackStack() },
                    onArticle = { navController.navigate("helparticle/$it") },
                    onContact = { navController.navigate(Routes.CONTACT) },
                )
            }

            composable(
                Routes.HELP_ARTICLE_PATTERN,
                arguments = listOf(navArgument("slug") { type = NavType.StringType }),
            ) { entry ->
                com.grapsee.shop.features.account.HelpArticleScreen(
                    slug = entry.arguments?.getString("slug").orEmpty(),
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.CONTACT) {
                com.grapsee.shop.features.account.ContactScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.SITEMAP) {
                com.grapsee.shop.features.account.SitemapScreen(
                    onBack = { navController.popBackStack() },
                    onRoute = { route ->
                        if (!resolveContent(route)) navController.navigate(Routes.web(route))
                    },
                )
            }

            composable(Routes.SETTINGS) {
                val settingsScope = androidx.compose.runtime.rememberCoroutineScope()
                com.grapsee.shop.features.account.SettingsScreen(
                    onBack = { navController.popBackStack() },
                    onLogin = { navController.navigate(Routes.LOGIN) },
                    onSignOut = {
                        settingsScope.launch {
                            com.grapsee.shop.core.network.ApiClient.logout()
                            navController.navigate(Routes.LOGIN) {
                                popUpTo(Routes.HOME) { inclusive = false }
                            }
                        }
                    },
                    appVersion = com.grapsee.shop.BuildConfig.VERSION_NAME,
                )
            }

            composable(Routes.AFFILIATE) {
                com.grapsee.shop.features.account.AffiliateScreen(
                    onBack = { navController.popBackStack() },
                    onLogin = { navController.navigate(Routes.LOGIN) },
                    onReferrals = { navController.navigate(Routes.REFERRALS) },
                )
            }

            composable(Routes.EMAILSUB) {
                com.grapsee.shop.features.account.EmailSubscribeScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.STYLEGUIDE) {
                com.grapsee.shop.features.services.StyleGuideScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.ALLCATEGORIES) {
                com.grapsee.shop.features.commerce.AllCategoriesScreen(
                    onBack = { navController.popBackStack() },
                    onCategory = { id, name -> navController.navigate(Routes.category(id, name)) },
                )
            }

            // Info batch destinations (all native).
            composable(Routes.ABOUT) {
                com.grapsee.shop.features.info.AboutScreen(
                    onBack = { navController.popBackStack() },
                    onShop = { navController.navigate(Routes.collections()) },
                )
            }

            composable(Routes.PRIVACY) {
                com.grapsee.shop.features.info.PrivacyScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.TERMS) {
                com.grapsee.shop.features.info.TermsScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.FAQFULL) {
                com.grapsee.shop.features.info.FaqFullScreen(
                    onBack = { navController.popBackStack() },
                    onContact = { navController.navigate(Routes.CONTACT) },
                )
            }

            composable(Routes.COMPARE) {
                com.grapsee.shop.features.info.CompareScreen(
                    onBack = { navController.popBackStack() },
                    onProduct = { navController.navigate(Routes.product(it)) },
                    onCart = { navController.navigate(Routes.CART) },
                )
            }

            composable(Routes.RECENTFULL) {
                com.grapsee.shop.features.info.RecentlyViewedFullScreen(
                    onBack = { navController.popBackStack() },
                    onProduct = { navController.navigate(Routes.product(it)) },
                    onBrowse = { navController.navigate(Routes.SEARCH) },
                )
            }

            composable(Routes.STORES) {
                com.grapsee.shop.features.info.StoresScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.PRICEALERTS) {
                com.grapsee.shop.features.info.PriceAlertsScreen(
                    onBack = { navController.popBackStack() },
                    onLogin = { navController.navigate(Routes.LOGIN) },
                )
            }

            composable(Routes.SUBSCRIPTIONS) {
                com.grapsee.shop.features.info.SubscriptionsScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.DIGITAL) {
                com.grapsee.shop.features.info.DigitalHubScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(
                Routes.DIGITAL_PATTERN,
                arguments = listOf(navArgument("kind") { type = NavType.StringType; defaultValue = "courses" }),
            ) { entry ->
                com.grapsee.shop.features.info.DigitalHubScreen(
                    onBack = { navController.popBackStack() },
                    initialKind = entry.arguments?.getString("kind").orEmpty().ifEmpty { "courses" },
                )
            }

            composable(Routes.CERTS) {
                com.grapsee.shop.features.info.CertificationsScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.FEATURES) {
                com.grapsee.shop.features.info.FeaturesDirectoryScreen(
                    onBack = { navController.popBackStack() },
                    onRoute = { route ->
                        if (!resolveContent(route)) navController.navigate(Routes.web(route))
                    },
                )
            }

            composable(Routes.EMI) {
                com.grapsee.shop.features.info.EmiScreen(onBack = { navController.popBackStack() })
            }

            composable(Routes.CURRENCY) {
                com.grapsee.shop.features.info.CurrencyScreen(onBack = { navController.popBackStack() })
            }

            composable(Routes.TIP) {
                com.grapsee.shop.features.info.TipScreen(onBack = { navController.popBackStack() })
            }

            composable(Routes.FUEL) {
                com.grapsee.shop.features.info.FuelScreen(onBack = { navController.popBackStack() })
            }

            composable(Routes.MEASURE) {
                com.grapsee.shop.features.info.MeasureScreen(onBack = { navController.popBackStack() })
            }

            composable(Routes.CARBON) {
                com.grapsee.shop.features.info.CarbonScreen(onBack = { navController.popBackStack() })
            }

            composable(Routes.ROI) {
                com.grapsee.shop.features.info.RoiScreen(onBack = { navController.popBackStack() })
            }

            composable(Routes.RESALE) {
                com.grapsee.shop.features.info.ResaleScreen(onBack = { navController.popBackStack() })
            }

            composable(Routes.INSTCOMPARE) {
                com.grapsee.shop.features.info.InstallmentCompareScreen(onBack = { navController.popBackStack() })
            }

            // Tools wave-2 destinations (all native).
            composable(Routes.TAXREFUND) {
                com.grapsee.shop.features.tools.TaxRefundScreen(
                    onBack = { navController.popBackStack() },
                    onLogin = { navController.navigate(Routes.LOGIN) },
                )
            }

            composable(Routes.PRICELOCK) {
                com.grapsee.shop.features.tools.PriceLockScreen(
                    onBack = { navController.popBackStack() },
                    onLogin = { navController.navigate(Routes.LOGIN) },
                )
            }

            composable(Routes.UNITPRICE) {
                com.grapsee.shop.features.tools.UnitPriceScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.SMARTREORDER) {
                com.grapsee.shop.features.tools.SmartReorderScreen(
                    onBack = { navController.popBackStack() },
                    onLogin = { navController.navigate(Routes.LOGIN) },
                    onOrders = { navController.navigate(Routes.ORDERS) },
                )
            }

            composable(Routes.GIFTMATCHER) {
                com.grapsee.shop.features.tools.GiftMatcherScreen(
                    onBack = { navController.popBackStack() },
                    onSearch = { query -> navController.navigate(Routes.list("search:$query", "Gift ideas")) },
                )
            }

            composable(Routes.STYLEQUIZ) {
                com.grapsee.shop.features.tools.StyleQuizScreen(
                    onBack = { navController.popBackStack() },
                    onOutfits = { navController.navigate(Routes.OUTFIT) },
                )
            }

            composable(Routes.ALLERGY) {
                com.grapsee.shop.features.tools.AllergyScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.HALAL) {
                com.grapsee.shop.features.tools.HalalScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            // Tools wave-3 destinations (all native).
            composable(Routes.SUBMANAGER) {
                com.grapsee.shop.features.tools.SubManagerScreen(
                    onBack = { navController.popBackStack() },
                    onLogin = { navController.navigate(Routes.LOGIN) },
                )
            }

            composable(Routes.COLORADVISOR) {
                com.grapsee.shop.features.tools.ColorAdvisorScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.SIZEPREDICTOR) {
                com.grapsee.shop.features.tools.SizePredictorScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.DISCOUNTSTACK) {
                com.grapsee.shop.features.tools.DiscountStackScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.DEALAUTH) {
                com.grapsee.shop.features.tools.DealAuthScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.SPECCOMPARE) {
                com.grapsee.shop.features.tools.SpecCompareScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            // Tools wave-4 destinations (all native).
            composable(Routes.BODYTYPE) {
                com.grapsee.shop.features.tools.BodyTypeScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.USECASEMATCHER) {
                com.grapsee.shop.features.tools.UseCaseMatcherScreen(
                    onBack = { navController.popBackStack() },
                    onSearch = { query -> navController.navigate(Routes.list("search:$query", "Matches")) },
                )
            }

            composable(Routes.WARDROBE) {
                com.grapsee.shop.features.tools.WardrobePlannerScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.REVTOKENS) {
                com.grapsee.shop.features.tools.RevisionTokensScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.TRENDFORECASTER) {
                com.grapsee.shop.features.tools.TrendForecasterScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.EVENTSTYLIST) {
                com.grapsee.shop.features.tools.EventStylistScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.SMSORDER) {
                com.grapsee.shop.features.tools.SmsOrderScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.SHOPAUTOCOMPLETE) {
                com.grapsee.shop.features.tools.ShopAutocompleteScreen(
                    onBack = { navController.popBackStack() },
                    onSearch = { query -> navController.navigate(Routes.list("search:$query", query)) },
                )
            }

            composable(Routes.DOCEXPIRY) {
                com.grapsee.shop.features.tools.DocExpiryScreen(
                    onBack = { navController.popBackStack() },
                    onLogin = { navController.navigate(Routes.LOGIN) },
                )
            }

            composable(Routes.VEHICLE) {
                com.grapsee.shop.features.tools.VehicleScreen(
                    onBack = { navController.popBackStack() },
                    onLogin = { navController.navigate(Routes.LOGIN) },
                )
            }

            composable(Routes.LEGALDOCS) {
                com.grapsee.shop.features.tools.LegalDocsScreen(
                    onBack = { navController.popBackStack() },
                    onLogin = { navController.navigate(Routes.LOGIN) },
                )
            }

            composable(Routes.FORMBUILDER) {
                com.grapsee.shop.features.tools.FormBuilderScreen(
                    onBack = { navController.popBackStack() },
                    onLogin = { navController.navigate(Routes.LOGIN) },
                )
            }

            composable(Routes.RESUMEBUILDER) {
                com.grapsee.shop.features.tools.ResumeBuilderScreen(
                    onBack = { navController.popBackStack() },
                    onLogin = { navController.navigate(Routes.LOGIN) },
                )
            }

            composable(Routes.AITOOLS) {
                com.grapsee.shop.features.devtools.AiToolsScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.AICHAT) {
                com.grapsee.shop.features.devtools.AiChatbotScreen(
                    onBack = { navController.popBackStack() },
                    onContact = { navController.navigate(Routes.CONTACT) },
                )
            }

            composable(Routes.AUDITS) {
                com.grapsee.shop.features.devtools.AuditsScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.GUIDES) {
                com.grapsee.shop.features.devtools.GuidesScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.CICD) {
                com.grapsee.shop.features.devtools.CicdScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.ENVSETUP) {
                com.grapsee.shop.features.devtools.EnvSetupScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.DBSCHEMAS) {
                com.grapsee.shop.features.devtools.DbSchemasScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.NOTION) {
                com.grapsee.shop.features.devtools.NotionScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.TUTORIALS) {
                com.grapsee.shop.features.devtools.TutorialsScreen(
                    onBack = { navController.popBackStack() },
                )
            }

            composable(Routes.INSURANCE) {
                com.grapsee.shop.features.tools.InsuranceScreen(
                    onBack = { navController.popBackStack() },
                    onLogin = { navController.navigate(Routes.LOGIN) },
                )
            }

            composable(
                Routes.WEB_PATTERN,
                arguments = listOf(navArgument("url") { type = NavType.StringType }),
            ) { entry ->
                val url = entry.arguments?.getString("url").orEmpty()
                WebViewScreen(url = url)
            }

            composable(Routes.CHECKOUT) {
                val scope = androidx.compose.runtime.rememberCoroutineScope()
                WebViewScreen(
                    url = "${ApiClient.webBase.trimEnd('/')}/checkout/preview",
                    cartHandoff = true,
                    onPageVisited = { pageUrl ->
                        // The web clears its own cart on success; mirror that natively.
                        if (pageUrl.contains("/order-success")) {
                            scope.launch { CartStore.clear() }
                        }
                    },
                )
            }
        }
        }
    }
}
