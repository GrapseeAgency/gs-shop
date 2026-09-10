'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Gift, Sparkles, Share2, Clock, Trophy,
  Star, Truck, CreditCard, PartyPopper, RotateCcw,
  Ticket, Crown, Diamond, Coins,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { toast } from 'sonner'

type RewardType = 'points' | 'coupon' | 'free_shipping' | 'gift_card' | 'jackpot'

interface Reward {
  type: RewardType
  label: string
  value: number | string
  icon: React.ElementType
  color: string
}

interface RewardHistory {
  id: string
  type: RewardType
  label: string
  value: number | string
  claimedAt: string
}

const possibleRewards: Reward[] = [
  { type: 'points', label: '100 Points', value: 100, icon: Star, color: 'text-amber-500' },
  { type: 'points', label: '250 Points', value: 250, icon: Star, color: 'text-amber-500' },
  { type: 'points', label: '500 Points', value: 500, icon: Star, color: 'text-amber-500' },
  { type: 'coupon', label: '10% Off Coupon', value: '10%', icon: CreditCard, color: 'text-rose-500' },
  { type: 'coupon', label: '25% Off Coupon', value: '25%', icon: CreditCard, color: 'text-rose-500' },
  { type: 'free_shipping', label: 'Free Shipping', value: 'Free', icon: Truck, color: 'text-emerald-500' },
  { type: 'gift_card', label: '$5 Gift Card', value: 5, icon: Gift, color: 'text-violet-500' },
  { type: 'gift_card', label: '$10 Gift Card', value: 10, icon: Gift, color: 'text-violet-500' },
  { type: 'gift_card', label: '$20 Gift Card', value: 20, icon: Gift, color: 'text-violet-500' },
  { type: 'jackpot', label: 'JACKPOT! $50 Gift Card', value: 50, icon: PartyPopper, color: 'text-yellow-400' },
]



