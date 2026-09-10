package com.grapsee.shop.features.tools

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
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import com.grapsee.shop.core.network.ApiClient
import com.grapsee.shop.core.network.DeductionDto
import com.grapsee.shop.core.network.HalalResultDto
import com.grapsee.shop.core.network.UnitPriceItemDto
import com.grapsee.shop.ui.components.EmptyState
import com.grapsee.shop.ui.components.LoadingBox
import kotlinx.coroutines.launch
import kotlin.random.Random

// ------------------------------------------------------------ shared bits

@Composable
internal fun ToolHeader(title: String, subtitle: String?, onBack: () -> Unit) {
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

// -------------------------------------------------------------- tax refund

class TaxRefundViewModel : ViewModel() {
    var items by mutableStateOf<List<DeductionDto>>(emptyList()); private set
    var loading by mutableStateOf(true); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            items = ApiClient.taxDeductions()
            loading = false
        }
    }
}

@Composable
fun TaxRefundScreen(onBack: () -> Unit, onLogin: () -> Unit, vm: TaxRefundViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Tax Refund", "Deductions from your orders", onBack)
        Box(Modifier.weight(1f)) {
            if (vm.loading) LoadingBox(Modifier.fillMaxSize())
            else if (vm.items.isEmpty()) {
                LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    item { EmptyState(title = "No deductions found", subtitle = "Sign in to pull your order history") }
                    item { Button(onClick = onLogin, modifier = Modifier.fillMaxWidth()) { Text("Sign in") } }
                }
            } else {
                LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    item {
                        ToolCard {
                            Text("Total deductible", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Text("$${"%.2f".format(vm.items.sumOf { it.amount })}", style = MaterialTheme.typography.displaySmall, color = MaterialTheme.colorScheme.primary)
                        }
                    }
                    items(vm.items, key = { it.id }) { d ->
                        ToolCard {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Column(Modifier.weight(1f)) {
                                    Text(d.displayTitle, style = MaterialTheme.typography.titleSmall)
                                    if (!d.category.isNullOrEmpty()) Text(d.category.orEmpty(), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                                Text("$${"%.2f".format(d.amount)}", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                            }
                        }
                    }
                }
            }
        }
    }
}

// --------------------------------------------------------------- price lock

class PriceLockViewModel : ViewModel() {
    var productId by mutableStateOf(""); private set
    var done by mutableStateOf<Boolean?>(null); private set
    var locking by mutableStateOf(false); private set
    fun updateProductId(v: String) { productId = v.trim(); done = null }
    fun lock() {
        viewModelScope.launch {
            locking = true
            done = ApiClient.priceLock(productId)
            locking = false
        }
    }
}

@Composable
fun PriceLockScreen(onBack: () -> Unit, onLogin: () -> Unit, vm: PriceLockViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Price Lock", "Lock today's price for 30 days", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    Text("100 deposit · refundable", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    OutlinedTextField(value = vm.productId, onValueChange = vm::updateProductId, label = { Text("Product ID") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    Button(onClick = vm::lock, enabled = vm.productId.isNotBlank() && !vm.locking, modifier = Modifier.fillMaxWidth()) {
                        Text(if (vm.locking) "Locking…" else "Lock price")
                    }
                    vm.done?.let {
                        Text(if (it) "✅ Price locked for 30 days" else "❌ Failed — sign in and retry", color = if (it) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
                        if (!it) Button(onClick = onLogin) { Text("Sign in") }
                    }
                }
            }
        }
    }
}

// ------------------------------------------------------------- unit price

class UnitPriceViewModel : ViewModel() {
    var rows by mutableStateOf(List(3) { mutableMapOf("name" to "Item ${it + 1}", "price" to "", "quantity" to "1", "unit" to "pcs") }); private set
    var results by mutableStateOf<List<UnitPriceItemDto>>(emptyList()); private set
    var comparing by mutableStateOf(false); private set
    fun updateCell(index: Int, key: String, value: String) {
        rows = rows.mapIndexed { i, row -> if (i == index) (row + (key to value)).toMutableMap() else row }
    }
    fun compare() {
        viewModelScope.launch {
            comparing = true
            results = ApiClient.unitPriceCompare(rows.filter { (it["price"] ?: "").isNotBlank() }.map {
                mapOf("name" to (it["name"] ?: ""), "price" to ((it["price"] ?: "0").toDoubleOrNull() ?: 0.0), "quantity" to ((it["quantity"] ?: "1").toDoubleOrNull() ?: 1.0), "unit" to (it["unit"] ?: "pcs"))
            })
            comparing = false
        }
    }
}

