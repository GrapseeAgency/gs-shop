package com.grapsee.shop.features.category

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
import androidx.compose.foundation.shape.RoundedCornerShape
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
import com.grapsee.shop.core.network.Product
import com.grapsee.shop.ui.components.EmptyState
import com.grapsee.shop.ui.components.ErrorState
import com.grapsee.shop.ui.components.LoadingBox
import com.grapsee.shop.ui.components.ProductCard
import kotlinx.coroutines.launch

data class CategoryUiState(
    val products: List<Product> = emptyList(),
    val page: Int = 1,
    val totalPages: Int = 1,
    val loading: Boolean = true,
    val loadingMore: Boolean = false,
    val error: String? = null,
)

class CategoryViewModel : ViewModel() {
    var ui by mutableStateOf(CategoryUiState())
        private set

    private var loadedId: String? = null

    fun load(categoryId: String) {
        if (loadedId != categoryId) {
            loadedId = categoryId
            ui = CategoryUiState()
            loadMore(categoryId, reset = true)
        }
    }

    fun loadMore(categoryId: String, reset: Boolean = false) {
        if (ui.loadingMore) return
        viewModelScope.launch {
            ui = ui.copy(loadingMore = true, error = null)
            runCatching {
                ApiClient.products(categoryId = categoryId, page = if (reset) 1 else ui.page + 1, limit = 20)
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
fun CategoryScreen(
    categoryId: String,
    categoryName: String,
    onBack: () -> Unit,
    onProduct: (String) -> Unit,
    vm: CategoryViewModel = viewModel(),
) {
    androidx.compose.runtime.LaunchedEffect(categoryId) { vm.load(categoryId) }

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
                Text(
                    categoryName.ifBlank { "Category" },
                    style = MaterialTheme.typography.titleLarge,
                )
            }
        }

        Box(Modifier.weight(1f)) {
            when {
                state.loading -> LoadingBox(Modifier.fillMaxSize())
                state.error != null && state.products.isEmpty() ->
                    ErrorState(state.error.orEmpty(), onRetry = { vm.load(categoryId) }, modifier = Modifier.fillMaxSize())
                state.products.isEmpty() -> EmptyState(
                    title = "Nothing here yet",
                    subtitle = "This category has no active products",
                )
                else -> LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    modifier = Modifier.fillMaxSize(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    contentPadding = PaddingValues(16.dp),
                ) {
                    items(state.products, key = { it.id }) { product ->
                        ProductCard(product) { onProduct(product.id) }
                    }
                    if (state.page < state.totalPages) {
                        item(span = { androidx.compose.foundation.lazy.grid.GridItemSpan(2) }) {
                            Box(Modifier.fillMaxWidth().padding(12.dp), contentAlignment = Alignment.Center) {
                                Text(
                                    if (state.loadingMore) "Loading…" else "Load more",
                                    color = MaterialTheme.colorScheme.primary,
                                    style = MaterialTheme.typography.labelLarge,
                                    modifier = Modifier
                                        .clickable { vm.loadMore(categoryId) }
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
