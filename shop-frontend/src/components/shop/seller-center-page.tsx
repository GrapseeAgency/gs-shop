'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Store, TrendingUp, Star, Package, DollarSign,
  ShoppingBag, BarChart3, Award, ChevronRight, Users,
  Plus, Eye, Edit3, ArrowUpRight, Crown, Shield, Gem,
  BadgeCheck, Upload,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import { toast } from 'sonner'

interface SellerData {
  sellerId: string
  storeName: string
  slug: string
  logo?: string
  isVerified: boolean
  onboardingStatus: string
  stats: {
    totalSales: number
    totalRevenue: number
    totalUnits: number
    rating: number
    activeProducts: number
    lowStockCount: number
    outOfStockCount: number
    pendingOrders: number
    views: number
    revenueGrowth: number
    monthlyRevenue: { month: string; revenue: number }[]
  }
  recentOrders: {
    id: string
    customer: string
    email?: string
    total: number
    status: string
    items: number
    date: string
    product?: string
    amount?: number
  }[]
  topProducts: {
    id: string
    name: string
    sales: number
    revenue: number
  }[]
  lowStockProducts: {
    id: string
    name: string
    stock: number
    imageUrl?: string
  }[]
  settings?: {
    storeDescription?: string
    defaultShippingDays?: number
    vacationMode?: boolean
  }
  commissionRate: number
  payoutBalance: number
  totalEarnings: number
  tier?: string
  tiers?: { name: string; minSales: number; commission: number; color: string }[]
  products?: {
    id: string
    name: string
    status: string
    price: number
    sales: number
    rating: number
  }[]
}

const tierIcons: Record<string, typeof Crown> = {
  Starter: Shield,
  Silver: Award,
  Gold: Crown,
  Platinum: Gem,
}

const statusColors: Record<string, string> = {
  completed: 'bg-emerald-500/10 text-emerald-500',
  processing: 'bg-sky-500/10 text-sky-500',
  shipped: 'bg-violet-500/10 text-violet-500',
  pending: 'bg-amber-500/10 text-amber-500',
  active: 'bg-emerald-500/10 text-emerald-500',
  draft: 'bg-muted/50 text-muted-foreground',
}

