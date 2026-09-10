'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Award, Shield, Gem, Crown, Diamond, ChevronRight, Star,
  Gift, Zap, TrendingUp, Lock, Unlock, ArrowUp, Check
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'

type Tier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
type Size = 'sm' | 'md' | 'lg'
type DisplayMode = 'badge' | 'card' | 'full'

interface LoyaltyBadgeProps {
  tier: Tier
  size?: Size
  className?: string
  points?: number
  showProgress?: boolean
  displayMode?: DisplayMode
}

interface PointsHistoryEntry {
  id: string
  description: string
  points: number
  type: 'earned' | 'redeemed'
  date: string
}

const tierConfig: Record<Tier, {
  icon: React.ElementType
  label: string
  bgClass: string
  textClass: string
  borderClass: string
  shimmer: boolean
  gradient: string
  minPoints: number
  maxPoints: number
  perks: string[]
  color: string
}> = {
  bronze: {
    icon: Shield,
    label: 'Bronze',
    bgClass: 'bg-amber-700/15',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-700/30',
    shimmer: false,
    gradient: 'from-amber-700 to-amber-900',
    minPoints: 0,
    maxPoints: 499,
    perks: ['1x reward points', 'Basic support', 'Birthday bonus 50pts', 'Free standard delivery'],
    color: '#b45309',
  },
  silver: {
    icon: Award,
    label: 'Silver',
    bgClass: 'bg-gray-400/15',
    textClass: 'text-gray-500',
    borderClass: 'border-gray-400/30',
    shimmer: false,
    gradient: 'from-gray-400 to-gray-600',
    minPoints: 500,
    maxPoints: 1499,
    perks: ['1.5x reward points', 'Priority support', 'Birthday bonus 100pts', 'Free express delivery', 'Early access to sales'],
    color: '#9ca3af',
  },
  gold: {
    icon: Crown,
    label: 'Gold',
    bgClass: 'bg-yellow-500/15',
    textClass: 'text-yellow-600',
    borderClass: 'border-yellow-500/30',
    shimmer: true,
    gradient: 'from-yellow-400 to-amber-500',
    minPoints: 1500,
    maxPoints: 4999,
    perks: ['2x reward points', '24/7 priority support', 'Birthday bonus 200pts', 'Free same-day delivery', 'Exclusive deals', 'Monthly free gift'],
    color: '#eab308',
  },
  platinum: {
    icon: Gem,
    label: 'Platinum',
    bgClass: 'bg-cyan-500/15',
    textClass: 'text-cyan-600',
    borderClass: 'border-cyan-500/30',
    shimmer: true,
    gradient: 'from-cyan-400 to-teal-500',
    minPoints: 5000,
    maxPoints: 14999,
    perks: ['3x reward points', 'Dedicated account manager', 'Birthday bonus 500pts', 'Free overnight delivery', 'VIP-only sales', 'Quarterly free gift', 'Free returns'],
    color: '#06b6d4',
  },
  diamond: {
    icon: Diamond,
    label: 'Diamond',
    bgClass: 'bg-violet-500/15',
    textClass: 'text-violet-600',
    borderClass: 'border-violet-500/30',
    shimmer: true,
    gradient: 'from-violet-400 to-purple-600',
    minPoints: 15000,
    maxPoints: 999999,
    perks: ['5x reward points', 'Personal concierge', 'Birthday bonus 1000pts', 'Free instant delivery', 'All sales early access', 'Monthly premium gift', 'Free returns & exchanges', 'Exclusive events'],
    color: '#8b5cf6',
  },
}

const tierOrder: Tier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond']

const sizeMap: Record<Size, { container: string; icon: string; text: string }> = {
  sm: { container: 'gap-1 px-2 py-0.5', icon: 'h-3 w-3', text: 'text-[9px]' },
  md: { container: 'gap-1.5 px-2.5 py-1', icon: 'h-3.5 w-3.5', text: 'text-[10px]' },
  lg: { container: 'gap-2 px-3 py-1.5', icon: 'h-4 w-4', text: 'text-xs' },
}