@Composable
fun UnitPriceScreen(onBack: () -> Unit, vm: UnitPriceViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Unit Price", "Find the real best deal", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            vm.rows.forEachIndexed { index, row ->
                item(key = "row-$index") {
                    ToolCard {
                        Text("Item ${index + 1}", style = MaterialTheme.typography.titleSmall)
                        OutlinedTextField(value = row["name"] ?: "", onValueChange = { vm.updateCell(index, "name", it) }, label = { Text("Name") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            OutlinedTextField(value = row["price"] ?: "", onValueChange = { vm.updateCell(index, "price", it.filter { c -> c.isDigit() || c == '.' }) }, label = { Text("Price") }, singleLine = true, modifier = Modifier.weight(1f))
                            OutlinedTextField(value = row["quantity"] ?: "", onValueChange = { vm.updateCell(index, "quantity", it.filter { c -> c.isDigit() || c == '.' }) }, label = { Text("Qty") }, singleLine = true, modifier = Modifier.weight(1f))
                        }
                        OutlinedTextField(value = row["unit"] ?: "", onValueChange = { vm.updateCell(index, "unit", it) }, label = { Text("Unit (g, kg, ml, l, pcs)") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    }
                }
            }
            item {
                Button(onClick = vm::compare, enabled = !vm.comparing, modifier = Modifier.fillMaxWidth()) {
                    Text(if (vm.comparing) "Comparing…" else "Compare")
                }
            }
            items(vm.results, key = { it.id.ifEmpty { it.name } }) { item ->
                ToolCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text(item.name, style = MaterialTheme.typography.titleSmall)
                            Text(item.unitPriceDisplay ?: ("%.4f".format(item.unitPrice) + " / unit"), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        if (item.isBest) {
                            Surface(color = MaterialTheme.colorScheme.primary, shape = RoundedCornerShape(8.dp)) {
                                Text("BEST", modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp), style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onPrimary, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    }
}

// ----------------------------------------------------------- smart reorder

class SmartReorderViewModel : ViewModel() {
    var tweak by mutableStateOf(""); private set
    var done by mutableStateOf<Boolean?>(null); private set
    var ordering by mutableStateOf(false); private set
    fun updateTweak(v: String) { tweak = v }
    fun reorder() {
        viewModelScope.launch {
            ordering = true
            done = ApiClient.smartReorder(tweak.trim())
            ordering = false
        }
    }
}

@Composable
fun SmartReorderScreen(onBack: () -> Unit, onLogin: () -> Unit, onOrders: () -> Unit, vm: SmartReorderViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Smart Reorder", "Same as last time, modified", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    Text("Repeats your last order with one tweak.", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    OutlinedTextField(value = vm.tweak, onValueChange = vm::updateTweak, label = { Text("Modification (optional)") }, modifier = Modifier.fillMaxWidth())
                    Button(onClick = vm::reorder, enabled = !vm.ordering, modifier = Modifier.fillMaxWidth()) {
                        Text(if (vm.ordering) "Ordering…" else "Reorder now")
                    }
                    vm.done?.let {
                        Text(if (it) "✅ Reordered" else "❌ Failed — sign in and retry", color = if (it) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
                        if (it) Button(onClick = onOrders, modifier = Modifier.fillMaxWidth()) { Text("View orders") }
                        else Button(onClick = onLogin) { Text("Sign in") }
                    }
                }
            }
        }
    }
}

// ------------------------------------------------------------ gift matcher

private val giftQuestions = listOf(
    "Who are you buying for?" to listOf("Partner", "Parent", "Friend", "Child", "Colleague"),
    "What's the occasion?" to listOf("Birthday", "Anniversary", "Wedding", "Festival", "Just Because"),
    "Budget range?" to listOf("Under 500", "500-2000", "2000-5000", "5000+"),
)
private val giftIdeas = listOf("Personalized Photo Frame", "Luxury Perfume", "Designer Watch")

class GiftMatcherViewModel : ViewModel() {
    var step by mutableStateOf(0); private set
    var answers by mutableStateOf<List<String>>(emptyList()); private set
    fun answer(option: String) {
        answers = answers + option
        if (step < giftQuestions.size - 1) step++
    }
    fun restart() { step = 0; answers = emptyList() }
}

@Composable
fun GiftMatcherScreen(onBack: () -> Unit, onSearch: (String) -> Unit, vm: GiftMatcherViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Gift Matcher", "Perfect gift in 3 questions", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            if (vm.step < giftQuestions.size) {
                val (q, options) = giftQuestions[vm.step]
                item {
                    ToolCard {
                        Text("Question ${vm.step + 1} of ${giftQuestions.size}", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.primary)
                        Text(q, style = MaterialTheme.typography.titleMedium)
                        options.forEach { option ->
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                tonalElevation = 1.dp,
                                modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).clickable { vm.answer(option) },
                            ) {
                                Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                                    Text(option, modifier = Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium)
                                    Text("→", color = MaterialTheme.colorScheme.primary)
                                }
                            }
                        }
                    }
                }
            } else {
                item {
                    ToolCard {
                        Text("🎁  Gift Ideas Ready!", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary)
                        Text("For your ${vm.answers.getOrElse(0) { "someone" }}'s ${vm.answers.getOrElse(1) { "occasion" }} (Budget: ${vm.answers.getOrElse(2) { "any" }})", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        giftIdeas.forEach { idea ->
                            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                                Text(idea, modifier = Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium)
                                Button(onClick = { onSearch(idea) }) { Text("View") }
                            }
                        }
                        Button(onClick = vm::restart, modifier = Modifier.fillMaxWidth()) { Text("Start over") }
                    }
                }
            }
        }
    }
}

// -------------------------------------------------------------- style quiz

private val styleQuestions = listOf(
    "What colors do you prefer?" to listOf("Bright & Bold", "Neutral & Earthy", "Pastels", "Monochrome"),
    "Your fashion vibe?" to listOf("Classic", "Trendy", "Minimalist", "Bohemian"),
    "Where do you shop most?" to listOf("Online", "Malls", "Thrift", "Boutiques"),
)

class StyleQuizViewModel : ViewModel() {
    var step by mutableStateOf(0); private set
    var answers by mutableStateOf<List<String>>(emptyList()); private set
    fun answer(option: String) {
        answers = answers + option
        if (step < styleQuestions.size - 1) step++
    }
    fun restart() { step = 0; answers = emptyList() }
}

