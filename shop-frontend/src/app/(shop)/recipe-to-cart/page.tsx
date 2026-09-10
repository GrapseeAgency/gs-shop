'use client'

import { useState } from 'react'
import { ChefHat, Link2, ShoppingCart, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function RecipeToCartPage() {
  const [recipeUrl, setRecipeUrl] = useState('')
  const [servings, setServings] = useState(4)
  const [loading, setLoading] = useState(false)
  const [ingredients, setIngredients] = useState<any[]>([])

  const convertRecipe = async () => {
    if (!recipeUrl) return
    setLoading(true)
    
    try {
      const res = await fetch('/api/time-savers/recipe-to-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeUrl, servings })
      })
      
      if (res.ok) {
        const data = await res.json()
        setIngredients(data.ingredients || [])
        toast.success(`Added ${data.ingredients?.length || 0} ingredients to cart!`)
      }
    } catch (error) {
      toast.error('Failed to convert recipe')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <ChefHat className="h-8 w-8 text-orange-600" />
          Recipe to Cart
        </h1>
        <p className="text-muted-foreground">
          Paste any recipe link - we'll add all ingredients to your cart
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Paste recipe URL here..."
                value={recipeUrl}
                onChange={(e) => setRecipeUrl(e.target.value)}
                className="h-12"
              />
            </div>
            <Button 
              size="lg" 
              onClick={convertRecipe}
              disabled={loading || !recipeUrl}
            >
              {loading ? 'Converting...' : <><Link2 className="h-4 w-4 mr-2" /> Convert</>}
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Servings:</span>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              {[2, 4, 6, 8].map(n => (
                <button
                  key={n}
                  onClick={() => setServings(n)}
                  className={`px-3 py-1 rounded ${servings === n ? 'bg-orange-500 text-white' : 'bg-muted'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {ingredients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Ingredients Added ({ingredients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ingredients.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{item.ingredient}</p>
                    <p className="text-sm text-muted-foreground">{item.amount}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{item.product.price}</p>
                    <Badge variant="secondary">{item.product.name}</Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" size="lg">
              Proceed to Checkout
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
