'use client'

import { useState } from 'react'
import { TrendingUp, Calendar, Sparkles, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function TrendForecasterPage() {
  const [season, setSeason] = useState('summer-2024')

  const trends: Record<string, any[]> = {
    'summer-2024': [
      { name: 'Pastel Colors', growth: '+45%', status: 'rising' },
      { name: 'Crochet Tops', growth: '+32%', status: 'hot' },
      { name: 'Wide Leg Pants', growth: '+28%', status: 'stable' },
    ],
    'winter-2024': [
      { name: 'Oversized Coats', growth: '+38%', status: 'hot' },
      { name: 'Chunky Boots', growth: '+25%', status: 'rising' },
      { name: 'Turtlenecks', growth: '+18%', status: 'stable' },
    ],
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <TrendingUp className="h-8 w-8 text-purple-600" />
          Trend Forecaster
        </h1>
        <p className="text-muted-foreground">
          Upcoming fashion trends
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        {Object.keys(trends).map((s) => (
          <Button
            key={s}
            variant={season === s ? 'default' : 'outline'}
            onClick={() => setSeason(s)}
          >
            {s.replace('-', ' ').toUpperCase()}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {trends[season]?.map((trend, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-bold">{trend.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Trending since last month</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge className={trend.status === 'hot' ? 'bg-red-500' : 'bg-green-500'}>
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  {trend.growth}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
