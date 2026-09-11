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
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Checkbox
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.remember
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextDecoration
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

// ---------------------------------------------------- body type (wave-A)

private val bodyTypes = listOf(
    "Hourglass" to "Balanced shoulders and hips, defined waist",
    "Pear" to "Hips wider than shoulders",
    "Apple" to "Fuller midsection, slim legs",
    "Rectangle" to "Straight silhouette, minimal waist",
    "Inverted Triangle" to "Shoulders wider than hips",
)

class BodyTypeViewModel : ViewModel() {
    var picked by mutableStateOf(""); private set
    fun pick(v: String) { picked = v }
}

@Composable
fun BodyTypeScreen(onBack: () -> Unit, vm: BodyTypeViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Body Type Guide", "Size recommendations by shape", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(bodyTypes, key = { it.first }) { (name, desc) ->
                val selected = vm.picked == name
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
                            Text(desc, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }
            if (vm.picked.isNotEmpty()) {
                item {
                    ToolCard {
                        Text("Recommended sizes for ${vm.picked}", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                        listOf("Top: M", "Bottom: L", "Dress: M").forEach { Text("• $it", style = MaterialTheme.typography.bodyMedium) }
                    }
                }
            }
        }
    }
}

// ------------------------------------------------- use case matcher (wave-A)

private val ucmQuestions = listOf(
    "What do you need?" to listOf("Work", "Gaming", "Study", "Travel"),
    "Budget range?" to listOf("Under 10k", "10-30k", "30-50k", "50k+"),
    "Brand preference?" to listOf("Any", "Premium", "Value", "Local"),
)
private val ucmResults = mapOf(
    "Work|10-30k|Any" to listOf("Laptop A - Office ready", "Laptop B - Budget friendly"),
    "Gaming|30-50k|Premium" to listOf("Gaming Laptop X", "Gaming PC Build Y"),
)
private val ucmFallback = listOf("Laptop General Purpose", "Desktop Starter")

class UseCaseMatcherViewModel : ViewModel() {
    var step by mutableStateOf(0); private set
    var answers by mutableStateOf<List<String>>(emptyList()); private set
    fun answer(option: String) {
        answers = answers + option
        if (step < ucmQuestions.size - 1) step++
    }
    fun restart() { step = 0; answers = emptyList() }
    fun results(): List<String> = ucmResults[answers.joinToString("|")] ?: ucmFallback
}

@Composable
fun UseCaseMatcherScreen(onBack: () -> Unit, onSearch: (String) -> Unit, vm: UseCaseMatcherViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Use Case Matcher", "The right gear for the job", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            if (vm.step < ucmQuestions.size) {
                val (q, options) = ucmQuestions[vm.step]
                item {
                    ToolCard {
                        Text("Question ${vm.step + 1} of ${ucmQuestions.size}", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.primary)
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
                        Text("🎯  Recommendations ready!", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary)
                        vm.results().forEach { item ->
                            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                                Text(item, modifier = Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium)
                                Button(onClick = { onSearch(item) }) { Text("View") }
                            }
                        }
                        Button(onClick = vm::restart, modifier = Modifier.fillMaxWidth()) { Text("Start over") }
                    }
                }
            }
        }
    }
}

// ------------------------------------------------ wardrobe planner (wave-A)

class WardrobePlannerViewModel : ViewModel() {
    var items by mutableStateOf(
        listOf(
            Triple("White Shirt", "Top", true),
            Triple("Blue Jeans", "Bottom", true),
            Triple("Black Blazer", "Outer", false),
        )
    ); private set
    var newItem by mutableStateOf(""); private set
    val combinations = listOf(
        "White Shirt + Blue Jeans",
        "White Shirt + Black Blazer",
        "Blue Jeans + Black Blazer",
    )
    fun updateNewItem(v: String) { newItem = v }
    fun add() {
        if (newItem.isBlank()) return
        items = items + Triple(newItem.trim(), "Other", true)
        newItem = ""
    }
    fun toggle(index: Int) {
        items = items.mapIndexed { i, t -> if (i == index) t.copy(third = !t.third) else t }
    }
}

@Composable
fun WardrobePlannerScreen(onBack: () -> Unit, vm: WardrobePlannerViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Wardrobe Planner", "Mix and match outfits", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    Text("Your wardrobe items", style = MaterialTheme.typography.titleSmall)
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(value = vm.newItem, onValueChange = vm::updateNewItem, label = { Text("Add item (e.g. Red Dress)") }, singleLine = true, modifier = Modifier.weight(1f))
                        Button(onClick = vm::add, enabled = vm.newItem.isNotBlank()) { Text("Add") }
                    }
                    vm.items.forEachIndexed { index, item ->
                        Row(
                            Modifier.fillMaxWidth().clip(RoundedCornerShape(8.dp)).clickable { vm.toggle(index) }.padding(vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                        ) {
                            Text(if (item.third) "☑" else "☐", color = MaterialTheme.colorScheme.primary)
                            Text(item.first, modifier = Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium)
                            Text(item.second, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }
            item { Text("Suggested combinations ✨", style = MaterialTheme.typography.titleSmall) }
            items(vm.combinations, key = { it }) { combo ->
                ToolCard { Text(combo, style = MaterialTheme.typography.bodyMedium) }
            }
        }
    }
}

// ------------------------------------------------ revision tokens (wave-A)

private val tokenPackages = listOf(
    Triple(1, 499, "Single Token"),
    Triple(3, 1299, "Triple Pack"),
    Triple(5, 1999, "Value Pack"),
)

class RevisionTokensViewModel : ViewModel() {
    var tokens by mutableStateOf(3); private set
    var buying by mutableStateOf(false); private set
    var bought by mutableStateOf<String?>(null); private set
    fun buy(quantity: Int) {
        viewModelScope.launch {
            buying = true
            kotlinx.coroutines.delay(1000)
            tokens += quantity
            buying = false
            bought = "Added $quantity tokens!"
        }
    }
}

@Composable
fun RevisionTokensScreen(onBack: () -> Unit, vm: RevisionTokensViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Revision Tokens", "${vm.tokens} tokens in wallet", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(tokenPackages, key = { it.first }) { (quantity, price, label) ->
                ToolCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text(label, style = MaterialTheme.typography.titleSmall)
                            Text("$quantity token${if (quantity > 1) "s" else ""} · $$price", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        Button(onClick = { vm.buy(quantity) }, enabled = !vm.buying) { Text(if (vm.buying) "…" else "Buy") }
                    }
                }
            }
            vm.bought?.let {
                item { ToolCard { Text("✅ $it", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.primary) } }
            }
        }
    }
}

// ------------------------------------------------ trend forecaster (wave-A)

private val trendSeasons = mapOf(
    "summer-2024" to listOf(
        Triple("Pastel Colors", "+45%", "rising"),
        Triple("Crochet Tops", "+32%", "hot"),
        Triple("Wide Leg Pants", "+28%", "stable"),
    ),
    "winter-2024" to listOf(
        Triple("Oversized Coats", "+38%", "hot"),
        Triple("Chunky Boots", "+25%", "rising"),
        Triple("Turtlenecks", "+18%", "stable"),
    ),
)

class TrendForecasterViewModel : ViewModel() {
    var season by mutableStateOf("summer-2024"); private set
    fun pick(v: String) { season = v }
}

@Composable
fun TrendForecasterScreen(onBack: () -> Unit, vm: TrendForecasterViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Trend Forecaster", "Upcoming fashion trends", onBack)
        Row(Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            trendSeasons.keys.sorted().forEach { key ->
                val selected = vm.season == key
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                    modifier = Modifier.clip(RoundedCornerShape(20.dp)).clickable { vm.pick(key) },
                ) {
                    Text(key.replace("-", " ").uppercase(), modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp), style = MaterialTheme.typography.labelLarge, color = if (selected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface)
                }
            }
        }
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(trendSeasons[vm.season].orEmpty(), key = { it.first }) { (name, growth, status) ->
                ToolCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text(name, style = MaterialTheme.typography.titleSmall)
                            Text(status, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        Text(growth, style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary)
                    }
                }
            }
        }
    }
}

// --------------------------------------------------- event stylist (wave-A)

private data class StylistLook(val outfit: String, val accessories: List<String>, val colors: List<String>)
private val stylistLooks = mapOf(
    "wedding" to StylistLook("Traditional Kurta + Nehru Jacket", listOf("Pocket Square", "Ethnic Watch", "Kolhapuris"), listOf("Navy", "Maroon", "Cream")),
    "office-party" to StylistLook("Blazer + Chinos + Shirt", listOf("Tie", "Leather Belt", "Formal Shoes"), listOf("Charcoal", "Burgundy", "White")),
    "casual-brunch" to StylistLook("Polo + Denim + Sneakers", listOf("Sunglasses", "Watch", "Canvas Bag"), listOf("Pastel Blue", "White", "Khaki")),
)

class EventStylistViewModel : ViewModel() {
    var event by mutableStateOf(""); private set
    fun pick(v: String) { event = v }
}

@Composable
fun EventStylistScreen(onBack: () -> Unit, vm: EventStylistViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Event Stylist", "Outfits for any occasion", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item { Text("Select occasion", style = MaterialTheme.typography.titleSmall) }
            items(stylistLooks.keys.sorted(), key = { it }) { key ->
                val selected = vm.event == key
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = if (selected) MaterialTheme.colorScheme.primary.copy(alpha = 0.12f) else MaterialTheme.colorScheme.surface,
                    tonalElevation = 1.dp,
                    modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).clickable { vm.pick(key) },
                ) {
                    Text(key.replace("-", " ").replaceFirstChar { it.uppercase() }, modifier = Modifier.padding(12.dp), style = MaterialTheme.typography.bodyMedium, color = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface)
                }
            }
            stylistLooks[vm.event]?.let { look ->
                item {
                    ToolCard {
                        Text("👔 ${look.outfit}", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                        Text("Accessories: ${look.accessories.joinToString(", ")}", style = MaterialTheme.typography.bodyMedium)
                        Text("Colors: ${look.colors.joinToString(", ")}", style = MaterialTheme.typography.bodyMedium)
                    }
                }
            }
        }
    }
}

// ---------------------------------------------------- ai scoper (wave-B)

class AiScoperViewModel : ViewModel() {
    var description by mutableStateOf(""); private set
    var generating by mutableStateOf(false); private set
    var done by mutableStateOf(false); private set
    fun updateDescription(v: String) { description = v; done = false }
    fun generate() {
        viewModelScope.launch {
            generating = true
            kotlinx.coroutines.delay(2000)
            generating = false
            done = true
        }
    }
}

