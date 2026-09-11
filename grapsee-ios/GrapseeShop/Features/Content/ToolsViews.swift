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

// MARK: - Tools wave-E

struct ChildGrowthView: View {
    @State private var ageMonths = ""
    @State private var height = ""
    @State private var weight = ""
    let recs = [("0-6 months", ["Diapers", "Baby wipes", "Feeding bottles"]), ("6-12 months", ["Solid foods", "Baby toys", "Crawling mats"]), ("1-2 years", ["Walker", "Building blocks", "Story books"])]
    var current: (String, [String]) {
        let years = (Int(ageMonths) ?? 6) / 12
        return recs.first(where: { $0.0.contains("\(years)") }) ?? recs[0]
    }
    var body: some View {
        List {
            Section {
                TextField("Age (months)", text: $ageMonths).keyboardType(.numberPad)
                TextField("Height (cm)", text: $height).keyboardType(.numberPad)
                TextField("Weight (kg)", text: $weight).keyboardType(.numberPad)
            }
            Section {
                Text("👶 Age group: \(current.0)").font(.headline).foregroundColor(.accentColor)
                ForEach(current.1, id: \.self) { Text("• \($0)") }
                Text("Next: next size diapers + teething toys").font(.caption).foregroundColor(.secondary)
            }
        }.navigationTitle("Child Growth Tracker")
    }
}

struct DiabeticScannerView: View {
    @State private var food = ""
    @State private var scanning = false
    @State private var result: (String, String, String)?
    var body: some View {
        List {
            Section {
                TextField("Food name (e.g. apple, cake, oats)", text: $food)
                Button(scanning ? "Scanning…" : "Scan food") {
                    scanning = true
                    Task {
                        try? await Task.sleep(nanoseconds: 1_500_000_000)
                        let low = food.lowercased()
                        if low.contains("apple") || low.contains("oat") || low.contains("dal") || low.contains("salad") {
                            result = ("GOOD", "🟢", "Low glycemic impact, safe in normal portions.")
                        } else if low.contains("cake") || low.contains("cola") || low.contains("sugar") || low.contains("candy") {
                            result = ("AVOID", "🔴", "High sugar spike — skip or take a tiny portion.")
                        } else {
                            result = ("MODERATE", "🟡", "OK in small portions with protein or fibre.")
                        }
                        scanning = false
                    }
                }.disabled(food.isEmpty || scanning)
            }
            if let r = result {
                Section {
                    Text("\(r.1) \(r.0)").font(.title2).foregroundColor(r.0 == "AVOID" ? .red : .accentColor)
                    Text(food).font(.headline)
                    Text(r.2)
                }
            }
        }.navigationTitle("Diabetic Scanner")
    }
}

struct IngredientScannerView: View {
    @State private var product = ""
    @State private var scanning = false
    @State private var done = false
    let ingredients = [("Sugar", "high"), ("Palm Oil", "moderate"), ("Whole Wheat", "safe"), ("Preservative E202", "moderate")]
    var body: some View {
        List {
            Section {
                TextField("Product name", text: $product)
                Button(scanning ? "Scanning…" : "Scan product") {
                    scanning = true
                    Task { try? await Task.sleep(nanoseconds: 1_500_000_000); scanning = false; done = true }
                }.disabled(product.isEmpty || scanning)
            }
            if done {
                Section {
                    Text("Safety Score: 72/100").font(.title2).foregroundColor(.accentColor)
                    ForEach(ingredients, id: \.0) { name, risk in
                        HStack { Text(name); Spacer(); Text(risk).foregroundColor(risk == "safe" ? .accentColor : risk == "high" ? .red : .secondary) }
                    }
                }
            }
        }.navigationTitle("Ingredient Scanner")
    }
}

struct IngredientSwapView: View {
    @State private var ingredient = ""
    let swaps = ["butter": ["olive oil", "coconut oil", "ghee"], "sugar": ["honey", "stevia", "jaggery"], "flour": ["almond flour", "oat flour", "coconut flour"], "milk": ["almond milk", "oat milk", "soy milk"], "egg": ["banana", "applesauce", "flax egg"]]
    var body: some View {
        List {
            Section { TextField("Ingredient to replace", text: $ingredient) }
            let suggestions = swaps[ingredient.trimmingCharacters(in: .whitespaces).lowercased()] ?? []
            if !suggestions.isEmpty {
                Section {
                    Text("Substitutes for \(ingredient):").font(.headline).foregroundColor(.accentColor)
                    ForEach(suggestions, id: \.self) { Text("✅ \($0)") }
                }
            } else if !ingredient.isEmpty {
                Section { Text("No swaps known for \"\(ingredient)\" yet — try butter, sugar, flour, milk or egg.").foregroundColor(.secondary) }
            }
        }.navigationTitle("Ingredient Swap")
    }
}

