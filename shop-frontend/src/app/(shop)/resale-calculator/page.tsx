'use client'

import { useState } from 'react'
import { TrendingUp, DollarSign, Calendar, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function ResaleCalculatorPage() {
  const [purchasePrice, setPurchasePrice] = useState('')
  const [age, setAge] = useState('')
  const [condition, setCondition] = useState('good')

  const price = parseFloat(purchasePrice) || 0
  const years = parseInt(age) || 0

  const depreciationRates: Record<string, number> = {
    excellent: 0.8,
    good: 0.6,
    fair: 0.4,
    poor: 0.2,
  }

  const yearlyDepreciation = 0.15
  const currentValue = Math.round(price * Math.pow(1 - yearlyDepreciation, years) * depreciationRates[condition])

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <TrendingUp className="h-8 w-8 text-blue-600" />
          Resale Calculator
        </h1>
        <p className="text-muted-foreground">
          Enter purchase price & age  "Resale value: X" with depreciation graph
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Product Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Purchase Price
            </label>
            <Input 
              type="number"
              placeholder="10,000"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Age (years)
            </label>
            <Input 
              type="number"
              placeholder="2"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Condition</label>
            <div className="flex gap-2 mt-1">
              {['excellent', 'good', 'fair', 'poor'].map((c) => (
                <Button 
                  key={c}
                  size="sm"
                  variant={condition === c ? 'default' : 'outline'}
                  onClick={() => setCondition(c)}
                >
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {price > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Estimated Resale Value</p>
              <p className="text-4xl font-bold text-blue-700">{currentValue}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Depreciation: {price - currentValue} ({Math.round((price - currentValue) / price * 100)}%)
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