@Composable
fun AiScoperScreen(onBack: () -> Unit, vm: AiScoperViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("AI Project Scoper", "Scope doc in seconds", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    OutlinedTextField(value = vm.description, onValueChange = vm::updateDescription, label = { Text("Describe your project") }, modifier = Modifier.fillMaxWidth())
                    Button(onClick = vm::generate, enabled = vm.description.isNotBlank() && !vm.generating, modifier = Modifier.fillMaxWidth()) {
                        Text(if (vm.generating) "Generating…" else "Generate scope")
                    }
                }
            }
            if (vm.done) {
                item {
                    ToolCard {
                        Text("📄 Project Scope Document", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                        listOf("User authentication system", "Dashboard with analytics", "Payment integration", "Mobile-responsive design", "SEO optimization").forEach { Text("• $it", style = MaterialTheme.typography.bodyMedium) }
                        Text("Timeline: 14-18 days · $14999", style = MaterialTheme.typography.titleSmall)
                        Text("Next.js · React · Node.js · PostgreSQL · Stripe", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }
    }
}

// ------------------------------------------------- ai competitor (wave-B)

class AiCompetitorViewModel : ViewModel() {
    var url by mutableStateOf(""); private set
    var analyzing by mutableStateOf(false); private set
    var done by mutableStateOf(false); private set
    fun updateUrl(v: String) { url = v.trim(); done = false }
    fun analyze() {
        viewModelScope.launch {
            analyzing = true
            kotlinx.coroutines.delay(2500)
            analyzing = false
            done = true
        }
    }
}

@Composable
fun AiCompetitorScreen(onBack: () -> Unit, vm: AiCompetitorViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("AI Competitor Analysis", "Know their weaknesses", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    OutlinedTextField(value = vm.url, onValueChange = vm::updateUrl, label = { Text("Competitor URL") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    Button(onClick = vm::analyze, enabled = vm.url.isNotBlank() && !vm.analyzing, modifier = Modifier.fillMaxWidth()) {
                        Text(if (vm.analyzing) "Analyzing…" else "Analyze")
                    }
                }
            }
            if (vm.done) {
                item {
                    ToolCard {
                        Text("✅ Strengths", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                        listOf("Fast loading speed", "Mobile responsive", "Clear call-to-actions").forEach { Text("• $it", style = MaterialTheme.typography.bodyMedium) }
                    }
                }
                item {
                    ToolCard {
                        Text("⚠️ Weaknesses", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.error)
                        listOf("No blog content", "Poor SEO optimization", "Missing social proof", "No live chat").forEach { Text("• $it", style = MaterialTheme.typography.bodyMedium) }
                    }
                }
                item {
                    ToolCard {
                        Text("🚀 Opportunities", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                        listOf("Content marketing gap", "Local SEO not optimized", "No video content", "Missing FAQ section").forEach { Text("• $it", style = MaterialTheme.typography.bodyMedium) }
                    }
                }
            }
        }
    }
}

// --------------------------------------------------- ai preview (wave-B)

class AiPreviewViewModel : ViewModel() {
    var businessName by mutableStateOf(""); private set
    var industry by mutableStateOf("restaurant"); private set
    var generating by mutableStateOf(false); private set
    var done by mutableStateOf(false); private set
    fun updateBusinessName(v: String) { businessName = v; done = false }
    fun pickIndustry(v: String) { industry = v; done = false }
    fun generate() {
        viewModelScope.launch {
            generating = true
            kotlinx.coroutines.delay(2000)
            generating = false
            done = true
        }
    }
    fun price(): Int = if (industry == "restaurant") 6999 else if (industry == "clinic") 8999 else 4999
}

@Composable
fun AiPreviewScreen(onBack: () -> Unit, vm: AiPreviewViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("AI Design Preview", "See it before we build", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    OutlinedTextField(value = vm.businessName, onValueChange = vm::updateBusinessName, label = { Text("Business name") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf("restaurant", "clinic", "shop").forEach { option ->
                            val selected = vm.industry == option
                            Surface(
                                shape = RoundedCornerShape(20.dp),
                                color = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                                modifier = Modifier.clip(RoundedCornerShape(20.dp)).clickable { vm.pickIndustry(option) },
                            ) {
                                Text(option, modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp), style = MaterialTheme.typography.labelLarge, color = if (selected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface)
                            }
                        }
                    }
                    Button(onClick = vm::generate, enabled = vm.businessName.isNotBlank() && !vm.generating, modifier = Modifier.fillMaxWidth()) {
                        Text(if (vm.generating) "Generating…" else "Generate preview")
                    }
                }
            }
            if (vm.done) {
                item {
                    ToolCard {
                        Text("🎨 Preview for ${vm.businessName}", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                        Text("Palette: #3B82F6 · #10B981 · #F59E0B", style = MaterialTheme.typography.bodyMedium)
                        listOf("Hero section", "Services grid", "Testimonials", "Contact form").forEach { Text("• $it", style = MaterialTheme.typography.bodyMedium) }
                        Text("Estimated price: $${vm.price()}", style = MaterialTheme.typography.titleSmall)
                    }
                }
            }
        }
    }
}

// -------------------------------------------------- ai proposal (wave-B)

class AiProposalViewModel : ViewModel() {
    var generating by mutableStateOf(false); private set
    var done by mutableStateOf(false); private set
    fun generate() {
        viewModelScope.launch {
            generating = true
            kotlinx.coroutines.delay(2000)
            generating = false
            done = true
        }
    }
}

@Composable
fun AiProposalScreen(onBack: () -> Unit, vm: AiProposalViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("AI Proposal", "Client-ready in seconds", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    Text("E-commerce Website Development · $24999 · 21 days", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Button(onClick = vm::generate, enabled = !vm.generating, modifier = Modifier.fillMaxWidth()) {
                        Text(if (vm.generating) "Generating…" else "Generate proposal")
                    }
                }
            }
            if (vm.done) {
                item {
                    ToolCard {
                        Text("📝 Proposal ready", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                        Text("A modern, responsive e-commerce platform with payment integration, inventory management, and customer dashboard.", style = MaterialTheme.typography.bodyMedium)
                        listOf("Custom website design", "Mobile-responsive layout", "Payment gateway integration", "Admin dashboard", "SEO optimization", "3 months support").forEach { Text("• $it", style = MaterialTheme.typography.bodyMedium) }
                        listOf("Design & Prototyping" to 5000).forEach { (item, cost) -> Text("$item — $$cost", style = MaterialTheme.typography.bodyMedium) }
                        Text("Timeline: 21 days · Total: $24999", style = MaterialTheme.typography.titleSmall)
                    }
                }
            }
        }
    }
}

// ---------------------------------------------------- free audit (wave-B)

class FreeAuditViewModel : ViewModel() {
    var url by mutableStateOf(""); private set
    var scanning by mutableStateOf(false); private set
    var done by mutableStateOf(false); private set
    fun updateUrl(v: String) { url = v.trim(); done = false }
    fun scan() {
        viewModelScope.launch {
            scanning = true
            kotlinx.coroutines.delay(2000)
            scanning = false
            done = true
        }
    }
}

@Composable
fun FreeAuditScreen(onBack: () -> Unit, vm: FreeAuditViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Free Audit", "5-point site check", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    OutlinedTextField(value = vm.url, onValueChange = vm::updateUrl, label = { Text("Website URL") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    Button(onClick = vm::scan, enabled = vm.url.isNotBlank() && !vm.scanning, modifier = Modifier.fillMaxWidth()) {
                        Text(if (vm.scanning) "Scanning…" else "Run free audit")
                    }
                }
            }
            if (vm.done) {
                item {
                    ToolCard {
                        Text("Overall: 67/100", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary)
                        listOf("Speed" to 72, "SEO" to 85, "Mobile" to 90, "Security" to 45, "Design" to 60).forEach { (name, score) ->
                            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text(name, style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f))
                                Text("$score", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    }
}

// ------------------------------------------- quality certificate (wave-B)

@Composable
fun QualityCertificateScreen(onBack: () -> Unit) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Quality Certificate", "E-commerce Website · 92/100", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    listOf("Code Quality" to 95, "Security Scan" to 88, "Performance" to 94, "Accessibility" to 91, "SEO" to 89, "Test Coverage" to 87).forEach { (name, score) ->
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("$name ✅", style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f))
                            Text("$score", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Bold)
                        }
                    }
                    Text("0 vulnerabilities · 87% coverage · 12,450 lines", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
    }
}

// ---------------------------------------------- portfolio proof (wave-B)

private val proofProjects = listOf(
    Triple("TechStart SaaS Platform", "Next.js · Node.js · PostgreSQL · 21 days · ⭐ 5", "12K/mo visitors · 99.9% uptime"),
    Triple("Fashion E-commerce", "React · Stripe · MongoDB · 14 days · ⭐ 5", "verified seller"),
)

@Composable
fun PortfolioProofScreen(onBack: () -> Unit) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Portfolio Proof", "Verified deliveries", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(proofProjects, key = { it.first }) { (name, tech, metrics) ->
                ToolCard {
                    Text("✅ $name", style = MaterialTheme.typography.titleSmall)
                    Text(tech, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text(metrics, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.primary)
                }
            }
        }
    }
}

// --------------------------------------------------- case studies (wave-B)

private val caseStudies = listOf(
    Triple("TechStart Inc. · SaaS · $24999", "3x user engagement increase · traffic +180% · conversion +45% · revenue +220%", "Grapsee delivered exactly what we needed, on time and on budget."),
    Triple("Fashion Boutique · E-commerce · $12999", "Online sales launched in 2 weeks · traffic +250% · conversion +60% · revenue +300%", "Our online store paid for itself in the first month."),
)

@Composable
fun CaseStudiesScreen(onBack: () -> Unit) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Case Studies", "Real client wins", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(caseStudies, key = { it.first }) { (title, results, quote) ->
                ToolCard {
                    Text("📈 $title", style = MaterialTheme.typography.titleSmall)
                    Text(results, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.primary)
                    Text("\"$quote\"", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
    }
}

// ------------------------------------------- emergency quick buy (wave-C)

private data class UrgentItem(val name: String, val urgency: String, val delivery: String, val price: Int)

private val urgentItems = listOf(
    UrgentItem("Baby Diapers", "Critical", "30 min", 350),
    UrgentItem("Medicine", "Urgent", "1 hour", 120),
    UrgentItem("Phone Charger", "High", "2 hours", 299),
    UrgentItem("Toilet Paper", "High", "2 hours", 80),
)

@Composable
fun EmergencyQuickBuyScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    fun toast(m: String) { android.widget.Toast.makeText(context, m, android.widget.Toast.LENGTH_SHORT).show() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Emergency Quick Buy", "Essentials in minutes", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(urgentItems, key = { it.name }) { item ->
                ToolCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text(item.name, style = MaterialTheme.typography.titleSmall)
                            Text("${item.urgency} · delivers in ${item.delivery}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.error)
                            Text("${item.price}", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                        }
                        Button(onClick = { toast("${item.name} ordered! Delivering in ${item.delivery}") }) { Text("Order") }
                    }
                }
            }
        }
    }
}

// ------------------------------------------ clipboard purchase (wave-C)

class ClipboardPurchaseViewModel : ViewModel() {
    var detected by mutableStateOf(false); private set
    init {
        viewModelScope.launch {
            kotlinx.coroutines.delay(2000)
            detected = true
        }
    }
}

@Composable
fun ClipboardPurchaseScreen(onBack: () -> Unit, vm: ClipboardPurchaseViewModel = viewModel()) {
    val context = LocalContext.current
    fun toast(m: String) { android.widget.Toast.makeText(context, m, android.widget.Toast.LENGTH_SHORT).show() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Clipboard Purchase", "Copy a name, buy in one tap", onBack)
        if (!vm.detected) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("Monitoring clipboard for product names…", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        } else {
            LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp)) {
                item {
                    ToolCard {
                        Text("Detected from clipboard", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.primary)
                        Text("Wireless Earbuds", style = MaterialTheme.typography.titleMedium)
                        Text("1299", style = MaterialTheme.typography.titleLarge, color = MaterialTheme.colorScheme.primary)
                        Button(onClick = { toast("Wireless Earbuds added to cart!") }, modifier = Modifier.fillMaxWidth()) { Text("Buy Now") }
                    }
                }
            }
        }
    }
}

// --------------------------------------------- flashback deals (wave-C)

private data class FlashDeal(val name: String, val price: Int, val oldPrice: Int, val date: String)

private val flashDeals = listOf(
    FlashDeal("Air Fryer", 2999, 4999, "Last Diwali"),
    FlashDeal("Bluetooth Speaker", 999, 1999, "Last Christmas"),
    FlashDeal("Running Shoes", 1499, 2999, "Independence Day"),
)

@Composable
fun FlashbackDealsScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    fun toast(m: String) { android.widget.Toast.makeText(context, m, android.widget.Toast.LENGTH_SHORT).show() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Flashback Deals", "Missed prices, back again", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(flashDeals, key = { it.name }) { item ->
                ToolCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text(item.date, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Text(item.name, style = MaterialTheme.typography.titleSmall)
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Text("${item.price}", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                                Text("${item.oldPrice}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant, textDecoration = TextDecoration.LineThrough)
                            }
                            Text("You save ${item.oldPrice - item.price}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.primary)
                        }
                        Button(onClick = { toast("${item.name} added! You saved ${item.oldPrice - item.price}") }) { Text("Add") }
                    }
                }
            }
        }
    }
}

// -------------------------------------------- expiry guarantee (wave-C)

@Composable
fun ExpiryGuaranteeScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    fun toast(m: String) { android.widget.Toast.makeText(context, m, android.widget.Toast.LENGTH_SHORT).show() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Expiry Guarantee", "Free replacement under 6 months expiry", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    Text("🛡️ Your Protection", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                    listOf("Free replacement if product has less than 6 months expiry", "No questions asked, doorstep pickup", "Refund within 48 hours of claim").forEach { Text("• $it", style = MaterialTheme.typography.bodyMedium) }
                    Button(onClick = { toast("Claim submitted! Replacement on the way.") }, modifier = Modifier.fillMaxWidth()) { Text("Claim replacement") }
                }
            }
        }
    }
}

// --------------------------------------------- price guarantee (wave-C)

data class GuaranteeClaim(val productName: String, val status: String, val submittedAt: String, val refundAmount: Int)

class PriceGuaranteeViewModel : ViewModel() {
    var productUrl by mutableStateOf(""); private set
    var competitorUrl by mutableStateOf(""); private set
    var competitorPrice by mutableStateOf(""); private set
    var claims = mutableStateListOf(
        GuaranteeClaim("Bluetooth Speaker", "under review", "2 days ago", 350),
        GuaranteeClaim("USB-C Hub", "refunded", "1 week ago", 150),
    ); private set
    fun updateProductUrl(v: String) { productUrl = v }
    fun updateCompetitorUrl(v: String) { competitorUrl = v }
    fun updateCompetitorPrice(v: String) { competitorPrice = v.filter { it.isDigit() } }
    fun submit(onError: (String) -> Unit, onDone: (String) -> Unit) {
        if (productUrl.isBlank() || competitorUrl.isBlank() || competitorPrice.isBlank()) { onError("Please fill in all fields"); return }
        claims.add(0, GuaranteeClaim(productUrl.take(24), "submitted", "just now", competitorPrice.toIntOrNull() ?: 0))
        productUrl = ""; competitorUrl = ""; competitorPrice = ""
        onDone("Claim submitted! We will review within 48 hours.")
    }
}

