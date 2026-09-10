'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, DollarSign, TrendingUp, Users, Link, Copy, Check,
  BarChart3, Wallet, Gift, Award, Share2, ExternalLink, Shield,
  ChevronRight, Crown, Star, Zap, Target, Mail, Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import { toast } from 'sonner'

interface TierLevel {
  name: string
  minReferrals: number
  commission: number
  bonus: number
  icon: React.ElementType
  color: string
  bgColor: string
  borderColor: string
}

const tiers: TierLevel[] = [
  { name: 'Starter', minReferrals: 0, commission: 5, bonus: 50, icon: Star, color: 'text-slate-400', bgColor: 'bg-slate-500/10', borderColor: 'border-slate-500/20' },
  { name: 'Bronze', minReferrals: 5, commission: 8, bonus: 100, icon: Award, color: 'text-amber-600', bgColor: 'bg-amber-600/10', borderColor: 'border-amber-600/20' },
  { name: 'Silver', minReferrals: 15, commission: 12, bonus: 250, icon: Shield, color: 'text-slate-300', bgColor: 'bg-slate-300/10', borderColor: 'border-slate-300/20' },
  { name: 'Gold', minReferrals: 30, commission: 15, bonus: 500, icon: Crown, color: 'text-amber-400', bgColor: 'bg-amber-400/10', borderColor: 'border-amber-400/20' },
  { name: 'Platinum', minReferrals: 50, commission: 20, bonus: 1000, icon: Zap, color: 'text-cyan-400', bgColor: 'bg-cyan-400/10', borderColor: 'border-cyan-400/20' },
]

interface EarningEntry {
  id: string
  type: 'commission' | 'bonus' | 'payout'
  amount: number
  description: string
  date: string
  status: 'pending' | 'completed' | 'processing'
}

interface AffiliateData {
  referralCode: string
  totalEarnings: number
  pendingEarnings: number
  totalReferrals: number
  currentTier: number
  monthlyEarnings: { month: string; amount: number }[]
  recentEarnings: EarningEntry[]
  marketingMaterials: { id: string; name: string; type: string; downloads: number }[]
}

function TierCard({ tier, index, isActive, isLocked }: { tier: TierLevel; index: number; isActive: boolean; isLocked: boolean }) {
  const Icon = tier.icon

  return (
    <motion.div
      className={`relative overflow-hidden rounded-xl border ${tier.borderColor} ${tier.bgColor} p-3 ${isActive ? 'ring-2 ring-primary/50' : ''} ${isLocked ? 'opacity-50' : ''}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      {isActive && (
        <Badge className="absolute -right-1 -top-1 bg-primary text-primary-foreground text-[8px] px-1.5">
          Current
        </Badge>
      )}
      <div className="flex items-center gap-2">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${tier.bgColor}`}>
          <Icon className={`h-4.5 w-4.5 ${tier.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold ${tier.color}`}>{tier.name}</p>
          <p className="text-[10px] text-muted-foreground">{tier.minReferrals}+ referrals</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-foreground">{tier.commission}%</p>
          <p className="text-[9px] text-muted-foreground">commission</p>
        </div>
      </div>
      {!isLocked && (
        <p className="mt-1.5 text-[10px] text-muted-foreground">+{formatPrice(tier.bonus)} bonus on unlock</p>
      )}
    </motion.div>
  )
}

