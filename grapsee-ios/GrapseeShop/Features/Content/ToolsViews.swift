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
                    Section { Text("Total deductible").font(.caption).foregroundColor(.secondary); Text("$\(String(format: "%.2f", items.reduce(0) { $0 + $1.amount }))").font(.largeTitle).foregroundColor(.accentColor) }
                    ForEach(items) { d in
                        HStack { VStack(alignment: .leading) { Text(d.displayTitle).font(.headline); if let c = d.category { Text(c).font(.caption).foregroundColor(.secondary) } }; Spacer(); Text("$\(String(format: "%.2f", d.amount))").foregroundColor(.accentColor) }
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
                        Section("Monthly burn") { Text("$\(String(format: "%.2f", items.reduce(0) { $0 + $1.amount }))").font(.largeTitle).foregroundColor(.accentColor) }
                        ForEach(items) { s in
                            HStack {
                                VStack(alignment: .leading) { Text(s.name).font(.headline); Text("$\(String(format: "%.2f", s.amount)) · \(s.frequency ?? "")").font(.caption).foregroundColor(.secondary) }
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
            ForEach(Array(tones.enumerated()), id: \.offset) { _, t in let (name, under, _) = t
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
                Text("$\(String(format: "%.0f", f))").font(.largeTitle).foregroundColor(.accentColor)
                Text("You save $\(String(format: "%.0f", original - f))")
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

// MARK: - Tools wave-A

struct BodyTypeView: View {
    @State private var picked = ""
    let types = [("Hourglass", "Balanced shoulders and hips, defined waist"), ("Pear", "Hips wider than shoulders"), ("Apple", "Fuller midsection, slim legs"), ("Rectangle", "Straight silhouette, minimal waist"), ("Inverted Triangle", "Shoulders wider than hips")]
    var body: some View {
        List {
            ForEach(types, id: \.0) { name, desc in
                Button { picked = name } label: {
                    HStack { Text(picked == name ? "✅" : "○"); VStack(alignment: .leading) { Text(name).font(.headline); Text(desc).font(.caption).foregroundColor(.secondary) } }
                }.foregroundColor(.primary)
            }
            if !picked.isEmpty {
                Section("Recommended sizes for \(picked)") { Text("• Top: M"); Text("• Bottom: L"); Text("• Dress: M") }
            }
        }.navigationTitle("Body Type Guide")
    }
}

struct UseCaseMatcherView: View {
    @State private var step = 0
    @State private var answers: [String] = []
    let questions = [("What do you need?", ["Work", "Gaming", "Study", "Travel"]), ("Budget range?", ["Under 10k", "10-30k", "30-50k", "50k+"]), ("Brand preference?", ["Any", "Premium", "Value", "Local"])]
    let results = ["Work|10-30k|Any": ["Laptop A - Office ready", "Laptop B - Budget friendly"], "Gaming|30-50k|Premium": ["Gaming Laptop X", "Gaming PC Build Y"]]
    let fallback = ["Laptop General Purpose", "Desktop Starter"]
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
                    Text("🎯 Recommendations ready!").font(.headline).foregroundColor(.accentColor)
                    ForEach(results[answers.joined(separator: "|")] ?? fallback, id: \.self) { r in
                        NavigationLink(value: Route.search(r)) { Text(r) }
                    }
                    Button("Start over") { step = 0; answers = [] }
                }
            }
        }.navigationTitle("Use Case Matcher")
    }
}

struct WardrobePlannerView: View {
    @State private var items = [("White Shirt", "Top", true), ("Blue Jeans", "Bottom", true), ("Black Blazer", "Outer", false)]
    @State private var newItem = ""
    let combinations = ["White Shirt + Blue Jeans", "White Shirt + Black Blazer", "Blue Jeans + Black Blazer"]
    var body: some View {
        List {
            Section("Your wardrobe items") {
                HStack {
                    TextField("Add item (e.g. Red Dress)", text: $newItem)
                    Button("Add") { if !newItem.isEmpty { items.append((newItem, "Other", true)); newItem = "" } }.disabled(newItem.isEmpty)
                }
                ForEach(items.indices, id: \.self) { i in
                    Button { items[i].2.toggle() } label: {
                        HStack { Text(items[i].2 ? "☑" : "☐").foregroundColor(.accentColor); Text(items[i].0); Spacer(); Text(items[i].1).font(.caption).foregroundColor(.secondary) }
                    }.foregroundColor(.primary)
                }
            }
            Section("Suggested combinations ✨") { ForEach(combinations, id: \.self) { Text($0) } }
        }.navigationTitle("Wardrobe Planner")
    }
}

