'use client'

import { useState } from 'react'
import { Activity, CheckCircle, AlertTriangle, Clock, Globe, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function HealthMonitorPage() {
  const [health] = useState({
    status: 'healthy',
    uptime: '99.9%',
    lastCheck: '2 minutes ago',
    errors: 0,
    performance: 94,
    metrics: [
      { name: 'Uptime', value: '99.9%', status: 'good' },
      { name: 'Response Time', value: '0.8s', status: 'good' },
      { name: 'Error Rate', value: '0.02%', status: 'good' },
      { name: 'SEO Score', value: '94/100', status: 'good' }
    ],
    history: [
      { date: 'Week 1', status: 'healthy', uptime: '100%' },
      { date: 'Week 2', status: 'healthy', uptime: '99.9%' },
      { date: 'Week 3', status: 'healthy', uptime: '99.8%' },
      { date: 'Week 4', status: 'healthy', uptime: '100%' }
    ]
  })

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Activity className="h-10 w-10 text-green-600" />
          Post-Delivery Health Monitor
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Automatic weekly health reports
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="text-xl font-bold text-green-600">Healthy</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-sm text-muted-foreground">Uptime</p>
            <p className="text-xl font-bold">{health.uptime}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-sm text-muted-foreground">Errors (7d)</p>
            <p className="text-xl font-bold">{health.errors}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Zap className="h-6 w-6 text-yellow-600" />
            </div>
            <p className="text-sm text-muted-foreground">Performance</p>
            <p className="text-xl font-bold">{health.performance}/100</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Live Metrics</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {health.metrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <span>{metric.name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{metric.value}</span>
                  <Badge variant={metric.status === 'good' ? 'default' : 'destructive'}>
                    {metric.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>30-Day History</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            {health.history.map((week, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span>{week.date}</span>
                <div className="flex items-center gap-4">
                  <Badge variant="outline">{week.uptime}</Badge>
                  <Badge className="bg-green-500">{week.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex gap-4">
        <Button className="flex-1">
          <Globe className="h-4 w-4 mr-2" />
          View Live Site
        </Button>
        <Button variant="outline" className="flex-1">
          Download Report PDF
        </Button>
      </div>
    </div>
  )
}
