package com.grapsee.shop.features.account

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
import androidx.compose.material3.Switch
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
import com.grapsee.shop.core.network.HelpIndexDto
import com.grapsee.shop.core.network.HelpArticleDto
import com.grapsee.shop.core.network.NotificationDto
import com.grapsee.shop.core.network.SitemapDto
import com.grapsee.shop.ui.components.EmptyState
import com.grapsee.shop.ui.components.ErrorState
import com.grapsee.shop.ui.components.LoadingBox
import kotlinx.coroutines.launch

// ------------------------------------------------------------ shared bits

@Composable
internal fun AccountHeader(title: String, subtitle: String?, onBack: () -> Unit) {
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
internal fun AccountCard(content: @Composable () -> Unit) {
    Surface(shape = RoundedCornerShape(16.dp), tonalElevation = 1.dp, modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) { content() }
    }
}

// ---------------------------------------------------------- notifications

class NotificationsViewModel : ViewModel() {
    var items by mutableStateOf<List<NotificationDto>>(emptyList()); private set
    var loading by mutableStateOf(true); private set
    var error by mutableStateOf<String?>(null); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            runCatching { ApiClient.notifications() }
                .onSuccess { items = it; loading = false }
                .onFailure { error = it.message; loading = false }
        }
    }
    fun markAllRead() {
        viewModelScope.launch {
            if (ApiClient.notificationsMarkAllRead()) items = items.map { it.copy(isRead = true, read = true) }
        }
    }
}

@Composable
fun NotificationsScreen(onBack: () -> Unit, onLogin: () -> Unit, onOpen: (String) -> Unit, vm: NotificationsViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        AccountHeader("Notifications", if (vm.items.any { !it.seen }) "${vm.items.count { !it.seen }} unread" else null, onBack)
        Box(Modifier.weight(1f)) {
            when {
                vm.loading -> LoadingBox(Modifier.fillMaxSize())
                vm.error != null && vm.items.isEmpty() -> {
                    Column(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        AccountCard {
                            Text("Sign in for notifications", style = MaterialTheme.typography.titleSmall)
                            Button(onClick = onLogin) { Text("Sign in") }
                        }
                    }
                }
                vm.items.isEmpty() -> EmptyState(title = "All caught up", subtitle = "No notifications", modifier = Modifier.fillMaxSize())
                else -> LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    item {
                        Button(onClick = vm::markAllRead, modifier = Modifier.fillMaxWidth()) { Text("Mark all as read") }
                    }
                    items(vm.items, key = { it.id }) { item ->
                        AccountCard {
                            Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(8.dp)).clickable(enabled = !item.link.isNullOrEmpty()) { item.link?.let(onOpen) }) {
                                if (!item.seen) {
                                    Text("● ", color = MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.bodySmall)
                                }
                                Column(Modifier.weight(1f)) {
                                    Text(item.title, style = MaterialTheme.typography.titleSmall, fontWeight = if (item.seen) FontWeight.Normal else FontWeight.Bold)
                                    if (item.text.isNotEmpty()) Text(item.text, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// ------------------------------------------------------------------ help

class HelpViewModel : ViewModel() {
    var index by mutableStateOf<HelpIndexDto?>(null); private set
    var loading by mutableStateOf(true); private set
    var error by mutableStateOf<String?>(null); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            runCatching { ApiClient.helpIndex() }
                .onSuccess { index = it; loading = false }
                .onFailure { error = it.message; loading = false }
        }
    }
}

@Composable
fun HelpScreen(onBack: () -> Unit, onArticle: (String) -> Unit, onContact: () -> Unit, vm: HelpViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        AccountHeader("Help Center", "Answers & guides", onBack)
        Box(Modifier.weight(1f)) {
            when {
                vm.loading -> LoadingBox(Modifier.fillMaxSize())
                vm.error != null && vm.index == null -> ErrorState(vm.error.orEmpty(), onRetry = vm::load, modifier = Modifier.fillMaxSize())
                else -> LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    val idx = vm.index
                    if (!idx?.categories.isNullOrEmpty()) {
                        item { Text("Topics", style = MaterialTheme.typography.titleSmall) }
                        items(idx!!.categories) { category ->
                            AccountCard { Text(category, style = MaterialTheme.typography.bodyMedium) }
                        }
                    }
                    if (!idx?.popularArticles.isNullOrEmpty()) {
                        item { Text("Popular articles", style = MaterialTheme.typography.titleSmall) }
                        items(idx!!.popularArticles, key = { it.id }) { article ->
                            AccountCard {
                                Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(8.dp)).clickable { onArticle(article.slug ?: article.id) }) {
                                    Text(article.title, modifier = Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium)
                                    Text("→", color = MaterialTheme.colorScheme.primary)
                                }
                            }
                        }
                    }
                    item {
                        AccountCard {
                            Text("Still stuck?", style = MaterialTheme.typography.titleSmall)
                            Button(onClick = onContact, modifier = Modifier.fillMaxWidth()) { Text("Contact support") }
                        }
                    }
                }
            }
        }
    }
}