struct RevisionTokensView: View {
    @State private var tokens = 3
    @State private var buying = false
    @State private var bought: String?
    let packages = [(1, 499, "Single Token"), (3, 1299, "Triple Pack"), (5, 1999, "Value Pack")]
    var body: some View {
        List {
            Section("Wallet: \(tokens) tokens") {
                ForEach(packages, id: \.0) { qty, price, label in
                    HStack {
                        VStack(alignment: .leading) { Text(label).font(.headline); Text("\(qty) token\(qty > 1 ? "s" : "") · $\(price)").font(.caption).foregroundColor(.secondary) }
                        Spacer()
                        Button(buying ? "…" : "Buy") {
                            buying = true
                            Task { try? await Task.sleep(nanoseconds: 1_000_000_000); tokens += qty; buying = false; bought = "Added \(qty) tokens!" }
                        }.disabled(buying)
                    }
                }
                if let b = bought { Text("✅ \(b)").font(.caption).foregroundColor(.accentColor) }
            }
        }.navigationTitle("Revision Tokens")
    }
}

struct TrendForecasterView: View {
    @State private var season = "summer-2024"
    let seasons = ["summer-2024": [("Pastel Colors", "+45%", "rising"), ("Crochet Tops", "+32%", "hot"), ("Wide Leg Pants", "+28%", "stable")], "winter-2024": [("Oversized Coats", "+38%", "hot"), ("Chunky Boots", "+25%", "rising"), ("Turtlenecks", "+18%", "stable")]]
    var body: some View {
        List {
            Picker("Season", selection: $season) { ForEach(Array(seasons.keys).sorted(), id: \.self) { Text($0.replacingOccurrences(of: "-", with: " ").uppercased()).tag($0) } }.pickerStyle(.segmented)
            ForEach(seasons[season] ?? [], id: \.0) { name, growth, status in
                HStack { VStack(alignment: .leading) { Text(name).font(.headline); Text(status).font(.caption).foregroundColor(.secondary) }; Spacer(); Text(growth).font(.headline).foregroundColor(.accentColor) }
            }
        }.navigationTitle("Trend Forecaster")
    }
}

struct EventStylistView: View {
    @State private var event = ""
    let looks = ["wedding": ("Traditional Kurta + Nehru Jacket", ["Pocket Square", "Ethnic Watch", "Kolhapuris"], ["Navy", "Maroon", "Cream"]), "office-party": ("Blazer + Chinos + Shirt", ["Tie", "Leather Belt", "Formal Shoes"], ["Charcoal", "Burgundy", "White"]), "casual-brunch": ("Polo + Denim + Sneakers", ["Sunglasses", "Watch", "Canvas Bag"], ["Pastel Blue", "White", "Khaki"])]
    var body: some View {
        List {
            Section("Select occasion") {
                ForEach(Array(looks.keys).sorted(), id: \.self) { key in
                    Button { event = key } label: { HStack { Text(key.replacingOccurrences(of: "-", with: " ").capitalized); Spacer(); if event == key { Image(systemName: "checkmark.circle.fill").foregroundColor(.accentColor) } } }.foregroundColor(.primary)
                }
            }
            if let look = looks[event] {
                Section {
                    Text("👔 \(look.0)").font(.headline).foregroundColor(.accentColor)
                    Text("Accessories: \(look.1.joined(separator: ", "))")
                    Text("Colors: \(look.2.joined(separator: ", "))")
                }
            }
        }.navigationTitle("Event Stylist")
    }
}

// MARK: - Tools wave-B

struct AiScoperView: View {
    @State private var description = ""
    @State private var generating = false
    @State private var done = false
    var body: some View {
        List {
            Section {
                TextField("Describe your project", text: $description, axis: .vertical)
                Button(generating ? "Generating…" : "Generate scope") {
                    generating = true
                    Task { try? await Task.sleep(nanoseconds: 2_000_000_000); generating = false; done = true }
                }.disabled(description.isEmpty || generating)
            }
            if done {
                Section {
                    Text("📄 Project Scope Document").font(.headline).foregroundColor(.accentColor)
                    ForEach(["User authentication system", "Dashboard with analytics", "Payment integration", "Mobile-responsive design", "SEO optimization"], id: \.self) { Text("• \($0)") }
                    Text("Timeline: 14-18 days · $14999").font(.headline)
                    Text("Next.js · React · Node.js · PostgreSQL · Stripe").font(.caption).foregroundColor(.secondary)
                }
            }
        }.navigationTitle("AI Project Scoper")
    }
}

struct AiCompetitorView: View {
    @State private var url = ""
    @State private var analyzing = false
    @State private var done = false
    var body: some View {
        List {
            Section {
                TextField("Competitor URL", text: $url)
                Button(analyzing ? "Analyzing…" : "Analyze") {
                    analyzing = true
                    Task { try? await Task.sleep(nanoseconds: 2_500_000_000); analyzing = false; done = true }
                }.disabled(url.isEmpty || analyzing)
            }
            if done {
                Section { Text("✅ Strengths").font(.headline).foregroundColor(.accentColor); ForEach(["Fast loading speed", "Mobile responsive", "Clear call-to-actions"], id: \.self) { Text("• \($0)") } }
                Section { Text("⚠️ Weaknesses").font(.headline).foregroundColor(.red); ForEach(["No blog content", "Poor SEO optimization", "Missing social proof", "No live chat"], id: \.self) { Text("• \($0)") } }
                Section { Text("🚀 Opportunities").font(.headline).foregroundColor(.accentColor); ForEach(["Content marketing gap", "Local SEO not optimized", "No video content", "Missing FAQ section"], id: \.self) { Text("• \($0)") } }
            }
        }.navigationTitle("AI Competitor Analysis")
    }
}

