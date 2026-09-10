package com.grapsee.shop.features.services

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
import com.grapsee.shop.core.giftwrap.GiftWrapStore
import com.grapsee.shop.core.network.ApiClient
import com.grapsee.shop.core.network.DarkStoreDto
import com.grapsee.shop.core.network.OpenProjectDto
import com.grapsee.shop.core.network.Product
import com.grapsee.shop.core.network.TechResourceDto
import com.grapsee.shop.core.network.TopReviewerDto
import com.grapsee.shop.ui.components.EmptyState
import com.grapsee.shop.ui.components.LoadingBox
import com.grapsee.shop.ui.components.ProductCard
import kotlinx.coroutines.launch

// ------------------------------------------------------------ shared bits

@Composable
internal fun ServiceHeader(title: String, subtitle: String?, onBack: () -> Unit) {
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
internal fun ServiceCard(content: @Composable () -> Unit) {
    Surface(shape = RoundedCornerShape(16.dp), tonalElevation = 1.dp, modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) { content() }
    }
}

// -------------------------------------------------------------- gift wrap

class GiftWrapViewModel : ViewModel() {
    var designs by mutableStateOf<List<String>>(emptyList()); private set
    var ribbons by mutableStateOf<List<String>>(emptyList()); private set
    var design by mutableStateOf(""); private set
    var ribbon by mutableStateOf(""); private set
    var message by mutableStateOf(""); private set
    var loading by mutableStateOf(true); private set
    var saved by mutableStateOf(false); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            GiftWrapStore.start()
            val (d, r) = ApiClient.giftOptionsRaw()
            designs = d
            ribbons = r
            val current = GiftWrapStore.selection.value
            if (current.active) {
                design = current.design
                ribbon = current.ribbon
                message = current.message
            }
            loading = false
        }
    }
    fun pickDesign(v: String) { design = v; saved = false }
    fun pickRibbon(v: String) { ribbon = v; saved = false }
    fun updateMessage(v: String) { message = v.take(200); saved = false }
    fun save() {
        if (design.isEmpty()) return
        viewModelScope.launch {
            GiftWrapStore.save(design, ribbon, message)
            saved = true
        }
    }
    fun clear() {
        viewModelScope.launch {
            GiftWrapStore.clear()
            design = ""
            ribbon = ""
            message = ""
            saved = false
        }
    }
}

@Composable
fun GiftWrapScreen(onBack: () -> Unit, vm: GiftWrapViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ServiceHeader("Gift Wrap", "Designs, ribbons & a note", onBack)
        Box(Modifier.weight(1f)) {
            if (vm.loading) LoadingBox(Modifier.fillMaxSize())
            else LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                if (vm.designs.isNotEmpty()) {
                    item { Text("Designs", style = MaterialTheme.typography.titleSmall) }
                    items(vm.designs) { d ->
                        SelectRow(selected = vm.design == d, label = d) { vm.pickDesign(d) }
                    }
                }
                if (vm.ribbons.isNotEmpty()) {
                    item { Text("Ribbons", style = MaterialTheme.typography.titleSmall) }
                    items(vm.ribbons) { r ->
                        SelectRow(selected = vm.ribbon == r, label = r) { vm.pickRibbon(r) }
                    }
                }
                item {
                    ServiceCard {
                        OutlinedTextField(value = vm.message, onValueChange = vm::updateMessage, label = { Text("Gift message (optional)") }, modifier = Modifier.fillMaxWidth())
                        Button(onClick = vm::save, enabled = vm.design.isNotEmpty(), modifier = Modifier.fillMaxWidth()) {
                            Text(if (vm.saved) "Saved ✓" else "Save gift wrap")
                        }
                        if (vm.design.isNotEmpty()) {
                            Button(onClick = vm::clear, modifier = Modifier.fillMaxWidth()) { Text("Remove") }
                        }
                        Text("Your choice shows as a note on the native cart.", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }
    }
}

@Composable
private fun SelectRow(selected: Boolean, label: String, onPick: () -> Unit) {
    Surface(
        shape = RoundedCornerShape(12.dp),
        color = if (selected) MaterialTheme.colorScheme.primary.copy(alpha = 0.12f) else MaterialTheme.colorScheme.surface,
        tonalElevation = 1.dp,
        modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).clickable(onClick = onPick),
    ) {
        Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(if (selected) "✅" else "○", color = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant)
            Text(label, style = MaterialTheme.typography.bodyMedium, color = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface)
        }
    }
}

// ----------------------------------------------------------- code quality