@Composable
fun StyleQuizScreen(onBack: () -> Unit, onOutfits: () -> Unit, vm: StyleQuizViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Style Quiz", "Discover your style", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            if (vm.step < styleQuestions.size) {
                val (q, options) = styleQuestions[vm.step]
                item {
                    ToolCard {
                        Text("Question ${vm.step + 1} of ${styleQuestions.size}", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.primary)
                        Text(q, style = MaterialTheme.typography.titleMedium)
                        options.forEach { option ->
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                tonalElevation = 1.dp,
                                modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).clickable { vm.answer(option) },
                            ) {
                                Text(option, modifier = Modifier.padding(12.dp), style = MaterialTheme.typography.bodyMedium)
                            }
                        }
                    }
                }
            } else {
                item {
                    ToolCard {
                        Text("✨  Your style", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary)
                        Text("${vm.answers.getOrElse(1) { "Unique" }} ${vm.answers.getOrElse(0) { "style" }}", style = MaterialTheme.typography.headlineSmall)
                        Text("You shop mostly: ${vm.answers.getOrElse(2) { "everywhere" }}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Button(onClick = onOutfits, modifier = Modifier.fillMaxWidth()) { Text("Build outfits →") }
                        Button(onClick = vm::restart, modifier = Modifier.fillMaxWidth()) { Text("Retake") }
                    }
                }
            }
        }
    }
}

// ---------------------------------------------------------- allergy checker

class AllergyViewModel : ViewModel() {
    var productName by mutableStateOf(""); private set
    var checked by mutableStateOf(false); private set
    var safe by mutableStateOf(true); private set
    val allergies = listOf("peanuts", "gluten", "dairy")
    fun updateProductName(v: String) { productName = v; checked = false }
    fun check() {
        // Same demo logic as the website: verdict is illustrative.
        checked = true
        safe = Random.nextDouble() > 0.3
    }
}

@Composable
fun AllergyScreen(onBack: () -> Unit, vm: AllergyViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Allergy Checker", "Demo checker", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    OutlinedTextField(value = vm.productName, onValueChange = vm::updateProductName, label = { Text("Product name") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    Text("Your allergies: ${vm.allergies.joinToString(", ")}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Button(onClick = vm::check, enabled = vm.productName.isNotBlank(), modifier = Modifier.fillMaxWidth()) { Text("Check for allergens") }
                }
            }
            if (vm.checked) {
                item {
                    ToolCard {
                        Text(if (vm.safe) "✅ Safe to consume" else "⚠️ Allergen warning!", style = MaterialTheme.typography.titleMedium, color = if (vm.safe) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error)
                        Text(if (vm.safe) "No allergens detected" else "Contains: Peanuts, Tree nuts", style = MaterialTheme.typography.bodyMedium)
                    }
                }
            }
        }
    }
}

// ------------------------------------------------------------ halal checker

class HalalViewModel : ViewModel() {
    var barcode by mutableStateOf(""); private set
    var result by mutableStateOf<HalalResultDto?>(null); private set
    var checking by mutableStateOf(false); private set
    fun updateBarcode(v: String) { barcode = v.trim(); result = null }
    fun check() {
        viewModelScope.launch {
            checking = true
            result = ApiClient.halalCheck(barcode)
            checking = false
        }
    }
}

@Composable
fun HalalScreen(onBack: () -> Unit, vm: HalalViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Halal Checker", "Scan before you buy", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    OutlinedTextField(value = vm.barcode, onValueChange = vm::updateBarcode, label = { Text("Barcode") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    Button(onClick = vm::check, enabled = vm.barcode.isNotBlank() && !vm.checking, modifier = Modifier.fillMaxWidth()) {
                        Text(if (vm.checking) "Checking…" else "Check")
                    }
                }
            }
            vm.result?.let { r ->
                item {
                    ToolCard {
                        Text(
                            when (r.status?.lowercase()) {
                                "halal" -> "✅ Halal"
                                "haram" -> "⛔ Haram"
                                else -> "❓ ${r.status.orEmpty()}"
                            },
                            style = MaterialTheme.typography.titleMedium,
                            color = if (r.status?.lowercase() == "halal") MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error,
                        )
                        if (!r.reason.isNullOrEmpty()) Text(r.reason.orEmpty(), style = MaterialTheme.typography.bodyMedium)
                    }
                }
            }
        }
    }
}

// ----------------------------------------------- subscription manager (wave-3)

class SubManagerViewModel : ViewModel() {
    var items by mutableStateOf<List<com.grapsee.shop.core.network.ManagedSubscriptionDto>>(emptyList()); private set
    var loading by mutableStateOf(true); private set
    var name by mutableStateOf(""); private set
    var amount by mutableStateOf(""); private set
    var frequency by mutableStateOf("monthly"); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            items = ApiClient.managedSubscriptions()
            loading = false
        }
    }
    fun updateName(v: String) { name = v }
    fun updateAmount(v: String) { amount = v.filter { it.isDigit() || it == '.' } }
    fun pickFrequency(v: String) { frequency = v }
    fun add() {
        viewModelScope.launch {
            if (ApiClient.managedSubscriptionAdd(name.trim(), amount.toDoubleOrNull() ?: 0.0, frequency)) {
                items = ApiClient.managedSubscriptions()
                name = ""
                amount = ""
            }
        }
    }
    fun cancel(id: String) {
        viewModelScope.launch {
            if (ApiClient.managedSubscriptionCancel(id)) items = items.filterNot { it.id == id }
        }
    }
}

