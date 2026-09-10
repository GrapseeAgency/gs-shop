import SwiftUI

// MARK: - Dev catalogs (mirrors Android DevToolsScreens.kt)

struct AiToolsView: View {
    @State private var toolId = "logo"
    @State private var input = ""
    @State private var results: [String] = []
    @State private var generating = false
    var body: some View {
        List {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack { ForEach(aiTools) { t in
                    Button(t.name.components(separatedBy: " ").prefix(2).joined(separator: " ")) { toolId = t.id; results = [] }
                    .padding(8).background(toolId == t.id ? Color.accentColor : Color.secondary.opacity(0.15)).foregroundColor(toolId == t.id ? .white : .primary).cornerRadius(14)
                } }
            }
            if let tool = aiTools.first(where: { $0.id == toolId }) {
                Section("\(tool.name) · $\(tool.price)") {
                    Text(tool.desc).font(.caption).foregroundColor(.secondary)
                    TextField(tool.inputLabel, text: $input)
                    Button(generating ? "Generating…" : "Generate") {
                        generating = true
                        Task { try? await Task.sleep(nanoseconds: 2_000_000_000); results = ["\(input) Concept 1", "\(input) Concept 2", "\(input) Concept 3"]; generating = false }
                    }.disabled(input.isEmpty || generating)
                    ForEach(results, id: \.self) { Text("✨ \($0)") }
                }
            }
        }.navigationTitle("AI-Powered Tools")
    }
}

struct AiChatView: View {
    @State private var messages: [(String, String)] = [("bot", "Hi! I'm Grapsee AI. I'll help you define your project requirements. What does your business do?")]
    @State private var input = ""
    @State private var step = 1
    let questions = ["What does your business do?", "Who are your target customers?", "What's the main goal of this project?", "Do you have any design preferences?", "What's your budget range?", "When do you need this completed?"]
    var body: some View {
        VStack {
            List {
                ForEach(messages.indices, id: \.self) { i in
                    let (role, text) = messages[i]
                    HStack {
                        if role == "you" { Spacer() }
                        Text(text).padding(10).background(role == "you" ? Color.accentColor : Color.secondary.opacity(0.15)).foregroundColor(role == "you" ? .white : .primary).cornerRadius(14)
                        if role == "bot" { Spacer() }
                    }.listRowSeparator(.hidden)
                }
                if step >= questions.count {
                    NavigationLink(value: Route.contact) { Text("View requirements doc →").foregroundColor(.accentColor) }
                }
            }.listStyle(.plain)
            HStack {
                TextField("Reply", text: $input)
                Button("Send") {
                    messages.append(("you", input)); input = ""
                    if step < questions.count { messages.append(("bot", questions[step])); step += 1 }
                    else { messages.append(("bot", "All set! I've compiled your requirements doc.")) }
                }.disabled(input.isEmpty)
            }.padding()
            Text("Step \(min(step, questions.count)) of \(questions.count)").font(.caption).foregroundColor(.secondary)
        }.navigationTitle("Grapsee AI")
    }
}

struct AuditsView: View {
    @State private var url = ""
    @State private var score: Int?
    @State private var bought: String?
    @State private var scanning = false
    var body: some View {
        List {
            Section("Instant scan (demo)") {
                TextField("Website URL", text: $url)
                Button(scanning ? "Scanning…" : "Run free scan") {
                    scanning = true
                    Task { try? await Task.sleep(nanoseconds: 2_000_000_000); score = Int.random(in: 60...99); scanning = false }
                }.disabled(url.isEmpty || scanning)
                if let s = score { Text("Score: \(s)/100").font(.headline).foregroundColor(.accentColor) }
            }
            Section("Audit packs") {
                ForEach(auditPacks) { p in
                    VStack(alignment: .leading) {
                        HStack { VStack(alignment: .leading) { Text(p.name).font(.headline); Text("\(p.desc) · $\(p.price)").font(.caption).foregroundColor(.secondary) }; Spacer(); Button("Buy") { bought = p.name } }
                        if bought == p.name { Text("✅ \(p.name) added to cart!").font(.caption).foregroundColor(.accentColor) }
                    }
                }
            }
        }.navigationTitle("Website Audits")
    }
}

struct GuidesView: View {
    @State private var bought: String?
    var body: some View {
        List(guides) { g in
            VStack(alignment: .leading, spacing: 4) {
                Text("📘 \(g.name)").font(.headline)
                Text("\(g.pages) pages · \(g.sales) sold · ⭐ \(String(format: "%.1f", g.rating))").font(.caption).foregroundColor(.secondary)
                HStack { Text("$\(g.price)").font(.headline).foregroundColor(.accentColor); Spacer(); Button("Buy") { bought = g.name } }
                if bought == g.name { Text("✅ \(g.name) added to cart!").font(.caption).foregroundColor(.accentColor) }
            }.padding(.vertical, 4)
        }.navigationTitle("Video Guides")
    }
}

