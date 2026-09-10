'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Clock, Share2, Filter, Flame, ShoppingCart, Package, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import { toast } from 'sonner'

// Types 
interface FlashSaleProduct {
  id: string
  name: string
  slug: string
  imageUrl: string | null
  category: { id: string; name: string; slug: string } | null
  originalPrice: number
  salePrice: number
  savings: number
  savingsPercent: number
  stockRemaining: number
  totalStock: number
  claimedPercent: number
  rating: number | null
  reviewCount: number | null
  deliveryTime: string | null
  tags: string[]
}

interface FlashSaleMeta {
  title: string
  subtitle: string
  endsAt: string
  timeRemaining: number
  totalDeals: number
  banner: {
    gradient: string
    icon: string
    tagline: string
  }
}

type CategoryFilter = 'All' | 'Tech' | 'Fashion' | 'Home' | 'Gaming'

const CATEGORY_MAP: Record<CategoryFilter, string[]> = {
  All: [],
  Tech: ['websites', 'apps', 'devops', 'api'],
  Fashion: ['design', 'branding'],
  Home: ['productivity', 'tools'],
  Gaming: ['gaming', 'entertainment'],
}

// Countdown Hook 
function useCountdown(targetDate: Date) {
  const calc = useCallback(() => {
    const diff = targetDate.getTime() - Date.now()
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, done: true }
    return {
      hours: Math.floor(diff / 3600000),
      minutes: Math.floor((diff / 60000) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      done: false,
    }
  }, [targetDate])

  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0, done: false })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTime(calc())
    const id = setInterval(() => setTime(calc()), 1000)
    return () => clearInterval(id)
  }, [calc])

  return mounted ? time : { hours: 0, minutes: 0, seconds: 0, done: false }
}

// Countdown Digit 
function CountdownBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-glass-deep/20 backdrop-blur-sm sm:h-14 sm:w-14">
        <span className="text-lg font-black text-white sm:text-2xl">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-[9px] font-medium uppercase tracking-wider text-white/70">
        {label}
      </span>
    </div>
  )
}

// Large Countdown Timer 
function FlashCountdown({ endsAt }: { endsAt: string }) {
  const time = useCountdown(new Date(endsAt))

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      <CountdownBlock value={time.hours} label="HRS" />
      <span className="mb-4 text-xl font-black text-white/80">:</span>
      <CountdownBlock value={time.minutes} label="MIN" />
      <span className="mb-4 text-xl font-black text-white/80">:</span>
      <CountdownBlock value={time.seconds} label="SEC" />
    </div>
  )
}

// Share Deal Handler 
function handleShare(product: FlashSaleProduct) {
  const text = ` Flash Deal: ${product.name}  ${formatPrice(product.salePrice)} (${product.savingsPercent}% OFF)! Grab it before it's gone!`
  if (navigator.share) {
    navigator.share({ title: product.name, text, url: window.location.href }).catch(() => {})
  } else {
    navigator.clipboard.writeText(text).then(() => toast.success('Deal copied to clipboard!'))
  }
}

// Product Card 
function FlashProductCard({ product, index }: { product: FlashSaleProduct; index: number }) {
  const { addToCart } = useShopStore()
  const { goProduct } = useShopRouter()
  const soldOut = product.stockRemaining <= 0

  return (
    <motion.div
      className={`relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all ${
        soldOut ? 'border-muted opacity-70 grayscale' : 'border-border/50 hover:border-destructive/30 hover:shadow-lg'
      }`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      whileTap={soldOut ? undefined : { scale: 0.97 }}
    >
      {/* Discount Badge */}
      <Badge className="absolute left-2 top-2 z-10 bg-destructive px-1.5 text-[10px] font-bold text-white shadow-md">
        <Zap className="mr-0.5 h-3 w-3" />-{product.savingsPercent}%
      </Badge>

      {/* Share Button */}
      <button
        onClick={(e) => { e.stopPropagation(); handleShare(product) }}
        className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-background/60 backdrop-blur-sm transition-all hover:bg-background/90 active:scale-90"
        aria-label="Share deal"
      >
        <Share2 className="h-3.5 w-3.5 text-foreground/70" />
      </button>

      {/* Image */}
      <button
        className="relative flex-shrink-0"
        onClick={() => !soldOut && goProduct(product.id)}
        disabled={soldOut}
      >
        <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-destructive/10 to-orange-500/5">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-4xl opacity-30"></span>
          )}
        </div>

        {/* Sold Out Overlay */}
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/80 backdrop-blur-sm">
            <Badge className="bg-muted-foreground/90 px-3 py-1 text-sm font-bold text-white">
              Sold Out
            </Badge>
          </div>
        )}
      </button>

      {/* Info */}
      <div className="flex flex-1 flex-col p-2.5 sm:p-3">
        <button
          onClick={() => !soldOut && goProduct(product.id)}
          disabled={soldOut}
          className="text-left"
        >
          <h3 className="mb-1 text-xs font-semibold text-foreground line-clamp-2 sm:text-sm">
            {product.name}
          </h3>
        </button>

        {/* Prices */}
        <div className="mb-1.5 flex items-baseline gap-1.5">
          <span className="text-sm font-bold text-destructive sm:text-base">
            {formatPrice(product.salePrice)}
          </span>
          <span className="text-[10px] text-muted-foreground line-through sm:text-xs">
            {formatPrice(product.originalPrice)}
          </span>
        </div>

        {/* Claimed Progress */}
        <div className="mb-1">
          <Progress
            value={product.claimedPercent}
            className="h-1.5 bg-destructive/10 [&>[data-slot=progress-indicator]]:bg-destructive"
          />
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            {product.claimedPercent}% claimed
          </p>
        </div>

        {/* Stock Warning */}
        {!soldOut && product.stockRemaining <= 10 && (
          <div className="mb-2 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-amber-500" />
            <span className="text-[10px] font-medium text-amber-500">
              Hurry! Only {product.stockRemaining} left
            </span>
          </div>
        )}

        {/* Add to Cart */}
        <div className="mt-auto">
          <Button
            size="sm"
            className={`w-full gap-1.5 text-[11px] ${
              soldOut
                ? 'cursor-not-allowed bg-muted text-muted-foreground'
                : 'bg-destructive/10 text-destructive hover:bg-destructive hover:text-white'
            }`}
            disabled={soldOut}
            onClick={(e) => {
              e.stopPropagation()
              addToCart({
                productId: product.id,
                name: product.name,
                price: product.salePrice,
                quantity: 1,
                imageUrl: product.imageUrl,
              })
              toast.success('Added to cart!')
            }}
          >
            <ShoppingCart className="h-3 w-3" />
            {soldOut ? 'Sold Out' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// Loading Skeleton 
function FlashSaleSkeleton() {
  return (
    <div className="px-4 py-4">
      {/* Banner Skeleton */}
      <Skeleton className="mb-4 h-44 w-full rounded-2xl" />

      {/* Filter Skeleton */}
      <div className="mb-4 flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-8 w-16 rounded-full" />
        ))}
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card">
            <Skeleton className="aspect-square w-full" />
            <div className="flex flex-col gap-2 p-2.5">
              <Skeleton className="h-3.5 w-4/5" />
              <Skeleton className="h-3 w-3/5" />
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-1.5 w-full" />
              <Skeleton className="h-7 w-full rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Empty State 