struct MedicineInteractionView: View {
    @State private var meds: [String] = []
    @State private var newMed = ""
    @State private var checked = false
    let known = [[("aspirin", "warfarin"), "Bleeding risk — consult your doctor immediately."], [("ibuprofen", "lisinopril"), "May reduce blood-pressure control and harm kidneys."], [("paracetamol", "alcohol"), "Liver strain — avoid alcohol with regular use."]]
    var warnings: [String] {
        let lower = Set(meds.map { $0.lowercased() })
        return known.compactMap { pair, msg in lower.isSuperset(of: [pair.0, pair.1]) ? msg : nil }
    }
    var body: some View {
        List {
            Section {
                HStack {
                    TextField("Medicine name", text: $newMed)
                    Button("Add") { if !newMed.isEmpty { meds.append(newMed.trimmingCharacters(in: .whitespaces)); newMed = ""; checked = false } }.disabled(newMed.isEmpty)
                }
                Button("Check interactions") { checked = true }.disabled(meds.count < 2)
            }
            ForEach(meds, id: \.self) { med in
                HStack {
                    Text("💊 \(med)")
                    Spacer()
                    Button("Remove") { meds.removeAll(where: { $0 == med }); checked = false }
                }
            }
            if checked {
                Section {
                    if warnings.isEmpty { Text("✅ No known interactions between these medicines.").foregroundColor(.accentColor) }
                    else { ForEach(warnings, id: \.self) { Text("⚠️ \($0)").foregroundColor(.red) } }
                }
            }
        }.navigationTitle("Medicine Interaction Checker")
    }
}

struct MedicineTrackerView: View {
    @State private var meds = [("Paracetamol", "500mg", "8:00 AM"), ("Vitamin D", "1000 IU", "9:00 PM")]
    @State private var scanning = false
    @State private var added = false
    var body: some View {
        List {
            ForEach(meds, id: \.0) { name, dose, time in
                VStack(alignment: .leading, spacing: 2) {
                    Text("💊 \(name) · \(dose)").font(.headline)
                    Text("⏰ \(time)").font(.caption).foregroundColor(.secondary)
                }.padding(.vertical, 4)
            }
            Section {
                Button(scanning ? "Scanning strip…" : "Scan medicine strip") {
                    scanning = true
                    Task { try? await Task.sleep(nanoseconds: 1_200_000_000); meds.append(("Azithromycin", "250mg", "1:00 PM")); scanning = false; added = true }
                }.disabled(scanning)
                if added { Text("✅ Azithromycin added to tracker!").foregroundColor(.accentColor) }
            }
        }.navigationTitle("Medicine Tracker")
    }
}

struct PrescriptionScanView: View {
    @State private var scanning = false
    @State private var meds: [(String, String, Int)] = []
    var body: some View {
        List {
            Section {
                Button(scanning ? "Reading prescription…" : "Scan prescription") {
                    scanning = true
                    Task {
                        try? await Task.sleep(nanoseconds: 1_500_000_000)
                        meds = [("Paracetamol 500mg", "15 tablets", 45), ("Azithromycin 250mg", "6 tablets", 120), ("Cetirizine 10mg", "10 tablets", 60)]
                        scanning = false
                    }
                }.disabled(scanning)
            }
            ForEach(meds, id: \.0) { name, qty, price in
                HStack {
                    VStack(alignment: .leading) { Text(name).font(.headline); Text(qty).font(.caption).foregroundColor(.secondary) }
                    Spacer()
                    Text("\(price)").font(.headline).foregroundColor(.accentColor)
                }
            }
            if !meds.isEmpty {
                Section {
                    Text("Total: \(meds.map { $0.2 }.reduce(0, +)) (\(meds.count) medicines)").font(.headline).foregroundColor(.accentColor)
                    Button("Order all") {}
                }
            }
        }.navigationTitle("Prescription Scan")
    }
}

struct HealthMonitorView: View {
    let metrics = [("Uptime", "99.9%"), ("Response Time", "0.8s"), ("Error Rate", "0.02%"), ("SEO Score", "94/100")]
    let history = [("Week 1", "100%"), ("Week 2", "99.9%"), ("Week 3", "99.8%"), ("Week 4", "100%")]
    var body: some View {
        List {
            Section { Text("💚 Status: healthy · checked 2 minutes ago · 0 errors · performance 94").foregroundColor(.accentColor) }
            ForEach(metrics, id: \.0) { name, value in
                HStack { Text(name); Spacer(); Text("✅ \(value)") }
            }
            Section("4-week history") {
                ForEach(history, id: \.0) { week, uptime in
                    HStack { Text(week); Spacer(); Text(uptime) }
                }
            }
        }.navigationTitle("Site Health Monitor")
    }
}

// MARK: - Tools wave-F

struct ProjectDashboardView: View {
    let milestones = [("Discovery", "completed", "Day 1-2"), ("Design", "completed", "Day 3-7"), ("Development", "in-progress", "Day 8-14"), ("Testing", "pending", "Day 15-16"), ("Launch", "pending", "Day 17")]
    var body: some View {
        List {
            Section {
                HStack {
                    Text("Progress 60%").font(.headline).foregroundColor(.accentColor)
                    Spacer()
                    Text("Day 8 of 14 · Development").font(.caption).foregroundColor(.secondary)
                }
                ProgressView(value: 0.6)
            }
            ForEach(milestones, id: \.0) { name, status, date in
                HStack {
                    Text(status == "completed" ? "✅" : status == "in-progress" ? "🔄" : "⏳")
                    VStack(alignment: .leading) {
                        Text(name).font(.headline)
                        Text("\(status) · \(date)").font(.caption).foregroundColor(.secondary)
                    }
                }.padding(.vertical, 2)
            }
        }.navigationTitle("Live Project Dashboard")
    }
}

