package com.grapsee.shop.features.info

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import kotlin.math.pow
import kotlin.math.round

// ------------------------------------------------------------ shared bits

@Composable
private fun CalcShell(title: String, subtitle: String, onBack: () -> Unit, content: @Composable () -> Unit) {
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        InfoHeader(title, subtitle, onBack)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                InfoCard { content() }
            }
        }
    }
}

@Composable
private fun NumField(label: String, value: String, onValue: (String) -> Unit) {
    OutlinedTextField(
        value = value,
        onValueChange = { v -> onValue(v.filter { it.isDigit() || it == '.' }) },
        label = { Text(label) },
        singleLine = true,
        modifier = Modifier.fillMaxWidth(),
    )
}

@Composable
private fun ResultRow(label: String, value: String, highlight: Boolean = false) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
        Text(label, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.weight(1f))
        Text(value, style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Bold, color = if (highlight) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface)
    }
}

@Composable
private fun OptionChips(options: List<String>, selected: String, onPick: (String) -> Unit) {
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        options.forEach { option ->
            val isSelected = option == selected
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
                modifier = Modifier.clip(RoundedCornerShape(20.dp)).clickable { onPick(option) },
            ) {
                Text(option, modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp), style = MaterialTheme.typography.labelLarge, color = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface)
            }
        }
    }
}

private fun money(v: Double): String = "$" + "%,.2f".format(v)

// ------------------------------------------------------------------- EMI
// Web: emi-calculator — principal/tenure/rate + 2% processing fee.

class EmiViewModel : ViewModel() {
    var amount by mutableStateOf("5000"); private set
    var tenure by mutableStateOf("6"); private set
    var rate by mutableStateOf("0"); private set
    fun updateAmount(v: String) { amount = v.filter { it.isDigit() || it == '.' } }
    fun updateTenure(v: String) { tenure = v.filter { it.isDigit() } }
    fun updateRate(v: String) { rate = v.filter { it.isDigit() || it == '.' } }
}

@Composable
fun EmiScreen(onBack: () -> Unit, vm: EmiViewModel = androidx.lifecycle.viewmodel.compose.viewModel()) {
    CalcShell("EMI Calculator", "Monthly installments for services", onBack) {
        NumField("Service amount", vm.amount, vm::updateAmount)
        NumField("Tenure (months)", vm.tenure, vm::updateTenure)
        NumField("Annual interest %", vm.rate, vm::updateRate)
        val principal = vm.amount.toDoubleOrNull() ?: 0.0
        val months = (vm.tenure.toIntOrNull() ?: 0).coerceAtLeast(1)
        val monthly = (vm.rate.toDoubleOrNull() ?: 0.0) / 100 / 12
        val emi = if (monthly == 0.0) principal / months
        else principal * monthly * (1 + monthly).pow(months) / ((1 + monthly).pow(months) - 1)
        val total = emi * months
        ResultRow("Monthly EMI", money(round(emi * 100) / 100), highlight = true)
        ResultRow("Total payment", money(round(total * 100) / 100))
        ResultRow("Total interest", money(round((total - principal) * 100) / 100))
        ResultRow("Processing fee (2%)", money(round(principal * 0.02 * 100) / 100))
    }
}

// -------------------------------------------------------------- currency
// Web: currency-converter — USD 83.5, EUR 90.2, GBP 105.8, JPY 0.56 (to BDT).

class CurrencyViewModel : ViewModel() {
    var amount by mutableStateOf(""); private set
    var from by mutableStateOf("USD"); private set
    var result by mutableStateOf<Double?>(null); private set
    val rates = mapOf("USD" to 83.5, "EUR" to 90.2, "GBP" to 105.8, "JPY" to 0.56)
    fun updateAmount(v: String) { amount = v.filter { it.isDigit() || it == '.' }; result = null }
    fun pick(v: String) { from = v; result = null }
    fun convert() {
        val amt = amount.toDoubleOrNull() ?: 0.0
        result = round(amt * (rates[from] ?: 1.0)).toDouble()
    }
}