private val guaranteeStories = listOf(
    Triple("Sarah M. · Wireless Earbuds", "Saved 450", "Found a lower price and got refunded within 48 hours!"),
    Triple("James K. · Smart Watch", "Saved 1200", "The guarantee saved me big. Process was super smooth."),
    Triple("Priya R. · Laptop Stand", "Saved 300", "Submitted my claim and got approved the same day."),
)

@Composable
fun PriceGuaranteeScreen(onBack: () -> Unit, vm: PriceGuaranteeViewModel = viewModel()) {
    val context = LocalContext.current
    fun toast(m: String) { android.widget.Toast.makeText(context, m, android.widget.Toast.LENGTH_SHORT).show() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Price Guarantee", "Find it cheaper, we refund the gap", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    OutlinedTextField(value = vm.productUrl, onValueChange = vm::updateProductUrl, label = { Text("Our product URL") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(value = vm.competitorUrl, onValueChange = vm::updateCompetitorUrl, label = { Text("Competitor URL") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(value = vm.competitorPrice, onValueChange = vm::updateCompetitorPrice, label = { Text("Competitor price") }, singleLine = true, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), modifier = Modifier.fillMaxWidth())
                    Button(onClick = { vm.submit({ toast(it) }, { toast(it) }) }, modifier = Modifier.fillMaxWidth()) { Text("Submit claim") }
                }
            }
            items(vm.claims, key = { it.productName + it.submittedAt }) { claim ->
                ToolCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text(claim.productName, style = MaterialTheme.typography.titleSmall)
                            Text("${claim.status} · ${claim.submittedAt}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        Text("+${claim.refundAmount}", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                    }
                }
            }
            items(guaranteeStories, key = { it.first }) { (who, saved, story) ->
                ToolCard {
                    Text("⭐ $who — $saved", style = MaterialTheme.typography.titleSmall)
                    Text("\"$story\"", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
    }
}

// ------------------------------------------------- smart upsell (wave-C)

data class UpsellRec(val name: String, val price: Int, val bundlePrice: Int, val stat: String)

class SmartUpsellViewModel : ViewModel() {
    val recs = listOf(
        UpsellRec("SEO Setup", 1999, 999, "98% buy this"),
        UpsellRec("Logo Design", 2499, 1499, "Popular add-on"),
        UpsellRec("Content Writing", 2999, 1999, "Saves 3 days"),
    )
    var selected = mutableStateListOf<String>(); private set
    fun toggle(name: String) { if (selected.contains(name)) selected.remove(name) else selected.add(name) }
    fun bundleTotal(): Int = recs.filter { selected.contains(it.name) }.sumOf { it.bundlePrice }
    fun savings(): Int = recs.filter { selected.contains(it.name) }.sumOf { it.price - it.bundlePrice }
}

@Composable
fun SmartUpsellScreen(onBack: () -> Unit, vm: SmartUpsellViewModel = viewModel()) {
    val context = LocalContext.current
    fun toast(m: String) { android.widget.Toast.makeText(context, m, android.widget.Toast.LENGTH_SHORT).show() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Smart Upsell", "Bundle & save", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    Text("In cart: Website Development — 9999", style = MaterialTheme.typography.titleSmall)
                }
            }
            items(vm.recs, key = { it.name }) { rec ->
                val on = vm.selected.contains(rec.name)
                ToolCard {
                    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.clickable { vm.toggle(rec.name) }) {
                        Checkbox(checked = on, onCheckedChange = { vm.toggle(rec.name) })
                        Column(Modifier.weight(1f)) {
                            Text(rec.name, style = MaterialTheme.typography.titleSmall)
                            Text(rec.stat, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.primary)
                            Text("${rec.bundlePrice} (was ${rec.price})", style = MaterialTheme.typography.bodyMedium)
                        }
                    }
                }
            }
            item {
                ToolCard {
                    Text("Bundle total: ${vm.bundleTotal()} · You save ${vm.savings()}", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                    Button(onClick = { toast("Bundle added! You saved ${vm.savings()}") }, enabled = vm.selected.isNotEmpty(), modifier = Modifier.fillMaxWidth()) { Text("Add bundle") }
                }
            }
        }
    }
}

// ----------------------------------------------- student budget (wave-C)

class StudentBudgetViewModel : ViewModel() {
    var budget by mutableStateOf(""); private set
    var spent by mutableStateOf(""); private set
    fun updateBudget(v: String) { budget = v.filter { it.isDigit() } }
    fun updateSpent(v: String) { spent = v.filter { it.isDigit() } }
    fun budgetAmt(): Double = budget.toDoubleOrNull() ?: 0.0
    fun spentAmt(): Double = spent.toDoubleOrNull() ?: 0.0
    fun remaining(): Double = budgetAmt() - spentAmt()
    fun percentage(): Float = if (budgetAmt() > 0) (spentAmt() / budgetAmt()).toFloat() else 0f
}

@Composable
fun StudentBudgetScreen(onBack: () -> Unit, vm: StudentBudgetViewModel = viewModel()) {
    val context = LocalContext.current
    fun toast(m: String) { android.widget.Toast.makeText(context, m, android.widget.Toast.LENGTH_SHORT).show() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Student Budget", "2000/month essentials mode", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    OutlinedTextField(value = vm.budget, onValueChange = vm::updateBudget, label = { Text("Monthly Budget") }, placeholder = { Text("2000") }, singleLine = true, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(value = vm.spent, onValueChange = vm::updateSpent, label = { Text("Amount Spent") }, placeholder = { Text("1200") }, singleLine = true, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), modifier = Modifier.fillMaxWidth())
                }
            }
            if (vm.budgetAmt() > 0) {
                item {
                    ToolCard {
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Remaining", style = MaterialTheme.typography.bodyMedium)
                            Text("${vm.remaining().toInt()}", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary)
                        }
                        LinearProgressIndicator(progress = { vm.percentage().coerceIn(0f, 1f) }, modifier = Modifier.fillMaxWidth())
                    }
                }
            }
        }
    }
}

// ------------------------------------------ subscription expiry (wave-C)

data class Subscription(val name: String, val expiryDate: String, val status: String)

class SubscriptionExpiryViewModel : ViewModel() {
    var subs = mutableStateListOf(
        Subscription("Netflix", "2024-12-15", "active"),
        Subscription("Spotify", "2024-11-30", "expiring"),
    ); private set
    var newName by mutableStateOf(""); private set
    var newDate by mutableStateOf(""); private set
    fun updateNewName(v: String) { newName = v }
    fun updateNewDate(v: String) { newDate = v }
    fun add(onDone: (String) -> Unit) {
        if (newName.isBlank() || newDate.isBlank()) { onDone("Enter name and expiry date"); return }
        subs.add(Subscription(newName.trim(), newDate.trim(), "active"))
        newName = ""; newDate = ""
        onDone("Subscription added!")
    }
}

@Composable
fun SubscriptionExpiryScreen(onBack: () -> Unit, vm: SubscriptionExpiryViewModel = viewModel()) {
    val context = LocalContext.current
    fun toast(m: String) { android.widget.Toast.makeText(context, m, android.widget.Toast.LENGTH_SHORT).show() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Subscription Expiry", "Never lose access", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(vm.subs, key = { it.name }) { sub ->
                ToolCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text(sub.name, style = MaterialTheme.typography.titleSmall)
                            Text("Expires ${sub.expiryDate}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        Text(sub.status, style = MaterialTheme.typography.labelLarge, color = if (sub.status == "expiring") MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary)
                    }
                }
            }
            item {
                ToolCard {
                    OutlinedTextField(value = vm.newName, onValueChange = vm::updateNewName, label = { Text("Service name") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(value = vm.newDate, onValueChange = vm::updateNewDate, label = { Text("Expiry date (YYYY-MM-DD)") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    Button(onClick = { vm.add({ toast(it) }) }, modifier = Modifier.fillMaxWidth()) { Text("Add subscription") }
                }
            }
        }
    }
}

// -------------------------------------------- alternative finder (wave-C)

data class Alternative(val name: String, val price: Int, val match: Int, val available: Boolean)

class AlternativeFinderViewModel : ViewModel() {
    var searching by mutableStateOf(false); private set
    var alternatives = mutableStateListOf<Alternative>(); private set
    fun find() {
        viewModelScope.launch {
            searching = true
            kotlinx.coroutines.delay(1500)
            alternatives.clear()
            alternatives.addAll(
                listOf(
                    Alternative("Brand Y Shirt", 899, 95, true),
                    Alternative("Brand Z Shirt", 999, 90, true),
                    Alternative("Brand W Shirt", 799, 85, false),
                )
            )
            searching = false
        }
    }
}

@Composable
fun AlternativeFinderScreen(onBack: () -> Unit, vm: AlternativeFinderViewModel = viewModel()) {
    val context = LocalContext.current
    fun toast(m: String) { android.widget.Toast.makeText(context, m, android.widget.Toast.LENGTH_SHORT).show() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Alternative Finder", "Out of stock? Try these", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    Text("Looking for alternatives to: Brand X Shirt (1,199)", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Button(onClick = vm::find, enabled = !vm.searching, modifier = Modifier.fillMaxWidth()) {
                        Text(if (vm.searching) "Finding…" else "Find Alternatives")
                    }
                }
            }
            items(vm.alternatives, key = { it.name }) { alt ->
                ToolCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text("${alt.name} · ${alt.match}% match", style = MaterialTheme.typography.titleSmall)
                            Text(if (alt.available) "In Stock" else "Out of stock", style = MaterialTheme.typography.bodySmall, color = if (alt.available) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error)
                            Text("${alt.price}", style = MaterialTheme.typography.bodyMedium)
                        }
                        if (alt.available) Button(onClick = { toast("${alt.name} added to cart") }) { Text("Add") }
                    }
                }
            }
        }
    }
}

// ---------------------------------------------- assembly finder (wave-C)

data class Technician(val name: String, val rating: Double, val jobs: Int, val price: Int)

private val technicians = listOf(
    Technician("Rahul Kumar", 4.8, 234, 299),
    Technician("Amit Singh", 4.9, 189, 349),
    Technician("Vikram Patel", 4.7, 312, 279),
)

@Composable
fun AssemblyFinderScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    fun toast(m: String) { android.widget.Toast.makeText(context, m, android.widget.Toast.LENGTH_SHORT).show() }
    var search by remember { mutableStateOf("") }
    val filtered = technicians.filter { search.isBlank() || it.name.contains(search, ignoreCase = true) }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Assembly Finder", "Book a technician", onBack)
        OutlinedTextField(value = search, onValueChange = { search = it }, label = { Text("Search technicians") }, singleLine = true, modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp))
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(filtered, key = { it.name }) { tech ->
                ToolCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text("🔧 ${tech.name}", style = MaterialTheme.typography.titleSmall)
                            Text("⭐ ${tech.rating} · ${tech.jobs} jobs", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Text("${tech.price} visit", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.primary)
                        }
                        Button(onClick = { toast("Booked ${tech.name}! They'll arrive in 2 hours.") }) { Text("Book") }
                    }
                }
            }
        }
    }
}

// ----------------------------------------------- auto coupon (wave-D)

data class DemoCoupon(val code: String, val desc: String, val off: String)

private val demoCoupons = listOf(
    DemoCoupon("WELCOME10", "10% off your first order", "10%"),
    DemoCoupon("FLAT500", "Flat 500 off above 4999", "500"),
    DemoCoupon("FREESHIP", "Free express shipping", "ship"),
)

class AutoCouponViewModel : ViewModel() {
    var loading by mutableStateOf(true); private set
    var coupons = mutableStateListOf<DemoCoupon>(); private set
    init {
        viewModelScope.launch {
            kotlinx.coroutines.delay(1200)
            coupons.addAll(demoCoupons)
            loading = false
        }
    }
    fun best(): DemoCoupon? = coupons.firstOrNull()
}

@Composable
fun AutoCouponScreen(onBack: () -> Unit, vm: AutoCouponViewModel = viewModel()) {
    val context = LocalContext.current
    fun toast(m: String) { android.widget.Toast.makeText(context, m, android.widget.Toast.LENGTH_SHORT).show() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Auto Coupon", "Best code, applied for you", onBack)
        if (vm.loading) { Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("Finding coupons…") } } else {
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            vm.best()?.let { best ->
                item {
                    ToolCard {
                        Text("🏆 Best for cart (5000): ${best.code}", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                        Text(best.desc, style = MaterialTheme.typography.bodyMedium)
                        Button(onClick = { toast("Coupon code copied!") }, modifier = Modifier.fillMaxWidth()) { Text("Copy ${best.code}") }
                    }
                }
            }
            items(vm.coupons, key = { it.code }) { coupon ->
                ToolCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text(coupon.code, style = MaterialTheme.typography.titleSmall)
                            Text(coupon.desc, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        Button(onClick = { toast("Coupon code copied!") }) { Text("Copy") }
                    }
                }
            }
        }
        }
    }
}

