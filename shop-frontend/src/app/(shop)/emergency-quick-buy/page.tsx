'use client'

import { useState } from 'react'
import { AlertTriangle, Package, Clock, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function EmergencyQuickBuyPage() {
  const [urgentItems] = useState([
    { name: 'Baby Diapers', urgency: 'Critical', delivery: '30 min', price: 350 },
    { name: 'Medicine', urgency: 'Urgent', delivery: '1 hour', price: 120 },
    { name: 'Phone Charger', urgency: 'High', delivery: '2 hours', price: 299 },
    { name: 'Toilet Paper', urgency: 'High', delivery: '2 hours', price: 80 },
  ])

  const quickOrder = (item: any) => {
    toast.success(`${item.name} ordered! Delivering in ${item.delivery}`)
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2 text-red-600">
          <AlertTriangle className="h-8 w-8" />
          Emergency Quick Buy
        </h1>
        <p className="text-muted-foreground">
          Crucial item missing? "Baby ran out of diapers"  one-tap express delivery, arrives in 30 min
        </p>
      </div>

      <div className="grid gap-4">
        {urgentItems.map((item, i) => (
          <Card key={i} className="bg-red-50 border-red-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold">{item.name}</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>Delivery: {item.delivery}</span>
                    <Badge variant="destructive">{item.urgency}</Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{item.price}</p>
                <Button size="sm" className="mt-1" onClick={() => quickOrder(item)}>
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Order Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
