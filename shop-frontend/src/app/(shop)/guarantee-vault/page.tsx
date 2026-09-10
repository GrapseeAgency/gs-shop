'use client'

import { useState } from 'react'
import { Shield, Lock, Clock, CheckCircle, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

export default function GuaranteeVaultPage() {
  const [escrow] = useState({
    status: 'secured',
    amount: 24999,
    milestones: [
      { name: 'Deposit', status: 'released', amount: 7500, date: 'Released Jan 15' },
      { name: 'Design Complete', status: 'held', amount: 7500, date: 'Held - awaiting approval' },
      { name: 'Development', status: 'held', amount: 7500, date: 'Held' },
      { name: 'Final Delivery', status: 'held', amount: 4999, date: 'Held' }
    ]
  })

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Shield className="h-10 w-10 text-green-600" />
          Money-Back Guarantee Vault
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Your payment is protected until delivery
        </p>
      </div>

      <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <Lock className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total in Escrow</p>
                <p className="text-4xl font-bold">{escrow.amount.toLocaleString()}</p>
                <Badge className="mt-2 bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Secured
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Protection Status</p>
              <p className="text-xl font-medium">Active</p>
              <p className="text-sm text-muted-foreground mt-1">Auto-refund if not delivered</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Milestones</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {escrow.milestones.map((milestone, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div className="flex-shrink-0">
                  {milestone.status === 'released' ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  ) : (
                    <Lock className="h-8 w-8 text-orange-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold">{milestone.name}</h3>
                    <Badge variant={milestone.status === 'released' ? 'default' : 'outline'}>
                      {milestone.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{milestone.amount.toLocaleString()}</span>
                    <span>{milestone.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold mb-2">Your Protection</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Money held until milestone approval
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Auto-refund if project fails
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                7-day approval window per milestone
              </li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold mb-2">Need Help?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Our dispute resolution team is available 24/7 to ensure fair outcomes.
            </p>
            <Button variant="outline" className="w-full">
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
