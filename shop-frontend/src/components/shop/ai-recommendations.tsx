'use client'

import { useEffect, useState } from 'react'
import { Sparkles, ChevronRight } from 'lucide-react'
import { ProductCard } from './product-card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface AIRecommendationsProps {
  limit?: number
}

export function AIRecommendations({ limit = 4 }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    try {
      const res = await fetch(`/api/ai-recommendations?limit=${limit}`)
      if (res.ok) {
        const data = await res.json()
        setRecommendations(data.recommendations)
        setReason(data.reason)
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProductClick = (product: any) => {
    // Track click
    fetch('/api/ai-recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recommendationId: product.id })
    }).catch(() => {})
  }

  if (loading) {
    return (
      <section className="py-8">
        <div className="h-8 bg-muted rounded w-1/3 mb-4 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </section>
    )
  }

  if (recommendations.length === 0) return null

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Recommended For You
          </h2>
          <p className="text-sm text-muted-foreground">{reason}</p>
        </div>
        <Button variant="ghost" size="sm" className="gap-1">
          View All
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recommendations.map((product) => (
          <div key={product.id} onClick={() => handleProductClick(product)}>
            <ProductCard product={product} />
            {product.confidence && (
              <p className="text-xs text-muted-foreground mt-1">
                {product.confidence}% match
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