@Composable
fun SubManagerScreen(onBack: () -> Unit, onLogin: () -> Unit, vm: SubManagerViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Subscription Manager", "Track recurring spends", onBack)
        Box(Modifier.weight(1f)) {
            if (vm.loading) LoadingBox(Modifier.fillMaxSize())
            else LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                item {
                    ToolCard {
                        Text("Add subscription", style = MaterialTheme.typography.titleSmall)
                        OutlinedTextField(value = vm.name, onValueChange = vm::updateName, label = { Text("Name") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                        OutlinedTextField(value = vm.amount, onValueChange = vm::updateAmount, label = { Text("Amount") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            listOf("monthly", "yearly").forEach { option ->
                                val selected = vm.frequency == option
                                Surface(
                                    shape = RoundedCornerShape(20.dp),
                                    color = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                                    modifier = Modifier.clip(RoundedCornerShape(20.dp)).clickable { vm.pickFrequency(option) },
                                ) {
                                    Text(option, modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp), style = MaterialTheme.typography.labelLarge, color = if (selected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface)
                                }
                            }
                        }
                        Button(onClick = vm::add, enabled = vm.name.isNotBlank(), modifier = Modifier.fillMaxWidth()) { Text("Add") }
                    }
                }
                if (vm.items.isEmpty()) {
                    item { EmptyState(title = "No subscriptions", subtitle = "Sign in to sync yours") }
                    item { Button(onClick = onLogin, modifier = Modifier.fillMaxWidth()) { Text("Sign in") } }
                } else {
                    item {
                        ToolCard {
                            Text("Monthly burn", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Text("$${"%.2f".format(vm.items.sumOf { it.amount })}", style = MaterialTheme.typography.displaySmall, color = MaterialTheme.colorScheme.primary)
                        }
                    }
                    items(vm.items, key = { it.id }) { sub ->
                        ToolCard {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Column(Modifier.weight(1f)) {
                                    Text(sub.name, style = MaterialTheme.typography.titleSmall)
                                    Text("$${"%.2f".format(sub.amount)} · ${sub.frequency.orEmpty()}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                                Text("Cancel", modifier = Modifier.clip(RoundedCornerShape(8.dp)).clickable { vm.cancel(sub.id) }.padding(8.dp), color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.labelLarge)
                            }
                        }
                    }
                }
            }
        }
    }
}

// ------------------------------------------------------- color advisor (wave-3)

private val skinTones = listOf(
    "Fair" to ("Cool/Warm" to listOf("Pastel pink", "Light blue", "Mint green", "Soft yellow")),
    "Medium" to ("Neutral" to listOf("Coral", "Teal", "Lavender", "Peach")),
    "Olive" to ("Warm" to listOf("Emerald", "Rust", "Cream", "Burgundy")),
    "Dark" to ("Cool/Warm" to listOf("Bright white", "Royal blue", "Orange", "Hot pink")),
)

class ColorAdvisorViewModel : ViewModel() {
    var tone by mutableStateOf(""); private set
    fun pick(v: String) { tone = v }
}

@Composable
fun ColorAdvisorScreen(onBack: () -> Unit, vm: ColorAdvisorViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Color Advisor", "Match colors to skin tone", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item { Text("Select your skin tone", style = MaterialTheme.typography.titleSmall) }
            items(skinTones, key = { it.first }) { (name, meta) ->
                val selected = vm.tone == name
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = if (selected) MaterialTheme.colorScheme.primary.copy(alpha = 0.12f) else MaterialTheme.colorScheme.surface,
                    tonalElevation = 1.dp,
                    modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).clickable { vm.pick(name) },
                ) {
                    Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(if (selected) "✅" else "○")
                        Column {
                            Text(name, style = MaterialTheme.typography.titleSmall, color = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface)
                            Text(meta.first + " undertone", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }
            if (vm.tone.isNotEmpty()) {
                item {
                    ToolCard {
                        Text("Your palette 🎨", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                        skinTones.firstOrNull { it.first == vm.tone }?.second?.second?.forEach { color ->
                            Text("• $color", style = MaterialTheme.typography.bodyMedium)
                        }
                    }
                }
            }
        }
    }
}

// ------------------------------------------------------ size predictor (wave-3)

class SizePredictorViewModel : ViewModel() {
    var height by mutableStateOf(""); private set
    var weight by mutableStateOf(""); private set
    var predicted by mutableStateOf(false); private set
    fun updateHeight(v: String) { height = v.filter { it.isDigit() || it == '.' }; predicted = false }
    fun updateWeight(v: String) { weight = v.filter { it.isDigit() || it == '.' }; predicted = false }
    fun predict() { predicted = true }
}

@Composable
fun SizePredictorScreen(onBack: () -> Unit, vm: SizePredictorViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Size Predictor", "Demo size guide", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    OutlinedTextField(value = vm.height, onValueChange = vm::updateHeight, label = { Text("Height (cm)") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(value = vm.weight, onValueChange = vm::updateWeight, label = { Text("Weight (kg)") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    Button(onClick = vm::predict, enabled = vm.height.isNotBlank() && vm.weight.isNotBlank(), modifier = Modifier.fillMaxWidth()) { Text("Predict my size") }
                }
            }
            if (vm.predicted) {
                item {
                    ToolCard {
                        Text("Your sizes 📏", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                        listOf("Top: M", "Bottom: 32", "Shoes: 9").forEach { Text("• $it", style = MaterialTheme.typography.bodyMedium) }
                    }
                }
            }
        }
    }
}

// -------------------------------------------------- discount stacking (wave-3)

