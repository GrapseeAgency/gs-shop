package com.grapsee.shop.features.orders

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.grapsee.shop.core.network.ApiClient
import com.grapsee.shop.core.network.OrderDto
import com.grapsee.shop.ui.components.EmptyState
import com.grapsee.shop.ui.components.ErrorState
import com.grapsee.shop.ui.components.LoadingBox
import com.grapsee.shop.util.Format
import com.grapsee.shop.util.Media
import kotlinx.coroutines.launch

data class OrdersUiState(
    val orders: List<OrderDto> = emptyList(),
    val loading: Boolean = true,
    val error: String? = null,
)

class OrdersViewModel : ViewModel() {
    var ui by mutableStateOf(OrdersUiState())
        private set

    fun load(email: String) {
        viewModelScope.launch {
            ui = ui.copy(loading = true, error = null)
            runCatching { ApiClient.orders(email) }
                .onSuccess { ui = ui.copy(orders = it.sortedByDescending { o -> o.createdAt }, loading = false) }
                .onFailure { ui = ui.copy(loading = false, error = it.message ?: "Failed to load orders") }
        }
    }
}

@Composable
fun OrdersScreen(
    onProduct: (String) -> Unit,
    onOrder: (String) -> Unit,
    onLogin: () -> Unit,
    vm: OrdersViewModel = viewModel(),
) {
    val session by ApiClient.cookies.session.collectAsState()

    if (!session.loggedIn) {
        Column(Modifier.fillMaxSize().padding(top = 56.dp)) {
            Text(
                "Your orders",
                style = MaterialTheme.typography.headlineSmall,
                modifier = Modifier.padding(horizontal = 16.dp),
            )
            EmptyState(
                title = "Sign in to see your orders",
                subtitle = "Your purchase history lives in your Grapsee account",
                action = { Button(onClick = onLogin) { Text("Sign in") } },
            )
        }
        return
    }

    val email = session.email.orEmpty()
    LaunchedEffect(email) { vm.load(email) }

    val state = vm.ui

    Column(Modifier.fillMaxSize()) {
        Text(
            "Your orders",
            style = MaterialTheme.typography.headlineSmall,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
        )
        when {
            state.loading -> LoadingBox()
            state.error != null -> ErrorState(state.error.orEmpty(), onRetry = { vm.load(email) })
            state.orders.isEmpty() -> EmptyState(
                title = "No orders yet",
                subtitle = "When you place an order it shows up here",
            )
            else -> LazyColumn(
                Modifier.fillMaxSize(),
                contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                items(state.orders, key = { it.id }) { order ->
                    OrderCard(order, onProduct, onOrder)
                }
            }
        }
    }
}

@Composable
private fun OrderCard(order: OrderDto, onProduct: (String) -> Unit, onOrder: (String) -> Unit) {
    Surface(
        shape = RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.surface,
        tonalElevation = 1.dp,
        modifier = Modifier
            .clip(RoundedCornerShape(16.dp))
            .clickable { onOrder(order.id) },
    ) {
        Column(Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(
                Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    "Order #${order.id.takeLast(8)}",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.SemiBold,
                )
                StatusBadge(order.status)
            }
            order.createdAt?.let {
                Text(it.take(10), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                order.items.take(3).forEach { item ->
                    AsyncImage(
                        model = Media.resolve(item.imageUrl),
                        contentDescription = item.productName,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier
                            .size(52.dp)
                            .clip(RoundedCornerShape(10.dp)),
                    )
                }
                Box(Modifier.weight(1f))
                Column(horizontalAlignment = Alignment.End) {
                    Text(Format.price(order.total), style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary)
                    Text(
                        "${order.items.sumOf { it.quantity }} item(s)",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
        }
    }
}

@Composable
internal fun StatusBadge(status: String) {
    val color = when (status.lowercase()) {
        "delivered", "completed" -> MaterialTheme.colorScheme.primary
        "cancelled", "failed", "refunded" -> MaterialTheme.colorScheme.error
        else -> MaterialTheme.colorScheme.tertiary
    }
    Surface(color = color.copy(alpha = 0.15f), contentColor = color, shape = RoundedCornerShape(8.dp)) {
        Text(
            status.replaceFirstChar { it.uppercase() },
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
            style = MaterialTheme.typography.labelSmall,
        )
    }
}
