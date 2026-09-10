'use client'

import { useState } from 'react'
import { Shirt, Plus, CheckSquare, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'

export default function WardrobePlannerPage() {
  const [items, setItems] = useState([
    { name: 'White Shirt', category: 'Top', owned: true },
    { name: 'Blue Jeans', category: 'Bottom', owned: true },
    { name: 'Black Blazer', category: 'Outer', owned: false },
  ])
  const [newItem, setNewItem] = useState('')

  const combinations = [
    'White Shirt + Blue Jeans',
    'White Shirt + Black Blazer',
    'Blue Jeans + Black Blazer',
  ]

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Shirt className="h-8 w-8 text-indigo-600" />
          Wardrobe Planner
        </h1>
        <p className="text-muted-foreground">
          Mix and match outfits from your wardrobe
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Your Wardrobe Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input 
              placeholder="Add item (e.g., Red Dress)"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
            />
            <Button onClick={() => {
              if (newItem) {
                setItems([...items, { name: newItem, category: 'Other', owned: true }])
                setNewItem('')
              }
            }}>Add</Button>
          </div>

          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Checkbox checked={item.owned} />
                <span className="flex-1">{item.name}</span>
                <Badge variant="outline">{item.category}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Outfit Combinations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {combinations.map((combo, i) => (
              <div key={i} className="bg-white p-3 rounded-lg flex items-center gap-3">
                <CheckSquare className="h-5 w-5 text-indigo-600" />
                <span>{combo}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
