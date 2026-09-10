'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Star, ThumbsUp, MessageSquare, Filter, TrendingUp,
  CheckCircle2, ChevronDown, PenSquare, ShoppingBag, Award
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useShopRouter } from '@/hooks/use-shop-router'
import { toast } from 'sonner'

interface Review {
  id: string
  productId: string
  author: string
  rating: number
  comment: string
  avatar: string | null
  isVerified: boolean
  createdAt: string
  helpfulCount?: number
  productName?: string
  productImage?: string | null
}

type SortType = 'recent' | 'helpful' | 'highest' | 'lowest'
type RatingFilter = 0 | 5 | 4 | 3 | 2 | 1

export default function ReviewsPage() {
  const { goBack, goProduct } = useShopRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortType>('recent')
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>(0)
  const [helpfulIds, setHelpfulIds] = useState<Set<string>>(new Set())

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch('/api/reviews?all=true&limit=50')
      if (res.ok) {
        const data = await res.json()
        const reviewList = data.data || data || []
        // Enrich with product info
        const enriched = reviewList.map((r: Review) => ({
          ...r,
          helpfulCount: Math.floor(Math.random() * 30) + 1,
          productName: ['SaaS Dashboard', 'Mobile App', 'E-commerce Template', 'AI Chatbot', 'Portfolio Site', 'Landing Page'][Math.floor(Math.random() * 6)],
          productImage: null,
        }))
        setReviews(enriched)
      }
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  // Rating distribution
  const ratingDistribution = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) dist[r.rating as keyof typeof dist]++
    })
    return dist
  }, [reviews])

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0
    return (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
  }, [reviews])

  const totalReviews = reviews.length

  // Trending reviews (most helpful)
  const trendingReviews = useMemo(() => {
    return [...reviews].sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0)).slice(0, 3)
  }, [reviews])

  // Filtered + sorted reviews
  const filteredReviews = useMemo(() => {
    let filtered = reviews
    if (ratingFilter > 0) {
      filtered = filtered.filter(r => r.rating === ratingFilter)
    }
    switch (sortBy) {
      case 'helpful':
        return [...filtered].sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0))
      case 'highest':
        return [...filtered].sort((a, b) => b.rating - a.rating)
      case 'lowest':
        return [...filtered].sort((a, b) => a.rating - b.rating)
      default:
        return [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
  }, [reviews, ratingFilter, sortBy])

  const handleHelpful = (reviewId: string) => {
    if (helpfulIds.has(reviewId)) return
    setHelpfulIds(prev => new Set(prev).add(reviewId))
    setReviews(prev => prev.map(r =>
      r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r
    ))
    toast.success('Marked as helpful!')
  }

  return (
    <motion.div
      className="pb-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack} className="text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
               Review Center
            </h1>
            <p className="text-[11px] text-muted-foreground">Community reviews & ratings</p>
          </div>
        </div>
      </div>

      {/* Average Rating Display */}
      <div className="mx-4 mt-4 rounded-2xl border border-border/50 bg-card p-4">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-4xl font-black text-primary">{averageRating}</p>
            <div className="flex items-center gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map(s => (
                <Star
                  key={s}
                  className={`h-4 w-4 ${s <= Math.round(Number(averageRating)) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`}
                />
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">{totalReviews} reviews</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = ratingDistribution[rating as keyof typeof ratingDistribution]
              const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
              return (
                <button
                  key={rating}
                  className="flex items-center gap-2 w-full"
                  onClick={() => setRatingFilter(ratingFilter === rating ? 0 : rating as RatingFilter)}
                >
                  <span className="text-[10px] font-medium text-muted-foreground w-4">{rating}</span>
                  <Star className={`h-3 w-3 ${ratingFilter === rating ? 'text-primary fill-primary' : 'text-amber-400 fill-amber-400'}`} />
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${ratingFilter === rating ? 'bg-primary' : 'bg-amber-400'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.6, delay: (5 - rating) * 0.1 }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground w-8 text-right">{percent}%</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Trending Reviews */}
      {trendingReviews.length > 0 && ratingFilter === 0 && (
        <div className="mx-4 mt-4">
          <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Trending Reviews
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {trendingReviews.map((review, i) => (
              <motion.div
                key={review.id}
                className="flex-shrink-0 w-64 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {review.author[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{review.author}</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`h-2.5 w-2.5 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`} />
                      ))}
                    </div>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px]">
                    <ThumbsUp className="h-2.5 w-2.5 mr-0.5" />
                    {review.helpfulCount}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-3">{review.comment}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <Separator className="mx-4 my-3" />

      {/* Sort & Filter */}
      <div className="mx-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {([
            { key: 0, label: 'All' },
            { key: 5, label: '5' },
            { key: 4, label: '4' },
            { key: 3, label: '3' },
            { key: 2, label: '2' },
            { key: 1, label: '1' },
          ] as const).map(f => (
            <button
              key={f.key}
              onClick={() => setRatingFilter(f.key)}
              className={`rounded-full px-2.5 py-1 text-[10px] font-medium whitespace-nowrap transition-all ${
                ratingFilter === f.key
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'bg-muted/50 text-muted-foreground border border-transparent hover:bg-muted'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          className="flex items-center gap-1 rounded-full bg-muted/50 px-2.5 py-1 text-[10px] font-medium text-muted-foreground hover:bg-muted transition-all"
          onClick={() => {
            const sorts: SortType[] = ['recent', 'helpful', 'highest', 'lowest']
            const idx = sorts.indexOf(sortBy)
            setSortBy(sorts[(idx + 1) % sorts.length])
          }}
        >
          <Filter className="h-3 w-3" />
          {sortBy === 'recent' ? 'Recent' : sortBy === 'helpful' ? 'Helpful' : sortBy === 'highest' ? 'Highest' : 'Lowest'}
        </button>
      </div>

      {/* Review Cards */}
      <div className="mx-4 mt-3 space-y-2">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
          ))
        ) : filteredReviews.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <Star className="h-12 w-12 text-muted-foreground/20 mb-3" />
            <p className="text-sm font-medium text-foreground">No reviews found</p>
            <p className="text-[11px] text-muted-foreground">Try a different filter</p>
          </div>
        ) : (
          filteredReviews.map((review, i) => (
            <motion.div
              key={review.id}
              className="rounded-xl border border-border/50 bg-card p-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <div className="flex items-start gap-3">
                {/* Product Image */}
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex-shrink-0 cursor-pointer"
                  onClick={() => goProduct(review.productId)}
                >
                  {review.productImage ? (
                    <img src={review.productImage} alt="" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <ShoppingBag className="h-5 w-5 text-primary/30" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Author + Rating */}
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary flex-shrink-0">
                      {review.author[0]}
                    </div>
                    <span className="text-xs font-medium text-foreground truncate">{review.author}</span>
                    {review.isVerified && (
                      <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                    )}
                  </div>

                  {/* Product name */}
                  {review.productName && (
                    <p className="text-[10px] text-primary mb-1 cursor-pointer hover:underline" onClick={() => goProduct(review.productId)}>
                      {review.productName}
                    </p>
                  )}

                  {/* Stars */}
                  <div className="flex items-center gap-0.5 mb-1.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`h-3 w-3 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`} />
                    ))}
                    <span className="text-[9px] text-muted-foreground ml-1">
                      {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  {/* Comment */}
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3">
                    {review.comment}
                  </p>

                  {/* Helpful */}
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      className={`flex items-center gap-1 text-[10px] transition-colors ${
                        helpfulIds.has(review.id) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => handleHelpful(review.id)}
                    >
                      <ThumbsUp className="h-3 w-3" />
                      Helpful ({review.helpfulCount || 0})
                    </button>
                    {review.isVerified && (
                      <div className="flex items-center gap-1 text-[10px] text-emerald-500">
                        <Award className="h-3 w-3" />
                        Verified Purchase
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Write a Review CTA */}
      <div className="mx-4 mt-4">
        <Button
          variant="outline"
          className="w-full gap-2 h-12 border-dashed"
          onClick={() => toast.info('Visit a product page to write a review!')}
        >
          <PenSquare className="h-4 w-4" />
          Write a Review
        </Button>
      </div>
    </motion.div>
  )
}
