import SwiftUI

// MARK: - Info batch (mirrors Android InfoScreens.kt; content from InfoContent.swift)

struct DocView: View {
    let title: String
    let subtitle: String
    let sections: [InfoSection]
    var body: some View {
        List {
            ForEach(sections) { s in
                Section(s.title) { ForEach(s.paras, id: \.self) { p in Text(p).font(.subheadline).foregroundColor(.secondary) } }
            }
        }.navigationTitle(title)
    }
}

struct AboutView: View {
    var body: some View {
        List {
            Section {
                Text("🏬 The premium digital mall").font(.headline).foregroundColor(.accentColor)
                Text("Grapsee started as a small web development studio and grew into a premium digital marketplace.").font(.subheadline).foregroundColor(.secondary)
                NavigationLink(value: Route.collections) { Text("Shop the mall →").foregroundColor(.accentColor) }
            }
            Section("Our journey") {
                ForEach(milestones) { m in
                    HStack(alignment: .top) {
                        Text(m.year).font(.headline).foregroundColor(.accentColor).frame(width: 52, alignment: .leading)
                        VStack(alignment: .leading) { Text(m.event).font(.headline); Text(m.desc).font(.caption).foregroundColor(.secondary) }
                    }.padding(.vertical, 4)
                }
            }
        }.navigationTitle("About Grapsee")
    }
}

struct PrivacyView: View {
    var body: some View { DocView(title: "Privacy Policy", subtitle: "", sections: privacySections) }
}

struct TermsView: View {
    var body: some View { DocView(title: "Terms of Service", subtitle: "", sections: termsSections) }
}

struct FaqFullView: View {
    @State private var query = ""
    var filtered: [FaqEntry] {
        if query.trimmingCharacters(in: .whitespaces).isEmpty { return faqEntries }
        let q = query.lowercased()
        return faqEntries.filter { $0.q.lowercased().contains(q) || $0.a.lowercased().contains(q) }
    }
    var body: some View {
        List {
            TextField("Search answers", text: $query)
            ForEach(filtered) { e in DisclosureGroup(e.q) { Text(e.a).font(.subheadline).foregroundColor(.secondary) } }
            NavigationLink(value: Route.contact) { Text("Contact support").foregroundColor(.accentColor) }
        }.navigationTitle("FAQ")
    }
}

struct CompareView: View {
    @EnvironmentObject var state: AppState
    @State private var query = ""
    @State private var results: [Product] = []
    @State private var picked: [Product] = []
    var body: some View {
        List {
            Section {
                TextField("Search products to compare", text: $query)
                Button("Search") { Task { results = await API.search(query).filter { r in !picked.contains(where: { $0.id == r.id }) } } }.disabled(query.isEmpty)
            }
            if !results.isEmpty {
                Section("Tap + to compare") {
                    ForEach(results.prefix(5)) { p in
                        HStack { Text(p.name).lineLimit(1); Spacer(); Button("＋") { if picked.count < 3 { picked.append(p) } } }
                    }
                }
            }
            if !picked.isEmpty {
                Section("Comparing \(picked.count)/3") {
                    ForEach(picked) { p in
                        VStack(alignment: .leading, spacing: 4) {
                            Text(p.name).font(.headline)
                            PriceText(price: p.price, compare: p.comparePrice)
                            Text("⭐ \(p.rating) · Stock \(p.inventory)").font(.caption).foregroundColor(.secondary)
                            HStack {
                                Button("Add") { state.addToCart(product: p) }.buttonStyle(.borderedProminent).font(.caption)
                                Button("Remove") { picked.removeAll { $0.id == p.id } }.font(.caption).foregroundColor(.red)
                            }
                        }.padding(.vertical, 4)
                    }
                }
            }
        }.navigationTitle("Compare")
    }
}

struct RecentFullView: View {
    @EnvironmentObject var state: AppState
    var body: some View {
        Group {
            if state.recent.isEmpty { ContentUnavailableView("No browsing history", systemImage: "clock") }
            else { List(state.recent.reversed()) { p in NavigationLink(value: Route.product(p.id)) { ProductRow(product: p) } }.listStyle(.plain) }
        }.navigationTitle("Recently Viewed")
    }
}

struct StoresView: View {
    @State private var city = ""
    @State private var stores: [Store] = []
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else {
                List {
                    Section { TextField("City", text: $city); Button("Search\(city.isEmpty ? "" : " in \(city)")") { Task { loading = true; stores = await API.stores(city: city); loading = false } } }
                    ForEach(stores) { s in
                        VStack(alignment: .leading, spacing: 2) {
                            HStack { Text(s.name).font(.headline); Spacer(); Text(s.isOpen ? "🟢 Open" : "🌙 Closed").font(.caption) }
                            if let a = s.address { Text(a).font(.caption).foregroundColor(.secondary) }
                            HStack { if let c = s.city { Text(c).font(.caption).foregroundColor(.secondary) }; if let d = s.formattedDistance { Text(d).font(.caption).foregroundColor(.accentColor) } }
                        }.padding(.vertical, 4)
                    }
                }.listStyle(.plain)
            }
        }.navigationTitle("Stores").task { stores = await API.stores(); loading = false }
    }
}

