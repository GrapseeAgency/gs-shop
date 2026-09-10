'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, ArrowRight, Flame, ShoppingCart, ChevronUp,
  ChevronDown, Clock, Zap, Crown, Star, BarChart3
} from 'lucide-react'
import { Medal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useShopStore, type Product } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import { toast } from 'sonner'

type TrendingPeriod = 'hourly' | 'daily' | 'weekly'

interface TrendingProductsProps {
  // No props needed - strictly uses API data
}

interface TrendingItem {
  id: string
  name: string
  slug: string
  price: number
  comparePrice?: number | null
  imageUrl: string | null
  description?: string | null
  category?: { id: string; name: string; slug: string } | null
  rank: number
  trendDirection: 'up' | 'down' | 'stable'
  trendPercent: number
}

const periodConfig: Record<TrendingPeriod, { label: string; icon: React.ElementType; desc: string }> = {
  hourly: { label: 'This Hour', icon: Clock, desc: 'Trending right now' },
  daily: { label: 'Today', icon: Zap, desc: 'Hot this week' },
  weekly: { label: 'This Week', icon: BarChart3, desc: 'Most popular' },
}

const rankStyles: Record<number, { bg: string; border: string; glow: string; icon: React.ComponentType<{ className?: string }> }> = {
  1: { bg: 'from-amber-400 to-yellow-500', border: 'border-amber-400/50', glow: 'shadow-amber-500/30', icon: Medal },
  2: { bg: 'from-gray-300 to-gray-400', border: 'border-gray-400/50', glow: 'shadow-gray-400/20', icon: Medal },
  3: { bg: 'from-amber-600 to-amber-700', border: 'border-amber-600/50', glow: 'shadow-amber-700/20', icon: Medal },
}

function generateTrendDirection(index: number, period: TrendingPeriod): 'up' | 'down' | 'stable' {
  const seed = index + (period === 'hourly' ? 1 : period === 'daily' ? 7 : 30)
  if (seed % 5 === 0) return 'down'
  if (seed % 3 === 0) return 'stable'
  return 'up'
}

function generateTrendPercent(index: number): number {
  const percents = [234, 156, 98, 67, 45, 32, 28, 21, 15, 12]
  return percents[index] || Math.max(5, 50 - index * 5)
}

