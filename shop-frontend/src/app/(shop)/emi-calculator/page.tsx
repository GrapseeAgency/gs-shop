'use client'

import { useState } from 'react'
import { Calculator, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function EMICalculatorPage() {
  const [amount, setAmount] = useState(5000)
  const [tenure, setTenure] = useState(6)
  const [interestRate, setInterestRate] = useState(0)

  const calculateEMI = () => {
    const principal = amount
    const months = tenure
    const rate = interestRate / 100 / 12

    let monthlyEMI: number
    if (rate === 0) {
      monthlyEMI = principal / months
    } else {
      monthlyEMI = principal * rate * Math.pow(1 + rate, months) / (Math.pow(1 + rate, months) - 1)
    }

    const totalPayment = monthlyEMI * months
    const totalInterest = totalPayment - principal
    const processingFee = principal * 0.02

    return {
      monthlyEMI: Math.round(monthlyEMI * 100) / 100,
      totalPayment: Math.round(totalPayment * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      processingFee: Math.round(processingFee * 100) / 100
    }
  }

  const emi = calculateEMI()

  const tenureOptions = [3, 6, 9, 12, 18, 24]

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calculator className="h-6 w-6" />
          EMI Calculator
        </h1>
        <p className="text-muted-foreground">
          Calculate your monthly installments for digital services
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calculate EMI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Amount Input */}
          <div className="space-y-2">
            <Label>Service Amount</Label>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold">$</span>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min={1000}
                max={100000}
                className="text-lg"
              />
            </div>
            <Slider
              value={[amount]}
              max={50000}
              min={1000}
              step={100}
              onValueChange={(v) => setAmount(v[0])}
            />
          </div>

          {/* Tenure Selection */}
          <div className="space-y-2">
            <Label>Tenure (Months)</Label>
            <div className="flex flex-wrap gap-2">
              {tenureOptions.map((option) => (
                <Button
                  key={option}
                  variant={tenure === option ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTenure(option)}
                >
                  {option} months
                </Button>
              ))}
            </div>
          </div>

          {/* Interest Rate */}
          <div className="space-y-2">
            <Label>Interest Rate (% per annum)</Label>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                min={0}
                max={30}
                step={0.1}
              />
              <span className="text-muted-foreground">%</span>
            </div>
            <Slider
              value={[interestRate]}
              max={30}
              min={0}
              step={0.5}
              onValueChange={(v) => setInterestRate(v[0])}
            />
          </div>

          <Separator />

          {/* Results */}
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Monthly EMI</p>
              <p className="text-3xl font-bold text-emerald-600">
                ${emi.monthlyEMI.toFixed(2)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Principal Amount</p>
                <p className="font-semibold">${amount.toFixed(2)}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Total Interest</p>
                <p className="font-semibold">${emi.totalInterest.toFixed(2)}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Processing Fee (2%)</p>
                <p className="font-semibold">${emi.processingFee.toFixed(2)}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Total Payment</p>
                <p className="font-semibold">${emi.totalPayment.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <Button className="w-full gap-2" size="lg">
            Browse EMI Services
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <div className="mt-6 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-2">EMI Terms:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Minimum order value: $1,000</li>
          <li>No interest on 3-month EMI</li>
          <li>2% processing fee applicable</li>
          <li>Available for services above $5,000</li>
        </ul>
      </div>
    </div>
  )
}
