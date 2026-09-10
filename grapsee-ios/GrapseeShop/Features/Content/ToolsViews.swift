import SwiftUI

// MARK: - Tools wave-2 (mirrors Android ToolsScreens.kt)

struct TaxRefundView: View {
    @State private var items: [Deduction] = []
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else if items.isEmpty { ContentUnavailableView("No deductions found", systemImage: "doc.text", description: Text("Sign in to pull your order history")) }
            else {
                List {
                    Section { Text("Total deductible").font(.caption).foregroundColor(.secondary); Text("$\(items.reduce(0) { $0 + $1.amount }, specifier: "%.2f")").font(.largeTitle).foregroundColor(.accentColor) }
                    ForEach(items) { d in
                        HStack { VStack(alignment: .leading) { Text(d.displayTitle).font(.headline); if let c = d.category { Text(c).font(.caption).foregroundColor(.secondary) } }; Spacer(); Text("$\(d.amount, specifier: "%.2f")").foregroundColor(.accentColor) }
                    }
                }
            }
        }.navigationTitle("Tax Refund").task { items = await API.taxDeductions(); loading = false }
    }
}

struct PriceLockView: View {
    @State private var productId = ""
    @State private var done: Bool?
    var body: some View {
        List {
            Section {
                Text("100 deposit · refundable").font(.caption).foregroundColor(.secondary)
                TextField("Product ID", text: $productId)
                Button("Lock price") { Task { done = await API.priceLock(productId: productId) } }.disabled(productId.isEmpty)
                if let d = done { Text(d ? "✅ Price locked for 30 days" : "❌ Failed").font(.caption) }
            }
        }.navigationTitle("Price Lock")
    }
}

struct UnitPriceRow: Identifiable {
    let id = UUID()
    var name = ""
    var price = ""
    var quantity = "1"
    var unit = "pcs"
}

struct UnitPriceView: View {
    @State private var rows = [UnitPriceRow(), UnitPriceRow(), UnitPriceRow()]
    @State private var results: [UnitPriceItem] = []
    @State private var comparing = false
    var body: some View {
        List {
            ForEach($rows) { $row in
                Section("Item") {
                    TextField("Name", text: $row.name)
                    TextField("Price", text: $row.price).keyboardType(.decimalPad)
                    TextField("Qty", text: $row.quantity).keyboardType(.decimalPad)
                    TextField("Unit (g, kg, ml, l, pcs)", text: $row.unit)
                }
            }
            Button(comparing ? "Comparing…" : "Compare") {
                comparing = true
                Task {
                    let items: [[String: Any]] = rows.filter { !($0.price.isEmpty) }.map {
                        ["name": $0.name, "price": Double($0.price) ?? 0, "quantity": Double($0.quantity) ?? 1, "unit": $0.unit]
                    }
                    results = await API.unitPriceCompare(items: items)
                    comparing = false
                }
            }.disabled(comparing)
            ForEach(results) { r in
                HStack {
                    VStack(alignment: .leading) { Text(r.name).font(.headline); Text(r.unitPriceDisplay ?? String(format: "%.4f / unit", r.unitPrice)).font(.caption).foregroundColor(.secondary) }
                    Spacer()
                    if r.isBest { Text("BEST").font(.caption).bold().padding(6).background(Color.accentColor).foregroundColor(.white).cornerRadius(8) }
                }
            }
        }.navigationTitle("Unit Price")
    }
}

struct SmartReorderView: View {
    @State private var tweak = ""
    @State private var done: Bool?
    var body: some View {
        List {
            Section {
                Text("Repeats your last order with one tweak.").font(.caption).foregroundColor(.secondary)
                TextField("Modification (optional)", text: $tweak)
                Button("Reorder now") { Task { done = await API.smartReorder(modification: tweak) } }
                if let d = done { Text(d ? "✅ Reordered" : "❌ Failed").font(.caption) }
            }
        }.navigationTitle("Smart Reorder")
    }
}

