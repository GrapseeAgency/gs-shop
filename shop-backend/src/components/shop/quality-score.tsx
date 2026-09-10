'use client'

import { useState, useEffect } from 'react'
import { Award, Shield, Clock, RotateCcw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

export function QualityScore({ productId }: { productId: string }) {
  const [score, setScore] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQualityScore()
  }, [productId])

  const fetchQualityScore = async () => {
    try {
      const res = await fetch(`/api/nudge/quality-score?productId=${productId}`)
      if (res.ok) {
        const data = await res.json()
        setScore(data)
      }
    } catch (error) {
      console.error('Error fetching quality score:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !score) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse h-16 bg-muted rounded" />
        </CardContent>
      </Card>
    )
  }

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-emerald-500'
    if (s >= 65) return 'text-blue-500'
    if (s >= 50) return 'text-amber-500'
    return 'text-red-500'
  }

  const getBadgeVariant = (s: number) => {
    if (s >= 80) return 'default'
    if (s >= 65) return 'secondary'
    if (s >= 50) return 'outline'
    return 'destructive'
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Award className="h-4 w-4" />
          Quality Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Display */}
        <div className="flex items-center gap-4">
          <div className={`text-3xl font-bold ${getScoreColor(score.qualityScore)}`}>
            {score.qualityScore}
          </div>
          <div>
            <Badge variant={getBadgeVariant(score.qualityScore)}>
              {score.quality}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              Predicted lifespan: {score.predictedLifespan}
            </p>
          </div>
        </div>

        {/* Progress */}
        <Progress value={score.qualityScore} className="h-2" />

        {/* Breakdown */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Award className="h-3 w-3" />
              Rating
            </span>
            <span>{score.breakdown?.ratingScore}/20</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1 text-muted-foreground">
              <RotateCcw className="h-3 w-3" />
              Reviews
            </span>
            <span>{Math.round(score.breakdown?.reviewScore)}/10</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Shield className="h-3 w-3" />
              Seller
            </span>
            <span>{score.breakdown?.sellerScore}/15</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              Warranty
            </span>
            <span>{Math.round(score.breakdown?.warrantyScore)}/10</span>
          </div>
        </div>

        {/* Verdict */}
        <div className="bg-muted p-3 rounded-lg">
          <p className="text-sm">{score.verdict}</p>
        </div>
      </CardContent>
    </Card>
  )
}
