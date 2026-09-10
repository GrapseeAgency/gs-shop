package com.grapsee.shop.features.ordertools

import android.app.DownloadManager
import android.content.Context
import android.net.Uri
import android.os.Environment
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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import com.grapsee.shop.core.network.ApiClient
import com.grapsee.shop.core.network.DownloadDto
import com.grapsee.shop.core.network.GroupBuyDto
import com.grapsee.shop.core.network.OrderDto
import com.grapsee.shop.core.network.Product
import com.grapsee.shop.core.network.RentalDto
import com.grapsee.shop.core.network.ReturnDto
import com.grapsee.shop.core.outfit.OutfitStore
import com.grapsee.shop.ui.components.EmptyState
import com.grapsee.shop.ui.components.ErrorState
import com.grapsee.shop.ui.components.LoadingBox
import com.grapsee.shop.ui.components.ProductCard
import kotlinx.coroutines.launch

// ------------------------------------------------------------ shared bits

@Composable
internal fun ToolsHeader(title: String, subtitle: String?, onBack: () -> Unit) {
    Surface(tonalElevation = 2.dp) {
        Row(Modifier.fillMaxWidth().padding(horizontal = 4.dp, vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back") }
            Column {
                Text(title, style = MaterialTheme.typography.titleLarge)
                if (!subtitle.isNullOrEmpty()) {
                    Text(subtitle, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
    }
}

@Composable
internal fun ToolCard(content: @Composable () -> Unit) {
    Surface(shape = RoundedCornerShape(16.dp), tonalElevation = 1.dp, modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) { content() }
    }
}

@Composable
internal fun KeyValueMap(map: Map<String, String>) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        map.entries.sortedBy { it.key }.forEach { (k, v) ->
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(k.replaceFirstChar { it.uppercase() }, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.weight(1f))
                Text(v, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
            }
        }
    }
}

// ----------------------------------------------------------------- track

class TrackViewModel : ViewModel() {
    var query by mutableStateOf(""); private set
    var results by mutableStateOf<List<OrderDto>>(emptyList()); private set
    var searching by mutableStateOf(false); private set
    var searched by mutableStateOf(false); private set
    fun updateQuery(v: String) { query = v }
    fun search() {
        val q = query.trim()
        if (q.isEmpty()) return
        viewModelScope.launch {
            searching = true
            // Order id match first, else fall back to email lookup.
            val byId = runCatching { ApiClient.order(q) }.getOrNull()
            results = if (byId != null) listOf(byId) else ApiClient.orders(q)
            searching = false
            searched = true
        }
    }
}

@Composable
fun TrackScreen(onBack: () -> Unit, onOrder: (String) -> Unit, vm: TrackViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolsHeader("Track Order", "Live status of your delivery", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    Text("Order ID or email", style = MaterialTheme.typography.titleSmall)
                    OutlinedTextField(value = vm.query, onValueChange = vm::updateQuery, label = { Text("e.g. ord_123 or you@mail.com") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    Button(onClick = vm::search, enabled = vm.query.isNotBlank() && !vm.searching, modifier = Modifier.fillMaxWidth()) {
                        Text(if (vm.searching) "Searching…" else "Track")
                    }
                }
            }
            items(vm.results, key = { it.id }) { order ->
                ToolCard {
                    Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(8.dp)).clickable { onOrder(order.id) }, verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text("Order ${order.id.take(12)}", style = MaterialTheme.typography.titleSmall)
                            Text("${order.status.uppercase()} · ${order.items?.sumOf { it.quantity } ?: 0} items", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.primary)
                        }
                        Text("→", color = MaterialTheme.colorScheme.primary)
                    }
                }
            }
            if (vm.searched && vm.results.isEmpty() && !vm.searching) {
                item { EmptyState(title = "No orders found", subtitle = "Check the ID or email and retry") }
            }
        }
    }
}

// --------------------------------------------------------------- returns

