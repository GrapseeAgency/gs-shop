'use client'

import { useState, useEffect } from 'react'
import { Ticket, Sparkles, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function AutoCouponPage() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [bestCoupon, setBestCoupon] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/money-savers/auto-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartTotal: 5000, cartItems: [] })
      })
      if (res.ok) {
        const data = await res.json()
        setBestCoupon(data.bestCoupon)
        setCoupons(data.allOptions || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success('Coupon code copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Ticket className="h-8 w-8 text-purple-600" />
          Auto Coupon Finder
        </h1>
        <p className="text-muted-foreground">
          We scan 50+ coupon databases to find you the best deal
        </p>
      </div>

      {loading ? (
        <Card className="p-12 text-center">
          <Sparkles className="h-8 w-8 animate-pulse mx-auto text-purple-500" />
          <p className="mt-2 text-muted-foreground">Scanning for coupons...</p>
        </Card>
      ) : bestCoupon ? (
        <div className="space-y-6">
          {/* Best Coupon */}
          <Card className="border-2 border-purple-500 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Best Coupon Found!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-4xl font-bold text-purple-700">{bestCoupon.code}</p>
                <p className="text-lg text-purple-600 mt-2">
                  Save {bestCoupon.savings} ({bestCoupon.discountPercent}% off)
                </p>
                <Button 
                  className="mt-4" 
                  size="lg"
                  onClick={() => copyCode(bestCoupon.code)}
                >
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Other Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {coupons.slice(1, 5).map((coupon, i) => (
              <Card key={i} className="opacity-75">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{coupon.code}</p>
                      <p className="text-sm text-muted-foreground">
                        Save {coupon.savings}
                      </p>
                    </div>
                    <Badge variant="secondary">{coupon.discountPercent}%</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No coupons available right now</p>
        </Card>
      )}
    </div>
  )
}
