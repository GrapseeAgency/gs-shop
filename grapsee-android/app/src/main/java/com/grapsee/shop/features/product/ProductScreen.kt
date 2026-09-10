package com.grapsee.shop.features.product

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.outlined.Share
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.grapsee.shop.core.cart.CartStore
import com.grapsee.shop.core.network.ApiClient
import com.grapsee.shop.core.network.Inventory
import com.grapsee.shop.core.network.Product
import com.grapsee.shop.ui.components.AddToCartButton
import com.grapsee.shop.ui.components.DiscountBadge
import com.grapsee.shop.ui.components.ErrorState
import com.grapsee.shop.ui.components.LoadingBox
import com.grapsee.shop.ui.components.PriceText
import com.grapsee.shop.ui.components.ProductCardCompact
import com.grapsee.shop.ui.components.QuantityStepper
import com.grapsee.shop.ui.components.RatingRow
import com.grapsee.shop.ui.components.SectionHeader
import com.grapsee.shop.util.Media
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/** Native share sheet — `context` is resolved in the composable. */
private fun shareProduct(context: android.content.Context, product: Product) {
    val deepLink = "https://captainpiracy.shop/product/${product.slug ?: product.id}"
    val intent = android.content.Intent(android.content.Intent.ACTION_SEND).apply {
        type = "text/plain"
        putExtra(android.content.Intent.EXTRA_SUBJECT, product.name)
        putExtra(
            android.content.Intent.EXTRA_TEXT,
            "${product.name} — ${com.grapsee.shop.util.Format.price(product.price)} on Grapsee\n$deepLink",
        )
    }
    context.startActivity(android.content.Intent.createChooser(intent, "Share product"))
}
data class ProductUiState(
    val product: Product? = null,
    val inventory: Inventory? = null,
    val loading: Boolean = true,
    val error: String? = null,
    // add-to-cart feedback
    val adding: Boolean = false,
    val added: Boolean = false,
)

class ProductViewModel : ViewModel() {
    var ui by mutableStateOf(ProductUiState())
        private set

    private var loadedId: String? = null

    fun load(productId: String) {
        if (loadedId == productId) return
        loadedId = productId
        viewModelScope.launch {
            ui = ProductUiState(loading = true)
            runCatching {
                val detail = ApiClient.product(productId)
                val inventory = runCatching { ApiClient.inventory(productId) }.getOrNull()
                detail to inventory
            }.onSuccess { (detail, inventory) ->
                ui = ui.copy(product = detail, inventory = inventory, loading = false)
                runCatching { ApiClient.trackView(productId) }
                runCatching { com.grapsee.shop.core.history.RecentlyViewedStore.record(detail) }
            }.onFailure { t ->
                ui = ui.copy(loading = false, error = t.message ?: "Failed to load product")
            }
        }
    }

    fun addToCart(quantity: Int, onResult: (String) -> Unit) {
        val product = ui.product ?: return
        viewModelScope.launch {
            ui = ui.copy(adding = true)
            val result = CartStore.add(
                com.grapsee.shop.core.network.CartLine(
                    id = "${product.id}-${System.currentTimeMillis()}",
                    productId = product.id,
                    name = product.name,
                    price = product.price,
                    quantity = quantity,
                    imageUrl = product.imageUrl,
                ),
            )
            ui = ui.copy(adding = false)
            result
                .onSuccess {
                    ui = ui.copy(added = true)
                    delay(1500)
                    ui = ui.copy(added = false)
                }
                .onFailure { onResult(it.message ?: "Could not add to cart") }
        }
    }

    fun toggleWishlist(product: Product) {
        viewModelScope.launch { com.grapsee.shop.core.wishlist.WishlistStore.toggle(product) }
    }
}