struct AiPreviewView: View {
    @State private var businessName = ""
    @State private var industry = "restaurant"
    @State private var generating = false
    @State private var done = false
    var price: Int { industry == "restaurant" ? 6999 : industry == "clinic" ? 8999 : 4999 }
    var body: some View {
        List {
            Section {
                TextField("Business name", text: $businessName)
                Picker("Industry", selection: $industry) { ForEach(["restaurant", "clinic", "shop"], id: \.self) { Text($0).tag($0) } }.pickerStyle(.segmented)
                Button(generating ? "Generating…" : "Generate preview") {
                    generating = true
                    Task { try? await Task.sleep(nanoseconds: 2_000_000_000); generating = false; done = true }
                }.disabled(businessName.isEmpty || generating)
            }
            if done {
                Section {
                    Text("🎨 Preview for \(businessName)").font(.headline).foregroundColor(.accentColor)
                    Text("Palette: #3B82F6 · #10B981 · #F59E0B")
                    ForEach(["Hero section", "Services grid", "Testimonials", "Contact form"], id: \.self) { Text("• \($0)") }
                    Text("Estimated price: $\(price)").font(.headline)
                }
            }
        }.navigationTitle("AI Design Preview")
    }
}

struct AiProposalView: View {
    @State private var generating = false
    @State private var done = false
    var body: some View {
        List {
            Section {
                Text("E-commerce Website Development · $24999 · 21 days").font(.subheadline).foregroundColor(.secondary)
                Button(generating ? "Generating…" : "Generate proposal") {
                    generating = true
                    Task { try? await Task.sleep(nanoseconds: 2_000_000_000); generating = false; done = true }
                }.disabled(generating)
            }
            if done {
                Section {
                    Text("📝 Proposal ready").font(.headline).foregroundColor(.accentColor)
                    Text("A modern, responsive e-commerce platform with payment integration, inventory management, and customer dashboard.")
                    ForEach(["Custom website design", "Mobile-responsive layout", "Payment gateway integration", "Admin dashboard", "SEO optimization", "3 months support"], id: \.self) { Text("• \($0)") }
                    Text("Timeline: 21 days · Total: $24999").font(.headline)
                }
            }
        }.navigationTitle("AI Proposal")
    }
}

struct FreeAuditView: View {
    @State private var url = ""
    @State private var scanning = false
    @State private var done = false
    var body: some View {
        List {
            Section {
                TextField("Website URL", text: $url)
                Button(scanning ? "Scanning…" : "Run free audit") {
                    scanning = true
                    Task { try? await Task.sleep(nanoseconds: 2_000_000_000); scanning = false; done = true }
                }.disabled(url.isEmpty || scanning)
            }
            if done {
                Section {
                    Text("Overall: 67/100").font(.title2).foregroundColor(.accentColor)
                    ForEach([("Speed", 72), ("SEO", 85), ("Mobile", 90), ("Security", 45), ("Design", 60)], id: \.0) { name, score in
                        HStack { Text(name); Spacer(); Text("\(score)").bold() }
                    }
                }
            }
        }.navigationTitle("Free Audit")
    }
}

struct QualityCertificateView: View {
    var body: some View {
        List {
            Section {
                ForEach([("Code Quality", 95), ("Security Scan", 88), ("Performance", 94), ("Accessibility", 91), ("SEO", 89), ("Test Coverage", 87)], id: \.0) { name, score in
                    HStack { Text("\(name) ✅"); Spacer(); Text("\(score)").bold() }
                }
                Text("0 vulnerabilities · 87% coverage · 12,450 lines").font(.caption).foregroundColor(.secondary)
            }
        }.navigationTitle("Quality Certificate")
    }
}

struct PortfolioProofView: View {
    let projects = [("TechStart SaaS Platform", "Next.js · Node.js · PostgreSQL · 21 days · ⭐ 5", "12K/mo visitors · 99.9% uptime"), ("Fashion E-commerce", "React · Stripe · MongoDB · 14 days · ⭐ 5", "verified seller")]
    var body: some View {
        List(projects, id: \.0) { name, tech, metrics in
            VStack(alignment: .leading, spacing: 4) {
                Text("✅ \(name)").font(.headline)
                Text(tech).font(.caption).foregroundColor(.secondary)
                Text(metrics).font(.caption).foregroundColor(.accentColor)
            }.padding(.vertical, 4)
        }.navigationTitle("Portfolio Proof")
    }
}

