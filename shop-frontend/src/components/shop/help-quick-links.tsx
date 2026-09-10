'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Truck, RotateCcw, Package, HeadphonesIcon, HelpCircle, ArrowRight, ShoppingCart, Heart, Bell, Star, Wallet, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useShopRouter } from '@/hooks/use-shop-router'
import { useSession } from 'next-auth/react'

interface QuickLink {
  icon: React.ElementType
  label: string
  description: string
  color: string
  gradientFrom: string
  gradientTo: string
  action: string
  badge?: number | null
}

interface UserStats {
  cartItems: number
  wishlistCount: number
  unreadNotifications: number
  rewardsPoints: number
  walletBalance: number
  activeOrders: number
}

export function HelpQuickLinks() {
  const { data: session } = useSession()
  const { goOrders, goReturns, goHelp, goContact, goCart, goWishlist, goNotifications, goRewards } = useShopRouter()
  const [stats, setStats] = useState<UserStats>({
    cartItems: 0,
    wishlistCount: 0,
    unreadNotifications: 0,
    rewardsPoints: 0,
    walletBalance: 0,
    activeOrders: 0
  })
  const [loading, setLoading] = useState(true)

  // Fetch user stats
  useEffect(() => {
    const fetchStats = async () => {
      const userId = (session?.user as { id?: string } | undefined)?.id
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        const [cartRes, wishlistRes, notifRes, rewardsRes] = await Promise.all([
          fetch('/api/cart').catch(() => null),
          fetch('/api/wishlist').catch(() => null),
          fetch('/api/notifications/unread').catch(() => null),
          fetch('/api/rewards').catch(() => null)
        ])

        const cartData = cartRes?.ok ? await cartRes.json() : { items: [] }
        const wishlistData = wishlistRes?.ok ? await wishlistRes.json() : { items: [] }
        const notifData = notifRes?.ok ? await notifRes.json() : { count: 0 }
        const rewardsData = rewardsRes?.ok ? await rewardsRes.json() : { points: 0, wallet: { balance: 0 } }

        setStats({
          cartItems: cartData.items?.length || 0,
          wishlistCount: wishlistData.items?.length || 0,
          unreadNotifications: notifData.count || 0,
          rewardsPoints: rewardsData.points || 0,
          walletBalance: rewardsData.wallet?.balance || 0,
          activeOrders: 0 // Would need orders API
        })
      } catch {
        // Silent fail
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [session])

  // Personalized quick links based on user state
  const getQuickLinks = (): QuickLink[] => {
    const baseLinks: QuickLink[] = [
      {
        icon: Package,
        label: 'Track Order',
        description: 'Check delivery updates',
        color: 'text-sky-600 dark:text-sky-400',
        gradientFrom: 'from-sky-500/15',
        gradientTo: 'to-blue-500/10',
        action: 'goOrders',
        badge: stats.activeOrders > 0 ? stats.activeOrders : null
      },
      {
        icon: ShoppingCart,
        label: 'Cart',
        description: `${stats.cartItems} items waiting`,
        color: 'text-orange-600 dark:text-orange-400',
        gradientFrom: 'from-orange-500/15',
        gradientTo: 'to-amber-500/10',
        action: 'goCart',
        badge: stats.cartItems > 0 ? stats.cartItems : null
      },
      {
        icon: Heart,
        label: 'Wishlist',
        description: `${stats.wishlistCount} saved items`,
        color: 'text-rose-600 dark:text-rose-400',
        gradientFrom: 'from-rose-500/15',
        gradientTo: 'to-pink-500/10',
        action: 'goWishlist',
        badge: stats.wishlistCount > 0 ? stats.wishlistCount : null
      },
      {
        icon: Bell,
        label: 'Notifications',
        description: 'Updates & alerts',
        color: 'text-yellow-600 dark:text-yellow-400',
        gradientFrom: 'from-yellow-500/15',
        gradientTo: 'to-amber-500/10',
        action: 'goNotifications',
        badge: stats.unreadNotifications > 0 ? stats.unreadNotifications : null
      }
    ]

    return baseLinks
  }

  const quickLinks = getQuickLinks()

  const actionMap: Record<string, () => void> = {
    goOrders,
    goReturns,
    goHelp,
    goContact,
    goCart,
    goWishlist,
    goNotifications,
    goRewards
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000) return '999+'
    return num.toString()
  }

  return (
    <section className="px-4 py-4">
      {/* Header with live stats */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <HelpCircle className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Quick Actions</h2>
            <p className="text-[10px] text-muted-foreground">
              {session ? 'Personalized for you' : 'Sign in for personalized links'}
            </p>
          </div>
        </div>
        
        {/* Points badge if logged in */}
        {session && stats.rewardsPoints > 0 && (
          <Badge 
            variant="secondary" 
            className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 cursor-pointer"
            onClick={() => goRewards()}
          >
            <Star className="h-3 w-3 mr-1" />
            {stats.rewardsPoints.toLocaleString()}
          </Badge>
        )}
      </div>

      {/* Live Stats Row */}
      {session && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-2 mb-4"
        >
          <div className="bg-muted rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-primary">{formatNumber(stats.cartItems)}</p>
            <p className="text-[10px] text-muted-foreground">Cart</p>
          </div>
          <div className="bg-muted rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-rose-500">{formatNumber(stats.wishlistCount)}</p>
            <p className="text-[10px] text-muted-foreground">Saved</p>
          </div>
          <div className="bg-muted rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-yellow-500">{formatNumber(stats.rewardsPoints)}</p>
            <p className="text-[10px] text-muted-foreground">Points</p>
          </div>
        </motion.div>
      )}

      {/* 2x2 Grid of quick link cards */}
      <div className="grid grid-cols-2 gap-3">
        {quickLinks.map((link, i) => {
          const Icon = link.icon
          return (
            <motion.button
              key={link.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3, type: 'spring', stiffness: 300 }}
              onClick={() => actionMap[link.action]?.()}
              className="group relative flex flex-col items-center gap-2.5 overflow-hidden rounded-xl border border-border/50 bg-card p-4 text-center shadow-sm transition-all hover:shadow-lg hover:border-primary/20 active:scale-[0.96]"
            >
              {/* Gradient background on hover/active */}
              <div className={`absolute inset-0 bg-gradient-to-br ${link.gradientFrom} ${link.gradientTo} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              <div className="relative z-10 flex flex-col items-center gap-2.5">
                {/* Icon container with gradient */}
                <div className={`relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${link.gradientFrom} ${link.gradientTo} transition-transform group-hover:scale-110 group-active:scale-95`}>
                  <Icon className={`h-5 w-5 ${link.color}`} />
                  {/* Badge */}
                  {link.badge && link.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {link.badge > 99 ? '99+' : link.badge}
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    {link.label}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground leading-tight line-clamp-2">
                    {link.description}
                  </p>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Secondary quick links */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-xs"
          onClick={() => goReturns()}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Returns
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-xs"
          onClick={() => goContact()}
        >
          <HeadphonesIcon className="h-3.5 w-3.5" />
          Support
        </Button>
      </div>

      {/* View Help Center button */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-3"
      >
        <Button
          variant="ghost"
          className="w-full gap-2 text-xs active:scale-[0.98] transition-transform text-muted-foreground hover:text-foreground"
          onClick={() => goHelp()}
        >
          <HelpCircle className="h-3.5 w-3.5" />
          View Help Center
          <ArrowRight className="h-3 w-3 ml-auto" />
        </Button>
      </motion.div>
    </section>
  )
}