class CodeQualityViewModel : ViewModel() {
    var plan by mutableStateOf("pro"); private set
    var done by mutableStateOf<Boolean?>(null); private set
    var submitting by mutableStateOf(false); private set
    fun pick(v: String) { plan = v; done = null }
    fun subscribe() {
        viewModelScope.launch {
            submitting = true
            done = ApiClient.codeQualitySubscribe(plan)
            submitting = false
        }
    }
}

@Composable
fun CodeQualityScreen(onBack: () -> Unit, onLogin: () -> Unit, vm: CodeQualityViewModel = viewModel()) {
    // Plan catalogue mirrors the backend's qualityPlans (backend is the source of truth).
    val plans = listOf(
        Triple("basic", "Basic Coverage", "30 days · 2 revisions"),
        Triple("pro", "Pro Assurance", "90 days · 5 revisions"),
        Triple("enterprise", "Enterprise Shield", "180 days · 10 revisions"),
    )
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ServiceHeader("Code Quality", "Coverage plans for your build", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(plans, key = { it.first }) { (id, name, desc) ->
                SelectRow(selected = vm.plan == id, label = "$name — $desc") { vm.pick(id) }
            }
            item {
                ServiceCard {
                    Button(onClick = vm::subscribe, enabled = !vm.submitting, modifier = Modifier.fillMaxWidth()) {
                        Text(if (vm.submitting) "Subscribing…" else "Subscribe")
                    }
                    vm.done?.let {
                        Text(if (it) "✅ Subscribed" else "❌ Failed — sign in and retry", color = if (it) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
                        if (!it) Button(onClick = onLogin) { Text("Sign in") }
                    }
                }
            }
        }
    }
}

// ---------------------------------------------------------------- student

class StudentViewModel : ViewModel() {
    var status by mutableStateOf<Map<String, String>>(emptyMap()); private set
    var loading by mutableStateOf(true); private set
    var school by mutableStateOf(""); private set
    var email by mutableStateOf(""); private set
    var sent by mutableStateOf<Boolean?>(null); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            status = ApiClient.studentStatus()
            loading = false
        }
    }
    fun updateSchool(v: String) { school = v }
    fun updateEmail(v: String) { email = v.trim() }
    fun request() {
        viewModelScope.launch {
            sent = ApiClient.studentRequest(mapOf("school" to school.trim(), "email" to email))
        }
    }
}

@Composable
fun StudentScreen(onBack: () -> Unit, onLogin: () -> Unit, vm: StudentViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ServiceHeader("Student Discount", "Verify & save", onBack)
        Box(Modifier.weight(1f)) {
            if (vm.loading) LoadingBox(Modifier.fillMaxSize())
            else LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                if (vm.status.isNotEmpty()) {
                    item {
                        ServiceCard {
                            Text("Verification status", style = MaterialTheme.typography.titleSmall)
                            vm.status.entries.sortedBy { it.key }.forEach { (k, v) ->
                                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Text(k, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    Text(v, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
                                }
                            }
                        }
                    }
                } else {
                    item {
                        ServiceCard {
                            Text("Get verified", style = MaterialTheme.typography.titleSmall)
                            OutlinedTextField(value = vm.school, onValueChange = vm::updateSchool, label = { Text("School / university") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                            OutlinedTextField(value = vm.email, onValueChange = vm::updateEmail, label = { Text("Student email") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                            Button(onClick = vm::request, enabled = vm.school.isNotBlank() && vm.email.isNotBlank(), modifier = Modifier.fillMaxWidth()) { Text("Request verification") }
                            vm.sent?.let {
                                Text(if (it) "✅ Request sent" else "❌ Failed — sign in and retry", color = if (it) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
                                if (!it) Button(onClick = onLogin) { Text("Sign in") }
                            }
                        }
                    }
                }
            }
        }
    }
}

// ---------------------------------------------------------------- warranty

@Composable
fun WarrantyScreen(onBack: () -> Unit, onContact: () -> Unit) {
    // Backend warranty-center is a stub: honest empty state + support path.
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ServiceHeader("Warranty Center", "Coverage & claims", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ServiceCard {
                    Text("How claims work", style = MaterialTheme.typography.titleSmall)
                    Text("1 · Find your order\n2 · Contact support with photos\n3 · Get a replacement or refund", style = MaterialTheme.typography.bodyMedium)
                    Button(onClick = onContact, modifier = Modifier.fillMaxWidth()) { Text("Contact support") }
                }
            }
            item { EmptyState(title = "No warranties yet", subtitle = "Warranties attach to eligible orders") }
        }
    }
}

// ------------------------------------------------------------ tech library

class TechLibraryViewModel : ViewModel() {
    var resources by mutableStateOf<List<TechResourceDto>>(emptyList()); private set
    var loading by mutableStateOf(true); private set
    var unlocking by mutableStateOf<String?>(null); private set
    var unlocked by mutableStateOf<Set<String>>(emptySet()); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            resources = ApiClient.techResources()
            loading = false
        }
    }
    fun unlock(resource: TechResourceDto) {
        viewModelScope.launch {
            unlocking = resource.id
            if (ApiClient.techUnlock(resource.id, resource.cost)) unlocked = unlocked + resource.id
            unlocking = null
        }
    }
}

