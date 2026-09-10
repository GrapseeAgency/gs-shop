'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Users, Clock, TrendingDown, ChevronRight,
  Zap, CheckCircle2, AlertCircle, Share2, Gift,
  Timer, UserPlus, Package,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import { toast } from 'sonner'

interface GroupBuyDeal {
  id: string
  productId: string
  productName: string
  productImage: string | null
  category: string
  originalPrice: number
  groupPrice: number
  savingsPercent: number
  minBuyers: number
  currentBuyers: number
  expiresAt: string
  status: 'active' | 'completed'
  participants: { id: string; name: string; avatar: string | null; joinedAt: string }[]
}

function calcTimeLeft(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 }
  return {
    hours: Math.floor(diff / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(expiresAt))

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calcTimeLeft(expiresAt)), 1000)
    return () => clearInterval(timer)
  }, [expiresAt])

  const pad = (n: number) => n.toString().padStart(2, '0')

  return (
    <div className="flex items-center gap-1">
      {[
        { val: pad(timeLeft.hours), label: 'HRS' },
        { val: pad(timeLeft.minutes), label: 'MIN' },
        { val: pad(timeLeft.seconds), label: 'SEC' },
      ].map((unit, i) => (
        <div key={i} className="flex items-center gap-1">
          <div className="flex flex-col items-center rounded-lg bg-black/50 px-2 py-1">
            <span className="text-sm font-bold text-white font-mono">{unit.val}</span>
            <span className="text-[7px] text-white/60">{unit.label}</span>
          </div>
          {i < 2 && <span className="text-white/60 text-xs font-bold">:</span>}
        </div>
      ))}
    </div>
  )
}

