'use client'

import { useState } from 'react'
import { BarChart3, TrendingUp, TrendingDown, Calendar, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function QBRReportsPage() {
  const [reports] = useState([
    {
      period: 'Q4 2024',
      status: 'completed',
      metrics: {
        traffic: '+45%',
        conversions: '+22%',
        revenue: '+38%'
      },
      recommendations: [
        'Optimize product page load times',
        'Add customer testimonials section',
        'Implement abandoned cart recovery'
      ]
    }
  ])

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <BarChart3 className="h-10 w-10 text-blue-600" />
          Quarterly Business Reviews
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          90-day performance insights and recommendations
        </p>
      </div>

      {reports.map((report) => (
        <Card key={report.period} className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <CardTitle>{report.period} Report</CardTitle>
              </div>
              <Badge>{report.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              {Object.entries(report.metrics).map(([key, value]) => (
                <div key={key} className="bg-muted p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground capitalize mb-1">{key}</p>
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <p className="text-2xl font-bold text-green-600">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <h3 className="font-bold mb-3">Recommendations</h3>
              <ul className="space-y-2">
                {report.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <Badge variant="outline">{i + 1}</Badge>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download Full Report
            </Button>
          </CardContent>
        </Card>
      ))}

      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg mb-1">Next Review: Q1 2025</h3>
              <p className="text-sm text-muted-foreground">Scheduled for April 15, 2025</p>
            </div>
            <Badge variant="outline">Auto-Generated</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
