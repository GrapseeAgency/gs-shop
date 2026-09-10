'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Crown, Star, Shield, Award, Gem, Diamond, Truck,
  Clock, Gift, Headphones, PartyPopper, Lock, Check, ChevronRight,
  Sparkles, Zap, ShoppingBag, Palette
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useShopRouter } from '@/hooks/use-shop-router'
import { useShopStore } from '@/lib/store'
import { toast } from 'sonner'

interface RewardsData {
  points: number
  tier: string
  benefits: string[]
}

const VIP_TIERS = [
  {
    name: 'Bronze',
    icon: Shield,
    minPoints: 0,
    maxPoints: 499,
    multiplier: '1x',
    freeShipping: '$100+',
    earlyAccess: false,
    prioritySupport: false,
    birthdayBonus: '$5',
    exclusiveProducts: false,
    color: 'from-amber-700/20 to-amber-900/5',
    borderColor: 'border-amber-700/30',
    iconColor: 'text-amber-600',
  },
  {
    name: 'Silver',
    icon: Award,
    minPoints: 500,
    maxPoints: 999,
    multiplier: '1.5x',
    freeShipping: '$75+',
    earlyAccess: false,
    prioritySupport: true,
    birthdayBonus: '$10',
    exclusiveProducts: false,
    color: 'from-gray-400/20 to-gray-600/5',
    borderColor: 'border-gray-400/30',
    iconColor: 'text-gray-400',
  },
  {
    name: 'Gold',
    icon: Crown,
    minPoints: 1000,
    maxPoints: 2499,
    multiplier: '2x',
    freeShipping: '$50+',
    earlyAccess: true,
    prioritySupport: true,
    birthdayBonus: '$20',
    exclusiveProducts: false,
    color: 'from-amber-400/20 to-amber-600/5',
    borderColor: 'border-amber-400/30',
    iconColor: 'text-amber-400',
  },
  {
    name: 'Platinum',
    icon: Gem,
    minPoints: 2500,
    maxPoints: 4999,
    multiplier: '3x',
    freeShipping: 'All orders',
    earlyAccess: true,
    prioritySupport: true,
    birthdayBonus: '$50',
    exclusiveProducts: true,
    color: 'from-cyan-400/20 to-blue-600/5',
    borderColor: 'border-cyan-400/30',
    iconColor: 'text-cyan-400',
  },
  {
    name: 'Diamond',
    icon: Diamond,
    minPoints: 5000,
    maxPoints: Infinity,
    multiplier: '5x',
    freeShipping: 'All orders',
    earlyAccess: true,
    prioritySupport: true,
    birthdayBonus: '$100',
    exclusiveProducts: true,
    color: 'from-violet-400/20 to-purple-600/5',
    borderColor: 'border-violet-400/30',
    iconColor: 'text-violet-400',
  },
]

function getCurrentTier(points: number) {
  for (let i = VIP_TIERS.length - 1; i >= 0; i--) {
    if (points >= VIP_TIERS[i].minPoints) return VIP_TIERS[i]
  }
  return VIP_TIERS[0]
}

function getNextTier(points: number) {
  const current = getCurrentTier(points)
  const idx = VIP_TIERS.indexOf(current)
  if (idx < VIP_TIERS.length - 1) return VIP_TIERS[idx + 1]
  return null
}

