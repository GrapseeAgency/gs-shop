'use client'

import { useState } from 'react'
import { Palette, ShoppingCart, Layers, Sparkles, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function UIKitsPage() {
  const [kits] = useState([
    { id: 1, name: 'Premium Figma Components', price: 999, items: 50, type: 'Figma', sales: 890, rating: 4.9 },
    { id: 2, name: 'Tailwind UI Library', price: 1499, items: 200, type: 'Tailwind', sales: 567, rating: 4.8 },
    { id: 3, name: 'Custom Icon Pack', price: 499, items: 500, type: 'Icons', sales: 1234, rating: 4.7 },
    { id: 4, name: 'Animation Presets', price: 999, items: 100, type: 'Framer', sales: 345, rating: 4.9 },
  ])

  const buyKit = (kit: any) => {
    toast.success(`${kit.name} added to cart!`)
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Palette className="h-10 w-10 text-purple-600" />
          UI Component Packs
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Ready-to-use components to accelerate your design workflow
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {kits.map((kit) => (
          <Card key={kit.id} className="group hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-20 w-20 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Layers className="h-10 w-10 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{kit.type}</Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">{kit.rating}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{kit.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {kit.items}+ components  {kit.sales} sales
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-green-600">{kit.price}</p>
                    <Button onClick={() => buyKit(kit)}>
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Buy
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardContent className="p-8 text-center">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-purple-600" />
          <h3 className="text-2xl font-bold mb-2">Bundle & Save</h3>
          <p className="text-muted-foreground mb-4">
            Get all 4 UI kits for just 3,499 (Save 1,497)
          </p>
          <Button size="lg">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Buy Complete Bundle
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
