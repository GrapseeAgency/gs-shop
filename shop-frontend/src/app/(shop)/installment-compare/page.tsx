'use client'

import { useState } from 'react'
import { CreditCard, TrendingUp, BarChart3, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function InstallmentComparePage() {
  const [amount, setAmount] = useState('')
  const plans = [
    { months: 3, rate: 0, emi: 0 },
    { months: 6, rate: 5, emi: 0 },
    { months: 9, rate: 8, emi: 0 },
    { months: 12, rate: 10, emi: 0 },
  ]

  const amt = parseFloat(amount) || 0
  const calculatedPlans = plans.map(plan => ({
    ...plan,
    emi: Math.round((amt + (amt * plan.rate / 100)) / plan.months),
    total: Math.round(amt + (amt * plan.rate / 100))
  }))

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <CreditCard className="h-8 w-8 text-blue-600" />
          Installment Compare
        </h1>
        <p className="text-muted-foreground">
          EMI cost: 3-month free vs 6-month at 5% interest  comparison table
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Enter Purchase Amount</CardTitle>
        </CardHeader>
        <CardContent>
          <Input 
            type="number"
            placeholder="10,000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </CardContent>
      </Card>

      {amount && (
        <div className="grid gap-4">
          {calculatedPlans.map((plan) => (
            <Card key={plan.months} className={plan.months === 3 ? 'border-green-500' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{plan.months} Months</h3>
                      {plan.months === 3 && <Badge className="bg-green-500">BEST</Badge>}
                      {plan.rate === 0 && <Badge variant="secondary">0% Interest</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Interest: {plan.rate}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{plan.emi}/mo</p>
                    <p className="text-sm text-muted-foreground">Total: {plan.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
