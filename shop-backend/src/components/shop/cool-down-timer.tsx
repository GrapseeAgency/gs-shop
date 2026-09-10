'use client'

import { useState, useEffect } from 'react'
import { Timer, Pause, Play, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export function CoolDownTimer({ productId, price }: { productId: string; price: number }) {
  const [timer, setTimer] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ minutes: 30, seconds: 0 })

  const startTimer = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/nudge/cool-down', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, price, action: 'start' })
      })

      if (res.ok) {
        const data = await res.json()
        setTimer(data)
        toast.info(data.message)
      }
    } catch (error) {
      toast.error('Failed to start timer')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (timer?.coolDownRequired && !timer?.coolDownComplete) {
      const interval = setInterval(async () => {
        const res = await fetch('/api/nudge/cool-down', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, price, action: 'check' })
        })
        
        if (res.ok) {
          const data = await res.json()
          if (data.coolDownComplete) {
            setTimer(prev => ({ ...prev, coolDownComplete: true }))
            toast.success('Cool-down complete! You can now purchase.')
            clearInterval(interval)
          } else {
            setTimeLeft(data.remaining || timeLeft)
          }
        }
      }, 60000) // Check every minute

      return () => clearInterval(interval)
    }
  }, [timer, productId, price])

  if (price < 5000) {
    return null
  }

  if (!timer) {
    return (
      <Card className="border-amber-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <div className="flex-1">
              <p className="font-medium">High-value purchase detected</p>
              <p className="text-sm text-muted-foreground">
                This item costs {price.toLocaleString()}. Take 30 minutes to think it over?
              </p>
            </div>
            <Button onClick={startTimer} disabled={loading} variant="outline">
              <Timer className="h-4 w-4 mr-2" />
              Start Timer
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (timer.coolDownComplete) {
    return (
      <Card className="border-emerald-500">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-500">Ready</Badge>
            <div>
              <p className="font-medium">Cool-down complete!</p>
              <p className="text-sm text-muted-foreground">
                You&apos;ve waited 30 minutes. Ready to proceed?
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-amber-500">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Pause className="h-5 w-5 text-amber-500" />
          <div className="flex-1">
            <p className="font-medium">Cool-down in progress</p>
            <p className="text-sm text-muted-foreground">
              {timeLeft.minutes}:{timeLeft.seconds.toString().padStart(2, '0')} remaining
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Users who wait save an average of 12% on high-value purchases
            </p>
          </div>
          <div className="text-2xl font-mono">
            {timeLeft.minutes}:{timeLeft.seconds.toString().padStart(2, '0')}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
