package com.grapsee.shop.features.cart

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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
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
import com.grapsee.shop.core.cart.CartStore
import com.grapsee.shop.core.network.ApiClient
import com.grapsee.shop.core.network.CartLine
import com.grapsee.shop.ui.components.EmptyState
import com.grapsee.shop.ui.components.QuantityStepper
import com.grapsee.shop.util.Format
import com.grapsee.shop.util.Media
import kotlinx.coroutines.launch

class CartViewModel : ViewModel() {
    fun setQuantity(productId: String, quantity: Int) {
        viewModelScope.launch { CartStore.setQuantity(productId, quantity) }
    }

    fun remove(productId: String) {
        viewModelScope.launch { CartStore.remove(productId) }
    }
}

@Composable
fun CartScreen(
    onProduct: (String) -> Unit,
    onCheckout: () -> Unit,
    onLogin: () -> Unit,
    vm: CartViewModel = viewModel(),
) {
    val lines by CartStore.lines.collectAsState()
    val subtotal = lines.sumOf { it.price * it.quantity }

    if (lines.isEmpty()) {
        Column(Modifier.fillMaxSize().padding(top = 56.dp)) {
            Text(
                "Your cart",
                style = MaterialTheme.typography.headlineSmall,
                modifier = Modifier.padding(horizontal = 16.dp),
            )
            EmptyState(
                title = "Your cart is empty",
                subtitle = "Browse the mall and add something you love",
                modifier = Modifier.fillMaxWidth(),
            )
            Button(onClick = onLogin, modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp)) {
                Text("Sign in to sync your cart")
            }
        }
        return
    }

    Column(Modifier.fillMaxSize()) {
        Text(
            "Your cart (${lines.sumOf { it.quantity }})",
            style = MaterialTheme.typography.headlineSmall,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
        )

        LazyColumn(
            Modifier.weight(1f),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 16.dp, vertical = 4.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            items(lines, key = { it.id }) { line ->
                CartLineRow(
                    line = line,
                    onProduct = onProduct,
                    onQuantity = { qty -> vm.setQuantity(line.productId, qty) },
                    onRemove = { vm.remove(line.productId) },
                )
            }
        }

        Surface(tonalElevation = 3.dp) {
            Column(
                Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("Subtotal", style = MaterialTheme.typography.bodyLarge)
                    Text(Format.price(subtotal), style = MaterialTheme.typography.titleMedium)
                }
                Text(
                    "Shipping and taxes are calculated at checkout",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Button(
                    onClick = onCheckout,
                    modifier = Modifier.fillMaxWidth().height(52.dp),
                    shape = RoundedCornerShape(16.dp),
                ) {
                    Text("Go to checkout", style = MaterialTheme.typography.labelLarge)
                }
            }
        }
    }
}

@Composable
private fun CartLineRow(
    line: CartLine,
    onProduct: (String) -> Unit,
    onQuantity: (Int) -> Unit,
    onRemove: () -> Unit,
) {
    Surface(
        shape = RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.surface,
        tonalElevation = 1.dp,
    ) {
        Row(Modifier.fillMaxWidth().padding(10.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(
                Modifier
                    .size(72.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant)
                    .clickable { onProduct(line.productId) },
                contentAlignment = Alignment.Center,
            ) {
                AsyncImage(
                    model = Media.resolve(line.imageUrl),
                    contentDescription = line.name,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.size(72.dp),
                )
            }
            Column(
                Modifier
                    .weight(1f)
                    .padding(start = 12.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                Text(
                    line.name,
                    style = MaterialTheme.typography.titleSmall,
                    maxLines = 2,
                )
                Text(
                    Format.price(line.price),
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.primary,
                )
                QuantityStepper(
                    quantity = line.quantity,
                    onIncrease = { onQuantity(line.quantity + 1) },
                    onDecrease = { onQuantity(line.quantity - 1) },
                )
            }
            IconButton(onClick = onRemove) {
                Icon(
                    Icons.Outlined.Delete,
                    contentDescription = "Remove ${line.name}",
                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}
