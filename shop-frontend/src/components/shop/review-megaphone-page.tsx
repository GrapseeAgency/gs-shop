'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Star, ThumbsUp, Award, Crown, Diamond,
  PenSquare, Flame, MessageCircle, User, Trophy, Medal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useShopRouter } from '@/hooks/use-shop-router'
import { toast } from 'sonner'

type BadgeTier = 'new' | 'regular' | 'expert' | 'legend'

interface Reviewer {
  id: string
  name: string
  reviewCount: number
  helpfulVotes: number
  badgeTier: BadgeTier
  avatarUrl: string | null
  isTop: boolean
}

interface ViralReview {
  id: string
  authorName: string
  productName: string
  rating: number
  snippet: string
  helpfulCount: number
  badgeTier: BadgeTier
}

const tierConfig: Record<BadgeTier, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  new: { label: 'New', icon: User, color: 'text-gray-400', bg: 'bg-glass-very-light0/10' },
  regular: { label: 'Regular', icon: Medal, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  expert: { label: 'Expert', icon: Crown, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  legend: { label: 'Legend', icon: Diamond, color: 'text-violet-400', bg: 'bg-violet-500/10' },
}



export function ReviewMegaphonePage() {
  const { goBack } = useShopRouter()
  const [reviewers, setReviewers] = useState<Reviewer[]>([])
  const [viralReviews, setViralReviews] = useState<ViralReview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/review-megaphone')
        if (res.ok) {
          const data = await res.json()
          if (data.reviewers?.length) setReviewers(data.reviewers)
          if (data.viralReviews?.length) setViralReviews(data.viralReviews)
        }
      } catch { setReviewers([]); setViralReviews([]); }
      setLoading(false)
    }
    fetchData()
  }, [])

  const reviewerOfMonth = reviewers[0]

  return (
    <motion.div className="min-h-screen bg-background pb-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack} className="flex-shrink-0 text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" /> Review Megaphone
            </h1>
          </div>
          <Button size="sm" className="gap-1 text-[10px] bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => toast.info('Write a review on any product page!')}>
            <PenSquare className="h-3 w-3" /> Write Review
          </Button>
        </div>
      </div>

      {/* Reviewer of the Month */}
      {reviewerOfMonth && (
        <div className="mx-4 mt-3 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h2 className="text-sm font-bold text-foreground">Reviewer of the Month</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              {reviewerOfMonth.avatarUrl ? (
                <img src={reviewerOfMonth.avatarUrl} alt={reviewerOfMonth.name} className="h-full w-full rounded-full object-cover" />
              ) : (
                <Star className="h-6 w-6 text-amber-500" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">{reviewerOfMonth.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge className={`${tierConfig[reviewerOfMonth.badgeTier]?.bg ?? 'bg-glass-very-light0/10'} ${tierConfig[reviewerOfMonth.badgeTier]?.color ?? 'text-gray-400'} text-[9px] gap-0.5`}>
                  {(() => { const TierIcon = tierConfig[reviewerOfMonth.badgeTier]?.icon ?? User; return <TierIcon className="h-2.5 w-2.5" /> })()}
                  {tierConfig[reviewerOfMonth.badgeTier]?.label ?? 'New'}
                </Badge>
              </div>
              <div className="flex gap-3 mt-1 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-0.5"><PenSquare className="h-2.5 w-2.5" /> {reviewerOfMonth.reviewCount} reviews</span>
                <span className="flex items-center gap-0.5"><ThumbsUp className="h-2.5 w-2.5" /> {reviewerOfMonth.helpfulVotes.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Badge Tier Legend */}
      <div className="mx-4 mt-3">
        <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
          <Award className="h-3.5 w-3.5 text-primary" /> Badge Tiers
        </h3>
        <div className="flex gap-2">
          {(Object.keys(tierConfig) as BadgeTier[]).map(tier => {
            const cfg = tierConfig[tier]
            const TierIcon = cfg.icon
            return (
              <motion.div key={tier} className={`flex items-center gap-1 rounded-full px-2.5 py-1 ${cfg.bg}`} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                <TierIcon className={`h-3 w-3 ${cfg.color}`} />
                <span className={`text-[9px] font-medium ${cfg.color}`}>{cfg.label}</span>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="mx-4 mt-4">
        <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
          <Flame className="h-4 w-4 text-orange-500" /> Top Reviewers
        </h3>
        <div className="space-y-2">
          {reviewers.map((reviewer, i) => {
            const cfg = tierConfig[reviewer.badgeTier] ?? tierConfig.new
            const TierIcon = cfg.icon
            return (
              <motion.div
                key={reviewer.id}
                className={`flex items-center gap-3 rounded-xl border bg-card p-3 ${i === 0 ? 'border-amber-500/30' : 'border-border/50'}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                {/* Rank */}
                <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? 'bg-amber-500/20 text-amber-500' : i === 1 ? 'bg-gray-300/20 text-gray-400' : i === 2 ? 'bg-orange-500/20 text-orange-500' : 'bg-muted/50 text-muted-foreground'}`}>
                  {i + 1}
                </div>
                {/* Avatar */}
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {reviewer.avatarUrl ? <img src={reviewer.avatarUrl} alt={reviewer.name} className="h-full w-full rounded-full object-cover" /> : <User className="h-4 w-4 text-primary" />}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground line-clamp-1">{reviewer.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge className={`${cfg.bg} ${cfg.color} text-[8px] h-4 gap-0.5 px-1`}>
                      <TierIcon className="h-2 w-2" /> {cfg.label}
                    </Badge>
                    <span className="text-[9px] text-muted-foreground">{reviewer.reviewCount} reviews</span>
                  </div>
                </div>
                {/* Helpful votes */}
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-0.5 text-[10px] text-primary">
                    <ThumbsUp className="h-3 w-3" />
                    <span className="font-medium">{reviewer.helpfulVotes.toLocaleString()}</span>
                  </div>
                  <p className="text-[8px] text-muted-foreground">helpful</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Viral Reviews */}
      <div className="mx-4 mt-4">
        <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
          <Flame className="h-4 w-4 text-rose-500" /> Viral Reviews
        </h3>
        <div className="space-y-2">
          {viralReviews.map((review, i) => {
            const cfg = tierConfig[review.badgeTier] ?? tierConfig.new
            return (
              <motion.div key={review.id} className="rounded-xl border border-border/50 bg-card p-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-foreground">{review.authorName}</span>
                    <Badge className={`${cfg.bg} ${cfg.color} text-[8px] h-4 px-1`}>{cfg.label}</Badge>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star key={si} className={`h-2.5 w-2.5 ${si < review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-[10px] text-primary font-medium">{review.productName}</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">&quot;{review.snippet}&quot;</p>
                <div className="flex items-center gap-1 mt-1.5 text-[9px] text-muted-foreground">
                  <ThumbsUp className="h-2.5 w-2.5" /> {review.helpfulCount} found helpful
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

