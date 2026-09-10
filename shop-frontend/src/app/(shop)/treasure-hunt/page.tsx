'use client'

import { useEffect, useState } from 'react'
import { Search, Gift, Trophy, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function TreasureHuntPage() {
  const [treasures, setTreasures] = useState<any[]>([])
  const [foundCount, setFoundCount] = useState(0)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTreasures()
  }, [])

  const fetchTreasures = async () => {
    try {
      const res = await fetch('/api/gamification/treasure-hunt')
      if (res.ok) {
        const data = await res.json()
        setTreasures(data.activeTreasures)
        setFoundCount(data.foundCount)
      }
    } catch (error) {
      console.error('Error fetching treasures:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!code.trim()) return

    try {
      const res = await fetch('/api/gamification/treasure-hunt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.toUpperCase() })
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(data.message)
        setFoundCount(prev => prev + 1)
        setCode('')
        fetchTreasures()
      } else {
        toast.error(data.error || 'Invalid code')
      }
    } catch (error) {
      toast.error('Failed to submit code')
    }
  }

  if (loading) {
    return (
      <div className="container max-w-2xl py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/2" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Search className="h-8 w-8 text-amber-500" />
          Treasure Hunt
        </h1>
        <p className="text-muted-foreground">
          Hidden discount codes are scattered across the app. Find them all!
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-4 text-center">
            <Trophy className="h-6 w-6 mx-auto text-amber-500 mb-2" />
            <p className="text-2xl font-bold">{foundCount}</p>
            <p className="text-xs text-muted-foreground">Found</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Gift className="h-6 w-6 mx-auto text-emerald-500 mb-2" />
            <p className="text-2xl font-bold">{treasures.length}</p>
            <p className="text-xs text-muted-foreground">Remaining</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Clock className="h-6 w-6 mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold">24h</p>
            <p className="text-xs text-muted-foreground">Reset</p>
          </CardContent>
        </Card>
      </div>

      {/* Code Entry */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">Enter Treasure Code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter code (e.g., TREASURE123)"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="font-mono"
            />
            <Button onClick={handleSubmit}>
              Submit
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Codes are hidden on product pages, checkout flows, and throughout the app!
          </p>
        </CardContent>
      </Card>

      {/* Hints */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Available Treasures</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {treasures.length > 0 ? (
            treasures.map((treasure) => (
              <div
                key={treasure.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <Badge variant={treasure.difficulty === 'hard' ? 'destructive' : 'secondary'}>
                    {treasure.difficulty}
                  </Badge>
                  <div>
                    <p className="font-medium">{treasure.location}</p>
                    <p className="text-xs text-muted-foreground">{treasure.hint}</p>
                  </div>
                </div>
                <Gift className="h-5 w-5 text-amber-500" />
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">All treasures found for today!</p>
              <p className="text-xs text-muted-foreground mt-1">
                New treasures appear every 24 hours
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leaderboard teaser */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Top hunters win exclusive badges and bonus points!
        </p>
        <Button variant="outline" className="mt-2">
          View Leaderboard
        </Button>
      </div>
    </div>
  )
}