function EmptyState() {
  const { goHome } = useShopRouter()

  return (
    <motion.div
      className="flex flex-col items-center justify-center px-6 py-16 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Package className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="mb-1 text-base font-bold text-foreground">No Flash Deals Right Now</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Our flash sale deals have ended. Check back soon for the next event!
      </p>
      <Button variant="outline" onClick={goHome}>
        Browse Products
      </Button>
    </motion.div>
  )
}

// Main Component 
export function FlashSalePage() {
  const hydrated = useShopStore((s) => s.cookieConsent) !== undefined || true
  const [products, setProducts] = useState<FlashSaleProduct[]>([])
  const [meta, setMeta] = useState<FlashSaleMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('All')
  const { goProduct } = useShopRouter()

  // Fetch flash sale data
  useEffect(() => {
    const fetchFlashSale = async () => {
      try {
        const res = await fetch('/api/flash-sale')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        if (data.success) {
          setProducts(data.products || [])
          setMeta(data.meta || null)
        }
      } catch {
        toast.error('Failed to load flash sale deals')
      } finally {
        setLoading(false)
      }
    }
    fetchFlashSale()
  }, [])

  // Filter products by category
  const filteredProducts = activeFilter === 'All'
    ? products
    : products.filter((p) => {
        const slugs = CATEGORY_MAP[activeFilter]
        return p.category ? slugs.includes(p.category.slug) : false
      })

  const filters: CategoryFilter[] = ['All', 'Tech', 'Fashion', 'Home', 'Gaming']

  // Loading state
  if (loading) return <FlashSaleSkeleton />

  return (
    <div className="min-h-screen bg-background">
      {/* Animated Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500">
        {/* Animated background blobs */}
        <motion.div
          className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-glass-deep/10 blur-2xl"
          animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-glass-deep/10 blur-2xl"
          animate={{ x: [0, -30, 0], y: [0, -15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative px-4 pt-6 pb-5 sm:pt-8 sm:pb-6">
          {/* Live Badge */}
          <motion.div
            className="mb-3 flex items-center justify-center gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-glass-deep opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-glass-deep" />
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-white">
              Flash Sale Live Now!
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="mb-1 text-center text-xl font-black text-white sm:text-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
             {meta?.title || 'Flash Sale'}
          </motion.h1>
          <p className="mb-4 text-center text-xs text-white/80 sm:text-sm">
            {meta?.banner?.tagline || 'Grab deals before they\'re gone!'}
          </p>

          {/* Countdown */}
          {meta?.endsAt && (
            <div className="mb-2">
              <p className="mb-2 text-center text-[10px] font-medium uppercase tracking-wider text-white/60">
                <Clock className="mr-1 inline h-3 w-3" />
                Ends in
              </p>
              <FlashCountdown endsAt={meta.endsAt} />
            </div>
          )}

          {/* Deal Count */}
          {meta && (
            <p className="mt-3 text-center text-[11px] text-white/60">
              <Flame className="mr-1 inline h-3 w-3" />
              {meta.totalDeals} deals available
            </p>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all active:scale-95 ${
                activeFilter === filter
                  ? 'bg-destructive text-white shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {filter === 'All' && <Filter className="mr-1 inline h-3 w-3" />}
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="px-3 py-4 sm:px-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {filteredProducts.map((product, index) => (
              <FlashProductCard
                key={product.id}
                product={product}
                index={index}
              />
            ))}
          </div>
        </div>
      )}

      {/* Footer Info */}
      {meta && filteredProducts.length > 0 && (
        <div className="mx-4 mb-6 rounded-xl border border-border/50 bg-card p-4">
          <h3 className="mb-2 text-xs font-bold text-foreground">Flash Sale Rules</h3>
          <ul className="space-y-1">
            {[
              'Flash deals are available while stock lasts',
              'Prices revert after the sale ends',
              'No stacking with other coupons unless stated',
              'Max 3 units per customer per deal',
            ].map((rule, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                <span className="mt-0.5 h-1 w-1 flex-shrink-0 rounded-full bg-muted-foreground" />
                {rule}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

