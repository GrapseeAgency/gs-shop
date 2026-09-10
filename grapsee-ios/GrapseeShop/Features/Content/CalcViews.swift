import SwiftUI

// MARK: - Local calculators (exact web formulas)

struct EmiView: View {
    @State private var amount = "5000"
    @State private var tenure = "6"
    @State private var rate = "0"
    var body: some View {
        let principal = Double(amount) ?? 0
        let months = max(1, Int(tenure) ?? 1)
        let monthly = (Double(rate) ?? 0) / 100 / 12
        let emi = monthly == 0 ? principal / Double(months) : principal * monthly * pow(1 + monthly, Double(months)) / (pow(1 + monthly, Double(months)) - 1)
        let total = emi * Double(months)
        List {
            TextField("Service amount", text: $amount).keyboardType(.decimalPad)
            TextField("Tenure (months)", text: $tenure).keyboardType(.numberPad)
            TextField("Annual interest %", text: $rate).keyboardType(.decimalPad)
            Section("Result") {
                KV("Monthly EMI", "$\(String(format: "%.2f", emi))")
                KV("Total payment", "$\(String(format: "%.2f", total))")
                KV("Total interest", "$\(String(format: "%.2f", total - principal))")
                KV("Processing fee (2%)", "$\(String(format: "%.2f", principal * 0.02))")
            }
        }.navigationTitle("EMI Calculator")
    }
}

struct CurrencyView: View {
    @State private var amount = ""
    @State private var from = "USD"
    @State private var result: Double?
    let rates = ["USD": 83.5, "EUR": 90.2, "GBP": 105.8, "JPY": 0.56]
    var body: some View {
        List {
            TextField("Amount", text: $amount).keyboardType(.decimalPad)
            Picker("From", selection: $from) { ForEach(Array(rates.keys).sorted(), id: \.self) { Text($0).tag($0) } }.pickerStyle(.segmented)
            Button("Convert") { result = ((Double(amount) ?? 0) * (rates[from] ?? 1)).rounded() }.disabled(amount.isEmpty)
            if let r = result { KV("Converted", "৳\(String(format: "%.0f", r))") }
        }.navigationTitle("Currency Converter")
    }
}

struct TipCalcView: View {
    @State private var bill = ""
    @State private var people = "1"
    @State private var pct = 10
    var body: some View {
        let amt = Double(bill) ?? 0
        let tip = (amt * Double(pct) / 100).rounded()
        let total = amt + tip
        List {
            TextField("Order total", text: $bill).keyboardType(.decimalPad)
            Picker("Tip", selection: $pct) { ForEach([5, 10, 15, 20], id: \.self) { Text("\($0)%").tag($0) } }.pickerStyle(.segmented)
            TextField("People", text: $people).keyboardType(.numberPad)
            KV("Tip (\(String(format: "%.0f", pct)%)", "$\(tip))")
            KV("Total", "$\(String(format: "%.2f", total))")
            KV("Per person", "$\(String(format: "%.0f", (total / Double(Int(people) ?? 1)).rounded()))")
        }.navigationTitle("Tip Calculator")
    }
}

struct FuelView: View {
    @State private var distance = ""
    @State private var vehicle = "bike"
    @State private var cost: Double?
    let rates = ["bike": 2.5, "car": 8.0, "bus": 1.5]
    var body: some View {
        List {
            TextField("Distance (km)", text: $distance).keyboardType(.decimalPad)
            Picker("Vehicle", selection: $vehicle) { ForEach(["bike", "car", "bus"], id: \.self) { Text($0).tag($0) } }.pickerStyle(.segmented)
            Button("Calculate") { cost = ((Double(distance) ?? 0) * (rates[vehicle] ?? 0)).rounded() }.disabled(distance.isEmpty)
            if let c = cost { KV("Trip cost", "$\(String(format: "%.0f", c))") }
        }.navigationTitle("Fuel Cost")
    }
}

