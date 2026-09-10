package com.grapsee.shop.features.devtools

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
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
import androidx.lifecycle.viewmodel.compose.viewModel
import com.grapsee.shop.ui.components.EmptyState
import kotlinx.coroutines.delay
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import kotlin.random.Random

// ------------------------------------------------------------ shared bits

@Composable
internal fun DevHeader(title: String, subtitle: String?, onBack: () -> Unit) {
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
internal fun DevCard(content: @Composable () -> Unit) {
    Surface(shape = RoundedCornerShape(16.dp), tonalElevation = 1.dp, modifier = Modifier.fillMaxWidth()) {
        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) { content() }
    }
}

@Composable
internal fun CopyBlock(text: String) {
    val context = LocalContext.current
    var copied by mutableStateOf(false)
    Surface(
        shape = RoundedCornerShape(12.dp),
        color = MaterialTheme.colorScheme.surfaceVariant,
        modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).clickable {
            val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
            cm.setPrimaryClip(ClipData.newPlainText("grapsee", text))
            copied = true
        },
    ) {
        Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(text, style = MaterialTheme.typography.bodySmall)
            Text(if (copied) "Copied ✓" else "Tap to copy", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.primary)
        }
    }
}

// --------------------------------------------------------------- ai tools

class AiToolsViewModel : ViewModel() {
    var toolId by mutableStateOf("logo"); private set
    var input by mutableStateOf(""); private set
    var results by mutableStateOf<List<String>>(emptyList()); private set
    var generating by mutableStateOf(false); private set
    fun pick(id: String) { toolId = id; results = emptyList() }
    fun updateInput(v: String) { input = v }
    fun generate() {
        if (input.isBlank()) return
        viewModelScope.launch {
            generating = true
            delay(2000)
            results = listOf("$input Concept 1", "$input Concept 2", "$input Concept 3")
            generating = false
        }
    }
}

@Composable
fun AiToolsScreen(onBack: () -> Unit, vm: AiToolsViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        DevHeader("AI-Powered Tools", "Logos, names & more", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    aiTools.forEach { tool ->
                        val selected = vm.toolId == tool.id
                        Surface(
                            shape = RoundedCornerShape(20.dp),
                            color = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                            modifier = Modifier.clip(RoundedCornerShape(20.dp)).clickable { vm.pick(tool.id) },
                        ) {
                            Text(tool.name.split(" ").take(2).joinToString(" "), modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp), style = MaterialTheme.typography.labelMedium, color = if (selected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface)
                        }
                    }
                }
            }
            val tool = aiTools.firstOrNull { it.id == vm.toolId }
            if (tool != null) {
                item {
                    DevCard {
                        Text("${tool.name} · $${tool.price}", style = MaterialTheme.typography.titleMedium)
                        Text(tool.desc, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        OutlinedTextField(value = vm.input, onValueChange = vm::updateInput, label = { Text(tool.inputLabel) }, modifier = Modifier.fillMaxWidth())
                        Button(onClick = vm::generate, enabled = vm.input.isNotBlank() && !vm.generating, modifier = Modifier.fillMaxWidth()) {
                            Text(if (vm.generating) "Generating…" else "Generate")
                        }
                        vm.results.forEach { Text("✨ $it", style = MaterialTheme.typography.bodyMedium) }
                    }
                }
            }
        }
    }
}

// -------------------------------------------------------------- ai chatbot

private val botQuestions = listOf(
    "What does your business do?",
    "Who are your target customers?",
    "What's the main goal of this project?",
    "Do you have any design preferences?",
    "What's your budget range?",
    "When do you need this completed?",
)

class AiChatViewModel : ViewModel() {
    var messages by mutableStateOf(listOf("bot" to "Hi! I'm Grapsee AI. I'll help you define your project requirements. What does your business do?")); private set
    var input by mutableStateOf(""); private set
    var step by mutableStateOf(1); private set
    fun updateInput(v: String) { input = v }
    fun send() {
        if (input.isBlank()) return
        messages = messages + ("you" to input.trim())
        input = ""
        if (step < botQuestions.size) {
            messages = messages + ("bot" to botQuestions[step])
            step++
        } else {
            messages = messages + ("bot" to "All set! I've compiled your requirements doc. Our team will reach out with a proposal.")
        }
    }
}