export function SellerCenterPage() {
  const { goBack } = useShopRouter()
  const [data, setData] = useState<SellerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showApply, setShowApply] = useState(false)
  const [storeName, setStoreName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    const fetchSellerData = async () => {
      setLoading(true)
      try {
        // First check onboarding status
        const onboardingRes = await fetch('/api/seller/onboarding')
        if (onboardingRes.ok) {
          const onboardingData = await onboardingRes.json()
          
          // If not onboarded, show onboarding flow
          if (!onboardingData.isOnboarded && onboardingData.progress < 100) {
            setData(null)
            setShowApply(true)
            setLoading(false)
            return
          }
        }

        // Fetch real dashboard data
        const res = await fetch('/api/seller/dashboard')
        if (res.ok) {
          const result = await res.json()
          setData(result)
        } else if (res.status === 404) {
          // Seller not found, show onboarding
          setShowApply(true)
        }
      } catch (error) {
        console.error('Error fetching seller data:', error)
        toast.error('Failed to load seller dashboard')
      }
      setLoading(false)
    }
    fetchSellerData()
  }, [])

  const handleApply = async () => {
    if (!storeName || !email) {
      toast.error('Please fill in all fields')
      return
    }
    try {
      // Create seller via onboarding API
      const res = await fetch('/api/seller/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: 'personal',
          data: {
            businessName: storeName,
            phone: '',
            website: '',
          },
        }),
      })
      if (res.ok) {
        toast.success('Seller profile created!', { description: 'Continue with onboarding to start selling.' })
        // Refresh to show onboarding or dashboard
        window.location.reload()
      }
    } catch {
      toast.error('Failed to create seller profile')
    }
  }

  if (loading) {
    return (
      <motion.div className="min-h-screen bg-background" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/30 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-muted animate-pulse" />
            <div className="h-5 w-32 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <div className="px-4 py-4 space-y-4">
          <div className="h-32 rounded-2xl bg-muted animate-pulse" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}
          </div>
        </div>
      </motion.div>
    )
  }

  // Show "Become a Seller" CTA if no data
  if (!data) {
    return (
      <motion.div className="min-h-screen bg-background" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
        <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/30 px-4 py-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={goBack} className="flex-shrink-0 text-muted-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Store className="h-5 w-5 text-amber-500" /> Seller Center
            </h1>
          </div>
        </div>

        <div className="px-4 py-8 flex flex-col items-center text-center">
          <motion.div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10" animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
            <Store className="h-10 w-10 text-amber-500" />
          </motion.div>
          <h2 className="mt-4 text-xl font-bold text-foreground">Become a Seller</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-[280px]">Start selling on Grapsee Shop and reach thousands of customers. Commission as low as 6%!</p>

          <div className="mt-6 grid grid-cols-3 gap-2 w-full">
            {[
              { icon: DollarSign, label: 'Low Commission', color: 'emerald' },
              { icon: Users, label: 'Wide Audience', color: 'sky' },
              { icon: BarChart3, label: 'Analytics', color: 'violet' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center rounded-xl border border-border/50 bg-card p-3">
                <item.icon className={`h-5 w-5 text-${item.color}-500 mb-1`} />
                <span className="text-[10px] text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>

          <AnimatePresence>
            {showApply ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-6 w-full space-y-3"
              >
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Store Name"
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowApply(false)} className="flex-1">Cancel</Button>
                  <Button onClick={handleApply} className="flex-1 gap-2 bg-amber-500 hover:bg-amber-600 text-white">
                    <Upload className="h-4 w-4" /> Submit
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 w-full">
                <Button onClick={() => setShowApply(true)} className="w-full gap-2 bg-amber-500 hover:bg-amber-600 text-white">
                  <Store className="h-4 w-4" /> Apply Now
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    )
  }

  // Show seller dashboard
  const currentTier = data.tiers?.find(t => t.name.toLowerCase() === data.tier) || data.tiers?.[2] || { name: 'Starter', commission: 6, minSales: 0, color: '' }
  const TierIcon = tierIcons[currentTier?.name] || Shield

  return (
    <motion.div className="min-h-screen bg-background pb-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack} className="flex-shrink-0 text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Store className="h-5 w-5 text-amber-500" /> Seller Center
            </h1>
          </div>
          <Badge className="bg-amber-500/10 text-amber-500 text-[10px]">
            <TierIcon className="mr-0.5 h-3 w-3" />{currentTier.name}
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-4 mt-3 grid grid-cols-2 gap-2">
        {[
          { icon: ShoppingBag, label: 'Total Sales', value: (data.stats?.totalSales ?? 0).toLocaleString(), color: 'sky' },
          { icon: DollarSign, label: 'Revenue', value: formatPrice(data.stats?.totalRevenue ?? 0), color: 'emerald' },
          { icon: Star, label: 'Rating', value: (data.stats?.rating ?? 0).toString(), color: 'amber' },
          { icon: Package, label: 'Products', value: (data.stats?.activeProducts ?? 0).toString(), color: 'violet' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            className="rounded-xl border border-border/50 bg-card p-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <div className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-${stat.color}-500/10`}>
                <stat.icon className={`h-4 w-4 text-${stat.color}-500`} />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                <p className="text-sm font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="px-4 mt-4">
        <div className="rounded-xl border border-border/50 bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-emerald-500" /> Revenue
            </h3>
            <Badge variant="outline" className="text-[9px]">
              <ArrowUpRight className="mr-0.5 h-3 w-3 text-emerald-500" />+12%
            </Badge>
          </div>
          {/* Simple bar chart */}
          <div className="flex items-end gap-1.5 h-24">
            {(data.stats?.monthlyRevenue || []).map((m, i) => {
              const maxRevenue = Math.max(...(data.stats?.monthlyRevenue || []).map(r => r.revenue))
              const height = (m.revenue / maxRevenue) * 100
              return (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <motion.div
                    className="w-full rounded-t bg-gradient-to-t from-emerald-500 to-emerald-400"
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                  />
                  <span className="text-[8px] text-muted-foreground mt-1">{m.month}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Seller Tiers */}
      <div className="px-4 mt-4">
        <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
          <Award className="h-4 w-4 text-amber-500" /> Seller Tiers
        </h3>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {(data.tiers || []).map((tier, i) => {
            const TierI = tierIcons[tier.name] || Shield
            const isCurrent = tier.name.toLowerCase() === data.tier
            return (
              <motion.div
                key={i}
                className={`flex-shrink-0 rounded-xl border p-3 min-w-[120px] ${isCurrent ? 'border-amber-500 bg-amber-500/5' : 'border-border/50 bg-card'}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <TierI className={`h-4 w-4 ${isCurrent ? 'text-amber-500' : 'text-muted-foreground'}`} />
                  <span className={`text-xs font-bold ${isCurrent ? 'text-amber-500' : 'text-foreground'}`}>{tier.name}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{tier.minSales}+ sales</p>
                <p className="text-sm font-bold text-foreground mt-1">{tier.commission}% commission</p>
                {isCurrent && <Badge className="mt-1 bg-amber-500/10 text-amber-500 text-[9px]">Current</Badge>}
              </motion.div>
            )
          })}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">Commission rate: <span className="text-amber-500 font-medium">{data.commissionRate ?? 6}%</span></p>
      </div>

      {/* Recent Orders */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <ShoppingBag className="h-4 w-4 text-sky-500" /> Recent Orders
          </h3>
          <span className="text-[11px] text-muted-foreground">{data.stats?.pendingOrders || 0} pending</span>
        </div>
        <div className="space-y-2">
          {(data.recentOrders || []).map((order, i) => (
            <motion.div
              key={order.id}
              className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{order.product}</p>
                <p className="text-[10px] text-muted-foreground">{order.customer}  {order.date}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-foreground">{formatPrice(order.amount ?? order.total)}</p>
                <Badge className={`text-[9px] ${statusColors[order.status] || 'bg-muted/50 text-muted-foreground'}`}>
                  {order.status}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Product Management */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Package className="h-4 w-4 text-violet-500" /> Products
          </h3>
          <Button size="sm" className="gap-1 text-[11px] bg-violet-500/10 text-violet-500 hover:bg-violet-500/20 h-7">
            <Plus className="h-3 w-3" /> Add Product
          </Button>
        </div>
        <div className="space-y-2">
          {(data.products || []).map((product, i) => (
            <motion.div
              key={product.id}
              className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-medium text-foreground truncate">{product.name}</p>
                  <Badge className={`text-[9px] ${statusColors[product.status] || ''}`}>{product.status}</Badge>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-primary font-medium">{formatPrice(product.price)}</span>
                  <span className="text-[10px] text-muted-foreground">{product.sales} sold</span>
                  <span className="text-[10px] text-amber-500 flex items-center gap-0.5">
                    <Star className="h-2.5 w-2.5 fill-amber-400" />{product.rating}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7"><Edit3 className="h-3.5 w-3.5 text-muted-foreground" /></Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

