'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Gift, Crown, Star, ArrowRight, Percent, Truck, Shield, ShoppingBag, MessageSquare, LogIn, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useShopRouter } from '@/hooks/use-shop-router'
import { useShopStore } from '@/lib/store'

interface TierInfo {
  name: string
  icon: React.ElementType
  minPoints: number
  color: string
  bgGradient: string
  benefits: string[]
}

const tiers: TierInfo[] = [
  { name: 'Bronze', icon: Shield, minPoints: 0, color: 'text-amber-700', bgGradient: 'from-amber-900/20 to-amber-800/10', benefits: ['1x points', 'Basic support'] },
  { name: 'Silver', icon: Star, minPoints: 500, color: 'text-gray-400', bgGradient: 'from-gray-500/20 to-gray-400/10', benefits: ['1.5x points', 'Priority support', '5% discount'] },
  { name: 'Gold', icon: Crown, minPoints: 2000, color: 'text-yellow-400', bgGradient: 'from-yellow-500/20 to-amber-500/10', benefits: ['2x points', 'Priority delivery', '10% discount', 'Early access'] },
  { name: 'Platinum', icon: Trophy, minPoints: 5000, color: 'text-cyan-300', bgGradient: 'from-cyan-500/20 to-sky-500/10', benefits: ['3x points', 'Free shipping', '15% discount', 'VIP support', 'Exclusive deals'] },
  { name: 'Diamond', icon: Sparkles, minPoints: 10000, color: 'text-violet-300', bgGradient: 'from-violet-500/20 to-fuchsia-500/10', benefits: ['5x points', 'Free express', '20% discount', '24/7 VIP', 'Beta features', 'Personal manager'] },
]

const earnMethods = [
  { icon: ShoppingBag, title: 'Purchase', desc: '1 pt / 10 spent', color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  { icon: MessageSquare, title: 'Review', desc: '50 pts per review', color: 'text-amber-400', bg: 'bg-amber-500/15' },
  { icon: Gift, title: 'Referral', desc: '100 pts per friend', color: 'text-violet-400', bg: 'bg-violet-500/15' },
  { icon: LogIn, title: 'Daily Login', desc: '5 pts per day', color: 'text-cyan-400', bg: 'bg-cyan-500/15' },
]

export function RewardsProgram() {
  const { goRewards } = useShopRouter()
  const { rewardsPoints } = useShopStore()
  const [currentTier, setCurrentTier] = useState<TierInfo>(tiers[0])
  const [nextTier, setNextTier] = useState<TierInfo | null>(tiers[1])
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Try to fetch from API for richer data
    fetch('/api/rewards?userId=user-1')
      .then((res) => res.json())
      .then((data) => {
        if (data.rewardsPoints !== undefined) {
          updateTier(data.rewardsPoints)
        }
      })
      .catch(() => {
        updateTier(rewardsPoints)
      })
  }, [rewardsPoints])

  const updateTier = (points: number) => {
    let tier = tiers[0]
    let next: TierInfo | null = tiers[1]

    for (let i = tiers.length - 1; i >= 0; i--) {
      if (points >= tiers[i].minPoints) {
        tier = tiers[i]
        next = i < tiers.length - 1 ? tiers[i + 1] : null
        break
      }
    }

    setCurrentTier(tier)
    setNextTier(next)

    if (next) {
      const rangeStart = tier.minPoints
      const rangeEnd = next.minPoints
      const pct = Math.min(100, Math.max(0, ((points - rangeStart) / (rangeEnd - rangeStart)) * 100))
      setProgress(pct)
    } else {
      setProgress(100)
    }
  }

  const TierIcon = currentTier.icon

  return (
    <section className="px-4 py-4">
      <motion.div
        className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Decorative blurs */}
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -left-6 bottom-0 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />

        <div className="relative">
          {/* Header */}
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Grapsee Rewards</h2>
              <p className="text-[11px] text-muted-foreground">Join & unlock exclusive benefits</p>
            </div>
          </div>

          {/* Current tier + points */}
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-background/50 p-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${currentTier.bgGradient}`}>
              <TierIcon className={`h-6 w-6 ${currentTier.color}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">{currentTier.name} Member</span>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                  {currentTier.minPoints === 0 ? 'Starter' : `${currentTier.minPoints}+ pts`}
                </Badge>
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-lg font-bold text-primary">{rewardsPoints.toLocaleString()}</span>
                <span className="text-[10px] text-muted-foreground">points</span>
              </div>
            </div>
          </div>

          {/* Progress to next tier */}
          {nextTier && (
            <div className="mb-4">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  Progress to {nextTier.name}
                </span>
                <span className="text-[10px] font-medium text-primary">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-primary/80"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
              <p className="mt-1 text-[9px] text-muted-foreground">
                {nextTier.minPoints - rewardsPoints} more points to {nextTier.name}
              </p>
            </div>
          )}

          {/* Tier benefits comparison */}
          <div className="mb-4">
            <h3 className="mb-2 text-xs font-semibold text-foreground">Tier Benefits</h3>
            <div className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {tiers.map((tier) => {
                const TIcon = tier.icon
                const isCurrent = tier.name === currentTier.name
                return (
                  <motion.div
                    key={tier.name}
                    className={`flex flex-shrink-0 flex-col items-center gap-1 rounded-lg p-2 transition-all ${
                      isCurrent
                        ? `bg-gradient-to-br ${tier.bgGradient} border border-primary/30`
                        : 'bg-background/30 border border-border/20'
                    }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    <TIcon className={`h-4 w-4 ${tier.color}`} />
                    <span className={`text-[9px] font-semibold ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {tier.name}
                    </span>
                    <span className="text-[8px] text-muted-foreground">
                      {tier.benefits.length} perks
                    </span>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* How to earn */}
          <div className="mb-4">
            <h3 className="mb-2 text-xs font-semibold text-foreground">How to Earn Points</h3>
            <div className="grid grid-cols-2 gap-2">
              {earnMethods.map((method, i) => {
                const MIcon = method.icon
                return (
                  <motion.div
                    key={method.title}
                    className="flex items-center gap-2 rounded-xl bg-background/50 p-2.5"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${method.bg}`}>
                      <MIcon className={`h-4 w-4 ${method.color}`} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-foreground">{method.title}</p>
                      <p className="text-[9px] text-muted-foreground">{method.desc}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* CTA */}
          <Button
            className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
            onClick={() => goRewards()}
          >
            <Trophy className="h-4 w-4" />
            Start Earning Points
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </section>
  )
}
