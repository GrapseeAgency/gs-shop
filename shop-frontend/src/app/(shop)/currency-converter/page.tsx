'use client'

import { useState } from 'react'
import { DollarSign, RefreshCw, Globe, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function CurrencyConverterPage() {
  const [amount, setAmount] = useState('')
  const [fromCurrency, setFromCurrency] = useState('USD')
  const [converted, setConverted] = useState<number | null>(null)

  const rates: Record<string, number> = {
    USD: 83.5,
    EUR: 90.2,
    GBP: 105.8,
    JPY: 0.56,
  }

  const convert = () => {
    const amt = parseFloat(amount) || 0
    setConverted(Math.round(amt * rates[fromCurrency]))
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Globe className="h-8 w-8 text-blue-600" />
          Currency Converter
        </h1>
        <p className="text-muted-foreground">
          $299  24,917 (real-time rate, history graph, fee-free cards)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Convert Currency
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Amount</label>
            <Input 
              type="number"
              placeholder="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">From</label>
            <div className="flex gap-2 mt-1">
              {Object.keys(rates).map((curr) => (
                <Button 
                  key={curr}
                  size="sm"
                  variant={fromCurrency === curr ? 'default' : 'outline'}
                  onClick={() => setFromCurrency(curr)}
                >
                  {curr}
                </Button>
              ))}
            </div>
          </div>

          <Button className="w-full" onClick={convert}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Convert to INR
          </Button>

          {converted !== null && (
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">{amount} {fromCurrency} =</p>
              <p className="text-4xl font-bold text-blue-700">{converted}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <Badge className="bg-green-500">Rate: {rates[fromCurrency]}</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