class DiscountStackViewModel : ViewModel() {
    var price by mutableStateOf(""); private set
    var picked by mutableStateOf<List<String>>(emptyList()); private set
    val available = listOf("10% First User", "50 Coupon", "5% Card Offer", "20 Wallet")
    fun updatePrice(v: String) { price = v.filter { it.isDigit() || it == '.' } }
    fun toggle(d: String) { picked = if (picked.contains(d)) picked - d else picked + d }
    fun final(): Double {
        var final = price.toDoubleOrNull() ?: 0.0
        picked.forEach { d ->
            if (d.contains("%")) {
                val pct = d.filter { it.isDigit() }.toIntOrNull() ?: 0
                final -= final * pct / 100
            } else {
                val amt = d.replace("\\D".toRegex(), "").toIntOrNull() ?: 0
                final = maxOf(0.0, final - amt)
            }
        }
        return kotlin.math.round(final).toDouble()
    }
}

@Composable
fun DiscountStackScreen(onBack: () -> Unit, vm: DiscountStackViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Discount Stacking", "Stack every offer", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    OutlinedTextField(value = vm.price, onValueChange = vm::updatePrice, label = { Text("Price") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    vm.available.forEach { d ->
                        val selected = vm.picked.contains(d)
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = if (selected) MaterialTheme.colorScheme.primary.copy(alpha = 0.12f) else MaterialTheme.colorScheme.surface,
                            tonalElevation = 1.dp,
                            modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).clickable { vm.toggle(d) },
                        ) {
                            Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Text(if (selected) "✅" else "○")
                                Text(d, style = MaterialTheme.typography.bodyMedium)
                            }
                        }
                    }
                }
            }
            item {
                val original = vm.price.toDoubleOrNull() ?: 0.0
                val final = vm.final()
                ToolCard {
                    Text("You pay", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text("$${"%.0f".format(final)}", style = MaterialTheme.typography.displaySmall, color = MaterialTheme.colorScheme.primary)
                    Text("You save $${"%.0f".format(original - final)}", style = MaterialTheme.typography.bodyMedium)
                }
            }
        }
    }
}

// -------------------------------------------------- deal authenticity (wave-3)

class DealAuthViewModel : ViewModel() {
    var url by mutableStateOf(""); private set
    var result by mutableStateOf<Boolean?>(null); private set
    var checking by mutableStateOf(false); private set
    fun updateUrl(v: String) { url = v.trim(); result = null }
    fun check() {
        // Same demo logic as the website: verdict is illustrative.
        viewModelScope.launch {
            checking = true
            kotlinx.coroutines.delay(800)
            result = Random.nextDouble() > 0.3
            checking = false
        }
    }
}

@Composable
fun DealAuthScreen(onBack: () -> Unit, vm: DealAuthViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Deal Authenticity", "Demo verifier", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    OutlinedTextField(value = vm.url, onValueChange = vm::updateUrl, label = { Text("Deal URL") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    Button(onClick = vm::check, enabled = vm.url.isNotBlank() && !vm.checking, modifier = Modifier.fillMaxWidth()) {
                        Text(if (vm.checking) "Verifying…" else "Verify deal")
                    }
                }
            }
            vm.result?.let { authentic ->
                item {
                    ToolCard {
                        Text(if (authentic) "✅ Looks authentic" else "⚠️ Suspicious deal", style = MaterialTheme.typography.titleMedium, color = if (authentic) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error)
                        Text(if (authentic) "Seller history and pricing check out." else "Price is far below market — proceed with caution.", style = MaterialTheme.typography.bodyMedium)
                    }
                }
            }
        }
    }
}

// -------------------------------------------------------- spec compare (wave-3)

private val demoPhones = listOf(
    mapOf("name" to "Phone A", "price" to "29999", "processor" to "Snapdragon 8", "camera" to "108MP", "battery" to "5000mAh", "display" to "6.7\" AMOLED"),
    mapOf("name" to "Phone B", "price" to "24999", "processor" to "Dimensity 9000", "camera" to "64MP", "battery" to "4500mAh", "display" to "6.5\" LCD"),
)

@Composable
fun SpecCompareScreen(onBack: () -> Unit) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Spec Compare", "Phones side by side", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    demoPhones.forEach { phone ->
                        ToolCard {
                            Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Text(phone["name"].orEmpty(), style = MaterialTheme.typography.titleSmall)
                                Text("$${phone["price"]}", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary)
                                listOf("processor", "camera", "battery", "display").forEach { key ->
                                    Text("$key: ${phone[key]}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                            }
                        }
                    }
                }
            }
            item {
                ToolCard {
                    Text("Verdict 🏆", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                    Text("Phone A wins on camera and display; Phone B saves you $5000.", style = MaterialTheme.typography.bodyMedium)
                }
            }
        }
    }
}

// --------------------------------------------------- sms order (wave-4)

class SmsOrderViewModel : ViewModel() {
    var phone by mutableStateOf(""); private set
    var message by mutableStateOf(""); private set
    var reply by mutableStateOf<String?>(null); private set
    var sending by mutableStateOf(false); private set
    fun updatePhone(v: String) { phone = v.trim(); reply = null }
    fun updateMessage(v: String) { message = v; reply = null }
    fun send() {
        viewModelScope.launch {
            sending = true
            reply = ApiClient.smsOrder(phone, message.trim()) ?: "No reply — try again"
            sending = false
        }
    }
}