@Composable
fun AiChatbotScreen(onBack: () -> Unit, onContact: () -> Unit, vm: AiChatViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        DevHeader("Grapsee AI", "Define your project", onBack)
        LazyColumn(Modifier.weight(1f), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(vm.messages.size) { index ->
                val (role, text) = vm.messages[index]
                Row(Modifier.fillMaxWidth(), horizontalArrangement = if (role == "you") Arrangement.End else Arrangement.Start) {
                    Surface(
                        shape = RoundedCornerShape(14.dp),
                        color = if (role == "you") MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                    ) {
                        Text(text, modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp), style = MaterialTheme.typography.bodyMedium, color = if (role == "you") MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface)
                    }
                }
            }
            if (vm.step >= botQuestions.size) {
                item {
                    Button(onClick = onContact, modifier = Modifier.fillMaxWidth()) { Text("View requirements doc →") }
                }
            }
        }
        Row(Modifier.fillMaxWidth().padding(16.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(value = vm.input, onValueChange = vm::updateInput, label = { Text("Reply") }, singleLine = true, modifier = Modifier.weight(1f))
            Button(onClick = vm::send, enabled = vm.input.isNotBlank()) { Text("Send") }
        }
        Text("Step ${minOf(vm.step, botQuestions.size)} of ${botQuestions.size}", modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp), style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

// ----------------------------------------------------------------- audits

class AuditsViewModel : ViewModel() {
    var url by mutableStateOf(""); private set
    var score by mutableStateOf<Int?>(null); private set
    var issues by mutableStateOf(0); private set
    var passed by mutableStateOf(0); private set
    var scanning by mutableStateOf(false); private set
    var bought by mutableStateOf<String?>(null); private set
    fun updateUrl(v: String) { url = v.trim(); score = null }
    fun scan() {
        viewModelScope.launch {
            scanning = true
            delay(2000)
            score = Random.nextInt(60, 100)
            issues = Random.nextInt(1, 11)
            passed = Random.nextInt(10, 30)
            scanning = false
        }
    }
    fun buy(name: String) { bought = name }
}

@Composable
fun AuditsScreen(onBack: () -> Unit, vm: AuditsViewModel = viewModel()) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        DevHeader("Website Audits", "SEO · Speed · Security", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                DevCard {
                    Text("Instant scan (demo)", style = MaterialTheme.typography.titleSmall)
                    OutlinedTextField(value = vm.url, onValueChange = vm::updateUrl, label = { Text("Website URL") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                    Button(onClick = vm::scan, enabled = vm.url.isNotBlank() && !vm.scanning, modifier = Modifier.fillMaxWidth()) {
                        Text(if (vm.scanning) "Scanning…" else "Run free scan")
                    }
                    vm.score?.let {
                        Text("Score: $it/100 · ${vm.issues} issues · ${vm.passed} passed", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary)
                    }
                }
            }
            item { Text("Audit packs", style = MaterialTheme.typography.titleSmall) }
            items(auditPacks, key = { it.name }) { pack ->
                DevCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text(pack.name, style = MaterialTheme.typography.titleSmall)
                            Text("${pack.desc} · $${pack.price}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        Button(onClick = { vm.buy(pack.name) }) { Text("Buy") }
                    }
                    if (vm.bought == pack.name) Text("✅ ${pack.name} added to cart!", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.primary)
                }
            }
        }
    }
}

// ----------------------------------------------------------------- guides

@Composable
fun GuidesScreen(onBack: () -> Unit) {
    var bought by mutableStateOf<String?>(null)
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        DevHeader("Video Guides", "Learn by watching", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(guides, key = { it.name }) { guide ->
                DevCard {
                    Text("📘  ${guide.name}", style = MaterialTheme.typography.titleSmall)
                    Text("${guide.pages} pages · ${guide.sales} sold · ⭐ ${guide.rating}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("$${guide.price}", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary, modifier = Modifier.weight(1f))
                        Button(onClick = { bought = guide.name }) { Text("Buy") }
                    }
                    if (bought == guide.name) Text("✅ ${guide.name} added to cart!", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.primary)
                }
            }
        }
    }
}

// ------------------------------------------------------------------- cicd

