package com.grapsee.shop.features.wishlist

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.grapsee.shop.core.wishlist.WishlistStore
import com.grapsee.shop.ui.components.EmptyState
import com.grapsee.shop.ui.components.PriceText
import com.grapsee.shop.util.Media
import kotlinx.coroutines.launch

class WishlistViewModel : ViewModel() {
    fun remove(productId: String) {
        viewModelScope.launch { WishlistStore.remove(productId) }
    }
}

@Composable
fun WishlistScreen(
    onProduct: (String) -> Unit,
    vm: WishlistViewModel = viewModel(),
) {
    val items by WishlistStore.items.collectAsState()

    Column(Modifier.fillMaxSize()) {
        Text(
            "Wishlist (${items.size})",
            style = MaterialTheme.typography.headlineSmall,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
        )

        if (items.isEmpty()) {
            EmptyState(
                title = "No favourites yet",
                subtitle = "Tap the heart on any product to save it here",
            )
        } else {
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                modifier = Modifier.fillMaxSize(),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                contentPadding = PaddingValues(16.dp),
            ) {
                items(items, key = { it.productId }) { item ->
                    Surface(
                        shape = RoundedCornerShape(16.dp),
                        color = MaterialTheme.colorScheme.surface,
                        tonalElevation = 1.dp,
                        modifier = Modifier.clip(RoundedCornerShape(16.dp)).clickable { onProduct(item.productId) },
                    ) {
                        Column {
                            Box(
                                Modifier.fillMaxWidth().background(MaterialTheme.colorScheme.surfaceVariant),
                            ) {
                                AsyncImage(
                                    model = Media.resolve(item.imageUrl),
                                    contentDescription = item.name,
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier.fillMaxWidth().size(170.dp),
                                )
                                androidx.compose.material3.IconButton(
                                    onClick = { vm.remove(item.productId) },
                                    modifier = Modifier.align(Alignment.TopEnd),
                                ) {
                                    androidx.compose.material3.Icon(
                                        Icons.Filled.Favorite,
                                        contentDescription = "Remove from wishlist",
                                        tint = MaterialTheme.colorScheme.error,
                                    )
                                }
                            }
                            Column(Modifier.padding(10.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Text(item.name, style = MaterialTheme.typography.titleSmall, maxLines = 2)
                                PriceText(item.price, item.comparePrice)
                            }
                        }
                    }
                }
            }
        }
    }
}

/** Kept for future use (e.g. heart badges on product cards). */
@Composable
fun WishHeart(isWished: Boolean, contentDescription: String) {
    androidx.compose.material3.Icon(
        if (isWished) Icons.Filled.Favorite else Icons.Filled.FavoriteBorder,
        contentDescription = contentDescription,
        tint = if (isWished) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurfaceVariant,
    )
}
