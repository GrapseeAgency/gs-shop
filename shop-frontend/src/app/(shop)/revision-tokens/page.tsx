'use client'

import { useState } from 'react'
import { Coins, Plus, ShoppingCart, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function RevisionTokensPage() {
  const [tokens, setTokens] = useState(3)
  const [buying, setBuying] = useState(false)

  const packages = [
    { quantity: 1, price: 499, label: 'Single Token' },
    { quantity: 3, price: 1299, label: 'Triple Pack', savings: 198 },
    { quantity: 5, price: 1999, label: 'Value Pack', savings: 496 }
  ]

  const buyTokens = (quantity: number, price: number) => {
    setBuying(true)
    setTimeout(() => {
      setTokens(tokens + quantity)
      setBuying(false)
      toast.success(`Added ${quantity} tokens!`)
    }, 1000)
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Coins className="h-10 w-10 text-yellow-600" />
          Revision Tokens
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Need more revisions? Get tokens instantly
        </p>
      </div>

      <Card className="mb-8 bg-yellow-50">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-2">Your Balance</p>
          <p className="text-5xl font-bold text-yellow-600">{tokens}</p>
          <p className="text-sm text-muted-foreground">tokens remaining</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.quantity} className={pkg.quantity === 3 ? 'border-yellow-500 border-2' : ''}>
            <CardContent className="p-6 text-center">
              {pkg.savings && (
                <Badge className="mb-4 bg-green-500">Save {pkg.savings}</Badge>
              )}
              <h3 className="text-2xl font-bold mb-2">{pkg.label}</h3>
              <p className="text-4xl font-bold text-yellow-600 mb-4">{pkg.price}</p>
              <p className="text-sm text-muted-foreground mb-4">
                {Math.round(pkg.price / pkg.quantity)} per token
              </p>
              <Button 
                className="w-full" 
                onClick={() => buyTokens(pkg.quantity, pkg.price)}
                disabled={buying}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Buy Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">1</div>
              <span>Buy tokens for any revision requests beyond your included revisions</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">2</div>
              <span>Each token = 1 round of revisions (unlimited changes in that round)</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">3</div>
              <span>Tokens never expire - use them anytime for any project</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