struct CaseStudiesView: View {
    let cases = [("TechStart Inc. · SaaS · $24999", "3x user engagement increase · traffic +180% · conversion +45% · revenue +220%", "Grapsee delivered exactly what we needed, on time and on budget."), ("Fashion Boutique · E-commerce · $12999", "Online sales launched in 2 weeks · traffic +250% · conversion +60% · revenue +300%", "Our online store paid for itself in the first month.")]
    var body: some View {
        List(cases, id: \.0) { title, results, quote in
            VStack(alignment: .leading, spacing: 4) {
                Text("📈 \(title)").font(.headline)
                Text(results).font(.subheadline).foregroundColor(.accentColor)
                Text("\"\(quote)\"").font(.caption).foregroundColor(.secondary)
            }.padding(.vertical, 4)
        }.navigationTitle("Case Studies")
    }
}

// MARK: - Tools wave-C

struct EmergencyQuickBuyView: View {
    let items = [("Baby Diapers", "Critical", "30 min", 350), ("Medicine", "Urgent", "1 hour", 120), ("Phone Charger", "High", "2 hours", 299), ("Toilet Paper", "High", "2 hours", 80)]
    var body: some View {
        List(items, id: \.0) { name, urgency, delivery, price in
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(name).font(.headline)
                    Text("\(urgency) · delivers in \(delivery)").font(.caption).foregroundColor(.red)
                    Text("\(price)").font(.headline).foregroundColor(.accentColor)
                }
                Spacer()
                Button("Order") {}
            }.padding(.vertical, 4)
        }.navigationTitle("Emergency Quick Buy")
    }
}

struct ClipboardPurchaseView: View {
    @State private var detected = false
    var body: some View {
        Group {
            if !detected {
                VStack(spacing: 12) {
                    ProgressView()
                    Text("Monitoring clipboard for product names…").foregroundColor(.secondary)
                }.onAppear {
                    Task { try? await Task.sleep(nanoseconds: 2_000_000_000); detected = true }
                }
            } else {
                List {
                    Section {
                        Text("Detected from clipboard").font(.caption).foregroundColor(.accentColor)
                        Text("Wireless Earbuds").font(.title2)
                        Text("1299").font(.title).foregroundColor(.accentColor)
                        Button("Buy Now") {}
                    }
                }
            }
        }.navigationTitle("Clipboard Purchase")
    }
}

struct FlashbackDealsView: View {
    let deals = [("Air Fryer", 2999, 4999, "Last Diwali"), ("Bluetooth Speaker", 999, 1999, "Last Christmas"), ("Running Shoes", 1499, 2999, "Independence Day")]
    var body: some View {
        List(deals, id: \.0) { name, price, oldPrice, date in
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(date).font(.caption).foregroundColor(.secondary)
                    Text(name).font(.headline)
                    HStack {
                        Text("\(price)").font(.headline).foregroundColor(.accentColor)
                        Text("\(oldPrice)").font(.subheadline).strikethrough().foregroundColor(.secondary)
                    }
                    Text("You save \(oldPrice - price)").font(.caption).foregroundColor(.accentColor)
                }
                Spacer()
                Button("Add") {}
            }.padding(.vertical, 4)
        }.navigationTitle("Flashback Deals")
    }
}

struct ExpiryGuaranteeView: View {
    var body: some View {
        List {
            Section {
                Text("🛡️ Your Protection").font(.headline).foregroundColor(.accentColor)
                ForEach(["Free replacement if product has less than 6 months expiry", "No questions asked, doorstep pickup", "Refund within 48 hours of claim"], id: \.self) { Text("• \($0)") }
                Button("Claim replacement") {}
            }
        }.navigationTitle("Expiry Guarantee")
    }
}

struct PriceGuaranteeView: View {
    @State private var productUrl = ""
    @State private var competitorUrl = ""
    @State private var competitorPrice = ""
    @State private var claims = [("Bluetooth Speaker", "under review", "2 days ago", 350), ("USB-C Hub", "refunded", "1 week ago", 150)]
    let stories = [("Sarah M. · Wireless Earbuds", "Saved 450", "Found a lower price and got refunded within 48 hours!"), ("James K. · Smart Watch", "Saved 1200", "The guarantee saved me big. Process was super smooth."), ("Priya R. · Laptop Stand", "Saved 300", "Submitted my claim and got approved the same day.")]
    var body: some View {
        List {
            Section {
                TextField("Our product URL", text: $productUrl)
                TextField("Competitor URL", text: $competitorUrl)
                TextField("Competitor price", text: $competitorPrice).keyboardType(.numberPad)
                Button("Submit claim") {
                    guard !productUrl.isEmpty, !competitorUrl.isEmpty, !competitorPrice.isEmpty else { return }
                    claims.insert((String(productUrl.prefix(24)), "submitted", "just now", Int(competitorPrice) ?? 0), at: 0)
                    productUrl = ""; competitorUrl = ""; competitorPrice = ""
                }
            }
            Section("My claims") {
                ForEach(claims, id: \.0) { name, status, date, refund in
                    HStack {
                        VStack(alignment: .leading) {
                            Text(name).font(.headline)
                            Text("\(status) · \(date)").font(.caption).foregroundColor(.secondary)
                        }
                        Spacer()
                        Text("+\(refund)").font(.headline).foregroundColor(.accentColor)
                    }
                }
            }
            Section("Success stories") {
                ForEach(stories, id: \.0) { who, saved, story in
                    VStack(alignment: .leading, spacing: 2) {
                        Text("⭐ \(who) — \(saved)").font(.headline)
                        Text("\"\(story)\"").font(.caption).foregroundColor(.secondary)
                    }.padding(.vertical, 2)
                }
            }
        }.navigationTitle("Price Guarantee")
    }
}

