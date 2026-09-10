'use client'

import { useState } from 'react'
import { Utensils, ArrowRight, ChefHat, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function IngredientSwapPage() {
  const [ingredient, setIngredient] = useState('')

  const swaps: Record<string, string[]> = {
    'butter': ['olive oil', 'coconut oil', 'ghee'],
    'sugar': ['honey', 'stevia', 'jaggery'],
    'flour': ['almond flour', 'oat flour', 'coconut flour'],
    'milk': ['almond milk', 'oat milk', 'soy milk'],
    'egg': ['banana', 'applesauce', 'flax egg'],
  }

  const suggestions = swaps[ingredient.toLowerCase()] || []

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Utensils className="h-8 w-8 text-orange-600" />
          Ingredient Swap
        </h1>
        <p className="text-muted-foreground">
          Find cooking substitutes for any ingredient
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            What ingredient do you need to replace?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input 
            placeholder="e.g., butter, sugar, milk, egg"
            value={ingredient}
            onChange={(e) => setIngredient(e.target.value)}
          />

          {suggestions.length > 0 && (
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="font-medium mb-3">Substitutes for {ingredient}:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((swap) => (
                  <Badge key={swap} className="text-lg py-2 px-4 bg-orange-500">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {swap}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {ingredient && suggestions.length === 0 && (
            <p className="text-muted-foreground text-center">
              Try: butter, sugar, flour, milk, or egg
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
