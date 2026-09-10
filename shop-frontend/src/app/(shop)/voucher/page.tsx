'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Tag, Copy, CheckCheck, Clock, ShoppingBag, Truck,
  Percent, Gift, Sparkles, ChevronRight, Ticket, Star, Zap,
  CheckCircle2, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useShopRouter } from '@/hooks/use-shop-router'
import { useShopStore } from '@/lib/store'
import { toast } from 'sonner'

interface Coupon {
  id: string
  code: string
  discount: number
  type: string
  minOrder: number | null
  maxUses: number | null
  usedCount: number
  isActive: boolean
  expiresAt: string | null
  createdAt: string
}

type FilterType = 'all' | 'percentage' | 'fixed' | 'free_shipping'

function getCountdown(expiresAt: string | null): string {
  if (!expiresAt) return 'No expiry'
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return 'Expired'
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  if (days > 0) return `${days}d ${hours}h left`
  const mins = Math.floor((diff % 3600000) / 60000)
  return `${hours}h ${mins}m left`
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt).getTime() < Date.now()
}

export default function VoucherPage() {
  const { goBack, goCart } = useShopRouter()
  const [activeTab, setActiveTab] = useState<'available' | 'my'>('available')
  const [filter, setFilter] = useState<FilterType>('all')
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [dailyCheckedIn, setDailyCheckedIn] = useState(false)
  const [checkInClaiming, setCheckInClaiming] = useState(false)
  const [confettiActive, setConfettiActive] = useState(true)
  const { addRewardsPoints } = useShopStore()

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await fetch('/api/coupons')
      if (res.ok) {
        const data = await res.json()
        setCoupons(data)
      }
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCoupons()
  }, [fetchCoupons])

  useEffect(() => {
    const lastCheck = sessionStorage.getItem('grapsee-voucher-checkin')
    if (lastCheck && new Date(lastCheck).toDateString() === new Date().toDateString()) {
      setDailyCheckedIn(true)
    }
    const timer = setTimeout(() => setConfettiActive(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      toast.success('Coupon code copied!', { description: 'Apply at checkout' })
      setTimeout(() => setCopiedCode(null), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const handleApply = (code: string) => {
    handleCopyCode(code)
    goCart()
  }

  const handleDailyCheckIn = async () => {
    setCheckInClaiming(true)
    try {
      addRewardsPoints(10)
      setDailyCheckedIn(true)
      sessionStorage.setItem('grapsee-voucher-checkin', new Date().toISOString())
      toast.success('Daily check-in reward!', { description: '+10 points added to your account' })
    } finally {
      setCheckInClaiming(false)
    }
  }

  const filteredCoupons = coupons.filter(c => {
    if (isExpired(c.expiresAt)) return false
    if (filter === 'percentage') return c.type === 'percentage'
    if (filter === 'fixed') return c.type === 'fixed'
    if (filter === 'free_shipping') return c.code.includes('SHIP') || c.code.includes('FREE')
    return true
  })

  const featuredCoupons = filteredCoupons.filter(c => c.discount >= 20 || c.type === 'percentage').slice(0, 3)
  const myCoupons = filteredCoupons.slice(0, 4)
  const displayCoupons = activeTab === 'available' ? filteredCoupons : myCoupons

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
               Voucher Center
            </h1>
            <p className="text-[11px] text-muted-foreground">Save more with exclusive coupons</p>
          </div>
          <Ticket className="h-5 w-5 text-primary" />
        </div>
      </div>

      {/* Hero with Confetti */}
      <div className="mx-4 mt-4 relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-rose-500/10 to-amber-500/10 border border-primary/20 p-5">
        {confettiActive && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-sm"
                initial={{ y: -20, x: Math.random() * 300, opacity: 1, rotate: 0 }}
                animate={{ y: 200, opacity: 0, rotate: 360 }}
                transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 2, repeat: Infinity }}
              >
                {['', '', '', '', ''][i % 5]}
              </motion.div>
            ))}
          </div>
        )}
        <div className="relative z-10">
          <motion.h2
            className="text-xl font-bold text-foreground mb-1"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
          >
            Save Big Today! 
          </motion.h2>
          <p className="text-xs text-muted-foreground mb-3">
            {filteredCoupons.length} coupons available  Up to {filteredCoupons.length > 0 ? Math.max(...filteredCoupons.map(c => c.discount)) : 0}% off
          </p>
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] font-medium text-primary">New deals daily</span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Check-in */}
      <div className="mx-4 mt-3 rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-amber-500/5 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
              <Zap className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Daily Check-in</p>
              <p className="text-[10px] text-muted-foreground">Claim 10 points + a surprise coupon</p>
            </div>
          </div>
          <Button
            size="sm"
            disabled={dailyCheckedIn || checkInClaiming}
            onClick={handleDailyCheckIn}
            className="bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white text-xs h-7"
          >
            {checkInClaiming ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : dailyCheckedIn ? (
              <><CheckCircle2 className="h-3 w-3 mr-1" />Claimed</>
            ) : (
              'Claim Now'
            )}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mx-4 mt-4 flex gap-2">
        {(['available', 'my'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                : 'bg-card border border-border/50 text-muted-foreground hover:bg-muted/50'
            }`}
          >
            {tab === 'available' ? 'Available Coupons' : 'My Coupons'}
          </button>
        ))}
      </div>

      {/* Filter */}
      <div className="mx-4 mt-3 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {([
          { key: 'all', label: 'All', icon: Tag },
          { key: 'percentage', label: 'Percentage', icon: Percent },
          { key: 'fixed', label: 'Fixed', icon: ShoppingBag },
          { key: 'free_shipping', label: 'Free Ship', icon: Truck },
        ] as const).map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium whitespace-nowrap transition-all ${
              filter === f.key
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-muted/50 text-muted-foreground border border-transparent hover:bg-muted'
            }`}
          >
            <f.icon className="h-3 w-3" />
            {f.label}
          </button>
        ))}
      </div>

      {/* Featured Coupons */}
      {activeTab === 'available' && featuredCoupons.length > 0 && (
        <div className="mx-4 mt-4">
          <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-400" />
            Recommended For You
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {featuredCoupons.map((coupon, i) => (
              <motion.div
                key={coupon.id}
                className="flex-shrink-0 w-56 rounded-xl bg-gradient-to-br from-primary/15 via-rose-500/5 to-amber-500/10 border border-primary/20 p-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px]">
                    {coupon.type === 'percentage' ? `${coupon.discount}% OFF` : `$${coupon.discount} OFF`}
                  </Badge>
                  <span className="text-[9px] text-muted-foreground">{getCountdown(coupon.expiresAt)}</span>
                </div>
                <p className="text-lg font-bold text-primary mb-1">
                  {coupon.type === 'percentage' ? `${coupon.discount}%` : `$${coupon.discount}`}
                </p>
                <p className="text-[10px] text-muted-foreground mb-2">
                  Min order: {coupon.minOrder ? `$${coupon.minOrder}` : 'None'}
                </p>
                <code className="text-[10px] font-mono text-foreground bg-background/50 px-2 py-1 rounded">
                  {coupon.code}
                </code>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <Separator className="mx-4 my-3" />

      {/* Coupon Cards */}
      <div className="mx-4 space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />
          ))
        ) : displayCoupons.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <Ticket className="h-12 w-12 text-muted-foreground/20 mb-3" />
            <p className="text-sm font-medium text-foreground">No coupons found</p>
            <p className="text-[11px] text-muted-foreground">Check back later for new deals</p>
          </div>
        ) : (
          displayCoupons.map((coupon, i) => {
            const usagePercent = coupon.maxUses ? Math.round((coupon.usedCount / coupon.maxUses) * 100) : 0
            const isMyTab = activeTab === 'my'
            return (
              <motion.div
                key={coupon.id}
                className="rounded-2xl border border-border/50 bg-card overflow-hidden"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex">
                  <div className="flex flex-col items-center justify-center w-24 flex-shrink-0 bg-gradient-to-b from-primary/10 to-primary/5 border-r border-dashed border-border/50 p-3 relative">
                    <p className="text-2xl font-black text-primary">
                      {coupon.type === 'percentage' ? `${coupon.discount}%` : `$${coupon.discount}`}
                    </p>
                    <p className="text-[9px] font-medium text-muted-foreground uppercase">OFF</p>
                    <div className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-background" />
                    <div className="absolute -bottom-2 -right-2 h-4 w-4 rounded-full bg-background" />
                  </div>
                  <div className="flex-1 p-3">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {coupon.type === 'percentage' ? `${coupon.discount}% Discount` : `$${coupon.discount} Off`}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Min order: {coupon.minOrder ? `$${coupon.minOrder}` : 'No minimum'}
                        </p>
                      </div>
                      {coupon.type === 'percentage' ? (
                        <Percent className="h-4 w-4 text-primary" />
                      ) : (
                        <ShoppingBag className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <code className="flex-1 rounded-lg bg-muted px-2.5 py-1.5 text-xs font-mono font-bold text-foreground border border-border/30">
                        {coupon.code}
                      </code>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={() => handleCopyCode(coupon.code)}
                      >
                        {copiedCode === coupon.code ? (
                          <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground/50" />
                        <span className={`text-[10px] ${isExpired(coupon.expiresAt) ? 'text-red-500' : 'text-muted-foreground'}`}>
                          {getCountdown(coupon.expiresAt)}
                        </span>
                      </div>
                      {coupon.maxUses && (
                        <span className="text-[9px] text-muted-foreground">
                          {coupon.usedCount}/{coupon.maxUses} used
                        </span>
                      )}
                    </div>
                    {coupon.maxUses && (
                      <div className="h-1 rounded-full bg-muted mt-1 overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${usagePercent > 80 ? 'bg-red-500' : 'bg-primary'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${usagePercent}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                        />
                      </div>
                    )}
                    <Button
                      size="sm"
                      className="w-full mt-2 h-7 text-xs gap-1.5"
                      onClick={() => handleApply(coupon.code)}
                    >
                      {isMyTab ? (
                        <><ShoppingBag className="h-3 w-3" />Use at Checkout</>
                      ) : (
                        <><Copy className="h-3 w-3" />Copy & Apply</>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Bottom CTA */}
      <div className="mx-4 mt-4 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Gift className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Want more coupons?</p>
          <p className="text-[11px] text-muted-foreground">Shop more to unlock exclusive deals</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </motion.div>
  )
}
