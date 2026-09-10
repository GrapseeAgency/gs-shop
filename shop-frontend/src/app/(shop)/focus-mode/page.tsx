'use client'

import { useState, useEffect } from 'react'
import { Target, Clock, BellOff, Zap, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function FocusModePage() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [goal, setGoal] = useState('')
  const [duration, setDuration] = useState(30)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkFocusStatus()
  }, [])

  const checkFocusStatus = async () => {
    try {
      const res = await fetch('/api/adaptive/focus-mode')
      if (res.ok) {
        const data = await res.json()
        setIsEnabled(data.enabled)
        if (data.goal) setGoal(data.goal)
      }
    } catch (error) {
      console.error('Error checking focus status:', error)
    }
  }

  const toggleFocusMode = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/adaptive/focus-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enable: !isEnabled,
          goal: goal || undefined,
          duration
        })
      })

      if (res.ok) {
        const data = await res.json()
        setIsEnabled(data.enabled)
        toast.success(data.message)
      }
    } catch (error) {
      toast.error('Failed to toggle focus mode')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Target className="h-8 w-8 text-indigo-500" />
          Focus Mode
        </h1>
        <p className="text-muted-foreground">
          Eliminate distractions and shop with intention
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Shopping Focus</span>
            <Badge variant={isEnabled ? 'default' : 'secondary'}>
              {isEnabled ? 'Active' : 'Inactive'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isEnabled ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">What are you shopping for?</label>
                <Input
                  placeholder="e.g., Running shoes, Birthday gift, Office supplies..."
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Set a goal to stay focused on what matters
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Focus Duration</label>
                <div className="flex gap-2">
                  {[15, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setDuration(mins)}
                      className={`flex-1 py-2 px-4 rounded-lg border ${
                        duration === mins
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-muted hover:border-indigo-300'
                      }`}
                    >
                      {mins} min
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={toggleFocusMode}
                disabled={loading || !goal}
                className="w-full"
                size="lg"
              >
                <Zap className="h-4 w-4 mr-2" />
                Start Focus Mode
              </Button>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-100">
                <Target className="h-10 w-10 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Focus Mode Active</h3>
                <p className="text-muted-foreground">Goal: {goal}</p>
              </div>
              <div className="flex items-center justify-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {duration} minutes
                </span>
                <span className="flex items-center gap-1">
                  <BellOff className="h-4 w-4" />
                  Distractions blocked
                </span>
              </div>
              <Button
                onClick={toggleFocusMode}
                variant="outline"
                className="w-full"
              >
                <Check className="h-4 w-4 mr-2" />
                End Focus Mode
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Benefits */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <BellOff className="h-8 w-8 mx-auto mb-2 text-indigo-500" />
            <h3 className="font-medium">No Distractions</h3>
            <p className="text-xs text-muted-foreground">
              Notifications silenced, recommendations focused
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-indigo-500" />
            <h3 className="font-medium">Goal Tracking</h3>
            <p className="text-xs text-muted-foreground">
              Stay on track with your shopping goal
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 mx-auto mb-2 text-indigo-500" />
            <h3 className="font-medium">Streamlined</h3>
            <p className="text-xs text-muted-foreground">
              Faster checkout, reduced decision fatigue
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