// -------------------------------------------------- bulk buy (wave-D)

class BulkBuyViewModel : ViewModel() {
    var productId by mutableStateOf(""); private set
    var targetPrice by mutableStateOf(""); private set
    var quantity by mutableStateOf(5); private set
    var loading by mutableStateOf(false); private set
    var sent by mutableStateOf(false); private set
    fun updateProductId(v: String) { productId = v; sent = false }
    fun updateTargetPrice(v: String) { targetPrice = v.filter { it.isDigit() }; sent = false }
    fun updateQuantity(v: Int) { quantity = v.coerceIn(1, 1000) }
    fun send(onDone: (String) -> Unit) {
        viewModelScope.launch {
            loading = true
            kotlinx.coroutines.delay(1200)
            loading = false
            sent = true
            onDone("Request sent to 5 sellers!")
        }
    }
}

@Composable
fun BulkBuyScreen(onBack: () -> Unit, vm: BulkBuyViewModel = viewModel()) {
    val context = LocalContext.current
    fun toast(m: String) { android.widget.Toast.makeText(context, m, android.widget.Toast.LENGTH_SHORT).show() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Bulk Buy", "Name your price, sellers compete", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    OutlinedTextField(value = vm.productId, onValueChange = vm::updateProductId, label = { Text("Product name or ID") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(value = vm.targetPrice, onValueChange = vm::updateTargetPrice, label = { Text("Target price per unit") }, singleLine = true, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), modifier = Modifier.fillMaxWidth())
                    Text("Quantity: ${vm.quantity}", style = MaterialTheme.typography.bodyMedium)
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf(5, 10, 25, 100).forEach { q ->
                            Button(onClick = { vm.updateQuantity(q) }) { Text("$q") }
                        }
                    }
                    Button(onClick = { vm.send(::toast) }, enabled = vm.productId.isNotBlank() && !vm.loading, modifier = Modifier.fillMaxWidth()) {
                        Text(if (vm.loading) "Sending…" else "Send request")
                    }
                }
            }
            if (vm.sent) {
                item {
                    ToolCard {
                        Text("✅ Request live — sellers are bidding", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                        Text("You will be notified when a seller beats ${vm.targetPrice.ifBlank { "your target" }}.", style = MaterialTheme.typography.bodyMedium)
                    }
                }
            }
        }
    }
}

// ------------------------------------------- one-click reorder (wave-D)

data class ReorderLine(val name: String, val price: Double)

class OneClickReorderViewModel : ViewModel() {
    var lines = mutableStateListOf(
        ReorderLine("Wireless Earbuds", 1299.0),
        ReorderLine("Phone Case", 499.0),
    ); private set
    var placing by mutableStateOf(false); private set
    fun reorder(onDone: (String) -> Unit) {
        viewModelScope.launch {
            placing = true
            lines.forEachIndexed { i, l ->
                com.grapsee.shop.core.cart.CartStore.add(com.grapsee.shop.core.network.CartLine(id = "reorder-$i", productId = "reorder-$i", name = l.name, price = l.price, quantity = 1))
            }
            placing = false
            onDone("${lines.size} items added to cart!")
        }
    }
}

@Composable
fun OneClickReorderScreen(onBack: () -> Unit, onCart: () -> Unit, vm: OneClickReorderViewModel = viewModel()) {
    val context = LocalContext.current
    fun toast(m: String) { android.widget.Toast.makeText(context, m, android.widget.Toast.LENGTH_SHORT).show() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("One-Click Reorder", "Same as last time", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(vm.lines, key = { it.name }) { line ->
                ToolCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text(line.name, style = MaterialTheme.typography.titleSmall)
                            Text("${line.price.toInt()}", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.primary)
                        }
                    }
                }
            }
            item {
                Button(onClick = { vm.reorder { toast(it); onCart() } }, enabled = !vm.placing, modifier = Modifier.fillMaxWidth()) {
                    Text(if (vm.placing) "Adding…" else "Reorder all (${vm.lines.size})")
                }
            }
        }
    }
}

// ------------------------------------------ price drop refund (wave-D)

data class DropRefund(val name: String, val orderId: String, val drop: Int, var claimed: Boolean = false)

class PriceDropRefundViewModel : ViewModel() {
    var refunds = mutableStateListOf(
        DropRefund("Bluetooth Speaker", "ORD-1042", 350),
        DropRefund("Running Shoes", "ORD-1038", 200),
    ); private set
    fun claim(orderId: String, onDone: (String) -> Unit) {
        val i = refunds.indexOfFirst { it.orderId == orderId }
        if (i >= 0) refunds[i] = refunds[i].copy(claimed = true)
        onDone("Refund claimed! Money will be back in 5-7 days.")
    }
}

@Composable
fun PriceDropRefundScreen(onBack: () -> Unit, vm: PriceDropRefundViewModel = viewModel()) {
    val context = LocalContext.current
    fun toast(m: String) { android.widget.Toast.makeText(context, m, android.widget.Toast.LENGTH_SHORT).show() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Price-Drop Refunds", "Bought high? Get the gap back", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(vm.refunds, key = { it.orderId }) { refund ->
                ToolCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text(refund.name, style = MaterialTheme.typography.titleSmall)
                            Text("${refund.orderId} · dropped ${refund.drop}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        if (refund.claimed) Text("Claimed ✅", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.primary)
                        else Button(onClick = { vm.claim(refund.orderId, ::toast) }) { Text("Claim ${refund.drop}") }
                    }
                }
            }
        }
    }
}

// ----------------------------------------- grocery list import (wave-D)

data class GroceryMatch(val name: String, val price: Int)

class GroceryImportViewModel : ViewModel() {
    var raw by mutableStateOf(""); private set
    var importing by mutableStateOf(false); private set
    var items = mutableStateListOf<GroceryMatch>(); private set
    fun updateRaw(v: String) { raw = v }
    fun import(onDone: (String) -> Unit) {
        viewModelScope.launch {
            importing = true
            kotlinx.coroutines.delay(1000)
            items.clear()
            val catalog = mapOf("milk" to 60, "eggs" to 90, "bread" to 45, "rice" to 120, "atta" to 210, "sugar" to 50, "tea" to 140, "coffee" to 220)
            raw.lines().map { it.trim().lowercase() }.filter { it.isNotEmpty() }.forEach { line ->
                val hit = catalog.entries.firstOrNull { line.contains(it.key) }
                items.add(GroceryMatch(line, hit?.value ?: 99))
            }
            importing = false
            onDone("Found ${items.size} items!")
        }
    }
}

@Composable
fun GroceryImportScreen(onBack: () -> Unit, vm: GroceryImportViewModel = viewModel()) {
    val context = LocalContext.current
    fun toast(m: String) { android.widget.Toast.makeText(context, m, android.widget.Toast.LENGTH_SHORT).show() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Grocery List Import", "Paste list, get matched cart", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    OutlinedTextField(value = vm.raw, onValueChange = vm::updateRaw, label = { Text("Paste your list (one item per line)") }, modifier = Modifier.fillMaxWidth(), minLines = 3)
                    Button(onClick = { vm.import(::toast) }, enabled = vm.raw.isNotBlank() && !vm.importing, modifier = Modifier.fillMaxWidth()) {
                        Text(if (vm.importing) "Matching…" else "Import list")
                    }
                }
            }
            items(vm.items, key = { it.name }) { item ->
                ToolCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(item.name, style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f))
                        Text("${item.price}", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                    }
                }
            }
            if (vm.items.isNotEmpty()) {
                item {
                    Button(onClick = { toast("Added ${vm.items.size} items to cart!") }, modifier = Modifier.fillMaxWidth()) {
                        Text("Add All to Cart (${vm.items.sumOf { it.price }})")
                    }
                }
            }
        }
    }
}

// ---------------------------------------------- recipe to cart (wave-D)

data class Ingredient(val name: String, val qty: String)

class RecipeToCartViewModel : ViewModel() {
    var url by mutableStateOf(""); private set
    var servings by mutableStateOf(4); private set
    var loading by mutableStateOf(false); private set
    var ingredients = mutableStateListOf<Ingredient>(); private set
    fun updateUrl(v: String) { url = v; ingredients.clear() }
    fun pickServings(n: Int) { servings = n }
    fun convert(onDone: (String) -> Unit) {
        viewModelScope.launch {
            loading = true
            kotlinx.coroutines.delay(1200)
            ingredients.clear()
            val scale = servings / 4.0
            ingredients.addAll(
                listOf(
                    Ingredient("Basmati Rice", "${(500 * scale).toInt()} g"),
                    Ingredient("Chicken", "${(750 * scale).toInt()} g"),
                    Ingredient("Onions", "${(3 * scale).toInt()} pcs"),
                    Ingredient("Biryani Masala", "${(2 * scale).toInt()} tbsp"),
                    Ingredient("Curd", "${(250 * scale).toInt()} g"),
                )
            )
            loading = false
            onDone("Added ${ingredients.size} ingredients to cart!")
        }
    }
}

@Composable
fun RecipeToCartScreen(onBack: () -> Unit, vm: RecipeToCartViewModel = viewModel()) {
    val context = LocalContext.current
    fun toast(m: String) { android.widget.Toast.makeText(context, m, android.widget.Toast.LENGTH_SHORT).show() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Recipe to Cart", "Link in, ingredients out", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    OutlinedTextField(value = vm.url, onValueChange = vm::updateUrl, label = { Text("Recipe URL") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf(2, 4, 6, 8).forEach { n ->
                            val selected = vm.servings == n
                            Surface(
                                shape = RoundedCornerShape(20.dp),
                                color = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                                modifier = Modifier.clip(RoundedCornerShape(20.dp)).clickable { vm.pickServings(n) },
                            ) {
                                Text("$n", modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp), style = MaterialTheme.typography.labelLarge, color = if (selected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface)
                            }
                        }
                    }
                    Button(onClick = { vm.convert(::toast) }, enabled = vm.url.isNotBlank() && !vm.loading, modifier = Modifier.fillMaxWidth()) {
                        Text(if (vm.loading) "Converting…" else "Convert for ${vm.servings} servings")
                    }
                }
            }
            items(vm.ingredients, key = { it.name }) { ing ->
                ToolCard {
                    Row {
                        Text(ing.name, style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f))
                        Text(ing.qty, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.primary)
                    }
                }
            }
        }
    }
}

// ------------------------------------------------ pet supplies (wave-D)

class PetSuppliesViewModel : ViewModel() {
    var petType by mutableStateOf("dog"); private set
    var autoPilot by mutableStateOf(false); private set
    var loading by mutableStateOf(false); private set
    fun pickPet(v: String) { petType = v }
    fun setup(onDone: (String) -> Unit) {
        viewModelScope.launch {
            loading = true
            kotlinx.coroutines.delay(1000)
            loading = false
            autoPilot = true
            onDone("Pet Auto-Pilot enabled!")
        }
    }
}

@Composable
fun PetSuppliesScreen(onBack: () -> Unit, vm: PetSuppliesViewModel = viewModel()) {
    val context = LocalContext.current
    fun toast(m: String) { android.widget.Toast.makeText(context, m, android.widget.Toast.LENGTH_SHORT).show() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Pet Supplies", "Auto-pilot for your buddy", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf("dog" to "🐶 Dog", "cat" to "🐱 Cat").forEach { (value, label) ->
                            val selected = vm.petType == value
                            Surface(
                                shape = RoundedCornerShape(20.dp),
                                color = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                                modifier = Modifier.clip(RoundedCornerShape(20.dp)).clickable { vm.pickPet(value) },
                            ) {
                                Text(label, modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp), style = MaterialTheme.typography.labelLarge, color = if (selected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface)
                            }
                        }
                    }
                    listOf("Monthly food pack", "Treats rotation", "Grooming essentials", "Toy of the month").forEach { Text("• $it", style = MaterialTheme.typography.bodyMedium) }
                    Button(onClick = { vm.setup(::toast) }, enabled = !vm.loading && !vm.autoPilot, modifier = Modifier.fillMaxWidth()) {
                        Text(if (vm.autoPilot) "Auto-Pilot ON ✅" else if (vm.loading) "Setting up…" else "Enable Auto-Pilot")
                    }
                }
            }
        }
    }
}

// -------------------------------------------- school supplies (wave-D)

data class KitItem(val id: Int, val name: String, val price: Int, var checked: Boolean = true)

