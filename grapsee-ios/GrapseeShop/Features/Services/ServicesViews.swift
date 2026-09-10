import SwiftUI

// MARK: - Services batch (mirrors Android ServicesScreens.kt)

struct GiftWrapView: View {
    @State private var designs: [String] = []
    @State private var ribbons: [String] = []
    @State private var design = ""
    @State private var ribbon = ""
    @State private var message = ""
    @AppStorage("giftwrap") private var stored = ""
    var body: some View {
        List {
            if !designs.isEmpty {
                Section("Designs") { ForEach(designs, id: \.self) { d in
                    Button { design = d } label: { HStack { Text(d); Spacer(); if design == d { Image(systemName: "checkmark.circle.fill").foregroundColor(.accentColor) } } }.foregroundColor(.primary)
                } }
            }
            if !ribbons.isEmpty {
                Section("Ribbons") { ForEach(ribbons, id: \.self) { r in
                    Button { ribbon = r } label: { HStack { Text(r); Spacer(); if ribbon == r { Image(systemName: "checkmark.circle.fill").foregroundColor(.accentColor) } } }.foregroundColor(.primary)
                } }
            }
            Section {
                TextField("Gift message (optional)", text: $message)
                Button("Save gift wrap") {
                    stored = "\(design) | \(ribbon) | \(message)"
                }.disabled(design.isEmpty)
                if !stored.isEmpty { Text("Saved: \(stored)").font(.caption).foregroundColor(.secondary) }
            }
        }.navigationTitle("Gift Wrap").task {
            let opts = await API.giftOptions()
            designs = opts.designs; ribbons = opts.ribbons
        }
    }
}

struct CodeQualityView: View {
    @State private var plan = "pro"
    @State private var done: Bool?
    let plans = [("basic", "Basic Coverage", "30 days · 2 revisions"), ("pro", "Pro Assurance", "90 days · 5 revisions"), ("enterprise", "Enterprise Shield", "180 days · 10 revisions")]
    var body: some View {
        List {
            ForEach(plans, id: \.0) { id, name, desc in
                Button { plan = id } label: { VStack(alignment: .leading) { Text(name).font(.headline); Text(desc).font(.caption).foregroundColor(.secondary) } }.foregroundColor(.primary)
            }
            Section {
                Button("Subscribe") { Task { done = await API.codeQualitySubscribe(planId: plan) } }
                if let d = done { Text(d ? "✅ Subscribed" : "❌ Failed — sign in and retry").font(.caption) }
            }
        }.navigationTitle("Code Quality")
    }
}

struct StudentView: View {
    @State private var status: [String: String] = [:]
    @State private var school = ""
    @State private var email = ""
    @State private var sent: Bool?
    var body: some View {
        List {
            if !status.isEmpty {
                Section("Verification status") { ForEach(status.sorted(by: { $0.key < $1.key }), id: \.key) { k, v in HStack { Text(k).foregroundColor(.secondary); Spacer(); Text(v).bold() } } }
            } else {
                Section("Get verified") {
                    TextField("School / university", text: $school)
                    TextField("Student email", text: $email)
                    Button("Request verification") { Task { sent = await API.studentRequest(school: school, email: email) } }.disabled(school.isEmpty || email.isEmpty)
                    if let s = sent { Text(s ? "✅ Request sent" : "❌ Failed").font(.caption) }
                }
            }
        }.navigationTitle("Student Discount").task { status = await API.studentStatus() }
    }
}

struct WarrantyView: View {
    var body: some View {
        List {
            Section("How claims work") { Text("1 · Find your order\n2 · Contact support with photos\n3 · Get a replacement or refund") }
            Section { NavigationLink(value: Route.contact) { Text("Contact support").foregroundColor(.accentColor) } }
        }.navigationTitle("Warranty Center")
    }
}

struct TechLibraryView: View {
    @State private var resources: [TechResource] = []
    @State private var unlocked: Set<String> = []
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else { List(resources) { r in
                VStack(alignment: .leading, spacing: 4) {
                    Text(r.displayTitle).font(.headline)
                    if let d = r.description { Text(d).font(.caption).foregroundColor(.secondary).lineLimit(2) }
                    HStack {
                        Text(r.cost > 0 ? "🪙 \(r.cost) pts" : "Free").font(.caption).foregroundColor(.accentColor)
                        Spacer()
                        Button(unlocked.contains(r.id) ? "Unlocked ✓" : "Unlock") {
                            Task { if await API.techUnlock(resourceId: r.id, pointsCost: r.cost) { unlocked.insert(r.id) } }
                        }.disabled(unlocked.contains(r.id)).font(.caption)
                    }
                }.padding(.vertical, 4)
            }.listStyle(.plain) }
        }.navigationTitle("Tech Library").task { resources = await API.techResources(); loading = false }
    }
}

struct SellerView: View {
    @State private var status: [String: String] = [:]
    @State private var shop = ""
    @State private var applied: Bool?
    var body: some View {
        List {
            if !status.isEmpty {
                Section("Seller dashboard") { ForEach(status.sorted(by: { $0.key < $1.key }), id: \.key) { k, v in HStack { Text(k).foregroundColor(.secondary); Spacer(); Text(v).bold() } } }
            } else {
                Section("Become a seller") {
                    Text("Open your shop and keep up to 95% of every sale.").font(.subheadline).foregroundColor(.secondary)
                    TextField("Shop name", text: $shop)
                    Button("Apply now") { Task { applied = await API.sellerApply(shopName: shop) } }.disabled(shop.isEmpty)
                    if let a = applied { Text(a ? "✅ Application sent" : "❌ Failed").font(.caption) }
                }
            }
        }.navigationTitle("Seller Center").task { status = await API.sellerStatus() }
    }
}