struct MeasureView: View {
    @State private var value = ""
    @State private var from = "inch"
    @State private var result = ""
    let conv: [String: [String: Double]] = ["inch": ["cm": 2.54, "mm": 25.4], "cm": ["inch": 0.3937, "mm": 10], "kg": ["lb": 2.20462, "g": 1000], "lb": ["kg": 0.453592, "g": 453.592]]
    var body: some View {
        List {
            TextField("Value", text: $value).keyboardType(.decimalPad)
            Picker("From", selection: $from) { ForEach(["inch", "cm", "kg", "lb"], id: \.self) { Text($0).tag($0) } }.pickerStyle(.segmented)
            Button("Convert") {
                if let v = Double(value), let c = conv[from] {
                    let target = (from == "inch" || from == "cm") ? "cm" : "kg"
                    result = String(format: "%.2f %@", v * (c[target] ?? 1), target)
                }
            }.disabled(value.isEmpty)
            if !result.isEmpty { KV("Result", result) }
        }.navigationTitle("Measurement Converter")
    }
}

struct CarbonView: View {
    @State private var distance = ""
    @State private var weight = ""
    var body: some View {
        let carbon = ((Double(distance) ?? 0) * (Double(weight) ?? 0) * 0.0001 * 100).rounded() / 100
        List {
            TextField("Distance (km)", text: $distance).keyboardType(.decimalPad)
            TextField("Weight (kg)", text: $weight).keyboardType(.decimalPad)
            KV("Carbon footprint", "\(String(format: "%.2f", carbon)) kg")
        }.navigationTitle("Carbon Footprint")
    }
}

struct RoiCalcView: View {
    @State private var investment = "4999"
    @State private var traffic = "1000"
    @State private var conversion = "3"
    @State private var value = "500"
    var body: some View {
        let inv = Double(investment) ?? 0
        let leads = ((Double(traffic) ?? 0) * (Double(conversion) ?? 0) / 100).rounded()
        let revenue = leads * (Double(value) ?? 0)
        List {
            TextField("Investment", text: $investment).keyboardType(.decimalPad)
            TextField("Monthly traffic", text: $traffic).keyboardType(.decimalPad)
            TextField("Conversion rate %", text: $conversion).keyboardType(.decimalPad)
            TextField("Customer value", text: $value).keyboardType(.decimalPad)
            KV("Monthly leads", "\(String(format: "%.0f", leads))")
            KV("Monthly revenue", "$\(String(format: "%.2f", revenue))")
            KV("Payback (months)", revenue > 0 ? "\(String(format: "%.1f", inv / revenue))" : "—")
            KV("Yearly ROI", inv > 0 ? "\(String(format: "%.1f", (revenue * 12 - inv) / inv * 100))%" : "—")
        }.navigationTitle("ROI Calculator")
    }
}

struct ResaleView: View {
    @State private var price = ""
    @State private var age = ""
    @State private var condition = "good"
    let rates = ["excellent": 0.8, "good": 0.6, "fair": 0.4, "poor": 0.2]
    var body: some View {
        let current = ((Double(price) ?? 0) * pow(1 - 0.15, Double(Int(age) ?? 0)) * (rates[condition] ?? 0.6)).rounded()
        List {
            TextField("Purchase price", text: $price).keyboardType(.decimalPad)
            TextField("Age (years)", text: $age).keyboardType(.numberPad)
            Picker("Condition", selection: $condition) { ForEach(["excellent", "good", "fair", "poor"], id: \.self) { Text($0).tag($0) } }.pickerStyle(.segmented)
            KV("Current value", "$\(String(format: "%.0f", current))")
        }.navigationTitle("Resale Value")
    }
}

struct InstallmentCompareView: View {
    @State private var amount = ""
    let plans = [(3, 0.0), (6, 5.0), (9, 8.0), (12, 10.0)]
    var body: some View {
        let amt = Double(amount) ?? 0
        List {
            TextField("Amount", text: $amount).keyboardType(.decimalPad)
            ForEach(Array(plans.enumerated()), id: \.offset) { _, plan in let (months, rate) = plan
                let emi = ((amt + amt * rate / 100) / Double(months)).rounded()
                let total = (amt + amt * rate / 100).rounded()
                KV("\(String(format: "%.0f", months) mo · \(rate))%", "$\(String(format: "%.0f", emi))/mo · $\(String(format: "%.0f", total))")
            }
        }.navigationTitle("Compare Installments")
    }
}

private struct KV: View {
    let k: String
    let v: String
    init(_ k: String, _ v: String) { self.k = k; self.v = v }
    var body: some View {
        HStack { Text(k).foregroundColor(.secondary); Spacer(); Text(v).bold() }
    }
}
