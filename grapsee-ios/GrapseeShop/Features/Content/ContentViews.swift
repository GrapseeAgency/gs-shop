import SwiftUI
import AVKit

// MARK: - Content batch (mirrors Android ContentScreens.kt)

struct BlogView: View {
    @State private var posts: [BlogPost] = []
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else if posts.isEmpty { ContentUnavailableView("No posts yet", systemImage: "newspaper") }
            else { List(posts) { p in NavigationLink(value: Route.blogPost(p.slug.isEmpty ? p.id : p.slug)) {
                VStack(alignment: .leading, spacing: 4) {
                    if let c = p.category { Text(c.uppercased()).font(.caption).bold().foregroundColor(.accentColor) }
                    Text(p.title).font(.headline)
                    if let e = p.excerpt { Text(e).font(.subheadline).foregroundColor(.secondary).lineLimit(2) }
                }.padding(.vertical, 4)
            } }.listStyle(.plain) }
        }.navigationTitle("Blog").task { posts = await API.blogPosts(limit: 20); loading = false }
    }
}

struct BlogPostView: View {
    let slug: String
    @State private var post: BlogPost?
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else if let p = post {
                List {
                    Text(p.title).font(.title2).bold()
                    Text("\(p.author ?? "Grapsee") · \(p.category ?? "")").font(.caption).foregroundColor(.secondary)
                    Text(p.fullBody ?? p.excerpt ?? "").font(.body)
                }
            } else { ContentUnavailableView("Article not found", systemImage: "doc") }
        }.navigationTitle("Article").task { post = await API.blogPost(slug: slug); loading = false }
    }
}

struct BrandsView: View {
    @State private var brands: [Brand] = []
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else { List(brands) { b in NavigationLink(value: Route.web("/category")) {
                HStack { Text(String(b.name.prefix(1))).font(.title).foregroundColor(.accentColor)
                    VStack(alignment: .leading) { Text(b.name).font(.headline); if let c = b.category { Text(c).font(.caption).foregroundColor(.secondary) } } }
            } }.listStyle(.plain) }
        }.navigationTitle("Top Brands").task { brands = await API.brands(); loading = false }
    }
}

struct ReviewsView: View {
    @State private var reviews: [ReviewItem] = []
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else if reviews.isEmpty { ContentUnavailableView("No reviews yet", systemImage: "star") }
            else { List(reviews) { r in
                VStack(alignment: .leading, spacing: 4) {
                    Text(String(repeating: "★", count: max(0, min(5, Int(r.rating))))).foregroundColor(.yellow).font(.caption)
                    Text(r.body ?? "").font(.subheadline)
                    Text(r.author ?? "Verified buyer").font(.caption).foregroundColor(.secondary)
                }.padding(.vertical, 4)
            }.listStyle(.plain) }
        }.navigationTitle("Customer Reviews").task { reviews = await API.reviews(limit: 30); loading = false }
    }
}

struct CommunityView: View {
    @State private var posts: [CommunityPost] = []
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else if posts.isEmpty { ContentUnavailableView("No posts yet", systemImage: "person.3") }
            else { List(posts) { p in
                VStack(alignment: .leading, spacing: 4) {
                    Text(p.authorName).font(.headline)
                    Text(p.body).font(.subheadline)
                    Text("♥ \(p.likeTotal) · 💬 \(p.commentCount)").font(.caption).foregroundColor(.secondary)
                }.padding(.vertical, 4)
            }.listStyle(.plain) }
        }.navigationTitle("Community").task { posts = await API.communityPosts(); loading = false }
    }
}

struct EventsView: View {
    @State private var events: [ShopEvent] = []
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else if events.isEmpty { ContentUnavailableView("No active events", systemImage: "calendar") }
            else { List(events) { e in
                VStack(alignment: .leading, spacing: 4) {
                    if let t = e.type { Text(t.uppercased()).font(.caption).bold().foregroundColor(.accentColor) }
                    Text(e.title.isEmpty ? (e.name ?? "") : e.title).font(.headline)
                    if let d = e.description { Text(d).font(.subheadline).foregroundColor(.secondary).lineLimit(2) }
                }.padding(.vertical, 4)
            }.listStyle(.plain) }
        }.navigationTitle("Events").task { events = await API.events(); loading = false }
    }
}