struct ProjectPlannerView: View {
    @State private var project = ""
    @State private var materials: [String] = []
    let diy = ["bookshelf": ["Wood planks (6)", "Screws (20)", "Wood glue", "Sandpaper", "Paint"], "photo frame": ["Cardboard", "Scissors", "Glue", "Decorations"], "garden bed": ["Wood (4 planks)", "Soil", "Seeds", "Nails"]]
    var body: some View {
        List {
            Section {
                TextField("Project (bookshelf, photo frame, garden bed)", text: $project)
                Button("Generate list") { materials = diy[project.trimmingCharacters(in: .whitespaces).lowercased()] ?? [] }
            }
            ForEach(materials, id: \.self) { Text("• \($0)") }
        }.navigationTitle("Project Planner")
    }
}

struct MilestonesView: View {
    @State private var milestones = [(1, "Wireframes", "completed", ["Homepage wireframe", "About page wireframe"], true), (2, "Design", "in-review", ["Homepage design", "Mobile design"], false), (3, "Frontend Development", "pending", ["HTML/CSS", "React components"], false), (4, "Backend Integration", "pending", ["API endpoints", "Database setup"], false)]
    @State private var feedback = ""
    @State private var sent = false
    var body: some View {
        List {
            ForEach(milestones, id: \.0) { id, name, status, deliverables, approved in
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text("\(id). \(name) \(approved ? "✅" : "")").font(.headline)
                        Spacer()
                        if !approved {
                            Button("Approve") {
                                if let i = milestones.firstIndex(where: { $0.0 == id }) { milestones[i].2 = "completed"; milestones[i].4 = true }
                            }
                        }
                    }
                    Text(status).font(.caption).foregroundColor(.accentColor)
                    ForEach(deliverables, id: \.self) { Text("• \($0)").font(.caption).foregroundColor(.secondary) }
                }.padding(.vertical, 4)
            }
            Section("Feedback") {
                TextField("Feedback for the team", text: $feedback)
                Button("Send feedback") { sent = true; feedback = "" }.disabled(feedback.isEmpty)
                if sent { Text("✅ Feedback sent!").foregroundColor(.accentColor) }
            }
        }.navigationTitle("Milestones")
    }
}

struct DeadlinePredictorView: View {
    let opts = [("auth", "User Authentication", 3), ("payment", "Payment Integration", 4), ("cms", "Content Management", 5), ("analytics", "Analytics Dashboard", 3), ("chat", "Live Chat", 2), ("search", "Advanced Search", 3)]
    @State private var selected: Set<String> = []
    @State private var complexity = "medium"
    var base: Int { complexity == "simple" ? 7 : complexity == "medium" ? 14 : 21 }
    var total: Int { base + opts.filter { selected.contains($0.0) }.map { $0.2 }.reduce(0, +) }
    var rush: Int { Int(ceil(Double(total) * 0.6)) }
    var body: some View {
        List {
            Section("Complexity") {
                Picker("Complexity", selection: $complexity) { ForEach(["simple", "medium", "complex"], id: \.self) { Text($0).tag($0) } }.pickerStyle(.segmented)
            }
            ForEach(opts, id: \.0) { id, name, days in
                HStack {
                    Button(action: {
                        if selected.contains(id) { selected.remove(id) } else { selected.insert(id) }
                    }) { Image(systemName: selected.contains(id) ? "checkmark.square.fill" : "square") }
                    Text(name)
                    Spacer()
                    Text("+\(days)d").foregroundColor(.accentColor)
                }
            }
            Section {
                Text("📅 Standard: \(total) days · ⚡ Rush: \(rush) days").font(.headline).foregroundColor(.accentColor)
                Text("Base \(base)d + features \(total - base)d").font(.caption).foregroundColor(.secondary)
            }
        }.navigationTitle("Deadline Predictor")
    }
}

struct ScopeChangeView: View {
    @State private var requested = ""
    @State private var analyzed = false
    @State private var approved = false
    var body: some View {
        List {
            Section {
                TextField("Describe the change", text: $requested, axis: .vertical)
                Button("Analyze change") { analyzed = true }.disabled(requested.isEmpty)
            }
            if analyzed {
                Section {
                    Text("⚠️ Out of scope").font(.headline).foregroundColor(.red)
                    Text("Not included in original requirements document.")
                    Text("Estimated: 8 hours · 3999 · adds 2 days").font(.headline).foregroundColor(.accentColor)
                    Button("Approve change") { approved = true }
                    if approved { Text("✅ Scope change approved! New timeline and cost updated.").foregroundColor(.accentColor) }
                }
            }
        }.navigationTitle("Scope Change Detector")
    }
}

struct HandoffPortalView: View {
    let deliverables = [("Source Code", "24 MB", "src/, components/, api/"), ("Design Assets", "156 MB", "logos/, icons/, banners/"), ("Documentation", "2.4 MB", "README.md, API.md, DEPLOY.md"), ("Video Tutorials", "450 MB", "setup.mp4, admin-guide.mp4")]
    var body: some View {
        List {
            Section { Button("Download all") {} }
            ForEach(deliverables, id: \.0) { name, size, files in
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("📦 \(name) · \(size)").font(.headline)
                        Text(files).font(.caption).foregroundColor(.secondary)
                    }
                    Spacer()
                    Button("Get") {}
                }.padding(.vertical, 4)
            }
        }.navigationTitle("Handoff Portal")
    }
}