@Composable
fun SmsOrderScreen(onBack: () -> Unit, vm: SmsOrderViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("SMS Order", "Order without internet", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    Text("Commands: SEARCH [item] · ORDER [id] · STATUS", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    OutlinedTextField(value = vm.phone, onValueChange = vm::updatePhone, label = { Text("Phone number") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(value = vm.message, onValueChange = vm::updateMessage, label = { Text("Message") }, modifier = Modifier.fillMaxWidth())
                    Button(onClick = vm::send, enabled = vm.phone.isNotBlank() && vm.message.isNotBlank() && !vm.sending, modifier = Modifier.fillMaxWidth()) {
                        Text(if (vm.sending) "Sending…" else "Send")
                    }
                }
            }
            vm.reply?.let { reply ->
                item {
                    ToolCard {
                        Text("Reply 📩", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                        Text(reply, style = MaterialTheme.typography.bodyMedium)
                    }
                }
            }
        }
    }
}

// --------------------------------------- shopping autocomplete (wave-4)

class ShopAutocompleteViewModel : ViewModel() {
    var query by mutableStateOf(""); private set
    var suggestions by mutableStateOf<List<String>>(emptyList()); private set
    fun updateQuery(v: String) {
        query = v
        viewModelScope.launch {
            suggestions = if (v.trim().length < 2) emptyList() else ApiClient.shopAutocomplete(v.trim())
        }
    }
}

@Composable
fun ShopAutocompleteScreen(onBack: () -> Unit, onSearch: (String) -> Unit, vm: ShopAutocompleteViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Smart Suggestions", "Type-ahead from your history", onBack)
        OutlinedTextField(
            value = vm.query,
            onValueChange = vm::updateQuery,
            label = { Text("Start typing…") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
        )
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            items(vm.suggestions, key = { it }) { suggestion ->
                ToolCard {
                    Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(8.dp)).clickable { onSearch(suggestion) }) {
                        Text(suggestion, modifier = Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium)
                        Text("→", color = MaterialTheme.colorScheme.primary)
                    }
                }
            }
            if (vm.query.trim().length >= 2 && vm.suggestions.isEmpty()) {
                item { EmptyState(title = "No suggestions", subtitle = "Try another keyword") }
            }
        }
    }
}

// --------------------------------------------- document expiry (wave-4)

class DocExpiryViewModel : ViewModel() {
    var items by mutableStateOf<List<com.grapsee.shop.core.network.TrackedDocumentDto>>(emptyList()); private set
    var loading by mutableStateOf(true); private set
    var type by mutableStateOf(""); private set
    var number by mutableStateOf(""); private set
    var expiry by mutableStateOf(""); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            items = ApiClient.trackedDocuments()
            loading = false
        }
    }
    fun updateType(v: String) { type = v }
    fun updateNumber(v: String) { number = v.trim() }
    fun updateExpiry(v: String) { expiry = v.trim() }
    fun add() {
        viewModelScope.launch {
            if (ApiClient.trackDocument(type.trim(), number, expiry)) {
                items = ApiClient.trackedDocuments()
                type = ""
                number = ""
                expiry = ""
            }
        }
    }
}