class SchoolSuppliesViewModel : ViewModel() {
    var grade by mutableStateOf("5"); private set
    var items = mutableStateListOf<KitItem>(); private set
    fun updateGrade(v: String) { grade = v.filter { it.isDigit() }.take(2) }
    fun generate(onDone: (String) -> Unit) {
        viewModelScope.launch {
            kotlinx.coroutines.delay(1000)
            items.clear()
            items.addAll(
                listOf(
                    KitItem(1, "Notebook set (6 pcs)", 240),
                    KitItem(2, "Geometry box", 150),
                    KitItem(3, "Crayons 24 shades", 120),
                    KitItem(4, "School bag", 899),
                    KitItem(5, "Water bottle", 299),
                    KitItem(6, "Lunch box", 349),
                )
            )
            onDone("Generated list for Grade ${grade.ifBlank { "5" }}")
        }
    }
    fun toggle(id: Int) {
        val i = items.indexOfFirst { it.id == id }
        if (i >= 0) items[i] = items[i].copy(checked = !items[i].checked)
    }
}

@Composable
fun SchoolSuppliesScreen(onBack: () -> Unit, vm: SchoolSuppliesViewModel = viewModel()) {
    val context = LocalContext.current
    fun toast(m: String) { android.widget.Toast.makeText(context, m, android.widget.Toast.LENGTH_SHORT).show() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("School Supply Kit", "Grade-wise checklist", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    OutlinedTextField(value = vm.grade, onValueChange = vm::updateGrade, label = { Text("Grade/Class") }, singleLine = true, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), modifier = Modifier.fillMaxWidth())
                    Button(onClick = { vm.generate(::toast) }, modifier = Modifier.fillMaxWidth()) { Text("Generate list") }
                }
            }
            items(vm.items, key = { it.id }) { item ->
                ToolCard {
                    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.clickable { vm.toggle(item.id) }) {
                        Checkbox(checked = item.checked, onCheckedChange = { vm.toggle(item.id) })
                        Text(item.name, style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f))
                        Text("${item.price}", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.primary)
                    }
                }
            }
            if (vm.items.isNotEmpty()) {
                item {
                    Button(onClick = { toast("${vm.items.count { it.checked }} items added to cart!") }, modifier = Modifier.fillMaxWidth()) { Text("Add checked to cart") }
                }
            }
        }
    }
}

// ------------------------------------------------- moving kit (wave-D)

class MovingKitViewModel : ViewModel() {
    var houseSize by mutableStateOf("2bhk"); private set
    var items = mutableStateListOf<KitItem>(); private set
    fun pickSize(v: String) { houseSize = v }
    fun generate(onDone: (String) -> Unit) {
        viewModelScope.launch {
            kotlinx.coroutines.delay(1000)
            val mult = when (houseSize) { "1bhk" -> 1; "2bhk" -> 2; "3bhk" -> 3; else -> 4 }
            items.clear()
            items.addAll(
                listOf(
                    KitItem(1, "Carton boxes (${mult * 10} pcs)", mult * 300),
                    KitItem(2, "Bubble wrap (${mult * 2} rolls)", mult * 180),
                    KitItem(3, "Packing tape (${mult * 3} pcs)", mult * 60),
                    KitItem(4, "Markers + labels set", 120),
                    KitItem(5, "Mattress cover", 250),
                )
            )
            onDone("Generated $houseSize moving kit!")
        }
    }
    fun toggle(id: Int) {
        val i = items.indexOfFirst { it.id == id }
        if (i >= 0) items[i] = items[i].copy(checked = !items[i].checked)
    }
}

@Composable
fun MovingKitScreen(onBack: () -> Unit, vm: MovingKitViewModel = viewModel()) {
    val context = LocalContext.current
    fun toast(m: String) { android.widget.Toast.makeText(context, m, android.widget.Toast.LENGTH_SHORT).show() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Moving House Kit", "Pack like a pro", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf("1bhk", "2bhk", "3bhk", "4bhk+").forEach { size ->
                            val selected = vm.houseSize == size
                            Surface(
                                shape = RoundedCornerShape(20.dp),
                                color = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                                modifier = Modifier.clip(RoundedCornerShape(20.dp)).clickable { vm.pickSize(size) },
                            ) {
                                Text(size, modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp), style = MaterialTheme.typography.labelLarge, color = if (selected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface)
                            }
                        }
                    }
                    Button(onClick = { vm.generate(::toast) }, modifier = Modifier.fillMaxWidth()) { Text("Generate kit") }
                }
            }
            items(vm.items, key = { it.id }) { item ->
                ToolCard {
                    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.clickable { vm.toggle(item.id) }) {
                        Checkbox(checked = item.checked, onCheckedChange = { vm.toggle(item.id) })
                        Text(item.name, style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f))
                        Text("${item.price}", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.primary)
                    }
                }
            }
            if (vm.items.isNotEmpty()) {
                item {
                    Button(onClick = { toast("${vm.items.count { it.checked }} items added to cart!") }, modifier = Modifier.fillMaxWidth()) { Text("Add checked to cart") }
                }
            }
        }
    }
}

// -------------------------------------------- appliance repair (wave-D)

class ApplianceRepairViewModel : ViewModel() {
    var applianceType by mutableStateOf(""); private set
    var problem by mutableStateOf(""); private set
    var urgency by mutableStateOf("normal"); private set
    var loading by mutableStateOf(false); private set
    var techs = mutableStateListOf<Technician>(); private set
    fun pickType(v: String) { applianceType = v }
    fun updateProblem(v: String) { problem = v }
    fun pickUrgency(v: String) { urgency = v }
    fun find(onError: (String) -> Unit) {
        if (applianceType.isBlank() || problem.isBlank()) { onError("Please fill all fields"); return }
        viewModelScope.launch {
            loading = true
            kotlinx.coroutines.delay(1000)
            techs.clear()
            techs.addAll(technicians)
            loading = false
        }
    }
}

@Composable
fun ApplianceRepairScreen(onBack: () -> Unit, vm: ApplianceRepairViewModel = viewModel()) {
    val context = LocalContext.current
    fun toast(m: String) { android.widget.Toast.makeText(context, m, android.widget.Toast.LENGTH_SHORT).show() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Appliance Repair", "Certified technicians", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf("AC", "Fridge", "Washing Machine", "TV").forEach { type ->
                            val selected = vm.applianceType == type
                            Surface(
                                shape = RoundedCornerShape(20.dp),
                                color = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                                modifier = Modifier.clip(RoundedCornerShape(20.dp)).clickable { vm.pickType(type) },
                            ) {
                                Text(type, modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp), style = MaterialTheme.typography.labelMedium, color = if (selected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface)
                            }
                        }
                    }
                    OutlinedTextField(value = vm.problem, onValueChange = vm::updateProblem, label = { Text("Describe the problem") }, modifier = Modifier.fillMaxWidth())
                    Button(onClick = { vm.find(::toast) }, enabled = !vm.loading, modifier = Modifier.fillMaxWidth()) {
                        Text(if (vm.loading) "Finding…" else "Find technicians")
                    }
                }
            }
            items(vm.techs, key = { it.name }) { tech ->
                ToolCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text("🔧 ${tech.name}", style = MaterialTheme.typography.titleSmall)
                            Text("⭐ ${tech.rating} · ${tech.jobs} jobs · ${tech.price} visit", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        Button(onClick = { toast("Booked ${tech.name}! They'll arrive in 2 hours.") }) { Text("Book") }
                    }
                }
            }
        }
    }
}

// ------------------------------------------------ safety recall (wave-D)

class SafetyRecallViewModel : ViewModel() {
    var productId by mutableStateOf(""); private set
    var checked by mutableStateOf(false); private set
    var safe by mutableStateOf(true); private set
    fun updateProductId(v: String) { productId = v; checked = false }
    fun check(onSafe: (String) -> Unit, onRecalled: (String) -> Unit) {
        val recalled = productId.trim().lowercase().contains("x100") || productId.trim().endsWith("007")
        safe = !recalled
        checked = true
        if (recalled) onRecalled("Product has been recalled!") else onSafe("Product is safe!")
    }
}

@Composable
fun SafetyRecallScreen(onBack: () -> Unit, vm: SafetyRecallViewModel = viewModel()) {
    val context = LocalContext.current
    fun toast(m: String) { android.widget.Toast.makeText(context, m, android.widget.Toast.LENGTH_SHORT).show() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Safety Recall Check", "Is your product affected?", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    OutlinedTextField(value = vm.productId, onValueChange = vm::updateProductId, label = { Text("Product ID / model") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    Button(onClick = { vm.check(::toast, ::toast) }, enabled = vm.productId.isNotBlank(), modifier = Modifier.fillMaxWidth()) { Text("Check recall") }
                }
            }
            if (vm.checked) {
                item {
                    ToolCard {
                        Text(if (vm.safe) "✅ Product is safe" else "⚠️ Recalled — stop use", style = MaterialTheme.typography.titleSmall, color = if (vm.safe) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error)
                        Text(if (vm.safe) "No active recalls for this model." else "Contact support for a free replacement or refund.", style = MaterialTheme.typography.bodyMedium)
                    }
                }
            }
        }
    }
}

// ----------------------------------------------- verified photos (wave-D)

data class VerifiedPhoto(val user: String, val verified: Boolean, val likes: Int, val product: String)

private val verifiedPhotos = listOf(
    VerifiedPhoto("Rahul M.", true, 24, "iPhone 15"),
    VerifiedPhoto("Priya K.", true, 18, "Samsung S24"),
    VerifiedPhoto("Amit S.", false, 5, "OnePlus 12"),
)

@Composable
fun VerifiedPhotosScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    fun toast(m: String) { android.widget.Toast.makeText(context, m, android.widget.Toast.LENGTH_SHORT).show() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Verified Photos", "Only real buyers upload", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    Text("Only verified buyers can upload", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Button(onClick = { toast("Photo uploaded for verification!") }, modifier = Modifier.fillMaxWidth()) { Text("Upload Photo") }
                }
            }
            items(verifiedPhotos, key = { it.user + it.product }) { photo ->
                ToolCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text("${photo.product} ${if (photo.verified) "✅" else ""}", style = MaterialTheme.typography.titleSmall)
                            Text("${photo.user} · ❤ ${photo.likes}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }
        }
    }
}

// ----------------------------------------------- child growth (wave-E)

data class GrowthRec(val age: String, val items: List<String>)

val growthRecs = listOf(
    GrowthRec("0-6 months", listOf("Diapers", "Baby wipes", "Feeding bottles")),
    GrowthRec("6-12 months", listOf("Solid foods", "Baby toys", "Crawling mats")),
    GrowthRec("1-2 years", listOf("Walker", "Building blocks", "Story books")),
)

class ChildGrowthViewModel : ViewModel() {
    var ageMonths by mutableStateOf(""); private set
    var height by mutableStateOf(""); private set
    var weight by mutableStateOf(""); private set
    fun updateAge(v: String) { ageMonths = v.filter { it.isDigit() }.take(3) }
    fun updateHeight(v: String) { height = v.filter { it.isDigit() }.take(3) }
    fun updateWeight(v: String) { weight = v.filter { it.isDigit() }.take(3) }
    fun current(): GrowthRec {
        val years = (ageMonths.toIntOrNull() ?: 6) / 12
        return growthRecs.firstOrNull { it.age.contains(years.toString()) } ?: growthRecs[0]
    }
}

