'use client'

import { useState } from 'react'
import { Calculator, TrendingUp, AlertCircle, Star, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function ValueCalculator() {
  const [price, setPrice] = useState('')
  const [uses, setUses] = useState('')
  const [years, setYears] = useState('')

  const calculateValue = () => {
    const p = parseFloat(price)
    const u = parseFloat(uses)
    const y = parseFloat(years)

    if (!p || !u || !y) return null

    const costPerUse = p / (u * y)
    const monthlyCost = p / (y * 12)
    
    return {
      costPerUse: costPerUse.toFixed(2),
      monthlyCost: monthlyCost.toFixed(2),
      totalUses: (u * y).toLocaleString(),
      value: costPerUse < 10 ? 'excellent' : costPerUse < 50 ? 'good' : 'fair'
    }
  }

  const result = calculateValue()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="h-4 w-4" />
          Value Per Use Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Calculate the true cost per use before buying. Helps you make smarter purchases!
        </p>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Price ()</label>
            <Input
              type="number"
              placeholder="2000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Uses per month</label>
            <Input
              type="number"
              placeholder="10"
              value={uses}
              onChange={(e) => setUses(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Years of use</label>
            <Input
              type="number"
              placeholder="3"
              value={years}
              onChange={(e) => setYears(e.target.value)}
            />
          </div>
        </div>

        {result && (
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Cost per use:</span>
              <span className="text-xl font-bold">{result.costPerUse}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Monthly cost:</span>
              <span>{result.monthlyCost}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Total uses:</span>
              <span>{result.totalUses}</span>
            </div>
            <Badge 
              className={`mt-2 ${
                result.value === 'excellent' ? 'bg-emerald-500' : 
                result.value === 'good' ? 'bg-blue-500' : 'bg-amber-500'
              }`}
            >
              {result.value === 'excellent' ? <><Star className="h-3 w-3 inline mr-1" /> Excellent Value</> : 
               result.value === 'good' ? <><CheckCircle2 className="h-3 w-3 inline mr-1" /> Good Value</> : <><AlertTriangle className="h-3 w-3 inline mr-1" /> Consider Carefully</>}
            </Badge>
          </div>
        )}

        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          <p>
            Example: 2000 jacket worn 100 times over 3 years = 6.67 per use.
            500 jacket worn 5 times = 100 per use. Which is truly cheaper?
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