export function LoyaltyBadge({ tier, size = 'md', className, points, showProgress = false, displayMode = 'badge' }: LoyaltyBadgeProps) {
  const config = tierConfig[tier]
  const sizeConfig = sizeMap[size]
  const Icon = config.icon
  const { rewardsPoints } = useShopStore()
  const { goRewards } = useShopRouter()
  const [showUpgradeAnimation, setShowUpgradeAnimation] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const currentPoints = points ?? rewardsPoints
  const currentTierIndex = tierOrder.indexOf(tier)
  const nextTier = currentTierIndex < tierOrder.length - 1 ? tierOrder[currentTierIndex + 1] : null
  const nextTierConfig = nextTier ? tierConfig[nextTier] : null

  // Progress calculation
  const progressInTier = currentPoints - config.minPoints
  const tierRange = config.maxPoints - config.minPoints + 1
  const progressPercent = Math.min(100, Math.max(0, (progressInTier / tierRange) * 100))
  const pointsToNext = nextTier ? nextTierConfig!.minPoints - currentPoints : 0

  // Badge-only mode (original behavior)
  if (displayMode === 'badge' && !showProgress) {
    return (
      <div
        className={cn(
          'relative inline-flex items-center rounded-full border overflow-hidden',
          config.bgClass,
          config.borderClass,
          sizeConfig.container,
          className
        )}
      >
        {config.shimmer ? (
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Icon className={cn(config.textClass, sizeConfig.icon)} />
          </motion.div>
        ) : (
          <Icon className={cn(config.textClass, sizeConfig.icon)} />
        )}
        <span className={cn('font-semibold uppercase tracking-wide', config.textClass, sizeConfig.text)}>
          {config.label}
        </span>
        {config.shimmer && (
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </div>
    )
  }

  // Badge with progress bar
  if (displayMode === 'badge' && showProgress) {
    return (
      <div className={cn('space-y-1', className)}>
        <div
          className={cn(
            'relative inline-flex items-center rounded-full border overflow-hidden',
            config.bgClass,
            config.borderClass,
            sizeConfig.container,
          )}
        >
          {config.shimmer ? (
            <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
              <Icon className={cn(config.textClass, sizeConfig.icon)} />
            </motion.div>
          ) : (
            <Icon className={cn(config.textClass, sizeConfig.icon)} />
          )}
          <span className={cn('font-semibold uppercase tracking-wide', config.textClass, sizeConfig.text)}>
            {config.label}
          </span>
          {config.shimmer && (
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
          )}
        </div>
        {nextTier && (
          <div className="space-y-0.5">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${config.gradient}`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <p className="text-[9px] text-muted-foreground">
              {pointsToNext} pts to {nextTierConfig!.label}
            </p>
          </div>
        )}
      </div>
    )
  }

  // Card display mode
  if (displayMode === 'card') {
    return (
      <motion.div
        className={cn('relative overflow-hidden rounded-2xl border border-border/50 bg-card p-4', className)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${config.gradient} opacity-10 blur-2xl`} />

        <div className="flex items-center gap-3">
          {/* Tier Icon */}
          <motion.div
            className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${config.gradient} shadow-lg`}
            animate={config.shimmer ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Icon className="h-6 w-6 text-white" />
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={cn('text-sm font-bold', config.textClass)}>{config.label} Member</h3>
              {config.shimmer && (
                <motion.div
                  className="h-1 w-8 rounded-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              )}
            </div>
            <p className="text-xs text-muted-foreground">{currentPoints.toLocaleString()} points</p>
          </div>
        </div>

        {/* Progress Bar */}
        {nextTier && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="text-muted-foreground">{config.label}</span>
              <span className={cn('font-medium', config.textClass)}>{Math.round(progressPercent)}%</span>
              <span className="text-muted-foreground">{nextTierConfig!.label}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${config.gradient}`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground text-center">
              <ArrowUp className="inline h-2.5 w-2.5 mr-0.5" />
              {pointsToNext.toLocaleString()} more points to {nextTierConfig!.label}
            </p>
          </div>
        )}

        {/* Tier Perks Preview */}
        <div className="mt-3 flex flex-wrap gap-1">
          {config.perks.slice(0, 3).map((perk, i) => (
            <span key={i} className={cn('flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[8px] font-medium', config.bgClass, config.textClass)}>
              <Check className="h-2 w-2" />
              {perk}
            </span>
          ))}
          {config.perks.length > 3 && (
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[8px] text-muted-foreground">
              +{config.perks.length - 3} more
            </span>
          )}
        </div>
      </motion.div>
    )
  }

  // Full display mode
  return (
    <motion.div
      className={cn('relative overflow-hidden rounded-2xl border border-border/50 bg-card', className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Tier Header */}
      <div className={`relative p-4 bg-gradient-to-r ${config.gradient} bg-opacity-10`}>
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/60" />
        <div className="relative flex items-center gap-3">
          <motion.div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${config.gradient} shadow-xl`}
            animate={config.shimmer ? { scale: [1, 1.06, 1], rotate: [0, 2, -2, 0] } : {}}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Icon className="h-7 w-7 text-white" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={cn('text-lg font-bold', config.textClass)}>{config.label} Tier</h2>
              {nextTier && (
                <button
                  onClick={goRewards}
                  className="flex items-center gap-0.5 rounded-full bg-background/50 px-2 py-0.5 text-[9px] font-medium text-foreground backdrop-blur-sm"
                >
                  <ArrowUp className="h-2.5 w-2.5" />
                  Upgrade
                </button>
              )}
            </div>
            <p className="text-sm font-semibold text-foreground">{currentPoints.toLocaleString()} points</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Progress to Next Tier */}
        {nextTier && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-medium text-muted-foreground">Progress to {nextTierConfig!.label}</span>
              <span className={cn('text-[10px] font-bold', config.textClass)}>{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${config.gradient} relative`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              >
                {config.shimmer && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  />
                )}
              </motion.div>
            </div>
            <div className="mt-1 flex justify-between text-[9px] text-muted-foreground">
              <span>{config.minPoints} pts</span>
              <span className={cn('font-medium', config.textClass)}>{pointsToNext.toLocaleString()} pts to go</span>
              <span>{nextTierConfig!.maxPoints.toLocaleString()} pts</span>
            </div>
          </div>
        )}

        {/* Tier Perks */}
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center justify-between mb-2"
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tier Benefits</span>
            <motion.div animate={{ rotate: expanded ? 180 : 0 }}>
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            </motion.div>
          </button>
          <div className="space-y-1.5">
            {config.perks.map((perk, i) => (
              <motion.div
                key={i}
                initial={false}
                animate={{ opacity: 1, height: expanded || i < 4 ? 'auto' : 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 overflow-hidden"
              >
                <div className={cn('flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full', config.bgClass)}>
                  <Check className={cn('h-2.5 w-2.5', config.textClass)} />
                </div>
                <span className="text-[11px] text-foreground">{perk}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Points History */}
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Recent Activity</span>
          <div className="mt-2 space-y-1.5 max-h-32 overflow-y-auto">
            {[].map(entry => (
              <div key={entry.id} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${entry.type === 'earned' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                    {entry.type === 'earned' ? (
                      <TrendingUp className="h-2.5 w-2.5 text-emerald-500" />
                    ) : (
                      <Gift className="h-2.5 w-2.5 text-rose-500" />
                    )}
                  </div>
                  <span className="text-[10px] text-foreground line-clamp-1">{entry.description}</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className={`text-[10px] font-semibold ${entry.type === 'earned' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {entry.type === 'earned' ? '+' : ''}{entry.points}
                  </span>
                  <span className="text-[8px] text-muted-foreground">{entry.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tier Comparison */}
        <div className="flex gap-1">
          {tierOrder.map((t, i) => {
            const tc = tierConfig[t]
            const TIcon = tc.icon
            const isCurrent = t === tier
            const isPast = i < currentTierIndex
            return (
              <div
                key={t}
                className={cn(
                  'flex-1 flex flex-col items-center gap-0.5 rounded-lg py-1.5 transition-all',
                  isCurrent ? cn('bg-gradient-to-br', config.gradient, 'bg-opacity-20 shadow-sm') : isPast ? 'bg-emerald-500/5' : 'bg-muted/30'
                )}
              >
                <TIcon className={cn('h-3 w-3', isCurrent ? tc.textClass : isPast ? 'text-emerald-500' : 'text-muted-foreground/30')} />
                <span className={cn('text-[7px] font-medium', isCurrent ? tc.textClass : isPast ? 'text-emerald-500' : 'text-muted-foreground/40')}>
                  {tc.label}
                </span>
                {isPast && <Check className="h-2 w-2 text-emerald-500" />}
                {isCurrent && (
                  <motion.div
                    className="h-0.5 w-4 rounded-full bg-current"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