export function MysteryRewardPage() {
  const { goBack } = useShopRouter()
  const { mysteryRewardClaimed, setMysteryRewardClaimed, addRewardsPoints } = useShopStore()
  const [revealing, setRevealing] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [reward, setReward] = useState<Reward | null>(null)
  const [history, setHistory] = useState<RewardHistory[]>([])
  const [shaking, setShaking] = useState(false)
  const [scratchProgress, setScratchProgress] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/mystery')
        if (res.ok) {
          const data = await res.json()
          if (data.rewardHistory?.length) {
            setHistory(data.rewardHistory)
          }
          if (data.canClaim === false) {
            setMysteryRewardClaimed(true)
          }
        }
      } catch (error) {
        console.error('Failed to load mystery reward details:', error)
        setHistory([])
      }
    }
    fetchData()
  }, [setMysteryRewardClaimed])

  const revealReward = async () => {
    if (mysteryRewardClaimed || revealing) return
    setRevealing(true)
    setShaking(true)

    // Simulate scratch effect
    let progress = 0
    const scratchInterval = setInterval(() => {
      progress += 5
      setScratchProgress(progress)
      if (progress >= 100) clearInterval(scratchInterval)
    }, 40)

    try {
      const res = await fetch('/api/mystery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      if (res.ok) {
        const data = await res.json()
        await new Promise(resolve => setTimeout(resolve, 1500))
        setShaking(false)

        const selected = {
          type: data.reward.type as RewardType,
          label: data.reward.name,
          value: data.reward.value,
          icon: data.reward.type === 'points' ? Star : data.reward.type === 'coupon' ? Ticket : data.reward.type === 'free_shipping' ? Truck : data.reward.type === 'gift_card' ? CreditCard : Gift,
          color: data.reward.color || 'text-violet-500'
        }

        setReward(selected)
        setRevealed(true)
        setMysteryRewardClaimed(true)

        if (selected.type === 'points') {
          addRewardsPoints(Number(selected.value))
        }

        toast.success(data.message || `You won: ${selected.label}! `)
        
        // Refresh claim history list
        const historyRes = await fetch('/api/mystery?userId=user-1')
        if (historyRes.ok) {
          const historyData = await historyRes.json()
          if (historyData.rewardHistory?.length) {
            setHistory(historyData.rewardHistory)
          }
        }
      } else {
        const errData = await res.json()
        toast.error(errData.error || 'Failed to claim reward')
        setShaking(false)
      }
    } catch (error) {
      console.error('Error claiming reward:', error)
      toast.error('Network error claiming reward')
      setShaking(false)
    } finally {
      setRevealing(false)
    }
  }

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
              <Sparkles className="h-5 w-5 text-violet-500" /> Mystery Reward
            </h1>
          </div>
          <Badge className="bg-violet-500/10 text-violet-500 border border-violet-500/30 text-[10px]">
            Daily
          </Badge>
        </div>
      </div>

      {/* Mystery Box */}
      <div className="mx-4 mt-6 flex flex-col items-center">
        <motion.div
          className={`relative h-48 w-48 rounded-3xl border-2 ${revealed ? 'border-primary' : 'border-violet-500/30'} bg-gradient-to-br from-violet-500/10 to-purple-500/5 flex items-center justify-center overflow-hidden`}
          animate={shaking ? { x: [0, -8, 8, -6, 6, -4, 4, 0], rotate: [0, -3, 3, -2, 2, 0] } : {}}
          transition={shaking ? { duration: 0.5, repeat: Infinity } : {}}
        >
          {revealed && reward ? (
            <motion.div className="flex flex-col items-center" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200 }}>
              {(() => { const Icon = reward.icon; return <Icon className="h-16 w-16" />; })()}
              <p className={`text-sm font-bold ${reward.color}`}>{reward.label}</p>
            </motion.div>
          ) : (
            <motion.div className="flex flex-col items-center" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
              <Gift className="h-16 w-16 text-violet-500" />
              <p className="text-xs text-muted-foreground mt-2">Tap to reveal</p>
            </motion.div>
          )}

          {/* Scratch overlay */}
          {revealing && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-violet-500/60 to-purple-500/60"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 2 }}
            />
          )}
        </motion.div>

        {/* Progress bar for scratch */}
        {revealing && (
          <div className="w-48 mt-2">
            <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
              <motion.div className="h-full rounded-full bg-violet-500" animate={{ width: `${scratchProgress}%` }} transition={{ duration: 0.1 }} />
            </div>
            <p className="text-[9px] text-muted-foreground text-center mt-1">Scratching...</p>
          </div>
        )}

        {/* Reveal Button */}
        {!revealed && (
          <motion.div className="mt-4 w-full max-w-[260px]" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Button
              className={`w-full gap-2 text-base font-bold ${mysteryRewardClaimed ? 'bg-muted text-muted-foreground' : 'bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white'}`}
              disabled={mysteryRewardClaimed || revealing}
              onClick={revealReward}
            >
              {revealing ? (
                <><RotateCcw className="h-5 w-5 animate-spin" /> Revealing...</>
              ) : mysteryRewardClaimed ? (
                <><Clock className="h-5 w-5" /> Come Back Tomorrow</>
              ) : (
                <><Sparkles className="h-5 w-5" /> Reveal Your Reward</>
              )}
            </Button>
          </motion.div>
        )}

        {/* Share Button */}
        {revealed && reward && (
          <motion.div className="mt-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: 'Mystery Reward!', text: `I won ${reward.label} on Grapsee Shop! ` })
                } else {
                  navigator.clipboard.writeText(`I won ${reward.label} on Grapsee Shop! `)
                  toast.success('Copied to clipboard!')
                }
              }}
            >
              <Share2 className="h-3.5 w-3.5" /> Share Your Reward
            </Button>
          </motion.div>
        )}

        {/* Daily Limit Notice */}
        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>1 reward per day - Resets at midnight</span>
        </div>
      </div>

      {/* Possible Rewards */}
      <div className="mx-4 mt-6">
        <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
          <Trophy className="h-4 w-4 text-primary" /> Possible Rewards
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: Star, label: 'Points (100-500)', color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { icon: Ticket, label: 'Coupon (10-25%)', color: 'text-rose-500', bg: 'bg-rose-500/10' },
            { icon: Truck, label: 'Free Shipping', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { icon: CreditCard, label: 'Gift Card ($5-$20)', color: 'text-violet-500', bg: 'bg-violet-500/10' },
          ].map((item, i) => (
            <motion.div key={i} className={`flex items-center gap-2 rounded-xl border border-border/50 bg-card p-2.5`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className={`flex h-7 w-7 items-center justify-center rounded-full ${item.bg}`}>
                {(() => { const Icon = item.icon; return <Icon className="h-5 w-5" />; })()}
              </div>
              <span className={`text-[10px] font-medium ${item.color}`}>{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Reward History */}
      <div className="mx-4 mt-4">
        <h3 className="text-sm font-bold text-foreground mb-2">Reward History</h3>
        <div className="space-y-2">
          {history.map((item, i) => {
            const rewardDef = possibleRewards.find(r => r.label === item.label) || possibleRewards[0]
            return (
              <motion.div key={item.id} className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-primary/10`}>
                  {(() => {
                  const Icon = item.type === 'points' ? Star :
                    item.type === 'coupon' ? Ticket :
                    item.type === 'free_shipping' ? Truck :
                    item.type === 'gift_card' ? CreditCard : Gift;
                  return <Icon className="h-5 w-5 text-amber-500" />;
                })()}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground">{item.label}</p>
                  <p className="text-[9px] text-muted-foreground">{item.claimedAt}</p>
                </div>
                <Badge className="bg-primary/10 text-primary text-[9px]">{String(item.value)}</Badge>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

