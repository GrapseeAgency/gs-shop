'use client'

import { useState } from 'react'
import { TrendingUp, DollarSign, Clock, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function ProfitabilityPage() {
  const [services] = useState([
    { name: 'Website Development', revenue: 245000, hours: 180, profit: 98000, margin: 40 },
    { name: 'Web Applications', revenue: 380000, hours: 220, profit: 152000, margin: 40 },
    { name: 'E-commerce', revenue: 165000, hours: 120, profit: 82500, margin: 50 },
    { name: 'Mobile Apps', revenue: 480000, hours: 280, profit: 192000, margin: 40 }
  ])

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <BarChart3 className="h-10 w-10 text-green-600" />
          Service Profitability Dashboard
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Which services make the most profit?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold">12.7L</p>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold">5.2L</p>
            <p className="text-sm text-muted-foreground">Total Profit</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-orange-600" />
            <p className="text-2xl font-bold">800</p>
            <p className="text-sm text-muted-foreground">Hours Delivered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold">41%</p>
            <p className="text-sm text-muted-foreground">Avg Margin</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.name} className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold">{service.name}</h3>
                  <Badge className={service.margin >= 45 ? 'bg-green-500' : 'bg-blue-500'}>
                    {service.margin}% margin
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Revenue</p>
                    <p className="font-medium">{service.revenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Hours</p>
                    <p className="font-medium">{service.hours}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Profit</p>
                    <p className="font-medium text-green-600">{service.profit.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
