package com.grapsee.shop.features.commerce

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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import com.grapsee.shop.core.network.ApiClient
import com.grapsee.shop.core.network.CollectionDto
import com.grapsee.shop.core.network.Category
import com.grapsee.shop.core.network.Product
import com.grapsee.shop.ui.components.EmptyState
import com.grapsee.shop.ui.components.ErrorState
import com.grapsee.shop.ui.components.LoadingBox
import com.grapsee.shop.ui.components.ProductCard
import kotlinx.coroutines.launch

// ---------------------------------------------------------------- collections

class CollectionsViewModel : ViewModel() {
    var collections by mutableStateOf<List<CollectionDto>>(emptyList())
        private set
    var loading by mutableStateOf(true)
        private set
    var error by mutableStateOf<String?>(null)
        private set

    init { load() }

    fun load() {
        viewModelScope.launch {
            loading = true
            error = null
            runCatching { ApiClient.collections(false) }
                .onSuccess { collections = it; loading = false }
                .onFailure { error = it.message ?: "Failed to load"; loading = false }
        }
    }
}

@Composable
fun CollectionsScreen(
    onBack: () -> Unit,
    onCollection: (String) -> Unit,
    vm: CollectionsViewModel = viewModel(),
) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        Surface(tonalElevation = 2.dp) {
            Row(Modifier.fillMaxWidth().padding(horizontal = 4.dp, vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back") }
                Column {
                    Text("Curated Collections", style = MaterialTheme.typography.titleLarge)
                    Text("Hand-picked for you", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
        Box(Modifier.weight(1f)) {
            when {
                vm.loading -> LoadingBox(Modifier.fillMaxSize())
                vm.error != null && vm.collections.isEmpty() ->
                    ErrorState(vm.error.orEmpty(), onRetry = vm::load, modifier = Modifier.fillMaxSize())
                vm.collections.isEmpty() -> EmptyState(title = "No collections yet", subtitle = "Check back soon")
                else -> LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    items(vm.collections, key = { it.id }) { collection ->
                        Surface(
                            shape = RoundedCornerShape(16.dp),
                            tonalElevation = 1.dp,
                            modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).clickable { onCollection(collection.id) },
                        ) {
                            Row(Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                Text("✨", style = MaterialTheme.typography.titleLarge)
                                Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                                    Text(collection.displayTitle, style = MaterialTheme.typography.titleMedium, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                    if (!collection.description.isNullOrEmpty()) {
                                        Text(collection.description.orEmpty(), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 2, overflow = TextOverflow.Ellipsis)
                                    }
                                    Text("${collection.productCount} items", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.primary)
                                }
                                Text("→", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary)
                            }
                        }
                    }
                }
            }
        }
    }
}

// ------------------------------------------------------- collection detail

class CollectionDetailViewModel : ViewModel() {
    var products by mutableStateOf<List<Product>>(emptyList())
        private set
    var loading by mutableStateOf(true)
        private set
    var error by mutableStateOf<String?>(null)
        private set

    private var loadedId: String? = null

    fun load(id: String) {
        if (loadedId == id) return
        loadedId = id
        products = emptyList()
        loading = true
        viewModelScope.launch {
            runCatching { ApiClient.collectionProducts(id) }
                .onSuccess { products = it; loading = false }
                .onFailure { error = it.message ?: "Failed to load"; loading = false }
        }
    }
}

@Composable
fun CollectionDetailScreen(
    collectionId: String,
    onBack: () -> Unit,
    onProduct: (String) -> Unit,
    vm: CollectionDetailViewModel = viewModel(),
) {
    LaunchedEffect(collectionId) { vm.load(collectionId) }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        Surface(tonalElevation = 2.dp) {
            Row(Modifier.fillMaxWidth().padding(horizontal = 4.dp, vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back") }
                Text("Collection", style = MaterialTheme.typography.titleLarge)
            }
        }
        Box(Modifier.weight(1f)) {
            when {
                vm.loading -> LoadingBox(Modifier.fillMaxSize())
                vm.error != null && vm.products.isEmpty() ->
                    ErrorState(vm.error.orEmpty(), onRetry = { vm.load(collectionId) }, modifier = Modifier.fillMaxSize())
                vm.products.isEmpty() -> EmptyState(title = "Empty collection", subtitle = "Products will appear here")
                else -> LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    items(vm.products, key = { it.id }) { product ->
                        ProductCard(product) { onProduct(product.id) }
                    }
                }
            }
        }
    }
}

// ----------------------------------------------------------- all categories

class AllCategoriesViewModel : ViewModel() {
    var categories by mutableStateOf<List<Category>>(emptyList())
        private set
    var loading by mutableStateOf(true)
        private set
    var error by mutableStateOf<String?>(null)
        private set

    init { load() }

    fun load() {
        viewModelScope.launch {
            loading = true
            runCatching { ApiClient.categories() }
                .onSuccess { categories = it; loading = false }
                .onFailure { error = it.message; loading = false }
        }
    }
}

@Composable
fun AllCategoriesScreen(
    onBack: () -> Unit,
    onCategory: (String, String) -> Unit,
    vm: AllCategoriesViewModel = viewModel(),
) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        Surface(tonalElevation = 2.dp) {
            Row(Modifier.fillMaxWidth().padding(horizontal = 4.dp, vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back") }
                Column {
                    Text("All Categories", style = MaterialTheme.typography.titleLarge)
                    Text("Browse every department", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
        Box(Modifier.weight(1f)) {
            when {
                vm.loading -> LoadingBox(Modifier.fillMaxSize())
                vm.error != null && vm.categories.isEmpty() ->
                    ErrorState(vm.error.orEmpty(), onRetry = vm::load, modifier = Modifier.fillMaxSize())
                vm.categories.isEmpty() -> EmptyState(title = "No categories", subtitle = "Check back soon")
                else -> LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    items(vm.categories, key = { it.id }) { category ->
                        Surface(
                            shape = RoundedCornerShape(16.dp),
                            tonalElevation = 1.dp,
                            modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).clickable { onCategory(category.id, category.name) },
                        ) {
                            Row(Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                Text(category.icon ?: "🛍", style = MaterialTheme.typography.titleLarge)
                                Column(Modifier.weight(1f)) {
                                    Text(category.name, style = MaterialTheme.typography.titleMedium)
                                    if (!category.slug.isNullOrEmpty()) {
                                        Text(category.slug.orEmpty(), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                }
                                Text("→", color = MaterialTheme.colorScheme.primary)
                            }
                        }
                    }
                }
            }
        }
    }
}