class ReturnsViewModel : ViewModel() {
    var items by mutableStateOf<List<ReturnDto>>(emptyList()); private set
    var loading by mutableStateOf(true); private set
    var orderId by mutableStateOf(""); private set
    var reason by mutableStateOf(""); private set
    var submitting by mutableStateOf(false); private set
    var submitted by mutableStateOf<Boolean?>(null); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            items = ApiClient.returns()
            loading = false
        }
    }
    fun submit() {
        viewModelScope.launch {
            submitting = true
            submitted = ApiClient.requestReturn(orderId.trim(), reason.trim())
            if (submitted == true) items = ApiClient.returns()
            submitting = false
        }
    }
    fun updateOrderId(v: String) { orderId = v; submitted = null }
    fun updateReason(v: String) { reason = v; submitted = null }
}

@Composable
fun ReturnsScreen(onBack: () -> Unit, onLogin: () -> Unit, vm: ReturnsViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolsHeader("Returns", "Request & follow returns", onBack)
        Box(Modifier.weight(1f)) {
            if (vm.loading) LoadingBox(Modifier.fillMaxSize())
            else LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                item {
                    ToolCard {
                        Text("Start a return", style = MaterialTheme.typography.titleSmall)
                        OutlinedTextField(value = vm.orderId, onValueChange = vm::updateOrderId, label = { Text("Order ID") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                        OutlinedTextField(value = vm.reason, onValueChange = vm::updateReason, label = { Text("Reason") }, modifier = Modifier.fillMaxWidth())
                        Button(onClick = vm::submit, enabled = vm.orderId.isNotBlank() && vm.reason.isNotBlank() && !vm.submitting, modifier = Modifier.fillMaxWidth()) {
                            Text(if (vm.submitting) "Submitting…" else "Submit request")
                        }
                        vm.submitted?.let {
                            Text(if (it) "✅ Request received" else "❌ Couldn't submit — sign in and retry", color = if (it) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
                            if (!it) Button(onClick = onLogin) { Text("Sign in") }
                        }
                    }
                }
                if (vm.items.isEmpty()) {
                    item { EmptyState(title = "No returns yet", subtitle = "Your return requests appear here") }
                } else {
                    items(vm.items, key = { it.id }) { ret ->
                        ToolCard {
                            Text("Order ${ret.orderId.take(12)}", style = MaterialTheme.typography.titleSmall)
                            Text("${ret.status.orEmpty().uppercase()} · ${ret.reason.orEmpty()}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }
        }
    }
}

// -------------------------------------------------------------- shipping

class ShippingViewModel : ViewModel() {
    var destination by mutableStateOf(""); private set
    var quote by mutableStateOf<Map<String, String>>(emptyMap()); private set
    var loading by mutableStateOf(false); private set
    fun updateDestination(v: String) { destination = v }
    fun calculate() {
        if (destination.isBlank()) return
        viewModelScope.launch {
            loading = true
            quote = ApiClient.rawMap("/api/shipping/calculator", "{\"destination\":\"${destination.trim()}\"}")
            loading = false
        }
    }
}

@Composable
fun ShippingScreen(onBack: () -> Unit, vm: ShippingViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolsHeader("Shipping Calculator", "Estimate cost & time", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    OutlinedTextField(value = vm.destination, onValueChange = vm::updateDestination, label = { Text("Destination city / country") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    Button(onClick = vm::calculate, enabled = vm.destination.isNotBlank() && !vm.loading, modifier = Modifier.fillMaxWidth()) {
                        Text(if (vm.loading) "Calculating…" else "Calculate")
                    }
                }
            }
            if (vm.quote.isNotEmpty()) {
                item { ToolCard { KeyValueMap(vm.quote) } }
            }
        }
    }
}

// ----------------------------------------------------------- installments

class InstallmentsViewModel : ViewModel() {
    var amount by mutableStateOf(""); private set
    var months by mutableStateOf("12"); private set
    var plan by mutableStateOf<Map<String, String>>(emptyMap()); private set
    var loading by mutableStateOf(false); private set
    var error by mutableStateOf(false); private set
    fun updateAmount(v: String) { amount = v.filter { it.isDigit() || it == '.' } }
    fun updateMonths(v: String) { months = v.filter { it.isDigit() }.take(2) }
    fun calculate() {
        if (amount.isBlank() || months.isBlank()) return
        viewModelScope.launch {
            loading = true
            error = false
            val res = ApiClient.rawMap("/api/installments/calculate", "{\"amount\":$amount,\"months\":$months}")
            plan = res
            error = res.isEmpty()
            loading = false
        }
    }
}

@Composable
fun InstallmentsScreen(onBack: () -> Unit, onLogin: () -> Unit, vm: InstallmentsViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolsHeader("Installments", "0% EMI plans", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    OutlinedTextField(value = vm.amount, onValueChange = vm::updateAmount, label = { Text("Amount") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(value = vm.months, onValueChange = vm::updateMonths, label = { Text("Months") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    Button(onClick = vm::calculate, enabled = vm.amount.isNotBlank() && vm.months.isNotBlank() && !vm.loading, modifier = Modifier.fillMaxWidth()) {
                        Text(if (vm.loading) "Calculating…" else "Calculate plan")
                    }
                    if (vm.error) {
                        Text("Sign in to calculate EMI plans", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.error)
                        Button(onClick = onLogin) { Text("Sign in") }
                    }
                }
            }
            if (vm.plan.isNotEmpty()) {
                item { ToolCard { KeyValueMap(vm.plan) } }
            }
        }
    }
}

// -------------------------------------------------------------- trade-in

class TradeInViewModel : ViewModel() {
    var products by mutableStateOf<List<Product>>(emptyList()); private set
    var loading by mutableStateOf(true); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            products = ApiClient.tradeInProducts()
            loading = false
        }
    }
}

@Composable
fun TradeInScreen(onBack: () -> Unit, onProduct: (String) -> Unit, vm: TradeInViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolsHeader("Trade-In", "Up to 55% value for your gear", onBack)
        Box(Modifier.weight(1f)) {
            if (vm.loading) LoadingBox(Modifier.fillMaxSize())
            else if (vm.products.isEmpty()) EmptyState(title = "No trade-in offers", subtitle = "Check back soon", modifier = Modifier.fillMaxSize())
            else LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(vm.products, key = { it.id }) { product ->
                    ProductCard(product) { onProduct(product.id) }
                }
            }
        }
    }
}

// ------------------------------------------------------------------- try

class TryViewModel : ViewModel() {
    var productId by mutableStateOf(""); private set
    var result by mutableStateOf<Map<String, String>>(emptyMap()); private set
    var requested by mutableStateOf<Boolean?>(null); private set
    var loading by mutableStateOf(false); private set
    fun updateProductId(v: String) { productId = v.trim(); requested = null }
    fun check() {
        if (productId.isBlank()) return
        viewModelScope.launch {
            loading = true
            result = ApiClient.rawMap("/api/try-before-buy/trial?productId=${productId}")
            loading = false
        }
    }
    fun request() {
        viewModelScope.launch {
            loading = true
            requested = ApiClient.requestTrial(productId)
            loading = false
        }
    }
}

@Composable
fun TryScreen(onBack: () -> Unit, vm: TryViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolsHeader("Try Before You Buy", "Trial eligible products", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    OutlinedTextField(value = vm.productId, onValueChange = vm::updateProductId, label = { Text("Product ID") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    Button(onClick = vm::check, enabled = vm.productId.isNotBlank() && !vm.loading, modifier = Modifier.fillMaxWidth()) {
                        Text(if (vm.loading) "Checking…" else "Check eligibility")
                    }
                }
            }
            if (vm.result.isNotEmpty()) {
                item {
                    ToolCard {
                        KeyValueMap(vm.result)
                        Button(onClick = vm::request, modifier = Modifier.fillMaxWidth()) { Text("Request trial") }
                        vm.requested?.let {
                            Text(if (it) "✅ Trial requested" else "❌ Request failed — sign in and retry", color = if (it) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
                        }
                    }
                }
            }
        }
    }
}

// ---------------------------------------------------------------- outfit

class OutfitMakerViewModel : ViewModel() {
    var query by mutableStateOf(""); private set
    var results by mutableStateOf<List<Product>>(emptyList()); private set
    var searching by mutableStateOf(false); private set
    var boardIds by mutableStateOf<List<String>>(emptyList()); private set
    var boardNames by mutableStateOf<List<String>>(emptyList()); private set
    var outfitName by mutableStateOf(""); private set

    fun updateQuery(v: String) { query = v }
    fun updateOutfitName(v: String) { outfitName = v }
    fun search() {
        if (query.isBlank()) return
        viewModelScope.launch {
            searching = true
            results = ApiClient.search(query).items
            searching = false
        }
    }
    fun toggleBoard(product: Product) {
        boardIds = if (boardIds.contains(product.id)) boardIds - product.id else boardIds + product.id
        boardNames = if (boardNames.contains(product.name)) boardNames - product.name else boardNames + product.name
    }
    fun save() {
        if (outfitName.isBlank() || boardIds.isEmpty()) return
        viewModelScope.launch {
            OutfitStore.add(outfitName.trim(), boardIds, boardNames)
            outfitName = ""
            boardIds = emptyList()
            boardNames = emptyList()
        }
    }
}

@Composable
fun OutfitMakerScreen(onBack: () -> Unit, vm: OutfitMakerViewModel = viewModel()) {
    val saved by OutfitStore.outfits.collectAsState()
    val scope = androidx.compose.runtime.rememberCoroutineScope()
    LaunchedEffect(Unit) { OutfitStore.start() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolsHeader("Outfit Maker", "Compose & save looks", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    Text("1 · Find pieces", style = MaterialTheme.typography.titleSmall)
                    OutlinedTextField(value = vm.query, onValueChange = vm::updateQuery, label = { Text("Search products") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    Button(onClick = vm::search, enabled = vm.query.isNotBlank() && !vm.searching, modifier = Modifier.fillMaxWidth()) {
                        Text(if (vm.searching) "Searching…" else "Search")
                    }
                }
            }
            if (vm.results.isNotEmpty()) {
                item { Text("Tap to add to the board (${vm.boardIds.size} picked)", style = MaterialTheme.typography.titleSmall) }
                items(vm.results, key = { it.id }) { product ->
                    val picked = vm.boardIds.contains(product.id)
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = if (picked) MaterialTheme.colorScheme.primary.copy(alpha = 0.12f) else MaterialTheme.colorScheme.surface,
                        tonalElevation = 1.dp,
                        modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).clickable { vm.toggleBoard(product) },
                    ) {
                        Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text(if (picked) "✅" else "➕")
                            Text(product.name, modifier = Modifier.weight(1f), maxLines = 1, overflow = TextOverflow.Ellipsis, style = MaterialTheme.typography.bodyMedium)
                        }
                    }
                }
            }
            if (vm.boardIds.isNotEmpty()) {
                item {
                    ToolCard {
                        Text("2 · Name & save (${vm.boardIds.size} pieces)", style = MaterialTheme.typography.titleSmall)
                        OutlinedTextField(value = vm.outfitName, onValueChange = vm::updateOutfitName, label = { Text("Outfit name") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                        Button(onClick = vm::save, enabled = vm.outfitName.isNotBlank(), modifier = Modifier.fillMaxWidth()) { Text("Save outfit") }
                    }
                }
            }
            if (saved.isNotEmpty()) {
                item { Text("My outfits", style = MaterialTheme.typography.titleSmall) }
                items(saved, key = { it.id }) { outfit ->
                    ToolCard {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Column(Modifier.weight(1f)) {
                                Text(outfit.name, style = MaterialTheme.typography.titleSmall)
                                Text(outfit.productNames.joinToString(", "), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 2, overflow = TextOverflow.Ellipsis)
                            }
                            Text("🗑", modifier = Modifier.clip(RoundedCornerShape(8.dp)).clickable {
                                scope.launch { OutfitStore.remove(outfit.id) }
                            }.padding(8.dp))
                        }
                    }
                }
            }
        }
    }
}