struct PriceAlertsView: View {
    @State private var alerts: [PriceAlert] = []
    @State private var productId = ""
    @State private var productName = ""
    @State private var target = ""
    var body: some View {
        List {
            Section("New alert") {
                TextField("Product ID", text: $productId)
                TextField("Product name", text: $productName)
                TextField("Target price", text: $target).keyboardType(.decimalPad)
                Button("Create alert") {
                    Task {
                        if await API.priceAlertCreate(productId: productId, productName: productName, targetPrice: Double(target) ?? 0) {
                            alerts = await API.priceAlerts(); productId = ""; productName = ""; target = ""
                        }
                    }
                }.disabled(productId.isEmpty || target.isEmpty)
            }
            Section("My alerts") {
                if alerts.isEmpty { Text("No alerts yet").foregroundColor(.secondary) }
                ForEach(alerts) { a in
                    HStack {
                        VStack(alignment: .leading) { Text(a.productName ?? String(a.productId.prefix(12))).font(.headline); Text("Target $\(a.targetPrice, specifier: "%.2f")").font(.caption).foregroundColor(.accentColor) }
                        Spacer()
                        Button("🗑") { Task { if await API.priceAlertDelete(id: a.id) { alerts.removeAll { $0.id == a.id } } } }
                    }
                }
            }
        }.navigationTitle("Price Alerts").task { alerts = await API.priceAlerts() }
    }
}

struct SubscriptionsView: View {
    @State private var plans: [SubscriptionPlan] = []
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else { List(plans) { p in
                VStack(alignment: .leading, spacing: 4) {
                    HStack { Text(p.name).font(.headline); Spacer(); Text("$\(p.monthlyPrice, specifier: "%.0f")/mo").font(.headline).foregroundColor(.accentColor) }
                    if let d = p.description { Text(d).font(.caption).foregroundColor(.secondary) }
                    ForEach(p.features, id: \.self) { Text("• \($0)").font(.subheadline) }
                }.padding(.vertical, 4)
            }.listStyle(.plain) }
        }.navigationTitle("Subscriptions").task { plans = await API.subscriptionPlans(); loading = false }
    }
}

struct DigitalHubView: View {
    @State private var kind = "courses"
    @State private var items: [DigitalItem] = []
    @State private var loading = true
    let kinds = [("courses", "Courses"), ("templates", "Templates"), ("ui-kits", "UI Kits"), ("snippets", "Snippets"), ("products", "Products")]
    var body: some View {
        VStack {
            Picker("Kind", selection: $kind) { ForEach(kinds, id: \.0) { id, label in Text(label).tag(id) } }
            .pickerStyle(.segmented).padding(.horizontal)
            .onChange(of: kind) { _, v in Task { loading = true; items = await API.digitalItems(kind: v); loading = false } }
            Group {
                if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
                else { List(items) { i in
                    VStack(alignment: .leading, spacing: 2) {
                        Text(i.displayTitle).font(.headline).lineLimit(2)
                        if let d = i.description { Text(d).font(.caption).foregroundColor(.secondary).lineLimit(2) }
                        HStack { Text("$\(i.price, specifier: "%.0f")").font(.subheadline).foregroundColor(.accentColor); if let l = i.level { Text(l).font(.caption).foregroundColor(.secondary) } }
                    }.padding(.vertical, 4)
                }.listStyle(.plain) }
            }
        }.navigationTitle("Digital Products").task { items = await API.digitalItems(kind: kind); loading = false }
    }
}

struct CertificationsView: View {
    @State private var programs: [CertProgram] = []
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else { List(programs) { p in
                VStack(alignment: .leading) { Text("🎓 \(p.title)").font(.headline); if let d = p.description { Text(d).font(.caption).foregroundColor(.secondary) } }
            }.listStyle(.plain) }
        }.navigationTitle("Certifications").task { programs = await API.certPrograms(); loading = false }
    }
}

struct FeaturesDirectoryView: View {
    @State private var query = ""
    var filtered: [FeatureCategory] {
        if query.trimmingCharacters(in: .whitespaces).isEmpty { return featureCategories }
        let q = query.lowercased()
        return featureCategories.compactMap { c in
            let tools = c.tools.filter { $0.name.lowercased().contains(q) || $0.desc.lowercased().contains(q) }
            if tools.isEmpty { return nil }
            return FeatureCategory(title: c.title, desc: c.desc, tools: tools)
        }
    }
    var body: some View {
        List {
            TextField("Search tools", text: $query)
            ForEach(filtered) { c in
                Section(c.title) {
                    ForEach(c.tools) { t in
                        NavigationLink(value: appRoute(for: t.path)) {
                            VStack(alignment: .leading) { Text(t.name).font(.subheadline).bold(); if !t.desc.isEmpty { Text(t.desc).font(.caption).foregroundColor(.secondary).lineLimit(2) } }
                        }
                    }
                }
            }
        }.navigationTitle("All Features")
    }
}
