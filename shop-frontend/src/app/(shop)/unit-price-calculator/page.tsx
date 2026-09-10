'use client'

import { useState } from 'react'
import { Calculator, ArrowRight, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function UnitPriceCalculatorPage() {
  const [products, setProducts] = useState<any[]>([
    { id: 1, name: '', amount: '', unit: 'g', price: '' },
    { id: 2, name: '', amount: '', unit: 'g', price: '' }
  ])
  const [result, setResult] = useState<any>(null)

  const updateProduct = (id: number, field: string, value: string) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ))
  }

  const calculate = async () => {
    try {
      const res = await fetch('/api/utilities/unit-price-calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products })
      })
      
      if (res.ok) {
        const data = await res.json()
        setResult(data)
      }
    } catch (error) {
      toast.error('Calculation failed')
    }
  }

  const addProduct = () => {
    setProducts([...products, { 
      id: products.length + 1, 
      name: '', 
      amount: '', 
      unit: 'g', 
      price: '' 
    }])
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Calculator className="h-8 w-8 text-indigo-600" />
          Unit Price Calculator
        </h1>
        <p className="text-muted-foreground">
          Compare products by unit price to find the best deal
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add Products to Compare</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {products.map((product, index) => (
            <div key={product.id} className="grid grid-cols-5 gap-2 items-end">
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground">Product Name</label>
                <Input 
                  placeholder={`Product ${index + 1}`}
                  value={product.name}
                  onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Amount</label>
                <Input 
                  type="number"
                  placeholder="500"
                  value={product.amount}
                  onChange={(e) => updateProduct(product.id, 'amount', e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Unit</label>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={product.unit}
                  onChange={(e) => updateProduct(product.id, 'unit', e.target.value)}
                >
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="ml">ml</option>
                  <option value="l">L</option>
                  <option value="pcs">pcs</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Price ()</label>
                <Input 
                  type="number"
                  placeholder="100"
                  value={product.price}
                  onChange={(e) => updateProduct(product.id, 'price', e.target.value)}
                />
              </div>
            </div>
          ))}

          <div className="flex gap-2">
            <Button variant="outline" onClick={addProduct}>
              + Add Product
            </Button>
            <Button onClick={calculate} className="flex-1">
              <TrendingUp className="h-4 w-4 mr-2" />
              Compare
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Best Deal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-2xl font-bold text-green-700">
                {result.bestDeal?.name || 'Product 1'}
              </p>
              <p className="text-green-600">
                {result.bestDeal?.unitPriceDisplay} - Best value!
              </p>
              {result.savings && (
                <p className="text-lg font-medium text-green-800 mt-2">
                  Save {result.savings.percent}% per unit
                </p>
              )}
            </div>

            <div className="mt-4 space-y-2">
              {result.comparison?.map((item: any, i: number) => (
                <div 
                  key={i} 
                  className={`flex justify-between p-2 rounded ${
                    item.isBest ? 'bg-green-100' : 'bg-white'
                  }`}
                >
                  <span className="font-medium">{item.name}</span>
                  <div className="text-right">
                    <span>{item.unitPrice}</span>
                    {!item.isBest && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {item.diff}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
