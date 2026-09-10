import SwiftUI

// MARK: - Orders batch (mirrors Android OrderToolsScreens.kt)

struct TrackView: View {
    @State private var query = ""
    @State private var results: [Order] = []
    @State private var searching = false
    @State private var searched = false
    var body: some View {
        List {
            Section("Order ID or email") {
                TextField("e.g. ord_123 or you@mail.com", text: $query)
                Button(searching ? "Searching…" : "Track") {
                    searching = true
                    Task {
                        if let one = await API.order(id: query.trimmingCharacters(in: .whitespaces)) {
                            results = [one]
                        } else {
                            results = await API.orders(email: query.trimmingCharacters(in: .whitespaces))
                        }
                        searching = false; searched = true
                    }
                }.disabled(query.isEmpty || searching)
            }
            ForEach(results) { o in
                NavigationLink(value: Route.web("/orders/\(o.id)")) {
                    VStack(alignment: .leading) {
                        Text("Order \(String(o.id.prefix(12)))").font(.headline)
                        Text("\(o.status.uppercased())").font(.caption).foregroundColor(.accentColor)
                    }
                }
            }
            if searched && results.isEmpty && !searching {
                ContentUnavailableView("No orders found", systemImage: "box")
            }
        }.navigationTitle("Track Order")
    }
}

struct ReturnsView: View {
    @State private var items: [ReturnItem] = []
    @State private var orderId = ""
    @State private var reason = ""
    @State private var message: String?
    var body: some View {
        List {
            Section("Start a return") {
                TextField("Order ID", text: $orderId)
                TextField("Reason", text: $reason)
                Button("Submit request") {
                    Task {
                        let ok = await API.requestReturn(orderId: orderId, reason: reason)
                        message = ok ? "✅ Request received" : "❌ Couldn't submit — sign in and retry"
                        if ok { items = await API.returns() }
                    }
                }.disabled(orderId.isEmpty || reason.isEmpty)
                if let m = message { Text(m).font(.caption) }
            }
            Section("My returns") {
                if items.isEmpty { Text("No returns yet").foregroundColor(.secondary) }
                ForEach(items) { r in
                    VStack(alignment: .leading) {
                        Text("Order \(String(r.orderId.prefix(12)))").font(.headline)
                        Text("\((r.status ?? "").uppercased()) · \(r.reason ?? "")").font(.caption).foregroundColor(.secondary)
                    }
                }
            }
        }.navigationTitle("Returns").task { items = await API.returns() }
    }
}

struct ShippingView: View {
    @State private var destination = ""
    @State private var quote: [String: String] = [:]
    @State private var loading = false
    var body: some View {
        List {
            Section {
                TextField("Destination city / country", text: $destination)
                Button(loading ? "Calculating…" : "Calculate") {
                    loading = true
                    Task { quote = await API.rawMap(path: "/api/shipping/calculator", payload: ["destination": destination]); loading = false }
                }.disabled(destination.isEmpty || loading)
            }
            if !quote.isEmpty { Section("Quote") { ForEach(quote.sorted(by: { $0.key < $1.key }), id: \.key) { k, v in HStack { Text(k).foregroundColor(.secondary); Spacer(); Text(v).bold() } } } }
        }.navigationTitle("Shipping Calculator")
    }
}

struct InstallmentsView: View {
    @State private var amount = ""
    @State private var months = "12"
    @State private var plan: [String: String] = [:]
    @State private var empty = false
    var body: some View {
        List {
            Section {
                TextField("Amount", text: $amount).keyboardType(.decimalPad)
                TextField("Months", text: $months).keyboardType(.numberPad)
                Button("Calculate plan") {
                    Task {
                        let res = await API.rawMap(path: "/api/installments/calculate", payload: ["amount": Double(amount) ?? 0, "months": Int(months) ?? 12])
                        plan = res; empty = res.isEmpty
                    }
                }.disabled(amount.isEmpty || months.isEmpty)
                if empty { Text("Sign in to calculate EMI plans").foregroundColor(.red).font(.caption) }
            }
            if !plan.isEmpty { Section("Plan") { ForEach(plan.sorted(by: { $0.key < $1.key }), id: \.key) { k, v in HStack { Text(k).foregroundColor(.secondary); Spacer(); Text(v).bold() } } } }
        }.navigationTitle("Installments")
    }
}