// ---------------------------------------------------------------- rental

class RentalViewModel : ViewModel() {
    var products by mutableStateOf<List<Product>>(emptyList()); private set
    var rentals by mutableStateOf<List<RentalDto>>(emptyList()); private set
    var loading by mutableStateOf(true); private set
    var renting by mutableStateOf<String?>(null); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            products = ApiClient.rentalProducts()
            rentals = ApiClient.myRentals()
            loading = false
        }
    }
    fun rent(productId: String) {
        viewModelScope.launch {
            renting = productId
            if (ApiClient.requestRental(productId)) rentals = ApiClient.myRentals()
            renting = null
        }
    }
}

@Composable
fun RentalScreen(onBack: () -> Unit, onProduct: (String) -> Unit, onLogin: () -> Unit, vm: RentalViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolsHeader("Rent Products", "From 500/day", onBack)
        Box(Modifier.weight(1f)) {
            if (vm.loading) LoadingBox(Modifier.fillMaxSize())
            else LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                if (vm.rentals.isNotEmpty()) {
                    item { Text("My rentals", style = MaterialTheme.typography.titleSmall) }
                    items(vm.rentals, key = { it.id }) { rental ->
                        ToolCard {
                            Text(rental.productId.take(12), style = MaterialTheme.typography.titleSmall)
                            Text("${rental.status.orEmpty().uppercase()} · ${rental.startDate.orEmpty()} → ${rental.endDate.orEmpty()}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
                item { Text("Rentable now", style = MaterialTheme.typography.titleSmall) }
                if (vm.products.isEmpty()) {
                    item { EmptyState(title = "Nothing rentable", subtitle = "Check back soon") }
                } else {
                    items(vm.products, key = { it.id }) { product ->
                        ToolCard {
                            Text(product.name, style = MaterialTheme.typography.titleSmall, maxLines = 1, overflow = TextOverflow.Ellipsis)
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Button(onClick = { onProduct(product.id) }) { Text("Details") }
                                Button(onClick = { vm.rent(product.id) }, enabled = vm.renting != product.id) {
                                    Text(if (vm.renting == product.id) "…" else "Rent")
                                }
                            }
                        }
                    }
                }
                item {
                    Button(onClick = onLogin, modifier = Modifier.fillMaxWidth()) { Text("Sign in for rentals") }
                }
            }
        }
    }
}

// -------------------------------------------------------------- downloads

class DownloadsViewModel : ViewModel() {
    var products by mutableStateOf<List<Product>>(emptyList()); private set
    var mine by mutableStateOf<List<DownloadDto>>(emptyList()); private set
    var loading by mutableStateOf(true); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            products = ApiClient.downloadProducts()
            mine = ApiClient.myDownloads()
            loading = false
        }
    }
}

