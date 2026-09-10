package com.grapsee.shop.features.list

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import com.grapsee.shop.core.network.ApiClient
import com.grapsee.shop.core.network.PagedProducts
import com.grapsee.shop.core.network.Product
import com.grapsee.shop.ui.components.EmptyState
import com.grapsee.shop.ui.components.ErrorState
import com.grapsee.shop.ui.components.LoadingBox
import com.grapsee.shop.ui.components.ProductCard
import kotlinx.coroutines.launch

/**
 * Native listing page for the big curated collections — the "See all"
 * destinations. Modes map straight onto /api/products query flags.
 */
data class ListUiState(
    val products: List<Product> = emptyList(),
    val page: Int = 1,
    val totalPages: Int = 1,
    val loading: Boolean = true,
    val loadingMore: Boolean = false,
    val error: String? = null,
)

class ListViewModel : ViewModel() {
    var ui by mutableStateOf(ListUiState())
        private set

    private var loadedKey: String? = null

    fun load(mode: String) {
        val key = mode
        if (loadedKey == key) return
        loadedKey = key
        ui = ListUiState()
        loadMore(mode, reset = true)
    }

    fun loadMore(mode: String, reset: Boolean = false) {
        if (ui.loadingMore || (!reset && ui.page >= ui.totalPages)) return
        viewModelScope.launch {
            ui = ui.copy(loadingMore = true, error = null)
            val page = if (reset) 1 else ui.page + 1
            runCatching {
                when (mode) {
                    "deals" -> ApiClient.products(page = page, deals = true)
                    "trending" -> ApiClient.products(page = page, trending = true)
                    "featured" -> ApiClient.products(page = page, featured = true)
                    "new" -> ApiClient.products(page = page, new = true)
                    // Commerce batch: dedicated endpoints, paged client-side.
                    "flash-sale" -> flashSalePage(page)
                    "luxury" -> luxuryPage(page)
                    "auctions" -> auctionsPage(page)
                    "preorder" -> preorderPage(page)
                    "bundles" -> bundlesPage(page)
                    else -> if (mode.startsWith("brand:")) brandPage(mode.removePrefix("brand:"), page)
                    else if (mode.startsWith("search:")) brandPage(mode.removePrefix("search:"), page)
                    else ApiClient.products(page = page)
                }
            }.onSuccess { paged ->
                ui = ui.copy(
                    products = if (reset) paged.items else ui.products + paged.items,
                    page = paged.page,
                    totalPages = paged.totalPages,
                    loading = false,
                    loadingMore = false,
                )
            }.onFailure { t ->
                ui = ui.copy(loading = false, loadingMore = false, error = t.message ?: "Failed to load")
            }
        }
    }
}

@Composable
fun ProductListScreen(
    mode: String,
    title: String,
    onBack: () -> Unit,
    onProduct: (String) -> Unit,
    vm: ListViewModel = viewModel(),
) {
    androidx.compose.runtime.LaunchedEffect(mode) { vm.load(mode) }

    val state = vm.ui

    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        Surface(tonalElevation = 2.dp) {
            Row(
                Modifier.fillMaxWidth().padding(horizontal = 4.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                IconButton(onClick = onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                }
                Text(title.ifBlank { "Products" }, style = MaterialTheme.typography.titleLarge)
            }
        }

        Box(Modifier.weight(1f)) {
            when {
                state.loading -> LoadingBox(Modifier.fillMaxSize())
                state.error != null && state.products.isEmpty() ->
                    ErrorState(state.error.orEmpty(), onRetry = { vm.loadMore(mode, reset = true) }, modifier = Modifier.fillMaxSize())
                state.products.isEmpty() -> EmptyState(
                    title = "Nothing here yet",
                    subtitle = "Check back soon — new drops land daily",
                )
                else -> LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    modifier = Modifier.fillMaxSize(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    contentPadding = PaddingValues(16.dp),
                ) {
                    items(state.products, key = { it.id }) { product ->
                        ProductCard(product, Modifier.animateItem()) { onProduct(product.id) }
                    }
                    if (state.page < state.totalPages) {
                        item(span = { androidx.compose.foundation.lazy.grid.GridItemSpan(2) }) {
                            Box(Modifier.fillMaxWidth().padding(12.dp), contentAlignment = Alignment.Center) {
                                Text(
                                    if (state.loadingMore) "Loading…" else "Load more",
                                    color = MaterialTheme.colorScheme.primary,
                                    style = MaterialTheme.typography.labelLarge,
                                    modifier = Modifier
                                        .clickable { vm.loadMore(mode) }
                                        .padding(8.dp),
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

// Commerce batch: dedicated endpoints return full lists; page them client-side.
private const val ListPageSize = 20

private suspend fun flashSalePage(page: Int): PagedProducts = singlePage(ApiClient.flashSale(), page)
private suspend fun luxuryPage(page: Int): PagedProducts = singlePage(ApiClient.luxuryProducts(100), page)
private suspend fun auctionsPage(page: Int): PagedProducts = singlePage(ApiClient.auctions(), page)
private suspend fun preorderPage(page: Int): PagedProducts = singlePage(ApiClient.preorder(), page)
private suspend fun bundlesPage(page: Int): PagedProducts = singlePage(ApiClient.bundles(), page)

private suspend fun brandPage(brand: String, page: Int): PagedProducts {
    val all = ApiClient.search(brand).items
    return singlePage(all, page)
}

private fun singlePage(all: List<Product>, page: Int): PagedProducts {
    val totalPages = maxOf(1, (all.size + ListPageSize - 1) / ListPageSize)
    val from = (page - 1) * ListPageSize
    val items = if (from >= all.size) emptyList() else all.subList(from, minOf(from + ListPageSize, all.size))
    return PagedProducts(items = items, total = all.size, page = page, totalPages = totalPages)
}