struct GiftMatcherView: View {
    @State private var step = 0
    @State private var answers: [String] = []
    let questions = [("Who are you buying for?", ["Partner", "Parent", "Friend", "Child", "Colleague"]), ("What's the occasion?", ["Birthday", "Anniversary", "Wedding", "Festival", "Just Because"]), ("Budget range?", ["Under 500", "500-2000", "2000-5000", "5000+"])]
    let ideas = ["Personalized Photo Frame", "Luxury Perfume", "Designer Watch"]
    var body: some View {
        List {
            if step < questions.count {
                Section("Question \(step + 1) of \(questions.count)") {
                    Text(questions[step].0).font(.headline)
                    ForEach(questions[step].1, id: \.self) { opt in
                        Button { answers.append(opt); if step < questions.count - 1 { step += 1 } } label: { Text(opt) }.foregroundColor(.primary)
                    }
                }
            } else {
                Section {
                    Text("🎁 Gift Ideas Ready!").font(.headline).foregroundColor(.accentColor)
                    Text("For your \(answers[0])'s \(answers[1]) (Budget: \(answers[2]))").font(.caption).foregroundColor(.secondary)
                    ForEach(ideas, id: \.self) { idea in
                        NavigationLink(value: Route.search(idea)) { Text(idea) }
                    }
                    Button("Start over") { step = 0; answers = [] }
                }
            }
        }.navigationTitle("Gift Matcher")
    }
}

struct StyleQuizView: View {
    @State private var step = 0
    @State private var answers: [String] = []
    let questions = [("What colors do you prefer?", ["Bright & Bold", "Neutral & Earthy", "Pastels", "Monochrome"]), ("Your fashion vibe?", ["Classic", "Trendy", "Minimalist", "Bohemian"]), ("Where do you shop most?", ["Online", "Malls", "Thrift", "Boutiques"])]
    var body: some View {
        List {
            if step < questions.count {
                Section("Question \(step + 1) of \(questions.count)") {
                    Text(questions[step].0).font(.headline)
                    ForEach(questions[step].1, id: \.self) { opt in
                        Button { answers.append(opt); if step < questions.count - 1 { step += 1 } } label: { Text(opt) }.foregroundColor(.primary)
                    }
                }
            } else {
                Section {
                    Text("✨ Your style").font(.headline).foregroundColor(.accentColor)
                    Text("\(answers[1]) \(answers[0])").font(.title2)
                    NavigationLink(value: Route.outfit) { Text("Build outfits →").foregroundColor(.accentColor) }
                    Button("Retake") { step = 0; answers = [] }
                }
            }
        }.navigationTitle("Style Quiz")
    }
}

struct AllergyView: View {
    @State private var name = ""
    @State private var checked = false
    @State private var safe = true
    var body: some View {
        List {
            Section {
                TextField("Product name", text: $name)
                Text("Your allergies: peanuts, gluten, dairy").font(.caption).foregroundColor(.secondary)
                Button("Check for allergens") { checked = true; safe = Double.random(in: 0...1) > 0.3 }.disabled(name.isEmpty)
            }
            if checked {
                Section { Text(safe ? "✅ Safe to consume" : "⚠️ Allergen warning!").font(.headline); Text(safe ? "No allergens detected" : "Contains: Peanuts, Tree nuts").font(.subheadline) }
            }
        }.navigationTitle("Allergy Checker")
    }
}

struct HalalView: View {
    @State private var barcode = ""
    @State private var result: HalalResult?
    @State private var checking = false
    var body: some View {
        List {
            Section {
                TextField("Barcode", text: $barcode)
                Button(checking ? "Checking…" : "Check") {
                    checking = true
                    Task { result = await API.halalCheck(barcode: barcode); checking = false }
                }.disabled(barcode.isEmpty || checking)
            }
            if let r = result {
                Section {
                    Text(r.status?.lowercased() == "halal" ? "✅ Halal" : (r.status?.lowercased() == "haram" ? "⛔ Haram" : "❓ \(r.status ?? "")")).font(.headline)
                    if let reason = r.reason { Text(reason).font(.subheadline) }
                }
            }
        }.navigationTitle("Halal Checker")
    }
}