@Composable
fun CurrencyScreen(onBack: () -> Unit, vm: CurrencyViewModel = androidx.lifecycle.viewmodel.compose.viewModel()) {
    CalcShell("Currency Converter", "To BDT at store rates", onBack) {
        NumField("Amount", vm.amount, vm::updateAmount)
        OptionChips(vm.rates.keys.toList(), vm.from, vm::pick)
        Button(onClick = vm::convert, enabled = vm.amount.isNotBlank(), modifier = Modifier.fillMaxWidth()) { Text("Convert") }
        vm.result?.let { ResultRow("Converted", "৳" + "%,.0f".format(it), highlight = true) }
    }
}

// ------------------------------------------------------------------- tip
// Web: tip-calculator — tip = round(bill * pct/100); total; per person.

class TipViewModel : ViewModel() {
    var bill by mutableStateOf(""); private set
    var people by mutableStateOf("1"); private set
    var pct by mutableStateOf(10)
    private set
    fun updateBill(v: String) { bill = v.filter { it.isDigit() || it == '.' } }
    fun updatePeople(v: String) { people = v.filter { it.isDigit() } }
    fun pickPct(v: Int) { pct = v }
}

@Composable
fun TipScreen(onBack: () -> Unit, vm: TipViewModel = androidx.lifecycle.viewmodel.compose.viewModel()) {
    CalcShell("Tip Calculator", "Fair tips for delivery staff", onBack) {
        NumField("Order total", vm.bill, vm::updateBill)
        Text("Tip percentage", style = MaterialTheme.typography.labelLarge)
        OptionChips(listOf("5", "10", "15", "20"), vm.pct.toString()) { vm.pickPct(it.toInt()) }
        NumField("People", vm.people, vm::updatePeople)
        val billAmount = vm.bill.toDoubleOrNull() ?: 0.0
        val tip = round(billAmount * vm.pct / 100).toDouble()
        val total = billAmount + tip
        val perPerson = round(total / (vm.people.toIntOrNull() ?: 1)).toDouble()
        ResultRow("Tip (${vm.pct}%)", money(tip), highlight = true)
        ResultRow("Total", money(total))
        ResultRow("Per person", money(perPerson))
    }
}

// ------------------------------------------------------------------ fuel
// Web: fuel-cost-calculator — bike 2.5, car 8, bus 1.5 per km.

class FuelViewModel : ViewModel() {
    var distance by mutableStateOf(""); private set
    var vehicle by mutableStateOf("bike"); private set
    var cost by mutableStateOf<Double?>(null); private set
    val rates = mapOf("bike" to 2.5, "car" to 8.0, "bus" to 1.5)
    fun updateDistance(v: String) { distance = v.filter { it.isDigit() || it == '.' }; cost = null }
    fun pick(v: String) { vehicle = v; cost = null }
    fun calculate() {
        val dist = distance.toDoubleOrNull() ?: 0.0
        cost = round(dist * (rates[vehicle] ?: 0.0)).toDouble()
    }
}

@Composable
fun FuelScreen(onBack: () -> Unit, vm: FuelViewModel = androidx.lifecycle.viewmodel.compose.viewModel()) {
    CalcShell("Fuel Cost", "Trip cost by vehicle", onBack) {
        NumField("Distance (km)", vm.distance, vm::updateDistance)
        OptionChips(listOf("bike", "car", "bus"), vm.vehicle, vm::pick)
        Button(onClick = vm::calculate, enabled = vm.distance.isNotBlank(), modifier = Modifier.fillMaxWidth()) { Text("Calculate") }
        vm.cost?.let { ResultRow("Trip cost", money(it), highlight = true) }
    }
}

// ----------------------------------------------------------- measurement
// Web: measurement-converter — inch/cm/mm, cm/inch/mm, kg/lb/g, lb/kg/g.

