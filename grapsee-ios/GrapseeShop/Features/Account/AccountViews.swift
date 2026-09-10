import SwiftUI

// MARK: - Account batch (mirrors Android AccountScreens.kt)

struct NotificationsView: View {
    @State private var items: [AppNotification] = []
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else if items.isEmpty { ContentUnavailableView("All caught up", systemImage: "bell", description: Text("No notifications")) }
            else {
                List {
                    Button("Mark all as read") {
                        Task { if await API.notificationsMarkAllRead() { items = await API.notifications() } }
                    }
                    ForEach(items) { n in
                        HStack {
                            if !n.seen { Text("●").foregroundColor(.accentColor).font(.caption) }
                            VStack(alignment: .leading) {
                                Text(n.title).font(.headline)
                                if !n.text.isEmpty { Text(n.text).font(.subheadline).foregroundColor(.secondary) }
                            }
                        }
                    }
                }.listStyle(.plain)
            }
        }.navigationTitle("Notifications").task { items = await API.notifications(); loading = false }
    }
}

struct HelpView: View {
    @State private var index: HelpIndex?
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else {
                List {
                    if let cats = index?.categories, !cats.isEmpty {
                        Section("Topics") { ForEach(cats, id: \.self) { Text($0) } }
                    }
                    if let arts = index?.popularArticles, !arts.isEmpty {
                        Section("Popular articles") { ForEach(arts) { a in
                            NavigationLink(value: Route.helpArticle(a.slug ?? a.id)) { Text(a.title) }
                        } }
                    }
                    Section { NavigationLink(value: Route.contact) { Text("Contact support").foregroundColor(.accentColor) } }
                }
            }
        }.navigationTitle("Help Center").task { index = await API.helpIndex(); loading = false }
    }
}

struct HelpArticleView: View {
    let slug: String
    @State private var article: HelpArticle?
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else if let a = article {
                List { Text(a.title).font(.title2).bold(); Text(a.fullBody).font(.body) }
            } else { ContentUnavailableView("Article not found", systemImage: "doc") }
        }.navigationTitle("Help").task { article = await API.helpArticle(slug: slug); loading = false }
    }
}

struct ContactView: View {
    @State private var info: [String: String] = [:]
    @State private var name = ""
    @State private var email = ""
    @State private var message = ""
    @State private var sent: Bool?
    var body: some View {
        List {
            if !info.isEmpty {
                Section("Reach us") { ForEach(info.sorted(by: { $0.key < $1.key }), id: \.key) { k, v in HStack { Text(k).foregroundColor(.secondary); Spacer(); Text(v).bold() } } }
            }
            Section("Send a message") {
                TextField("Name", text: $name)
                TextField("Email", text: $email)
                TextField("Message", text: $message, axis: .vertical)
                Button("Send") { Task { sent = await API.contactSend(name: name, email: email, message: message) } }
                    .disabled(name.isEmpty || email.isEmpty || message.isEmpty)
                if let s = sent { Text(s ? "✅ Message sent" : "❌ Failed").font(.caption) }
            }
        }.navigationTitle("Contact Us").task { info = await API.contactInfo() }
    }
}

struct SitemapView: View {
    @State private var sitemap: Sitemap?
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else if let s = sitemap, !s.sections.isEmpty {
                List {
                    ForEach(s.sections.indices, id: \.self) { i in
                        Section(s.sections[i].heading) {
                            ForEach(s.sections[i].links.indices, id: \.self) { j in
                                let link = s.sections[i].links[j]
                                NavigationLink(value: appRoute(for: link.path.isEmpty ? "/" : link.path)) { Text(link.text) }
                            }
                        }
                    }
                }
            } else { ContentUnavailableView("Sitemap unavailable", systemImage: "map") }
        }.navigationTitle("Sitemap").task { sitemap = await API.sitemap(); loading = false }
    }
}

struct SettingsView: View {
    @StateObject private var checker = UpdateChecker.shared
    @Environment(\.openURL) private var openURL
    @State private var push = true
    var body: some View {
        List {
            Section("Updates") {
                Text("Version \(checker.current)").font(.caption).foregroundColor(.secondary)
                Button(checker.checking ? "Checking…" : "Check for updates") {
                    Task { await checker.check() }
                }.disabled(checker.checking)
                if let rel = checker.available {
                    Button("Update to \(rel.tag_name)") {
                        if let u = checker.installURL(for: rel) { openURL(u) }
                    }
                }
            }
            Section {
                Toggle("Push notifications", isOn: $push).onChange(of: push) { _, v in
                    Task { _ = await API.notificationPrefsSet(enabled: v) }
                }
            }
            Section { Text("Grapsee Shop · native build").foregroundColor(.secondary).font(.caption) }
        }.navigationTitle("Settings").task {
            let prefs = await API.notificationPrefs()
            if let v = prefs["push"] { push = v.lowercased() == "true" }
        }
    }
}

struct AffiliateView: View {
    @State private var info: [String: String] = [:]
    @State private var joined: Bool?
    var body: some View {
        List {
            if !info.isEmpty {
                Section("Program") { ForEach(info.sorted(by: { $0.key < $1.key }), id: \.key) { k, v in HStack { Text(k).foregroundColor(.secondary); Spacer(); Text(v).bold() } } }
            }
            Section {
                Button("Join program") { Task { joined = await API.affiliateJoin() } }
                if let j = joined { Text(j ? "✅ Welcome aboard" : "❌ Failed").font(.caption) }
                NavigationLink(value: Route.referrals) { Text("Invite friends").foregroundColor(.accentColor) }
            }
        }.navigationTitle("Affiliate Program").task { info = await API.affiliateInfo() }
    }
}

struct EmailSubscribeView: View {
    @State private var email = ""
    @State private var done: Bool?
    var body: some View {
        List {
            Section {
                Text("Get 10% off your first order").font(.headline)
                TextField("Email address", text: $email)
                Button("Subscribe") { Task { done = await API.subscribeEmail(email) } }.disabled(!email.contains("@"))
                if let d = done { Text(d ? "✅ You're in!" : "❌ Failed").font(.caption) }
            }
        }.navigationTitle("Email Alerts")
    }
}
