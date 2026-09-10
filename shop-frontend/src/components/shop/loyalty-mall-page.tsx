'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Heart, ShoppingBag, Coins, Filter,
  Gift, Check, Info, Star, Trophy, ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import { toast } from 'sonner'

interface LoyaltyProduct {
  id: string
  name: string
  points: number
  imageUrl: string | null
  category: string
  cashValue: number
}

type PointsRange = 'all' | '0-500' | '500-1k' | '1k-5k' | '5k+'

const pointsConfig: Record<PointsRange, { label: string; min: number; max: number }> = {
  all: { label: 'All', min: 0, max: Infinity },
  '0-500': { label: '0500', min: 0, max: 500 },
  '500-1k': { label: '5001K', min: 500, max: 1000 },
  '1k-5k': { label: '1K5K', min: 1000, max: 5000 },
  '5k+': { label: '5K+', min: 5000, max: Infinity },
}

export function LoyaltyMallPage() {
  const { goBack, goProduct } = useShopRouter()
  const { rewardsPoints, addRewardsPoints, addToWishlist, removeFromWishlist, isInWishlist } = useShopStore()

  const [products, setProducts] = useState<LoyaltyProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [activeRange, setActiveRange] = useState<PointsRange>('all')
  const [confirmRedeem, setConfirmRedeem] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/loyalty-mall')
        if (res.ok) {
          const data = await res.json()
          if (data.products?.length) setProducts(data.products)
        }
      } catch { /* silent */ }
      setLoading(false)
    }
    fetchData()
  }, [])

  const filtered = useMemo(() => {
    const cfg = pointsConfig[activeRange]
    return products.filter(p => p.points >= cfg.min && p.points <= cfg.max)
  }, [products, activeRange])

  const handleRedeem = (product: LoyaltyProduct) => {
    if (rewardsPoints < product.points) {
      toast.error(`Not enough points. You need ${product.points - rewardsPoints} more.`)
      return
    }
    if (confirmRedeem === product.id) {
      addRewardsPoints(-product.points)
      toast.success(`Redeemed ${product.name} for ${product.points} points! `)
      setConfirmRedeem(null)
    } else {
      setConfirmRedeem(product.id)
      setTimeout(() => setConfirmRedeem(null), 3000)
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
              <Coins className="h-5 w-5 text-amber-500" /> Loyalty Mall
            </h1>
          </div>
          <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/30 text-[10px]">
            <Trophy className="h-3 w-3 mr-1" /> Rewards
          </Badge>
        </div>
      </div>

      {/* Points Balance */}
      <div className="mx-4 mt-3 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Your Points Balance</p>
            <p className="text-2xl font-bold text-foreground mt-0.5">{rewardsPoints.toLocaleString()}</p>
          </div>
          <motion.div
            className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Coins className="h-7 w-7 text-amber-500" />
          </motion.div>
        </div>
        <div className="mt-2">
          <div className="flex justify-between text-[9px] text-muted-foreground mb-1">
            <span>Points Progress</span>
            <span>{rewardsPoints.toLocaleString()} pts</span>
          </div>
          <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400" initial={{ width: 0 }} animate={{ width: `${Math.min(100, (rewardsPoints / 6000) * 100)}%` }} transition={{ duration: 1 }} />
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="mx-4 mt-4">
        <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
          <Info className="h-4 w-4 text-primary" /> How It Works
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { step: 1, icon: Star, label: 'Earn', desc: 'Shop & earn points' },
            { step: 2, icon: ShoppingBag, label: 'Browse', desc: 'Find rewards' },
            { step: 3, icon: Gift, label: 'Redeem', desc: 'Get for free!' },
          ].map((item, i) => (
            <motion.div key={i} className="rounded-xl border border-border/50 bg-card p-3 text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                <item.icon className="h-3.5 w-3.5 text-primary" />
              </div>
              <p className="mt-1 text-[10px] font-bold text-foreground">{item.label}</p>
              <p className="text-[8px] text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Points Range Filter */}
      <div className="px-4 mt-4 flex gap-2 overflow-x-auto scrollbar-hide">
        {(Object.keys(pointsConfig) as PointsRange[]).map(key => {
          const isActive = activeRange === key
          return (
            <motion.button
              key={key}
              onClick={() => setActiveRange(key)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                isActive ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' : 'bg-muted/50 text-muted-foreground'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {pointsConfig[key].label}
            </motion.button>
          )
        })}
      </div>

      {/* Products Grid */}
      <div className="px-4 mt-3">
        {loading ? (
          <div className="grid grid-cols-2 gap-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card">
                <div className="aspect-[4/3] animate-pulse bg-muted" />
                <div className="p-3 space-y-2"><div className="h-3 w-3/4 animate-pulse rounded bg-muted" /><div className="h-2 w-full animate-pulse rounded bg-muted" /></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div className="flex flex-col items-center justify-center py-16 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <span className="text-5xl mb-4"></span>
            <p className="text-sm font-medium text-foreground">No products in this range</p>
            <p className="mt-1 text-xs text-muted-foreground">Try a different points range</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filtered.map((product, index) => {
              const wishlisted = isInWishlist(product.id)
              const canAfford = rewardsPoints >= product.points
              const progress = Math.min(100, (rewardsPoints / product.points) * 100)
              return (
                <motion.div
                  key={product.id}
                  className="relative overflow-hidden rounded-2xl border border-border/50 bg-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Points Badge */}
                  <div className="absolute top-2 left-2 z-10">
                    <Badge className="bg-amber-500/90 text-white text-[9px] gap-0.5">
                      <Coins className="h-2.5 w-2.5" /> {product.points.toLocaleString()} pts
                    </Badge>
                  </div>
                  {/* Wishlist */}
                  <button
                    onClick={() => wishlisted ? removeFromWishlist(product.id) : addToWishlist({ productId: product.id, name: product.name, price: product.cashValue, comparePrice: null, imageUrl: product.imageUrl })}
                    className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-background/60 backdrop-blur-sm"
                  >
                    <Heart className={`h-3 w-3 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                  </button>
                  {/* Image */}
                  <div className="w-full cursor-pointer" onClick={() => goProduct(product.id)}>
                    <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-amber-500/10 to-yellow-500/5">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <Gift className="h-10 w-10 text-amber-500/20" />
                      )}
                    </div>
                  </div>
                  <div className="p-2.5">
                    <div onClick={() => goProduct(product.id)} className="w-full text-left cursor-pointer">
                      <p className="text-xs font-medium text-foreground line-clamp-1">{product.name}</p>
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{product.category}</p>
                    {/* Progress bar */}
                    <div className="mt-1.5">
                      <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                        <motion.div className={`h-full rounded-full ${canAfford ? 'bg-emerald-500' : 'bg-amber-500'}`} initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
                      </div>
                      <p className="text-[8px] text-muted-foreground mt-0.5">
                        {canAfford ? 'You can redeem!' : `${product.points - rewardsPoints} more points needed`}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className={`mt-1.5 h-6 w-full gap-1 text-[10px] ${
                        canAfford
                          ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white'
                          : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                      }`}
                      disabled={!canAfford}
                      onClick={() => handleRedeem(product)}
                    >
                      {confirmRedeem === product.id ? (
                        <><Check className="h-3 w-3" /> Confirm?</>
                      ) : (
                        <><ArrowRight className="h-3 w-3" /> Redeem</>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}