// MARK: - Tools wave-3

struct SubManagerView: View {
    @State private var items: [ManagedSubscription] = []
    @State private var name = ""
    @State private var amount = ""
    @State private var frequency = "monthly"
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else {
                List {
                    Section("Add subscription") {
                        TextField("Name", text: $name)
                        TextField("Amount", text: $amount).keyboardType(.decimalPad)
                        Picker("Frequency", selection: $frequency) { ForEach(["monthly", "yearly"], id: \.self) { Text($0).tag($0) } }.pickerStyle(.segmented)
                        Button("Add") {
                            Task {
                                if await API.managedSubscriptionAdd(name: name, amount: Double(amount) ?? 0, frequency: frequency) {
                                    items = await API.managedSubscriptions(); name = ""; amount = ""
                                }
                            }
                        }.disabled(name.isEmpty)
                    }
                    if items.isEmpty { Text("No subscriptions").foregroundColor(.secondary) }
                    else {
                        Section("Monthly burn") { Text("$\(items.reduce(0) { $0 + $1.amount }, specifier: "%.2f")").font(.largeTitle).foregroundColor(.accentColor) }
                        ForEach(items) { s in
                            HStack {
                                VStack(alignment: .leading) { Text(s.name).font(.headline); Text("$\(s.amount, specifier: "%.2f") · \(s.frequency ?? "")").font(.caption).foregroundColor(.secondary) }
                                Spacer()
                                Button("Cancel") { Task { if await API.managedSubscriptionCancel(id: s.id) { items.removeAll { $0.id == s.id } } } }.font(.caption).foregroundColor(.red)
                            }
                        }
                    }
                }
            }
        }.navigationTitle("Subscription Manager").task { items = await API.managedSubscriptions(); loading = false }
    }
}

struct ColorAdvisorView: View {
    @State private var tone = ""
    let tones = [("Fair", "Cool/Warm", ["Pastel pink", "Light blue", "Mint green", "Soft yellow"]), ("Medium", "Neutral", ["Coral", "Teal", "Lavender", "Peach"]), ("Olive", "Warm", ["Emerald", "Rust", "Cream", "Burgundy"]), ("Dark", "Cool/Warm", ["Bright white", "Royal blue", "Orange", "Hot pink"])]
    var body: some View {
        List {
            ForEach(tones, id: \.0) { name, under, _ in
                Button { tone = name } label: { HStack { Text(name).font(.headline); Text(under).font(.caption).foregroundColor(.secondary); Spacer(); if tone == name { Image(systemName: "checkmark.circle.fill").foregroundColor(.accentColor) } } }.foregroundColor(.primary)
            }
            if !tone.isEmpty, let entry = tones.first(where: { $0.0 == tone }) {
                Section("Your palette 🎨") { ForEach(entry.2, id: \.self) { Text("• \($0)") } }
            }
        }.navigationTitle("Color Advisor")
    }
}

struct SizePredictorView: View {
    @State private var height = ""
    @State private var weight = ""
    @State private var predicted = false
    var body: some View {
        List {
            Section {
                TextField("Height (cm)", text: $height).keyboardType(.decimalPad)
                TextField("Weight (kg)", text: $weight).keyboardType(.decimalPad)
                Button("Predict my size") { predicted = true }.disabled(height.isEmpty || weight.isEmpty)
            }
            if predicted {
                Section("Your sizes 📏") { Text("• Top: M"); Text("• Bottom: 32"); Text("• Shoes: 9") }
            }
        }.navigationTitle("Size Predictor")
    }
}