struct TradeInView: View {
    @State private var products: [Product] = []
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else if products.isEmpty { ContentUnavailableView("No trade-in offers", systemImage: "arrow.triangle.2.circlepath") }
            else { List(products) { p in NavigationLink(value: Route.product(p.id)) { ProductRow(product: p) } }.listStyle(.plain) }
        }.navigationTitle("Trade-In").task { products = await API.tradeInProducts(); loading = false }
    }
}

struct TryView: View {
    @State private var productId = ""
    @State private var info: [String: String] = [:]
    @State private var requested: Bool?
    var body: some View {
        List {
            Section {
                TextField("Product ID", text: $productId)
                Button("Check eligibility") {
                    Task { info = await API.rawMap(path: "/api/try-before-buy/trial?productId=\(productId)") }
                }.disabled(productId.isEmpty)
            }
            if !info.isEmpty {
                Section { ForEach(info.sorted(by: { $0.key < $1.key }), id: \.key) { k, v in HStack { Text(k).foregroundColor(.secondary); Spacer(); Text(v).bold() } } }
                Section {
                    Button("Request trial") { Task { requested = await API.requestTrial(productId: productId) } }
                    if let r = requested { Text(r ? "✅ Trial requested" : "❌ Request failed").font(.caption) }
                }
            }
        }.navigationTitle("Try Before You Buy")
    }
}

struct OutfitMakerView: View {
    @EnvironmentObject var state: AppState
    @State private var query = ""
    @State private var results: [Product] = []
    @State private var board: [Product] = []
    @State private var name = ""
    @AppStorage("outfits") private var stored = ""
    var saved: [SavedOutfit] { (try? JSONDecoder().decode([SavedOutfit].self, from: Data(stored.utf8))) ?? [] }
    var body: some View {
        List {
            Section("1 · Find pieces") {
                TextField("Search products", text: $query)
                Button("Search") { Task { results = await API.search(query) } }.disabled(query.isEmpty)
            }
            if !results.isEmpty {
                Section("Tap to add (\(board.count) picked)") {
                    ForEach(results) { p in
                        Button { if board.contains(where: { $0.id == p.id }) { board.removeAll { $0.id == p.id } } else { board.append(p) } } label: {
                            HStack { Text(board.contains(where: { $0.id == p.id }) ? "✅" : "➕"); Text(p.name).lineLimit(1) }
                        }.foregroundColor(.primary)
                    }
                }
            }
            if !board.isEmpty {
                Section("2 · Name & save") {
                    TextField("Outfit name", text: $name)
                    Button("Save outfit") {
                        var all = saved
                        all.append(SavedOutfit(id: UUID().uuidString, name: name, productIds: board.map { $0.id }, productNames: board.map { $0.name }))
                        stored = String(data: (try? JSONEncoder().encode(all)) ?? Data(), encoding: .utf8) ?? ""
                        name = ""; board = []
                    }.disabled(name.isEmpty)
                }
            }
            if !saved.isEmpty {
                Section("My outfits") {
                    ForEach(saved) { o in
                        VStack(alignment: .leading) { Text(o.name).font(.headline); Text(o.productNames.joined(separator: ", ")).font(.caption).foregroundColor(.secondary).lineLimit(2) }
                    }
                }
            }
        }.navigationTitle("Outfit Maker")
    }
}

struct RentalView: View {
    @State private var products: [Product] = []
    @State private var rentals: [Rental] = []
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else {
                List {
                    if !rentals.isEmpty {
                        Section("My rentals") { ForEach(rentals) { r in
                            VStack(alignment: .leading) { Text(String(r.productId.prefix(12))).font(.headline); Text("\((r.status ?? "").uppercased())").font(.caption).foregroundColor(.secondary) } } }
                    }
                    Section("Rentable now") {
                        if products.isEmpty { Text("Nothing rentable").foregroundColor(.secondary) }
                        ForEach(products) { p in NavigationLink(value: Route.product(p.id)) { ProductRow(product: p) } }
                    }
                }.listStyle(.plain)
            }
        }.navigationTitle("Rent Products").task {
            async let pr = API.rentalProducts(), mr = API.myRentals()
            products = await pr; rentals = await mr; loading = false
        }
    }
}

