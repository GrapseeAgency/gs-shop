'use client'

import { useState } from 'react'
import { Lock, Clock, CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function PriceLockPage() {
  const [productId, setProductId] = useState('')
  const [locked, setLocked] = useState(false)
  const [lockDetails, setLockDetails] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const lockPrice = async () => {
    setLoading(true)
    
    try {
      const res = await fetch('/api/money-savers/price-lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, depositAmount: 100, lockDays: 30 })
      })
      
      if (res.ok) {
        const data = await res.json()
        setLockDetails(data.priceLock)
        setLocked(true)
        toast.success('Price locked for 30 days!')
      }
    } catch (error) {
      toast.error('Lock failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Lock className="h-8 w-8 text-blue-600" />
          Price Lock
        </h1>
        <p className="text-muted-foreground">
          Lock today's price for 30 days with 100 deposit
        </p>
      </div>

      {!locked ? (
        <Card>
          <CardHeader>
            <CardTitle>Lock a Price</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">How it works:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>1. Pay 100 deposit to lock current price</li>
                <li>2. You have 30 days to complete purchase</li>
                <li>3. If price goes up, you still pay locked price</li>
                <li>4. Don't buy? Deposit fully refunded</li>
              </ul>
            </div>

            <Button 
              className="w-full" 
              size="lg"
              onClick={lockPrice}
              disabled={loading}
            >
              {loading ? 'Processing...' : <><Lock className="h-4 w-4 mr-2" /> Lock Price Now</>}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
            <Badge className="mb-2 bg-green-500">LOCKED</Badge>
            <h3 className="text-2xl font-bold text-green-800 mb-2">
              Price Locked: {lockDetails?.lockedPrice}
            </h3>
            <p className="text-green-600 mb-4">
              Valid until {new Date(lockDetails?.expiryDate).toLocaleDateString()}
            </p>
            
            <div className="flex gap-2 justify-center">
              <Button size="lg">
                Complete Purchase <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="outline" size="lg">
                Release Lock
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
