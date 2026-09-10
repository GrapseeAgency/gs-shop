package com.grapsee.shop.features.search

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import com.grapsee.shop.core.network.Product
import com.grapsee.shop.ui.components.EmptyState
import com.grapsee.shop.ui.components.ErrorState
import com.grapsee.shop.ui.components.LoadingBox
import com.grapsee.shop.ui.components.ProductCard
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

data class SearchUiState(
    val query: String = "",
    val results: List<Product> = emptyList(),
    val loading: Boolean = false,
    val searched: Boolean = false,
    val error: String? = null,
)

class SearchViewModel : ViewModel() {
    var ui by mutableStateOf(SearchUiState())
        private set

    fun onQueryChange(query: String) {
        ui = ui.copy(query = query)
    }

    fun search(query: String) {
        if (query.isBlank()) {
            ui = ui.copy(results = emptyList(), searched = false, error = null)
            return
        }
        viewModelScope.launch {
            ui = ui.copy(loading = true, error = null)
            runCatching { com.grapsee.shop.core.network.ApiClient.search(query.trim()) }
                .onSuccess { paged ->
                    ui = ui.copy(results = paged.items, loading = false, searched = true)
                }
                .onFailure { t ->
                    ui = ui.copy(loading = false, searched = true, error = t.message ?: "Search failed")
                }
        }
    }
}

@Composable
fun SearchScreen(
    onProduct: (String) -> Unit,
    initialQuery: String = "",
    vm: SearchViewModel = viewModel(),
) {
    val state = vm.ui

    // Deep link from trending pills: run once per query.
    LaunchedEffect(initialQuery) {
        if (initialQuery.isNotBlank() && state.query != initialQuery) {
            vm.onQueryChange(initialQuery)
            vm.search(initialQuery)
        }
    }

    // Debounced as-you-type search, like the web header search.
    LaunchedEffect(state.query) {
        if (state.query.isBlank()) return@LaunchedEffect
        delay(350)
        vm.search(state.query)
    }

    Column(Modifier.fillMaxSize()) {
        OutlinedTextField(
            value = state.query,
            onValueChange = vm::onQueryChange,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            placeholder = { Text("Search products, brands, categories…") },
            leadingIcon = { Icon(Icons.Outlined.Search, contentDescription = null) },
            trailingIcon = {
                if (state.query.isNotEmpty()) {
                    IconButton(onClick = { vm.onQueryChange("") }) {
                        Icon(Icons.Filled.Close, contentDescription = "Clear search")
                    }
                }
            },
            singleLine = true,
            shape = RoundedCornerShape(16.dp),
            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
            keyboardActions = KeyboardActions(onSearch = { vm.search(state.query) }),
        )

        when {
            state.query.isBlank() -> EmptyState(
                title = "Find anything",
                subtitle = "Search across the whole Grapsee mall",
            )
            state.loading -> LoadingBox()
            state.error != null -> ErrorState(state.error.orEmpty(), onRetry = { vm.search(state.query) })
            state.searched && state.results.isEmpty() -> EmptyState(
                title = "No results for \"${state.query}\"",
                subtitle = "Try a different keyword",
            )
            else -> {
                Row(Modifier.padding(horizontal = 16.dp, vertical = 4.dp)) {
                    Text(
                        "${state.results.size} result${if (state.results.size == 1) "" else "s"}",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    modifier = Modifier.fillMaxSize(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 24.dp),
                ) {
                    items(state.results, key = { it.id }) { product ->
                        ProductCard(product) { onProduct(product.id) }
                    }
                }
            }
        }
    }
}