@Composable
fun DownloadsScreen(onBack: () -> Unit, onProduct: (String) -> Unit, vm: DownloadsViewModel = viewModel()) {
    val context = LocalContext.current
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolsHeader("Digital Downloads", "eBooks · Software · Templates · Courses", onBack)
        Box(Modifier.weight(1f)) {
            if (vm.loading) LoadingBox(Modifier.fillMaxSize())
            else LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                if (vm.mine.isNotEmpty()) {
                    item { Text("My downloads", style = MaterialTheme.typography.titleSmall) }
                    items(vm.mine, key = { it.productId }) { dl ->
                        ToolCard {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Column(Modifier.weight(1f)) {
                                    Text(dl.productName ?: dl.productId.take(12), style = MaterialTheme.typography.titleSmall, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                    Text("${dl.downloadsRemaining} left · ${dl.totalDownloads} total", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                                Button(onClick = {
                                    val req = DownloadManager.Request(Uri.parse("${ApiClient.apiBase}/api/digital-downloads/download?productId=${dl.productId}"))
                                        .setTitle(dl.productName ?: "download")
                                        .setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, "${dl.productId}.bin")
                                        .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                                    (context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager).enqueue(req)
                                }) { Text("Save") }
                            }
                        }
                    }
                }
                item { Text("Browse files", style = MaterialTheme.typography.titleSmall) }
                items(vm.products, key = { it.id }) { product ->
                    ProductCard(product) { onProduct(product.id) }
                }
                if (vm.products.isEmpty() && vm.mine.isEmpty()) {
                    item { EmptyState(title = "No downloads yet", subtitle = "Buy a digital product to see it here") }
                }
            }
        }
    }
}

