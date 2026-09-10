'use client'

import { useState } from 'react'
import { History, Clock, ShoppingCart, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function FlashbackDealsPage() {
  const [pastDeals] = useState([
    { name: 'Air Fryer', price: 2999, oldPrice: 4999, date: 'Last Diwali', savings: 2000 },
    { name: 'Bluetooth Speaker', price: 999, oldPrice: 1999, date: 'Last Christmas', savings: 1000 },
    { name: 'Running Shoes', price: 1499, oldPrice: 2999, date: 'Independence Day', savings: 1500 },
  ])

  const addToCart = (item: any) => {
    toast.success(`${item.name} added! You saved ${item.savings}`)
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <History className="h-8 w-8 text-pink-600" />
          Flashback Deals
        </h1>
        <p className="text-muted-foreground">
          "Last Diwali you bought at 2999"  "Available again, same price"
        </p>
      </div>

      <div className="grid gap-4">
        {pastDeals.map((deal, i) => (
          <Card key={i} className="border-pink-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-pink-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-pink-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{deal.date}</Badge>
                    </div>
                    <h3 className="font-bold text-lg">{deal.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-pink-700">{deal.price}</span>
                      <span className="line-through text-muted-foreground">{deal.oldPrice}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-500 mb-2">Save {deal.savings}</Badge>
                  <Button size="sm" onClick={() => addToCart(deal)}>
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Buy Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
