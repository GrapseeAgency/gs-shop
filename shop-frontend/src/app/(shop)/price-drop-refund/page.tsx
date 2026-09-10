'use client'

import { useState, useEffect } from 'react'
import { TrendingDown, RefreshCw, CheckCircle, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function PriceDropRefundPage() {
  const [refunds, setRefunds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRefunds()
  }, [])

  const fetchRefunds = async () => {
    try {
      const res = await fetch('/api/money-savers/price-drop-refund')
      if (res.ok) {
        const data = await res.json()
        setRefunds(data.eligibleRefunds || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const claimRefund = async (orderId: string, productId: string) => {
    try {
      const res = await fetch('/api/money-savers/price-drop-refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, productId })
      })

      if (res.ok) {
        toast.success('Refund claimed! Money will be back in 5-7 days.')
        fetchRefunds()
      }
    } catch (error) {
      toast.error('Failed to claim')
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <TrendingDown className="h-8 w-8 text-green-600" />
          Price Drop Refund
        </h1>
        <p className="text-muted-foreground">
          We auto-detect price drops and get your money back
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        </div>
      ) : refunds.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-semibold">No Price Drops Found</h3>
            <p className="text-muted-foreground">
              Your recent purchases haven't dropped in price. Keep shopping!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg mb-4">
            <p className="text-green-800 font-medium">
               Found {refunds.length} items with price drops! Claim your refunds now.
            </p>
          </div>

          {refunds.map((refund) => (
            <Card key={`${refund.orderId}-${refund.productId}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 bg-muted rounded-lg overflow-hidden">
                    {refund.productImage && (
                      <img src={refund.productImage} alt={refund.productName} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{refund.productName}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>Paid: {refund.purchasePrice}</span>
                      <span></span>
                      <span className="text-green-600">Now: {refund.currentPrice}</span>
                    </div>
                    <Badge className="mt-2 bg-green-500">
                      Save {refund.dropAmount} ({refund.dropPercent}% off)
                    </Badge>
                  </div>
                  <Button onClick={() => claimRefund(refund.orderId, refund.productId)}>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Claim
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