@Composable
fun DocExpiryScreen(onBack: () -> Unit, onLogin: () -> Unit, vm: DocExpiryViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Document Expiry", "Never miss a renewal", onBack)
        Box(Modifier.weight(1f)) {
            if (vm.loading) LoadingBox(Modifier.fillMaxSize())
            else LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                item {
                    ToolCard {
                        Text("Track a document", style = MaterialTheme.typography.titleSmall)
                        OutlinedTextField(value = vm.type, onValueChange = vm::updateType, label = { Text("Type (NID, passport…)") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                        OutlinedTextField(value = vm.number, onValueChange = vm::updateNumber, label = { Text("Number") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                        OutlinedTextField(value = vm.expiry, onValueChange = vm::updateExpiry, label = { Text("Expiry (YYYY-MM-DD)") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                        Button(onClick = vm::add, enabled = vm.type.isNotBlank() && vm.expiry.isNotBlank(), modifier = Modifier.fillMaxWidth()) { Text("Track") }
                    }
                }
                if (vm.items.isEmpty()) {
                    item { EmptyState(title = "No documents tracked", subtitle = "Sign in to sync yours") }
                    item { Button(onClick = onLogin, modifier = Modifier.fillMaxWidth()) { Text("Sign in") } }
                } else {
                    items(vm.items, key = { it.id }) { doc ->
                        ToolCard {
                            Text("${doc.kind} · ${doc.ref}", style = MaterialTheme.typography.titleSmall)
                            Text(
                                if (doc.daysUntil <= 60) "⏰ Expires in ${doc.daysUntil} days" else "Valid · ${doc.daysUntil} days left",
                                style = MaterialTheme.typography.bodySmall,
                                color = if (doc.daysUntil <= 60) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary,
                            )
                        }
                    }
                }
            }
        }
    }
}

// ---------------------------------------------- vehicle service (wave-4)

class VehicleViewModel : ViewModel() {
    var vehicles by mutableStateOf<List<com.grapsee.shop.core.network.VehicleDto>>(emptyList()); private set
    var loading by mutableStateOf(true); private set
    var name by mutableStateOf(""); private set
    var type by mutableStateOf("car"); private set
    var lastService by mutableStateOf(""); private set
    var odometer by mutableStateOf(""); private set
    var result by mutableStateOf<Map<String, String>>(emptyMap()); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            vehicles = ApiClient.vehicles()
            loading = false
        }
    }
    fun updateName(v: String) { name = v }
    fun pickType(v: String) { type = v }
    fun updateLastService(v: String) { lastService = v.trim() }
    fun updateOdometer(v: String) { odometer = v.filter { it.isDigit() || it == '.' } }
    fun add() {
        viewModelScope.launch {
            result = ApiClient.addVehicle(name.trim(), type, lastService, odometer)
            vehicles = ApiClient.vehicles()
        }
    }
}

@Composable
fun VehicleScreen(onBack: () -> Unit, onLogin: () -> Unit, vm: VehicleViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Vehicle Service", "Service reminders", onBack)
        Box(Modifier.weight(1f)) {
            if (vm.loading) LoadingBox(Modifier.fillMaxSize())
            else LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                item {
                    ToolCard {
                        Text("Add vehicle", style = MaterialTheme.typography.titleSmall)
                        OutlinedTextField(value = vm.name, onValueChange = vm::updateName, label = { Text("Name") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            listOf("car", "bike", "bus").forEach { option ->
                                val selected = vm.type == option
                                Surface(
                                    shape = RoundedCornerShape(20.dp),
                                    color = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                                    modifier = Modifier.clip(RoundedCornerShape(20.dp)).clickable { vm.pickType(option) },
                                ) {
                                    Text(option, modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp), style = MaterialTheme.typography.labelLarge, color = if (selected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface)
                                }
                            }
                        }
                        OutlinedTextField(value = vm.lastService, onValueChange = vm::updateLastService, label = { Text("Last service (YYYY-MM-DD)") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                        OutlinedTextField(value = vm.odometer, onValueChange = vm::updateOdometer, label = { Text("Odometer (km)") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                        Button(onClick = vm::add, enabled = vm.name.isNotBlank(), modifier = Modifier.fillMaxWidth()) { Text("Add vehicle") }
                    }
                }
                if (vm.result.isNotEmpty()) {
                    item {
                        ToolCard {
                            vm.result.entries.sortedBy { it.key }.forEach { (k, v) ->
                                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Text(k, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.weight(1f))
                                    Text(v, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
                                }
                            }
                        }
                    }
                }
                if (vm.vehicles.isEmpty()) {
                    item { Button(onClick = onLogin, modifier = Modifier.fillMaxWidth()) { Text("Sign in to sync vehicles") } }
                } else {
                    items(vm.vehicles, key = { it.id }) { vehicle ->
                        ToolCard {
                            Text(vehicle.displayName, style = MaterialTheme.typography.titleSmall)
                            Text("${vehicle.kind} · ${vehicle.status.orEmpty()}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }
        }
    }
}

// ----------------------------------------------- legal documents (wave-4)

class LegalViewModel : ViewModel() {
    var type by mutableStateOf("NDA"); private set
    var jurisdiction by mutableStateOf(""); private set
    var parties by mutableStateOf(""); private set
    var terms by mutableStateOf(""); private set
    var result by mutableStateOf<Map<String, String>>(emptyMap()); private set
    var generating by mutableStateOf(false); private set
    fun updateType(v: String) { type = v }
    fun updateJurisdiction(v: String) { jurisdiction = v }
    fun updateParties(v: String) { parties = v }
    fun updateTerms(v: String) { terms = v }
    fun generate() {
        viewModelScope.launch {
            generating = true
            result = ApiClient.legalGenerate(type, jurisdiction.trim(), parties.trim(), terms.trim())
            generating = false
        }
    }
}

@Composable
fun LegalDocsScreen(onBack: () -> Unit, onLogin: () -> Unit, vm: LegalViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Legal Documents", "Contracts in minutes", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf("NDA", "Contract", "Agreement").forEach { option ->
                            val selected = vm.type == option
                            Surface(
                                shape = RoundedCornerShape(20.dp),
                                color = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                                modifier = Modifier.clip(RoundedCornerShape(20.dp)).clickable { vm.updateType(option) },
                            ) {
                                Text(option, modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp), style = MaterialTheme.typography.labelLarge, color = if (selected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface)
                            }
                        }
                    }
                    OutlinedTextField(value = vm.jurisdiction, onValueChange = vm::updateJurisdiction, label = { Text("Jurisdiction") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(value = vm.parties, onValueChange = vm::updateParties, label = { Text("Parties") }, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(value = vm.terms, onValueChange = vm::updateTerms, label = { Text("Key terms") }, modifier = Modifier.fillMaxWidth())
                    Button(onClick = vm::generate, enabled = !vm.generating, modifier = Modifier.fillMaxWidth()) {
                        Text(if (vm.generating) "Generating…" else "Generate document")
                    }
                }
            }
            if (vm.result.isNotEmpty()) {
                item {
                    ToolCard {
                        Text("Document ready 📄", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                        vm.result.entries.sortedBy { it.key }.forEach { (k, v) ->
                            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text(k, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.weight(1f))
                                Text(v.take(60), style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.SemiBold)
                            }
                        }
                    }
                }
            } else {
                item { Button(onClick = onLogin, modifier = Modifier.fillMaxWidth()) { Text("Sign in to generate") } }
            }
        }
    }
}

// ------------------------------------------------- form builder (wave-4)

class FormBuilderViewModel : ViewModel() {
    var title by mutableStateOf(""); private set
    var field by mutableStateOf(""); private set
    var fields by mutableStateOf<List<String>>(emptyList()); private set
    var result by mutableStateOf<Map<String, String>>(emptyMap()); private set
    var creating by mutableStateOf(false); private set
    fun updateTitle(v: String) { title = v }
    fun updateField(v: String) { field = v }
    fun addField() {
        if (field.isNotBlank()) {
            fields = fields + field.trim()
            field = ""
        }
    }
    fun create() {
        viewModelScope.launch {
            creating = true
            result = ApiClient.formCreate(title.trim(), fields)
            creating = false
        }
    }
}

@Composable
fun FormBuilderScreen(onBack: () -> Unit, onLogin: () -> Unit, vm: FormBuilderViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Form Builder", "Forms with share links", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    OutlinedTextField(value = vm.title, onValueChange = vm::updateTitle, label = { Text("Form title") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(value = vm.field, onValueChange = vm::updateField, label = { Text("Field name") }, singleLine = true, modifier = Modifier.weight(1f))
                        Button(onClick = vm::addField, enabled = vm.field.isNotBlank()) { Text("+") }
                    }
                    vm.fields.forEach { Text("• $it", style = MaterialTheme.typography.bodyMedium) }
                    Button(onClick = vm::create, enabled = vm.title.isNotBlank() && vm.fields.isNotEmpty() && !vm.creating, modifier = Modifier.fillMaxWidth()) {
                        Text(if (vm.creating) "Creating…" else "Create form")
                    }
                }
            }
            if (vm.result.isNotEmpty()) {
                item {
                    ToolCard {
                        Text("Form live 🎉", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                        vm.result.entries.sortedBy { it.key }.forEach { (k, v) ->
                            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text(k, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.weight(1f))
                                Text(v.take(60), style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.SemiBold)
                            }
                        }
                    }
                }
            } else {
                item { Button(onClick = onLogin, modifier = Modifier.fillMaxWidth()) { Text("Sign in to create") } }
            }
        }
    }
}

// ----------------------------------------------- resume builder (wave-4)

class ResumeViewModel : ViewModel() {
    var template by mutableStateOf("modern"); private set
    var name by mutableStateOf(""); private set
    var summary by mutableStateOf(""); private set
    var result by mutableStateOf<Map<String, String>>(emptyMap()); private set
    var generating by mutableStateOf(false); private set
    fun pickTemplate(v: String) { template = v }
    fun updateName(v: String) { name = v }
    fun updateSummary(v: String) { summary = v }
    fun generate() {
        viewModelScope.launch {
            generating = true
            result = ApiClient.resumeGenerate(template, name.trim(), summary.trim())
            generating = false
        }
    }
}

@Composable
fun ResumeBuilderScreen(onBack: () -> Unit, onLogin: () -> Unit, vm: ResumeViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Resume Builder", "Job-ready PDFs", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf("modern", "classic", "minimal").forEach { option ->
                            val selected = vm.template == option
                            Surface(
                                shape = RoundedCornerShape(20.dp),
                                color = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                                modifier = Modifier.clip(RoundedCornerShape(20.dp)).clickable { vm.pickTemplate(option) },
                            ) {
                                Text(option, modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp), style = MaterialTheme.typography.labelLarge, color = if (selected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface)
                            }
                        }
                    }
                    OutlinedTextField(value = vm.name, onValueChange = vm::updateName, label = { Text("Full name") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(value = vm.summary, onValueChange = vm::updateSummary, label = { Text("Professional summary") }, modifier = Modifier.fillMaxWidth())
                    Button(onClick = vm::generate, enabled = vm.name.isNotBlank() && !vm.generating, modifier = Modifier.fillMaxWidth()) {
                        Text(if (vm.generating) "Generating…" else "Generate resume")
                    }
                }
            }
            if (vm.result.isNotEmpty()) {
                item {
                    ToolCard {
                        Text("Resume ready 📄", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                        vm.result.entries.sortedBy { it.key }.forEach { (k, v) ->
                            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text(k, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.weight(1f))
                                Text(v.take(60), style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.SemiBold)
                            }
                        }
                    }
                }
            } else {
                item { Button(onClick = onLogin, modifier = Modifier.fillMaxWidth()) { Text("Sign in to generate") } }
            }
        }
    }
}

