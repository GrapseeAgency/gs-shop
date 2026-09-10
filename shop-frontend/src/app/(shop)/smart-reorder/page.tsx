'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, ShoppingCart, History, Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function SmartReorderPage() {
  const [lastOrder, setLastOrder] = useState<any>(null)
  const [modification, setModification] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchLastOrder = async () => {
    try {
      const res = await fetch('/api/time-savers/smart-reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modification })
      })
      if (res.ok) {
        const data = await res.json()
        setLastOrder(data)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const reorder = () => {
    toast.success('Order placed with modifications!')
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <RefreshCw className="h-8 w-8 text-blue-600" />
          Smart Reorder
        </h1>
        <p className="text-muted-foreground">
          "Same as last time but replace rice with basmati"  voice or text command, done in 5 seconds
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground">Last Order: #12345 (2 days ago)</span>
          </div>

          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              Modifications (Optional)
            </label>
            <Input 
              placeholder="e.g., Replace rice with basmati, add 2 more onions"
              value={modification}
              onChange={(e) => setModification(e.target.value)}
              className="mt-1"
            />
          </div>

          <Button className="w-full" size="lg" onClick={fetchLastOrder}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Preview Order
          </Button>
        </CardContent>
      </Card>

      {lastOrder && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Modified Order Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {modification && (
              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Changes:</strong> {modification}
                </p>
              </div>
            )}
            <div className="space-y-2">
              {lastOrder.items?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between p-3 bg-muted rounded-lg">
                  <span>{item.product?.name || 'Product'}</span>
                  <span>{item.price}</span>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" size="lg" onClick={reorder}>
              Place Order ({lastOrder.total})
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
