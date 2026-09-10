'use client'

import { useState } from 'react'
import { CloudSun, TrendingUp, Calendar, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function DemandForecastPage() {
  const [forecasts] = useState([
    { month: 'January', demand: 'High', service: 'E-commerce', reason: 'New Year sales prep' },
    { month: 'February', demand: 'Medium', service: 'General Websites', reason: 'Budget renewals' },
    { month: 'March', demand: 'High', service: 'Mobile Apps', reason: 'Q1 launches' },
    { month: 'April', demand: 'Low', service: 'Maintenance', reason: 'Post-launch support' },
    { month: 'May', demand: 'Medium', service: 'Web Apps', reason: 'Mid-year projects' }
  ])

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <CloudSun className="h-10 w-10 text-blue-600" />
          Demand Forecasting
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Predict busy seasons, prepare ahead
        </p>
      </div>

      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold">Current Insight</h3>
              <p className="text-sm text-muted-foreground">
                Wedding website inquiries spike in November. Prepare templates now.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {forecasts.map((forecast) => (
          <Card key={forecast.month}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">{forecast.month}</h3>
                    <p className="text-sm text-muted-foreground">{forecast.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={
                    forecast.demand === 'High' ? 'destructive' :
                    forecast.demand === 'Medium' ? 'default' : 'secondary'
                  }>
                    {forecast.demand} Demand
                  </Badge>
                  <Badge variant="outline">{forecast.service}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Action Items
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Badge variant="outline">1</Badge>
                Stock up on e-commerce templates
              </li>
              <li className="flex items-center gap-2">
                <Badge variant="outline">2</Badge>
                Prepare marketing campaigns
              </li>
              <li className="flex items-center gap-2">
                <Badge variant="outline">3</Badge>
                Schedule additional team capacity
              </li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Historical Accuracy</CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <p className="text-5xl font-bold text-green-600 mb-2">87%</p>
            <p className="text-muted-foreground">Forecast accuracy over last 12 months</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