struct DiscountStackView: View {
    @State private var price = ""
    @State private var picked: Set<String> = []
    let available = ["10% First User", "50 Coupon", "5% Card Offer", "20 Wallet"]
    var body: some View {
        let original = Double(price) ?? 0
        return List {
            Section {
                TextField("Price", text: $price).keyboardType(.decimalPad)
                ForEach(available, id: \.self) { d in
                    Button { if picked.contains(d) { picked.remove(d) } else { picked.insert(d) } } label: {
                        HStack { Text(d); Spacer(); if picked.contains(d) { Image(systemName: "checkmark.circle.fill").foregroundColor(.accentColor) } }
                    }.foregroundColor(.primary)
                }
            }
            Section {
                let f = calc(original: original, picked: picked)
                Text("You pay").font(.caption).foregroundColor(.secondary)
                Text("$\(f, specifier: "%.0f")").font(.largeTitle).foregroundColor(.accentColor)
                Text("You save $\(original - f, specifier: "%.0f")")
            }
        }.navigationTitle("Discount Stacking")
    }
    private func calc(original: Double, picked: Set<String>) -> Double {
        var final = original
        for d in picked {
            if d.contains("%") {
                let pct = Double(d.filter { $0.isNumber }) ?? 0
                final -= final * pct / 100
            } else {
                let amt = Double(d.filter { $0.isNumber }) ?? 0
                final = max(0, final - amt)
            }
        }
        return final.rounded()
    }
}

struct DealAuthView: View {
    @State private var url = ""
    @State private var result: Bool?
    @State private var checking = false
    var body: some View {
        List {
            Section {
                TextField("Deal URL", text: $url)
                Button(checking ? "Verifying…" : "Verify deal") {
                    checking = true
                    Task { try? await Task.sleep(nanoseconds: 800_000_000); result = Double.random(in: 0...1) > 0.3; checking = false }
                }.disabled(url.isEmpty || checking)
            }
            if let r = result {
                Section { Text(r ? "✅ Looks authentic" : "⚠️ Suspicious deal").font(.headline) }
            }
        }.navigationTitle("Deal Authenticity")
    }
}

struct SpecCompareView: View {
    let phones = [(name: "Phone A", price: "29999", specs: ["processor": "Snapdragon 8", "camera": "108MP", "battery": "5000mAh", "display": "6.7\" AMOLED"]), (name: "Phone B", price: "24999", specs: ["processor": "Dimensity 9000", "camera": "64MP", "battery": "4500mAh", "display": "6.5\" LCD"])]
    var body: some View {
        List {
            HStack(alignment: .top, spacing: 12) {
                ForEach(phones, id: \.name) { p in
                    VStack(alignment: .leading, spacing: 4) {
                        Text(p.name).font(.headline)
                        Text("$\(p.price)").font(.title3).foregroundColor(.accentColor)
                        ForEach(["processor", "camera", "battery", "display"], id: \.self) { k in Text("\(k): \(p.specs[k] ?? "")").font(.caption).foregroundColor(.secondary) }
                    }.frame(maxWidth: .infinity, alignment: .leading)
                }
            }
            Section { Text("Verdict 🏆").font(.headline).foregroundColor(.accentColor); Text("Phone A wins on camera and display; Phone B saves you $5000.").font(.subheadline) }
        }.navigationTitle("Spec Compare")
    }
}

// MARK: - Tools wave-4

struct SmsOrderView: View {
    @State private var phone = ""
    @State private var message = ""
    @State private var reply: String?
    @State private var sending = false
    var body: some View {
        List {
            Section {
                Text("Commands: SEARCH [item] · ORDER [id] · STATUS").font(.caption).foregroundColor(.secondary)
                TextField("Phone number", text: $phone)
                TextField("Message", text: $message, axis: .vertical)
                Button(sending ? "Sending…" : "Send") {
                    sending = true
                    Task { reply = await API.smsOrder(phone: phone, message: message) ?? "No reply — try again"; sending = false }
                }.disabled(phone.isEmpty || message.isEmpty || sending)
            }
            if let r = reply {
                Section { Text("Reply 📩").font(.headline).foregroundColor(.accentColor); Text(r) }
            }
        }.navigationTitle("SMS Order")
    }
}