class MeasureViewModel : ViewModel() {
    var value by mutableStateOf(""); private set
    var from by mutableStateOf("inch"); private set
    var result by mutableStateOf(""); private set
    private val conversions = mapOf(
        "inch" to mapOf("cm" to 2.54, "mm" to 25.4),
        "cm" to mapOf("inch" to 0.3937, "mm" to 10.0),
        "kg" to mapOf("lb" to 2.20462, "g" to 1000.0),
        "lb" to mapOf("kg" to 0.453592, "g" to 453.592),
    )
    fun updateValue(v: String) { value = v.filter { it.isDigit() || it == '.' }; result = "" }
    fun pick(v: String) { from = v; result = "" }
    fun convert() {
        val num = value.toDoubleOrNull() ?: return
        val conv = conversions[from] ?: return
        val target = if (from == "inch" || from == "cm") "cm" else "kg"
        result = "%.2f".format(num * (conv[target] ?: 1.0)) + " $target"
    }
}

@Composable
fun MeasureScreen(onBack: () -> Unit, vm: MeasureViewModel = androidx.lifecycle.viewmodel.compose.viewModel()) {
    CalcShell("Measurement Converter", "Length & weight units", onBack) {
        NumField("Value", vm.value, vm::updateValue)
        OptionChips(listOf("inch", "cm", "kg", "lb"), vm.from, vm::pick)
        Button(onClick = vm::convert, enabled = vm.value.isNotBlank(), modifier = Modifier.fillMaxWidth()) { Text("Convert") }
        if (vm.result.isNotEmpty()) ResultRow("Result", vm.result, highlight = true)
    }
}

// ---------------------------------------------------------------- carbon
// Web: carbon-calculator — carbon = round(dist * weight * 0.0001 * 100) / 100 kg.

class CarbonViewModel : ViewModel() {
    var distance by mutableStateOf(""); private set
    var weight by mutableStateOf(""); private set
    fun updateDistance(v: String) { distance = v.filter { it.isDigit() || it == '.' } }
    fun updateWeight(v: String) { weight = v.filter { it.isDigit() || it == '.' } }
}

@Composable
fun CarbonScreen(onBack: () -> Unit, vm: CarbonViewModel = androidx.lifecycle.viewmodel.compose.viewModel()) {
    CalcShell("Carbon Footprint", "Shipping emissions (kg CO₂)", onBack) {
        NumField("Distance (km)", vm.distance, vm::updateDistance)
        NumField("Weight (kg)", vm.weight, vm::updateWeight)
        val dist = vm.distance.toDoubleOrNull() ?: 0.0
        val weight = vm.weight.toDoubleOrNull() ?: 0.0
        val carbon = round(dist * weight * 0.0001 * 100) / 100
        ResultRow("Carbon footprint", "$carbon kg", highlight = true)
    }
}

// ------------------------------------------------------------------- roi
// Web: roi-calculator — leads = traffic*conv%; revenue = leads*value;
// payback = investment/revenue; yearlyROI = (rev*12-invest)/invest*100.

class RoiViewModel : ViewModel() {
    var investment by mutableStateOf("4999"); private set
    var conversion by mutableStateOf("3"); private set
    var value by mutableStateOf("500"); private set
    var traffic by mutableStateOf("1000"); private set
    fun updateInvestment(v: String) { investment = v.filter { it.isDigit() || it == '.' } }
    fun updateConversion(v: String) { conversion = v.filter { it.isDigit() || it == '.' } }
    fun updateValue(v: String) { value = v.filter { it.isDigit() || it == '.' } }
    fun updateTraffic(v: String) { traffic = v.filter { it.isDigit() || it == '.' } }
}

