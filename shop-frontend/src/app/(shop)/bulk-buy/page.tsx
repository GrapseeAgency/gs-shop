'use client'

import { useState } from 'react'
import { Users, TrendingDown, Store, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function BulkBuyPage() {
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState(5)
  const [targetPrice, setTargetPrice] = useState('')
  const [requestSent, setRequestSent] = useState(false)
  const [responses, setResponses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const sendRequest = async () => {
    setLoading(true)
    
    try {
      const res = await fetch('/api/money-savers/bulk-buy-negotiator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity, targetPrice: parseInt(targetPrice) })
      })
      
      if (res.ok) {
        const data = await res.json()
        setRequestSent(true)
        toast.success(`Request sent to ${data.competingSellers} sellers!`)
      }
    } catch (error) {
      toast.error('Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Users className="h-8 w-8 text-purple-600" />
          Bulk Buy Negotiator
        </h1>
        <p className="text-muted-foreground">
          Get sellers to compete for your bulk order
        </p>
      </div>

      {!requestSent ? (
        <Card>
          <CardHeader>
            <CardTitle>Create Bulk Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Product ID/Name</label>
              <Input 
                placeholder="Enter product you need"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Quantity Needed</label>
                <Input 
                  type="number"
                  min="5"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Target Price ()</label>
                <Input 
                  type="number"
                  placeholder="Your expected price"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-purple-800 text-sm">
                <TrendingDown className="h-4 w-4 inline mr-1" />
                We'll notify all sellers. Best price wins your order!
              </p>
            </div>

            <Button 
              className="w-full" 
              size="lg"
              onClick={sendRequest}
              disabled={loading || !productId || !targetPrice}
            >
              {loading ? 'Sending...' : <><MessageCircle className="h-4 w-4 mr-2" /> Send to Sellers</>}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <Badge className="mb-2 bg-green-500">Request Sent!</Badge>
              <p className="text-green-800">
                Sellers are competing. Check back in 24 hours for best offers.
              </p>
            </CardContent>
          </Card>

          <h3 className="font-semibold">Seller Responses</h3>
          
          {responses.length === 0 ? (
            <Card className="p-8 text-center">
              <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Waiting for seller responses...</p>
            </Card>
          ) : (
            responses.map((resp) => (
              <Card key={resp.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{resp.seller?.name}</p>
                      <p className="text-2xl font-bold text-green-600">
                        {resp.offeredPrice}
                      </p>
                    </div>
                    <Button>Accept Offer</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