struct ShopAutocompleteView: View {
    @State private var query = ""
    @State private var suggestions: [String] = []
    var body: some View {
        List {
            TextField("Start typing…", text: $query).onChange(of: query) { _, v in
                Task { suggestions = v.trimmingCharacters(in: .whitespaces).count < 2 ? [] : await API.shopAutocomplete(query: v) }
            }
            ForEach(suggestions, id: \.self) { s in
                NavigationLink(value: Route.search(s)) { Text(s) }
            }
        }.navigationTitle("Smart Suggestions")
    }
}

struct DocExpiryView: View {
    @State private var items: [TrackedDocument] = []
    @State private var type = ""
    @State private var number = ""
    @State private var expiry = ""
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else {
                List {
                    Section("Track a document") {
                        TextField("Type (NID, passport…)", text: $type)
                        TextField("Number", text: $number)
                        TextField("Expiry (YYYY-MM-DD)", text: $expiry)
                        Button("Track") {
                            Task { if await API.trackDocument(type: type, number: number, expiry: expiry) { items = await API.trackedDocuments(); type = ""; number = ""; expiry = "" } }
                        }.disabled(type.isEmpty || expiry.isEmpty)
                    }
                    ForEach(items) { d in
                        VStack(alignment: .leading) {
                            Text("\(d.kind) · \(d.ref)").font(.headline)
                            Text(d.daysUntil <= 60 ? "⏰ Expires in \(d.daysUntil) days" : "Valid · \(d.daysUntil) days left").font(.caption).foregroundColor(d.daysUntil <= 60 ? .red : .accentColor)
                        }
                    }
                }
            }
        }.navigationTitle("Document Expiry").task { items = await API.trackedDocuments(); loading = false }
    }
}

struct VehicleView: View {
    @State private var vehicles: [Vehicle] = []
    @State private var name = ""
    @State private var type = "car"
    @State private var lastService = ""
    @State private var odometer = ""
    @State private var result: [String: String] = [:]
    @State private var loading = true
    var body: some View {
        Group {
            if loading { ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity) }
            else {
                List {
                    Section("Add vehicle") {
                        TextField("Name", text: $name)
                        Picker("Type", selection: $type) { ForEach(["car", "bike", "bus"], id: \.self) { Text($0).tag($0) } }.pickerStyle(.segmented)
                        TextField("Last service (YYYY-MM-DD)", text: $lastService)
                        TextField("Odometer (km)", text: $odometer).keyboardType(.decimalPad)
                        Button("Add vehicle") {
                            Task { result = await API.addVehicle(name: name, type: type, lastService: lastService, odometer: odometer); vehicles = await API.vehicles() }
                        }.disabled(name.isEmpty)
                    }
                    if !result.isEmpty { Section { ForEach(result.sorted(by: { $0.key < $1.key }), id: \.key) { k, v in HStack { Text(k).foregroundColor(.secondary); Spacer(); Text(v).bold() } } } }
                    ForEach(vehicles) { v in
                        VStack(alignment: .leading) { Text(v.displayName).font(.headline); Text("\(v.kind) · \(v.status ?? "")").font(.caption).foregroundColor(.secondary) }
                    }
                }
            }
        }.navigationTitle("Vehicle Service").task { vehicles = await API.vehicles(); loading = false }
    }
}

struct LegalDocsView: View {
    @State private var type = "NDA"
    @State private var jurisdiction = ""
    @State private var parties = ""
    @State private var terms = ""
    @State private var result: [String: String] = [:]
    @State private var generating = false
    var body: some View {
        List {
            Section {
                Picker("Type", selection: $type) { ForEach(["NDA", "Contract", "Agreement"], id: \.self) { Text($0).tag($0) } }.pickerStyle(.segmented)
                TextField("Jurisdiction", text: $jurisdiction)
                TextField("Parties", text: $parties, axis: .vertical)
                TextField("Key terms", text: $terms, axis: .vertical)
                Button(generating ? "Generating…" : "Generate document") {
                    generating = true
                    Task { result = await API.legalGenerate(type: type, jurisdiction: jurisdiction, parties: parties, terms: terms); generating = false }
                }.disabled(generating)
            }
            if !result.isEmpty {
                Section { Text("Document ready 📄").font(.headline).foregroundColor(.accentColor); ForEach(result.sorted(by: { $0.key < $1.key }), id: \.key) { k, v in HStack { Text(k).foregroundColor(.secondary); Spacer(); Text(String(v.prefix(60))).bold() } } }
            }
        }.navigationTitle("Legal Documents")
    }
}