@Composable
fun TechLibraryScreen(onBack: () -> Unit, vm: TechLibraryViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ServiceHeader("Tech Library", "Guides, kits & resources", onBack)
        Box(Modifier.weight(1f)) {
            if (vm.loading) LoadingBox(Modifier.fillMaxSize())
            else if (vm.resources.isEmpty()) EmptyState(title = "No resources", subtitle = "Check back soon", modifier = Modifier.fillMaxSize())
            else LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(vm.resources, key = { it.id }) { res ->
                    ServiceCard {
                        Text(res.displayTitle, style = MaterialTheme.typography.titleSmall, maxLines = 2, overflow = TextOverflow.Ellipsis)
                        if (!res.description.isNullOrEmpty()) {
                            Text(res.description.orEmpty(), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 2, overflow = TextOverflow.Ellipsis)
                        }
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text(if (res.cost > 0) "🪙 ${res.cost} pts" else "Free", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.primary, modifier = Modifier.weight(1f))
                            val isUnlocked = vm.unlocked.contains(res.id)
                            Button(onClick = { vm.unlock(res) }, enabled = !isUnlocked && vm.unlocking != res.id) {
                                Text(if (isUnlocked) "Unlocked ✓" else if (vm.unlocking == res.id) "…" else "Unlock")
                            }
                        }
                    }
                }
            }
        }
    }
}

// ------------------------------------------------------------ seller hub

class SellerViewModel : ViewModel() {
    var status by mutableStateOf<Map<String, String>>(emptyMap()); private set
    var loading by mutableStateOf(true); private set
    var shop by mutableStateOf(""); private set
    var applied by mutableStateOf<Boolean?>(null); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            status = ApiClient.sellerStatus()
            loading = false
        }
    }
    fun updateShop(v: String) { shop = v }
    fun apply() {
        viewModelScope.launch {
            applied = ApiClient.sellerApply(mapOf("shopName" to shop.trim()))
        }
    }
}

@Composable
fun SellerScreen(onBack: () -> Unit, onLogin: () -> Unit, vm: SellerViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ServiceHeader("Seller Center", "Earn up to 95%", onBack)
        Box(Modifier.weight(1f)) {
            if (vm.loading) LoadingBox(Modifier.fillMaxSize())
            else LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                if (vm.status.isNotEmpty()) {
                    item {
                        ServiceCard {
                            Text("Seller dashboard", style = MaterialTheme.typography.titleSmall)
                            vm.status.entries.sortedBy { it.key }.forEach { (k, v) ->
                                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Text(k, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.weight(1f))
                                    Text(v, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
                                }
                            }
                        }
                    }
                } else {
                    item {
                        ServiceCard {
                            Text("Become a seller", style = MaterialTheme.typography.titleSmall)
                            Text("Open your shop and keep up to 95% of every sale.", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            OutlinedTextField(value = vm.shop, onValueChange = vm::updateShop, label = { Text("Shop name") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                            Button(onClick = vm::apply, enabled = vm.shop.isNotBlank(), modifier = Modifier.fillMaxWidth()) { Text("Apply now") }
                            vm.applied?.let {
                                Text(if (it) "✅ Application sent" else "❌ Failed — sign in and retry", color = if (it) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
                                if (!it) Button(onClick = onLogin) { Text("Sign in") }
                            }
                        }
                    }
                }
            }
        }
    }
}

// ------------------------------------------------------------ open source

class OpenSourceViewModel : ViewModel() {
    var projects by mutableStateOf<List<OpenProjectDto>>(emptyList()); private set
    var loading by mutableStateOf(true); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            projects = ApiClient.openProjects()
            loading = false
        }
    }
}

