'use client'

import { useEffect, useState } from 'react'
import { Grid3X3, Gift, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

const CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Services', 'Digital', 'Books', 'Sports', 'Beauty']

export default function BingoPage() {
  const [grid, setGrid] = useState<string[]>([])
  const [marked, setMarked] = useState<number[]>([])
  const [completed, setCompleted] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBingoCard()
  }, [])

  const fetchBingoCard = async () => {
    try {
      const res = await fetch('/api/gamification/bingo')
      if (res.ok) {
        const data = await res.json()
        setGrid(data.grid || [])
        setMarked(data.marked || [])
        setCompleted(data.completed || [])
      }
    } catch (error) {
      console.error('Error fetching bingo:', error)
    } finally {
      setLoading(false)
    }
  }

  const claimReward = async (lineType: string) => {
    try {
      const res = await fetch('/api/gamification/bingo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lineType })
      })

      if (res.ok) {
        const data = await res.json()
        toast.success(`Claimed: ${data.reward.code} - ${data.reward.discount}% off!`)
        fetchBingoCard()
      }
    } catch (error) {
      toast.error('Failed to claim reward')
    }
  }

  const isMarked = (index: number) => marked.includes(index)
  const isCenter = (index: number) => index === 12

  if (loading) {
    return (
      <div className="container max-w-2xl py-8">
        <div className="h-96 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Grid3X3 className="h-8 w-8 text-emerald-500" />
          Product Bingo
        </h1>
        <p className="text-muted-foreground">
          Buy from 5 categories, complete a row, win a prize!
        </p>
      </div>

      {/* Bingo Grid */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-5 gap-2">
            {grid.map((cell, index) => (
              <div
                key={index}
                className={`aspect-square flex items-center justify-center rounded-lg text-center p-1 text-xs font-medium transition-all ${
                  isCenter(index)
                    ? 'bg-amber-500 text-white'
                    : isMarked(index)
                    ? 'bg-emerald-500 text-white'
                    : 'bg-muted'
                }`}
              >
                {isCenter(index) ? 'FREE' : cell}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span>Marked: {marked.length}/24</span>
            <span className="text-sm text-muted-foreground">
              {Math.round((marked.length / 24) * 100)}% complete
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${(marked.length / 24) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Completed Lines */}
      {completed.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              Completed Lines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {completed.map((line) => (
              <div key={line} className="flex items-center justify-between p-2 bg-emerald-50 rounded">
                <span className="font-medium capitalize">{line.replace('-', ' ')}</span>
                <Badge className="bg-emerald-500">Claimed!</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* How to Play */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">How to Play</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. Buy products from the categories shown on your card</p>
          <p>2. Complete a row, column, or diagonal</p>
          <p>3. Win discount coupons (5% - 30% off!)</p>
          <p>4. Full house = 30% off coupon + 200 points!</p>
        </CardContent>
      </Card>
    </div>
  )
}
