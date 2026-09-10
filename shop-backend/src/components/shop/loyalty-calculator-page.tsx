'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { LoyaltyBadge } from '@/components/shop/loyalty-badge'
import {
  Calculator,
  Star,
  Gift,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Award,
  ArrowRight,
  Check,
  Coins,
  Zap,
  Shield,
  Crown,
  Trophy,
  Truck,
  Ticket,
  Diamond,
  Medal,
  PartyPopper,
} from 'lucide-react'

interface TierInfo {
  name: string
  minPoints: number
  multiplier: number
  discount: number
  freeShipping: boolean
  icon: React.ComponentType<{ className?: string }>
  color: string
}

const TIERS: TierInfo[] = [
  { name: 'Bronze', minPoints: 0, multiplier: 1.0, discount: 0, freeShipping: false, icon: Medal, color: 'from-amber-700/20 to-amber-800/10' },
  { name: 'Silver', minPoints: 1000, multiplier: 1.1, discount: 5, freeShipping: false, icon: Medal, color: 'from-gray-400/20 to-gray-500/10' },
  { name: 'Gold', minPoints: 5000, multiplier: 1.2, discount: 10, freeShipping: true, icon: Award, color: 'from-yellow-400/20 to-yellow-600/10' },
  { name: 'Platinum', minPoints: 15000, multiplier: 1.3, discount: 15, freeShipping: true, icon: Diamond, color: 'from-cyan-400/20 to-cyan-600/10' },
  { name: 'Diamond', minPoints: 50000, multiplier: 1.5, discount: 20, freeShipping: true, icon: Crown, color: 'from-blue-400/20 to-indigo-400/10' },
]

const REDEMPTION_CATALOG = [
  { points: 200, reward: '50 BDT Off Coupon', icon: Ticket },
  { points: 400, reward: '100 BDT Off Coupon', icon: Ticket },
  { points: 300, reward: 'Free Shipping', icon: Truck },
  { points: 600, reward: 'Birthday Bonus', icon: PartyPopper },
  { points: 800, reward: '250 BDT Off Coupon', icon: Gift },
  { points: 1500, reward: '500 BDT Off Coupon', icon: Diamond },
  { points: 3000, reward: '1000 BDT Off Coupon', icon: Trophy },
]