struct ForumView: View {
    @State private var topics: [ForumTopic] = []
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else { List(topics) { t in NavigationLink(value: Route.forumTopic(t.id)) {
                VStack(alignment: .leading) { Text(t.title).font(.headline).lineLimit(2); Text("💬 \(t.totalReplies) replies").font(.caption).foregroundColor(.secondary) }
            } }.listStyle(.plain) }
        }.navigationTitle("Forum").task { topics = await API.forumTopics(); loading = false }
    }
}

struct ForumTopicView: View {
    let id: String
    @State private var topic: ForumTopic?
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else if let t = topic {
                List { Text(t.title).font(.title2).bold(); Text(t.text).font(.body); Text("💬 \(t.totalReplies) replies").font(.caption).foregroundColor(.accentColor) }
            } else { ContentUnavailableView("Topic not found", systemImage: "bubble.left") }
        }.navigationTitle("Discussion").task { topic = await API.forumTopic(id: id); loading = false }
    }
}

struct VideosView: View {
    @State private var videos: [ProductVideo] = []
    @State private var loading = true
    @State private var playing: ProductVideo?
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else if videos.isEmpty { ContentUnavailableView("No videos yet", systemImage: "play.circle") }
            else { List(videos) { v in
                Button { playing = v } label: {
                    HStack { Image(systemName: "play.circle.fill").foregroundColor(.accentColor).font(.title2)
                        Text(v.displayTitle).font(.subheadline).lineLimit(2) }
                }
            }.listStyle(.plain) }
        }
        .navigationTitle("Product Videos")
        .task { videos = await API.productVideos(); loading = false }
        .sheet(item: $playing) { v in
            NavigationStack {
                if let urlStr = v.playUrl, let url = URL(string: urlStr), !urlStr.contains("youtube") {
                    VideoPlayer(player: AVPlayer(url: url)).navigationTitle(v.displayTitle)
                } else {
                    ContentUnavailableView("External video", systemImage: "play.slash", description: Text("This video plays on its provider page"))
                }
            }
        }
    }
}

struct QuizView: View {
    @State private var questions: [QuizQuestion] = []
    @State private var answers: [String: String] = [:]
    @State private var results: [Product] = []
    @State private var loading = true
    @State private var submitting = false
    var body: some View {
        Group {
            if loading || submitting { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else if !results.isEmpty {
                List {
                    Section("Your matches 🎯") { ForEach(results) { p in NavigationLink(value: Route.product(p.id)) { ProductRow(product: p) } } }
                    Button("Retake quiz") { answers = [:]; results = [] }
                }
            } else if questions.isEmpty { ContentUnavailableView("Quiz unavailable", systemImage: "questionmark.circle") }
            else {
                List {
                    ForEach(questions) { q in
                        Section(q.question) {
                            ForEach(q.options, id: \.self) { opt in
                                Button { answers[q.id] = opt } label: {
                                    HStack { Text(opt); Spacer(); if answers[q.id] == opt { Image(systemName: "checkmark.circle.fill").foregroundColor(.accentColor) } }
                                }.foregroundColor(.primary)
                            }
                        }
                    }
                    Button("See my matches (\(answers.count)/\(questions.count))") {
                        submitting = true
                        Task { results = await API.quizSubmit(answers: answers); submitting = false }
                    }.disabled(answers.count != questions.count)
                }
            }
        }.navigationTitle("Product Quiz").task { questions = await API.quizQuestions(); loading = false }
    }
}

struct LiveView: View {
    @State private var streams: [LiveStream] = []
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else if streams.isEmpty { ContentUnavailableView("No live streams", systemImage: "dot.radiowaves.left.and.right") }
            else { List(streams) { s in
                HStack {
                    Text(s.isLive ? "🔴" : "📅").font(.title2)
                    VStack(alignment: .leading) {
                        Text(s.title).font(.headline).lineLimit(2)
                        Text(s.isLive ? "LIVE" : (s.status ?? "")).font(.caption).foregroundColor(s.isLive ? .red : .secondary)
                    }
                }.padding(.vertical, 4)
            }.listStyle(.plain) }
        }.navigationTitle("Live Shopping").task { streams = await API.liveStreams(); loading = false }
    }
}