struct SlaGeneratorView: View {
    @State private var generated = false
    let terms = ["Response time: 24 hours", "Revisions: 3 rounds included", "Delivery: 14-21 days", "Support: 30 days post-delivery", "Uptime: 99.5%", "Penalty: 10% discount per week delayed"]
    let clauses = ["Client must provide all content within 3 days of request", "Revisions must be requested within 7 days of milestone delivery", "Scope changes require written approval and may adjust timeline", "Payment milestones tied to deliverable approval", "Intellectual property transfers upon final payment"]
    var body: some View {
        List {
            Section { Button("Generate SLA") { generated = true } }
            if generated {
                Section {
                    Text("📄 Website Development SLA").font(.headline).foregroundColor(.accentColor)
                    ForEach(terms, id: \.self) { Text("• \($0)") }
                    ForEach(Array(clauses.enumerated()), id: \.offset) { i, clause in
                        Text("\(i + 1). \(clause)").font(.caption).foregroundColor(.secondary)
                    }
                }
            }
        }.navigationTitle("SLA Generator")
    }
}

struct QbrReportsView: View {
    let metrics = [("Traffic", "+45%"), ("Conversions", "+22%"), ("Revenue", "+38%")]
    let recs = ["Optimize product page load times", "Add customer testimonials section", "Implement abandoned cart recovery"]
    var body: some View {
        List {
            Section {
                Text("📊 Q4 2024 · completed").font(.headline).foregroundColor(.accentColor)
                ForEach(metrics, id: \.0) { k, v in
                    HStack { Text(k); Spacer(); Text(v).bold() }
                }
            }
            Section("Recommendations") {
                ForEach(recs, id: \.self) { Text("• \($0)") }
            }
        }.navigationTitle("Quarterly Business Reviews")
    }
}

// MARK: - Tools wave-G

struct ChurnPredictionView: View {
    let clients = [("TechStart Inc.", 78, "45 days ago", "2 weeks", "Send personalized offer"), ("Fashion Boutique", 65, "32 days ago", "1 month", "Schedule check-in call"), ("Dr. Ahmed Clinic", 52, "28 days ago", "3 weeks", "Send QBR report")]
    var body: some View {
        List(clients, id: \.0) { name, risk, login, renewal, action in
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("\(name) · risk \(risk)%").font(.headline).foregroundColor(risk >= 70 ? .red : .primary)
                    Text("Last login \(login) · renews in \(renewal)").font(.caption).foregroundColor(.secondary)
                    Text(action).font(.caption).foregroundColor(.accentColor)
                }
                Spacer()
                Button("Act") {}
            }.padding(.vertical, 4)
        }.navigationTitle("Churn Prediction")
    }
}

struct ClientLtvView: View {
    let segs = [("VIP Clients", 15, 85000, 1275000), ("Regular Clients", 45, 25000, 1125000), ("One-time Clients", 120, 8000, 960000)]
    var body: some View {
        List(segs, id: \.0) { name, count, avg, total in
            VStack(alignment: .leading, spacing: 2) {
                Text("👑 \(name) · \(count) clients").font(.headline)
                HStack { Text("Avg LTV \(avg)"); Spacer(); Text("\(total)").bold().foregroundColor(.accentColor) }
            }.padding(.vertical, 4)
        }.navigationTitle("Client Lifetime Value")
    }
}

struct CommandCenterView: View {
    var body: some View {
        List {
            Section {
                HStack { Text("Upcoming renewals"); Spacer(); Text("1").bold() }
                HStack { Text("Unread messages"); Spacer(); Text("3").bold() }
            }
            Section("Projects") {
                VStack(alignment: .leading) { Text("E-commerce Website — 60%").font(.headline); ProgressView(value: 0.6) }
                VStack(alignment: .leading) { Text("Mobile App — 15%").font(.headline); ProgressView(value: 0.15) }
            }
        }.navigationTitle("Client Command Center")
    }
}

struct CorporateCreditView: View {
    @State private var company = ""
    @State private var email = ""
    @State private var revenue = ""
    @State private var submitted = false
    var body: some View {
        List {
            Section {
                TextField("Company name", text: $company)
                TextField("Work email", text: $email)
                TextField("Annual revenue", text: $revenue).keyboardType(.numberPad)
                Button("Apply") {
                    guard !company.isEmpty, !email.isEmpty, !revenue.isEmpty else { return }
                    submitted = true
                }
            }
            if submitted {
                Section {
                    Text("✅ Application received for \(company)").font(.headline).foregroundColor(.accentColor)
                    Text("Our credit team responds within 2 business days.")
                }
            }
        }.navigationTitle("Corporate Credit Account")
    }
}

