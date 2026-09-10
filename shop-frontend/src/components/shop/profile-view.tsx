'use client'

import { useEffect, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  User,
  ShoppingBag,
  Heart,
  Clock,
  Settings,
  HelpCircle,
  ChevronRight,
  Shield,
  Gift,
  Star,
  MapPin,
  Users,
  Bell,
  Wallet,
  CreditCard,
  Crown,
  Edit3,
  Lock,
  Mail,
  Package,
  Eye,
  TrendingUp,
  Award,
  Zap,
  Loader2,
  Brain,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import { toast } from 'sonner'

interface WalletData {
  balance: number
  currency: string
}

interface RewardsData {
  tier: string
  tierMultiplier: number
  rewardsPoints: number
  nextTierPoints: number | null
}

interface RecentOrder {
  id: string
  status: string
  total: number
  createdAt: string
  items: { productName: string }[]
}

const tierConfig: Record<string, { color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  Bronze: { color: 'text-amber-700', bg: 'bg-amber-700/10', icon: Award },
  Silver: { color: 'text-gray-400', bg: 'bg-gray-400/10', icon: Award },
  Gold: { color: 'text-amber-400', bg: 'bg-amber-400/10', icon: Crown },
  Platinum: { color: 'text-violet-400', bg: 'bg-violet-400/10', icon: Crown },
  Diamond: { color: 'text-cyan-400', bg: 'bg-cyan-400/10', icon: Zap },
}

const tierThresholds = [
  { name: 'Bronze', min: 0, max: 499 },
  { name: 'Silver', min: 500, max: 1999 },
  { name: 'Gold', min: 2000, max: 4999 },
  { name: 'Platinum', min: 5000, max: 9999 },
  { name: 'Diamond', min: 10000, max: Infinity },
]

export function ProfileView() {
  const { data: session, status } = useSession()
  const { getCartCount, wishlist, lastOrderId, rewardsPoints, recentlyViewed, cart } = useShopStore()
  const {
    goOrders,
    goWishlist,
    goRewards,
    goHome,
    goSettings,
    goContact,
    goBack,
    goCart,
    goAbout,
    goGiftCards,
    goReferrals,
    goPriceAlerts,
    goStores,
    goWallet,
    goNotifications,
    goProduct,
  } = useShopRouter()

  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [rewardsData, setRewardsData] = useState<RewardsData | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loadingWallet, setLoadingWallet] = useState(true)
  const [loadingRewards, setLoadingRewards] = useState(true)
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const userId = (session?.user as { id?: string })?.id
  const userEmail = session?.user?.email

  // Fetch wallet balance
  useEffect(() => {
    if (!userId) { setLoadingWallet(false); return }
    const fetchWallet = async () => {
      try {
        const res = await fetch(`/api/wallet?userId=${userId}`)
        if (res.ok) {
          const data = await res.json()
          setWalletData(data.data)
        }
      } catch {
        // Use fallback
      } finally {
        setLoadingWallet(false)
      }
    }
    fetchWallet()
  }, [userId])

  // Fetch rewards info
  useEffect(() => {
    if (!userId) { setLoadingRewards(false); return }
    const fetchRewards = async () => {
      try {
        const res = await fetch(`/api/rewards?userId=${userId}`)
        if (res.ok) {
          const data = await res.json()
          setRewardsData(data)
        }
      } catch {
        // Use fallback
      } finally {
        setLoadingRewards(false)
      }
    }
    fetchRewards()
  }, [userId])

  // Fetch recent orders
  useEffect(() => {
    if (!userEmail) { setLoadingOrders(false); return }
    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/orders?email=${encodeURIComponent(userEmail)}`)
        if (res.ok) {
          const data = await res.json()
          setRecentOrders(Array.isArray(data) ? data.slice(0, 3) : (data.data || []).slice(0, 3))
        }
      } catch {
        // Use fallback
      } finally {
        setLoadingOrders(false)
      }
    }
    fetchOrders()
  }, [userEmail])

  // Determine tier
  const currentTier = rewardsData?.tier || 'Bronze'
  const tierInfo = tierConfig[currentTier] || tierConfig.Bronze
  const TierIcon = tierInfo.icon

  // Calculate tier progress
  const currentTierThreshold = tierThresholds.find((t) => t.name === currentTier) || tierThresholds[0]
  const nextTierThreshold = tierThresholds.find((t) => t.name !== currentTier && t.min > currentTierThreshold.max)
  const pointsForNextTier = nextTierThreshold ? nextTierThreshold.min : null
  const tierProgress = pointsForNextTier
    ? ((rewardsPoints - currentTierThreshold.min) / (pointsForNextTier - currentTierThreshold.min)) * 100
    : 100

  const walletBalance = walletData?.balance || 0

  // Quick action grid
  const quickActions = [
    { icon: ShoppingBag, label: 'My Orders', count: recentOrders.length || null, action: () => goOrders(), color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { icon: Heart, label: 'Wishlist', count: wishlist.length, action: () => goWishlist(), color: 'text-rose-400', bg: 'bg-rose-400/10' },
    { icon: Star, label: 'Rewards', count: rewardsPoints, action: () => goRewards(), color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { icon: Wallet, label: 'Wallet', count: null, action: () => goWallet(), color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { icon: CreditCard, label: 'Gift Cards', count: null, action: () => goGiftCards(), color: 'text-pink-400', bg: 'bg-pink-400/10' },
    { icon: Users, label: 'Referrals', count: null, action: () => goReferrals(), color: 'text-sky-400', bg: 'bg-sky-400/10' },
  ]

  // Account settings links
  const accountLinks = [
    { icon: Edit3, label: 'Edit Profile', desc: 'Update your personal information', action: () => goSettings(), color: 'text-primary' },
    { icon: MapPin, label: 'Addresses', desc: 'Manage delivery addresses', action: () => goSettings(), color: 'text-emerald-400' },
    { icon: Bell, label: 'Notifications', desc: 'Manage notification preferences', action: () => goNotifications(), color: 'text-orange-400' },
    { icon: Lock, label: 'Security', desc: 'Password & two-factor auth', action: () => goSettings(), color: 'text-red-400' },
    { icon: HelpCircle, label: 'Help & Support', desc: 'FAQ, contact us', action: () => goContact(), color: 'text-violet-400' },
  ]

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-500/10 text-amber-500',
      processing: 'bg-blue-500/10 text-blue-400',
      shipped: 'bg-cyan-500/10 text-cyan-400',
      delivered: 'bg-emerald-500/10 text-emerald-400',
      completed: 'bg-emerald-500/10 text-emerald-400',
      cancelled: 'bg-red-500/10 text-red-400',
    }
    return colors[status?.toLowerCase()] || 'bg-muted text-muted-foreground'
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please enter email and password')
      return
    }

    setIsLoggingIn(true)
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Invalid email or password')
      } else {
        toast.success('Login successful!')
        window.location.reload()
      }
    } catch (error) {
      toast.error('Login failed. Please try again.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  // Not authenticated show login CTA with email/password + Grapsee SSO
  if (status !== 'loading' && !session) {
    const GRAPSEE_URL = process.env.NEXT_PUBLIC_GRAPSEE_URL || 'https://grapsee.com'
    return (
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center px-6 pb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 mb-4">
            <span className="text-4xl"></span>
          </div>
          <h2 className="text-xl font-bold text-foreground">Sign in to your account</h2>
          <p className="text-sm text-muted-foreground mt-2">Access your orders, wishlist, wallet and rewards</p>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailLogin} className="w-full max-w-xs space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder=""
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-14 text-base font-semibold bg-primary text-primary-foreground shadow-xl shadow-primary/25 rounded-2xl"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground mt-4 text-center">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={() => {
              const callbackUrl = encodeURIComponent(window.location.href)
              window.location.href = `${GRAPSEE_URL}/login?app=shop&callback=${callbackUrl}`
            }}
            className="text-primary font-medium hover:underline"
          >
            Create one on Grapsee
          </button>
        </p>

        {/* Divider */}
        <div className="relative w-full max-w-xs my-6">
          <Separator className="absolute inset-0 flex items-center" />
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        {/* Grapsee SSO */}
        <Button
          variant="outline"
          className="w-full max-w-xs h-14 text-base font-semibold gap-3 rounded-2xl border-2"
          onClick={() => {
            const callbackUrl = encodeURIComponent(window.location.href)
            window.location.href = `${GRAPSEE_URL}/login?app=shop&callback=${callbackUrl}`
          }}
          disabled={isLoggingIn}
        >
          <span className="text-xl"></span>
          Login with Grapsee
        </Button>
      </motion.div>
    )
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
          onClick={() => goBack()}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold text-foreground">My Account</h1>
      </div>

      {/* Profile Card with Tier */}
      <motion.div
        className="mb-4 rounded-2xl border border-border/50 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/10 text-3xl ring-2 ring-primary/20 ring-offset-2 ring-offset-background overflow-hidden">
              {session?.user?.image ? (
                <img src={session.user.image} alt="avatar" className="h-16 w-16 object-cover" />
              ) : (
                <span className="text-2xl font-bold text-primary">
                  {session?.user?.name?.charAt(0).toUpperCase() || ''}
                </span>
              )}
            </div>
            <div className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full ${tierInfo.bg} ring-2 ring-background`}>
              <TierIcon className={`h-3 w-3 ${tierInfo.color}`} />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">{session?.user?.name || 'Guest User'}</h2>
              <Badge className={`${tierInfo.bg} ${tierInfo.color} border-0 text-[9px] font-bold`}>
                {currentTier}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{session?.user?.email || 'Not signed in'}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Grapsee Member</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-1.5">
          <button className="flex flex-col items-center rounded-xl bg-background/50 p-2" onClick={() => goOrders()}>
            <ShoppingBag className="h-3.5 w-3.5 text-blue-400 mb-1" />
            <span className="text-sm font-bold text-foreground">{recentOrders.length}</span>
            <span className="text-[8px] text-muted-foreground">Orders</span>
          </button>
          <button className="flex flex-col items-center rounded-xl bg-background/50 p-2" onClick={() => goWishlist()}>
            <Heart className="h-3.5 w-3.5 text-rose-400 mb-1" />
            <span className="text-sm font-bold text-foreground">{wishlist.length}</span>
            <span className="text-[8px] text-muted-foreground">Wishlist</span>
          </button>
          <button className="flex flex-col items-center rounded-xl bg-background/50 p-2" onClick={() => goRewards()}>
            <Star className="h-3.5 w-3.5 text-amber-400 mb-1" />
            <span className="text-sm font-bold text-foreground">{rewardsPoints}</span>
            <span className="text-[8px] text-muted-foreground">Points</span>
          </button>
          <button className="flex flex-col items-center rounded-xl bg-background/50 p-2" onClick={() => goWallet()}>
            <Wallet className="h-3.5 w-3.5 text-emerald-400 mb-1" />
            {loadingWallet ? (
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            ) : (
              <span className="text-sm font-bold text-foreground">{formatPrice(walletBalance)}</span>
            )}
            <span className="text-[8px] text-muted-foreground">Wallet</span>
          </button>
        </div>
      </motion.div>

      {/* Loyalty Tier Progress */}
      <motion.div
        className="mb-4 rounded-2xl border border-border/50 bg-card p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TierIcon className={`h-4 w-4 ${tierInfo.color}`} />
            <span className="text-xs font-bold text-foreground">{currentTier} Member</span>
          </div>
          {pointsForNextTier ? (
            <span className="text-[10px] text-muted-foreground">
              {pointsForNextTier - rewardsPoints} pts to {tierThresholds.find((t) => t.min === pointsForNextTier)?.name}
            </span>
          ) : (
            <span className="text-[10px] text-primary font-semibold">Max Tier Reached!</span>
          )}
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${currentTier === 'Diamond' ? 'bg-gradient-to-r from-cyan-400 to-violet-400' : currentTier === 'Platinum' ? 'bg-violet-400' : currentTier === 'Gold' ? 'bg-amber-400' : currentTier === 'Silver' ? 'bg-gray-400' : 'bg-amber-700'}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(tierProgress, 100)}%` }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          {tierThresholds.slice(0, 5).map((tier) => (
            <div key={tier.name} className="flex flex-col items-center">
              <span className={`text-[8px] font-medium ${tier.name === currentTier ? tierInfo.color : 'text-muted-foreground'}`}>
                {tier.name}
              </span>
              <span className="text-[7px] text-muted-foreground">{tier.min}+</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick Action Grid */}
      <motion.section
        className="mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-2">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <motion.button
                key={action.label}
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-border/50 bg-card p-3 hover:border-primary/20 transition-all active:scale-[0.97]"
                onClick={action.action}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * index }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${action.bg}`}>
                  <Icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <span className="text-[10px] font-medium text-foreground">{action.label}</span>
                {action.count !== null && action.count > 0 && (
                  <Badge className="h-4 bg-primary/10 px-1.5 text-[8px] text-primary">{action.count}</Badge>
                )}
              </motion.button>
            )
          })}
        </div>
      </motion.section>

      <Separator className="my-4" />

      {/* Recent Orders Preview */}
      <section className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recent Orders</h3>
          <Button variant="ghost" size="sm" className="text-[10px] text-primary h-6 px-2" onClick={() => goOrders()}>
            View All <ChevronRight className="h-3 w-3 ml-0.5" />
          </Button>
        </div>
        {loadingOrders ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : recentOrders.length > 0 ? (
          <div className="space-y-2">
            {recentOrders.map((order, index) => (
              <motion.button
                key={order.id}
                className="flex w-full items-center gap-3 rounded-xl border border-border/50 bg-card p-3 text-left hover:border-primary/20 transition-colors"
                onClick={() => goOrders()}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">#{order.id.slice(0, 8)}</span>
                    <Badge className={`h-4 px-1.5 text-[8px] ${getStatusColor(order.status)}`}>
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">
                    {order.items?.[0]?.productName || 'Digital Service'}
                    {order.items?.length > 1 && ` +${order.items.length - 1} more`}
                  </p>
                </div>
                <span className="text-xs font-bold text-primary flex-shrink-0">
                  {formatPrice(order.total)}
                </span>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/50 bg-muted/20 p-6 text-center">
            <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No orders yet</p>
            <Button size="sm" className="mt-2 text-xs bg-primary text-primary-foreground" onClick={() => goHome()}>
              Start Shopping
            </Button>
          </div>
        )}
      </section>

      <Separator className="my-4" />

      {/* Recently Viewed Items */}
      {recentlyViewed.length > 0 && (
        <section className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recently Viewed</h3>
            <Button variant="ghost" size="sm" className="text-[10px] text-primary h-6 px-2" onClick={() => goHome()}>
              See All <ChevronRight className="h-3 w-3 ml-0.5" />
            </Button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {recentlyViewed.slice(0, 5).map((item, index) => (
              <motion.button
                key={item.productId}
                className="flex-shrink-0 w-28 text-center"
                onClick={() => goProduct(item.productId)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.04 * index }}
              >
                <div className="flex h-20 w-28 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 mb-1.5">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <Eye className="h-6 w-6 text-muted-foreground/30" />
                  )}
                </div>
                <p className="text-[10px] font-medium text-foreground line-clamp-1">{item.name}</p>
                <p className="text-[10px] font-bold text-primary">{formatPrice(item.price)}</p>
              </motion.button>
            ))}
          </div>
        </section>
      )}

      <Separator className="my-4" />

      {/* Revolutionary Features */}
      <section className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Revolutionary Features</h3>
          <Button variant="ghost" size="sm" className="text-[10px] text-primary h-6 px-2">
            Explore All <ChevronRight className="h-3 w-3 ml-0.5" />
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            className="flex items-center gap-2 rounded-xl border border-border/50 bg-card p-3 text-left hover:border-primary/20 transition-colors"
            onClick={() => window.location.href = '/revolutionary'}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground">Neural Interface</p>
              <p className="text-[8px] text-muted-foreground">Brain shopping</p>
            </div>
          </motion.button>
          <motion.button
            className="flex items-center gap-2 rounded-xl border border-border/50 bg-card p-3 text-left hover:border-primary/20 transition-colors"
            onClick={() => window.location.href = '/quantum'}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-teal-500">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground">Quantum Shop</p>
              <p className="text-[8px] text-muted-foreground">Future tech</p>
            </div>
          </motion.button>
        </div>
      </section>

      <Separator className="my-4" />

      {/* Account Settings */}
      <section className="mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Account Settings</h3>
        <div className="space-y-1">
          {accountLinks.map((link, index) => {
            const Icon = link.icon
            return (
              <motion.button
                key={link.label}
                className="flex w-full items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted/30 active:scale-[0.98]"
                onClick={link.action}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/50">
                  <Icon className={`h-4 w-4 ${link.color}`} />
                </div>
                <div className="flex-1 text-left">
                  <span className="text-sm font-medium text-foreground">{link.label}</span>
                  <p className="text-[10px] text-muted-foreground">{link.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </motion.button>
            )
          })}
        </div>
      </section>

      <Separator className="my-4" />

      {/* Additional Menu Items */}
      <section className="mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">More</h3>
        <div className="space-y-1">
          {[
            { icon: Clock, label: 'Recently Viewed', desc: `${recentlyViewed.length} items`, action: () => goHome(), color: 'text-cyan-400' },
            { icon: Bell, label: 'Price Alerts', desc: 'Get notified on price drops', action: () => goPriceAlerts(), color: 'text-orange-400' },
            { icon: MapPin, label: 'Stores', desc: 'Find nearby stores', action: () => goStores(), color: 'text-teal-400' },
            { icon: Settings, label: 'Settings', desc: 'App preferences, data', action: () => goSettings(), color: 'text-muted-foreground' },
          ].map((item, index) => {
            const Icon = item.icon
            return (
              <motion.button
                key={item.label}
                className="flex w-full items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted/30 active:scale-[0.98]"
                onClick={item.action}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/50">
                  <Icon className={`h-4 w-4 ${item.color}`} />
                </div>
                <div className="flex-1 text-left">
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                  <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </motion.button>
            )
          })}
        </div>
      </section>

      <Separator className="my-4" />

      {/* Version */}
      <p className="text-center text-[10px] text-muted-foreground pb-4">
        Grapsee Shop v1.0.0 - captainpiracy.shop
      </p>
    </motion.div>
  )
}

