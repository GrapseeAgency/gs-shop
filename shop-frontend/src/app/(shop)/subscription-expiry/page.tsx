'use client'

import { useState } from 'react'
import { Calendar, Bell, AlertTriangle, CheckCircle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function SubscriptionExpiryPage() {
  const [subscriptions, setSubscriptions] = useState([
    { name: 'Netflix', expiryDate: '2024-12-15', status: 'active' },
    { name: 'Spotify', expiryDate: '2024-11-30', status: 'expiring' },
  ])
  const [newSub, setNewSub] = useState({ name: '', expiryDate: '' })

  const addSubscription = () => {
    if (newSub.name && newSub.expiryDate) {
      setSubscriptions([...subscriptions, { ...newSub, status: 'active' }])
      setNewSub({ name: '', expiryDate: '' })
      toast.success('Subscription added!')
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Calendar className="h-8 w-8 text-purple-600" />
          Subscription Expiry
        </h1>
        <p className="text-muted-foreground">
          Cancel before auto-renewal
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input 
            placeholder="Service Name"
            value={newSub.name}
            onChange={(e) => setNewSub({...newSub, name: e.target.value})}
          />
          <Input 
            type="date"
            value={newSub.expiryDate}
            onChange={(e) => setNewSub({...newSub, expiryDate: e.target.value})}
          />
          <Button className="w-full" onClick={addSubscription}>Add Subscription</Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {subscriptions.map((sub, i) => (
          <Card key={i} className={sub.status === 'expiring' ? 'border-yellow-500' : ''}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {sub.status === 'expiring' ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                <div>
                  <p className="font-medium">{sub.name}</p>
                  <p className="text-sm text-muted-foreground">Expires: {sub.expiryDate}</p>
                </div>
              </div>
              <Badge variant={sub.status === 'expiring' ? 'destructive' : 'secondary'}>
                {sub.status === 'expiring' ? 'Expiring Soon' : 'Active'}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