class HelpArticleViewModel : ViewModel() {
    var article by mutableStateOf<HelpArticleDto?>(null); private set
    var loading by mutableStateOf(true); private set
    private var loaded: String? = null
    fun load(slug: String) {
        if (loaded == slug) return
        loaded = slug
        loading = true
        viewModelScope.launch {
            article = ApiClient.helpArticle(slug)
            loading = false
        }
    }
}

@Composable
fun HelpArticleScreen(slug: String, onBack: () -> Unit, vm: HelpArticleViewModel = viewModel()) {
    LaunchedEffect(slug) { vm.load(slug) }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        AccountHeader(vm.article?.title ?: "Help article", null, onBack)
        Box(Modifier.weight(1f)) {
            when {
                vm.loading -> LoadingBox(Modifier.fillMaxSize())
                vm.article == null -> EmptyState(title = "Article not found", subtitle = "Try another topic", modifier = Modifier.fillMaxSize())
                else -> LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    item { Text(vm.article!!.title, style = MaterialTheme.typography.headlineSmall) }
                    item { Text(vm.article!!.fullBody, style = MaterialTheme.typography.bodyMedium) }
                }
            }
        }
    }
}

// ---------------------------------------------------------------- contact

class ContactViewModel : ViewModel() {
    var info by mutableStateOf<Map<String, String>>(emptyMap()); private set
    var name by mutableStateOf(""); private set
    var email by mutableStateOf(""); private set
    var message by mutableStateOf(""); private set
    var sent by mutableStateOf<Boolean?>(null); private set
    var sending by mutableStateOf(false); private set
    init { load() }
    fun load() {
        viewModelScope.launch { info = ApiClient.contactInfo() }
    }
    fun updateName(v: String) { name = v }
    fun updateEmail(v: String) { email = v.trim() }
    fun updateMessage(v: String) { message = v }
    fun send() {
        viewModelScope.launch {
            sending = true
            sent = ApiClient.contactSend(name.trim(), email, message.trim())
            sending = false
        }
    }
}

