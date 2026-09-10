package com.grapsee.shop.features.update

import android.widget.Toast
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import com.grapsee.shop.BuildConfig
import com.grapsee.shop.core.update.AppUpdater
import kotlinx.coroutines.launch

class UpdateViewModel : ViewModel() {
    fun autoCheck() {
        // Debug builds have a different package/signature — never auto-prompt there.
        if (BuildConfig.DEBUG) return
        viewModelScope.launch { AppUpdater.check() }
    }

    fun manualCheck() {
        viewModelScope.launch { AppUpdater.check() }
    }

    fun download() {
        viewModelScope.launch { AppUpdater.download() }
    }
}

/**
 * Global update gate: shows "new version available" → downloads 0–100% →
 * hands off to the system installer. Mount once near the app root.
 */
@Composable
fun UpdateGate(vm: UpdateViewModel = viewModel()) {
    val state by AppUpdater.state.collectAsState()
    val context = LocalContext.current

    LaunchedEffect(Unit) { vm.autoCheck() }

    when (val s = state) {
        is AppUpdater.State.Available -> {
            AlertDialog(
                onDismissRequest = { AppUpdater.reset() },
                title = { Text("🎉 New version ${s.info.version}") },
                text = {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("Hey — your app has a new version!")
                        if (s.info.notes.isNotBlank()) {
                            Text(s.info.notes, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                },
                confirmButton = { Button(onClick = { vm.download() }) { Text("Update now") } },
                dismissButton = { TextButton(onClick = { AppUpdater.reset() }) { Text("Later") } },
            )
        }
        is AppUpdater.State.Downloading -> {
            AlertDialog(
                onDismissRequest = {},
                title = { Text(if (s.percent < 0) "Downloading update…" else "Downloading update… ${s.percent}%") },
                text = {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        if (s.percent < 0) {
                            LinearProgressIndicator(modifier = Modifier.fillMaxWidth())
                        } else {
                            LinearProgressIndicator(
                                progress = { (s.percent.coerceIn(0, 100)) / 100f },
                                modifier = Modifier.fillMaxWidth(),
                            )
                        }
                        Text(if (s.percent < 0) "Fetching…" else "${s.percent.coerceIn(0, 100)} of 100", style = MaterialTheme.typography.bodySmall)
                    }
                },
                confirmButton = {},
            )
        }
        is AppUpdater.State.InstallReady -> {
            LaunchedEffect(s) {
                val opened = AppUpdater.install(context)
                if (!opened) {
                    Toast.makeText(
                        context,
                        "Enable 'Install unknown apps' for Grapsee, then tap Update again",
                        Toast.LENGTH_LONG,
                    ).show()
                    AppUpdater.reset()
                    vm.manualCheck()
                }
            }
        }
        is AppUpdater.State.Error -> {
            // Silent on auto-check; Settings surfaces manual-check errors.
        }
        else -> Unit
    }
}

@Composable
fun UpdateSettingsRow(vm: UpdateViewModel = viewModel()) {
    val state by AppUpdater.state.collectAsState()
    val context = LocalContext.current
    Column(Modifier.fillMaxWidth().padding(vertical = 4.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text("App version ${BuildConfig.VERSION_NAME}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Button(
            onClick = {
                if (state is AppUpdater.State.InstallReady) {
                    AppUpdater.install(context)
                } else {
                    vm.manualCheck()
                }
            },
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text(
                when (state) {
                    is AppUpdater.State.Checking -> "Checking…"
                    is AppUpdater.State.Downloading -> {
                        val pct = (state as AppUpdater.State.Downloading).percent
                        if (pct < 0) "Downloading…" else "Downloading… ${pct.coerceIn(0, 100)}%"
                    }
                    is AppUpdater.State.UpToDate -> "Up to date ✓"
                    else -> "Check for updates"
                },
            )
        }
        if (state is AppUpdater.State.Error) {
            Text(
                (state as AppUpdater.State.Error).message,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.error,
            )
        }
    }
}
