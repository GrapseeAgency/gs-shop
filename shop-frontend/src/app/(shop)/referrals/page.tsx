'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  ArrowLeft, Users, Copy, Check, Share2, Gift, Award,
  Clock, CheckCircle2, Loader2, Send, Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'

interface ReferralData {
  id: string
  referrerCode: string
  referrerName: string
  referredEmail: string | null
  referredName: string | null
  status: string
  reward: number
  createdAt: string
  updatedAt: string
}

export default function ReferralsPage() {
  const { goBack } = useShopRouter()
  const { rewardsPoints } = useShopStore()
  const [referrals, setReferrals] = useState<ReferralData[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [referralName, setReferralName] = useState('')
  const [creating, setCreating] = useState(false)

  const myReferralCode = referrals.length > 0 ? referrals[0].referrerCode : 'GRAPSEE-DEMO'

  useEffect(() => {
    fetchReferrals()
  }, [])

  const fetchReferrals = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/referrals')
      if (res.ok) {
        const json = await res.json()
        setReferrals(json.data || [])
      }
    } catch {
      toast.error('Failed to load referrals')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateReferral = async () => {
    if (!referralName.trim()) {
      toast.error('Please enter your name')
      return
    }
    try {
      setCreating(true)
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referrerName: referralName.trim() }),
      })
      if (res.ok) {
        toast.success('Referral code created!')
        setReferralName('')
        fetchReferrals()
      } else {
        const json = await res.json()
        toast.error(json.error || 'Failed to create referral')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setCreating(false)
    }
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(myReferralCode)
      setCopied(true)
      toast.success('Referral code copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: 'Join Grapsee Shop!',
      text: `Use my referral code ${myReferralCode} to get 100 bonus points on Grapsee Shop! `,
      url: window.location.origin,
    }
    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`)
        toast.success('Share link copied to clipboard!')
      }
    } catch {
      // user cancelled share
    }
  }

  const totalReferrals = referrals.length
  const pendingCount = referrals.filter(r => r.status === 'pending').length
  const completedCount = referrals.filter(r => r.status === 'completed').length
  const rewardedCount = referrals.filter(r => r.status === 'rewarded').length
  const totalRewards = referrals.reduce((acc, r) => r.status === 'rewarded' ? acc + r.reward : acc, 0)

  const stats = [
    { label: 'Total', value: totalReferrals, icon: Users, color: 'text-primary' },
    { label: 'Pending', value: pendingCount, icon: Clock, color: 'text-amber-400' },
    { label: 'Completed', value: completedCount, icon: CheckCircle2, color: 'text-emerald-400' },
    { label: 'Rewards', value: `${totalRewards}pts`, icon: Gift, color: 'text-violet-400' },
  ]

  const steps = [
    { step: 1, title: 'Share Your Code', desc: 'Send your unique referral code to friends', icon: Share2, color: 'from-emerald-500/15 to-emerald-700/5' },
    { step: 2, title: 'Friend Signs Up', desc: 'They use your code when joining Grapsee Shop', icon: Users, color: 'from-amber-500/15 to-amber-700/5' },
    { step: 3, title: 'You Both Earn 100 Points', desc: 'Both of you get 100 bonus rewards points', icon: Award, color: 'from-violet-500/15 to-violet-700/5' },
  ]

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-500',
    completed: 'bg-emerald-500/10 text-emerald-400',
    rewarded: 'bg-violet-500/10 text-violet-400',
  }

  return (
    <motion.div
      className="px-4 py-2 pb-8"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={goBack}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-violet-400" />
            Referral Program
          </h1>
          <p className="text-xs text-muted-foreground">Invite friends, earn rewards</p>
        </div>
      </div>

      {/* Referral Code Card */}
      <motion.div
        className="mb-4 rounded-2xl bg-gradient-to-br from-violet-500/15 via-purple-500/10 to-fuchsia-500/5 border border-violet-500/20 p-5 relative overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-violet-500/10 blur-2xl" />
        <div className="absolute -left-4 -bottom-4 h-20 w-20 rounded-full bg-purple-500/10 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-violet-400" />
            <h2 className="text-base font-bold text-foreground">Your Referral Code</h2>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-background/50 border border-border/30 p-3 mb-3">
            <code className="flex-1 text-lg font-mono font-bold text-violet-400 tracking-wider">{myReferralCode}</code>
            <button
              onClick={copyCode}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition-colors"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={copyCode}
              className="flex-1 h-10 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold shadow-lg shadow-violet-500/20"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Code
            </Button>
            <Button
              onClick={handleShare}
              className="flex-1 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/20"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              className="flex flex-col items-center rounded-xl border border-border/50 bg-card p-2.5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.05 }}
            >
              <Icon className={`h-4 w-4 ${stat.color} mb-1`} />
              <p className="text-sm font-bold text-foreground">{stat.value}</p>
              <p className="text-[9px] text-muted-foreground">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>

      {/* How It Works */}
      <section className="mb-4">
        <h3 className="mb-2 text-sm font-bold text-foreground">How It Works</h3>
        <div className="space-y-2">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.step}
                className={`flex items-center gap-3 rounded-xl bg-gradient-to-r ${step.color} border border-border/50 p-3`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.08 }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-sm font-bold text-foreground">
                  {step.step}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{step.title}</p>
                  <p className="text-[10px] text-muted-foreground">{step.desc}</p>
                </div>
                <Icon className="h-5 w-5 text-muted-foreground" />
              </motion.div>
            )
          })}
        </div>
      </section>

      <Separator className="my-4" />

      {/* Referral History */}
      <section className="mb-4">
        <h3 className="mb-3 text-sm font-bold text-foreground flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-400" />
          Referral History
          {referrals.length > 0 && (
            <Badge variant="secondary" className="text-[10px]">{referrals.length}</Badge>
          )}
        </h3>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : referrals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Users className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No referrals yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Share your code to start earning rewards</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {referrals.map((ref, idx) => (
              <motion.div
                key={ref.id}
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/50">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{ref.referredName || ref.referrerName}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{ref.referrerCode}</p>
                </div>
                <Badge className={`${statusColors[ref.status] || 'bg-muted text-muted-foreground'} text-[10px]`}>
                  {ref.status}
                </Badge>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <Separator className="my-4" />

      {/* Create New Referral */}
      <section className="mb-4">
        <h3 className="mb-3 text-sm font-bold text-foreground flex items-center gap-2">
          <Send className="h-4 w-4 text-emerald-400" />
          Generate New Code
        </h3>
        <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Your Name</label>
            <Input
              placeholder="Enter your name"
              value={referralName}
              onChange={(e) => setReferralName(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>
          <Button
            className="w-full h-11 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold shadow-lg shadow-violet-500/20"
            onClick={handleCreateReferral}
            disabled={creating || !referralName.trim()}
          >
            {creating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Gift className="mr-2 h-4 w-4" />
            )}
            {creating ? 'Creating...' : 'Generate Referral Code'}
          </Button>
        </div>
      </section>
    </motion.div>
  )
}
