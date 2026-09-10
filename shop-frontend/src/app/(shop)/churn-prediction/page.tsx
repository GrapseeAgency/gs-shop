'use client'

import { useState } from 'react'
import { AlertTriangle, UserX, TrendingDown, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

export default function ChurnPredictionPage() {
  const [atRiskClients] = useState([
    { name: 'TechStart Inc.', risk: 78, lastLogin: '45 days ago', renewal: '2 weeks', action: 'Send personalized offer' },
    { name: 'Fashion Boutique', risk: 65, lastLogin: '32 days ago', renewal: '1 month', action: 'Schedule check-in call' },
    { name: 'Dr. Ahmed Clinic', risk: 52, lastLogin: '28 days ago', renewal: '3 weeks', action: 'Send QBR report' }
  ])

  const sendOffer = (client: string) => {
    toast.success(`Offer sent to ${client}`)
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <AlertTriangle className="h-10 w-10 text-red-600" />
          Churn Prediction
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Identify at-risk clients before they leave
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <UserX className="h-8 w-8 mx-auto mb-2 text-red-600" />
            <p className="text-2xl font-bold">12</p>
            <p className="text-sm text-muted-foreground">At Risk</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingDown className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <p className="text-2xl font-bold">8%</p>
            <p className="text-sm text-muted-foreground">Churn Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold">92%</p>
            <p className="text-sm text-muted-foreground">Prediction Accuracy</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clients At Risk</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {atRiskClients.map((client) => (
              <div key={client.name} className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold">{client.name}</h3>
                  <Badge variant="destructive">{client.risk}% Risk</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="text-sm">
                    <p className="text-muted-foreground">Last Active</p>
                    <p>{client.lastLogin}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">Renewal In</p>
                    <p>{client.renewal}</p>
                  </div>
                </div>
                <Progress value={client.risk} className="mb-3" />
                <div className="flex items-center justify-between">
                  <p className="text-sm"><strong>Suggested:</strong> {client.action}</p>
                  <Button size="sm" onClick={() => sendOffer(client.name)}>
                    Take Action
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
