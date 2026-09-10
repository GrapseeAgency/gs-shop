'use client'

import { useState } from 'react'
import { ListTodo, Plus, ShoppingCart, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function ShoppingListAutocompletePage() {
  const [items, setItems] = useState<string[]>([])
  const [input, setInput] = useState('')
  const suggestions = ['Rice', 'Dal', 'Oil', 'Sugar', 'Salt', 'Tea', 'Milk']

  const addItem = (item: string) => {
    setItems([...items, item])
    setInput('')
    toast.success(`${item} added to list`)
  }

  const addToCart = () => {
    toast.success(`${items.length} items added to cart`)
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <ListTodo className="h-8 w-8 text-blue-600" />
          Shopping List Autocomplete
        </h1>
        <p className="text-muted-foreground">
          Type "rice"  autocomplete "Rice 5kg (250)"
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Shopping List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Input
              placeholder="Type to add item..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="pr-10"
            />
            <Button size="sm" className="absolute right-1 top-1 h-8" onClick={() => input && addItem(input)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {input && (
            <div className="bg-muted p-2 rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.filter(s => s.toLowerCase().includes(input.toLowerCase())).map(s => (
                  <Button key={s} variant="outline" size="sm" onClick={() => addItem(s)}>
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {items.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Your List ({items.length})</h4>
              {items.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span>{item}</span>
                  <X className="h-4 w-4 text-muted-foreground cursor-pointer" onClick={() => setItems(items.filter((_, idx) => idx !== i))} />
                </div>
              ))}
              <Button className="w-full mt-4" onClick={addToCart}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add All to Cart
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
