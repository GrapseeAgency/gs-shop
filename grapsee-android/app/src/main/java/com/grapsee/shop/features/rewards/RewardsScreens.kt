package com.grapsee.shop.features.rewards

import android.content.Intent
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import com.grapsee.shop.core.network.ApiClient
import com.grapsee.shop.core.network.CouponResult
import com.grapsee.shop.core.network.GiftCardDto
import com.grapsee.shop.core.network.LoyaltyTierDto
import com.grapsee.shop.core.network.RewardsSummary
import com.grapsee.shop.ui.components.EmptyState
import com.grapsee.shop.ui.components.ErrorState
import com.grapsee.shop.ui.components.LoadingBox
import kotlinx.coroutines.launch

// ------------------------------------------------------------ shared bits

@Composable
internal fun RewardsHeader(title: String, subtitle: String?, onBack: () -> Unit) {
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
internal fun RewardsCard(content: @Composable () -> Unit) {
    Surface(shape = RoundedCornerShape(16.dp), tonalElevation = 1.dp, modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) { content() }
    }
}

@Composable
internal fun GuestNote(onLogin: () -> Unit) {
    RewardsCard {
        Text("Sign in to sync rewards", style = MaterialTheme.typography.titleSmall)
        Text("Points, wallet and claims live on your account.", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Button(onClick = onLogin) { Text("Sign in") }
    }
}

// ---------------------------------------------------------------- voucher

class VoucherViewModel : ViewModel() {
    var code by mutableStateOf(""); private set
    var result by mutableStateOf<CouponResult?>(null); private set
    var checking by mutableStateOf(false); private set
    fun updateCode(v: String) { code = v.trim().uppercase() }
    fun validate() {
        if (code.isBlank()) return
        viewModelScope.launch {
            checking = true
            result = ApiClient.validateCoupon(code)
            checking = false
        }
    }
}

@Composable
fun VoucherScreen(onBack: () -> Unit, vm: VoucherViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        RewardsHeader("Voucher Center", "Save more with coupons", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                RewardsCard {
                    Text("Have a code?", style = MaterialTheme.typography.titleSmall)
                    OutlinedTextField(
                        value = vm.code,
                        onValueChange = vm::updateCode,
                        label = { Text("Voucher code") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth(),
                    )
                    Button(onClick = vm::validate, enabled = vm.code.isNotBlank() && !vm.checking, modifier = Modifier.fillMaxWidth()) {
                        Text(if (vm.checking) "Checking…" else "Validate")
                    }
                }
            }
            vm.result?.let { r ->
                item {
                    RewardsCard {
                        if (r.valid) {
                            Text("✅ ${r.label ?: "Valid coupon"}", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary)
                            Text("Code ${r.code.orEmpty()} · auto-applies at checkout", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        } else {
                            Text("❌ Invalid or expired", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.error)
                            if (!r.error.isNullOrEmpty()) Text(r.error.orEmpty(), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }
        }
    }
}

// --------------------------------------------------------------------- vip

class VipViewModel : ViewModel() {
    var tiers by mutableStateOf<List<LoyaltyTierDto>>(emptyList()); private set
    var summary by mutableStateOf<RewardsSummary?>(null); private set
    var loading by mutableStateOf(true); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            tiers = ApiClient.loyaltyTiers()
            summary = ApiClient.rewardsSummary()
            loading = false
        }
    }
}

@Composable
fun VipScreen(onBack: () -> Unit, onLogin: () -> Unit, vm: VipViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        RewardsHeader("VIP Club", "Exclusive perks & rewards", onBack)
        Box(Modifier.weight(1f)) {
            if (vm.loading) LoadingBox(Modifier.fillMaxSize())
            else LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                val s = vm.summary
                if (s == null || s.isGuest) {
                    item { GuestNote(onLogin) }
                } else {
                    item {
                        RewardsCard {
                            Text("${s.totalPoints} points · ${s.tierName.replaceFirstChar { it.uppercase() }}", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary)
                            Text("${s.nextTierPoints} points to next tier", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
                items(vm.tiers, key = { it.name }) { tier ->
                    RewardsCard {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text(tier.name.replaceFirstChar { it.uppercase() }, style = MaterialTheme.typography.titleSmall, modifier = Modifier.weight(1f))
                            if (tier.current) {
                                Surface(color = MaterialTheme.colorScheme.primary, shape = RoundedCornerShape(6.dp)) {
                                    Text("YOU", modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp), style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onPrimary)
                                }
                            }
                        }
                        Text("${tier.pointsThreshold}+ points", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        tier.benefits.forEach { Text("• $it", style = MaterialTheme.typography.bodySmall) }
                    }
                }
                if (vm.tiers.isEmpty()) {
                    item { EmptyState(title = "Tiers unavailable", subtitle = "Check back soon") }
                }
            }
        }
    }
}

// ------------------------------------------------------------------ wallet

class WalletViewModel : ViewModel() {
    var balance by mutableStateOf<Double?>(null); private set
    var loading by mutableStateOf(true); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            balance = ApiClient.wallet()?.balance
            loading = false
        }
    }
}

@Composable
fun WalletScreen(onBack: () -> Unit, onLogin: () -> Unit, vm: WalletViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        RewardsHeader("Wallet", "Balance & credits", onBack)
        Box(Modifier.weight(1f)) {
            if (vm.loading) LoadingBox(Modifier.fillMaxSize())
            else LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                val b = vm.balance
                if (b == null) {
                    item { GuestNote(onLogin) }
                } else {
                    item {
                        RewardsCard {
                            Text("Available balance", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Text("$${"%.2f".format(b)}", style = MaterialTheme.typography.displaySmall, color = MaterialTheme.colorScheme.primary)
                        }
                    }
                }
            }
        }
    }
}

// -------------------------------------------------------------- check-in

class CheckinViewModel : ViewModel() {
    var status by mutableStateOf<com.grapsee.shop.core.network.CheckinStatus?>(null); private set
    var loading by mutableStateOf(true); private set
    var claiming by mutableStateOf(false); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            status = ApiClient.checkinStatus()
            loading = false
        }
    }
    fun claim() {
        viewModelScope.launch {
            claiming = true
            ApiClient.checkin()?.let { status = it }
            claiming = false
        }
    }
}

