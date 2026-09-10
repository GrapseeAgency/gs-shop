'use client'

import { useState, useEffect } from 'react'
import { Gauge, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

export function SpendingSpeedometer() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSpeedometerData()
  }, [])

  const fetchSpeedometerData = async () => {
    try {
      const res = await fetch('/api/nudge/spending-speedometer')
      if (res.ok) {
        const data = await res.json()
        setData(data)
      }
    } catch (error) {
      console.error('Error fetching speedometer:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !data) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse h-20 bg-muted rounded" />
        </CardContent>
      </Card>
    )
  }

  const getColor = (level: string) => {
    switch (level) {
      case 'overspeed': return 'text-red-500'
      case 'warning': return 'text-amber-500'
      case 'underspeed': return 'text-blue-500'
      default: return 'text-emerald-500'
    }
  }

  const getBgColor = (level: string) => {
    switch (level) {
      case 'overspeed': return 'bg-red-100'
      case 'warning': return 'bg-amber-100'
      case 'underspeed': return 'bg-blue-100'
      default: return 'bg-emerald-100'
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Gauge className="h-4 w-4" />
          Spending Speedometer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Gauge */}
        <div className="relative">
          <Progress value={data.percentage} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0</span>
            <span>Budget: {data.budgetLimit?.toLocaleString()}</span>
          </div>
        </div>

        {/* Status */}
        <div className={`p-3 rounded-lg ${getBgColor(data.speedLevel)}`}>
          <div className="flex items-center gap-2">
            {data.speedLevel === 'overspeed' && <AlertTriangle className="h-5 w-5 text-red-500" />}
            {data.speedLevel === 'warning' && <TrendingUp className="h-5 w-5 text-amber-500" />}
            {data.speedLevel === 'underspeed' && <TrendingDown className="h-5 w-5 text-blue-500" />}
            {data.speedLevel === 'normal' && <Gauge className="h-5 w-5 text-emerald-500" />}
            <span className={`font-medium ${getColor(data.speedLevel)}`}>
              {data.message}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Spent this month</p>
            <p className="text-lg font-semibold">{data.currentSpeed?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Remaining</p>
            <p className="text-lg font-semibold">{data.remaining?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Daily budget</p>
            <p className="font-medium">{data.dailyBudget?.toLocaleString()}/day</p>
          </div>
          <div>
            <p className="text-muted-foreground">Days left</p>
            <p className="font-medium">{data.daysLeft} days</p>
          </div>
        </div>

        {data.speedLevel === 'overspeed' && (
          <p className="text-xs text-red-600">
            At this pace, you&apos;ll exceed your budget by month end.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

