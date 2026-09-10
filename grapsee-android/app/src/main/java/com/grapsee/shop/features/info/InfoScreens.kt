package com.grapsee.shop.features.info

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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import com.grapsee.shop.core.cart.CartStore
import com.grapsee.shop.core.history.RecentlyViewedStore
import com.grapsee.shop.core.network.ApiClient
import com.grapsee.shop.core.network.CertProgramDto
import com.grapsee.shop.core.network.DigitalItemDto
import com.grapsee.shop.core.network.PriceAlertDto
import com.grapsee.shop.core.network.Product
import com.grapsee.shop.core.network.StoreDto
import com.grapsee.shop.core.network.SubscriptionPlanDto
import com.grapsee.shop.ui.components.EmptyState
import com.grapsee.shop.ui.components.ErrorState
import com.grapsee.shop.ui.components.LoadingBox
import com.grapsee.shop.ui.components.PriceText
import com.grapsee.shop.ui.components.ProductCard
import kotlinx.coroutines.launch

// ------------------------------------------------------------ shared bits

@Composable
internal fun InfoHeader(title: String, subtitle: String?, onBack: () -> Unit) {
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
internal fun InfoCard(content: @Composable () -> Unit) {
    Surface(shape = RoundedCornerShape(16.dp), tonalElevation = 1.dp, modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) { content() }
    }
}

