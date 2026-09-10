'use client'

import { useEffect, useState } from 'react'
import { Gift, Wallet, Clock, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function CashbackPage() {
  const [cashback, setCashback] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCashback()
  }, [])

  const fetchCashback = async () => {
    try {
      const res = await fetch('/api/cashback')
      if (res.ok) {
        const data = await res.json()
        setCashback(data.cashback)
        setSummary(data.summary)
      }
    } catch (error) {
      toast.error('Failed to load cashback')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'credited':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-500" />
      default:
        return <Gift className="h-4 w-4 text-blue-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      credited: 'default',
      pending: 'secondary',
      used: 'outline',
      expired: 'destructive'
    }
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Gift className="h-6 w-6 text-emerald-500" />
          Cashback
        </h1>
        <p className="text-muted-foreground">
          Earn cashback on every purchase and use it on future orders
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-4 text-center">
            <Wallet className="h-6 w-6 mx-auto text-emerald-500 mb-2" />
            <p className="text-2xl font-bold">${(summary?.currentBalance || 0).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">${(summary?.totalEarned || 0).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Total Earned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">${(summary?.totalUsed || 0).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Total Used</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{cashback.length}</p>
            <p className="text-xs text-muted-foreground">Transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Cashback List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cashback History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : cashback.length > 0 ? (
            <div className="divide-y">
              {cashback.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(item.status)}
                    <div>
                      <p className="font-medium">Order #{item.orderId?.slice(-6)}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.percentage}% cashback  {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-600">+${item.amount.toFixed(2)}</p>
                    {getStatusBadge(item.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No cashback yet. Start shopping to earn!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How it Works */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-base">How Cashback Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-emerald-600">1</span>
            </div>
            <div>
              <p className="font-medium">Shop</p>
              <p className="text-sm text-muted-foreground">Purchase any service from our marketplace</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-emerald-600">2</span>
            </div>
            <div>
              <p className="font-medium">Earn</p>
              <p className="text-sm text-muted-foreground">Get 5% cashback after order completion</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-emerald-600">3</span>
            </div>
            <div>
              <p className="font-medium">Spend</p>
              <p className="text-sm text-muted-foreground">Use cashback on your next purchase</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
