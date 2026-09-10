package com.grapsee.shop.features.content

import android.widget.VideoView
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
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import com.grapsee.shop.core.network.ApiClient
import com.grapsee.shop.core.network.BlogPostDto
import com.grapsee.shop.core.network.BrandDto
import com.grapsee.shop.core.network.CommunityPostDto
import com.grapsee.shop.core.network.ForumTopicDto
import com.grapsee.shop.core.network.LiveStreamDto
import com.grapsee.shop.core.network.Product
import com.grapsee.shop.core.network.ProductVideoDto
import com.grapsee.shop.core.network.QuizQuestionDto
import com.grapsee.shop.core.network.ReviewDto
import com.grapsee.shop.core.network.ShopEventDto
import com.grapsee.shop.ui.components.EmptyState
import com.grapsee.shop.ui.components.ErrorState
import com.grapsee.shop.ui.components.LoadingBox
import com.grapsee.shop.ui.components.ProductCard
import kotlinx.coroutines.launch

// ------------------------------------------------------------ shared bits

@Composable
internal fun ContentHeader(title: String, subtitle: String?, onBack: () -> Unit) {
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
internal fun ContentCard(onClick: () -> Unit, content: @Composable () -> Unit) {
    Surface(
        shape = RoundedCornerShape(16.dp),
        tonalElevation = 1.dp,
        modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).clickable(onClick = onClick),
    ) { Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) { content() } }
}

// ------------------------------------------------------------------- blog

class BlogViewModel : ViewModel() {
    var posts by mutableStateOf<List<BlogPostDto>>(emptyList()); private set
    var loading by mutableStateOf(true); private set
    var error by mutableStateOf<String?>(null); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            runCatching { ApiClient.blogPosts(20) }
                .onSuccess { posts = it; loading = false }
                .onFailure { error = it.message; loading = false }
        }
    }
}

