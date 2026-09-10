'use client'

import { useState, useEffect } from 'react'
import { Shirt, ShoppingBag, Layers, User, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function OutfitBuilderPage() {
  const [categories, setCategories] = useState<Record<string, any[]>>({})
  const [outfit, setOutfit] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/modular/outfit-builder')
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories || {})
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToOutfit = (category: string, product: any) => {
    setOutfit(prev => ({ ...prev, [category]: product }))
    toast.success(`${product.name} added to outfit!`)
  }

  const removeFromOutfit = (category: string) => {
    setOutfit(prev => {
      const newOutfit = { ...prev }
      delete newOutfit[category]
      return newOutfit
    })
  }

  const totalPrice = Object.values(outfit).reduce((sum: number, item: any) => sum + item.price, 0)

  const saveOutfit = async () => {
    try {
      const res = await fetch('/api/modular/outfit-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outfit,
          totalPrice,
          name: `Outfit ${Date.now()}`
        })
      })

      if (res.ok) {
        toast.success('Outfit saved successfully!')
      }
    } catch (error) {
      toast.error('Failed to save outfit')
    }
  }

  if (loading) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Layers className="h-6 w-6 text-purple-500" />
          Outfit Builder
        </h1>
        <p className="text-muted-foreground">
          Mix and match to create your perfect look
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Selection */}
        <div className="lg:col-span-2 space-y-6">
          {Object.entries(categories).map(([category, products]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-base capitalize flex items-center gap-2">
                  <Shirt className="h-4 w-4" />
                  {category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {products.slice(0, 8).map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addToOutfit(category, product)}
                      className={`p-2 rounded border text-left transition-all ${
                        outfit[category]?.id === product.id
                          ? 'border-primary bg-primary/10 ring-2 ring-primary'
                          : 'border-muted hover:border-primary/50'
                      }`}
                    >
                      <div className="aspect-square bg-muted rounded mb-2 overflow-hidden">
                        {product.imageUrl && (
                          <img 
                            src={product.imageUrl} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <p className="text-xs font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.price}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Outfit Preview */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Your Outfit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.keys(outfit).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Layers className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Select items to build your outfit</p>
                </div>
              ) : (
                <>
                  {/* Mannequin Preview */}
                  <div className="bg-muted rounded-lg p-4 text-center">
                    <div className="space-y-2">
                      {outfit.tops && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Top:</span>{' '}
                          <span className="font-medium">{outfit.tops.name}</span>
                        </div>
                      )}
                      {outfit.bottoms && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Bottom:</span>{' '}
                          <span className="font-medium">{outfit.bottoms.name}</span>
                        </div>
                      )}
                      {outfit.shoes && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Shoes:</span>{' '}
                          <span className="font-medium">{outfit.shoes.name}</span>
                        </div>
                      )}
                      {outfit.accessories && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Accessory:</span>{' '}
                          <span className="font-medium">{outfit.accessories.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selected Items */}
                  <div className="space-y-2">
                    {Object.entries(outfit).map(([category, item]: [string, any]) => (
                      <div key={category} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center gap-2">
                          <span className="capitalize text-sm text-muted-foreground">{category}:</span>
                          <span className="text-sm font-medium">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{item.price}</span>
                          <button 
                            onClick={() => removeFromOutfit(category)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total:</span>
                      <span className="text-xl font-bold text-purple-600">{totalPrice}</span>
                    </div>
                  </div>

                  <Button className="w-full" onClick={saveOutfit}>
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Save Outfit
                  </Button>
                  <Button variant="outline" className="w-full">
                    Buy All Items <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
