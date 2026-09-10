'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Trophy, Gift, Crown, Star, Percent, Truck, Shield,
  ShoppingBag, Users, Calendar, Zap, Copy, CheckCheck, ChevronDown,
  ChevronUp, Sparkles, ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { toast } from 'sonner'

interface Transaction {
  id: string
  type: 'purchase_earn' | 'referral_bonus' | 'redemption' | 'tier_upgrade' | 'daily_login'
  points: number
  description: string
  date: string
}

const TRANSACTION_ICONS: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  purchase_earn: { icon: ShoppingBag, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  referral_bonus: { icon: Users, color: 'text-sky-400', bg: 'bg-sky-500/10' },
  redemption: { icon: Gift, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  tier_upgrade: { icon: Crown, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  daily_login: { icon: Calendar, color: 'text-violet-400', bg: 'bg-violet-500/10' },
}

const tiers = [
  { name: 'Bronze', minPoints: 0, maxPoints: 499, icon: '', color: 'from-amber-700/15 to-amber-900/5', benefits: ['1x points multiplier', 'Basic support'] },
  { name: 'Silver', minPoints: 500, maxPoints: 999, icon: '', color: 'from-gray-400/15 to-gray-600/5', benefits: ['1.5x points multiplier', 'Priority support', 'Free delivery'] },
  { name: 'Gold', minPoints: 1000, maxPoints: 2499, icon: '', color: 'from-amber-400/15 to-amber-600/5', benefits: ['2x points multiplier', '24/7 support', 'Free delivery', 'Early access'] },
  { name: 'Platinum', minPoints: 2500, maxPoints: 4999, icon: '', color: 'from-cyan-400/15 to-blue-600/5', benefits: ['2.5x points multiplier', 'Dedicated manager', 'Free delivery', 'Early access', 'Exclusive deals'] },
  { name: 'Diamond', minPoints: 5000, maxPoints: Infinity, icon: '', color: 'from-purple-400/15 to-pink-600/5', benefits: ['3x points multiplier', 'VIP support', 'Free delivery', 'First access', 'Exclusive deals', 'Birthday rewards'] },
]

// Tier mapping from database to display
const tierNameMap: Record<string, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
  diamond: 'Diamond',
}

function getCurrentTier(points: number) {
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (points >= tiers[i].minPoints) return tiers[i]
  }
  return tiers[0]
}

function getNextTier(points: number) {
  const current = getCurrentTier(points)
  const idx = tiers.indexOf(current)
  if (idx < tiers.length - 1) return tiers[idx + 1]
  return null
}