struct SmartUpsellView: View {
    let recs = [("SEO Setup", 1999, 999, "98% buy this"), ("Logo Design", 2499, 1499, "Popular add-on"), ("Content Writing", 2999, 1999, "Saves 3 days")]
    @State private var selected: Set<String> = []
    var total: Int { recs.filter { selected.contains($0.0) }.map { $0.2 }.reduce(0, +) }
    var savings: Int { recs.filter { selected.contains($0.0) }.map { $0.1 - $0.2 }.reduce(0, +) }
    var body: some View {
        List {
            Section { Text("In cart: Website Development — 9999").font(.headline) }
            Section {
                ForEach(recs, id: \.0) { name, price, bundle, stat in
                    HStack {
                        Button(action: {
                            if selected.contains(name) { selected.remove(name) } else { selected.insert(name) }
                        }) { Image(systemName: selected.contains(name) ? "checkmark.square.fill" : "square") }
                        VStack(alignment: .leading) {
                            Text(name).font(.headline)
                            Text(stat).font(.caption).foregroundColor(.accentColor)
                            Text("\(bundle) (was \(price))").font(.subheadline)
                        }
                    }
                }
            }
            Section {
                Text("Bundle total: \(total) · You save \(savings)").font(.headline).foregroundColor(.accentColor)
                Button("Add bundle") {}.disabled(selected.isEmpty)
            }
        }.navigationTitle("Smart Upsell")
    }
}

struct StudentBudgetView: View {
    @State private var budget = ""
    @State private var spent = ""
    var budgetAmt: Double { Double(budget) ?? 0 }
    var spentAmt: Double { Double(spent) ?? 0 }
    var body: some View {
        List {
            Section("Your Budget") {
                TextField("Monthly Budget (2000)", text: $budget).keyboardType(.numberPad)
                TextField("Amount Spent (1200)", text: $spent).keyboardType(.numberPad)
            }
            if budgetAmt > 0 {
                Section {
                    HStack {
                        Text("Remaining")
                        Spacer()
                        Text("\(Int(budgetAmt - spentAmt))").font(.title2).foregroundColor(.accentColor)
                    }
                    ProgressView(value: min(spentAmt / budgetAmt, 1.0))
                }
            }
        }.navigationTitle("Student Budget")
    }
}

struct SubscriptionExpiryView: View {
    @State private var subs = [("Netflix", "2024-12-15", "active"), ("Spotify", "2024-11-30", "expiring")]
    @State private var newName = ""
    @State private var newDate = ""
    var body: some View {
        List {
            Section {
                ForEach(subs, id: \.0) { name, date, status in
                    HStack {
                        VStack(alignment: .leading) {
                            Text(name).font(.headline)
                            Text("Expires \(date)").font(.caption).foregroundColor(.secondary)
                        }
                        Spacer()
                        Text(status).foregroundColor(status == "expiring" ? .red : .accentColor)
                    }
                }
            }
            Section("Add") {
                TextField("Service name", text: $newName)
                TextField("Expiry date (YYYY-MM-DD)", text: $newDate)
                Button("Add subscription") {
                    guard !newName.isEmpty, !newDate.isEmpty else { return }
                    subs.append((newName, newDate, "active"))
                    newName = ""; newDate = ""
                }
            }
        }.navigationTitle("Subscription Expiry")
    }
}

