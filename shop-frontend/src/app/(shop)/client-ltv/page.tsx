'use client'

import { useState } from 'react'
import { Users, TrendingUp, DollarSign, ShoppingBag } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

export default function ClientLTVPage() {
  const [segments] = useState([
    { name: 'VIP Clients', count: 15, avgLTV: 85000, totalRevenue: 1275000 },
    { name: 'Regular Clients', count: 45, avgLTV: 25000, totalRevenue: 1125000 },
    { name: 'One-time Clients', count: 120, avgLTV: 8000, totalRevenue: 960000 }
  ])

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <TrendingUp className="h-10 w-10 text-blue-600" />
          Client Lifetime Value
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Understand which clients bring the most value
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold">180</p>
            <p className="text-sm text-muted-foreground">Total Clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold">33,600</p>
            <p className="text-sm text-muted-foreground">Average LTV</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold">2.3</p>
            <p className="text-sm text-muted-foreground">Avg Purchases</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {segments.map((segment) => (
          <Card key={segment.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">{segment.name}</h3>
                <Badge>{segment.count} clients</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted p-3 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Average LTV</p>
                  <p className="text-xl font-bold text-green-600">{segment.avgLTV.toLocaleString()}</p>
                </div>
                <div className="bg-muted p-3 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-xl font-bold">{(segment.totalRevenue / 100000).toFixed(1)}L</p>
                </div>
                <div className="bg-muted p-3 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Revenue Share</p>
                  <p className="text-xl font-bold">
                    {Math.round((segment.totalRevenue / 3360000) * 100)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
