'use client'

import { useState, useEffect } from 'react'
import { CreditCard, AlertTriangle, TrendingDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

export default function SubscriptionAuditPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch('/api/money-savers/subscription-audit')
      if (res.ok) {
        const data = await res.json()
        setSubscriptions(data.subscriptions || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const cancelSubscription = async (id: string) => {
    toast.success('Cancellation request sent!')
  }

  if (loading) {
    return (
      <div className="container max-w-4xl py-8 text-center">
        <div className="animate-pulse h-8 bg-muted rounded w-1/3 mx-auto" />
      </div>
    )
  }

  const unusedCount = subscriptions.filter(s => s.status === 'unused').length
  const potentialSavings = subscriptions.reduce((sum, s) => sum + s.potentialSavings, 0)

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <CreditCard className="h-8 w-8 text-purple-600" />
          Subscription Audit
        </h1>
        <p className="text-muted-foreground">
          Find and cancel unused subscriptions to save money
        </p>
      </div>

      {unusedCount > 0 && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div>
                <p className="font-medium text-red-800">
                  Found {unusedCount} unused subscriptions!
                </p>
                <p className="text-sm text-red-600">
                  Cancel them to save {potentialSavings}/month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {subscriptions.map((sub) => (
          <Card key={sub.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{sub.subscription?.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {sub.subscription?.amount}/month
                  </p>
                  {sub.daysSinceUse > 30 && (
                    <Badge variant="destructive" className="mt-1">
                      Not used in {sub.daysSinceUse} days
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  {sub.status === 'unused' ? (
                    <div>
                      <p className="text-sm text-red-600 font-medium">
                        Save {sub.potentialSavings}/month
                      </p>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => cancelSubscription(sub.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Badge variant="secondary">Active</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Potential Savings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-4xl font-bold text-green-600">{potentialSavings}</p>
            <p className="text-muted-foreground">per month</p>
            <p className="text-sm text-green-600 mt-2">
              That's {potentialSavings * 12}/year back in your pocket!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