@Composable
fun OpenSourceScreen(onBack: () -> Unit, vm: OpenSourceViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ServiceHeader("Open Source", "Projects we fund & love", onBack)
        Box(Modifier.weight(1f)) {
            if (vm.loading) LoadingBox(Modifier.fillMaxSize())
            else if (vm.projects.isEmpty()) EmptyState(title = "No projects listed", subtitle = "Check back soon", modifier = Modifier.fillMaxSize())
            else LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(vm.projects, key = { it.id }) { project ->
                    ServiceCard {
                        Text(project.displayTitle, style = MaterialTheme.typography.titleSmall)
                        if (!project.description.isNullOrEmpty()) {
                            Text(project.description.orEmpty(), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 3, overflow = TextOverflow.Ellipsis)
                        }
                        if (project.stars > 0) Text("⭐ ${project.stars}", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }
    }
}

// ------------------------------------------------------ delivery shield

class DeliveryShieldViewModel : ViewModel() {
    // Plan catalogue mirrors the backend's protectionPlans (backend is the source of truth).
    val plans = listOf(
        Triple("standard", "Standard Protection", "50% refund · 3 milestones"),
        Triple("pro", "Pro Protection", "75% refund · 5 milestones"),
        Triple("enterprise", "Enterprise Shield", "100% refund · 7 milestones"),
    )
    var plan by mutableStateOf("pro"); private set
    var done by mutableStateOf<Boolean?>(null); private set
    var submitting by mutableStateOf(false); private set
    fun pick(v: String) { plan = v; done = null }
    fun subscribe() {
        viewModelScope.launch {
            submitting = true
            done = ApiClient.protectionSubscribe(plan)
            submitting = false
        }
    }
}

@Composable
fun DeliveryShieldScreen(onBack: () -> Unit, onLogin: () -> Unit, vm: DeliveryShieldViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ServiceHeader("Delivery Protection", "Every order, covered", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(vm.plans, key = { it.first }) { (id, name, desc) ->
                SelectRow(selected = vm.plan == id, label = "$name — $desc") { vm.pick(id) }
            }
            item {
                ServiceCard {
                    Button(onClick = vm::subscribe, enabled = !vm.submitting, modifier = Modifier.fillMaxWidth()) {
                        Text(if (vm.submitting) "Subscribing…" else "Protect my orders")
                    }
                    vm.done?.let {
                        Text(if (it) "✅ Protected" else "❌ Failed — sign in and retry", color = if (it) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
                        if (!it) Button(onClick = onLogin) { Text("Sign in") }
                    }
                }
            }
        }
    }
}

// -------------------------------------------------------------- dark store

class DarkStoreViewModel : ViewModel() {
    var store by mutableStateOf<DarkStoreDto?>(null); private set
    var loading by mutableStateOf(true); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            store = ApiClient.darkStore()
            loading = false
        }
    }
}

@Composable
fun DarkStoreScreen(onBack: () -> Unit, onProduct: (String) -> Unit, vm: DarkStoreViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ServiceHeader("Dark Store", "Late-night drops · 10PM–6AM", onBack)
        Box(Modifier.weight(1f)) {
            if (vm.loading) LoadingBox(Modifier.fillMaxSize())
            else {
                val s = vm.store
                if (s == null) EmptyState(title = "Store closed", subtitle = "Opens at 10 PM", modifier = Modifier.fillMaxSize())
                else LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    item {
                        ServiceCard {
                            Text(if (s.isOpen) "🟢 Open now" else "🌙 Opens at 10 PM", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary)
                            if (!s.nextEvent.isNullOrEmpty()) Text("Next: ${s.nextEvent}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                    items(s.products, key = { it.id }) { product ->
                        ProductCard(product) { onProduct(product.id) }
                    }
                }
            }
        }
    }
}

// ---------------------------------------------------------- loyalty calc

class LoyaltyCalcViewModel : ViewModel() {
    var amount by mutableStateOf(""); private set
    var result by mutableStateOf<Map<String, String>>(emptyMap()); private set
    var loading by mutableStateOf(false); private set
    fun updateAmount(v: String) { amount = v.filter { it.isDigit() || it == '.' } }
    fun calculate() {
        val value = amount.toDoubleOrNull() ?: return
        viewModelScope.launch {
            loading = true
            result = ApiClient.loyaltyCalc(value)
            loading = false
        }
    }
}

@Composable
fun LoyaltyCalcScreen(onBack: () -> Unit, vm: LoyaltyCalcViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ServiceHeader("Loyalty Calculator", "1 BDT = 1 point", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                ServiceCard {
                    OutlinedTextField(value = vm.amount, onValueChange = vm::updateAmount, label = { Text("Purchase amount") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    Button(onClick = vm::calculate, enabled = vm.amount.isNotBlank() && !vm.loading, modifier = Modifier.fillMaxWidth()) {
                        Text(if (vm.loading) "Calculating…" else "Calculate points")
                    }
                }
            }
            if (vm.result.isNotEmpty()) {
                item {
                    ServiceCard {
                        vm.result.entries.sortedBy { it.key }.forEach { (k, v) ->
                            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text(k, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.weight(1f))
                                Text(v, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
                            }
                        }
                    }
                }
            }
        }
    }
}

