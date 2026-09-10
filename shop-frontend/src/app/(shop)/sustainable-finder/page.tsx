'use client'

import { useState } from 'react'
import { Leaf, Search, CheckCircle, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function SustainableFinderPage() {
  const [search, setSearch] = useState('')
  const products = [
    { name: 'Bamboo Toothbrush', ecoScore: 95, price: 149, organic: true },
    { name: 'Reusable Water Bottle', ecoScore: 90, price: 399, organic: false },
    { name: 'Organic Cotton T-Shirt', ecoScore: 88, price: 599, organic: true },
    { name: 'Biodegradable Phone Case', ecoScore: 85, price: 299, organic: false },
  ]

  const addToCart = (product: any) => {
    toast.success(`${product.name} added! Eco-score: ${product.ecoScore}`)
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Leaf className="h-8 w-8 text-green-600" />
          Sustainable Finder
        </h1>
        <p className="text-muted-foreground">
          Eco-friendly product alternatives
        </p>
      </div>

      <Input 
        className="mb-6"
        placeholder="Search eco-friendly products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid gap-4">
        {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map((product, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Leaf className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">{product.name}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge className="bg-green-500">Eco-Score: {product.ecoScore}</Badge>
                    {product.organic && <Badge variant="outline">Organic</Badge>}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{product.price}</p>
                <Button size="sm" onClick={() => addToCart(product)}>
                  <ShoppingBag className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
