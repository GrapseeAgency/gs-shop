'use client'

import { useEffect, useState } from 'react'
import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface SentimentBadgeProps {
  productId: string
}

export function SentimentBadge({ productId }: SentimentBadgeProps) {
  const [sentiment, setSentiment] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSentiment()
  }, [productId])

  const fetchSentiment = async () => {
    try {
      const res = await fetch(`/api/sentiment-analysis?productId=${productId}`)
      if (res.ok) {
        const data = await res.json()
        setSentiment(data.stats)
      }
    } catch (error) {
      console.error('Error fetching sentiment:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !sentiment || sentiment.total === 0) return null

  const { positivePercent } = sentiment

  let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'secondary'
  let icon = <Minus className="h-3 w-3" />

  if (positivePercent >= 80) {
    variant = 'default'
    icon = <ThumbsUp className="h-3 w-3" />
  } else if (positivePercent >= 60) {
    variant = 'secondary'
    icon = <ThumbsUp className="h-3 w-3" />
  } else if (positivePercent < 40) {
    variant = 'destructive'
    icon = <ThumbsDown className="h-3 w-3" />
  }

  return (
    <Badge variant={variant} className="gap-1">
      {icon}
      {positivePercent}% positive
    </Badge>
  )
}