struct CrowdWisdomView: View {
    @State private var loading = false
    @State private var done = false
    var body: some View {
        List {
            Section {
                Button(loading ? "Asking the crowd…" : "Get crowd wisdom") {
                    loading = true
                    Task { try? await Task.sleep(nanoseconds: 1_200_000_000); loading = false; done = true }
                }.disabled(loading)
            }
            if done {
                Section {
                    Text("🏆 Crowd pick: Wireless Earbuds").font(.headline).foregroundColor(.accentColor)
                    VStack(alignment: .leading) { Text("Wireless Earbuds"); ProgressView(value: 0.62) }
                    VStack(alignment: .leading) { Text("Wired Earphones"); ProgressView(value: 0.25) }
                    VStack(alignment: .leading) { Text("Over-ear Headphones"); ProgressView(value: 0.13) }
                    Text("6,200 of 10,000 buyers chose this · 4.6★ average").font(.caption).foregroundColor(.secondary)
                }
            }
        }.navigationTitle("Crowd Wisdom")
    }
}

struct DemandForecastView: View {
    let rows = [("January", "High", "E-commerce", "New Year sales prep"), ("February", "Medium", "General Websites", "Budget renewals"), ("March", "High", "Mobile Apps", "Q1 launches"), ("April", "Low", "Maintenance", "Post-launch support"), ("May", "Medium", "Web Apps", "Mid-year upgrades")]
    var body: some View {
        List(rows, id: \.0) { month, demand, service, reason in
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("\(month) · \(service)").font(.headline)
                    Text(reason).font(.caption).foregroundColor(.secondary)
                }
                Spacer()
                Text(demand).foregroundColor(demand == "High" ? .accentColor : demand == "Low" ? .red : .secondary)
            }.padding(.vertical, 4)
        }.navigationTitle("Demand Forecast")
    }
}

struct DisputeResolutionView: View {
    @State private var step = 1
    @State private var description = ""
    @State private var project = "E-commerce Website"
    @State private var filed = false
    var body: some View {
        List {
            if step == 1 {
                Section("File a Dispute") {
                    Picker("Project", selection: $project) { ForEach(["E-commerce Website", "Mobile App"], id: \.self) { Text($0).tag($0) } }
                    TextField("What went wrong?", text: $description, axis: .vertical)
                    Button("File dispute") { step = 2; filed = true }.disabled(description.isEmpty)
                }
            } else {
                Section {
                    Text("✅ Dispute filed for \(project)").font(.headline).foregroundColor(.accentColor)
                    ForEach(["Team responds within 24 hours", "Evidence review with both sides", "Binding resolution within 48 hours"], id: \.self) { Text("• \($0)") }
                }
            }
        }.navigationTitle("Dispute Resolution")
    }
}

struct GuaranteeVaultView: View {
    let items = [("Deposit", "released", 7500, "Released Jan 15"), ("Design Complete", "held", 7500, "Held - awaiting approval"), ("Development", "held", 7500, "Held"), ("Final Delivery", "held", 4999, "Held")]
    var body: some View {
        List(items, id: \.0) { name, status, amount, date in
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("\(name) \(status == "released" ? "✅" : "🔒")").font(.headline)
                    Text(date).font(.caption).foregroundColor(.secondary)
                }
                Spacer()
                Text("\(amount)").font(.headline).foregroundColor(.accentColor)
            }.padding(.vertical, 4)
        }.navigationTitle("Guarantee Vault")
    }
}

struct PricingTestView: View {
    var body: some View {
        List {
            Section {
                Text("Variant A: 4999 · 1200 visitors · 45 conversions · 224955 revenue 🏆").foregroundColor(.accentColor)
                Text("Variant B: 5499 · 1200 visitors · 38 conversions · 208962 revenue")
            }
            Section {
                Text("Insight: the 4999 price point generates 15,993 more revenue despite the lower price.")
            }
        }.navigationTitle("Pricing A/B Test")
    }
}

struct ProductLiquidatorView: View {
    @State private var productName = ""
    @State private var condition = "good"
    @State private var age = "1"
    @State private var loading = false
    @State private var estimate: Int?
    var body: some View {
        List {
            Section {
                TextField("Product name", text: $productName)
                Picker("Condition", selection: $condition) { ForEach(["excellent", "good", "fair"], id: \.self) { Text($0).tag($0) } }.pickerStyle(.segmented)
                TextField("Age (years)", text: $age).keyboardType(.numberPad)
                Button(loading ? "Estimating…" : "Get estimate & list") {
                    loading = true
                    Task {
                        try? await Task.sleep(nanoseconds: 1_200_000_000)
                        let condF = condition == "excellent" ? 0.8 : condition == "good" ? 0.6 : 0.4
                        let ageF = 1.0 / Double(max(Int(age) ?? 1, 1))
                        estimate = Int(10000.0 * condF * (0.5 + 0.5 * ageF))
                        loading = false
                    }
                }.disabled(productName.isEmpty || loading)
            }
            if let est = estimate {
                Section {
                    Text("💰 Estimated resale: \(est)").font(.title2).foregroundColor(.accentColor)
                    Text("Auto-listed on 5 resale platforms with photos and pickup.")
                }
            }
        }.navigationTitle("Product Liquidator")
    }
}