export function TrendingProducts() {
  const { addToCart } = useShopStore()
  const { goCategory, goProduct } = useShopRouter()
  const [period, setPeriod] = useState<TrendingPeriod>('daily')
  const [trending, setTrending] = useState<TrendingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [addedToCart, setAddedToCart] = useState<string | null>(null)

  // Fetch real trending products from API
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch('/api/trending-now')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        
        if (data.success && data.trending && data.trending.length > 0) {
          // Transform API data to include trend info
          const trendingWithMeta = data.trending.map((item: any, index: number) => ({
            ...item,
            rank: index + 1,
            trendDirection: generateTrendDirection(index, period),
            trendPercent: generateTrendPercent(index)
          }))
          setTrending(trendingWithMeta.slice(0, 8))
        } else if (data.categories) {
          // Extract products from categories if no direct trending
          const allProducts = Object.values(data.categories).flat() as any[]
          if (allProducts.length > 0) {
            const trendingWithMeta = allProducts.slice(0, 8).map((item: any, index: number) => ({
              ...item,
              rank: index + 1,
              trendDirection: generateTrendDirection(index, period),
              trendPercent: generateTrendPercent(index)
            }))
            setTrending(trendingWithMeta)
          }
        }
        // NO FALLBACK to propProducts - strictly hide if no API data
      } catch (error) {
        // Silent fail - no fallback, component stays hidden
      } finally {
        setLoading(false)
      }
    }
    
    fetchTrending()
  }, [period])

  // Silent - don't show if no trending products
  if (!loading && trending.length === 0) return null

  const handleQuickAdd = (e: React.MouseEvent, product: TrendingItem) => {
    e.stopPropagation()
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
    })
    setAddedToCart(product.id)
    toast.success(`${product.name} added to cart!`)
    setTimeout(() => setAddedToCart(null), 1500)
  }

  const periodCfg = periodConfig[period]

  return (
    <section className="py-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <motion.div
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </motion.div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-bold text-foreground">Trending Now</h2>
              <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[9px] px-1.5 py-0">
                <Flame className="mr-0.5 h-2.5 w-2.5" />
                LIVE
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground">{periodCfg.desc}</p>
          </div>
        </div>
        <button
          onClick={() => goCategory()}
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          See All
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* Period Selector */}
      <div className="mb-3 flex gap-1 px-4">
        {(Object.entries(periodConfig) as [TrendingPeriod, typeof periodCfg][]).map(([key, cfg]) => {
          const Icon = cfg.icon
          return (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-all ${
                period === key
                  ? 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-2.5 w-2.5" />
              {cfg.label}
            </button>
          )
        })}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex gap-3 overflow-x-auto px-4 pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex w-[145px] flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-border/50 bg-card">
              <div className="h-28 animate-pulse bg-muted" />
              <div className="p-2.5 space-y-2">
                <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Horizontal scroll */}
      {!loading && (
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <AnimatePresence mode="popLayout">
          {trending.map((product, index) => {
            const discount = product.comparePrice
              ? Math.round((1 - product.price / product.comparePrice) * 100)
              : 0
            const trendDirection = generateTrendDirection(index, period)
            const trendPercent = generateTrendPercent(index)
            const rankStyle = rankStyles[index + 1]
            const isTop3 = index < 3
            const isAdded = addedToCart === product.id

            return (
              <motion.button
                key={product.id}
                layout
                className="group relative flex w-[145px] flex-shrink-0 flex-col overflow-hidden rounded-2xl border transition-all active:scale-[0.97]"
                onClick={() => goProduct(product.id)}
                initial={{ opacity: 0, x: 30, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.06, type: 'spring', stiffness: 200 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  borderColor: isTop3 ? `var(--tw-gradient-from)` : undefined,
                }}
              >
                {/* Top 3 special border glow */}
                {isTop3 && (
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${rankStyle.bg} opacity-10`} />
                )}

                {/* Rank Badge */}
                <div className="absolute left-2 top-2 z-10 flex items-center gap-0.5">
                  {isTop3 ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: index * 0.1 + 0.3 }}
                      className={`flex h-6 items-center gap-0.5 rounded-full bg-gradient-to-r ${rankStyle.bg} px-2 text-[10px] font-bold text-white shadow-lg ${rankStyle.glow} shadow-md`}
                    >
                      {(() => { const Icon = rankStyle.icon; return <Icon className="h-3.5 w-3.5" />; })()}
                      #{index + 1}
                    </motion.div>
                  ) : (
                    <div className="flex h-5 items-center gap-0.5 rounded-full bg-muted px-1.5 text-[9px] font-semibold text-muted-foreground">
                      #{index + 1}
                    </div>
                  )}
                </div>

                {/* Trend Direction Indicator */}
                <div className="absolute right-2 top-2 z-10">
                  <div className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[8px] font-bold backdrop-blur-sm ${
                    trendDirection === 'up'
                      ? 'bg-emerald-500/20 text-emerald-500'
                      : trendDirection === 'down'
                      ? 'bg-red-500/20 text-red-500'
                      : 'bg-amber-500/20 text-amber-500'
                  }`}>
                    {trendDirection === 'up' ? <ChevronUp className="h-2.5 w-2.5" /> : trendDirection === 'down' ? <ChevronDown className="h-2.5 w-2.5" /> : <span className="h-2.5 flex items-center text-[8px]"></span>}
                    {trendPercent}%
                  </div>
                </div>

                {/* Image */}
                <div className={`flex h-28 items-center justify-center ${
                  isTop3 ? 'bg-gradient-to-br from-amber-500/15 to-orange-500/5' : 'bg-gradient-to-br from-amber-500/10 to-orange-500/5'
                }`}>
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center"><span className="text-muted-foreground text-xs">No Image</span></div>
                  )}
                </div>

                {/* Info */}
                <div className="p-2.5">
                  {/* Trending Now Badge for top product */}
                  {index === 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mb-1 flex items-center gap-0.5"
                    >
                      <Flame className="h-2.5 w-2.5 text-orange-500" />
                      <span className="text-[8px] font-bold uppercase tracking-wider text-orange-500">Most Trending</span>
                    </motion.div>
                  )}

                  <h3 className="mb-1 text-xs font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    {discount > 0 && (
                      <span className="text-[10px] text-muted-foreground line-through">
                        {formatPrice(product.comparePrice!)}
                      </span>
                    )}
                  </div>

                  {/* Quick Add to Cart */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleQuickAdd(e, product)}
                    className={`mt-1.5 flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-medium transition-all ${
                      isAdded
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-2.5 w-2.5" />
                        Quick Add
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.button>
            )
          })}
        </AnimatePresence>
      </div>
      )}

      {/* Scroll hint for more items */}
      {trending.length > 3 && (
        <div className="mt-1 flex items-center justify-center gap-1 text-[9px] text-muted-foreground">
          <span> Swipe for more </span>
        </div>
      )}
    </section>
  )
}