struct FormBuilderView: View {
    @State private var title = ""
    @State private var field = ""
    @State private var fields: [String] = []
    @State private var result: [String: String] = [:]
    @State private var creating = false
    var body: some View {
        List {
            Section {
                TextField("Form title", text: $title)
                HStack {
                    TextField("Field name", text: $field)
                    Button("+") { if !field.isEmpty { fields.append(field); field = "" } }.disabled(field.isEmpty)
                }
                ForEach(fields, id: \.self) { Text("• \($0)") }
                Button(creating ? "Creating…" : "Create form") {
                    creating = true
                    Task { result = await API.formCreate(title: title, fields: fields); creating = false }
                }.disabled(title.isEmpty || fields.isEmpty || creating)
            }
            if !result.isEmpty {
                Section { Text("Form live 🎉").font(.headline).foregroundColor(.accentColor); ForEach(result.sorted(by: { $0.key < $1.key }), id: \.key) { k, v in HStack { Text(k).foregroundColor(.secondary); Spacer(); Text(String(v.prefix(60))).bold() } } }
            }
        }.navigationTitle("Form Builder")
    }
}

struct ResumeBuilderView: View {
    @State private var template = "modern"
    @State private var name = ""
    @State private var summary = ""
    @State private var result: [String: String] = [:]
    @State private var generating = false
    var body: some View {
        List {
            Section {
                Picker("Template", selection: $template) { ForEach(["modern", "classic", "minimal"], id: \.self) { Text($0).tag($0) } }.pickerStyle(.segmented)
                TextField("Full name", text: $name)
                TextField("Professional summary", text: $summary, axis: .vertical)
                Button(generating ? "Generating…" : "Generate resume") {
                    generating = true
                    Task { result = await API.resumeGenerate(template: template, name: name, summary: summary); generating = false }
                }.disabled(name.isEmpty || generating)
            }
            if !result.isEmpty {
                Section { Text("Resume ready 📄").font(.headline).foregroundColor(.accentColor); ForEach(result.sorted(by: { $0.key < $1.key }), id: \.key) { k, v in HStack { Text(k).foregroundColor(.secondary); Spacer(); Text(String(v.prefix(60))).bold() } } }
            }
        }.navigationTitle("Resume Builder")
    }
}

struct InsuranceView: View {
    @State private var productId = ""
    @State private var issue = ""
    @State private var damage = "damaged"
    @State private var result: [String: String] = [:]
    @State private var filing = false
    var body: some View {
        List {
            Section {
                TextField("Product / Order ID", text: $productId)
                Picker("Damage", selection: $damage) { ForEach(["damaged", "lost", "defective"], id: \.self) { Text($0).tag($0) } }.pickerStyle(.segmented)
                TextField("What happened?", text: $issue, axis: .vertical)
                Button(filing ? "Filing…" : "File claim") {
                    filing = true
                    Task { result = await API.insuranceClaim(productId: productId, issue: issue, damageType: damage); filing = false }
                }.disabled(productId.isEmpty || filing)
            }
            if !result.isEmpty {
                Section { Text("Claim filed ✅").font(.headline).foregroundColor(.accentColor); ForEach(result.sorted(by: { $0.key < $1.key }), id: \.key) { k, v in HStack { Text(k).foregroundColor(.secondary); Spacer(); Text(String(v.prefix(80))).bold() } } }
            }
        }.navigationTitle("Insurance Claim")
    }
}
