'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Gavel, Clock, Users, TrendingUp, Trophy,
  X, Minus, Plus, AlertCircle, Zap, Crown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { toast } from 'sonner'

interface Auction {
  id: string
  title: string
  description: string
  imageUrl: string | null
  currentBid: number
  startingBid: number
  minBidIncrement: number
  bidCount: number
  status: 'live' | 'upcoming' | 'ended'
  startTime: string
  endTime: string
  winner: string | null
  category: string
}

function normalizeAuction(a: Record<string, unknown>): Auction {
  const product = (a.product || {}) as Record<string, unknown>
  return {
    id: String(a.id || ''),
    title: String(a.title || product.name || 'Auction'),
    description: String(a.description || product.name || ''),
    imageUrl: (a.imageUrl as string | null) || (product.imageUrl as string | null) || null,
    currentBid: Number(a.currentBid || a.startPrice || 0),
    startingBid: Number(a.startPrice || a.startingBid || a.currentBid || 0),
    minBidIncrement: Number(a.minBidIncrement || 100),
    bidCount: Number((a._count as Record<string, unknown>)?.bids ?? a.bidCount ?? 0),
    status: (a.status as 'live' | 'upcoming' | 'ended') || 'upcoming',
    startTime: String(a.startTime || new Date().toISOString()),
    endTime: String(a.endTime || new Date().toISOString()),
    winner: (a.winnerName as string | null) || (a.winner as string | null) || null,
    category: String((product as Record<string, unknown>).category || a.category || 'General'),
  }
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
}