function GroupBuyCard({ deal, index, onJoin }: { deal: GroupBuyDeal; index: number; onJoin: (id: string) => void }) {
  const { goProduct } = useShopRouter()
  const isExpired = deal.status === 'completed'
  const progress = Math.min((deal.currentBuyers / deal.minBuyers) * 100, 100)
  const isFull = deal.currentBuyers >= deal.minBuyers

  return (
    <motion.div
      className={`overflow-hidden rounded-2xl border bg-card ${isExpired ? 'opacity-60 border-border/30' : 'border-border/50'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
    >
      {/* Header */}
      <div className="relative bg-gradient-to-r from-orange-500/10 via-red-500/5 to-transparent p-4">
        <div className="absolute right-3 top-3">
          <Badge className={`${isExpired ? 'bg-muted text-muted-foreground' : 'bg-orange-500/90 text-white'} text-[10px] shadow-sm`}>
            {isExpired ? 'Expired' : isFull ? 'Deal On!' : `${deal.minBuyers - deal.currentBuyers} more needed`}
          </Badge>
        </div>

        {deal.savingsPercent > 0 && !isExpired && (
          <Badge className="bg-emerald-500/90 text-white shadow-sm mb-2 text-[10px]">
            <TrendingDown className="mr-0.5 h-3 w-3" />Save {deal.savingsPercent}%
          </Badge>
        )}

        <h3 className="text-base font-bold text-foreground pr-24">{deal.productName}</h3>
        <p className="text-[11px] text-muted-foreground">{deal.category}</p>

        {/* Price comparison */}
        <div className="flex items-center gap-3 mt-2">
          <span className="text-sm text-muted-foreground line-through">{formatPrice(deal.originalPrice)}</span>
          <span className="text-xl font-bold text-orange-500">{formatPrice(deal.groupPrice)}</span>
        </div>
      </div>

      {/* Countdown */}
      {!isExpired && (
        <div className="mx-4 mt-3 flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 p-3">
          <Timer className="h-4 w-4 text-orange-500 flex-shrink-0" />
          <span className="text-[10px] text-orange-500 font-medium whitespace-nowrap">Ends in</span>
          <CountdownTimer expiresAt={deal.expiresAt} />
        </div>
      )}

      {/* Progress */}
      <div className="px-4 mt-3">
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="text-muted-foreground flex items-center gap-1">
            <Users className="h-3 w-3" />{deal.currentBuyers} joined
          </span>
          <span className="text-muted-foreground">{deal.minBuyers} needed</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${isFull ? 'bg-emerald-500' : 'bg-orange-500'}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: index * 0.1 }}
          />
        </div>
      </div>

      {/* Participant Avatars */}
      <div className="px-4 mt-3 flex items-center gap-1">
        {deal.participants.slice(0, 5).map((p, i) => (
          <div key={p.id} className="h-7 w-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 border-2 border-card flex items-center justify-center" style={{ marginLeft: i > 0 ? -6 : 0, zIndex: 5 - i }}>
            <span className="text-[9px] font-bold text-primary">{p.name.charAt(0)}</span>
          </div>
        ))}
        {deal.currentBuyers > 5 && (
          <span className="text-[10px] text-muted-foreground ml-1">+{deal.currentBuyers - 5} more</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-4 py-3">
        {!isExpired ? (
          <>
            <Button
              className="flex-1 gap-2 bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => onJoin(deal.id)}
              disabled={isFull}
            >
              {isFull ? (
                <><CheckCircle2 className="h-4 w-4" />Deal Active</>
              ) : (
                <><UserPlus className="h-4 w-4" />Join Group</>
              )}
            </Button>
            <Button variant="outline" size="icon" className="border-orange-500/20" onClick={() => {
              navigator.share?.({ title: deal.productName, text: `Join the group buy for ${deal.productName} and save ${deal.savingsPercent}%!`, url: window.location.href }).catch(() => {
                toast.success('Link copied to clipboard!')
              })
            }}>
              <Share2 className="h-4 w-4 text-orange-500" />
            </Button>
          </>
        ) : (
          <Button variant="outline" className="flex-1 gap-2 text-muted-foreground" disabled>
            <AlertCircle className="h-4 w-4" />Deal Expired
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={() => goProduct(deal.productId)}>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </motion.div>
  )
}

export function GroupBuyPage() {
  const { goBack } = useShopRouter()
  const [deals, setDeals] = useState<GroupBuyDeal[]>([])
  const [loading, setLoading] = useState(true)
  const [showHowItWorks, setShowHowItWorks] = useState(false)

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/group-buy')
        if (res.ok) {
          const data = await res.json()
          setDeals(Array.isArray(data.data) ? data.data : [])
        }
      } catch {
        // silent
      }
      setLoading(false)
    }
    fetchDeals()
  }, [])

  const handleJoin = async (dealId: string) => {
    try {
      const res = await fetch('/api/group-buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupBuyId: dealId }),
      })
      if (res.ok) {
        toast.success('Joined group buy!', { description: 'You\'ll be notified when the deal goes live' })
        setDeals(prev => prev.map(d => d.id === dealId ? { ...d, currentBuyers: d.currentBuyers + 1 } : d))
      }
    } catch {
      toast.error('Failed to join group buy')
    }
  }

  const activeDeals = deals.filter(d => d.status === 'active')
  const expiredDeals = deals.filter(d => d.status === 'completed')

  const howItWorksSteps = [
    { step: 1, icon: UserPlus, title: 'Join a Group', desc: 'Find a deal and join the group buy' },
    { step: 2, icon: Users, title: 'Wait for Quorum', desc: `When enough people join, the deal activates` },
    { step: 3, icon: Gift, title: 'Save Big!', desc: 'Everyone gets the group price automatically' },
  ]

  return (
    <motion.div className="min-h-screen bg-background pb-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack} className="flex-shrink-0 text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-500" /> Group Buy
            </h1>
          </div>
          <Badge variant="outline" className="text-[10px] border-orange-500/30 text-orange-500">{activeDeals.length} active</Badge>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="mx-4 mt-3 overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500/15 via-red-500/10 to-rose-500/5 border border-orange-500/20 p-4">
        <div className="flex items-center gap-3">
          <motion.div
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Zap className="h-6 w-6 text-orange-500" />
          </motion.div>
          <div>
            <p className="text-base font-bold text-foreground">Save up to 35% together!</p>
            <p className="text-xs text-muted-foreground">Join forces with other shoppers for bulk discounts</p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="px-4 mt-4">
        <button
          onClick={() => setShowHowItWorks(!showHowItWorks)}
          className="flex items-center gap-2 text-sm font-medium text-orange-500"
        >
          <Zap className="h-4 w-4" />
          How Group Buy Works
          <ChevronRight className={`h-4 w-4 transition-transform ${showHowItWorks ? 'rotate-90' : ''}`} />
        </button>
        <AnimatePresence>
          {showHowItWorks && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 grid grid-cols-3 gap-2">
                {howItWorksSteps.map((s, i) => (
                  <motion.div
                    key={i}
                    className="flex flex-col items-center rounded-xl border border-orange-500/10 bg-orange-500/5 p-3 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/20 mb-1.5">
                      <s.icon className="h-4 w-4 text-orange-500" />
                    </div>
                    <span className="text-[10px] font-bold text-foreground">{s.title}</span>
                    <span className="text-[9px] text-muted-foreground mt-0.5">{s.desc}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Active Deals */}
      <div className="px-4 mt-4">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5 mb-3">
          <Zap className="h-4 w-4 text-orange-500" /> Active Deals
        </h2>
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card">
                <div className="h-24 animate-pulse bg-muted" />
                <div className="flex flex-col gap-2 p-4">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-2 w-full animate-pulse rounded bg-muted" />
                  <div className="h-8 w-full animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))
          ) : activeDeals.length === 0 ? (
            <motion.div className="flex flex-col items-center justify-center py-12 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10">
                <Package className="h-8 w-8 text-orange-500/50" />
              </div>
              <p className="text-sm font-medium text-foreground">No active group buys</p>
              <p className="mt-1 text-xs text-muted-foreground">Check back later for new deals</p>
            </motion.div>
          ) : (
            activeDeals.map((deal, index) => (
              <GroupBuyCard key={deal.id} deal={deal} index={index} onJoin={handleJoin} />
            ))
          )}
        </div>
      </div>

      {/* Expired Deals */}
      {expiredDeals.length > 0 && (
        <div className="px-4 mt-6">
          <h2 className="text-sm font-bold text-muted-foreground flex items-center gap-1.5 mb-3">
            <Clock className="h-4 w-4" /> Expired Deals
          </h2>
          <div className="space-y-3">
            {expiredDeals.map((deal, index) => (
              <GroupBuyCard key={deal.id} deal={deal} index={index} onJoin={() => {}} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