@Composable
fun ContactScreen(onBack: () -> Unit, vm: ContactViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        AccountHeader("Contact Us", "We reply within a day", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            if (vm.info.isNotEmpty()) {
                item {
                    AccountCard {
                        Text("Reach us", style = MaterialTheme.typography.titleSmall)
                        vm.info.entries.sortedBy { it.key }.forEach { (k, v) ->
                            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text(k, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.weight(1f))
                                Text(v, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
                            }
                        }
                    }
                }
            }
            item {
                AccountCard {
                    Text("Send a message", style = MaterialTheme.typography.titleSmall)
                    OutlinedTextField(value = vm.name, onValueChange = vm::updateName, label = { Text("Name") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(value = vm.email, onValueChange = vm::updateEmail, label = { Text("Email") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    OutlinedTextField(value = vm.message, onValueChange = vm::updateMessage, label = { Text("Message") }, modifier = Modifier.fillMaxWidth())
                    Button(onClick = vm::send, enabled = vm.name.isNotBlank() && vm.email.isNotBlank() && vm.message.isNotBlank() && !vm.sending, modifier = Modifier.fillMaxWidth()) {
                        Text(if (vm.sending) "Sending…" else "Send")
                    }
                    vm.sent?.let {
                        Text(if (it) "✅ Message sent" else "❌ Failed — try again", color = if (it) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
                    }
                }
            }
        }
    }
}

// ---------------------------------------------------------------- sitemap

class SitemapViewModel : ViewModel() {
    var sitemap by mutableStateOf<SitemapDto?>(null); private set
    var loading by mutableStateOf(true); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            sitemap = ApiClient.sitemap()
            loading = false
        }
    }
}

@Composable
fun SitemapScreen(onBack: () -> Unit, onRoute: (String) -> Unit, vm: SitemapViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        AccountHeader("Sitemap", "Every corner of the mall", onBack)
        Box(Modifier.weight(1f)) {
            if (vm.loading) LoadingBox(Modifier.fillMaxSize())
            else {
                val sitemap = vm.sitemap
                if (sitemap == null || sitemap.sections.isEmpty()) {
                    EmptyState(title = "Sitemap unavailable", subtitle = "Check back soon", modifier = Modifier.fillMaxSize())
                } else {
                    LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        sitemap.sections.forEach { section ->
                            item { Text(section.heading, style = MaterialTheme.typography.titleSmall) }
                            items(section.links) { link ->
                                AccountCard {
                                    Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(8.dp)).clickable { onRoute(link.path) }) {
                                        Text(link.text, modifier = Modifier.weight(1f), style = MaterialTheme.typography.bodyMedium)
                                        Text("→", color = MaterialTheme.colorScheme.primary)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// --------------------------------------------------------------- settings

class SettingsViewModel : ViewModel() {
    var pushEnabled by mutableStateOf(true); private set
    var loading by mutableStateOf(true); private set
    var saved by mutableStateOf<Boolean?>(null); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            val prefs = ApiClient.notificationPrefs()
            pushEnabled = prefs["push"]?.equals("true", ignoreCase = true) ?: prefs.values.none { it.equals("false", ignoreCase = true) }
            loading = false
        }
    }
    fun setPush(enabled: Boolean) {
        pushEnabled = enabled
        viewModelScope.launch {
            saved = ApiClient.notificationPrefsSet(enabled)
        }
    }
}

@Composable
fun SettingsScreen(
    onBack: () -> Unit,
    onLogin: () -> Unit,
    onSignOut: () -> Unit,
    appVersion: String,
    vm: SettingsViewModel = viewModel(),
) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        AccountHeader("Settings", "Your app, your rules", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                AccountCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text("Push notifications", style = MaterialTheme.typography.titleSmall)
                            Text("Order updates & drops", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        if (vm.loading) Text("…", color = MaterialTheme.colorScheme.onSurfaceVariant)
                        else Switch(checked = vm.pushEnabled, onCheckedChange = vm::setPush)
                    }
                    vm.saved?.let {
                        Text(if (it) "Saved ✓" else "Sign in to sync preferences", style = MaterialTheme.typography.bodySmall, color = if (it) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
            item {
                AccountCard {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("App version", style = MaterialTheme.typography.bodyMedium)
                        Text(appVersion, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    com.grapsee.shop.features.update.UpdateSettingsRow()
                }
            }
            item {
                Button(onClick = onLogin, modifier = Modifier.fillMaxWidth()) { Text("Switch account") }
            }
            item {
                Button(onClick = onSignOut, modifier = Modifier.fillMaxWidth()) { Text("Sign out") }
            }
        }
    }
}

// --------------------------------------------------------------- affiliate

class AffiliateViewModel : ViewModel() {
    var info by mutableStateOf<Map<String, String>>(emptyMap()); private set
    var loading by mutableStateOf(true); private set
    var joined by mutableStateOf<Boolean?>(null); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            info = ApiClient.affiliateInfo()
            loading = false
        }
    }
    fun join() {
        viewModelScope.launch {
            joined = ApiClient.affiliateJoin()
        }
    }
}

@Composable
fun AffiliateScreen(onBack: () -> Unit, onLogin: () -> Unit, onReferrals: () -> Unit, vm: AffiliateViewModel = viewModel()) {    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        AccountHeader("Affiliate Program", "Earn by referring", onBack)
        Box(Modifier.weight(1f)) {
            if (vm.loading) LoadingBox(Modifier.fillMaxSize())
            else LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                if (vm.info.isNotEmpty()) {
                    item {
                        AccountCard {
                            Text("Program", style = MaterialTheme.typography.titleSmall)
                            vm.info.entries.sortedBy { it.key }.forEach { (k, v) ->
                                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Text(k, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.weight(1f))
                                    Text(v, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
                                }
                            }
                        }
                    }
                }
                item {
                    AccountCard {
                        Button(onClick = vm::join, modifier = Modifier.fillMaxWidth()) { Text("Join program") }
                        vm.joined?.let {
                            Text(if (it) "✅ Welcome aboard" else "❌ Failed — sign in and retry", color = if (it) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
                            if (!it) Button(onClick = onLogin) { Text("Sign in") }
                        }
                        Button(onClick = onReferrals, modifier = Modifier.fillMaxWidth()) { Text("Invite friends") }
                    }
                }
            }
        }
    }
}

class EmailSubscribeViewModel : ViewModel() {
    var email by mutableStateOf(""); private set
    var done by mutableStateOf<Boolean?>(null); private set
    var sending by mutableStateOf(false); private set
    fun updateEmail(v: String) { email = v.trim(); done = null }
    fun subscribe() {
        viewModelScope.launch {
            sending = true
            done = ApiClient.subscribeEmail(email)
            sending = false
        }
    }
}

@Composable
fun EmailSubscribeScreen(onBack: () -> Unit, vm: EmailSubscribeViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        AccountHeader("Email Alerts", "Deals in your inbox", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                AccountCard {
                    Text("Get 10% off your first order", style = MaterialTheme.typography.titleSmall)
                    OutlinedTextField(value = vm.email, onValueChange = vm::updateEmail, label = { Text("Email address") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    Button(onClick = vm::subscribe, enabled = vm.email.contains("@") && !vm.sending, modifier = Modifier.fillMaxWidth()) {
                        Text(if (vm.sending) "Subscribing…" else "Subscribe")
                    }
                    vm.done?.let {
                        Text(if (it) "✅ You're in!" else "❌ Failed — try again", color = if (it) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
                    }
                }
            }
        }
    }
}