struct AlternativeFinderView: View {
    @State private var searching = false
    @State private var alternatives: [(String, Int, Int, Bool)] = []
    var body: some View {
        List {
            Section {
                Text("Looking for alternatives to: Brand X Shirt (1,199)").font(.subheadline).foregroundColor(.secondary)
                Button(searching ? "Finding…" : "Find Alternatives") {
                    searching = true
                    Task {
                        try? await Task.sleep(nanoseconds: 1_500_000_000)
                        alternatives = [("Brand Y Shirt", 899, 95, true), ("Brand Z Shirt", 999, 90, true), ("Brand W Shirt", 799, 85, false)]
                        searching = false
                    }
                }.disabled(searching)
            }
            ForEach(alternatives, id: \.0) { name, price, match, available in
                HStack {
                    VStack(alignment: .leading) {
                        Text("\(name) · \(match)% match").font(.headline)
                        Text(available ? "In Stock" : "Out of stock").font(.caption).foregroundColor(available ? .accentColor : .red)
                        Text("\(price)").font(.subheadline)
                    }
                    Spacer()
                    if available { Button("Add") {} }
                }
            }
        }.navigationTitle("Alternative Finder")
    }
}

struct AssemblyFinderView: View {
    @State private var search = ""
    let techs = [("Rahul Kumar", 4.8, 234, 299), ("Amit Singh", 4.9, 189, 349), ("Vikram Patel", 4.7, 312, 279)]
    var filtered: [(String, Double, Int, Int)] { search.isEmpty ? techs : techs.filter { $0.0.localizedCaseInsensitiveContains(search) } }
    var body: some View {
        List {
            Section { TextField("Search technicians", text: $search) }
            ForEach(filtered, id: \.0) { name, rating, jobs, price in
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("🔧 \(name)").font(.headline)
                        Text(String(format: "⭐ %.1f · %d jobs", rating, jobs)).font(.caption).foregroundColor(.secondary)
                        Text("\(price) visit").font(.subheadline).foregroundColor(.accentColor)
                    }
                    Spacer()
                    Button("Book") {}
                }.padding(.vertical, 4)
            }
        }.navigationTitle("Assembly Finder")
    }
}

// MARK: - Tools wave-D

struct AutoCouponView: View {
    @State private var loading = true
    @State private var coupons = [(String, String)]()
    var body: some View {
        Group {
            if loading {
                VStack(spacing: 12) { ProgressView(); Text("Finding coupons…").foregroundColor(.secondary) }
                    .onAppear { Task { try? await Task.sleep(nanoseconds: 1_200_000_000); coupons = [("WELCOME10", "10% off your first order"), ("FLAT500", "Flat 500 off above 4999"), ("FREESHIP", "Free express shipping")]; loading = false } }
            } else {
                List {
                    if let best = coupons.first {
                        Section {
                            Text("🏆 Best for cart (5000): \(best.0)").font(.headline).foregroundColor(.accentColor)
                            Text(best.1)
                            Button("Copy \(best.0)") {}
                        }
                    }
                    ForEach(coupons, id: \.0) { code, desc in
                        HStack {
                            VStack(alignment: .leading) { Text(code).font(.headline); Text(desc).font(.caption).foregroundColor(.secondary) }
                            Spacer()
                            Button("Copy") {}
                        }
                    }
                }
            }
        }.navigationTitle("Auto Coupon")
    }
}

struct BulkBuyView: View {
    @State private var productId = ""
    @State private var targetPrice = ""
    @State private var quantity = 5
    @State private var loading = false
    @State private var sent = false
    var body: some View {
        List {
            Section {
                TextField("Product name or ID", text: $productId)
                TextField("Target price per unit", text: $targetPrice).keyboardType(.numberPad)
                Text("Quantity: \(quantity)")
                HStack { ForEach([5, 10, 25, 100], id: \.self) { q in Button("\(q)") { quantity = q } } }
                Button(loading ? "Sending…" : "Send request") {
                    loading = true
                    Task { try? await Task.sleep(nanoseconds: 1_200_000_000); loading = false; sent = true }
                }.disabled(productId.isEmpty || loading)
            }
            if sent {
                Section {
                    Text("✅ Request live — sellers are bidding").font(.headline).foregroundColor(.accentColor)
                    Text("You will be notified when a seller beats your target.")
                }
            }
        }.navigationTitle("Bulk Buy")
    }
}

struct OneClickReorderView: View {
    let lines = [("Wireless Earbuds", 1299), ("Phone Case", 499)]
    @State private var placing = false
    @State private var done = false
    var body: some View {
        List {
            ForEach(lines, id: \.0) { name, price in
                HStack { Text(name).font(.headline); Spacer(); Text("\(price)").foregroundColor(.accentColor) }
            }
            Section {
                Button(placing ? "Adding…" : "Reorder all (\(lines.count))") {
                    placing = true
                    Task { try? await Task.sleep(nanoseconds: 800_000_000); placing = false; done = true }
                }.disabled(placing)
                if done { Text("✅ \(lines.count) items added to cart!").foregroundColor(.accentColor) }
            }
        }.navigationTitle("One-Click Reorder")
    }
}