@Composable
private fun DocScreen(title: String, subtitle: String, sections: List<InfoSection>, onBack: () -> Unit) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        InfoHeader(title, subtitle, onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            sections.forEach { section ->
                item(key = section.id) {
                    InfoCard {
                        Text(section.title, style = MaterialTheme.typography.titleMedium)
                        section.paras.forEach { para ->
                            Text(para, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }
        }
    }
}

// ----------------------------------------------------------------- about

@Composable
fun AboutScreen(onBack: () -> Unit, onShop: () -> Unit) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        InfoHeader("About Grapsee", "Grapsee Technologies", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                InfoCard {
                    Text("🏬  The premium digital mall", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary)
                    Text(
                        "Grapsee started as a small web development studio and grew into a premium digital marketplace — websites, apps, DevOps, design, AI and more, crafted by elite engineers.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Button(onClick = onShop, modifier = Modifier.fillMaxWidth()) { Text("Shop the mall →") }
                }
            }
            item { Text("Our journey", style = MaterialTheme.typography.titleSmall) }
            items(milestones, key = { it.year + it.event }) { m ->
                InfoCard {
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text(m.year, style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                        Column {
                            Text(m.event, style = MaterialTheme.typography.titleSmall)
                            Text(m.desc, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }
        }
    }
}

// ------------------------------------------------------- privacy + terms

@Composable
fun PrivacyScreen(onBack: () -> Unit) {
    DocScreen("Privacy Policy", "How we handle your data", privacySections, onBack)
}

@Composable
fun TermsScreen(onBack: () -> Unit) {
    DocScreen("Terms of Service", "The rules of the mall", termsSections, onBack)
}

// ------------------------------------------------------------------- faq

class FaqFullViewModel : ViewModel() {
    var query by mutableStateOf(""); private set
    fun updateQuery(v: String) { query = v }
    internal val filtered: List<FaqEntry>
        get() {
            val q = query.trim().lowercase()
            if (q.isEmpty()) return faqEntries
            return faqEntries.filter { it.q.lowercase().contains(q) || it.a.lowercase().contains(q) }
        }
}

@Composable
fun FaqFullScreen(onBack: () -> Unit, onContact: () -> Unit, vm: FaqFullViewModel = viewModel()) {
    var open by mutableStateOf<Set<String>>(emptySet())
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        InfoHeader("FAQ", "${faqEntries.size} answers", onBack)
        OutlinedTextField(
            value = vm.query,
            onValueChange = vm::updateQuery,
            label = { Text("Search answers") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
        )
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            items(vm.filtered, key = { it.q }) { entry ->
                val isOpen = open.contains(entry.q)
                InfoCard {
                    Row(
                        Modifier.fillMaxWidth().clip(RoundedCornerShape(8.dp)).clickable {
                            open = if (isOpen) open - entry.q else open + entry.q
                        },
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Text(entry.q, modifier = Modifier.weight(1f), style = MaterialTheme.typography.titleSmall)
                        Text(if (isOpen) "▾" else "▸", color = MaterialTheme.colorScheme.primary)
                    }
                    if (isOpen) {
                        Text(entry.a, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
            if (vm.filtered.isEmpty()) {
                item { EmptyState(title = "No matches", subtitle = "Try different words") }
            }
            item {
                InfoCard {
                    Text("Still stuck?", style = MaterialTheme.typography.titleSmall)
                    Button(onClick = onContact, modifier = Modifier.fillMaxWidth()) { Text("Contact support") }
                }
            }
        }
    }
}

// ---------------------------------------------------------------- compare

class CompareViewModel : ViewModel() {
    var query by mutableStateOf(""); private set
    var results by mutableStateOf<List<Product>>(emptyList()); private set
    var searching by mutableStateOf(false); private set
    var picked by mutableStateOf<List<Product>>(emptyList()); private set
    fun updateQuery(v: String) { query = v }
    fun search() {
        if (query.isBlank()) return
        viewModelScope.launch {
            searching = true
            results = ApiClient.search(query).items.filterNot { r -> picked.any { it.id == r.id } }
            searching = false
        }
    }
    fun add(product: Product) {
        if (picked.size < 3 && picked.none { it.id == product.id }) {
            picked = picked + product
            results = results.filterNot { it.id == product.id }
        }
    }
    fun remove(id: String) { picked = picked.filterNot { it.id == id } }
    fun clear() { picked = emptyList() }
}

@Composable
fun CompareScreen(onBack: () -> Unit, onProduct: (String) -> Unit, onCart: () -> Unit, vm: CompareViewModel = viewModel()) {
    val scope = androidx.compose.runtime.rememberCoroutineScope()
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        InfoHeader("Compare", "Up to 3 side by side", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                InfoCard {
                    OutlinedTextField(value = vm.query, onValueChange = vm::updateQuery, label = { Text("Search products to compare") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    Button(onClick = vm::search, enabled = vm.query.isNotBlank() && !vm.searching, modifier = Modifier.fillMaxWidth()) {
                        Text(if (vm.searching) "Searching…" else "Search")
                    }
                }
            }
            if (vm.results.isNotEmpty()) {
                item { Text("Tap + to compare", style = MaterialTheme.typography.titleSmall) }
                items(vm.results.take(5), key = { it.id }) { product ->
                    InfoCard {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(product.name, modifier = Modifier.weight(1f), maxLines = 1, overflow = TextOverflow.Ellipsis, style = MaterialTheme.typography.bodyMedium)
                            Text("＋", modifier = Modifier.clip(RoundedCornerShape(8.dp)).clickable { vm.add(product) }.padding(8.dp), color = MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.titleMedium)
                        }
                    }
                }
            }
            if (vm.picked.isNotEmpty()) {
                item {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Text("Comparing ${vm.picked.size}/3", style = MaterialTheme.typography.titleSmall)
                        Text("Clear", modifier = Modifier.clip(RoundedCornerShape(8.dp)).clickable { vm.clear() }.padding(8.dp), color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.labelLarge)
                    }
                }
                item {
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        vm.picked.forEach { product ->
                            InfoCard {
                                Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                    Text(product.name, style = MaterialTheme.typography.titleSmall, maxLines = 2, overflow = TextOverflow.Ellipsis, modifier = Modifier.fillMaxWidth())
                                    PriceText(product.price, product.comparePrice)
                                    Text("⭐ ${product.rating} (${product.reviewCount})", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    Text("Stock: ${product.inventory}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    Button(onClick = {
                                        scope.launch {
                                            CartStore.add(
                                                com.grapsee.shop.core.network.CartLine(
                                                    id = "${product.id}-${System.currentTimeMillis()}",
                                                    productId = product.id,
                                                    name = product.name,
                                                    price = product.price,
                                                    quantity = 1,
                                                    imageUrl = product.imageUrl,
                                                ),
                                            )
                                            onCart()
                                        }
                                    }) { Text("Add") }
                                    Text("Remove", modifier = Modifier.clip(RoundedCornerShape(8.dp)).clickable { vm.remove(product.id) }.padding(4.dp), color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.labelSmall)
                                }
                            }
                        }
                    }
                }
                item {
                    Button(onClick = { vm.picked.firstOrNull()?.let { onProduct(it.id) } }, modifier = Modifier.fillMaxWidth()) { Text("Open first product →") }
                }
            } else {
                item { EmptyState(title = "Pick products", subtitle = "Search above, then tap + to compare") }
            }
        }
    }
}

// -------------------------------------------------------- recently viewed

@Composable
fun RecentlyViewedFullScreen(onBack: () -> Unit, onProduct: (String) -> Unit, onBrowse: () -> Unit) {
    val history by RecentlyViewedStore.items.collectAsState()
    val scope = androidx.compose.runtime.rememberCoroutineScope()
    LaunchedEffect(Unit) { RecentlyViewedStore.start() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        InfoHeader("Recently Viewed", if (history.isEmpty()) null else "${history.size} items", onBack)
        Box(Modifier.weight(1f)) {
            if (history.isEmpty()) {
                EmptyState(title = "No browsing history", subtitle = "Products you open appear here", modifier = Modifier.fillMaxSize())
            } else {
                LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    item {
                        Button(onClick = { scope.launch { RecentlyViewedStore.clear() } }, modifier = Modifier.fillMaxWidth()) { Text("Clear history") }
                    }
                    items(history, key = { it.id }) { product ->
                        ProductCard(product) { onProduct(product.id) }
                    }
                    item {
                        Button(onClick = onBrowse, modifier = Modifier.fillMaxWidth()) { Text("Browse more") }
                    }
                }
            }
        }
    }
}

// ----------------------------------------------------------------- stores

class StoresViewModel : ViewModel() {
    var city by mutableStateOf(""); private set
    var stores by mutableStateOf<List<StoreDto>>(emptyList()); private set
    var loading by mutableStateOf(true); private set
    var error by mutableStateOf<String?>(null); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            runCatching { ApiClient.stores(city.trim()) }
                .onSuccess { stores = it; loading = false }
                .onFailure { error = it.message; loading = false }
        }
    }
    fun updateCity(v: String) { city = v }
}