function CountdownTimer({ endTime }: { endTime: string }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const update = () => {
      const diff = new Date(endTime).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft('Ended'); return }
      const hrs = Math.floor(diff / 3600000)
      const mins = Math.floor((diff % 3600000) / 60000)
      const secs = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${hrs}h ${mins}m ${secs}s`)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [endTime])

  return (
    <span className="text-xs font-mono font-bold text-orange-400">{timeLeft}</span>
  )
}

export default function AuctionsPage() {
  const { goBack } = useShopRouter()
  const { addRewardsPoints } = useShopStore()
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'ended'>('live')
  const [bidModal, setBidModal] = useState<Auction | null>(null)
  const [bidAmount, setBidAmount] = useState(0)
  const [bidderName, setBidderName] = useState('')
  const [bidderEmail, setBidderEmail] = useState('')
  const [bidding, setBidding] = useState(false)

  const fetchAuctions = useCallback(async () => {
    try {
      const res = await fetch('/api/auctions')
      if (res.ok) {
        const data = await res.json()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setAuctions((data.data || []).map((a: any) => normalizeAuction(a)))
      }
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAuctions() }, [fetchAuctions])

  const filtered = auctions.filter((a) => a.status === activeTab)

  const openBidModal = (auction: Auction) => {
    setBidAmount(auction.currentBid + auction.minBidIncrement)
    setBidModal(auction)
  }

  const handlePlaceBid = async () => {
    if (!bidModal) return
    if (bidAmount <= bidModal.currentBid) {
      toast.error('Bid must be higher than current bid')
      return
    }
    if (!bidderName.trim() || !bidderEmail.trim()) {
      toast.error('Please enter your name and email to bid')
      return
    }
    setBidding(true)
    try {
      const res = await fetch(`/api/auctions/${bidModal.id}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: bidAmount, bidderName: bidderName.trim(), bidderEmail: bidderEmail.trim() }),
      })
      if (res.ok) {
        toast.success('Bid placed successfully!', { description: `${formatPrice(bidAmount)} on ${bidModal.title}` })
        addRewardsPoints(25)
        setAuctions((prev) =>
          prev.map((a) =>
            a.id === bidModal.id
              ? { ...a, currentBid: bidAmount, bidCount: a.bidCount + 1 }
              : a
          )
        )
        setBidModal(null)
      } else {
        toast.error('Failed to place bid')
      }
    } catch {
      toast.error('Failed to place bid')
    } finally {
      setBidding(false)
    }
  }

  const tabs = [
    { key: 'live' as const, label: 'Live', icon: Zap, color: 'text-orange-400' },
    { key: 'upcoming' as const, label: 'Upcoming', icon: Clock, color: 'text-sky-400' },
    { key: 'ended' as const, label: 'Ended', icon: Trophy, color: 'text-muted-foreground' },
  ]

  const liveCount = auctions.filter((a) => a.status === 'live').length

  return (
    <motion.div
      className="pb-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack} className="flex-shrink-0 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Gavel className="h-5 w-5 text-orange-400" />
              Live Auctions
            </h1>
            <p className="text-[11px] text-muted-foreground">Bid & win premium services</p>
          </div>
          {liveCount > 0 && (
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 animate-pulse">
              <Zap className="mr-1 h-3 w-3" />
              {liveCount} Live
            </Badge>
          )}
        </div>
      </div>

      {/* Hero Banner */}
      <div className="mx-4 mt-3 overflow-hidden rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/15 via-orange-500/5 to-transparent p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/20 border border-orange-500/30">
            <Gavel className="h-6 w-6 text-orange-400" />
          </div>
          <div>
            <p className="text-base font-bold text-foreground">Auction House</p>
            <p className="text-xs text-muted-foreground">Premium services at your price</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: TrendingUp, label: 'Best Deals', sub: 'Up to 60% off' },
            { icon: Crown, label: 'VIP Access', sub: 'Exclusive items' },
            { icon: Users, label: 'Community', sub: `${auctions.reduce((s, a) => s + a.bidCount, 0)}+ bids` },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="rounded-xl bg-background/50 p-2 text-center border border-orange-500/10">
                <Icon className="mx-auto h-4 w-4 text-orange-400 mb-1" />
                <p className="text-[10px] font-medium text-foreground">{item.label}</p>
                <p className="text-[8px] text-muted-foreground">{item.sub}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tab Filter */}
      <div className="mx-4 mt-3 flex gap-1 rounded-xl bg-muted/50 p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              <Icon className={`h-3.5 w-3.5 ${activeTab === tab.key ? tab.color : ''}`} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Auction Cards */}
      <div className="px-4 mt-3 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-muted" />
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10">
              <Gavel className="h-8 w-8 text-orange-400" />
            </div>
            <p className="text-sm font-medium text-foreground">No {activeTab} auctions</p>
            <p className="mt-1 text-xs text-muted-foreground">Check back soon for new auctions</p>
          </div>
        ) : (
          filtered.map((auction, index) => (
            <motion.div
              key={auction.id}
              className="relative overflow-hidden rounded-2xl border border-border/50 bg-card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              {/* Status stripe */}
              {auction.status === 'live' && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500" />
              )}
              {auction.status === 'ended' && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-muted" />
              )}

              <div className="p-4">
                {/* Top row */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/10">
                    {auction.imageUrl ? (
                      <img src={auction.imageUrl} alt={auction.title} className="h-full w-full object-cover rounded-xl" />
                    ) : (
                      <Gavel className="h-7 w-7 text-orange-400/60" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge className={`text-[9px] px-1.5 py-0 ${
                        auction.status === 'live' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                        auction.status === 'upcoming' ? 'bg-sky-500/20 text-sky-400 border-sky-500/30' :
                        'bg-muted text-muted-foreground border-border'
                      }`}>
                        {auction.status === 'live' && <Zap className="mr-0.5 h-2.5 w-2.5" />}
                        {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
                      </Badge>
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                        {auction.category}
                      </Badge>
                    </div>
                    <h3 className="text-sm font-bold text-foreground line-clamp-1">{auction.title}</h3>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{auction.description}</p>
                  </div>
                </div>

                {/* Bid info row */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground">
                      {auction.status === 'ended' ? 'Final Price' : 'Current Bid'}
                    </p>
                    <p className="text-lg font-bold text-primary">{formatPrice(auction.currentBid)}</p>
                    <p className="text-[9px] text-muted-foreground">Starting: {formatPrice(auction.startingBid)}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
                      <Users className="h-3 w-3" />
                      {auction.bidCount} bids
                    </div>
                    {auction.status === 'live' && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-orange-400" />
                        <CountdownTimer endTime={auction.endTime} />
                      </div>
                    )}
                    {auction.status === 'upcoming' && (
                      <span className="text-[10px] text-sky-400">
                        Starts {new Date(auction.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' })}
                      </span>
                    )}
                    {auction.status === 'ended' && auction.winner && (
                      <div className="flex items-center gap-1">
                        <Trophy className="h-3 w-3 text-amber-400" />
                        <span className="text-[10px] font-medium text-amber-400">{auction.winner}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action button */}
                {auction.status === 'live' && (
                  <Button
                    className="w-full gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90"
                    onClick={() => openBidModal(auction)}
                  >
                    <Gavel className="h-4 w-4" />
                    Place Bid
                  </Button>
                )}
                {auction.status === 'upcoming' && (
                  <Button variant="outline" className="w-full gap-2" disabled>
                    <Clock className="h-4 w-4" />
                    Coming Soon
                  </Button>
                )}
                {auction.status === 'ended' && (
                  <Button variant="ghost" className="w-full gap-2 text-muted-foreground" disabled>
                    <Trophy className="h-4 w-4" />
                    Auction Ended
                  </Button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Bid Modal */}
      <AnimatePresence>
        {bidModal && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBidModal(null)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl border-t border-border bg-background p-5 pb-8"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-foreground">Place Your Bid</h3>
                <Button variant="ghost" size="icon" onClick={() => setBidModal(null)} className="text-muted-foreground">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="mb-4 rounded-xl border border-border/50 bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Item</p>
                <p className="text-sm font-bold text-foreground">{bidModal.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground">Current Bid:</span>
                  <span className="text-sm font-bold text-primary">{formatPrice(bidModal.currentBid)}</span>
                  <span className="text-[10px] text-muted-foreground">({bidModal.bidCount} bids)</span>
                </div>
              </div>

              <div className="mb-3 grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Your Name</label>
                  <Input placeholder="e.g. Alex" value={bidderName} onChange={(e) => setBidderName(e.target.value)} className="h-9 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground mb-1.5 block">Email</label>
                  <Input type="email" placeholder="you@email.com" value={bidderEmail} onChange={(e) => setBidderEmail(e.target.value)} className="h-9 text-sm" />
                </div>
              </div>

              <div className="mb-4">
                <label className="text-xs font-medium text-foreground mb-2 block">Your Bid Amount</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setBidAmount(Math.max(bidModal.currentBid + bidModal.minBidIncrement, bidAmount - bidModal.minBidIncrement))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(Number(e.target.value))}
                      className="pl-7 text-center text-lg font-bold"
                      min={bidModal.currentBid + bidModal.minBidIncrement}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => setBidAmount(bidAmount + bidModal.minBidIncrement)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2 flex gap-2">
                  {[1, 2, 5].map((mult) => (
                    <button
                      key={mult}
                      className="flex-1 rounded-lg bg-primary/10 py-1.5 text-[10px] font-medium text-primary hover:bg-primary/20 transition-colors"
                      onClick={() => setBidAmount(bidModal.currentBid + bidModal.minBidIncrement * mult)}
                    >
                      +{formatPrice(bidModal.minBidIncrement * mult)}
                    </button>
                  ))}
                </div>
              </div>

              {(bidAmount <= bidModal.currentBid || !bidderName.trim() || !bidderEmail.trim()) && bidAmount <= bidModal.currentBid && (
                <div className="mb-3 flex items-center gap-2 rounded-lg bg-destructive/10 p-2.5">
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                  <p className="text-[10px] text-destructive">Your bid must be higher than the current bid of {formatPrice(bidModal.currentBid)}</p>
                </div>
              )}

              <Button
                className="w-full gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90"
                disabled={bidAmount <= bidModal.currentBid || bidding}
                onClick={handlePlaceBid}
              >
                {bidding ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Gavel className="h-4 w-4" />
                )}
                {bidding ? 'Placing Bid...' : `Bid ${formatPrice(bidAmount)}`}
              </Button>
              <p className="mt-2 text-center text-[9px] text-muted-foreground">
                By placing a bid, you agree to our auction terms & conditions
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
