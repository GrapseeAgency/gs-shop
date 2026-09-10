'use client'

import { useState } from 'react'
import { Search, RefreshCw, CheckCircle, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function AlternativeFinderPage() {
  const [searching, setSearching] = useState(false)
  const [alternatives, setAlternatives] = useState<any[]>([])

  const findAlternatives = () => {
    setSearching(true)
    setTimeout(() => {
      setAlternatives([
        { name: 'Brand Y Shirt', price: 899, match: 95, available: true },
        { name: 'Brand Z Shirt', price: 999, match: 90, available: true },
        { name: 'Brand W Shirt', price: 799, match: 85, available: false },
      ])
      setSearching(false)
    }, 1500)
  }

  const addToCart = (item: any) => {
    toast.success(`${item.name} added to cart`)
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <RefreshCw className="h-8 w-8 text-orange-600" />
          Alternative Finder
        </h1>
        <p className="text-muted-foreground">
          "Product out of stock"  "Similar products available: X, Y, Z" with compare
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">Looking for alternatives to: <strong>Brand X Shirt (1,199)</strong></p>
          <Button size="lg" onClick={findAlternatives} disabled={searching}>
            <Search className="h-4 w-4 mr-2" />
            {searching ? 'Finding...' : 'Find Alternatives'}
          </Button>
        </CardContent>
      </Card>

      {alternatives.length > 0 && (
        <div className="space-y-4">
          {alternatives.map((alt, i) => (
            <Card key={i} className={alt.available ? 'border-green-200' : 'border-red-200 opacity-60'}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{alt.name}</h3>
                      <Badge>{alt.match}% match</Badge>
                      {alt.available ? (
                        <Badge className="bg-green-500">In Stock</Badge>
                      ) : (
                        <Badge variant="destructive">Out of Stock</Badge>
                      )}
                    </div>
                    <p className="text-xl font-bold mt-1">{alt.price}</p>
                    <p className="text-sm text-green-600">Save {1199 - alt.price}</p>
                  </div>
                  {alt.available && (
                    <Button onClick={() => addToCart(alt)}>
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
