'use client'

import { useState, useEffect } from 'react'
import { Home, Palette, Paintbrush, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function RoomDesignerPage() {
  const [roomType, setRoomType] = useState('living')
  const [products, setProducts] = useState<any[]>([])
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const [preset, setPreset] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const roomTypes = [
    { id: 'living', name: 'Living Room', icon: '' },
    { id: 'bedroom', name: 'Bedroom', icon: '' },
    { id: 'kitchen', name: 'Kitchen', icon: '' },
    { id: 'office', name: 'Office', icon: '' },
    { id: 'bathroom', name: 'Bathroom', icon: '' }
  ]

  const presets = [
    { id: 'modern', name: 'Modern Minimal', colors: ['white', 'gray', 'black'] },
    { id: 'cozy', name: 'Cozy Warm', colors: ['beige', 'brown', 'cream'] },
    { id: 'bold', name: 'Bold & Bright', colors: ['navy', 'yellow', 'white'] },
    { id: 'natural', name: 'Natural Earth', colors: ['green', 'wood', 'white'] }
  ]

  useEffect(() => {
    fetchProducts()
  }, [roomType])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/modular/room-designer?room=${roomType}`)
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const addItem = (product: any) => {
    setSelectedItems(prev => [...prev, product])
    toast.success(`${product.name} added!`)
  }

  const removeItem = (index: number) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index))
  }

  const saveDesign = async () => {
    try {
      const res = await fetch('/api/modular/room-designer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomType,
          items: selectedItems,
          preset,
          totalBudget: selectedItems.reduce((sum, item) => sum + item.price, 0)
        })
      })

      if (res.ok) {
        toast.success('Room design saved!')
      }
    } catch (error) {
      toast.error('Failed to save design')
    }
  }

  const totalPrice = selectedItems.reduce((sum, item) => sum + item.price, 0)

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Home className="h-6 w-6 text-indigo-500" />
          Room Designer
        </h1>
        <p className="text-muted-foreground">
          Design your perfect space with our AI-powered room designer
        </p>
      </div>

      {/* Room Type Selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {roomTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setRoomType(type.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border whitespace-nowrap ${
              roomType === type.id
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-muted hover:border-indigo-300'
            }`}
          >
            <span>{type.icon}</span>
            <span>{type.name}</span>
          </button>
        ))}
      </div>

      {/* Style Presets */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Choose Your Style
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {presets.map((p) => (
              <button
                key={p.id}
                onClick={() => setPreset(p)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  preset?.id === p.id
                    ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500'
                    : 'border-muted hover:border-indigo-300'
                }`}
              >
                <p className="font-medium">{p.name}</p>
                <div className="flex gap-1 mt-2">
                  {p.colors.map((color) => (
                    <span
                      key={color}
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Paintbrush className="h-4 w-4" />
                {roomTypes.find(t => t.id === roomType)?.name} Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-40 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addItem(product)}
                      className="p-2 rounded-lg border border-muted hover:border-indigo-300 transition-all text-left"
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
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.price}</p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Design Preview */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Your Design</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Home className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Select items to build your room</p>
                </div>
              ) : (
                <>
                  {/* Selected Items */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted rounded"
                      >
                        <span className="text-sm truncate">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{item.price}</span>
                          <button
                            onClick={() => removeItem(index)}
                            className="text-red-500 hover:text-red-700"
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
                      <span className="text-xl font-bold text-indigo-600">
                        {totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Button className="w-full" onClick={saveDesign}>
                    <Check className="h-4 w-4 mr-2" />
                    Save Design
                  </Button>

                  {preset && (
                    <Badge variant="secondary" className="w-full justify-center">
                      {preset.name} Style
                    </Badge>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