struct ProfitabilityView: View {
    let rows = [("Website Development", 245000, 180, 98000, 40), ("Web Applications", 380000, 220, 152000, 40), ("E-commerce", 165000, 120, 82500, 50), ("Mobile Apps", 480000, 280, 192000, 40)]
    var body: some View {
        List(rows, id: \.0) { name, revenue, hours, profit, margin in
            VStack(alignment: .leading, spacing: 4) {
                Text("💼 \(name) · \(margin)% margin").font(.headline).foregroundColor(.accentColor)
                Text("Revenue \(revenue) · \(hours)h · profit \(profit)").font(.subheadline)
                ProgressView(value: Double(margin) / 100.0)
            }.padding(.vertical, 4)
        }.navigationTitle("Profitability")
    }
}

// MARK: - Tools wave-H

struct SchedulerView: View {
    @State private var date = ""
    @State private var slot = ""
    @State private var booking = false
    @State private var booked = false
    let slots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"]
    var body: some View {
        List {
            Section { TextField("Date (YYYY-MM-DD)", text: $date) }
            Section("Available slots") {
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 8) {
                    ForEach(slots, id: \.self) { t in
                        Button(t) { slot = t }
                            .buttonStyle(.borderedProminent).tint(slot == t ? .accentColor : .gray)
                    }
                }.padding(.vertical, 4)
            }
            Section {
                Button(booking ? "Booking…" : booked ? "Booked ✅" : "Book appointment") {
                    guard !date.isEmpty, !slot.isEmpty else { return }
                    booking = true
                    Task { try? await Task.sleep(nanoseconds: 1_200_000_000); booking = false; booked = true }
                }.disabled(booking)
            }
        }.navigationTitle("Book a Consultation")
    }
}

struct SeasonalClothingView: View {
    @State private var season = "summer"
    let wardrobe = ["summer": [("Cotton T-Shirts", "Top", "25-35C"), ("Shorts", "Bottom", "25-35C"), ("Sunglasses", "Accessory", "All day")], "monsoon": [("Rain Jacket", "Outerwear", "20-30C"), ("Waterproof Shoes", "Footwear", "All day"), ("Umbrella", "Accessory", "All day")], "winter": [("Wool Sweaters", "Top", "5-20C"), ("Jackets", "Outerwear", "5-20C"), ("Warm Socks", "Footwear", "5-20C")]]
    var body: some View {
        List {
            Section {
                Picker("Season", selection: $season) {
                    Text("☀️ Summer").tag("summer")
                    Text("🌧️ Monsoon").tag("monsoon")
                    Text("❄️ Winter").tag("winter")
                }.pickerStyle(.segmented)
            }
            ForEach(wardrobe[season] ?? [], id: \.0) { name, type, temp in
                VStack(alignment: .leading, spacing: 2) {
                    Text(name).font(.headline)
                    Text("\(type) · \(temp)").font(.caption).foregroundColor(.secondary)
                }.padding(.vertical, 2)
            }
        }.navigationTitle("Seasonal Clothing")
    }
}

struct SeniorModeView: View {
    @State private var largeText = true
    @State private var highContrast = false
    @State private var voiceAssist = true
    @State private var simpleMode = true
    @State private var saved = false
    var body: some View {
        List {
            Toggle("Large text", isOn: $largeText)
            Toggle("High contrast", isOn: $highContrast)
            Toggle("Voice assistance", isOn: $voiceAssist)
            Toggle("Simple layout", isOn: $simpleMode)
            Section {
                Button("Save settings") { saved = true }
                if saved { Text("✅ Senior mode settings saved!").foregroundColor(.accentColor) }
            }
        }.navigationTitle("Senior Mode")
    }
}

struct ServiceConfiguratorView: View {
    let services = [("website", "Website", 4999), ("webapp", "Web Application", 14999), ("mobile", "Mobile App", 24999), ("ecommerce", "E-commerce", 9999)]
    let pages = [("home", "Home", 0), ("about", "About", 500), ("contact", "Contact", 500), ("blog", "Blog", 1500), ("portfolio", "Portfolio", 1000), ("services", "Services", 800)]
    let feats = [("auth", "User Authentication", 2000), ("cms", "Content Management", 3000), ("payment", "Payment Integration", 2500), ("seo", "SEO Optimization", 1500), ("analytics", "Analytics Dashboard", 1000), ("chat", "Live Chat", 1200)]
    @State private var serviceId = "website"
    @State private var selPages: Set<String> = []
    @State private var selFeats: Set<String> = []
    @State private var requested = false
    var price: Int {
        (services.first(where: { $0.0 == serviceId })?.2 ?? 4999) + pages.filter { selPages.contains($0.0) }.map { $0.2 }.reduce(0, +) + feats.filter { selFeats.contains($0.0) }.map { $0.2 }.reduce(0, +)
    }
    var serviceName: String { services.first(where: { $0.0 == serviceId })?.1 ?? "Website" }
    var body: some View {
        List {
            Section("1 · Service") {
                ForEach(services, id: \.0) { id, name, base in
                    HStack {
                        Text("\(name) · \(base)")
                        Spacer()
                        if serviceId == id { Image(systemName: "checkmark.circle.fill").foregroundColor(.accentColor) }
                    }.contentShape(Rectangle()).onTapGesture { serviceId = id }
                }
            }
            Section("2 · Pages") {
                ForEach(pages, id: \.0) { id, name, p in
                    HStack {
                        Text("\(name) \(p == 0 ? "(included)" : "+ \(p)")")
                        Spacer()
                        Button(action: {
                            if selPages.contains(id) { selPages.remove(id) } else { selPages.insert(id) }
                        }) { Image(systemName: selPages.contains(id) ? "checkmark.square.fill" : "square") }
                    }
                }
            }
            Section("3 · Features") {
                ForEach(feats, id: \.0) { id, name, p in
                    HStack {
                        Text("\(name) +\(p)")
                        Spacer()
                        Button(action: {
                            if selFeats.contains(id) { selFeats.remove(id) } else { selFeats.insert(id) }
                        }) { Image(systemName: selFeats.contains(id) ? "checkmark.square.fill" : "square") }
                    }
                }
            }
            Section {
                Text("🧾 \(serviceName) · \(selPages.count) pages · \(selFeats.count) features")
                Text("Estimated: \(price)").font(.title2).foregroundColor(.accentColor)
                Button("Request this quote") { requested = true }
                if requested { Text("✅ Quote requested!").foregroundColor(.accentColor) }
            }
        }.navigationTitle("Service Configurator")
    }
}

