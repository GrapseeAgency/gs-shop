'use client'

import { useState } from 'react'
import { Truck, Home, CheckSquare, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function MovingKitPage() {
  const [houseSize, setHouseSize] = useState('2bhk')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const generateKit = async () => {
    setLoading(true)
    
    // [] items for moving
    setTimeout(() => {
      setItems([])
      setLoading(false)
      toast.success(`Generated ${houseSize} moving kit!`)
    }, 1000)
  }

  const toggleItem = (id: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ))
  }

  const addToCart = () => {
    const selected = items.filter(i => i.checked)
    toast.success(`${selected.length} items added to cart!`)
  }

  const categories = []

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Truck className="h-8 w-8 text-orange-600" />
          Moving House Kit
        </h1>
        <p className="text-muted-foreground">
          Complete packing and essentials list for your move
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex gap-2 mb-4">
            {['1bhk', '2bhk', '3bhk', '4bhk+'].map((size) => (
              <button
                key={size}
                onClick={() => setHouseSize(size)}
                className={`flex-1 p-3 rounded-lg font-medium ${
                  houseSize === size 
                    ? 'bg-orange-100 border-2 border-orange-500 text-orange-700' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {size.toUpperCase()}
              </button>
            ))}
          </div>
          
          <Button 
            className="w-full" 
            size="lg"
            onClick={generateKit}
            disabled={loading}
          >
            {loading ? 'Generating...' : <><Home className="h-4 w-4 mr-2" /> Generate Moving Kit</>}
          </Button>
        </CardContent>
      </Card>

      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Your {houseSize.toUpperCase()} Moving Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categories.map((category) => (
              <div key={category} className="mb-4">
                <h4 className="font-medium text-muted-foreground mb-2">{category}</h4>
                <div className="space-y-2">
                  {items.filter(i => i.category === category).map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer"
                      onClick={() => toggleItem(item.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox checked={item.checked} />
                        <span className={item.checked ? 'line-through text-muted-foreground' : ''}>
                          {item.name}
                        </span>
                        {item.essential && (
                          <Badge variant="secondary" className="text-xs">Essential</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <Button 
              className="w-full mt-4" 
              size="lg"
              onClick={addToCart}
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Add {items.filter(i => i.checked).length} Items to Cart
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