export default function RewardsPage() {
  const { goBack, addRewardsPoints, rewardsPoints } = useShopStore()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [redeemAmount, setRedeemAmount] = useState(500)
  const [redeeming, setRedeeming] = useState(false)
  const [discountCode, setDiscountCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showAllTransactions, setShowAllTransactions] = useState(false)
  const [dailyLoginClaimed, setDailyLoginClaimed] = useState(false)
  const [claimingLogin, setClaimingLogin] = useState(false)

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch(`/api/rewards/transactions?points=${rewardsPoints}`)
      if (res.ok) {
        const data = await res.json()
        setTransactions(data.data || [])
      }
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [rewardsPoints])

  useEffect(() => {
    fetch('/api/rewards')
      .then((res) => res.json())
      .then((data) => {
        if (data.rewardsPoints !== undefined) {
          useShopStore.setState({ rewardsPoints: data.rewardsPoints })
        }
      })
      .catch(() => {})
  }, [])

  // Also fetch from daily status to get accurate points
  useEffect(() => {
    fetch('/api/rewards/daily')
      .then((res) => res.json())
      .then((data) => {
        if (data.totalPoints !== undefined) {
          useShopStore.setState({ rewardsPoints: data.totalPoints })
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  // Check if daily login already claimed today from database
  useEffect(() => {
    const checkDailyStatus = async () => {
      try {
        const res = await fetch('/api/rewards/daily')
        if (res.ok) {
          const data = await res.json()
          setDailyLoginClaimed(data.alreadyClaimed)
        }
      } catch {
        // Fallback: check sessionStorage
        const lastClaim = sessionStorage.getItem('grapsee-daily-login')
        if (lastClaim) {
          const lastDate = new Date(lastClaim).toDateString()
          const today = new Date().toDateString()
          if (lastDate === today) setDailyLoginClaimed(true)
        }
      }
    }
    checkDailyStatus()
  }, [])

  const handleDailyLogin = async () => {
    setClaimingLogin(true)
    try {
      const res = await fetch('/api/rewards/daily', { method: 'POST' })
      const data = await res.json()

      if (res.ok && data.success) {
        // Update points from server response
        useShopStore.setState({ rewardsPoints: data.totalPoints })
        setDailyLoginClaimed(true)
        sessionStorage.setItem('grapsee-daily-login', new Date().toISOString())

        toast.success(`+${data.points} points!`, {
          description: data.streak > 1 ? `${data.streak} day streak! ` : 'Daily login bonus claimed!'
        })

        // Add to local transactions
        setTransactions(prev => [{
          id: `dl-${Date.now()}`,
          type: 'daily_login',
          points: data.points,
          description: data.streak > 1
            ? `Daily login bonus (${data.streak} day streak!)`
            : 'Daily login bonus',
          date: new Date().toISOString(),
        }, ...prev])

        // If tier upgraded, show special notification
        if (data.tierUpgraded) {
          const tierName = tierNameMap[data.tierUpgraded] || data.tierUpgraded
          toast.success(`Tier Upgraded to ${tierName}!`, {
            description: 'You received bonus points for reaching a new tier!'
          })
        }
      } else {
        toast.error(data.message || 'Failed to claim daily bonus')
      }
    } catch {
      toast.error('Failed to claim daily bonus')
    } finally {
      setClaimingLogin(false)
    }
  }

  const handleRedeem = async () => {
    if (rewardsPoints < redeemAmount) {
      toast.error('Not enough points')
      return
    }
    setRedeeming(true)
    try {
      const res = await fetch('/api/rewards/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: redeemAmount }),
      })
      const data = await res.json()
      if (res.ok) {
        setDiscountCode(data.discountCode)
        // Update local store
        useShopStore.setState({ rewardsPoints: rewardsPoints - redeemAmount })
        toast.success(`Redeemed ${redeemAmount} points for $${data.discountAmount}!`)
        // Add redemption to transactions
        setTransactions(prev => [{
          id: `rd-${Date.now()}`,
          type: 'redemption',
          points: -redeemAmount,
          description: `Redeemed for $${data.discountAmount} discount`,
          date: new Date().toISOString(),
        }, ...prev])
      } else {
        toast.error(data.error || 'Failed to redeem points')
      }
    } catch {
      toast.error('Failed to redeem points')
    } finally {
      setRedeeming(false)
    }
  }

  const handleCopyCode = async () => {
    if (!discountCode) return
    try {
      await navigator.clipboard.writeText(discountCode)
      setCopied(true)
      toast.success('Discount code copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const currentTier = getCurrentTier(rewardsPoints)
  const nextTier = getNextTier(rewardsPoints)
  const progressToNext = nextTier
    ? Math.min(((rewardsPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100, 100)
    : 100
  const displayedTransactions = showAllTransactions ? transactions : transactions.slice(0, 5)

  const referralLink = typeof window !== 'undefined' ? `${window.location.origin}?ref=USER2024` : ''

  return (
    <motion.div
      className="px-4 py-2 pb-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={goBack} className="flex-shrink-0 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            Rewards Program
          </h1>
          <p className="text-xs text-muted-foreground">Earn points, unlock benefits</p>
        </div>
      </div>

      {/* Points Card */}
      <div className="mb-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-2xl">
            {currentTier.icon}
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Your Points</p>
            <p className="text-2xl font-bold text-primary">{rewardsPoints}</p>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs px-2 py-1">
            {currentTier.name}
          </Badge>
        </div>
        {nextTier && (
          <>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progressToNext, 100)}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {nextTier.minPoints - rewardsPoints} points to {nextTier.name} tier
            </p>
          </>
        )}
      </div>

      {/* Daily Login Bonus */}
      <div className="mb-4 rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-amber-500/5 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
              <Zap className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Daily Login Bonus</p>
              <p className="text-[10px] text-muted-foreground">Earn 5 points every day you visit</p>
            </div>
          </div>
          <Button
            size="sm"
            disabled={dailyLoginClaimed || claimingLogin}
            onClick={handleDailyLogin}
            className="bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white text-xs h-7"
          >
            {claimingLogin ? (
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
            ) : dailyLoginClaimed ? (
              'Claimed '
            ) : (
              '+5 Pts'
            )}
          </Button>
        </div>
      </div>

      {/* Redeem Points Section */}
      <div className="mb-4 rounded-2xl border border-border/50 bg-card p-4">
        <h3 className="mb-3 text-sm font-bold text-foreground flex items-center gap-2">
          <Gift className="h-4 w-4 text-rose-400" />
          Redeem Points
        </h3>
        <p className="text-xs text-muted-foreground mb-3">500 points = $10 discount code</p>

        {/* Discount code display */}
        {discountCode && (
          <motion.div
            className="mb-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-[10px] text-emerald-500 mb-1">Your discount code:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg bg-background px-3 py-2 text-center text-sm font-mono font-bold text-foreground border border-emerald-500/20">
                {discountCode}
              </code>
              <Button size="icon" variant="outline" onClick={handleCopyCode} className="h-9 w-9 border-emerald-500/20">
                {copied ? <CheckCheck className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </motion.div>
        )}

        <div className="flex items-center gap-3 mb-3">
          <div className="flex gap-1">
            {[500, 1000, 2000].map(amt => (
              <button
                key={amt}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  redeemAmount === amt
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-primary/10'
                }`}
                onClick={() => setRedeemAmount(amt)}
              >
                {amt}
              </button>
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground">= ${(redeemAmount / 500) * 10}</span>
        </div>

        <Button
          className="w-full gap-2"
          disabled={rewardsPoints < redeemAmount || redeeming}
          onClick={handleRedeem}
        >
          {redeeming ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
          ) : (
            <Gift className="h-4 w-4" />
          )}
          {redeeming ? 'Redeeming...' : `Redeem ${redeemAmount} Points`}
        </Button>
        {rewardsPoints < redeemAmount && (
          <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
            You need {redeemAmount - rewardsPoints} more points
          </p>
        )}
      </div>

      {/* Transaction History */}
      <div className="mb-4 rounded-2xl border border-border/50 bg-card p-4">
        <h3 className="mb-3 text-sm font-bold text-foreground">Transaction History</h3>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center py-6 text-center">
            <Trophy className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">No transactions yet</p>
            <p className="text-[10px] text-muted-foreground">Start earning points by shopping!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayedTransactions.map((tx) => {
              const config = TRANSACTION_ICONS[tx.type] || TRANSACTION_ICONS.purchase_earn
              const Icon = config.icon
              const isNegative = tx.points < 0
              return (
                <motion.div
                  key={tx.id}
                  className="flex items-center gap-3 rounded-lg border border-border/30 p-2.5"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.bg}`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{tx.description}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <span className={`text-xs font-bold ${isNegative ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {isNegative ? '' : '+'}{tx.points} pts
                  </span>
                </motion.div>
              )
            })}
            {transactions.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground"
                onClick={() => setShowAllTransactions(!showAllTransactions)}
              >
                {showAllTransactions ? (
                  <><ChevronUp className="h-3 w-3 mr-1" /> Show Less</>
                ) : (
                  <><ChevronDown className="h-3 w-3 mr-1" /> Show All ({transactions.length})</>
                )}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Referral Link */}
      <div className="mb-4 rounded-2xl border border-border/50 bg-card p-4">
        <h3 className="mb-2 text-sm font-bold text-foreground flex items-center gap-2">
          <Users className="h-4 w-4 text-sky-400" />
          Refer & Earn
        </h3>
        <p className="text-[10px] text-muted-foreground mb-3">Share your referral link and earn 100 points for each friend who signs up!</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded-lg bg-muted px-3 py-2 text-[11px] font-mono text-foreground truncate">
            {referralLink}
          </code>
          <Button
            size="icon"
            variant="outline"
            className="h-9 w-9 flex-shrink-0"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(referralLink)
                toast.success('Referral link copied!')
              } catch {
                toast.error('Failed to copy')
              }
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator className="my-4" />

      {/* How It Works */}
      <section className="mb-4">
        <h3 className="mb-2 text-sm font-bold text-foreground">How It Works</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
              <Gift className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Earn points shopping</p>
              <p className="text-[10px] text-muted-foreground">10 points per item + daily login bonuses</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
              <Star className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Unlock tiers</p>
              <p className="text-[10px] text-muted-foreground">More points = better benefits</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Percent className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">500 points = $10 discount</p>
              <p className="text-[10px] text-muted-foreground">Redeem at checkout for instant savings</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="mb-4">
        <h3 className="mb-2 text-sm font-bold text-foreground">Membership Tiers</h3>
        <div className="space-y-2">
          {tiers.map((tier) => {
            const isCurrent = rewardsPoints >= tier.minPoints && (tier.maxPoints === Infinity || rewardsPoints < tier.maxPoints)
            const isNext = nextTier?.name === tier.name
            return (
              <div
                key={tier.name}
                className={`rounded-xl bg-gradient-to-r ${tier.color} border ${isCurrent ? 'border-primary/40 ring-1 ring-primary/20' : isNext ? 'border-dashed border-primary/30' : 'border-border/50'} p-3`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{tier.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-foreground">{tier.name}</p>
                      {isCurrent && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary">Current</span>
                      )}
                      {isNext && !isCurrent && (
                        <span className="rounded-full bg-primary/5 px-2 py-0.5 text-[9px] font-semibold text-primary/70">Next</span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {tier.maxPoints === Infinity ? `${tier.minPoints}+ points` : `${tier.minPoints} - ${tier.maxPoints} points`}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tier.benefits.map((benefit) => (
                    <span key={benefit} className="inline-flex items-center rounded-full bg-background/50 px-2 py-0.5 text-[10px] text-muted-foreground">
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </motion.div>
  )
}

// Badge component inline since we need it
function Badge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className}`}>
      {children}
    </span>
  )
}
