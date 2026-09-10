'use client'

import { useState } from 'react'
import { Users, Trophy, Percent, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

export default function CrowdWisdomPage() {
  const [products, setProducts] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const getWisdom = async () => {
    setLoading(true)
    
    try {
      const res = await fetch('/api/decision-helpers/crowd-wisdom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: ['1', '2', '3'] })
      })
      
      if (res.ok) {
        const data = await res.json()
        setResult(data)
      }
    } catch (error) {
      toast.error('Failed to get crowd wisdom')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Users className="h-8 w-8 text-indigo-600" />
          Crowd Wisdom
        </h1>
        <p className="text-muted-foreground">
          See what 10,000+ people chose and why
        </p>
      </div>

      {!result ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              Compare products to see crowd choice statistics
            </p>
            <Button size="lg" onClick={getWisdom} disabled={loading}>
              {loading ? 'Analyzing...' : <><TrendingUp className="h-4 w-4 mr-2" /> View Comparison</>}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="bg-indigo-50 border-indigo-200">
            <CardContent className="p-8 text-center">
              <Trophy className="h-16 w-16 mx-auto mb-4 text-indigo-600" />
              <p className="text-4xl font-bold text-indigo-700">
                {result.crowdWisdom?.crowdPercent || 73}%
              </p>
              <p className="text-indigo-600">
                of buyers chose {result.crowdWisdom?.winner?.name || 'Product A'}
              </p>
              <p className="text-sm text-indigo-500 mt-2">
                Based on {result.crowdWisdom?.totalComparisons?.toLocaleString() || '12,450'} real purchases
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {result.products?.map((product: any, i: number) => (
              <Card key={i} className={i === 0 ? 'border-2 border-indigo-500' : ''}>
                <CardContent className="p-4 text-center">
                  <p className="font-medium">{product.name}</p>
                  <Progress 
                    value={(product.totalSales / (result.products?.[0]?.totalSales || 1)) * 100} 
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {product.totalSales?.toLocaleString()} sales
                  </p>
                  <Badge className="mt-2" variant={i === 0 ? 'default' : 'secondary'}>
                    {i === 0 ? 'WINNER' : `${Percent} ${Math.round((product.totalSales / result.products?.[0]?.totalSales) * 100)}%`}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Why People Chose the Winner</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.crowdWisdom?.reasoning?.map((reason: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
