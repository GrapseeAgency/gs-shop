'use client'

import { useState } from 'react'
import { FlaskConical, DollarSign, TrendingUp, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

export default function PricingTestPage() {
  const [test] = useState({
    service: 'Website Development',
    variantA: { price: 4999, visitors: 1200, conversions: 45, revenue: 224955 },
    variantB: { price: 5499, visitors: 1200, conversions: 38, revenue: 208962 },
    winner: 'A'
  })

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <FlaskConical className="h-10 w-10 text-purple-600" />
          Pricing Elasticity Test
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          A/B test different prices to maximize revenue
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">{test.service}</h2>
              <p className="text-muted-foreground">Active Test: Price Comparison</p>
            </div>
            <Badge className="bg-green-500">Live Test</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className={test.winner === 'A' ? 'border-green-500 border-2' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Variant A</span>
                  {test.winner === 'A' && <Badge className="bg-green-500">Winner</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-4xl font-bold mb-4">{test.variantA.price}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Visitors</span>
                    <span>{test.variantA.visitors}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Conversions</span>
                    <span>{test.variantA.conversions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Conversion Rate</span>
                    <span>{((test.variantA.conversions / test.variantA.visitors) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Revenue</span>
                    <span className="text-green-600">{test.variantA.revenue.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={test.winner === 'B' ? 'border-green-500 border-2' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Variant B</span>
                  {test.winner === 'B' && <Badge className="bg-green-500">Winner</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-4xl font-bold mb-4">{test.variantB.price}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Visitors</span>
                    <span>{test.variantB.visitors}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Conversions</span>
                    <span>{test.variantB.conversions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Conversion Rate</span>
                    <span>{((test.variantB.conversions / test.variantB.visitors) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Revenue</span>
                    <span className="text-green-600">{test.variantB.revenue.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <p className="font-bold text-green-800">
              Insight: {test.variantA.price} price point generates {(test.variantA.revenue - test.variantB.revenue).toLocaleString()} more revenue despite lower price.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button className="flex-1">
          <TrendingUp className="h-4 w-4 mr-2" />
          Apply Winner Price
        </Button>
        <Button variant="outline" className="flex-1">
          <FlaskConical className="h-4 w-4 mr-2" />
          Start New Test
        </Button>
      </div>
    </div>
  )
}