@Composable
fun CicdScreen(onBack: () -> Unit) {
    var tab by mutableStateOf("github")
    var bought by mutableStateOf<String?>(null)
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        DevHeader("CI/CD Pipelines", "Copy-paste YAML", onBack)
        Row(Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf("github", "gitlab").forEach { option ->
                val selected = tab == option
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                    modifier = Modifier.clip(RoundedCornerShape(20.dp)).clickable { tab = option },
                ) {
                    Text(option, modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp), style = MaterialTheme.typography.labelLarge, color = if (selected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface)
                }
            }
        }
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(cicdTpls.filter { it.platform == tab }, key = { it.name }) { tpl ->
                DevCard {
                    Text("${tpl.name} · $${tpl.price}", style = MaterialTheme.typography.titleSmall)
                    Text(tpl.desc, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    CopyBlock(tpl.yaml)
                    Button(onClick = { bought = tpl.name }, modifier = Modifier.fillMaxWidth()) { Text("Buy template") }
                    if (bought == tpl.name) Text("✅ ${tpl.name} added to cart!", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.primary)
                }
            }
        }
    }
}

// --------------------------------------------------------------- env setup

@Composable
fun EnvSetupScreen(onBack: () -> Unit) {
    var bought by mutableStateOf<String?>(null)
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        DevHeader("Dev Environments", "One-command setups", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(envSetups, key = { it.name }) { env ->
                DevCard {
                    Text("${env.name} · $${env.price}", style = MaterialTheme.typography.titleSmall)
                    Text(env.desc, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text("Includes: ${env.includes.joinToString(", ")}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    CopyBlock(env.command)
                    Button(onClick = { bought = env.name }, modifier = Modifier.fillMaxWidth()) { Text("Buy") }
                    if (bought == env.name) Text("✅ ${env.name} added to cart!", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.primary)
                }
            }
        }
    }
}

// ---------------------------------------------------------------- db schemas

@Composable
fun DbSchemasScreen(onBack: () -> Unit) {
    var tab by mutableStateOf(dbSchemas.firstOrNull()?.key.orEmpty())
    var bought by mutableStateOf<String?>(null)
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        DevHeader("Database Schemas", "Production Prisma models", onBack)
        Row(Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            dbSchemas.forEach { schema ->
                val selected = tab == schema.key
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                    modifier = Modifier.clip(RoundedCornerShape(20.dp)).clickable { tab = schema.key },
                ) {
                    Text(schema.name.split(" ").take(2).joinToString(" "), modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp), style = MaterialTheme.typography.labelMedium, color = if (selected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface)
                }
            }
        }
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            dbSchemas.filter { it.key == tab }.forEach { schema ->
                item(key = schema.key) {
                    DevCard {
                        Text("${schema.name} · $${schema.price}", style = MaterialTheme.typography.titleSmall)
                        Text(schema.desc, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        CopyBlock(schema.code)
                        Button(onClick = { bought = schema.key }, modifier = Modifier.fillMaxWidth()) { Text("Buy schema") }
                        if (bought == schema.key) Text("✅ ${schema.name} added to cart!", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.primary)
                    }
                }
            }
        }
    }
}

// -------------------------------------------------------- notion templates

@Composable
fun NotionScreen(onBack: () -> Unit) {
    var bought by mutableStateOf<String?>(null)
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        DevHeader("Notion Templates", "Duplicate & start", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(notionTpls, key = { it.name }) { tpl ->
                DevCard {
                    Text("📄  ${tpl.name}", style = MaterialTheme.typography.titleSmall)
                    Text("${tpl.pages} pages · ${tpl.sales} sold · ⭐ ${tpl.rating}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text(tpl.desc, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("$${tpl.price}", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary, modifier = Modifier.weight(1f))
                        Button(onClick = { bought = tpl.name }) { Text("Buy") }
                    }
                    if (bought == tpl.name) Text("✅ ${tpl.name} added to cart!", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.primary)
                }
            }
        }
    }
}

// ---------------------------------------------------------- short tutorials

@Composable
fun TutorialsScreen(onBack: () -> Unit) {
    var bought by mutableStateOf<String?>(null)
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        DevHeader("Bite-Sized Tutorials", "Learn in minutes", onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(tutorials, key = { it.title }) { tutorial ->
                DevCard {
                    Text("🎬  ${tutorial.title}", style = MaterialTheme.typography.titleSmall)
                    Text("${tutorial.duration} · ${tutorial.views} views · ⭐ ${tutorial.rating}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("$${tutorial.price}", style = MaterialTheme.typography.titleSmall, color = MaterialTheme.colorScheme.primary, modifier = Modifier.weight(1f))
                        Button(onClick = { bought = tutorial.title }) { Text("Buy") }
                    }
                    if (bought == tutorial.title) Text("✅ ${tutorial.title} added to cart!", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.primary)
                }
            }
        }
    }
}