struct ServiceSubscriptionsView: View {
    let tiers = [("Basic Care", 999, ["Security updates", "Bug fixes", "Email support", "Monthly backups"], false), ("Pro Support", 1999, ["Everything in Basic", "Priority support", "Uptime monitoring", "Monthly report"], true), ("Enterprise", 4999, ["Everything in Pro", "Dedicated manager", "SLA 99.9%", "Quarterly roadmap"], false)]
    @State private var subscribed: String?
    var body: some View {
        List(tiers, id: \.0) { name, price, features, popular in
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text("🛡️ \(name) \(popular ? "⭐" : "")").font(.headline)
                    Spacer()
                    Text("\(price)/mo").font(.headline).foregroundColor(.accentColor)
                }
                ForEach(features, id: \.self) { Text("• \($0)").font(.subheadline) }
                Button(subscribed == name ? "Subscribed ✅" : "Subscribe") { subscribed = name }.disabled(subscribed == name)
            }.padding(.vertical, 4)
        }.navigationTitle("Care Plans")
    }
}

struct SubscriptionAuditView: View {
    @State private var loading = true
    @State private var subs = [(String, String, Int, String, Int)]()
    var body: some View {
        Group {
            if loading {
                VStack(spacing: 12) { ProgressView(); Text("Auditing subscriptions…").foregroundColor(.secondary) }
                    .onAppear {
                        Task {
                            try? await Task.sleep(nanoseconds: 1_000_000_000)
                            subs = [("1", "Netflix", 649, "active", 0), ("2", "Gym Pro", 1200, "unused", 1200), ("3", "Cloud 2TB", 800, "unused", 800), ("4", "Music Plus", 119, "active", 0)]
                            loading = false
                        }
                    }
            } else {
                List {
                    Section {
                        let unused = subs.filter { $0.3 == "unused" }
                        Text("💸 \(unused.count) unused · save \(unused.map { $0.4 }.reduce(0, +))/mo").font(.headline).foregroundColor(.accentColor)
                    }
                    ForEach(subs, id: \.0) { id, name, price, status, _ in
                        HStack {
                            VStack(alignment: .leading) {
                                Text("\(name) · \(price)/mo").font(.headline)
                                Text(status).font(.caption).foregroundColor(status == "unused" ? .red : .accentColor)
                            }
                            Spacer()
                            if status == "unused" { Button("Cancel") { subs.removeAll(where: { $0.0 == id }) } }
                        }.padding(.vertical, 2)
                    }
                }
            }
        }.navigationTitle("Subscription Audit")
    }
}

struct SustainableFinderView: View {
    @State private var search = ""
    let products = [("Bamboo Toothbrush", 95, 149, true), ("Reusable Water Bottle", 90, 399, false), ("Organic Cotton T-Shirt", 88, 599, true), ("Biodegradable Phone Case", 85, 299, false)]
    var filtered: [(String, Int, Int, Bool)] { search.isEmpty ? products : products.filter { $0.0.localizedCaseInsensitiveContains(search) } }
    var body: some View {
        List {
            Section { TextField("Search eco products", text: $search) }
            ForEach(filtered, id: \.0) { name, score, price, organic in
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("🌱 \(name) \(organic ? "(organic)" : "")").font(.headline)
                        Text("Eco-score \(score) · \(price)").font(.caption).foregroundColor(.accentColor)
                    }
                    Spacer()
                    Button("Add") {}
                }.padding(.vertical, 4)
            }
        }.navigationTitle("Sustainable Finder")
    }
}