struct PriceDropRefundView: View {
    @State private var claimed: Set<String> = []
    let refunds = [("Bluetooth Speaker", "ORD-1042", 350), ("Running Shoes", "ORD-1038", 200)]
    var body: some View {
        List(refunds, id: \.1) { name, orderId, drop in
            HStack {
                VStack(alignment: .leading) {
                    Text(name).font(.headline)
                    Text("\(orderId) · dropped \(drop)").font(.caption).foregroundColor(.secondary)
                }
                Spacer()
                if claimed.contains(orderId) { Text("Claimed ✅").foregroundColor(.accentColor) }
                else { Button("Claim \(drop)") { claimed.insert(orderId) } }
            }.padding(.vertical, 4)
        }.navigationTitle("Price-Drop Refunds")
    }
}

struct GroceryImportView: View {
    @State private var raw = ""
    @State private var importing = false
    @State private var items: [(String, Int)] = []
    let catalog = ["milk": 60, "eggs": 90, "bread": 45, "rice": 120, "atta": 210, "sugar": 50, "tea": 140, "coffee": 220]
    var body: some View {
        List {
            Section {
                TextField("Paste your list (one item per line)", text: $raw, axis: .vertical)
                Button(importing ? "Matching…" : "Import list") {
                    importing = true
                    Task {
                        try? await Task.sleep(nanoseconds: 1_000_000_000)
                        items = raw.components(separatedBy: .newlines).map { $0.trimmingCharacters(in: .whitespaces).lowercased() }.filter { !$0.isEmpty }.map { line in (line, catalog.first(where: { line.contains($0.key) })?.value ?? 99) }
                        importing = false
                    }
                }.disabled(raw.isEmpty || importing)
            }
            ForEach(items, id: \.0) { name, price in
                HStack { Text(name); Spacer(); Text("\(price)").foregroundColor(.accentColor) }
            }
            if !items.isEmpty {
                Section { Button("Add All to Cart (\(items.map { $0.1 }.reduce(0, +)))") {} }
            }
        }.navigationTitle("Grocery List Import")
    }
}

struct RecipeToCartView: View {
    @State private var url = ""
    @State private var servings = 4
    @State private var loading = false
    @State private var ingredients: [(String, String)] = []
    var body: some View {
        List {
            Section {
                TextField("Recipe URL", text: $url)
                Picker("Servings", selection: $servings) { ForEach([2, 4, 6, 8], id: \.self) { Text("\($0)").tag($0) } }.pickerStyle(.segmented)
                Button(loading ? "Converting…" : "Convert for \(servings) servings") {
                    loading = true
                    Task {
                        try? await Task.sleep(nanoseconds: 1_200_000_000)
                        let scale = Double(servings) / 4.0
                        ingredients = [("Basmati Rice", "\(Int(500 * scale)) g"), ("Chicken", "\(Int(750 * scale)) g"), ("Onions", "\(Int(3 * scale)) pcs"), ("Biryani Masala", "\(Int(2 * scale)) tbsp"), ("Curd", "\(Int(250 * scale)) g")]
                        loading = false
                    }
                }.disabled(url.isEmpty || loading)
            }
            ForEach(ingredients, id: \.0) { name, qty in
                HStack { Text(name); Spacer(); Text(qty).foregroundColor(.accentColor) }
            }
        }.navigationTitle("Recipe to Cart")
    }
}

struct PetSuppliesView: View {
    @State private var petType = "dog"
    @State private var autoPilot = false
    @State private var loading = false
    var body: some View {
        List {
            Section {
                Picker("Pet", selection: $petType) {
                    Text("🐶 Dog").tag("dog")
                    Text("🐱 Cat").tag("cat")
                }.pickerStyle(.segmented)
                ForEach(["Monthly food pack", "Treats rotation", "Grooming essentials", "Toy of the month"], id: \.self) { Text("• \($0)") }
                Button(autoPilot ? "Auto-Pilot ON ✅" : loading ? "Setting up…" : "Enable Auto-Pilot") {
                    loading = true
                    Task { try? await Task.sleep(nanoseconds: 1_000_000_000); loading = false; autoPilot = true }
                }.disabled(loading || autoPilot)
            }
        }.navigationTitle("Pet Supplies")
    }
}

struct SchoolSuppliesView: View {
    @State private var grade = "5"
    @State private var items: [(Int, String, Int, Bool)] = []
    let kit = [(1, "Notebook set (6 pcs)", 240), (2, "Geometry box", 150), (3, "Crayons 24 shades", 120), (4, "School bag", 899), (5, "Water bottle", 299), (6, "Lunch box", 349)]
    var body: some View {
        List {
            Section {
                TextField("Grade/Class", text: $grade).keyboardType(.numberPad)
                Button("Generate list") {
                    Task {
                        try? await Task.sleep(nanoseconds: 1_000_000_000)
                        items = kit.map { ($0.0, $0.1, $0.2, true) }
                    }
                }
            }
            ForEach(items, id: \.0) { id, name, price, checked in
                HStack {
                    Button(action: {
                        if let i = items.firstIndex(where: { $0.0 == id }) { items[i].3.toggle() }
                    }) { Image(systemName: checked ? "checkmark.square.fill" : "square") }
                    Text(name)
                    Spacer()
                    Text("\(price)").foregroundColor(.accentColor)
                }
            }
            if !items.isEmpty {
                Section { Button("Add checked to cart") {} }
            }
        }.navigationTitle("School Supply Kit")
    }
}

