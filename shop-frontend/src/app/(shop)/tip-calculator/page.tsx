'use client'

import { useState } from 'react'
import { Coins, DollarSign, Users, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function TipCalculatorPage() {
  const [bill, setBill] = useState('')
  const [people, setPeople] = useState('1')
  const [percentage, setPercentage] = useState(10)

  const billAmount = parseFloat(bill) || 0
  const tip = Math.round(billAmount * (percentage / 100))
  const total = billAmount + tip
  const perPerson = Math.round(total / (parseInt(people) || 1))

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Coins className="h-8 w-8 text-yellow-600" />
          Tip Calculator
        </h1>
        <p className="text-muted-foreground">
          Enter order total  auto-calculate tip for delivery personnel
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculate Tip
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Order Total
            </label>
            <Input 
              type="number"
              placeholder="Enter order amount"
              value={bill}
              onChange={(e) => setBill(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Tip Percentage</label>
            <div className="flex gap-2 mt-1">
              {[5, 10, 15, 20].map((p) => (
                <Button 
                  key={p} 
                  variant={percentage === p ? 'default' : 'outline'}
                  onClick={() => setPercentage(p)}
                >
                  {p}%
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Number of People
            </label>
            <Input 
              type="number"
              min="1"
              value={people}
              onChange={(e) => setPeople(e.target.value)}
            />
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Tip Amount</p>
                <p className="text-2xl font-bold text-yellow-700">{tip}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total with Tip</p>
                <p className="text-2xl font-bold text-yellow-700">{total}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t text-center">
              <p className="text-sm text-muted-foreground">Per Person</p>
              <p className="text-xl font-bold">{perPerson}</p>
            </div>
          </div>

          <Button className="w-full" size="lg">
            Add Tip to Order
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