struct UssdMenuView: View {
    @State private var current = "main"
    @State private var history: [String] = []
    @State private var cartCount = 0
    @State private var notice: String?
    let menus: [String: (String, [(String, String, String?, String?)])] = [
        "main": ("Main Menu", [("1", "Browse Products", "categories", nil), ("2", "My Orders", "orders", nil), ("3", "Search", "search", nil), ("4", "Support", "support", nil)]),
        "categories": ("Categories", [("1", "Groceries", "groceries", nil), ("2", "Electronics", "electronics", nil), ("0", "Back", "main", nil)]),
        "groceries": ("Groceries", [("1", "Rice - 50/kg", nil, "add"), ("2", "Dal - 80/kg", nil, "add"), ("3", "Oil - 120/l", nil, "add"), ("9", "View Cart", "cart", nil), ("0", "Back", "categories", nil)]),
        "orders": ("My Orders", [("1", "ORD-1042: In transit", nil, "info"), ("0", "Back", "main", nil)]),
        "cart": ("Your Cart", [("1", "Checkout", nil, "info"), ("0", "Back", "groceries", nil)]),
        "search": ("Search", [("1", "Rice: 12 results", nil, "info"), ("0", "Back", "main", nil)]),
        "support": ("Support", [("1", "Call us", nil, "info"), ("0", "Back", "main", nil)]),
        "electronics": ("Electronics", [("1", "Earbuds - 1299", nil, "add"), ("0", "Back", "categories", nil)])
    ]
    func press(_ opt: (String, String, String?, String?)) {
        if opt.3 == "add" { cartCount += 1; notice = "Added to cart! (\(cartCount) items)"; return }
        if opt.3 == "info" { notice = opt.1; return }
        if let next = opt.2 {
            if opt.0 == "0" { _ = history.popLast() } else { history.append(current) }
            current = next
        }
    }
    var body: some View {
        List {
            Section {
                Text("*99# · \(menus[current]?.0 ?? "")").font(.headline).foregroundColor(.accentColor).monospaced()
                if cartCount > 0 { Text("🛒 \(cartCount) items in cart").font(.caption) }
                if let n = notice { Text(n).font(.caption).foregroundColor(.accentColor) }
            }
            ForEach(menus[current]?.1 ?? [], id: \.0) { opt in
                Button(action: { press(opt) }) {
                    Text("\(opt.0). \(opt.1)").monospaced()
                }
            }
        }.navigationTitle("USSD Shop *99#")
    }
}

struct VideoVerificationView: View {
    @State private var status = "idle"
    @State private var requesting = false
    var body: some View {
        List {
            Section {
                Text("A store agent shows the exact item on a live video call before dispatch.")
                Button(requesting ? "Requesting…" : status == "scheduled" ? "Call scheduled ✅" : "Request video call") {
                    requesting = true
                    Task { try? await Task.sleep(nanoseconds: 1_200_000_000); requesting = false; status = "scheduled" }
                }.disabled(requesting || status != "idle")
            }
            if status == "scheduled" {
                Section { Text("📹 Slot: tomorrow, 11:00 AM · link arrives on SMS").foregroundColor(.accentColor) }
            }
        }.navigationTitle("Video Verification")
    }
}

struct VisualImpairedView: View {
    @State private var screenReader = true
    @State private var voiceNav = true
    @State private var audioDesc = true
    @State private var highContrast = true
    @State private var playing = false
    var body: some View {
        List {
            Toggle("Screen reader labels", isOn: $screenReader)
            Toggle("Voice navigation", isOn: $voiceNav)
            Toggle("Audio descriptions", isOn: $audioDesc)
            Toggle("High contrast", isOn: $highContrast)
            Section {
                Button("Preview audio description") { playing = true }
                if playing { Text("🔊 Playing audio description…").foregroundColor(.accentColor) }
            }
        }.navigationTitle("Vision Accessibility")
    }
}

struct WarrantyExpiryView: View {
    let items = [("iPhone 15", "2025-09-15", 120), ("MacBook Pro", "2024-12-01", 45)]
    @State private var extended: Set<String> = []
    var body: some View {
        List(items, id: \.0) { product, date, days in
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text("🛡️ \(product)").font(.headline)
                    Text("Expires \(date) · \(days) days left").font(.caption).foregroundColor(days < 60 ? .red : .secondary)
                }
                Spacer()
                Button(extended.contains(product) ? "Extended ✅" : "Extend") { extended.insert(product) }.disabled(extended.contains(product))
            }.padding(.vertical, 4)
        }.navigationTitle("Warranty Expiry")
    }
}

struct WhatsAppBulkView: View {
    @State private var phone = ""
    @State private var selected: Set<Int> = []
    @State private var sending = false
    @State private var sent = false
    let catalog = [(1, "Rice 5kg", 250), (2, "Dal 1kg", 120), (3, "Oil 1L", 140), (4, "Sugar 2kg", 80), (5, "Salt 1kg", 20), (6, "Tea 250g", 60)]
    var total: Int { catalog.filter { selected.contains($0.0) }.map { $0.2 }.reduce(0, +) }
    var body: some View {
        List {
            Section { TextField("WhatsApp number", text: $phone).keyboardType(.numberPad) }
            ForEach(catalog, id: \.0) { id, name, price in
                HStack {
                    Button(action: {
                        if selected.contains(id) { selected.remove(id) } else { selected.insert(id) }
                    }) { Image(systemName: selected.contains(id) ? "checkmark.square.fill" : "square") }
                    Text(name)
                    Spacer()
                    Text("\(price)").foregroundColor(.accentColor)
                }
            }
            Section {
                Button(sending ? "Sending…" : sent ? "Order sent ✅ (\(total))" : "Send order (\(total))") {
                    guard phone.count >= 10, !selected.isEmpty else { return }
                    sending = true
                    Task { try? await Task.sleep(nanoseconds: 1_200_000_000); sending = false; sent = true }
                }.disabled(sending)
            }
        }.navigationTitle("WhatsApp Bulk Order")
    }
}