@Composable
fun RoiScreen(onBack: () -> Unit, vm: RoiViewModel = androidx.lifecycle.viewmodel.compose.viewModel()) {
    CalcShell("ROI Calculator", "Website investment returns", onBack) {
        NumField("Investment", vm.investment, vm::updateInvestment)
        NumField("Monthly traffic", vm.traffic, vm::updateTraffic)
        NumField("Conversion rate %", vm.conversion, vm::updateConversion)
        NumField("Customer value", vm.value, vm::updateValue)
        val investment = vm.investment.toDoubleOrNull() ?: 0.0
        val traffic = vm.traffic.toDoubleOrNull() ?: 0.0
        val conv = vm.conversion.toDoubleOrNull() ?: 0.0
        val value = vm.value.toDoubleOrNull() ?: 0.0
        val leads = round(traffic * conv / 100).toDouble()
        val revenue = leads * value
        val payback = if (revenue > 0) investment / revenue else 0.0
        val yearly = if (investment > 0) (revenue * 12 - investment) / investment * 100 else 0.0
        ResultRow("Monthly leads", "%.0f".format(leads), highlight = true)
        ResultRow("Monthly revenue", money(revenue))
        ResultRow("Payback (months)", "%.1f".format(payback))
        ResultRow("Yearly ROI", "%.1f%%".format(yearly))
    }
}

// ---------------------------------------------------------------- resale
// Web: resale-calculator — value = round(price * (1-0.15)^years * conditionRate).

class ResaleViewModel : ViewModel() {
    var price by mutableStateOf(""); private set
    var age by mutableStateOf(""); private set
    var condition by mutableStateOf("good"); private set
    val rates = mapOf("excellent" to 0.8, "good" to 0.6, "fair" to 0.4, "poor" to 0.2)
    fun updatePrice(v: String) { price = v.filter { it.isDigit() || it == '.' } }
    fun updateAge(v: String) { age = v.filter { it.isDigit() } }
    fun pick(v: String) { condition = v }
}

@Composable
fun ResaleScreen(onBack: () -> Unit, vm: ResaleViewModel = androidx.lifecycle.viewmodel.compose.viewModel()) {
    CalcShell("Resale Value", "What your gear is worth", onBack) {
        NumField("Purchase price", vm.price, vm::updatePrice)
        NumField("Age (years)", vm.age, vm::updateAge)
        OptionChips(listOf("excellent", "good", "fair", "poor"), vm.condition, vm::pick)
        val price = vm.price.toDoubleOrNull() ?: 0.0
        val years = vm.age.toIntOrNull() ?: 0
        val current = round(price * (1 - 0.15).pow(years) * (vm.rates[vm.condition] ?: 0.6)).toDouble()
        ResultRow("Current value", money(current), highlight = true)
    }
}

// ----------------------------------------------------- installment compare
// Web: installment-compare — plans 3/0%, 6/5%, 9/8%, 12/10%:
// emi = round((amt + amt*rate/100)/months), total = round(amt + amt*rate/100).

class InstallmentCompareViewModel : ViewModel() {
    var amount by mutableStateOf(""); private set
    fun updateAmount(v: String) { amount = v.filter { it.isDigit() || it == '.' } }
    val plans = listOf(Triple(3, 0.0, "0% interest"), Triple(6, 5.0, "5%"), Triple(9, 8.0, "8%"), Triple(12, 10.0, "10%"))
}

@Composable
fun InstallmentCompareScreen(onBack: () -> Unit, vm: InstallmentCompareViewModel = androidx.lifecycle.viewmodel.compose.viewModel()) {
    CalcShell("Compare Installments", "Pick the cheapest plan", onBack) {
        NumField("Amount", vm.amount, vm::updateAmount)
        val amt = vm.amount.toDoubleOrNull() ?: 0.0
        vm.plans.forEach { (months, rate, label) ->
            val emi = round((amt + amt * rate / 100) / months).toDouble()
            val total = round(amt + amt * rate / 100).toDouble()
            ResultRow("$months mo · $label", "${money(emi)}/mo · ${money(total)} total")
        }
    }
}
