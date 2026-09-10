'use client'

import { useState } from 'react'
import { Layers, Percent, Tag, ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function DiscountStackingPage() {
  const [price, setPrice] = useState('')
  const [discounts, setDiscounts] = useState<string[]>([])

  const available = ['10% First User', '50 Coupon', '5% Card Offer', '20 Wallet']

  const addDiscount = (d: string) => {
    if (!discounts.includes(d)) {
      setDiscounts([...discounts, d])
      toast.success(`${d} added!`)
    }
  }

  const calculateFinal = () => {
    let final = parseFloat(price) || 0
    discounts.forEach(d => {
      if (d.includes('%')) {
        const pct = parseInt(d)
        final = final * (100 - pct) / 100
      } else {
        const amt = parseInt(d.replace(/\D/g, ''))
        final = Math.max(0, final - amt)
      }
    })
    return Math.round(final)
  }

  const original = parseFloat(price) || 0
  const final = calculateFinal()
  const savings = original - final

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Layers className="h-8 w-8 text-green-600" />
          Discount Stacking
        </h1>
        <p className="text-muted-foreground">
          Apply: 10% first user + 50 coupon + 5% card offer  final price breakdown
        </p>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Product Price</CardTitle>
        </CardHeader>
        <CardContent>
          <Input 
            type="number"
            placeholder="Enter price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Available Discounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {available.map(d => (
              <Button 
                key={d}
                variant={discounts.includes(d) ? 'default' : 'outline'}
                size="sm"
                onClick={() => addDiscount(d)}
                disabled={discounts.includes(d)}
              >
                {discounts.includes(d) && <CheckCircle className="h-3 w-3 mr-1" />}
                {d}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {price && discounts.length > 0 && (
        <Card className="bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span>Original Price</span>
              <span className="line-through">{original}</span>
            </div>
            {discounts.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-sm text-green-700 mb-2">
                <span>{d}</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            ))}
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between">
                <span className="font-bold">Final Price</span>
                <span className="text-2xl font-bold text-green-700">{final}</span>
              </div>
              <div className="text-center mt-2">
                <Badge className="bg-green-500">You Save {savings}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
