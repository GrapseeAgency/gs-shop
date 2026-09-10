'use client'

import { useState } from 'react'
import { Sparkles, Package, Check, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function SmartUpsellPage() {
  const [cart] = useState({
    item: 'Website Development',
    price: 9999,
    recommendations: [
      { name: 'SEO Setup', price: 1999, bundlePrice: 999, stat: '98% buy this' },
      { name: 'Logo Design', price: 2499, bundlePrice: 1499, stat: 'Popular add-on' },
      { name: 'Content Writing', price: 2999, bundlePrice: 1999, stat: 'Saves 3 days' }
    ]
  })

  const [selected, setSelected] = useState<string[]>([])

  const toggleItem = (name: string) => {
    setSelected(selected.includes(name) 
      ? selected.filter(i => i !== name)
      : [...selected, name]
    )
  }

  const bundlePrice = cart.price + selected.reduce((total, name) => {
    const item = cart.recommendations.find(r => r.name === name)
    return total + (item?.bundlePrice || 0)
  }, 0)

  const originalPrice = cart.price + selected.reduce((total, name) => {
    const item = cart.recommendations.find(r => r.name === name)
    return total + (item?.price || 0)
  }, 0)

  const savings = originalPrice - bundlePrice

  const addBundle = () => {
    toast.success(`Bundle added! You saved ${savings}`)
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Sparkles className="h-10 w-10 text-yellow-600" />
          Smart Upsell Engine
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Recommended based on 10,000+ similar purchases
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Card className="bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In your cart</p>
                  <h3 className="text-xl font-bold">{cart.item}</h3>
                </div>
                <p className="text-2xl font-bold">{cart.price.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {cart.recommendations.map((item) => (
              <Card 
                key={item.name}
                className={selected.includes(item.name) ? 'border-yellow-500 border-2' : ''}
                onClick={() => toggleItem(item.name)}
              >
                <CardContent className="p-4 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                        selected.includes(item.name) ? 'bg-yellow-500 border-yellow-500' : 'border-gray-300'
                      }`}>
                        {selected.includes(item.name) && <Check className="h-4 w-4 text-white" />}
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.stat}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground line-through text-sm">{item.price}</p>
                      <p className="font-bold text-green-600">{item.bundlePrice}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardHeader>
            <CardTitle>Your Bundle</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>{cart.item}</span>
                <span>{cart.price.toLocaleString()}</span>
              </div>
              {selected.map(name => {
                const item = cart.recommendations.find(r => r.name === name)
                return (
                  <div key={name} className="flex justify-between text-green-600">
                    <span>+ {name}</span>
                    <span>{item?.bundlePrice.toLocaleString()}</span>
                  </div>
                )
              })}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Original total</span>
                <span>{originalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Bundle price</span>
                <span>{bundlePrice.toLocaleString()}</span>
              </div>
              <Badge className="mt-2 bg-green-500">
                You save {savings}
              </Badge>
            </div>

            <Button className="w-full" size="lg" onClick={addBundle}>
              Add Bundle to Cart
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