@Composable
fun ChildGrowthScreen(onBack: () -> Unit, vm: ChildGrowthViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Child Growth Tracker", "Age-based essentials", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    OutlinedTextField(value = vm.ageMonths, onValueChange = vm::updateAge, label = { Text("Age (months)") }, placeholder = { Text("6") }, singleLine = true, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(value = vm.height, onValueChange = vm::updateHeight, label = { Text("Height (cm)") }, singleLine = true, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(value = vm.weight, onValueChange = vm::updateWeight, label = { Text("Weight (kg)") }, singleLine = true, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), modifier = Modifier.fillMaxWidth())
                }
            }
            item {
                val rec = vm.current()
                ToolCard {
                    Text("👶 Age group: ${rec.age}", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                    rec.items.forEach { Text("• $it", style = MaterialTheme.typography.bodyMedium) }
                    Text("Next: next size diapers + teething toys", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
    }
}

// -------------------------------------------- diabetic scanner (wave-E)

data class DiabeticResult(val food: String, val rating: String, val color: String, val note: String)

class DiabeticScannerViewModel : ViewModel() {
    var food by mutableStateOf(""); private set
    var scanning by mutableStateOf(false); private set
    var result by mutableStateOf<DiabeticResult?>(null); private set
    fun updateFood(v: String) { food = v; result = null }
    fun scan() {
        viewModelScope.launch {
            scanning = true
            kotlinx.coroutines.delay(1500)
            val low = food.lowercase()
            result = when {
                low.contains("apple") || low.contains("oat") || low.contains("dal") || low.contains("salad") ->
                    DiabeticResult(food.trim(), "GOOD", "green", "Low glycemic impact, safe in normal portions.")
                low.contains("cake") || low.contains("cola") || low.contains("sugar") || low.contains("candy") ->
                    DiabeticResult(food.trim(), "AVOID", "red", "High sugar spike — skip or take a tiny portion.")
                else -> DiabeticResult(food.trim(), "MODERATE", "yellow", "OK in small portions with protein or fibre.")
            }
            scanning = false
        }
    }
}

@Composable
fun DiabeticScannerScreen(onBack: () -> Unit, vm: DiabeticScannerViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Diabetic Scanner", "Is this food safe for you?", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    OutlinedTextField(value = vm.food, onValueChange = vm::updateFood, label = { Text("Food name") }, placeholder = { Text("e.g. apple, cake, oats") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    Button(onClick = vm::scan, enabled = vm.food.isNotBlank() && !vm.scanning, modifier = Modifier.fillMaxWidth()) {
                        Text(if (vm.scanning) "Scanning…" else "Scan food")
                    }
                }
            }
            vm.result?.let { r ->
                item {
                    ToolCard {
                        Text("${if (r.color == "green") "🟢" else if (r.color == "red") "🔴" else "🟡"} ${r.rating}", style = MaterialTheme.typography.titleMedium, color = if (r.color == "red") MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary)
                        Text(r.food, style = MaterialTheme.typography.titleSmall)
                        Text(r.note, style = MaterialTheme.typography.bodyMedium)
                    }
                }
            }
        }
    }
}

// ------------------------------------------- ingredient scanner (wave-E)

data class ScanIngredient(val name: String, val risk: String)

val demoScanIngredients = listOf(
    ScanIngredient("Sugar", "high"),
    ScanIngredient("Palm Oil", "moderate"),
    ScanIngredient("Whole Wheat", "safe"),
    ScanIngredient("Preservative E202", "moderate"),
)

class IngredientScannerViewModel : ViewModel() {
    var product by mutableStateOf(""); private set
    var scanning by mutableStateOf(false); private set
    var done by mutableStateOf(false); private set
    fun updateProduct(v: String) { product = v; done = false }
    fun scan() {
        viewModelScope.launch {
            scanning = true
            kotlinx.coroutines.delay(1500)
            scanning = false
            done = true
        }
    }
}

@Composable
fun IngredientScannerScreen(onBack: () -> Unit, vm: IngredientScannerViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Ingredient Scanner", "Safety score for packaged food", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    OutlinedTextField(value = vm.product, onValueChange = vm::updateProduct, label = { Text("Product name") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    Button(onClick = vm::scan, enabled = vm.product.isNotBlank() && !vm.scanning, modifier = Modifier.fillMaxWidth()) {
                        Text(if (vm.scanning) "Scanning…" else "Scan product")
                    }
                }
            }
            if (vm.done) {
                item {
                    ToolCard {
                        Text("Safety Score: 72/100", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary)
                        demoScanIngredients.forEach { ing ->
                            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text(ing.name, style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f))
                                Text(ing.risk, style = MaterialTheme.typography.labelLarge, color = if (ing.risk == "safe") MaterialTheme.colorScheme.primary else if (ing.risk == "high") MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }
                    }
                }
            }
        }
    }
}

// ---------------------------------------------- ingredient swap (wave-E)

val swaps = mapOf(
    "butter" to listOf("olive oil", "coconut oil", "ghee"),
    "sugar" to listOf("honey", "stevia", "jaggery"),
    "flour" to listOf("almond flour", "oat flour", "coconut flour"),
    "milk" to listOf("almond milk", "oat milk", "soy milk"),
    "egg" to listOf("banana", "applesauce", "flax egg"),
)

@Composable
fun IngredientSwapScreen(onBack: () -> Unit) {
    var ingredient by remember { mutableStateOf("") }
    val suggestions = swaps[ingredient.trim().lowercase()].orEmpty()
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Ingredient Swap", "Substitutes for any ingredient", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    OutlinedTextField(value = ingredient, onValueChange = { ingredient = it }, label = { Text("Ingredient to replace") }, placeholder = { Text("e.g., butter, sugar, milk, egg") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                }
            }
            if (suggestions.isNotEmpty()) {
                item {
                    ToolCard {
                        Text("Substitutes for $ingredient:", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                        suggestions.forEach { Text("✅ $it", style = MaterialTheme.typography.bodyMedium) }
                    }
                }
            } else if (ingredient.isNotBlank()) {
                item {
                    ToolCard {
                        Text("No swaps known for \"$ingredient\" yet — try butter, sugar, flour, milk or egg.", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }
    }
}

// ----------------------------------------- medicine interaction (wave-E)

val knownInteractions = listOf(
    setOf("aspirin", "warfarin") to "Bleeding risk — consult your doctor immediately.",
    setOf("ibuprofen", "lisinopril") to "May reduce blood-pressure control and harm kidneys.",
    setOf("paracetamol", "alcohol") to "Liver strain — avoid alcohol with regular use.",
)

class MedicineInteractionViewModel : ViewModel() {
    var meds = mutableStateListOf<String>(); private set
    var newMed by mutableStateOf(""); private set
    var checked by mutableStateOf(false); private set
    fun updateNewMed(v: String) { newMed = v }
    fun add() {
        if (newMed.isBlank()) return
        meds.add(newMed.trim())
        newMed = ""
        checked = false
    }
    fun remove(med: String) { meds.remove(med); checked = false }
    fun markChecked() { checked = true }
    fun warnings(): List<String> {
        val lower = meds.map { it.lowercase() }.toSet()
        return knownInteractions.mapNotNull { (pair, msg) -> if (lower.containsAll(pair)) msg else null }
    }
}

@Composable
fun MedicineInteractionScreen(onBack: () -> Unit, vm: MedicineInteractionViewModel = viewModel()) {
    val context = LocalContext.current
    fun toast(m: String) { android.widget.Toast.makeText(context, m, android.widget.Toast.LENGTH_SHORT).show() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Medicine Interaction Checker", "Catch dangerous combos", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(value = vm.newMed, onValueChange = vm::updateNewMed, label = { Text("Medicine name") }, singleLine = true, modifier = Modifier.weight(1f))
                        Button(onClick = vm::add, enabled = vm.newMed.isNotBlank()) { Text("Add") }
                    }
                    Button(onClick = { vm.markChecked(); toast("Interaction check complete!") }, enabled = vm.meds.size >= 2, modifier = Modifier.fillMaxWidth()) { Text("Check interactions") }
                }
            }
            items(vm.meds, key = { it }) { med ->
                ToolCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("💊 $med", style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f))
                        Button(onClick = { vm.remove(med) }) { Text("Remove") }
                    }
                }
            }
            if (vm.checked) {
                val warnings = vm.warnings()
                item {
                    ToolCard {
                        if (warnings.isEmpty()) Text("✅ No known interactions between these medicines.", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.primary)
                        else warnings.forEach { Text("⚠️ $it", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.error) }
                    }
                }
            }
        }
    }
}

// -------------------------------------------- medicine tracker (wave-E)

data class TrackedMed(val name: String, val dose: String, val time: String)

class MedicineTrackerViewModel : ViewModel() {
    var meds = mutableStateListOf(
        TrackedMed("Paracetamol", "500mg", "8:00 AM"),
        TrackedMed("Vitamin D", "1000 IU", "9:00 PM"),
    ); private set
    var scanning by mutableStateOf(false); private set
    fun scan(onDone: (String) -> Unit) {
        viewModelScope.launch {
            scanning = true
            kotlinx.coroutines.delay(1200)
            meds.add(TrackedMed("Azithromycin", "250mg", "1:00 PM"))
            scanning = false
            onDone("Azithromycin added to tracker!")
        }
    }
}

@Composable
fun MedicineTrackerScreen(onBack: () -> Unit, vm: MedicineTrackerViewModel = viewModel()) {
    val context = LocalContext.current
    fun toast(m: String) { android.widget.Toast.makeText(context, m, android.widget.Toast.LENGTH_SHORT).show() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Medicine Tracker", "Never miss a dose", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(vm.meds, key = { it.name }) { med ->
                ToolCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text("💊 ${med.name} · ${med.dose}", style = MaterialTheme.typography.titleSmall)
                            Text("⏰ ${med.time}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }
            item {
                Button(onClick = { vm.scan(::toast) }, enabled = !vm.scanning, modifier = Modifier.fillMaxWidth()) {
                    Text(if (vm.scanning) "Scanning strip…" else "Scan medicine strip")
                }
            }
        }
    }
}

// ------------------------------------------- prescription scan (wave-E)

data class RxMed(val name: String, val qty: String, val price: Int)

class PrescriptionScanViewModel : ViewModel() {
    var scanning by mutableStateOf(false); private set
    var meds = mutableStateListOf<RxMed>(); private set
    fun scan(onDone: (String) -> Unit) {
        viewModelScope.launch {
            scanning = true
            kotlinx.coroutines.delay(1500)
            meds.clear()
            meds.addAll(
                listOf(
                    RxMed("Paracetamol 500mg", "15 tablets", 45),
                    RxMed("Azithromycin 250mg", "6 tablets", 120),
                    RxMed("Cetirizine 10mg", "10 tablets", 60),
                )
            )
            scanning = false
            onDone("Found ${meds.size} medicines!")
        }
    }
}

@Composable
fun PrescriptionScanScreen(onBack: () -> Unit, vm: PrescriptionScanViewModel = viewModel()) {
    val context = LocalContext.current
    fun toast(m: String) { android.widget.Toast.makeText(context, m, android.widget.Toast.LENGTH_SHORT).show() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Prescription Scan", "Photo to medicine cart", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                Button(onClick = { vm.scan(::toast) }, enabled = !vm.scanning, modifier = Modifier.fillMaxWidth()) {
                    Text(if (vm.scanning) "Reading prescription…" else "Scan prescription")
                }
            }
            items(vm.meds, key = { it.name }) { med ->
                ToolCard {
                    Row {
                        Column(Modifier.weight(1f)) {
                            Text(med.name, style = MaterialTheme.typography.titleSmall)
                            Text(med.qty, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        Text("${med.price}", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                    }
                }
            }
            if (vm.meds.isNotEmpty()) {
                item {
                    ToolCard {
                        Text("Total: ${vm.meds.sumOf { it.price }} (${vm.meds.size} medicines)", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                        Button(onClick = { toast("${vm.meds.size} medicines added to cart!") }, modifier = Modifier.fillMaxWidth()) { Text("Order all") }
                    }
                }
            }
        }
    }
}

// ---------------------------------------------- health monitor (wave-E)

data class HealthMetric(val name: String, val value: String)

val healthMetrics = listOf(
    HealthMetric("Uptime", "99.9%"),
    HealthMetric("Response Time", "0.8s"),
    HealthMetric("Error Rate", "0.02%"),
    HealthMetric("SEO Score", "94/100"),
)

val healthHistory = listOf(
    "Week 1" to "100%",
    "Week 2" to "99.9%",
    "Week 3" to "99.8%",
    "Week 4" to "100%",
)

@Composable
fun HealthMonitorScreen(onBack: () -> Unit) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Site Health Monitor", "Healthy · 99.9% uptime", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    Text("💚 Status: healthy · checked 2 minutes ago · 0 errors · performance 94", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.primary)
                }
            }
            items(healthMetrics, key = { it.name }) { metric ->
                ToolCard {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text(metric.name, style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f))
                        Text("✅ ${metric.value}", style = MaterialTheme.typography.bodyMedium)
                    }
                }
            }
            item {
                ToolCard {
                    Text("4-week history", style = MaterialTheme.typography.titleSmall)
                    healthHistory.forEach { (week, uptime) ->
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(week, style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f))
                            Text(uptime, style = MaterialTheme.typography.bodyMedium)
                        }
                    }
                }
            }
        }
    }
}

// ------------------------------------------- project dashboard (wave-F)

data class DashMilestone(val name: String, val status: String, val date: String)

val dashMilestones = listOf(
    DashMilestone("Discovery", "completed", "Day 1-2"),
    DashMilestone("Design", "completed", "Day 3-7"),
    DashMilestone("Development", "in-progress", "Day 8-14"),
    DashMilestone("Testing", "pending", "Day 15-16"),
    DashMilestone("Launch", "pending", "Day 17"),
)

@Composable
fun ProjectDashboardScreen(onBack: () -> Unit) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Live Project Dashboard", "E-commerce Website · In Progress", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Progress 60%", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                        Text("Day 8 of 14 · Development", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    LinearProgressIndicator(progress = { 0.6f }, modifier = Modifier.fillMaxWidth())
                }
            }
            items(dashMilestones, key = { it.name }) { ms ->
                ToolCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(if (ms.status == "completed") "✅" else if (ms.status == "in-progress") "🔄" else "⏳", style = MaterialTheme.typography.titleMedium)
                        Column(Modifier.padding(start = 8.dp)) {
                            Text(ms.name, style = MaterialTheme.typography.titleSmall)
                            Text("${ms.status} · ${ms.date}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }
        }
    }
}

