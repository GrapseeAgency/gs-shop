package com.grapsee.shop.features.orders

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.grapsee.shop.core.network.ApiClient
import com.grapsee.shop.core.network.OrderDto
import com.grapsee.shop.ui.components.ErrorState
import com.grapsee.shop.ui.components.LoadingBox
import com.grapsee.shop.util.Format
import com.grapsee.shop.util.Media
import kotlinx.coroutines.launch

class OrderDetailViewModel : ViewModel() {
    var order by mutableStateOf<OrderDto?>(null)
        private set
    var loading by mutableStateOf(true)
        private set
    var error by mutableStateOf<String?>(null)
        private set

    fun load(orderId: String) {
        viewModelScope.launch {
            loading = true
            error = null
            runCatching { ApiClient.order(orderId) }
                .onSuccess { order = it; loading = false }
                .onFailure { error = it.message ?: "Failed to load order"; loading = false }
        }
    }
}

@Composable
fun OrderDetailScreen(
    orderId: String,
    onBack: () -> Unit,
    vm: OrderDetailViewModel = viewModel(),
) {
    LaunchedEffect(orderId) { vm.load(orderId) }

    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        Surface(tonalElevation = 2.dp) {
            Row(
                Modifier.fillMaxWidth().padding(horizontal = 4.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                IconButton(onClick = onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                }
                Text("Order details", style = MaterialTheme.typography.titleLarge)
            }
        }

        when {
            vm.loading -> LoadingBox(Modifier.fillMaxSize())
            vm.error != null -> ErrorState(vm.error.orEmpty(), onRetry = { vm.load(orderId) }, modifier = Modifier.fillMaxSize())
            else -> {
                val order = vm.order ?: return@Column
                Column(
                    Modifier
                        .fillMaxSize()
                        .verticalScroll(rememberScrollState())
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    Surface(shape = RoundedCornerShape(16.dp), color = MaterialTheme.colorScheme.surfaceVariant) {
                        Row(
                            Modifier.fillMaxWidth().padding(16.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Text("Order #${order.id.takeLast(8)}", style = MaterialTheme.typography.titleMedium)
                                Text(
                                    order.createdAt?.take(10) ?: "",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                )
                            }
                            StatusBadge(order.status)
                        }
                    }

                    Text("Items", style = MaterialTheme.typography.titleMedium)
                    order.items.forEach { item ->
                        Surface(shape = RoundedCornerShape(14.dp), color = MaterialTheme.colorScheme.surface, tonalElevation = 1.dp) {
                            Row(Modifier.fillMaxWidth().padding(10.dp), verticalAlignment = Alignment.CenterVertically) {
                                AsyncImage(
                                    model = Media.resolve(item.imageUrl),
                                    contentDescription = item.productName,
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier
                                        .size(56.dp)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(MaterialTheme.colorScheme.surfaceVariant),
                                )
                                Column(
                                    Modifier.weight(1f).padding(horizontal = 12.dp),
                                    verticalArrangement = Arrangement.spacedBy(2.dp),
                                ) {
                                    Text(item.productName, style = MaterialTheme.typography.titleSmall, maxLines = 2)
                                    Text(
                                        "${item.quantity} × ${Format.price(item.price)}",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    )
                                }
                                Text(Format.price(item.price * item.quantity), style = MaterialTheme.typography.titleSmall)
                            }
                        }
                    }

                    Surface(shape = RoundedCornerShape(16.dp), color = MaterialTheme.colorScheme.surface, tonalElevation = 1.dp) {
                        Column(Modifier.fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            SummaryRow("Subtotal", Format.price(order.items.sumOf { it.price * it.quantity }))
                            if (order.discount > 0) SummaryRow("Discount", "-${Format.price(order.discount)}")
                            SummaryRow("Total", Format.price(order.total), bold = true)
                            order.paymentMethod?.let { SummaryRow("Payment", it.replaceFirstChar { c -> c.uppercase() }) }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun SummaryRow(label: String, value: String, bold: Boolean = false) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(
            label,
            style = MaterialTheme.typography.bodyLarge,
            fontWeight = if (bold) FontWeight.Bold else FontWeight.Normal,
        )
        Text(
            value,
            style = MaterialTheme.typography.bodyLarge,
            color = if (bold) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onBackground,
            fontWeight = if (bold) FontWeight.Bold else FontWeight.Normal,
        )
    }
}
