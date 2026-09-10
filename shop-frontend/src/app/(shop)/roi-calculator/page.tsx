'use client'

import { useState } from 'react'
import { Calculator, TrendingUp, DollarSign, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function ROICalculatorPage() {
  const [investment, setInvestment] = useState(4999)
  const [conversionRate, setConversionRate] = useState(3)
  const [customerValue, setCustomerValue] = useState(500)
  const [monthlyTraffic, setMonthlyTraffic] = useState(1000)

  const monthlyLeads = Math.round(monthlyTraffic * (conversionRate / 100))
  const monthlyRevenue = monthlyLeads * customerValue
  const paybackMonths = investment / monthlyRevenue
  const yearlyROI = ((monthlyRevenue * 12) - investment) / investment * 100

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Calculator className="h-10 w-10 text-green-600" />
          ROI Calculator
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          See the return on your investment
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Inputs</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <label className="text-sm font-medium flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4" />
                Website Investment ()
              </label>
              <Input
                type="number"
                value={investment}
                onChange={(e) => setInvestment(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm font-medium flex items-center gap-2 mb-2">
                <Users className="h-4 w-4" />
                Monthly Website Visitors
              </label>
              <Input
                type="number"
                value={monthlyTraffic}
                onChange={(e) => setMonthlyTraffic(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2">Conversion Rate (%)</label>
              <Input
                type="number"
                value={conversionRate}
                onChange={(e) => setConversionRate(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2">Average Customer Value ()</label>
              <Input
                type="number"
                value={customerValue}
                onChange={(e) => setCustomerValue(Number(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Projected Returns
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Payback Period</p>
              <p className="text-4xl font-bold text-green-600">{paybackMonths.toFixed(1)} months</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Monthly Leads</p>
                <p className="text-2xl font-bold">{monthlyLeads}</p>
              </div>
              <div className="bg-white p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold text-green-600">{monthlyRevenue.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-green-600 text-white p-4 rounded-lg text-center">
              <p className="text-sm mb-1">1-Year ROI</p>
              <p className="text-5xl font-bold">{yearlyROI.toFixed(0)}%</p>
            </div>

            <Button className="w-full" size="lg">
              Start Your Project - {investment}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
