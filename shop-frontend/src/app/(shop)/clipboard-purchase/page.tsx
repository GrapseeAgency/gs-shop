'use client'

import { useState, useEffect } from 'react'
import { Clipboard, ShoppingBag, CheckCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function ClipboardPurchasePage() {
  const [detected, setDetected] = useState(false)
  const [product, setProduct] = useState<any>(null)

  useEffect(() => {
    // Simulate clipboard detection
    const timer = setTimeout(() => {
      setDetected(true)
      setProduct({
        name: 'Wireless Earbuds',
        price: 1299,
        image: '/placeholder.jpg'
      })
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const buyNow = () => {
    toast.success(`${product.name} added to cart!`)
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Clipboard className="h-8 w-8 text-purple-600" />
          Clipboard Purchase
        </h1>
        <p className="text-muted-foreground">
          Copy any product name  instant "Buy [product] for X?" notification
        </p>
      </div>

      {!detected ? (
        <Card className="p-8 text-center">
          <Clipboard className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Monitoring clipboard for product names...</p>
        </Card>
      ) : (
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 bg-muted rounded-lg" />
              <div className="flex-1">
                <Badge className="mb-2 bg-purple-500">Detected from clipboard</Badge>
                <h3 className="text-xl font-bold">{product.name}</h3>
                <p className="text-2xl font-bold text-purple-700">{product.price}</p>
              </div>
              <Button size="lg" onClick={buyNow}>
                <ShoppingBag className="h-4 w-4 mr-2" />
                Buy Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