// ---------------------------------------------- insurance claim (wave-4)

class InsuranceViewModel : ViewModel() {
    var productId by mutableStateOf(""); private set
    var issue by mutableStateOf(""); private set
    var damageType by mutableStateOf("damaged"); private set
    var result by mutableStateOf<Map<String, String>>(emptyMap()); private set
    var filing by mutableStateOf(false); private set
    fun updateProductId(v: String) { productId = v.trim() }
    fun updateIssue(v: String) { issue = v }
    fun pickDamage(v: String) { damageType = v }
    fun file() {
        viewModelScope.launch {
            filing = true
            result = ApiClient.insuranceClaim(productId, issue.trim(), damageType)
            filing = false
        }
    }
}

@Composable
fun InsuranceScreen(onBack: () -> Unit, onLogin: () -> Unit, vm: InsuranceViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Insurance Claim", "File in minutes", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    OutlinedTextField(value = vm.productId, onValueChange = vm::updateProductId, label = { Text("Product / Order ID") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf("damaged", "lost", "defective").forEach { option ->
                            val selected = vm.damageType == option
                            Surface(
                                shape = RoundedCornerShape(20.dp),
                                color = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                                modifier = Modifier.clip(RoundedCornerShape(20.dp)).clickable { vm.pickDamage(option) },
                            ) {
                                Text(option, modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp), style = MaterialTheme.typography.labelLarge, color = if (selected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface)
                            }
                        }
                    }
                    OutlinedTextField(value = vm.issue, onValueChange = vm::updateIssue, label = { Text("What happened?") }, modifier = Modifier.fillMaxWidth())
                    Button(onClick = vm::file, enabled = vm.productId.isNotBlank() && !vm.filing, modifier = Modifier.fillMaxWidth()) {
                        Text(if (vm.filing) "Filing…" else "File claim")
                    }
                }
            }
            if (vm.result.isNotEmpty()) {
                item {
                    ToolCard {
                        Text("Claim filed ✅", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                        vm.result.entries.sortedBy { it.key }.forEach { (k, v) ->
                            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text(k, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.weight(1f))
                                Text(v.take(80), style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.SemiBold)
                            }
                        }
                    }
                }
            } else {
                item { Button(onClick = onLogin, modifier = Modifier.fillMaxWidth()) { Text("Sign in to claim") } }
            }
        }
    }
}
