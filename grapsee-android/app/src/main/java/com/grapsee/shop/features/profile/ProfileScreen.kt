package com.grapsee.shop.features.profile

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import com.grapsee.shop.core.cart.CartStore
import com.grapsee.shop.core.network.ApiClient
import com.grapsee.shop.ui.components.SectionHeader
import kotlinx.coroutines.launch

class ProfileViewModel : ViewModel() {
    fun logout(onDone: () -> Unit) {
        viewModelScope.launch {
            ApiClient.logout()
            onDone()
        }
    }
}

@Composable
fun ProfileScreen(
    onLogin: () -> Unit,
    onWeb: (String) -> Unit,
    onOrders: () -> Unit,
    onWishlist: () -> Unit,
    onList: (String, String) -> Unit,
    vm: ProfileViewModel = viewModel(),
) {
    val session by ApiClient.cookies.session.collectAsState()

    Column(
        Modifier
            .fillMaxSize()
            .statusBarsPadding()
            .verticalScroll(rememberScrollState()),
    ) {
        Text(
            "Profile",
            style = MaterialTheme.typography.headlineSmall,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
        )

        Surface(
            color = MaterialTheme.colorScheme.surfaceVariant,
            shape = RoundedCornerShape(20.dp),
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
        ) {
            Row(
                Modifier.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(14.dp),
            ) {
                Box(
                    Modifier
                        .size(56.dp)
                        .clip(CircleShape),
                    contentAlignment = Alignment.Center,
                ) {
                    Surface(color = MaterialTheme.colorScheme.primary, shape = CircleShape) {
                        Box(Modifier.size(56.dp), contentAlignment = Alignment.Center) {
                            Text(
                                (session.email?.firstOrNull()?.uppercase() ?: "?"),
                                color = MaterialTheme.colorScheme.onPrimary,
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.Bold,
                            )
                        }
                    }
                }
                Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                    Text(
                        session.name ?: session.email?.substringBefore('@') ?: "Guest",
                        style = MaterialTheme.typography.titleMedium,
                    )
                    Text(
                        session.email ?: "Not signed in",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
        }

        if (!session.loggedIn) {
            Button(
                onClick = onLogin,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                shape = RoundedCornerShape(16.dp),
            ) {
                Text("Sign in")
            }
        } else {
            OutlinedButton(
                onClick = { vm.logout {} },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                shape = RoundedCornerShape(16.dp),
            ) {
                Text("Sign out")
            }
        }

        SectionHeader("Account")
        ProfileLink("My orders", null, onOrders)
        ProfileLink("Wishlist", Icons.Outlined.FavoriteBorder, onWishlist)
        ProfileLink("Notifications preferences", Icons.Outlined.Notifications) { onWeb("/notifications/preferences") }
        ProfileLink("Settings", Icons.Outlined.Settings) { onWeb("/settings") }
        ProfileLink("Sign in on web (Grapsee SSO)", null) { onWeb("/login") }

        SectionHeader("Explore")
        ProfileLink("Deals & flash sale", null) { onList("deals", "Flash deals") }
        ProfileLink("Featured picks", null) { onList("featured", "Featured") }
        ProfileLink("New arrivals", null) { onList("new", "New arrivals") }
        ProfileLink("Gift cards", null) { onWeb("/gift-cards") }
        ProfileLink("Rewards & VIP", null) { onWeb("/vip") }
        ProfileLink("Track an order", null) { onWeb("/track") }
        ProfileLink("Help center", null) { onWeb("/help") }

        Spacer(Modifier.size(24.dp))
        Text(
            "Everything else opens the full Grapsee web app inside the native shell — same account, same cart, same session.",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(horizontal = 16.dp),
        )
        Spacer(Modifier.size(32.dp))
    }
}

@Composable
private fun ProfileLink(
    title: String,
    icon: ImageVector?,
    onClick: () -> Unit,
) {
    Row(
        Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (icon != null) {
            Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
            Spacer(Modifier.size(14.dp))
        }
        Text(title, style = MaterialTheme.typography.bodyLarge, modifier = Modifier.weight(1f))
        Icon(
            Icons.AutoMirrored.Filled.KeyboardArrowRight,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}
