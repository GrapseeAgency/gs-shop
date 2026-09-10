'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Calendar, ArrowRight, RefreshCw, ThumbsUp, ChevronLeft,
  ChevronRight, Clock, Star, Award, Heart, ShoppingBag, Zap
} from 'lucide-react'
import { User, DollarSign, Flame } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useShopStore, type Product } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import { toast } from 'sonner'

interface DailyPicksProps {
  // No props needed - strictly uses API data
}

type PickReason = 'staff_pick' | 'top_rated' | 'best_value' | 'new_arrival' | 'trending'

const pickReasonConfig: Record<PickReason, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  staff_pick: { label: 'Staff Pick', icon: User, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  top_rated: { label: 'Top Rated', icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  best_value: { label: 'Best Value', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  new_arrival: { label: 'New Arrival', icon: Sparkles, color: 'text-sky-500', bg: 'bg-sky-500/10' },
  trending: { label: 'Trending', icon: Flame, color: 'text-rose-500', bg: 'bg-rose-500/10' },
}

const pickReasons: PickReason[] = ['staff_pick', 'top_rated', 'best_value', 'new_arrival', 'trending']

function getPickReason(index: number, dayIndex: number): PickReason {
  return pickReasons[(index + dayIndex) % pickReasons.length]
}

export function DailyPicks() {
  const { addToCart } = useShopStore()
  const { goProduct } = useShopRouter()
  const [picks, setPicks] = useState<Product[]>([])
  const [yesterdayPicks, setYesterdayPicks] = useState<Product[]>([])
  const [votes, setVotes] = useState<Record<string, number>>({})
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | null>>({})
  const [flipped, setFlipped] = useState<Record<string, boolean>>({})
  const [timeUntilNext, setTimeUntilNext] = useState('')
  const [showPrevious, setShowPrevious] = useState(false)
  const [loading, setLoading] = useState(true)

  const today = new Date()
  const dayIndex = today.getDate() + today.getMonth() * 31

  // Fetch real daily picks from API
  useEffect(() => {
    const fetchDailyPicks = async () => {
      try {
        const res = await fetch('/api/todays-pick')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        
        if (data.success && data.picks && data.picks.length > 0) {
          setPicks(data.picks.slice(0, 2)) // API already returns 2
        }
        // NO FALLBACK - strictly hide if no API data
      } catch (error) {
        // Silent fail - no fallback, component stays hidden
      } finally {
        setLoading(false)
      }
    }
    
    fetchDailyPicks()
  }, [])

  // Yesterday's picks - only show if we have today's picks from API
  // This section is hidden if no API data

  // Initialize votes
  useEffect(() => {
    const initialVotes: Record<string, number> = {}
    picks.forEach((p, i) => {
      initialVotes[p.id] = Math.floor(Math.random() * 50) + 10 + (3 - i) * 5
    })
    setVotes(initialVotes)
  }, [picks])

  // Silent - don't show if no picks
  if (!loading && picks.length === 0) return null

  // Countdown timer until next day's picks
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      const diff = tomorrow.getTime() - now.getTime()

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setTimeUntilNext(`${hours}h ${minutes}m ${seconds}s`)
    }
    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [])

  if (picks.length === 0) return null

  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' })
  const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const handleVote = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation()
    if (userVotes[productId]) {
      // Remove vote
      setUserVotes(prev => ({ ...prev, [productId]: null }))
      setVotes(prev => ({ ...prev, [productId]: Math.max(0, (prev[productId] || 0) - 1) }))
    } else {
      setUserVotes(prev => ({ ...prev, [productId]: 'up' }))
      setVotes(prev => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }))
      toast.success('Vote recorded! ')
    }
  }

  const handleFlip = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation()
    setFlipped(prev => ({ ...prev, [productId]: !prev[productId] }))
  }

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation()
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
    })
    toast.success(`${product.name} added to cart!`)
  }

  return (
    <section className="py-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/20">
            <Calendar className="h-4 w-4 text-rose-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-bold text-foreground">Today&apos;s Picks</h2>
              <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[9px] px-1.5 py-0">
                <Sparkles className="mr-0.5 h-2.5 w-2.5" />
                NEW
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Curated for {dayName}  {dateStr}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPrevious(!showPrevious)}
            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPrevious ? "Today's" : "Yesterday's"}
          </button>
          <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20">
            <Sparkles className="mr-1 h-3 w-3" />
            {picks.length} picks
          </Badge>
        </div>
      </div>

      {/* Refresh Timer */}
      <div className="mx-4 mb-3 flex items-center justify-between rounded-xl bg-muted/30 px-3 py-1.5">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Next picks in</span>
          <span className="font-mono font-semibold text-foreground">{timeUntilNext}</span>
        </div>
        <RefreshCw className="h-3 w-3 text-muted-foreground animate-spin" style={{ animationDuration: '3s' }} />
      </div>

      {/* 2x2 Grid */}
      <AnimatePresence mode="wait">
        {!showPrevious ? (
          <motion.div
            key="today"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 gap-2.5 px-4"
          >
            {picks.map((product, index) => {
              const discount = product.comparePrice
                ? Math.round((1 - product.price / product.comparePrice) * 100)
                : 0
              const reason = getPickReason(index, dayIndex)
              const reasonCfg = pickReasonConfig[reason]
              const voteCount = votes[product.id] || 0
              const hasVoted = !!userVotes[product.id]
              const isFlipped = flipped[product.id]

              return (
                <motion.div
                  key={product.id}
                  className="group relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                >
                  {/* Card with flip effect */}
                  <div
                    className="relative"
                    style={{ perspective: '600px' }}
                  >
                    <motion.div
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {/* Front */}
                      <div
                        className="relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card transition-all hover:border-rose-500/30 hover:shadow-lg"
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        <button onClick={() => goProduct(product.id)} className="text-left w-full">
                          {/* Pick Number & Reason Badge */}
                          <div className="absolute left-2 top-2 z-10 flex items-center gap-1">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/90 text-[10px] font-bold text-white shadow-sm">
                              {index + 1}
                            </div>
                            <span className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[8px] font-bold ${reasonCfg.color} ${reasonCfg.bg}`}>
                              {(() => { const Icon = reasonCfg.icon; return <Icon className="h-3 w-3" />; })()}
                              {reasonCfg.label}
                            </span>
                          </div>

                          {/* Vote Button */}
                          <button
                            onClick={(e) => handleVote(e, product.id)}
                            className="absolute right-2 top-2 z-10 flex items-center gap-0.5 rounded-full bg-background/80 px-1.5 py-0.5 text-[9px] font-medium backdrop-blur-sm transition-colors hover:bg-background"
                          >
                            <ThumbsUp className={`h-2.5 w-2.5 ${hasVoted ? 'text-rose-500 fill-rose-500' : 'text-muted-foreground'}`} />
                            <span className={hasVoted ? 'text-rose-500' : 'text-muted-foreground'}>{voteCount}</span>
                          </button>

                          {/* Image */}
                          <div className="flex h-28 items-center justify-center bg-gradient-to-br from-rose-500/10 to-pink-500/5">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                            ) : (
                              <span className="text-3xl opacity-30"></span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="p-2.5">
                            <h3 className="mb-0.5 text-xs font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                              {product.name}
                            </h3>
                            <div className="flex items-baseline gap-1">
                              <span className="text-sm font-bold text-primary">
                                {formatPrice(product.price)}
                              </span>
                              {discount > 0 && (
                                <span className="text-[9px] text-muted-foreground line-through">
                                  {formatPrice(product.comparePrice!)}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>

                        {/* Action Row */}
                        <div className="flex border-t border-border/30">
                          <button
                            onClick={(e) => handleFlip(e, product.id)}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[9px] text-muted-foreground hover:text-foreground transition-colors border-r border-border/30"
                          >
                            <Star className="h-2.5 w-2.5" />
                            Details
                          </button>
                          <button
                            onClick={(e) => handleQuickAdd(e, product)}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[9px] text-primary hover:bg-primary/5 transition-colors"
                          >
                            <ShoppingBag className="h-2.5 w-2.5" />
                            Add
                          </button>
                        </div>
                      </div>

                      {/* Back */}
                      <div
                        className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-rose-500/30 bg-card p-3"
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className={`flex items-center gap-0.5 text-[10px] font-bold ${reasonCfg.color}`}>
                            {(() => { const ReasonIcon = reasonCfg.icon; return <ReasonIcon className="h-3 w-3" />; })()}
                            {reasonCfg.label}
                          </span>
                          <button
                            onClick={(e) => handleFlip(e, product.id)}
                            className="text-[9px] text-muted-foreground hover:text-foreground"
                          >
                             Back
                          </button>
                        </div>
                        <h3 className="mb-1 text-xs font-bold text-foreground line-clamp-2">{product.name}</h3>
                        <p className="flex-1 text-[10px] text-muted-foreground line-clamp-4 leading-relaxed">
                          {product.description}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm font-bold text-primary">{formatPrice(product.price)}</span>
                          <Button size="sm" className="h-6 gap-1 text-[9px] px-2" onClick={() => goProduct(product.id)}>
                            View <ArrowRight className="h-2.5 w-2.5" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        ) : (
          /* Previous Day's Picks */
          <motion.div
            key="yesterday"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-4"
          >
            <div className="mb-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              Yesterday&apos;s top picks
            </div>
            <div className="space-y-2">
              {yesterdayPicks.map((product, index) => (
                <button
                  key={product.id}
                  onClick={() => goProduct(product.id)}
                  className="flex w-full gap-3 rounded-xl border border-border/50 bg-card p-2.5 text-left transition-colors hover:bg-accent"
                >
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-muted to-muted/50">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="h-full w-full rounded-lg object-cover" />
                    ) : (
                      <span className="text-lg opacity-30"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold text-foreground line-clamp-1">{product.name}</h3>
                    <span className="text-[10px] text-primary font-bold">{formatPrice(product.price)}</span>
                    <div className="mt-0.5 flex items-center gap-1 text-[9px] text-muted-foreground">
                      <Award className="h-2.5 w-2.5" />
                      {pickReasonConfig[getPickReason(index, dayIndex - 1)].label}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Total Votes Summary */}
      <div className="mx-4 mt-2 flex items-center justify-center gap-1 text-[9px] text-muted-foreground">
        <ThumbsUp className="h-2.5 w-2.5" />
        <span>{Object.values(votes).reduce((a, b) => a + b, 0)} total votes today</span>
      </div>
    </section>
  )
}