export function LoyaltyCalculatorPage() {
  const rewardsPoints = useShopStore((s) => s.rewardsPoints)
  const { goBack, goCategory } = useShopRouter()
  const [purchaseAmount, setPurchaseAmount] = useState(1000)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [calcResult, setCalcResult] = useState<{
    basePoints: number
    bonusPoints: number
    totalPoints: number
    tierName: string
    nextTier: string | null
    pointsToNext: number
    tierProgress: number
  } | null>(null)
  const [calculating, setCalculating] = useState(false)

  const currentTier = TIERS.reduce((acc, t) => rewardsPoints >= t.minPoints ? t : acc, TIERS[0])

  const nextTierIdx = TIERS.indexOf(currentTier) + 1
  const nextTier = nextTierIdx < TIERS.length ? TIERS[nextTierIdx] : null
  const pointsToNext = nextTier ? nextTier.minPoints - rewardsPoints : 0
  const tierRange = nextTier ? nextTier.minPoints - currentTier.minPoints : 50000
  const tierProgress = Math.min(100, Math.round(((rewardsPoints - currentTier.minPoints) / tierRange) * 100))

  const calculatePoints = useCallback(async () => {
    setCalculating(true)
    try {
      const res = await fetch('/api/loyalty-calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseAmount, currentPoints: rewardsPoints }),
      })
      const data = await res.json()
      setCalcResult({
        basePoints: data.basePoints || Math.floor(purchaseAmount),
        bonusPoints: data.bonusPoints || 0,
        totalPoints: data.pointsEarned || Math.floor(purchaseAmount),
        tierName: data.currentTier?.name || currentTier.name,
        nextTier: data.nextTier?.name || nextTier?.name || null,
        pointsToNext: data.nextTier?.pointsToNextTier || pointsToNext,
        tierProgress: data.tierProgressPercent || tierProgress,
      })
    } catch {
      const base = Math.floor(purchaseAmount)
      const bonus = Math.floor(base * (currentTier.multiplier - 1))
      setCalcResult({ basePoints: base, bonusPoints: bonus, totalPoints: base + bonus, tierName: currentTier.name, nextTier: nextTier?.name || null, pointsToNext, tierProgress })
    } finally {
      setCalculating(false)
    }
  }, [purchaseAmount, rewardsPoints, currentTier, nextTier, pointsToNext, tierProgress])

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="p-1.5 rounded-lg hover:bg-muted active:scale-95 transition">
            <ArrowRight className="w-5 h-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-500" /> Loyalty Calculator
            </h1>
            <p className="text-xs text-muted-foreground">Earn points, unlock rewards</p>
          </div>
        </div>
      </motion.div>

      {/* Current Tier Progress */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="mx-4 mt-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-orange-500/20 border border-amber-500/20 p-4">
          <div className="absolute top-2 right-2"><Sparkles className="w-6 h-6 text-amber-400 animate-pulse" /></div>
          <div className="flex items-center gap-3 mb-3">
            <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}>
              <LoyaltyBadge tier={currentTier.name.toLowerCase() as 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'} size="lg" />
            </motion.div>
            <div>
              <p className="text-sm text-amber-300/80 font-medium">Current Tier</p>
              <p className="text-xl font-bold text-foreground">{currentTier.name}</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{rewardsPoints.toLocaleString()} points</span>
              {nextTier && <span className="text-amber-400">{pointsToNext.toLocaleString()} to {nextTier.name}</span>}
            </div>
            <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${tierProgress}%` }} transition={{ duration: 1, ease: 'easeOut' }} className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Purchase Amount Input with Slider */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mx-4 mt-4 rounded-xl border border-border bg-card p-4 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Coins className="w-4 h-4 text-amber-500" /> Points Calculator
        </h3>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium"></span>
          <input type="number" value={purchaseAmount} onChange={(e) => setPurchaseAmount(Math.max(0, Number(e.target.value)))} className="w-full pl-8 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
        </div>
        <input type="range" min={0} max={50000} step={100} value={purchaseAmount} onChange={(e) => setPurchaseAmount(Number(e.target.value))} className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-amber-500" />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>0</span><span>10K</span><span>25K</span><span>50K</span>
        </div>
        <button onClick={calculatePoints} disabled={calculating || purchaseAmount <= 0} className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-lg shadow-amber-500/20 disabled:opacity-50">
          {calculating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Zap className="w-4 h-4" /> Calculate Points</>}
        </button>
      </motion.div>

      {/* Points Earned Display */}
      <AnimatePresence>
        {calcResult && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mx-4 mt-4">
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <p className="text-xs text-muted-foreground mb-2 text-center">Points you&apos;ll earn from {purchaseAmount.toLocaleString()}</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Base</p>
                  <p className="text-lg font-bold text-foreground">{calcResult.basePoints.toLocaleString()}</p>
                </div>
                <div className="bg-amber-500/10 rounded-lg p-3 text-center">
                  <p className="text-xs text-amber-400">Bonus</p>
                  <p className="text-lg font-bold text-amber-400">+{calcResult.bonusPoints.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-lg p-3 text-center border border-amber-500/20">
                  <p className="text-xs text-amber-300">Total</p>
                  <p className="text-xl font-bold text-amber-400">{calcResult.totalPoints.toLocaleString()}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2"><Zap className="w-3 h-3 inline mr-1" />1 BDT = 1 point + {currentTier.name} tier bonus</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tier Comparison Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mx-4 mt-4 rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3"><Award className="w-4 h-4 text-amber-500" /> Tier Comparison</h3>
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full text-xs border border-border rounded-lg overflow-hidden">
            <thead><tr className="bg-muted/50">
              <th className="p-2 text-left text-muted-foreground font-medium">Tier</th>
              <th className="p-2 text-center text-muted-foreground font-medium">Points</th>
              <th className="p-2 text-center text-muted-foreground font-medium">Rate</th>
              <th className="p-2 text-center text-muted-foreground font-medium">Disc.</th>
              <th className="p-2 text-center text-muted-foreground font-medium">Ship</th>
            </tr></thead>
            <tbody>
              {TIERS.map((t) => (
                <tr key={t.name} className={`border-t border-border ${t.name === currentTier.name ? 'bg-amber-500/10' : ''}`}>
                  <td className="p-2 font-medium"><span className="inline-flex items-center gap-1">{(() => { const Icon = t.icon; return <Icon className="h-4 w-4" />; })()}{t.name}</span></td>
                  <td className="p-2 text-center">{t.minPoints.toLocaleString()}+</td>
                  <td className="p-2 text-center font-semibold text-amber-400">{t.multiplier}x</td>
                  <td className="p-2 text-center">{t.discount}%</td>
                  <td className="p-2 text-center">{t.freeShipping ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Points Redemption Catalog */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mx-4 mt-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3"><Gift className="w-4 h-4 text-amber-500" /> Redemption Catalog</h3>
        <div className="space-y-2">
          {REDEMPTION_CATALOG.map((item, idx) => {
            const canRedeem = rewardsPoints >= item.points
            return (
              <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04 }} className={`rounded-xl border p-3 flex items-center justify-between ${canRedeem ? 'border-amber-500/30 bg-amber-500/5' : 'border-border bg-card opacity-60'}`}>
                <div className="flex items-center gap-3">
                  {(() => { const Icon = item.icon; return <Icon className="h-5 w-5 text-amber-500" />; })()}
                  <div><p className="text-sm font-medium text-foreground">{item.reward}</p><p className="text-xs text-muted-foreground">{item.points.toLocaleString()} pts</p></div>
                </div>
                <button disabled={!canRedeem} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${canRedeem ? 'bg-amber-500 text-white active:scale-95' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>
                  {canRedeem ? 'Redeem' : 'Locked'}
                </button>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* How It Works */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mx-4 mt-4 rounded-xl border border-border bg-card p-4">
        <button onClick={() => setShowHowItWorks(!showHowItWorks)} className="w-full flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Info className="w-4 h-4 text-blue-500" /> How It Works</h3>
          {showHowItWorks ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <AnimatePresence>
          {showHowItWorks && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 space-y-2">
              {[
                { icon: '', text: '1 BDT spent = 1 loyalty point earned' },
                { icon: '', text: 'Higher tiers earn bonus points (up to 1.5x)' },
                { icon: '', text: 'Redeem points for coupons & free shipping' },
                { icon: '', text: 'Write reviews to earn 25 bonus points' },
                { icon: '', text: 'Refer friends for 100 bonus points' },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-2 py-1">
                  <span className="text-base">{item.icon}</span>
                  <span className="text-sm text-muted-foreground">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* CTA */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="px-4 mt-6">
        <button onClick={() => goCategory()} className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-lg shadow-amber-500/20">
          Start Earning Points <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  )
}