struct DownloadsView: View {
    @State private var products: [Product] = []
    @State private var mine: [DownloadInfo] = []
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else {
                List {
                    if !mine.isEmpty {
                        Section("My downloads") { ForEach(mine) { d in
                            VStack(alignment: .leading) { Text(d.productName ?? String(d.productId.prefix(12))).font(.headline); Text("\(d.downloadsRemaining) left · \(d.totalDownloads) total").font(.caption).foregroundColor(.secondary) } } }
                    }
                    Section("Browse files") {
                        if products.isEmpty && mine.isEmpty { Text("Buy a digital product to see it here").foregroundColor(.secondary) }
                        ForEach(products) { p in NavigationLink(value: Route.product(p.id)) { ProductRow(product: p) } }
                    }
                }.listStyle(.plain)
            }
        }.navigationTitle("Digital Downloads").task {
            async let pr = API.downloadProducts(), md = API.myDownloads()
            products = await pr; mine = await md; loading = false
        }
    }
}

struct GroupBuyView: View {
    @State private var deals: [GroupBuy] = []
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else if deals.isEmpty { ContentUnavailableView("No group buys", systemImage: "person.3") }
            else { List(deals) { d in
                VStack(alignment: .leading, spacing: 4) {
                    Text(d.displayTitle).font(.headline)
                    Button(d.joined ? "Joined ✓" : "Join group") { Task { if await API.joinGroupBuy(id: d.id) { deals = await API.groupBuys() } } }.disabled(d.joined)
                }.padding(.vertical, 4)
            }.listStyle(.plain) }
        }.navigationTitle("Group Buy").task { deals = await API.groupBuys(); loading = false }
    }
}

struct PriceDropView: View {
    @State private var drops: [Product] = []
    @State private var tracked: Set<String> = []
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else if drops.isEmpty { ContentUnavailableView("No drops right now", systemImage: "chart.line.downtrend.xyaxis") }
            else { List(drops) { p in NavigationLink(value: Route.product(p.id)) { ProductRow(product: p) } }.listStyle(.plain) }
        }.navigationTitle("Price Drops").task { drops = await API.priceDrops(); loading = false }
    }
}

struct ProductDetailView: View {
    @EnvironmentObject var state: AppState
    let id: String
    @State private var product: Product?
    @State private var stock: Inventory?
    @State private var qty = 1
    @State private var loading = true
    private var cap: Int { stock.map { max($0.inventory, 1) } ?? 99 }
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else if let p = product {
                List {
                    Text(p.name).font(.title2).bold()
                    PriceText(price: p.price, compare: p.comparePrice)
                    if let d = p.description { Text(d).font(.body) }
                    if let s = stock {
                        Text(s.isSoldOut ? "Out of stock" : (s.inventory <= 5 ? "Only \(s.inventory) left" : "In stock"))
                            .font(.caption).foregroundColor(s.isSoldOut ? .red : .accentColor)
                    } else {
                        Text("Checking availability…").font(.caption).foregroundColor(.secondary)
                    }
                    Stepper("Quantity: \(qty)", value: $qty, in: 1...cap)
                    Button("Add to cart") { state.addToCart(product: p, qty: qty) }
                        .disabled(stock == nil || stock?.isSoldOut == true || stock?.isAvailable == false)
                    Button(state.wishlist.contains(p.id) ? "♥ Wishlisted" : "♡ Wishlist") { state.toggleWishlist(p) }
                }
            } else { ContentUnavailableView("Product not found", systemImage: "bag") }
        }.navigationTitle("Product").task {
            product = await API.product(id: id)
            stock = await API.inventory(productId: id)
            loading = false
            if let pr = product { state.recordView(pr) }
        }
    }
}