struct OpenSourceView: View {
    @State private var projects: [OpenProject] = []
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else if projects.isEmpty { ContentUnavailableView("No projects listed", systemImage: "chevron.left.forwardslash.chevron.right") }
            else { List(projects) { p in
                VStack(alignment: .leading) { Text(p.title ?? p.name).font(.headline); if let d = p.description { Text(d).font(.caption).foregroundColor(.secondary).lineLimit(3) } }
            }.listStyle(.plain) }
        }.navigationTitle("Open Source").task { projects = await API.openProjects(); loading = false }
    }
}

struct DeliveryShieldView: View {
    @State private var plan = "pro"
    @State private var done: Bool?
    let plans = [("standard", "Standard Protection", "50% refund · 3 milestones"), ("pro", "Pro Protection", "75% refund · 5 milestones"), ("enterprise", "Enterprise Shield", "100% refund · 7 milestones")]
    var body: some View {
        List {
            ForEach(plans, id: \.0) { id, name, desc in
                Button { plan = id } label: { VStack(alignment: .leading) { Text(name).font(.headline); Text(desc).font(.caption).foregroundColor(.secondary) } }.foregroundColor(.primary)
            }
            Section {
                Button("Protect my orders") { Task { done = await API.protectionSubscribe(planId: plan) } }
                if let d = done { Text(d ? "✅ Protected" : "❌ Failed").font(.caption) }
            }
        }.navigationTitle("Delivery Protection")
    }
}

struct DarkStoreView: View {
    @State private var info: DarkStoreInfo?
    @State private var products: [Product] = []
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else if info == nil { ContentUnavailableView("Store closed", systemImage: "moon", description: Text("Opens at 10 PM")) }
            else {
                List {
                    Section { Text((info?.isOpen == true ? "🟢 Open now" : "🌙 Opens at 10 PM")).font(.headline).foregroundColor(.accentColor) }
                    ForEach(products) { p in NavigationLink(value: Route.product(p.id)) { ProductRow(product: p) } }
                }.listStyle(.plain)
            }
        }.navigationTitle("Dark Store").task {
            let res = await API.darkStore()
            info = res.info; products = res.products; loading = false
        }
    }
}

struct LoyaltyCalcView: View {
    @State private var amount = ""
    @State private var result: [String: String] = [:]
    var body: some View {
        List {
            Section {
                TextField("Purchase amount", text: $amount).keyboardType(.decimalPad)
                Button("Calculate points") { Task { result = await API.loyaltyCalc(amount: Double(amount) ?? 0) } }.disabled(amount.isEmpty)
            }
            if !result.isEmpty { Section { ForEach(result.sorted(by: { $0.key < $1.key }), id: \.key) { k, v in HStack { Text(k).foregroundColor(.secondary); Spacer(); Text(v).bold() } } } }
        }.navigationTitle("Loyalty Calculator")
    }
}

struct MiniGamesView: View {
    @State private var questions: [QuizQuestion] = []
    @State private var index = 0
    @State private var finished = false
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else if questions.isEmpty { ContentUnavailableView("No games right now", systemImage: "gamecontroller") }
            else if finished { ContentUnavailableView("Done! 🎮", systemImage: "checkmark.circle", description: Text("You played \(questions.count) questions")) }
            else {
                let q = questions[index]
                List {
                    Section("Question \(index + 1)/\(questions.count)") { Text(q.question).font(.headline) }
                    ForEach(q.options, id: \.self) { opt in
                        Button { if index < questions.count - 1 { index += 1 } else { finished = true } } label: { Text(opt) }.foregroundColor(.primary)
                    }
                }
            }
        }.navigationTitle("Mini Games").task { questions = await API.miniQuiz(); loading = false }
    }
}

struct TopReviewersView: View {
    @State private var reviewers: [TopReviewer] = []
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else { List(reviewers) { r in
                HStack { Text("★").font(.title).foregroundColor(.yellow)
                    VStack(alignment: .leading) { Text(r.displayName).font(.headline); Text("\(r.totalReviews) reviews").font(.caption).foregroundColor(.secondary) } }
            }.listStyle(.plain) }
        }.navigationTitle("Top Reviewers").task { reviewers = await API.topReviewers(); loading = false }
    }
}

struct StyleGuideView: View {
    var body: some View {
        List {
            Section("COLORS") {
                HStack(spacing: 16) {
                    ForEach([("Primary", Color.accentColor), ("Secondary", Color.secondary), ("Error", Color.red)], id: \.0) { name, color in
                        VStack { RoundedRectangle(cornerRadius: 10).fill(color).frame(width: 48, height: 48); Text(name).font(.caption).foregroundColor(.secondary) }
                    }
                }
            }
            Section("BUTTONS") {
                Button("Primary") {}
                Button("Secondary") {}.buttonStyle(.bordered)
            }
        }.navigationTitle("Style Guide")
    }
}