export default function VipPage() {
  const { goBack, goRewards, goCart } = useShopRouter()
  const { rewardsPoints } = useShopStore()
  const [rewardsData, setRewardsData] = useState<RewardsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedTier, setExpandedTier] = useState<string | null>(null)

  const fetchRewards = useCallback(async () => {
    try {
      const res = await fetch('/api/rewards')
      if (res.ok) {
        const data = await res.json()
        setRewardsData(data)
      }
    } catch { /* ignore */ } finally {
      
    }
  }, [])

  useEffect(() => {
    fetchRewards()
  }, [fetchRewards])

  const currentTier = getCurrentTier(rewardsPoints)
  const nextTier = getNextTier(rewardsPoints)
  const progressToNext = nextTier
    ? ((rewardsPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
    : 100
  const pointsNeeded = nextTier ? nextTier.minPoints - rewardsPoints : 0

  const currentBenefits = [
    currentTier.freeShipping && `Free shipping on orders ${currentTier.freeShipping}`,
    currentTier.earlyAccess && 'Early access to new products',
    currentTier.prioritySupport && 'Priority customer support',
    currentTier.birthdayBonus && `${currentTier.birthdayBonus} birthday bonus`,
    currentTier.exclusiveProducts && 'Access to exclusive products',
  ].filter(Boolean) as string[]

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
              <Crown className="h-5 w-5 text-amber-400" />
              VIP Membership
            </h1>
            <p className="text-[11px] text-muted-foreground">Unlock premium benefits</p>
          </div>
        </div>
      </div>

      {/* Hero with Golden Gradient + Crown Animation */}
      <div className="mx-4 mt-4 relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-orange-500/15 border border-amber-500/20 p-5">
        {/* Animated sparkles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-amber-400/40"
            style={{ top: `${10 + Math.random() * 80}%`, left: `${5 + Math.random() * 90}%` }}
            animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 2 + Math.random(), repeat: Infinity, delay: Math.random() * 2 }}
          >
            <Sparkles className="h-3 w-3" />
          </motion.div>
        ))}

        <div className="relative z-10 text-center">
          <motion.div
            className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30 mb-3"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', delay: 0.2 }}
          >
            <Crown className="h-8 w-8 text-white" />
          </motion.div>
          <h2 className="text-xl font-black text-foreground mb-1 flex items-center justify-center gap-2">
            <currentTier.icon className="h-7 w-7" />
            {currentTier.name} Member
          </h2>
          <p className="text-xs text-muted-foreground mb-3">
            {rewardsPoints.toLocaleString()} reward points
          </p>
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
            {currentTier.multiplier} Rewards Multiplier
          </Badge>
        </div>
      </div>

      {/* Tier Progress */}
      {nextTier && (
        <div className="mx-4 mt-3 rounded-2xl border border-border/50 bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <currentTier.icon className={`h-4 w-4 ${currentTier.iconColor}`} />
              <span className="text-xs font-medium text-foreground">{currentTier.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-foreground">{nextTier.name}</span>
              <nextTier.icon className={`h-4 w-4 ${nextTier.iconColor}`} />
            </div>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progressToNext, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            <span className="font-bold text-primary">{pointsNeeded.toLocaleString()}</span> points to reach {nextTier.name}
          </p>
          <Button
            size="sm"
            className="w-full mt-3 gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
            onClick={() => {
              goRewards()
              toast.info('Keep shopping to earn more points!')
            }}
          >
            <Zap className="h-3.5 w-3.5" />
            Earn More Points
          </Button>
        </div>
      )}

      {/* Current Benefits */}
      <div className="mx-4 mt-4 rounded-2xl border border-border/50 bg-card p-4">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Gift className="h-4 w-4 text-primary" />
          Benefits You&apos;re Enjoying
        </h3>
        <div className="space-y-2">
          {currentBenefits.map((benefit, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10">
                <Check className="h-3 w-3 text-emerald-500" />
              </div>
              <span className="text-xs text-foreground">{benefit}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <Separator className="mx-4 my-4" />

      {/* Tier Comparison Table */}
      <div className="mx-4">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Crown className="h-4 w-4 text-amber-400" />
          Tier Comparison
        </h3>
        <div className="space-y-2">
          {VIP_TIERS.map((tier, i) => {
            const Icon = tier.icon
            const isCurrent = rewardsPoints >= tier.minPoints && (tier.maxPoints === Infinity || rewardsPoints <= tier.maxPoints)
            const isExpanded = expandedTier === tier.name

            return (
              <motion.div
                key={tier.name}
                className={`rounded-xl border bg-gradient-to-r ${tier.color} ${isCurrent ? tier.borderColor + ' ring-1 ring-primary/20' : 'border-border/50'} overflow-hidden`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <button
                  className="w-full p-3 flex items-center gap-3 text-left"
                  onClick={() => setExpandedTier(isExpanded ? null : tier.name)}
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-background/50 ${tier.iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <tier.icon className="h-5 w-5" />
                      <span className="text-sm font-bold text-foreground">{tier.name}</span>
                      {isCurrent && (
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] px-1.5 py-0">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {tier.maxPoints === Infinity ? `${tier.minPoints.toLocaleString()}+ pts` : `${tier.minPoints.toLocaleString()} - ${tier.maxPoints.toLocaleString()} pts`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`bg-background/50 ${tier.iconColor} text-[10px] border-0`}>
                      {tier.multiplier}
                    </Badge>
                    <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </button>

                {isExpanded && (
                  <motion.div
                    className="px-3 pb-3 border-t border-border/20"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                  >
                    <div className="pt-3 space-y-2">
                      {[
                        { label: 'Rewards Multiplier', value: tier.multiplier, icon: Zap },
                        { label: 'Free Shipping', value: tier.freeShipping, icon: Truck },
                        { label: 'Early Access', value: tier.earlyAccess ? ' Yes' : ' No', icon: Clock },
                        { label: 'Priority Support', value: tier.prioritySupport ? ' Yes' : ' No', icon: Headphones },
                        { label: 'Birthday Bonus', value: tier.birthdayBonus, icon: Gift },
                        { label: 'Exclusive Products', value: tier.exclusiveProducts ? ' Yes' : ' No', icon: Lock },
                      ].map((item, j) => {
                        const ItemIcon = item.icon
                        const isPositive = item.value.includes('') || item.value.includes('All') || item.value !== ' No'
                        return (
                          <div key={j} className="flex items-center justify-between py-1">
                            <div className="flex items-center gap-2">
                              <ItemIcon className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-[11px] text-muted-foreground">{item.label}</span>
                            </div>
                            <span className={`text-[11px] font-medium ${isPositive ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                              {item.value}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      <Separator className="mx-4 my-4" />

      {/* VIP Exclusive Products */}
      <div className="mx-4">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-400" />
          VIP Exclusive Products
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: 'Premium Dashboard', price: 4999, icon: Palette },
            { name: 'Enterprise Suite', price: 9999, icon: ShoppingBag },
            { name: 'AI Pro Tools', price: 7499, icon: Sparkles },
            { name: 'Cloud Platform', price: 5999, icon: Zap },
          ].map((product, i) => (
            <motion.div
              key={product.name}
              className="rounded-xl border border-border/50 bg-card p-3 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="mb-2 flex justify-center"><product.icon className="h-10 w-10 text-primary" /></div>
              <p className="text-xs font-medium text-foreground mb-1">{product.name}</p>
              <p className="text-sm font-bold text-primary">${product.price}</p>
              <Button size="sm" variant="outline" className="mt-2 h-6 text-[10px] gap-1 w-full" onClick={goCart}>
                <ShoppingBag className="h-3 w-3" />
                Buy Now
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Upgrade CTA */}
      {nextTier && (
        <div className="mx-4 mt-4">
          <Button
            className="w-full h-12 gap-2 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-600 hover:via-amber-500 hover:to-yellow-600 text-black font-bold shadow-lg shadow-amber-500/20"
            onClick={() => {
              goRewards()
              toast.info(`${pointsNeeded} more points to reach ${nextTier.name}!`)
            }}
          >
            <Crown className="h-5 w-5" />
            Upgrade to {nextTier.name}
          </Button>
        </div>
      )}
    </motion.div>
  )
}