@Composable
fun CheckinScreen(onBack: () -> Unit, onLogin: () -> Unit, vm: CheckinViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        RewardsHeader("Daily Check-in", "Streaks earn points", onBack)
        Box(Modifier.weight(1f)) {
            if (vm.loading) LoadingBox(Modifier.fillMaxSize())
            else {
                val s = vm.status
                LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    if (s == null) {
                        item { GuestNote(onLogin) }
                    } else {
                        item {
                            RewardsCard {
                                Text("🔥 ${s.currentStreak}-day streak", style = MaterialTheme.typography.titleMedium)
                                Text(if (s.checkedIn) "Checked in today — come back tomorrow" else "You haven't checked in today", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                Button(onClick = vm::claim, enabled = !s.checkedIn && !vm.claiming, modifier = Modifier.fillMaxWidth()) {
                                    Text(if (vm.claiming) "Claiming…" else "Check in now")
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// ---------------------------------------------------------------- mystery

class MysteryViewModel : ViewModel() {
    var status by mutableStateOf<com.grapsee.shop.core.network.MysteryStatus?>(null); private set
    var loading by mutableStateOf(true); private set
    var claiming by mutableStateOf(false); private set
    var claimed by mutableStateOf(false); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            status = ApiClient.mysteryStatus()
            loading = false
        }
    }
    fun claim() {
        viewModelScope.launch {
            claiming = true
            claimed = ApiClient.mysteryClaim()
            status = ApiClient.mysteryStatus()
            claiming = false
        }
    }
}

@Composable
fun MysteryScreen(onBack: () -> Unit, onLogin: () -> Unit, vm: MysteryViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        RewardsHeader("Mystery Reward", "Reveal your prize", onBack)
        Box(Modifier.weight(1f)) {
            if (vm.loading) LoadingBox(Modifier.fillMaxSize())
            else {
                val s = vm.status
                LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    if (s == null) {
                        item { GuestNote(onLogin) }
                    } else {
                        item {
                            RewardsCard {
                                Text(if (s.canClaim) "🎁 A reward is waiting" else "⏳ Next reward soon", style = MaterialTheme.typography.titleMedium)
                                if (vm.claimed) Text("Claimed — check your rewards", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.primary)
                                Button(onClick = vm::claim, enabled = s.canClaim && !vm.claiming, modifier = Modifier.fillMaxWidth()) {
                                    Text(if (vm.claiming) "Revealing…" else "Reveal now")
                                }
                            }
                        }
                        if (s.possibleRewards.isNotEmpty()) {
                            item { Text("Possible rewards", style = MaterialTheme.typography.titleSmall) }
                            items(s.possibleRewards) { r ->
                                RewardsCard { Text(r, style = MaterialTheme.typography.bodyMedium) }
                            }
                        }
                    }
                }
            }
        }
    }
}

// ---------------------------------------------------------------- loyalty

class LoyaltyViewModel : ViewModel() {
    var tiers by mutableStateOf<List<LoyaltyTierDto>>(emptyList()); private set
    var loading by mutableStateOf(true); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            tiers = ApiClient.loyaltyTiers()
            loading = false
        }
    }
}

@Composable
fun LoyaltyScreen(onBack: () -> Unit, vm: LoyaltyViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        RewardsHeader("Loyalty Program", "Earn on every order", onBack)
        Box(Modifier.weight(1f)) {
            if (vm.loading) LoadingBox(Modifier.fillMaxSize())
            else if (vm.tiers.isEmpty()) EmptyState(title = "Tiers unavailable", subtitle = "Check back soon", modifier = Modifier.fillMaxSize())
            else LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(vm.tiers, key = { it.name }) { tier ->
                    RewardsCard {
                        Text("${tier.name.replaceFirstChar { it.uppercase() }} · ${tier.pointsThreshold}+ pts", style = MaterialTheme.typography.titleSmall)
                        tier.benefits.forEach { Text("• $it", style = MaterialTheme.typography.bodySmall) }
                    }
                }
            }
        }
    }
}