// -------------------------------------------------------------- group buy

class GroupBuyViewModel : ViewModel() {
    var deals by mutableStateOf<List<GroupBuyDto>>(emptyList()); private set
    var loading by mutableStateOf(true); private set
    var joining by mutableStateOf<String?>(null); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            deals = ApiClient.groupBuys()
            loading = false
        }
    }
    fun join(id: String) {
        viewModelScope.launch {
            joining = id
            if (ApiClient.joinGroupBuy(id)) deals = ApiClient.groupBuys()
            joining = null
        }
    }
}

@Composable
fun GroupBuyScreen(onBack: () -> Unit, onProduct: (String) -> Unit, vm: GroupBuyViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolsHeader("Group Buy", "Buy together, save together", onBack)
        Box(Modifier.weight(1f)) {
            if (vm.loading) LoadingBox(Modifier.fillMaxSize())
            else if (vm.deals.isEmpty()) EmptyState(title = "No group buys", subtitle = "New groups open daily", modifier = Modifier.fillMaxSize())
            else LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(vm.deals, key = { it.id }) { deal ->
                    ToolCard {
                        Text(deal.displayTitle, style = MaterialTheme.typography.titleMedium, maxLines = 2, overflow = TextOverflow.Ellipsis)
                        if (deal.deal != 0.0) Text("Up to ${deal.deal}% off in a group", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.primary)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            if (!deal.productId.isNullOrEmpty()) {
                                Button(onClick = { onProduct(deal.productId!!) }) { Text("Details") }
                            }
                            Button(onClick = { vm.join(deal.id) }, enabled = !deal.joined && vm.joining != deal.id) {
                                Text(if (deal.joined) "Joined ✓" else if (vm.joining == deal.id) "…" else "Join group")
                            }
                        }
                    }
                }
            }
        }
    }
}