// -------------------------------------------- project planner (wave-F)

val diyProjects = mapOf(
    "bookshelf" to listOf("Wood planks (6)", "Screws (20)", "Wood glue", "Sandpaper", "Paint"),
    "photo frame" to listOf("Cardboard", "Scissors", "Glue", "Decorations"),
    "garden bed" to listOf("Wood (4 planks)", "Soil", "Seeds", "Nails"),
)

@Composable
fun ProjectPlannerScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    fun toast(m: String) { android.widget.Toast.makeText(context, m, android.widget.Toast.LENGTH_SHORT).show() }
    var project by remember { mutableStateOf("") }
    var materials by remember { mutableStateOf<List<String>>(emptyList()) }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Project Planner", "DIY materials calculator", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    OutlinedTextField(value = project, onValueChange = { project = it; materials = emptyList() }, label = { Text("Project (bookshelf, photo frame, garden bed)") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    Button(onClick = {
                        materials = diyProjects[project.trim().lowercase()].orEmpty()
                        if (materials.isNotEmpty()) toast("Materials list generated!")
                    }, modifier = Modifier.fillMaxWidth()) { Text("Generate list") }
                }
            }
            items(materials, key = { it }) { item ->
                ToolCard { Text("• $item", style = MaterialTheme.typography.bodyMedium) }
            }
        }
    }
}

// ------------------------------------------------- milestones (wave-F)

data class Milestone(val id: Int, val name: String, val status: String, val deliverables: List<String>, val approved: Boolean)

class MilestonesViewModel : ViewModel() {
    var milestones = mutableStateListOf(
        Milestone(1, "Wireframes", "completed", listOf("Homepage wireframe", "About page wireframe"), true),
        Milestone(2, "Design", "in-review", listOf("Homepage design", "Mobile design"), false),
        Milestone(3, "Frontend Development", "pending", listOf("HTML/CSS", "React components"), false),
        Milestone(4, "Backend Integration", "pending", listOf("API endpoints", "Database setup"), false),
    ); private set
    var feedback by mutableStateOf(""); private set
    fun updateFeedback(v: String) { feedback = v }
    fun approve(id: Int, onDone: (String) -> Unit) {
        val i = milestones.indexOfFirst { it.id == id }
        if (i >= 0) milestones[i] = milestones[i].copy(status = "completed", approved = true)
        onDone("Milestone approved!")
    }
}

@Composable
fun MilestonesScreen(onBack: () -> Unit, vm: MilestonesViewModel = viewModel()) {
    val context = LocalContext.current
    fun toast(m: String) { android.widget.Toast.makeText(context, m, android.widget.Toast.LENGTH_SHORT).show() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Milestones", "Review & approve deliverables", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(vm.milestones, key = { it.id }) { ms ->
                ToolCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text("${ms.id}. ${ms.name} ${if (ms.approved) "✅" else ""}", style = MaterialTheme.typography.titleSmall)
                            Text(ms.status, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.primary)
                            ms.deliverables.forEach { Text("• $it", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant) }
                        }
                        if (!ms.approved) Button(onClick = { vm.approve(ms.id, ::toast) }) { Text("Approve") }
                    }
                }
            }
            item {
                ToolCard {
                    OutlinedTextField(value = vm.feedback, onValueChange = vm::updateFeedback, label = { Text("Feedback for the team") }, modifier = Modifier.fillMaxWidth())
                    Button(onClick = { toast("Feedback sent!"); vm.updateFeedback("") }, enabled = vm.feedback.isNotBlank(), modifier = Modifier.fillMaxWidth()) { Text("Send feedback") }
                }
            }
        }
    }
}

// ------------------------------------------- deadline predictor (wave-F)

data class FeatureOpt(val id: String, val name: String, val days: Int)

val featureOpts = listOf(
    FeatureOpt("auth", "User Authentication", 3),
    FeatureOpt("payment", "Payment Integration", 4),
    FeatureOpt("cms", "Content Management", 5),
    FeatureOpt("analytics", "Analytics Dashboard", 3),
    FeatureOpt("chat", "Live Chat", 2),
    FeatureOpt("search", "Advanced Search", 3),
)

class DeadlinePredictorViewModel : ViewModel() {
    var selected = mutableStateListOf<String>(); private set
    var complexity by mutableStateOf("medium"); private set
    fun toggle(id: String) { if (selected.contains(id)) selected.remove(id) else selected.add(id) }
    fun pickComplexity(v: String) { complexity = v }
    fun baseDays(): Int = if (complexity == "simple") 7 else if (complexity == "medium") 14 else 21
    fun totalDays(): Int = baseDays() + featureOpts.filter { selected.contains(it.id) }.sumOf { it.days }
    fun rushDays(): Int = Math.ceil(totalDays() * 0.6).toInt()
}

@Composable
fun DeadlinePredictorScreen(onBack: () -> Unit, vm: DeadlinePredictorViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Deadline Predictor", "Honest timelines, upfront", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    Text("Complexity", style = MaterialTheme.typography.titleSmall)
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf("simple", "medium", "complex").forEach { c ->
                            val on = vm.complexity == c
                            Surface(
                                shape = RoundedCornerShape(20.dp),
                                color = if (on) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                                modifier = Modifier.clip(RoundedCornerShape(20.dp)).clickable { vm.pickComplexity(c) },
                            ) {
                                Text(c, modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp), style = MaterialTheme.typography.labelLarge, color = if (on) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface)
                            }
                        }
                    }
                }
            }
            items(featureOpts, key = { it.id }) { feat ->
                val on = vm.selected.contains(feat.id)
                ToolCard {
                    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.clickable { vm.toggle(feat.id) }) {
                        Checkbox(checked = on, onCheckedChange = { vm.toggle(feat.id) })
                        Text(feat.name, style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f))
                        Text("+${feat.days}d", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.primary)
                    }
                }
            }
            item {
                ToolCard {
                    Text("📅 Standard: ${vm.totalDays()} days · ⚡ Rush: ${vm.rushDays()} days", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                    Text("Base ${vm.baseDays()}d + features ${vm.totalDays() - vm.baseDays()}d", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
    }
}

// ----------------------------------------------- scope change (wave-F)

class ScopeChangeViewModel : ViewModel() {
    var requested by mutableStateOf(""); private set
    var analyzed by mutableStateOf(false); private set
    fun updateRequested(v: String) { requested = v; analyzed = false }
    fun analyze() { analyzed = true }
}

@Composable
fun ScopeChangeScreen(onBack: () -> Unit, vm: ScopeChangeViewModel = viewModel()) {
    val context = LocalContext.current
    fun toast(m: String) { android.widget.Toast.makeText(context, m, android.widget.Toast.LENGTH_SHORT).show() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Scope Change Detector", "Fair pricing for extras", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    OutlinedTextField(value = vm.requested, onValueChange = vm::updateRequested, label = { Text("Describe the change") }, modifier = Modifier.fillMaxWidth(), minLines = 2)
                    Button(onClick = vm::analyze, enabled = vm.requested.isNotBlank(), modifier = Modifier.fillMaxWidth()) { Text("Analyze change") }
                }
            }
            if (vm.analyzed) {
                item {
                    ToolCard {
                        Text("⚠️ Out of scope", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.error)
                        Text("Not included in original requirements document.", style = MaterialTheme.typography.bodyMedium)
                        Text("Estimated: 8 hours · 3999 · adds 2 days", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                        Button(onClick = { toast("Scope change approved! New timeline and cost updated.") }, modifier = Modifier.fillMaxWidth()) { Text("Approve change") }
                    }
                }
            }
        }
    }
}

// ---------------------------------------------- handoff portal (wave-F)

data class Deliverable(val name: String, val type: String, val size: String, val files: List<String>)

val deliverables = listOf(
    Deliverable("Source Code", "code", "24 MB", listOf("src/", "components/", "api/")),
    Deliverable("Design Assets", "assets", "156 MB", listOf("logos/", "icons/", "banners/")),
    Deliverable("Documentation", "docs", "2.4 MB", listOf("README.md", "API.md", "DEPLOY.md")),
    Deliverable("Video Tutorials", "video", "450 MB", listOf("setup.mp4", "admin-guide.mp4")),
)

@Composable
fun HandoffPortalScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    fun toast(m: String) { android.widget.Toast.makeText(context, m, android.widget.Toast.LENGTH_SHORT).show() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Handoff Portal", "Everything you own, in one place", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                Button(onClick = { toast("Starting download of all deliverables...") }, modifier = Modifier.fillMaxWidth()) { Text("Download all") }
            }
            items(deliverables, key = { it.name }) { d ->
                ToolCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text("📦 ${d.name} · ${d.size}", style = MaterialTheme.typography.titleSmall)
                            Text(d.files.joinToString(", "), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        Button(onClick = { toast("Downloading ${d.name}...") }) { Text("Get") }
                    }
                }
            }
        }
    }
}

// ----------------------------------------------- sla generator (wave-F)

class SlaViewModel : ViewModel() {
    var generated by mutableStateOf(false); private set
    fun generate() { generated = true }
}

val slaClauses = listOf(
    "Client must provide all content within 3 days of request",
    "Revisions must be requested within 7 days of milestone delivery",
    "Scope changes require written approval and may adjust timeline",
    "Payment milestones tied to deliverable approval",
    "Intellectual property transfers upon final payment",
)

@Composable
fun SlaGeneratorScreen(onBack: () -> Unit, vm: SlaViewModel = viewModel()) {
    val context = LocalContext.current
    fun toast(m: String) { android.widget.Toast.makeText(context, m, android.widget.Toast.LENGTH_SHORT).show() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("SLA Generator", "Website package terms", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                Button(onClick = { vm.generate(); toast("SLA generated!") }, modifier = Modifier.fillMaxWidth()) { Text("Generate SLA") }
            }
            if (vm.generated) {
                item {
                    ToolCard {
                        Text("📄 Website Development SLA", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                        listOf("Response time: 24 hours", "Revisions: 3 rounds included", "Delivery: 14-21 days", "Support: 30 days post-delivery", "Uptime: 99.5%", "Penalty: 10% discount per week delayed").forEach { Text("• $it", style = MaterialTheme.typography.bodyMedium) }
                        slaClauses.forEachIndexed { i, clause -> Text("${i + 1}. $clause", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant) }
                    }
                }
            }
        }
    }
}

// ------------------------------------------------- qbr reports (wave-F)

@Composable
fun QbrReportsScreen(onBack: () -> Unit) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Quarterly Business Reviews", "90-day insights", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    Text("📊 Q4 2024 · completed", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                    listOf("Traffic" to "+45%", "Conversions" to "+22%", "Revenue" to "+38%").forEach { (k, v) ->
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(k, style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f))
                            Text(v, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
            item {
                ToolCard {
                    Text("Recommendations", style = MaterialTheme.typography.titleSmall)
                    listOf("Optimize product page load times", "Add customer testimonials section", "Implement abandoned cart recovery").forEach { Text("• $it", style = MaterialTheme.typography.bodyMedium) }
                }
            }
        }
    }
}

// -------------------------------------------- churn prediction (wave-G)

data class AtRiskClient(val name: String, val risk: Int, val lastLogin: String, val renewal: String, val action: String)

val atRiskClients = listOf(
    AtRiskClient("TechStart Inc.", 78, "45 days ago", "2 weeks", "Send personalized offer"),
    AtRiskClient("Fashion Boutique", 65, "32 days ago", "1 month", "Schedule check-in call"),
    AtRiskClient("Dr. Ahmed Clinic", 52, "28 days ago", "3 weeks", "Send QBR report"),
)

@Composable
fun ChurnPredictionScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    fun toast(m: String) { android.widget.Toast.makeText(context, m, android.widget.Toast.LENGTH_SHORT).show() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Churn Prediction", "Save clients before they leave", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(atRiskClients, key = { it.name }) { client ->
                ToolCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text("${client.name} · risk ${client.risk}%", style = MaterialTheme.typography.titleSmall, color = if (client.risk >= 70) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurface)
                            Text("Last login ${client.lastLogin} · renews in ${client.renewal}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Text(client.action, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.primary)
                        }
                        Button(onClick = { toast("Offer sent to ${client.name}") }) { Text("Act") }
                    }
                }
            }
        }
    }
}

// -------------------------------------------------- client ltv (wave-G)

data class LtvSegment(val name: String, val count: Int, val avgLtv: Int, val total: Int)

val ltvSegments = listOf(
    LtvSegment("VIP Clients", 15, 85000, 1275000),
    LtvSegment("Regular Clients", 45, 25000, 1125000),
    LtvSegment("One-time Clients", 120, 8000, 960000),
)