// -------------------------------------------------------------- gift cards

class GiftCardsViewModel : ViewModel() {
    var cards by mutableStateOf<List<GiftCardDto>>(emptyList()); private set
    var loading by mutableStateOf(true); private set
    var error by mutableStateOf<String?>(null); private set
    var code by mutableStateOf(""); private set
    var redeeming by mutableStateOf(false); private set
    var redeemed by mutableStateOf<Boolean?>(null); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            runCatching { ApiClient.giftCards() }
                .onSuccess { cards = it; loading = false }
                .onFailure { error = it.message; loading = false }
        }
    }
    fun updateCode(v: String) { code = v.trim().uppercase(); redeemed = null }
    fun redeem() {
        if (code.isBlank()) return
        viewModelScope.launch {
            redeeming = true
            redeemed = ApiClient.giftCardRedeem(code)
            if (redeemed == true) cards = ApiClient.giftCards()
            redeeming = false
        }
    }
}

@Composable
fun GiftCardsScreen(onBack: () -> Unit, onLogin: () -> Unit, vm: GiftCardsViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        RewardsHeader("Gift Cards", "Redeem & manage", onBack)
        Box(Modifier.weight(1f)) {
            if (vm.loading) LoadingBox(Modifier.fillMaxSize())
            else LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                item {
                    RewardsCard {
                        Text("Redeem a card", style = MaterialTheme.typography.titleSmall)
                        OutlinedTextField(value = vm.code, onValueChange = vm::updateCode, label = { Text("Gift card code") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                        Button(onClick = vm::redeem, enabled = vm.code.isNotBlank() && !vm.redeeming, modifier = Modifier.fillMaxWidth()) {
                            Text(if (vm.redeeming) "Redeeming…" else "Redeem")
                        }
                        vm.redeemed?.let {
                            Text(if (it) "✅ Redeemed" else "❌ Invalid code", color = if (it) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
                        }
                    }
                }
                if (vm.cards.isEmpty() && vm.error != null) {
                    item { GuestNote(onLogin) }
                } else {
                    items(vm.cards, key = { it.id }) { card ->
                        RewardsCard {
                            Text(card.code, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
                            Text("$${"%.2f".format(card.value)} · ${card.status.orEmpty()}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }
        }
    }
}

// --------------------------------------------------------------- referrals

@Composable
fun ReferralsScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        RewardsHeader("Referrals", "Invite friends, earn together", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                RewardsCard {
                    Text("Share Grapsee Mall", style = MaterialTheme.typography.titleSmall)
                    Text("Send your invite link — you both earn when they join.", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Button(
                        onClick = {
                            val share = Intent(Intent.ACTION_SEND).apply {
                                type = "text/plain"
                                putExtra(Intent.EXTRA_TEXT, "${ApiClient.webBase.trimEnd('/')}/referrals")
                            }
                            context.startActivity(Intent.createChooser(share, "Invite friends"))
                        },
                        modifier = Modifier.fillMaxWidth(),
                    ) { Text("Share invite link") }
                }
            }
        }
    }
}

// ----------------------------------------------------------------- rewards

class RewardsViewModel : ViewModel() {
    var summary by mutableStateOf<RewardsSummary?>(null); private set
    var loading by mutableStateOf(true); private set
    var claiming by mutableStateOf(false); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            summary = ApiClient.rewardsSummary()
            loading = false
        }
    }
    fun claimDaily() {
        viewModelScope.launch {
            claiming = true
            if (ApiClient.rewardsDailyClaim()) summary = ApiClient.rewardsSummary()
            claiming = false
        }
    }
}

@Composable
fun RewardsScreenFull(onBack: () -> Unit, onLogin: () -> Unit, onTiers: () -> Unit, vm: RewardsViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        RewardsHeader("Rewards", "Points, tiers & perks", onBack)
        Box(Modifier.weight(1f)) {
            if (vm.loading) LoadingBox(Modifier.fillMaxSize())
            else {
                val s = vm.summary
                LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    if (s == null || s.isGuest) {
                        item { GuestNote(onLogin) }
                    } else {
                        item {
                            RewardsCard {
                                Text("${s.totalPoints} points", style = MaterialTheme.typography.displaySmall, color = MaterialTheme.colorScheme.primary)
                                Text("${s.tierName.replaceFirstChar { it.uppercase() }} tier · ${s.nextTierPoints} to next", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                Button(onClick = vm::claimDaily, enabled = !vm.claiming, modifier = Modifier.fillMaxWidth()) {
                                    Text(if (vm.claiming) "Claiming…" else "Claim daily bonus")
                                }
                            }
                        }
                        item {
                            RewardsCard {
                                Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(8.dp)).clickable(onClick = onTiers), verticalAlignment = Alignment.CenterVertically) {
                                    Text("View loyalty tiers", modifier = Modifier.weight(1f), style = MaterialTheme.typography.titleSmall)
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
