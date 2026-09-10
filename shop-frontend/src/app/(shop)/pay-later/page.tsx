'use client'

import { useEffect, useState } from 'react'
import { Calendar, Clock, CreditCard, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function PayLaterPage() {
  const [payLaterList, setPayLaterList] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayLater()
  }, [])

  const fetchPayLater = async () => {
    try {
      const res = await fetch('/api/pay-later')
      if (res.ok) {
        const data = await res.json()
        setPayLaterList(data.payLater)
        setSummary(data.summary)
      }
    } catch (error) {
      toast.error('Failed to load pay later data')
    } finally {
      setLoading(false)
    }
  }

  const handlePay = async (id: string) => {
    try {
      const res = await fetch('/api/pay-later', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payLaterId: id, paymentMethod: 'card' })
      })

      if (res.ok) {
        toast.success('Payment successful!')
        fetchPayLater()
      }
    } catch (error) {
      toast.error('Payment failed')
    }
  }

  const isOverdue = (dueDate: string, status: string) => {
    return status === 'active' && new Date(dueDate) < new Date()
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          Pay Later
        </h1>
        <p className="text-muted-foreground">
          Manage your buy now, pay later orders
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">${(summary?.totalDue || 0).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Total Due</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-red-500">{summary?.overdueCount || 0}</p>
            <p className="text-xs text-muted-foreground">Overdue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">${(summary?.overdueAmount || 0).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Overdue Amount</p>
          </CardContent>
        </Card>
      </div>

      {/* Pay Later List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Pay Later Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : payLaterList.length > 0 ? (
            <div className="divide-y">
              {payLaterList.map((item) => {
                const overdue = isOverdue(item.dueDate, item.status)
                
                return (
                  <div key={item.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">Order #{item.orderId?.slice(-6)}</p>
                          {overdue && (
                            <Badge variant="destructive" className="gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Overdue
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Due: {new Date(item.dueDate).toLocaleDateString()}
                          </span>
                          <Badge variant={item.status === 'active' ? 'secondary' : 'outline'}>
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">${item.amount.toFixed(2)}</p>
                        {item.status === 'active' && (
                          <Button 
                            size="sm" 
                            className="mt-2 gap-1"
                            onClick={() => handlePay(item.id)}
                          >
                            <CreditCard className="h-3 w-3" />
                            Pay Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No active pay later orders</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <div className="mt-6 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-2">Pay Later Terms:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Maximum 3 active pay later orders at a time</li>
          <li>Payment due within 14 or 30 days of order</li>
          <li>Late fees apply for overdue payments</li>
          <li>Available for orders above $100</li>
        </ul>
      </div>
    </div>
  )
}