@Composable
fun ProductScreen(
    productId: String,
    onBack: () -> Unit,
    onProduct: (String) -> Unit,
    onCategory: (String, String) -> Unit,
    onRelated: (String) -> Unit,
    vm: ProductViewModel = viewModel(),
) {
    LaunchedEffect(productId) { vm.load(productId) }

    val state = vm.ui
    val context = LocalContext.current
    val snackbar = remember { SnackbarHostState() }
    val scope = androidx.compose.runtime.rememberCoroutineScope()
    val haptics = LocalHapticFeedback.current
    var quantity by remember { mutableStateOf(1) }

    Box(Modifier.fillMaxSize()) {
        when {
            state.loading -> LoadingBox(Modifier.fillMaxSize())
            state.error != null -> ErrorState(state.error.orEmpty(), onRetry = {
                vm.load(productId)
            }, modifier = Modifier.fillMaxSize())

            else -> {
                val product = state.product ?: return@Box
                Column(Modifier.fillMaxSize()) {
                    Column(
                        Modifier
                            .weight(1f)
                            .verticalScroll(rememberScrollState()),
                    ) {
                        Gallery(product)

                        Column(
                            Modifier.padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(10.dp),
                        ) {
                            product.category?.let { category ->
                                Text(
                                    category.name,
                                    style = MaterialTheme.typography.labelLarge,
                                    color = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(8.dp))
                                        .clickable { onCategory(category.id, category.name) },
                                )
                            }
                            Text(product.name, style = MaterialTheme.typography.headlineSmall)

                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(10.dp),
                            ) {
                                PriceText(product.price, product.comparePrice)
                                product.percentOff()?.let { DiscountBadge(it) }
                                RatingRow(product.averageRating ?: product.rating, product.reviewCount)
                            }

                            StockLine(state.inventory)

                            if (product.featureList().isNotEmpty()) {
                                Surface(
                                    color = MaterialTheme.colorScheme.surfaceVariant,
                                    shape = RoundedCornerShape(14.dp),
                                ) {
                                    Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                        Text("Highlights", style = MaterialTheme.typography.titleSmall)
                                        product.featureList().take(6).forEach { feature ->
                                            Row(verticalAlignment = Alignment.CenterVertically) {
                                                Text("•  ", color = MaterialTheme.colorScheme.primary)
                                                Text(feature, style = MaterialTheme.typography.bodyMedium)
                                            }
                                        }
                                    }
                                }
                            }

                            Text("Description", style = MaterialTheme.typography.titleMedium)
                            Text(
                                product.description ?: "No description provided.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }

                        if (product.relatedProducts.isNotEmpty()) {
                            Column {
                                SectionHeader("You may also like")
                                Row(
                                    Modifier
                                        .horizontalScroll(rememberScrollState())
                                        .padding(horizontal = 16.dp),
                                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                                ) {
                                    product.relatedProducts.forEach { related ->
                                        ProductCardCompact(related) { onRelated(related.id) }
                                    }
                                }
                            }
                            Spacer(Modifier.height(16.dp))
                        }
                    }

                    // Sticky add-to-cart bar
                    Surface(tonalElevation = 3.dp) {
                        Row(
                            Modifier
                                .fillMaxWidth()
                                .navigationBarsPadding()
                                .padding(horizontal = 16.dp, vertical = 12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp),
                        ) {
                            QuantityStepper(
                                quantity = quantity,
                                onIncrease = { quantity++ },
                                onDecrease = { if (quantity > 1) quantity-- },
                            )
                            AddToCartButton(
                                enabled = state.inventory?.isSoldOut != true,
                                loading = state.adding,
                                onClick = {
                                    haptics.performHapticFeedback(HapticFeedbackType.LongPress)
                                    vm.addToCart(quantity) { message ->
                                        scope.launch { snackbar.showSnackbar(message) }
                                    }
                                },
                                modifier = Modifier.weight(1f),
                            )
                        }
                    }
                }
            }
        }

        // Top bar overlays the gallery.
        val wishedItems by com.grapsee.shop.core.wishlist.WishlistStore.items.collectAsState()
        val isWished = state.product?.let { p -> wishedItems.any { it.productId == p.id } } == true

        Row(
            Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(horizontal = 8.dp, vertical = 4.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Surface(shape = CircleShape, color = MaterialTheme.colorScheme.surface.copy(alpha = 0.9f)) {
                IconButton(onClick = onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Surface(shape = CircleShape, color = MaterialTheme.colorScheme.surface.copy(alpha = 0.9f)) {
                    IconButton(onClick = {
                        state.product?.let { vm.toggleWishlist(it) }
                    }) {
                        Icon(
                            if (isWished) Icons.Filled.Favorite else Icons.Filled.FavoriteBorder,
                            contentDescription = if (isWished) "Remove from wishlist" else "Add to wishlist",
                            tint = if (isWished) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurface,
                        )
                    }
                }
                Surface(shape = CircleShape, color = MaterialTheme.colorScheme.surface.copy(alpha = 0.9f)) {
                    IconButton(onClick = {
                        state.product?.let { product -> shareProduct(context, product) }
                    }) {
                        Icon(Icons.Outlined.Share, contentDescription = "Share product")
                    }
                }
            }
        }

        SnackbarHost(hostState = snackbar, modifier = Modifier.align(Alignment.BottomCenter))
    }
}

@Composable
private fun Gallery(product: Product) {
    val images = product.imageUrls()
    Column {
        Box(
            Modifier
                .fillMaxWidth()
                .aspectRatio(1f)
                .background(MaterialTheme.colorScheme.surfaceVariant),
        ) {
            AsyncImage(
                model = Media.resolve(images.firstOrNull()),
                contentDescription = product.name,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize(),
            )
        }
        if (images.size > 1) {
            Row(
                Modifier
                    .horizontalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                images.drop(1).take(8).forEach { url ->
                    AsyncImage(
                        model = Media.resolve(url),
                        contentDescription = null,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier
                            .size(64.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(MaterialTheme.colorScheme.surfaceVariant),
                    )
                }
            }
        }
    }
}

@Composable
private fun StockLine(inventory: Inventory?) {
    val (label, color) = when {
        inventory == null -> "Check availability" to MaterialTheme.colorScheme.onSurfaceVariant
        inventory.isSoldOut -> "Out of stock" to MaterialTheme.colorScheme.error
        inventory.inventory <= 5 -> "Only ${inventory.inventory} left" to MaterialTheme.colorScheme.error
        else -> "In stock" to MaterialTheme.colorScheme.primary
    }
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
        Box(
            Modifier
                .size(8.dp)
                .clip(CircleShape)
                .background(color),
        )
        Text(label, style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Medium)
    }
}