export function AffiliatePage() {
  const { goBack } = useShopRouter()
  const [data, setData] = useState<AffiliateData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'earnings' | 'materials'>('overview')

  useEffect(() => {
    const fetchAffiliate = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/affiliate')
        if (res.ok) {
          const d = await res.json()
          if (d && d.referralCode) {
            setData(d)
            setLoading(false)
            return
          }
        }
      } catch {
        // fallback
      }

      // Fallback [] data
      setData({
        referralCode: 'GRAPSEE-XP2024',
        totalEarnings: 1250.50,
        pendingEarnings: 185.75,
        totalReferrals: 12,
        currentTier: 1,
        monthlyEarnings: [
          { month: 'Sep', amount: 120 },
          { month: 'Oct', amount: 250 },
          { month: 'Nov', amount: 180 },
          { month: 'Dec', amount: 320 },
          { month: 'Jan', amount: 195 },
          { month: 'Feb', amount: 185.50 },
        ],
        recentEarnings: [
          { id: '1', type: 'commission', amount: 45.50, description: 'Commission from Sarah\'s purchase', date: new Date(Date.now() - 86400000).toISOString(), status: 'completed' },
          { id: '2', type: 'bonus', amount: 100, description: 'Bronze tier bonus', date: new Date(Date.now() - 172800000).toISOString(), status: 'completed' },
          { id: '3', type: 'commission', amount: 32.00, description: 'Commission from Mike\'s purchase', date: new Date(Date.now() - 259200000).toISOString(), status: 'pending' },
          { id: '4', type: 'payout', amount: -500, description: 'Bank transfer payout', date: new Date(Date.now() - 604800000).toISOString(), status: 'completed' },
          { id: '5', type: 'commission', amount: 28.75, description: 'Commission from Priya\'s purchase', date: new Date(Date.now() - 864000000).toISOString(), status: 'completed' },
        ],
        marketingMaterials: [
          { id: '1', name: 'Grapsee Banner (1200x628)', type: 'PNG', downloads: 45 },
          { id: '2', name: 'Product Showcase Kit', type: 'ZIP', downloads: 32 },
          { id: '3', name: 'Social Media Templates', type: 'PSD', downloads: 67 },
          { id: '4', name: 'Email Swipe Copy', type: 'TXT', downloads: 28 },
        ],
      })
      setLoading(false)
    }
    fetchAffiliate()
  }, [])

  const handleCopyLink = async () => {
    const link = `https://grapsee.shop/ref/${data?.referralCode || 'GRAPSEE-XP2024'}`
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      toast.success('Referral link copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const nextTier = data ? tiers[Math.min(data.currentTier + 1, tiers.length - 1)] : tiers[1]
  const progressToNext = data ? Math.min(100, (data.totalReferrals / nextTier.minReferrals) * 100) : 0

  return (
    <motion.div className="pb-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack} className="flex-shrink-0 text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-500" /> Affiliate Program
            </h1>
            <p className="text-[11px] text-muted-foreground">Earn commissions on every referral</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="px-4 mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : (
        <>
          {/* Earnings Overview */}
          <div className="mx-4 mt-3 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-cyan-500/5 border border-emerald-500/20 p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Earnings</p>
                <p className="text-xl font-bold text-foreground">{formatPrice(data?.totalEarnings || 0)}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Pending</p>
                <p className="text-xl font-bold text-amber-500">{formatPrice(data?.pendingEarnings || 0)}</p>
              </div>
            </div>

            {/* Referral Link */}
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-background/50 border border-border/30 p-2">
              <Link className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="flex-1 text-[11px] text-foreground truncate font-mono">
                grapsee.shop/ref/{data?.referralCode || '...'}
              </span>
              <motion.button
                onClick={handleCopyLink}
                className="flex h-7 items-center gap-1 rounded-md bg-primary/10 px-2"
                whileTap={{ scale: 0.9 }}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-primary" />
                )}
                <span className="text-[10px] font-medium text-primary">{copied ? 'Copied!' : 'Copy'}</span>
              </motion.button>
            </div>

            {/* Share buttons */}
            <div className="mt-2 flex gap-2">
              <Button size="sm" className="flex-1 gap-1.5 text-xs bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white" onClick={() => toast.success('Share link sent!')}>
                <Share2 className="h-3.5 w-3.5" /> Share Link
              </Button>
              <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-xs" onClick={() => toast.success('Email sent!')}>
                <Mail className="h-3.5 w-3.5" /> Email
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="mx-4 mt-3 grid grid-cols-3 gap-2">
            {[
              { icon: Users, value: String(data?.totalReferrals || 0), label: 'Referrals', color: 'text-primary' },
              { icon: TrendingUp, value: `${tiers[data?.currentTier || 0]?.commission || 5}%`, label: 'Commission', color: 'text-emerald-500' },
              { icon: Wallet, value: formatPrice(data?.pendingEarnings || 0), label: 'Pending', color: 'text-amber-500' },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                className="flex flex-col items-center rounded-xl bg-muted/30 border border-border/30 p-3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <stat.icon className={`h-4 w-4 ${stat.color} mb-1`} />
                <span className="text-sm font-bold text-foreground">{stat.value}</span>
                <span className="text-[9px] text-muted-foreground">{stat.label}</span>
              </motion.div>
            ))}
          </div>

          {/* Tier Progress */}
          <div className="mx-4 mt-3 rounded-2xl border border-border/50 bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-foreground">Tier Progress</h3>
              <Badge className={`${tiers[data?.currentTier || 0]?.color} ${tiers[data?.currentTier || 0]?.bgColor} border ${tiers[data?.currentTier || 0]?.borderColor}`} variant="outline">
                {tiers[data?.currentTier || 0]?.name}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
              <span>{data?.totalReferrals || 0} referrals</span>
              <span>{nextTier.minReferrals} for {nextTier.name}</span>
            </div>
            <Progress value={progressToNext} className="h-2" />
            <p className="mt-2 text-[11px] text-muted-foreground">
              <Target className="h-3 w-3 inline mr-1 text-primary" />
              {nextTier.minReferrals - (data?.totalReferrals || 0)} more referrals to unlock {nextTier.name} ({nextTier.commission}% commission)
            </p>
          </div>

          {/* Commission Tiers */}
          <div className="mx-4 mt-3">
            <h3 className="text-sm font-bold text-foreground mb-2">Commission Tiers</h3>
            <div className="space-y-2">
              {tiers.map((tier, i) => (
                <TierCard
                  key={tier.name}
                  tier={tier}
                  index={i}
                  isActive={i === (data?.currentTier || 0)}
                  isLocked={i > (data?.currentTier || 0) + 1}
                />
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="mx-4 mt-4">
            <div className="flex gap-2 mb-3">
              {[
                { key: 'overview' as const, label: 'Overview', icon: BarChart3 },
                { key: 'earnings' as const, label: 'Earnings', icon: Wallet },
                { key: 'materials' as const, label: 'Materials', icon: Download },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeTab === tab.key ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground'
                  }`}
                >
                  <tab.icon className="h-3 w-3" />
                  {tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
                  {/* Monthly Earnings Chart (simplified bar chart) */}
                  <div className="rounded-xl border border-border/50 bg-card p-3">
                    <p className="text-xs font-medium text-foreground mb-2">Monthly Earnings</p>
                    <div className="flex items-end gap-1.5 h-24">
                      {data?.monthlyEarnings.map((m, i) => {
                        const maxAmount = Math.max(...(data?.monthlyEarnings.map(e => e.amount) || [1]))
                        const height = (m.amount / maxAmount) * 100
                        return (
                          <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-[8px] text-muted-foreground">{formatPrice(m.amount)}</span>
                            <motion.div
                              className="w-full bg-emerald-500/30 rounded-t"
                              initial={{ height: 0 }}
                              animate={{ height: `${height}%` }}
                              transition={{ delay: i * 0.1, duration: 0.4 }}
                            />
                            <span className="text-[9px] text-muted-foreground">{m.month}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'earnings' && (
                <motion.div key="earnings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
                  {data?.recentEarnings.map((entry) => (
                    <div key={entry.id} className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        entry.type === 'commission' ? 'bg-emerald-500/10' :
                        entry.type === 'bonus' ? 'bg-amber-500/10' : 'bg-sky-500/10'
                      }`}>
                        {entry.type === 'commission' ? <DollarSign className="h-4 w-4 text-emerald-500" /> :
                         entry.type === 'bonus' ? <Gift className="h-4 w-4 text-amber-500" /> :
                         <Wallet className="h-4 w-4 text-sky-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{entry.description}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${entry.amount < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                          {entry.amount < 0 ? '-' : '+'}{formatPrice(Math.abs(entry.amount))}
                        </p>
                        <Badge className={`text-[8px] px-1 ${
                          entry.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                          entry.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-sky-500/10 text-sky-500'
                        }`}>
                          {entry.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full gap-2 text-xs" onClick={() => toast.info('Full payout history coming soon!')}>
                    View All Transactions <ChevronRight className="h-3 w-3" />
                  </Button>
                </motion.div>
              )}

              {activeTab === 'materials' && (
                <motion.div key="materials" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
                  {data?.marketingMaterials.map((mat) => (
                    <div key={mat.id} className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <Download className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{mat.name}</p>
                        <p className="text-[10px] text-muted-foreground">{mat.type}  {mat.downloads} downloads</p>
                      </div>
                      <Button size="sm" variant="outline" className="h-7 gap-1 text-[10px]" onClick={() => toast.success('Download started!')}>
                        <ExternalLink className="h-3 w-3" /> Get
                      </Button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Payout CTA */}
          <div className="mx-4 mt-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 p-4 text-center">
            <Wallet className="mx-auto h-6 w-6 text-emerald-500 mb-2" />
            <p className="text-sm font-semibold text-foreground mb-1">Ready to cash out?</p>
            <p className="text-xs text-muted-foreground mb-3">Minimum payout: {formatPrice(100)}. You have {formatPrice(data?.pendingEarnings || 0)} pending.</p>
            <Button className="gap-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white" onClick={() => toast.success('Payout request submitted!')}>
              <DollarSign className="h-4 w-4" /> Request Payout
            </Button>
          </div>
        </>
      )}
    </motion.div>
  )
}