// ------------------------------------------------------------- price drop

class PriceDropViewModel : ViewModel() {
    var drops by mutableStateOf<List<Product>>(emptyList()); private set
    var loading by mutableStateOf(true); private set
    var tracked by mutableStateOf<Set<String>>(emptySet()); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            drops = ApiClient.priceDrops()
            loading = false
        }
    }
    fun track(id: String) {
        viewModelScope.launch {
            if (ApiClient.trackPriceAlert(id)) tracked = tracked + id
        }
    }
}

@Composable
fun PriceDropScreen(onBack: () -> Unit, onProduct: (String) -> Unit, vm: PriceDropViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolsHeader("Price Drops", "Catch every dip", onBack)
        Box(Modifier.weight(1f)) {
            if (vm.loading) LoadingBox(Modifier.fillMaxSize())
            else if (vm.drops.isEmpty()) EmptyState(title = "No drops right now", subtitle = "Prices update hourly", modifier = Modifier.fillMaxSize())
            else LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(vm.drops, key = { it.id }) { product ->
                    ToolCard {
                        Text(product.name, style = MaterialTheme.typography.titleSmall, maxLines = 1, overflow = TextOverflow.Ellipsis)
                        com.grapsee.shop.ui.components.PriceText(product.price, product.comparePrice)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(onClick = { onProduct(product.id) }) { Text("Details") }
                            Button(onClick = { vm.track(product.id) }, enabled = !vm.tracked.contains(product.id)) {
                                Text(if (vm.tracked.contains(product.id)) "Tracking ✓" else "Track")
                            }
                        }
                    }
                }
            }
        }
    }
}