struct CicdView: View {
    @State private var tab = "github"
    @State private var bought: String?
    var body: some View {
        VStack {
            Picker("Platform", selection: $tab) { Text("GitHub").tag("github"); Text("GitLab").tag("gitlab") }.pickerStyle(.segmented).padding(.horizontal)
            List(cicdTpls.filter { $0.platform == tab }) { t in
                VStack(alignment: .leading, spacing: 4) {
                    Text("\(t.name) · $\(t.price)").font(.headline)
                    Text(t.desc).font(.caption).foregroundColor(.secondary)
                    Text(t.yaml).font(.system(.caption, design: .monospaced)).padding(8).background(Color.secondary.opacity(0.12)).cornerRadius(8)
                    Button("Buy template") { bought = t.name }
                    if bought == t.name { Text("✅ added to cart!").font(.caption).foregroundColor(.accentColor) }
                }.padding(.vertical, 4)
            }.listStyle(.plain)
        }.navigationTitle("CI/CD Pipelines")
    }
}

struct EnvSetupView: View {
    @State private var bought: String?
    var body: some View {
        List(envSetups) { e in
            VStack(alignment: .leading, spacing: 4) {
                Text("\(e.name) · $\(e.price)").font(.headline)
                Text(e.desc).font(.caption).foregroundColor(.secondary)
                Text("Includes: \(e.includes.joined(separator: ", "))").font(.caption).foregroundColor(.secondary)
                Text(e.command).font(.system(.caption, design: .monospaced)).padding(8).background(Color.secondary.opacity(0.12)).cornerRadius(8)
                Button("Buy") { bought = e.name }
                if bought == e.name { Text("✅ added to cart!").font(.caption).foregroundColor(.accentColor) }
            }.padding(.vertical, 4)
        }.navigationTitle("Dev Environments")
    }
}

struct DbSchemasView: View {
    @State private var tab = "ecommerce"
    @State private var bought: String?
    var body: some View {
        VStack {
            Picker("Schema", selection: $tab) { ForEach(dbSchemas) { s in Text(s.name.components(separatedBy: " ").prefix(2).joined(separator: " ")).tag(s.key) } }.pickerStyle(.segmented).padding(.horizontal)
            List(dbSchemas.filter { $0.key == tab }) { s in
                VStack(alignment: .leading, spacing: 4) {
                    Text("\(s.name) · $\(s.price)").font(.headline)
                    Text(s.desc).font(.caption).foregroundColor(.secondary)
                    Text(s.code).font(.system(.caption, design: .monospaced)).padding(8).background(Color.secondary.opacity(0.12)).cornerRadius(8)
                    Button("Buy schema") { bought = s.key }
                    if bought == s.key { Text("✅ added to cart!").font(.caption).foregroundColor(.accentColor) }
                }
            }.listStyle(.plain)
        }.navigationTitle("Database Schemas")
    }
}

struct NotionView: View {
    @State private var bought: String?
    var body: some View {
        List(notionTpls) { t in
            VStack(alignment: .leading, spacing: 4) {
                Text("📄 \(t.name)").font(.headline)
                Text("\(t.pages) pages · \(t.sales) sold · ⭐ \(String(format: "%.1f", t.rating))").font(.caption).foregroundColor(.secondary)
                Text(t.desc).font(.caption).foregroundColor(.secondary)
                HStack { Text("$\(t.price)").font(.headline).foregroundColor(.accentColor); Spacer(); Button("Buy") { bought = t.name } }
                if bought == t.name { Text("✅ added to cart!").font(.caption).foregroundColor(.accentColor) }
            }.padding(.vertical, 4)
        }.navigationTitle("Notion Templates")
    }
}

struct TutorialsView: View {
    @State private var bought: String?
    var body: some View {
        List(tutorials) { t in
            VStack(alignment: .leading, spacing: 4) {
                Text("🎬 \(t.title)").font(.headline)
                Text("\(t.duration) · \(t.views) views · ⭐ \(String(format: "%.1f", t.rating))").font(.caption).foregroundColor(.secondary)
                HStack { Text("$\(t.price)").font(.headline).foregroundColor(.accentColor); Spacer(); Button("Buy") { bought = t.title } }
                if bought == t.title { Text("✅ added to cart!").font(.caption).foregroundColor(.accentColor) }
            }.padding(.vertical, 4)
        }.navigationTitle("Bite-Sized Tutorials")
    }
}