@Composable
fun StoresScreen(onBack: () -> Unit, vm: StoresViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        InfoHeader("Stores", "Find us near you", onBack)
        OutlinedTextField(
            value = vm.city,
            onValueChange = vm::updateCity,
            label = { Text("City") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
        )
        Box(Modifier.weight(1f)) {
            when {
                vm.loading -> LoadingBox(Modifier.fillMaxSize())
                vm.error != null && vm.stores.isEmpty() -> ErrorState(vm.error.orEmpty(), onRetry = vm::load, modifier = Modifier.fillMaxSize())
                vm.stores.isEmpty() -> EmptyState(title = "No stores found", subtitle = "Try another city", modifier = Modifier.fillMaxSize())
                else -> LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    item {
                        Button(onClick = vm::load, modifier = Modifier.fillMaxWidth()) { Text("Search${if (vm.city.isNotBlank()) " in ${vm.city}" else ""}") }
                    }
                    items(vm.stores, key = { it.id }) { store ->
                        InfoCard {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Text(store.name, style = MaterialTheme.typography.titleSmall, modifier = Modifier.weight(1f))
                                Text(if (store.isOpen) "🟢 Open" else "🌙 Closed", style = MaterialTheme.typography.labelSmall, color = if (store.isOpen) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                            if (!store.address.isNullOrEmpty()) Text(store.address.orEmpty(), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                if (!store.city.isNullOrEmpty()) Text(store.city.orEmpty(), style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                if (!store.formattedDistance.isNullOrEmpty()) Text(store.formattedDistance.orEmpty(), style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.primary)
                                if (!store.phone.isNullOrEmpty()) Text(store.phone.orEmpty(), style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }
                    }
                }
            }
        }
    }
}

// ------------------------------------------------------------ price alerts

class PriceAlertsViewModel : ViewModel() {
    var alerts by mutableStateOf<List<PriceAlertDto>>(emptyList()); private set
    var loading by mutableStateOf(true); private set
    var productId by mutableStateOf(""); private set
    var productName by mutableStateOf(""); private set
    var target by mutableStateOf(""); private set
    var creating by mutableStateOf(false); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            alerts = ApiClient.priceAlerts()
            loading = false
        }
    }
    fun updateProductId(v: String) { productId = v.trim() }
    fun updateProductName(v: String) { productName = v }
    fun updateTarget(v: String) { target = v.filter { it.isDigit() || it == '.' } }
    fun create() {
        val tp = target.toDoubleOrNull() ?: return
        viewModelScope.launch {
            creating = true
            if (ApiClient.priceAlertCreate(productId, productName.trim(), tp)) {
                alerts = ApiClient.priceAlerts()
                productId = ""
                productName = ""
                target = ""
            }
            creating = false
        }
    }
    fun delete(id: String) {
        viewModelScope.launch {
            if (ApiClient.priceAlertDelete(id)) alerts = alerts.filterNot { it.id == id }
        }
    }
}

@Composable
fun PriceAlertsScreen(onBack: () -> Unit, onLogin: () -> Unit, vm: PriceAlertsViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        InfoHeader("Price Alerts", "We ping you on drops", onBack)
        Box(Modifier.weight(1f)) {
            if (vm.loading) LoadingBox(Modifier.fillMaxSize())
            else LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                item {
                    InfoCard {
                        Text("New alert", style = MaterialTheme.typography.titleSmall)
                        OutlinedTextField(value = vm.productId, onValueChange = vm::updateProductId, label = { Text("Product ID") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                        OutlinedTextField(value = vm.productName, onValueChange = vm::updateProductName, label = { Text("Product name") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                        OutlinedTextField(value = vm.target, onValueChange = vm::updateTarget, label = { Text("Target price") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                        Button(onClick = vm::create, enabled = vm.productId.isNotBlank() && vm.target.isNotBlank() && !vm.creating, modifier = Modifier.fillMaxWidth()) {
                            Text(if (vm.creating) "Creating…" else "Create alert")
                        }
                    }
                }
                if (vm.alerts.isEmpty()) {
                    item { EmptyState(title = "No alerts yet", subtitle = "Sign in to sync alerts across devices") }
                    item { Button(onClick = onLogin, modifier = Modifier.fillMaxWidth()) { Text("Sign in") } }
                } else {
                    items(vm.alerts, key = { it.id }) { alert ->
                        InfoCard {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Column(Modifier.weight(1f)) {
                                    Text(alert.productName ?: alert.productId.take(12), style = MaterialTheme.typography.titleSmall, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                    Text("Target $${alert.targetPrice}" + (alert.currentPrice?.let { " · now $$it" } ?: ""), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.primary)
                                }
                                Text("🗑", modifier = Modifier.clip(RoundedCornerShape(8.dp)).clickable { vm.delete(alert.id) }.padding(8.dp))
                            }
                        }
                    }
                }
            }
        }
    }
}

// ----------------------------------------------------------- subscriptions

class SubscriptionsViewModel : ViewModel() {
    var plans by mutableStateOf<List<SubscriptionPlanDto>>(emptyList()); private set
    var loading by mutableStateOf(true); private set
    var error by mutableStateOf<String?>(null); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            runCatching { ApiClient.subscriptionPlans() }
                .onSuccess { plans = it; loading = false }
                .onFailure { error = it.message; loading = false }
        }
    }
}

@Composable
fun SubscriptionsScreen(onBack: () -> Unit, vm: SubscriptionsViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        InfoHeader("Subscriptions", "Plans that renew themselves", onBack)
        Box(Modifier.weight(1f)) {
            when {
                vm.loading -> LoadingBox(Modifier.fillMaxSize())
                vm.error != null && vm.plans.isEmpty() -> ErrorState(vm.error.orEmpty(), onRetry = vm::load, modifier = Modifier.fillMaxSize())
                vm.plans.isEmpty() -> EmptyState(title = "No plans yet", subtitle = "Check back soon", modifier = Modifier.fillMaxSize())
                else -> LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    items(vm.plans, key = { it.id }) { plan ->
                        InfoCard {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Column(Modifier.weight(1f)) {
                                    Text(plan.name, style = MaterialTheme.typography.titleMedium)
                                    if (!plan.description.isNullOrEmpty()) {
                                        Text(plan.description.orEmpty(), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 2, overflow = TextOverflow.Ellipsis)
                                    }
                                }
                                Text("$${plan.monthlyPrice}/mo", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                            }
                            plan.features.forEach { Text("• $it", style = MaterialTheme.typography.bodySmall) }
                        }
                    }
                }
            }
        }
    }
}

// -------------------------------------------------------------- digital hub

class DigitalHubViewModel : ViewModel() {
    var kind by mutableStateOf("courses"); private set
    var items by mutableStateOf<List<DigitalItemDto>>(emptyList()); private set
    var loading by mutableStateOf(true); private set
    val kinds = listOf("courses" to "Courses", "templates" to "Templates", "ui-kits" to "UI Kits", "snippets" to "Snippets", "products" to "Products")
    init { load() }
    fun pick(next: String) {
        kind = next
        load()
    }
    fun load() {
        viewModelScope.launch {
            loading = true
            items = ApiClient.digitalItems(kind)
            loading = false
        }
    }
}

@Composable
fun DigitalHubScreen(onBack: () -> Unit, initialKind: String = "courses", vm: DigitalHubViewModel = viewModel()) {
    LaunchedEffect(initialKind) {
        if (vm.kind != initialKind && vm.kinds.any { it.first == initialKind }) {
            vm.pick(initialKind)
        } else {
            vm.load()
        }
    }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        InfoHeader("Digital Products", "Courses · Templates · UI Kits", onBack)
        Row(Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            vm.kinds.forEach { (id, label) ->
                val selected = vm.kind == id
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                    modifier = Modifier.clip(RoundedCornerShape(20.dp)).clickable { vm.pick(id) },
                ) {
                    Text(label, modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp), style = MaterialTheme.typography.labelMedium, color = if (selected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface)
                }
            }
        }
        Box(Modifier.weight(1f)) {
            if (vm.loading) LoadingBox(Modifier.fillMaxSize())
            else if (vm.items.isEmpty()) EmptyState(title = "Nothing here", subtitle = "Check another tab", modifier = Modifier.fillMaxSize())
            else LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(vm.items, key = { it.id }) { item ->
                    InfoCard {
                        Text(item.displayTitle, style = MaterialTheme.typography.titleSmall, maxLines = 2, overflow = TextOverflow.Ellipsis)
                        if (!item.description.isNullOrEmpty()) {
                            Text(item.description.orEmpty(), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 2, overflow = TextOverflow.Ellipsis)
                        }
                        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            Text("$${item.price}", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                            if (!item.level.isNullOrEmpty()) Text(item.level.orEmpty(), style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            if (!item.language.isNullOrEmpty()) Text(item.language.orEmpty(), style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }
        }
    }
}

// ----------------------------------------------------------- certifications

class CertificationsViewModel : ViewModel() {
    var programs by mutableStateOf<List<CertProgramDto>>(emptyList()); private set
    var loading by mutableStateOf(true); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            programs = ApiClient.certPrograms()
            loading = false
        }
    }
}

@Composable
fun CertificationsScreen(onBack: () -> Unit, vm: CertificationsViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        InfoHeader("Certifications", "Prove your skills", onBack)
        Box(Modifier.weight(1f)) {
            if (vm.loading) LoadingBox(Modifier.fillMaxSize())
            else if (vm.programs.isEmpty()) EmptyState(title = "No programs", subtitle = "Check back soon", modifier = Modifier.fillMaxSize())
            else LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(vm.programs, key = { it.id }) { program ->
                    InfoCard {
                        Text("🎓  ${program.title}", style = MaterialTheme.typography.titleSmall)
                        if (!program.description.isNullOrEmpty()) {
                            Text(program.description.orEmpty(), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }
        }
    }
}

// -------------------------------------------------------- features directory

@Composable
fun FeaturesDirectoryScreen(onBack: () -> Unit, onRoute: (String) -> Unit) {
    var query by mutableStateOf("")
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        InfoHeader("All Features", "${featureCategories.sumOf { it.tools.size }} tools", onBack)
        OutlinedTextField(
            value = query,
            onValueChange = { query = it },
            label = { Text("Search tools") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
        )
        val q = query.trim().lowercase()
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            featureCategories.forEach { category ->
                val tools = if (q.isEmpty()) category.tools else category.tools.filter {
                    it.name.lowercase().contains(q) || it.desc.lowercase().contains(q)
                }
                if (tools.isNotEmpty()) {
                    item(key = "h-" + category.title) {
                        Text(category.title, style = MaterialTheme.typography.titleSmall)
                        if (category.desc.isNotEmpty()) {
                            Text(category.desc, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                    items(tools, key = { it.path + it.name }) { tool ->
                        InfoCard {
                            Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(8.dp)).clickable { onRoute(tool.path) }) {
                                Column(Modifier.weight(1f)) {
                                    Text(tool.name, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
                                    if (tool.desc.isNotEmpty()) {
                                        Text(tool.desc, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 2, overflow = TextOverflow.Ellipsis)
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