@Composable
fun BlogScreen(onBack: () -> Unit, onPost: (String) -> Unit, vm: BlogViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ContentHeader("Blog", "Stories, guides & news", onBack)
        Box(Modifier.weight(1f)) {
            when {
                vm.loading -> LoadingBox(Modifier.fillMaxSize())
                vm.error != null && vm.posts.isEmpty() -> ErrorState(vm.error.orEmpty(), onRetry = vm::load, modifier = Modifier.fillMaxSize())
                vm.posts.isEmpty() -> EmptyState(title = "No posts yet", subtitle = "Check back soon")
                else -> LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    items(vm.posts, key = { it.id }) { post ->
                        ContentCard(onClick = { onPost(post.slug.ifEmpty { post.id }) }) {
                            if (!post.category.isNullOrEmpty()) {
                                Text(post.category.orEmpty().uppercase(), style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                            }
                            Text(post.title, style = MaterialTheme.typography.titleMedium, maxLines = 2, overflow = TextOverflow.Ellipsis)
                            if (!post.excerpt.isNullOrEmpty()) {
                                Text(post.excerpt.orEmpty(), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 2, overflow = TextOverflow.Ellipsis)
                            }
                            Text("${post.author ?: "Grapsee"} · ${if (post.readTime > 0) "${post.readTime} min read" else ""}", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }
        }
    }
}

class BlogPostViewModel : ViewModel() {
    var post by mutableStateOf<BlogPostDto?>(null); private set
    var loading by mutableStateOf(true); private set
    private var loaded: String? = null
    fun load(slug: String) {
        if (loaded == slug) return
        loaded = slug
        loading = true
        viewModelScope.launch {
            post = ApiClient.blogPost(slug)
            loading = false
        }
    }
}

@Composable
fun BlogPostScreen(slug: String, onBack: () -> Unit, vm: BlogPostViewModel = viewModel()) {
    LaunchedEffect(slug) { vm.load(slug) }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ContentHeader(vm.post?.title ?: "Article", null, onBack)
        Box(Modifier.weight(1f)) {
            when {
                vm.loading -> LoadingBox(Modifier.fillMaxSize())
                vm.post == null -> EmptyState(title = "Article not found", subtitle = "It may have been removed")
                else -> LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    item {
                        Text(vm.post!!.title, style = MaterialTheme.typography.headlineSmall)
                        Text("${vm.post!!.author ?: "Grapsee"} · ${vm.post!!.category.orEmpty()}", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    item { Text(vm.post!!.fullBody ?: vm.post!!.excerpt.orEmpty(), style = MaterialTheme.typography.bodyMedium) }
                }
            }
        }
    }
}

// ----------------------------------------------------------------- brands

class BrandsViewModel : ViewModel() {
    var brands by mutableStateOf<List<BrandDto>>(emptyList()); private set
    var loading by mutableStateOf(true); private set
    var error by mutableStateOf<String?>(null); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            runCatching { ApiClient.brands() }
                .onSuccess { brands = it; loading = false }
                .onFailure { error = it.message; loading = false }
        }
    }
}

@Composable
fun BrandsScreen(onBack: () -> Unit, onBrand: (String) -> Unit, vm: BrandsViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ContentHeader("Top Brands", "The makers behind the mall", onBack)
        Box(Modifier.weight(1f)) {
            when {
                vm.loading -> LoadingBox(Modifier.fillMaxSize())
                vm.error != null && vm.brands.isEmpty() -> ErrorState(vm.error.orEmpty(), onRetry = vm::load, modifier = Modifier.fillMaxSize())
                vm.brands.isEmpty() -> EmptyState(title = "No brands yet", subtitle = "Check back soon")
                else -> LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    items(vm.brands, key = { it.id }) { brand ->
                        ContentCard(onClick = { onBrand(brand.name) }) {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                Text(brand.name.take(1).uppercase(), style = MaterialTheme.typography.titleLarge, color = MaterialTheme.colorScheme.primary)
                                Column(Modifier.weight(1f)) {
                                    Text(brand.name, style = MaterialTheme.typography.titleMedium)
                                    if (!brand.category.isNullOrEmpty()) Text(brand.category.orEmpty(), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
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

// ---------------------------------------------------------------- reviews

class ReviewsViewModel : ViewModel() {
    var reviews by mutableStateOf<List<ReviewDto>>(emptyList()); private set
    var loading by mutableStateOf(true); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            reviews = ApiClient.reviews(30)
            loading = false
        }
    }
}

@Composable
fun ReviewsScreen(onBack: () -> Unit, vm: ReviewsViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ContentHeader("Customer Reviews", "Verified buyer feedback", onBack)
        if (vm.reviews.isNotEmpty()) {
            Row(Modifier.fillMaxWidth().padding(16.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("%.1f".format(vm.reviews.map { it.rating }.average()), style = MaterialTheme.typography.displaySmall, color = MaterialTheme.colorScheme.primary)
                Column {
                    Row { repeat(5) { Icon(Icons.Filled.Star, contentDescription = null, tint = Color(0xFFFBBF24)) } }
                    Text("${vm.reviews.size} verified reviews", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
        Box(Modifier.weight(1f)) {
            when {
                vm.loading -> LoadingBox(Modifier.fillMaxSize())
                vm.reviews.isEmpty() -> EmptyState(title = "No reviews yet", subtitle = "Be the first to review")
                else -> LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    items(vm.reviews, key = { it.id.ifEmpty { it.body.orEmpty() } }) { review ->
                        ContentCard(onClick = {}) {
                            Row(horizontalArrangement = Arrangement.spacedBy(2.dp)) {
                                repeat(review.rating.toInt().coerceIn(0, 5)) {
                                    Icon(Icons.Filled.Star, contentDescription = null, tint = Color(0xFFFBBF24))
                                }
                            }
                            Text(review.body.orEmpty(), style = MaterialTheme.typography.bodyMedium)
                            Text(review.author ?: "Verified buyer", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }
        }
    }
}

// --------------------------------------------------------------- community

class CommunityViewModel : ViewModel() {
    var posts by mutableStateOf<List<CommunityPostDto>>(emptyList()); private set
    var loading by mutableStateOf(true); private set
    var error by mutableStateOf<String?>(null); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            runCatching { ApiClient.communityPosts() }
                .onSuccess { posts = it; loading = false }
                .onFailure { error = it.message; loading = false }
        }
    }
}

@Composable
fun CommunityScreen(onBack: () -> Unit, vm: CommunityViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ContentHeader("Community", "Share your style", onBack)
        Box(Modifier.weight(1f)) {
            when {
                vm.loading -> LoadingBox(Modifier.fillMaxSize())
                vm.error != null && vm.posts.isEmpty() -> ErrorState(vm.error.orEmpty(), onRetry = vm::load, modifier = Modifier.fillMaxSize())
                vm.posts.isEmpty() -> EmptyState(title = "No posts yet", subtitle = "Be the first to share")
                else -> LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    items(vm.posts, key = { it.id }) { post ->
                        ContentCard(onClick = {}) {
                            Text(post.authorName, style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Bold)
                            Text(post.body, style = MaterialTheme.typography.bodyMedium)
                            Text("♥ ${post.likeTotal} · 💬 ${post.commentCount}", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }
        }
    }
}

// ----------------------------------------------------------------- events

class EventsViewModel : ViewModel() {
    var events by mutableStateOf<List<ShopEventDto>>(emptyList()); private set
    var loading by mutableStateOf(true); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            events = ApiClient.events()
            loading = false
        }
    }
}

@Composable
fun EventsScreen(onBack: () -> Unit, onEvent: (String) -> Unit, vm: EventsViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ContentHeader("Events", "Sales, auctions & drops", onBack)
        Box(Modifier.weight(1f)) {
            when {
                vm.loading -> LoadingBox(Modifier.fillMaxSize())
                vm.events.isEmpty() -> EmptyState(title = "No active events", subtitle = "Check back soon")
                else -> LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    items(vm.events, key = { it.id }) { event ->
                        ContentCard(onClick = { onEvent(event.id) }) {
                            if (!event.type.isNullOrEmpty()) {
                                Text(event.type.orEmpty().uppercase(), style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                            }
                            Text(event.displayTitle, style = MaterialTheme.typography.titleMedium)
                            if (!event.description.isNullOrEmpty()) {
                                Text(event.description.orEmpty(), style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 2, overflow = TextOverflow.Ellipsis)
                            }
                        }
                    }
                }
            }
        }
    }
}

// ------------------------------------------------------------------ forum

class ForumViewModel : ViewModel() {
    var topics by mutableStateOf<List<ForumTopicDto>>(emptyList()); private set
    var loading by mutableStateOf(true); private set
    var error by mutableStateOf<String?>(null); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            runCatching { ApiClient.forumTopics() }
                .onSuccess { topics = it; loading = false }
                .onFailure { error = it.message; loading = false }
        }
    }
}

@Composable
fun ForumScreen(onBack: () -> Unit, onTopic: (String) -> Unit, vm: ForumViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ContentHeader("Forum", "Ask, answer & discuss", onBack)
        Box(Modifier.weight(1f)) {
            when {
                vm.loading -> LoadingBox(Modifier.fillMaxSize())
                vm.error != null && vm.topics.isEmpty() -> ErrorState(vm.error.orEmpty(), onRetry = vm::load, modifier = Modifier.fillMaxSize())
                vm.topics.isEmpty() -> EmptyState(title = "No topics yet", subtitle = "Start the first discussion")
                else -> LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    items(vm.topics, key = { it.id }) { topic ->
                        ContentCard(onClick = { onTopic(topic.id) }) {
                            Text(topic.title, style = MaterialTheme.typography.titleMedium, maxLines = 2, overflow = TextOverflow.Ellipsis)
                            Text("${topic.category.orEmpty()} · 💬 ${topic.totalReplies} replies", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }
        }
    }
}

class ForumTopicViewModel : ViewModel() {
    var topic by mutableStateOf<ForumTopicDto?>(null); private set
    var loading by mutableStateOf(true); private set
    private var loaded: String? = null
    fun load(id: String) {
        if (loaded == id) return
        loaded = id
        loading = true
        viewModelScope.launch {
            topic = ApiClient.forumTopic(id)
            loading = false
        }
    }
}

@Composable
fun ForumTopicScreen(topicId: String, onBack: () -> Unit, vm: ForumTopicViewModel = viewModel()) {
    LaunchedEffect(topicId) { vm.load(topicId) }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ContentHeader(vm.topic?.title ?: "Discussion", null, onBack)
        Box(Modifier.weight(1f)) {
            when {
                vm.loading -> LoadingBox(Modifier.fillMaxSize())
                vm.topic == null -> EmptyState(title = "Topic not found", subtitle = "It may have been removed")
                else -> LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    item {
                        Text(vm.topic!!.title, style = MaterialTheme.typography.headlineSmall)
                        Text("${vm.topic!!.category.orEmpty()} · ${vm.topic!!.author.orEmpty()}", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    item { Text(vm.topic!!.text, style = MaterialTheme.typography.bodyMedium) }
                    item { Text("💬 ${vm.topic!!.totalReplies} replies", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.primary) }
                }
            }
        }
    }
}

// ----------------------------------------------------------------- videos

class VideosViewModel : ViewModel() {
    var videos by mutableStateOf<List<ProductVideoDto>>(emptyList()); private set
    var loading by mutableStateOf(true); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            videos = ApiClient.productVideos()
            loading = false
        }
    }
}

@Composable
fun VideosScreen(onBack: () -> Unit, onVideo: (ProductVideoDto) -> Unit, vm: VideosViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ContentHeader("Product Videos", "Watch before you buy", onBack)
        Box(Modifier.weight(1f)) {
            when {
                vm.loading -> LoadingBox(Modifier.fillMaxSize())
                vm.videos.isEmpty() -> EmptyState(title = "No videos yet", subtitle = "Check back soon")
                else -> LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    items(vm.videos, key = { it.id }) { video ->
                        ContentCard(onClick = { onVideo(video) }) {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                Text("▶", style = MaterialTheme.typography.titleLarge, color = MaterialTheme.colorScheme.primary)
                                Column(Modifier.weight(1f)) {
                                    Text(video.displayTitle, style = MaterialTheme.typography.titleMedium, maxLines = 2, overflow = TextOverflow.Ellipsis)
                                    Text(if (video.duration > 0) "${video.duration / 60}:${"%02d".format(video.duration % 60)}" else "Video", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun VideoPlayerScreen(video: ProductVideoDto, onBack: () -> Unit, onProduct: (String) -> Unit) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ContentHeader(video.displayTitle, null, onBack)
        val url = video.playUrl
        if (url.isNullOrEmpty() || url.contains("youtube") || url.contains("youtu.be")) {
            EmptyState(title = "External video", subtitle = "This video plays on its provider page", modifier = Modifier.fillMaxWidth().padding(16.dp))
        } else {
            AndroidView(
                factory = { ctx ->
                    VideoView(ctx).apply {
                        setVideoPath(url)
                        setOnPreparedListener { it.isLooping = false; start() }
                    }
                },
                modifier = Modifier.fillMaxWidth().padding(16.dp).clip(RoundedCornerShape(16.dp)),
            )
        }
        if (!video.productId.isNullOrEmpty()) {
            Button(onClick = { onProduct(video.productId!!) }, modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp)) {
                Text("View product")
            }
        }
    }
}

// ------------------------------------------------------------------- quiz

class QuizViewModel : ViewModel() {
    var questions by mutableStateOf<List<QuizQuestionDto>>(emptyList()); private set
    var results by mutableStateOf<List<Product>>(emptyList()); private set
    var loading by mutableStateOf(true); private set
    var submitting by mutableStateOf(false); private set
    val answers = mutableStateMapOf<String, String>()
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            questions = ApiClient.quizQuestions()
            loading = false
        }
    }
    fun submit() {
        viewModelScope.launch {
            submitting = true
            results = ApiClient.quizSubmit(answers.toMap())
            submitting = false
        }
    }
    fun reset() {
        answers.clear()
        results = emptyList()
    }
}

@Composable
fun QuizScreen(onBack: () -> Unit, onProduct: (String) -> Unit, vm: QuizViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ContentHeader("Product Quiz", "Find your perfect match", onBack)
        Box(Modifier.weight(1f)) {
            when {
                vm.loading || vm.submitting -> LoadingBox(Modifier.fillMaxSize())
                vm.results.isNotEmpty() -> LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    item { Text("Your matches 🎯", style = MaterialTheme.typography.titleMedium, modifier = Modifier.padding(bottom = 4.dp)) }
                    items(vm.results, key = { it.id }) { product -> ProductCard(product) { onProduct(product.id) } }
                    item {
                        Button(onClick = vm::reset, modifier = Modifier.fillMaxWidth()) { Text("Retake quiz") }
                    }
                }
                vm.questions.isEmpty() -> EmptyState(title = "Quiz unavailable", subtitle = "Check back soon")
                else -> LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    items(vm.questions, key = { it.id }) { q ->
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text(q.question, style = MaterialTheme.typography.titleMedium)
                            q.options.forEach { option ->
                                val selected = vm.answers[q.id] == option
                                Surface(
                                    shape = RoundedCornerShape(12.dp),
                                    color = if (selected) MaterialTheme.colorScheme.primary.copy(alpha = 0.12f) else MaterialTheme.colorScheme.surface,
                                    tonalElevation = 1.dp,
                                    modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).clickable { vm.answers[q.id] = option },
                                ) {
                                    Text(option, modifier = Modifier.padding(12.dp), style = MaterialTheme.typography.bodyMedium, color = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface)
                                }
                            }
                        }
                    }
                    item {
                        Button(
                            onClick = vm::submit,
                            enabled = vm.answers.size == vm.questions.size,
                            modifier = Modifier.fillMaxWidth(),
                        ) { Text("See my matches (${vm.answers.size}/${vm.questions.size})") }
                    }
                }
            }
        }
    }
}

// ------------------------------------------------------------------- live

class LiveViewModel : ViewModel() {
    var streams by mutableStateOf<List<LiveStreamDto>>(emptyList()); private set
    var loading by mutableStateOf(true); private set
    init { load() }
    fun load() {
        viewModelScope.launch {
            loading = true
            streams = ApiClient.liveStreams()
            loading = false
        }
    }
}

@Composable
fun LiveScreen(onBack: () -> Unit, vm: LiveViewModel = viewModel()) {
    LaunchedEffect(Unit) { vm.load() }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        ContentHeader("Live Shopping", "Watch, chat & shop in real-time", onBack)
        Box(Modifier.weight(1f)) {
            when {
                vm.loading -> LoadingBox(Modifier.fillMaxSize())
                vm.streams.isEmpty() -> EmptyState(title = "No live streams", subtitle = "Check the schedule and come back")
                else -> LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    items(vm.streams, key = { it.id }) { stream ->
                        ContentCard(onClick = {}) {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                Text(if (stream.isLive) "🔴" else "📅", style = MaterialTheme.typography.titleLarge)
                                Column(Modifier.weight(1f)) {
                                    Text(stream.title, style = MaterialTheme.typography.titleMedium, maxLines = 2, overflow = TextOverflow.Ellipsis)
                                    Text(if (stream.isLive) "LIVE · ${stream.viewerCount} watching" else stream.status.orEmpty(), style = MaterialTheme.typography.labelSmall, color = if (stream.isLive) Color(0xFFEF4444) else MaterialTheme.colorScheme.onSurfaceVariant)
                                }
                            }
                        }
                        if (!stream.playUrl.isNullOrEmpty() && stream.isLive) {
                            AndroidView(
                                factory = { ctx ->
                                    VideoView(ctx).apply {
                                        setVideoPath(stream.playUrl)
                                        setOnPreparedListener { start() }
                                    }
                                },
                                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp).clip(RoundedCornerShape(16.dp)),
                            )
                        }
                    }
                }
            }
        }
    }
}