struct MovingKitView: View {
    @State private var houseSize = "2bhk"
    @State private var items: [(Int, String, Int, Bool)] = []
    var body: some View {
        List {
            Section {
                Picker("House", selection: $houseSize) { ForEach(["1bhk", "2bhk", "3bhk", "4bhk+"], id: \.self) { Text($0).tag($0) } }.pickerStyle(.segmented)
                Button("Generate kit") {
                    Task {
                        try? await Task.sleep(nanoseconds: 1_000_000_000)
                        let mult = houseSize == "1bhk" ? 1 : houseSize == "2bhk" ? 2 : houseSize == "3bhk" ? 3 : 4
                        items = [(1, "Carton boxes (\(mult * 10) pcs)", mult * 300, true), (2, "Bubble wrap (\(mult * 2) rolls)", mult * 180, true), (3, "Packing tape (\(mult * 3) pcs)", mult * 60, true), (4, "Markers + labels set", 120, true), (5, "Mattress cover", 250, true)]
                    }
                }
            }
            ForEach(items, id: \.0) { id, name, price, checked in
                HStack {
                    Button(action: {
                        if let i = items.firstIndex(where: { $0.0 == id }) { items[i].3.toggle() }
                    }) { Image(systemName: checked ? "checkmark.square.fill" : "square") }
                    Text(name)
                    Spacer()
                    Text("\(price)").foregroundColor(.accentColor)
                }
            }
            if !items.isEmpty {
                Section { Button("Add checked to cart") {} }
            }
        }.navigationTitle("Moving House Kit")
    }
}

struct ApplianceRepairView: View {
    @State private var applianceType = ""
    @State private var problem = ""
    @State private var loading = false
    @State private var found = false
    let techs = [("Rahul Kumar", 4.8, 234, 299), ("Amit Singh", 4.9, 189, 349), ("Vikram Patel", 4.7, 312, 279)]
    var body: some View {
        List {
            Section {
                HStack { ForEach(["AC", "Fridge", "Washing Machine", "TV"], id: \.self) { t in Button(t) { applianceType = t }.buttonStyle(.borderedProminent).tint(applianceType == t ? .accentColor : .gray) } }
                TextField("Describe the problem", text: $problem)
                Button(loading ? "Finding…" : "Find technicians") {
                    guard !applianceType.isEmpty, !problem.isEmpty else { return }
                    loading = true
                    Task { try? await Task.sleep(nanoseconds: 1_000_000_000); loading = false; found = true }
                }.disabled(loading)
            }
            if found {
                ForEach(techs, id: \.0) { name, rating, jobs, price in
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("🔧 \(name)").font(.headline)
                            Text(String(format: "⭐ %.1f · %d jobs · %d visit", rating, jobs, price)).font(.caption).foregroundColor(.secondary)
                        }
                        Spacer()
                        Button("Book") {}
                    }.padding(.vertical, 4)
                }
            }
        }.navigationTitle("Appliance Repair")
    }
}

struct SafetyRecallView: View {
    @State private var productId = ""
    @State private var checked = false
    @State private var safe = true
    var body: some View {
        List {
            Section {
                TextField("Product ID / model", text: $productId)
                Button("Check recall") {
                    let id = productId.trimmingCharacters(in: .whitespaces).lowercased()
                    safe = !(id.contains("x100") || id.hasSuffix("007"))
                    checked = true
                }.disabled(productId.isEmpty)
            }
            if checked {
                Section {
                    Text(safe ? "✅ Product is safe" : "⚠️ Recalled — stop use").font(.headline).foregroundColor(safe ? .accentColor : .red)
                    Text(safe ? "No active recalls for this model." : "Contact support for a free replacement or refund.")
                }
            }
        }.navigationTitle("Safety Recall Check")
    }
}

struct VerifiedPhotosView: View {
    let photos = [("Rahul M.", true, 24, "iPhone 15"), ("Priya K.", true, 18, "Samsung S24"), ("Amit S.", false, 5, "OnePlus 12")]
    var body: some View {
        List {
            Section {
                Text("Only verified buyers can upload").font(.caption).foregroundColor(.secondary)
                Button("Upload Photo") {}
            }
            ForEach(photos, id: \.0) { user, verified, likes, product in
                VStack(alignment: .leading, spacing: 2) {
                    Text("\(product) \(verified ? "✅" : "")").font(.headline)
                    Text("\(user) · ❤ \(likes)").font(.caption).foregroundColor(.secondary)
                }.padding(.vertical, 4)
            }
        }.navigationTitle("Verified Photos")
    }
}