@Composable
fun ClientLtvScreen(onBack: () -> Unit) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Client Lifetime Value", "Know your best segments", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(ltvSegments, key = { it.name }) { seg ->
                ToolCard {
                    Text("👑 ${seg.name} · ${seg.count} clients", style = MaterialTheme.typography.titleSmall)
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Avg LTV ${seg.avgLtv}", style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f))
                        Text("${seg.total}", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
                    }
                }
            }
        }
    }
}

// ------------------------------------------------ command center (wave-G)

@Composable
fun CommandCenterScreen(onBack: () -> Unit) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Client Command Center", "2 active projects · 34998 spent", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    listOf("Upcoming renewals" to "1", "Unread messages" to "3").forEach { (k, v) ->
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(k, style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f))
                            Text(v, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
            listOf("E-commerce Website" to 60, "Mobile App" to 15).forEach { (name, progress) ->
                item {
                    ToolCard {
                        Text("$name — $progress%", style = MaterialTheme.typography.titleSmall)
                        LinearProgressIndicator(progress = { progress / 100f }, modifier = Modifier.fillMaxWidth())
                    }
                }
            }
        }
    }
}

// --------------------------------------------- corporate credit (wave-G)

class CorporateCreditViewModel : ViewModel() {
    var company by mutableStateOf(""); private set
    var email by mutableStateOf(""); private set
    var revenue by mutableStateOf(""); private set
    var submitted by mutableStateOf(false); private set
    fun updateCompany(v: String) { company = v; submitted = false }
    fun updateEmail(v: String) { email = v.trim(); submitted = false }
    fun updateRevenue(v: String) { revenue = v.filter { it.isDigit() }; submitted = false }
    fun apply(onError: (String) -> Unit, onDone: (String) -> Unit) {
        if (company.isBlank() || email.isBlank() || revenue.isBlank()) { onError("Please fill in all fields"); return }
        submitted = true
        onDone("Application submitted!")
    }
}

@Composable
fun CorporateCreditScreen(onBack: () -> Unit, vm: CorporateCreditViewModel = viewModel()) {
    val context = LocalContext.current
    fun toast(m: String) { android.widget.Toast.makeText(context, m, android.widget.Toast.LENGTH_SHORT).show() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Corporate Credit Account", "Net-30 terms for businesses", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    OutlinedTextField(value = vm.company, onValueChange = vm::updateCompany, label = { Text("Company name") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(value = vm.email, onValueChange = vm::updateEmail, label = { Text("Work email") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(value = vm.revenue, onValueChange = vm::updateRevenue, label = { Text("Annual revenue") }, singleLine = true, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), modifier = Modifier.fillMaxWidth())
                    Button(onClick = { vm.apply(::toast, ::toast) }, modifier = Modifier.fillMaxWidth()) { Text("Apply") }
                }
            }
            if (vm.submitted) {
                item {
                    ToolCard {
                        Text("✅ Application received for ${vm.company}", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                        Text("Our credit team responds within 2 business days.", style = MaterialTheme.typography.bodyMedium)
                    }
                }
            }
        }
    }
}

// ------------------------------------------------- crowd wisdom (wave-G)

class CrowdWisdomViewModel : ViewModel() {
    var loading by mutableStateOf(false); private set
    var done by mutableStateOf(false); private set
    fun ask() {
        viewModelScope.launch {
            loading = true
            kotlinx.coroutines.delay(1200)
            loading = false
            done = true
        }
    }
}

@Composable
fun CrowdWisdomScreen(onBack: () -> Unit, vm: CrowdWisdomViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Crowd Wisdom", "See what 10,000+ people chose", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                Button(onClick = vm::ask, enabled = !vm.loading, modifier = Modifier.fillMaxWidth()) {
                    Text(if (vm.loading) "Asking the crowd…" else "Get crowd wisdom")
                }
            }
            if (vm.done) {
                item {
                    ToolCard {
                        Text("🏆 Crowd pick: Wireless Earbuds", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                        listOf("Wireless Earbuds" to 0.62f, "Wired Earphones" to 0.25f, "Over-ear Headphones" to 0.13f).forEach { (name, share) ->
                            Text(name, style = MaterialTheme.typography.bodyMedium)
                            LinearProgressIndicator(progress = { share }, modifier = Modifier.fillMaxWidth())
                        }
                        Text("6,200 of 10,000 buyers chose this · 4.6★ average", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }
    }
}

// ----------------------------------------------- demand forecast (wave-G)

data class Forecast(val month: String, val demand: String, val service: String, val reason: String)

val forecasts = listOf(
    Forecast("January", "High", "E-commerce", "New Year sales prep"),
    Forecast("February", "Medium", "General Websites", "Budget renewals"),
    Forecast("March", "High", "Mobile Apps", "Q1 launches"),
    Forecast("April", "Low", "Maintenance", "Post-launch support"),
    Forecast("May", "Medium", "Web Apps", "Mid-year upgrades"),
)

@Composable
fun DemandForecastScreen(onBack: () -> Unit) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Demand Forecast", "Plan capacity by month", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(forecasts, key = { it.month }) { fc ->
                ToolCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text("${fc.month} · ${fc.service}", style = MaterialTheme.typography.titleSmall)
                            Text(fc.reason, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        Text(fc.demand, style = MaterialTheme.typography.labelLarge, color = if (fc.demand == "High") MaterialTheme.colorScheme.primary else if (fc.demand == "Low") MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }
    }
}

// -------------------------------------------- dispute resolution (wave-G)

class DisputeViewModel : ViewModel() {
    var step by mutableStateOf(1); private set
    var description by mutableStateOf(""); private set
    var project by mutableStateOf("E-commerce Website"); private set
    fun updateDescription(v: String) { description = v }
    fun pickProject(v: String) { project = v }
    fun submit(onDone: (String) -> Unit) {
        step = 2
        onDone("Dispute filed. Team will respond within 24 hours.")
    }
}

@Composable
fun DisputeResolutionScreen(onBack: () -> Unit, vm: DisputeViewModel = viewModel()) {
    val context = LocalContext.current
    fun toast(m: String) { android.widget.Toast.makeText(context, m, android.widget.Toast.LENGTH_SHORT).show() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Dispute Resolution", "Fair resolution within 48 hours", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            if (vm.step == 1) {
                item {
                    ToolCard {
                        Text("File a Dispute", style = MaterialTheme.typography.titleSmall)
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            listOf("E-commerce Website", "Mobile App").forEach { p ->
                                val on = vm.project == p
                                Surface(
                                    shape = RoundedCornerShape(20.dp),
                                    color = if (on) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                                    modifier = Modifier.clip(RoundedCornerShape(20.dp)).clickable { vm.pickProject(p) },
                                ) {
                                    Text(p, modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp), style = MaterialTheme.typography.labelMedium, color = if (on) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface)
                                }
                            }
                        }
                        OutlinedTextField(value = vm.description, onValueChange = vm::updateDescription, label = { Text("What went wrong?") }, modifier = Modifier.fillMaxWidth(), minLines = 3)
                        Button(onClick = { vm.submit(::toast) }, enabled = vm.description.isNotBlank(), modifier = Modifier.fillMaxWidth()) { Text("File dispute") }
                    }
                }
            } else {
                item {
                    ToolCard {
                        Text("✅ Dispute filed for ${vm.project}", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                        listOf("Team responds within 24 hours", "Evidence review with both sides", "Binding resolution within 48 hours").forEach { Text("• $it", style = MaterialTheme.typography.bodyMedium) }
                    }
                }
            }
        }
    }
}

// ---------------------------------------------- guarantee vault (wave-G)

data class VaultMilestone(val name: String, val status: String, val amount: Int, val date: String)

val vaultMilestones = listOf(
    VaultMilestone("Deposit", "released", 7500, "Released Jan 15"),
    VaultMilestone("Design Complete", "held", 7500, "Held - awaiting approval"),
    VaultMilestone("Development", "held", 7500, "Held"),
    VaultMilestone("Final Delivery", "held", 4999, "Held"),
)

@Composable
fun GuaranteeVaultScreen(onBack: () -> Unit) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Guarantee Vault", "Escrow: 24999 secured ✅", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(vaultMilestones, key = { it.name }) { ms ->
                ToolCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text("${ms.name} ${if (ms.status == "released") "✅" else "🔒"}", style = MaterialTheme.typography.titleSmall)
                            Text(ms.date, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        Text("${ms.amount}", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                    }
                }
            }
        }
    }
}

// ------------------------------------------------- pricing test (wave-G)

@Composable
fun PricingTestScreen(onBack: () -> Unit) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Pricing A/B Test", "Website Development", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    Text("Variant A: 4999 · 1200 visitors · 45 conversions · 224955 revenue 🏆", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.primary)
                    Text("Variant B: 5499 · 1200 visitors · 38 conversions · 208962 revenue", style = MaterialTheme.typography.bodyMedium)
                }
            }
            item {
                ToolCard {
                    Text("Insight: the 4999 price point generates 15,993 more revenue despite the lower price.", style = MaterialTheme.typography.bodyMedium)
                }
            }
        }
    }
}

// -------------------------------------------- product liquidator (wave-G)

class LiquidatorViewModel : ViewModel() {
    var productName by mutableStateOf(""); private set
    var condition by mutableStateOf("good"); private set
    var age by mutableStateOf("1"); private set
    var loading by mutableStateOf(false); private set
    var estimate by mutableStateOf<Int?>(null); private set
    fun updateProductName(v: String) { productName = v; estimate = null }
    fun pickCondition(v: String) { condition = v; estimate = null }
    fun updateAge(v: String) { age = v.filter { it.isDigit() }.take(2); estimate = null }
    fun getEstimate(onDone: (String) -> Unit) {
        viewModelScope.launch {
            loading = true
            kotlinx.coroutines.delay(1200)
            val base = 10000
            val condF = if (condition == "excellent") 0.8 else if (condition == "good") 0.6 else 0.4
            val ageF = 1.0 / ((age.toIntOrNull() ?: 1).coerceAtLeast(1))
            estimate = (base * condF * (0.5 + 0.5 * ageF)).toInt()
            loading = false
            onDone("Listed on 5 platforms!")
        }
    }
}

@Composable
fun ProductLiquidatorScreen(onBack: () -> Unit, vm: LiquidatorViewModel = viewModel()) {
    val context = LocalContext.current
    fun toast(m: String) { android.widget.Toast.makeText(context, m, android.widget.Toast.LENGTH_SHORT).show() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Product Liquidator", "Sell dead stock fast", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ToolCard {
                    OutlinedTextField(value = vm.productName, onValueChange = vm::updateProductName, label = { Text("Product name") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf("excellent", "good", "fair").forEach { c ->
                            val on = vm.condition == c
                            Surface(
                                shape = RoundedCornerShape(20.dp),
                                color = if (on) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                                modifier = Modifier.clip(RoundedCornerShape(20.dp)).clickable { vm.pickCondition(c) },
                            ) {
                                Text(c, modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp), style = MaterialTheme.typography.labelMedium, color = if (on) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface)
                            }
                        }
                    }
                    OutlinedTextField(value = vm.age, onValueChange = vm::updateAge, label = { Text("Age (years)") }, singleLine = true, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), modifier = Modifier.fillMaxWidth())
                    Button(onClick = { vm.getEstimate(::toast) }, enabled = vm.productName.isNotBlank() && !vm.loading, modifier = Modifier.fillMaxWidth()) {
                        Text(if (vm.loading) "Estimating…" else "Get estimate & list")
                    }
                }
            }
            vm.estimate?.let { est ->
                item {
                    ToolCard {
                        Text("💰 Estimated resale: $est", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary)
                        Text("Auto-listed on 5 resale platforms with photos and pickup.", style = MaterialTheme.typography.bodyMedium)
                    }
                }
            }
        }
    }
}

// ------------------------------------------------- profitability (wave-G)

data class ProfitRow(val name: String, val revenue: Int, val hours: Int, val profit: Int, val margin: Int)

val profitRows = listOf(
    ProfitRow("Website Development", 245000, 180, 98000, 40),
    ProfitRow("Web Applications", 380000, 220, 152000, 40),
    ProfitRow("E-commerce", 165000, 120, 82500, 50),
    ProfitRow("Mobile Apps", 480000, 280, 192000, 40),
)

@Composable
fun ProfitabilityScreen(onBack: () -> Unit) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ToolHeader("Profitability", "Margin by service line", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(profitRows, key = { it.name }) { row ->
                ToolCard {
                    Text("💼 ${row.name} · ${row.margin}% margin", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                    Text("Revenue ${row.revenue} · ${row.hours}h · profit ${row.profit}", style = MaterialTheme.typography.bodyMedium)
                    LinearProgressIndicator(progress = { row.margin / 100f }, modifier = Modifier.fillMaxWidth())
                }
            }
        }
    }
}