// ------------------------------------------------------------ mini games

class MiniGamesViewModel : ViewModel() {
    var questions by mutableStateOf<List<com.grapsee.shop.core.network.QuizQuestionDto>>(emptyList()); private set
    var index by mutableStateOf(0); private set
    var score by mutableStateOf(0); private set
    var finished by mutableStateOf(false); private set
    var loading by mutableStateOf(true); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            index = 0
            score = 0
            finished = false
            questions = ApiClient.miniQuiz()
            loading = false
        }
    }
    fun answer(option: String) {
        // Practice mode: options carry no correctness flags from the API.
        if (index < questions.size - 1) index++ else finished = true
    }
}

@Composable
fun MiniGamesScreen(onBack: () -> Unit, vm: MiniGamesViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ServiceHeader("Mini Games", "Tech quiz · practice mode", onBack)
        Box(Modifier.weight(1f)) {
            when {
                vm.loading -> LoadingBox(Modifier.fillMaxSize())
                vm.questions.isEmpty() -> EmptyState(title = "No games right now", subtitle = "Check back soon", modifier = Modifier.fillMaxSize())
                vm.finished -> EmptyState(title = "Done! 🎮", subtitle = "You played ${vm.questions.size} questions", modifier = Modifier.fillMaxSize())
                else -> {
                    val q = vm.questions[vm.index]
                    LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        item { Text("Question ${vm.index + 1}/${vm.questions.size}", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.primary) }
                        item { Text(q.question, style = MaterialTheme.typography.titleMedium) }
                        items(q.options) { option ->
                            SelectRow(selected = false, label = option) { vm.answer(option) }
                        }
                    }
                }
            }
        }
    }
}

// --------------------------------------------------------- top reviewers

class TopReviewersViewModel : ViewModel() {
    var reviewers by mutableStateOf<List<TopReviewerDto>>(emptyList()); private set
    var loading by mutableStateOf(true); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            reviewers = ApiClient.topReviewers()
            loading = false
        }
    }
}

@Composable
fun TopReviewersScreen(onBack: () -> Unit, vm: TopReviewersViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ServiceHeader("Top Reviewers", "Community stars", onBack)
        Box(Modifier.weight(1f)) {
            if (vm.loading) LoadingBox(Modifier.fillMaxSize())
            else if (vm.reviewers.isEmpty()) EmptyState(title = "No reviewers yet", subtitle = "Write reviews to climb", modifier = Modifier.fillMaxSize())
            else LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(vm.reviewers, key = { it.id }) { reviewer ->
                    ServiceCard {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            Text(reviewer.medal, style = MaterialTheme.typography.titleLarge)
                            Column(Modifier.weight(1f)) {
                                Text(reviewer.displayName, style = MaterialTheme.typography.titleSmall)
                                Text("${reviewer.totalReviews} reviews", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }
                    }
                }
            }
        }
    }
}

// ---------------------------------------------------------------- products

@Composable
fun ServiceProducts(products: List<Product>, onProduct: (String) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        products.forEach { product ->
            ProductCard(product) { onProduct(product.id) }
        }
    }
}

// ------------------------------------------------------------ style guide

@Composable
fun StyleGuideScreen(onBack: () -> Unit) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ServiceHeader("Style Guide", "Mall design tokens", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
            item {
                Text("COLORS", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            item {
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    listOf(
                        "Primary" to MaterialTheme.colorScheme.primary,
                        "Secondary" to MaterialTheme.colorScheme.secondary,
                        "Tertiary" to MaterialTheme.colorScheme.tertiary,
                        "Error" to MaterialTheme.colorScheme.error,
                    ).forEach { (name, color) ->
                        Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Surface(shape = RoundedCornerShape(12.dp), color = color, modifier = Modifier.padding(0.dp)) {
                                Text("  ", modifier = Modifier.padding(horizontal = 20.dp, vertical = 18.dp))
                            }
                            Text(name, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }
            item {
                Text("BUTTONS", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            item {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(onClick = {}, modifier = Modifier.fillMaxWidth()) { Text("Primary") }
                    Button(onClick = {}, modifier = Modifier.fillMaxWidth()) { Text("Secondary") }
                }
            }
        }
    }
}
