'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Zap, Clock, Percent, SortAsc, Flame, Tag, ShoppingCart, Star, Timer, Gift,
  TrendingDown, BadgePercent, Crown, Copy, Check, Package, Users, Sparkles, Gem,
  Ticket, ArrowRight, Heart,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { type Product } from '@/lib/store'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import { toast } from 'sonner'

type SortOption = 'ending-soon' | 'discount' | 'price-low' | 'price-high' | 'popular'
type FilterOption = 'all' | 'flash' | 'bundle' | 'bogo' | 'discount'

// Countdown timer hook
function useCountdown(targetDate: Date) {
  const calculateTimeLeft = useCallback(() => {
    const difference = targetDate.getTime() - new Date().getTime()
    if (difference <= 0) return { hours: 0, minutes: 0, seconds: 0 }
    return {
      hours: Math.floor(difference / (1000 * 60 * 60)),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    }
  }, [targetDate])

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)
    return () => clearInterval(timer)
  }, [calculateTimeLeft])

  return timeLeft
}

function CountdownBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-destructive/20 backdrop-blur-sm border border-destructive/30">
        <span className="text-base font-bold text-destructive">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="mt-1 text-[9px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  )
}

// Individual deal countdown - small inline timer
function DealCountdown({ endTime }: { endTime: Date }) {
  const timeLeft = useCountdown(endTime)
  if (timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) return null

  return (
    <div className="flex items-center gap-1 mt-1.5">
      <Clock className="h-3 w-3 text-destructive" />
      <span className="text-[10px] font-mono font-bold text-destructive">
        {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
      </span>
      <span className="text-[8px] text-muted-foreground">left</span>
    </div>
  )
}

// Coupon code copy button
function CouponCopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success(`Code "${code}" copied!`)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy code')
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 rounded-md border border-dashed border-primary/30 bg-primary/5 px-2 py-0.5 hover:bg-primary/10 transition-colors"
    >
      <Ticket className="h-3 w-3 text-primary" />
      <code className="text-[9px] font-mono font-bold text-primary">{code}</code>
      {copied ? (
        <Check className="h-2.5 w-2.5 text-emerald-500" />
      ) : (
        <Copy className="h-2.5 w-2.5 text-primary/60" />
      )}
    </button>
  )
}

// Claimed progress bar for deal cards
function ClaimedBar({ claimed }: { claimed: number }) {
  return (
    <div className="mt-1.5">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[9px] text-muted-foreground">Claimed</span>
        <span className="text-[9px] font-bold text-destructive">{claimed}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-destructive to-orange-500"
          initial={{ width: 0 }}
          animate={{ width: `${claimed}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

function DealCard({ product, index, dealType }: { product: Product; index: number; dealType: string }) {
  const { goProduct } = useShopRouter()
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useShopStore()
  const wishlisted = isInWishlist(product.id)

  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : product.discount || 0

  // Generate deterministic but varied data per product
  const claimed = Math.min(95, Math.max(30, (product.reviewCount || 3) * 7 + (product.price % 37)))
  const dealEndTime = new Date(Date.now() + (3600000 * ((index * 3 + 7) % 12) + 1800000 * (index % 5)))
  const couponCode = discount >= 30 ? 'DEAL30' : discount >= 20 ? 'SAVE20' : 'OFF10'

  return (
    <motion.div
      className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card transition-all hover:border-destructive/30 hover:shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      {/* Discount Badge */}
      {discount > 0 && (
        <div className="absolute left-2.5 top-2.5 z-10">
          <Badge className="bg-destructive text-white shadow-md">
            <Zap className="mr-0.5 h-3 w-3" />-{discount}%
          </Badge>
        </div>
      )}

      {/* Deal Type Badge */}
      <div className="absolute right-2.5 top-2.5 z-10">
        {dealType === 'flash' && (
          <Badge className="bg-orange-500/90 text-white shadow-sm">
            <Flame className="mr-0.5 h-3 w-3" />FLASH
          </Badge>
        )}
        {dealType === 'bundle' && (
          <Badge className="bg-emerald-500/90 text-white shadow-sm">
            <Package className="mr-0.5 h-3 w-3" />BUNDLE
          </Badge>
        )}
        {dealType === 'bogo' && (
          <Badge className="bg-violet-500/90 text-white shadow-sm">
            <Sparkles className="mr-0.5 h-3 w-3" />BOGO
          </Badge>
        )}
      </div>

      {/* Lightning Timer */}
      {(dealType === 'flash' || product.isFlashDeal) && (
        <div className="absolute left-2.5 top-12 z-10 rounded-lg bg-black/70 px-1.5 py-0.5 backdrop-blur-sm">
          <DealCountdown endTime={dealEndTime} />
        </div>
      )}

      {/* Image */}
      <button
        className="relative flex w-full items-center justify-center overflow-hidden bg-gradient-to-br from-destructive/10 via-orange-500/5 to-transparent"
        onClick={() => goProduct(product.id)}
      >
        <div className="flex aspect-[16/9] w-full items-center justify-center">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Flame className="h-8 w-8 text-destructive/40" />
              <span className="text-xs text-muted-foreground">Flash Deal</span>
            </div>
          )}
        </div>
      </button>

      {/* Info */}
      <div className="p-3">
        <button onClick={() => goProduct(product.id)} className="w-full text-left">
          <h3 className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-destructive transition-colors">
            {product.name}
          </h3>
        </button>
        <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1">
          {product.description}
        </p>

        {/* Rating */}
        <div className="mt-1.5 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`h-3 w-3 ${
                s <= Math.round(product.rating || 4) ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'
              }`}
            />
          ))}
          <span className="ml-0.5 text-[10px] text-muted-foreground">({product.rating || '4.0'})</span>
          {product.reviewCount > 0 && (
            <span className="text-[10px] text-muted-foreground"> {product.reviewCount} reviews</span>
          )}
        </div>

        {/* Claimed Progress */}
        <ClaimedBar claimed={claimed} />

        {/* Coupon Code */}
        <div className="mt-1.5">
          <CouponCopyButton code={couponCode} />
        </div>

        {/* Price & Actions */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-destructive">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-[11px] text-muted-foreground line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                if (wishlisted) {
                  removeFromWishlist(product.id)
                } else {
                  addToWishlist({
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    comparePrice: product.comparePrice,
                    imageUrl: product.imageUrl,
                  })
                }
              }}
            >
              <Heart className={`h-3.5 w-3.5 ${wishlisted ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} />
            </Button>
            <Button
              size="sm"
              className="h-7 gap-1 bg-destructive/10 px-2.5 text-[11px] text-destructive hover:bg-destructive hover:text-white"
              onClick={() => {
                addToCart({
                  productId: product.id,
                  name: product.name,
                  price: product.price,
                  quantity: 1,
                  imageUrl: product.imageUrl,
                })
              }}
            >
              <ShoppingCart className="h-3 w-3" />
              Add
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function DealsView() {
  const { goBack, goCategory, goProduct, goRewards, goLuxury } = useShopRouter()
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>('discount')
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all')

  // Countdown to end of today
  const endTime = new Date()
  endTime.setHours(23, 59, 59, 999)
  const timeLeft = useCountdown(endTime)

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true)
      try {
        // Fetch flash deals first
        const flashRes = await fetch('/api/products/deals?limit=50')
        let dealProducts: Product[] = []
        if (flashRes.ok) {
          const flashData = await flashRes.json()
          dealProducts = Array.isArray(flashData) ? flashData : flashData.data || []
        }

        // If we have flash deals, use them. Otherwise fallback to all products with comparePrice
        if (dealProducts.length > 0) {
          setAllProducts(dealProducts)
        } else {
          // Fallback: get all products and filter for those with discounts
          const allRes = await fetch('/api/products?limit=50')
          if (allRes.ok) {
            const allData = await allRes.json()
            const products = Array.isArray(allData) ? allData : allData.data || []
            setAllProducts(products)
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchDeals()
  }, [])

  // Assign deal types deterministically
  const productsWithTypes = allProducts.map((p, i) => {
    let dealType: string = 'discount'
    if (p.isFlashDeal) {
      dealType = 'flash'
    } else if (i % 5 === 0) {
      dealType = 'bogo'
    } else if (i % 4 === 0) {
      dealType = 'bundle'
    } else if (p.comparePrice && p.comparePrice > p.price) {
      dealType = 'discount'
    }
    return { ...p, dealType }
  })

  // Filter products that have any kind of deal
  const dealProducts = productsWithTypes.filter((p) => {
    if (activeFilter === 'all') return true
    return p.dealType === activeFilter
  })

  const sortedDeals = [...dealProducts].sort((a, b) => {
    switch (sortBy) {
      case 'discount':
        return ((1 - b.price / (b.comparePrice || b.price)) - (1 - a.price / (a.comparePrice || a.price)))
      case 'ending-soon':
        return a.price - b.price // proxy - price as sort
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'popular':
        return (b.reviewCount || 0) - (a.reviewCount || 0)
      default:
        return 0
    }
  })

  const maxDiscount = dealProducts.length > 0
    ? Math.round(Math.max(...dealProducts.map((p) => (1 - p.price / (p.comparePrice || p.price)) * 100)))
    : 0

  const totalSaved = dealProducts.reduce((sum, p) => sum + ((p.comparePrice || p.price) - p.price), 0)

  return (
    <motion.div
      className="pb-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2">
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
              <Zap className="h-5 w-5 text-destructive" />
              Flash Deals
            </h1>
            <p className="text-[11px] text-muted-foreground">{dealProducts.length} deals available today</p>
          </div>
          <div className="flex items-center gap-1 text-destructive">
            <Clock className="h-4 w-4" />
          </div>
        </div>

        {/* Countdown Row */}
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Ends in</span>
          <CountdownBlock value={timeLeft.hours} label="HRS" />
          <span className="text-lg font-bold text-destructive -mt-3">:</span>
          <CountdownBlock value={timeLeft.minutes} label="MIN" />
          <span className="text-lg font-bold text-destructive -mt-3">:</span>
          <CountdownBlock value={timeLeft.seconds} label="SEC" />
        </div>
      </div>

      {/* VIP Early Access Banner */}
      <div className="mx-4 mt-3 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-orange-500/5 border border-amber-500/20">
        <div className="flex items-center gap-3 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
            <Crown className="h-5 w-5 text-amber-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold text-foreground">VIP Early Access</p>
              <Badge className="bg-amber-500/20 text-amber-500 text-[8px] px-1.5">GOLD+</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">Get 30-min early access to flash deals</p>
          </div>
          <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1 border-amber-500/30 text-amber-500 hover:bg-amber-500/10" onClick={goRewards}>
            <Gem className="h-3 w-3" />
            Join VIP
          </Button>
        </div>
      </div>

      {/* Deal Hero Banner */}
      <div className="mx-4 mt-3 overflow-hidden rounded-2xl bg-gradient-to-r from-destructive/15 via-orange-500/10 to-amber-500/5 border border-destructive/20 p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/20">
            <Flame className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="text-base font-bold text-foreground">Up to {maxDiscount}% OFF</p>
            <p className="text-[11px] text-muted-foreground">Save up to {formatPrice(totalSaved)} today</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 rounded-lg bg-background/50 p-2 text-center">
            <TrendingDown className="mx-auto h-4 w-4 text-destructive mb-0.5" />
            <p className="text-[9px] text-muted-foreground">Lowest Prices</p>
          </div>
          <div className="flex-1 rounded-lg bg-background/50 p-2 text-center">
            <Timer className="mx-auto h-4 w-4 text-orange-500 mb-0.5" />
            <p className="text-[9px] text-muted-foreground">Limited Time</p>
          </div>
          <div className="flex-1 rounded-lg bg-background/50 p-2 text-center">
            <Gift className="mx-auto h-4 w-4 text-amber-500 mb-0.5" />
            <p className="text-[9px] text-muted-foreground">Bonus Rewards</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mt-3 flex gap-2 overflow-x-auto px-4 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[
          { key: 'all' as FilterOption, label: 'All Deals', icon: Zap },
          { key: 'flash' as FilterOption, label: 'Flash Deals', icon: Flame },
          { key: 'bundle' as FilterOption, label: 'Bundle Deals', icon: Package },
          { key: 'bogo' as FilterOption, label: 'Buy One Get One', icon: Sparkles },
          { key: 'discount' as FilterOption, label: 'Discounted', icon: BadgePercent },
        ].map((filter) => {
          const Icon = filter.icon
          return (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                activeFilter === filter.key
                  ? 'bg-destructive text-white'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-3 w-3" />
              {filter.label}
            </button>
          )
        })}
      </div>

      {/* Sort Options */}
      <div className="mt-2 flex gap-2 overflow-x-auto px-4 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[
          { key: 'ending-soon' as SortOption, label: 'Ending Soon', icon: Clock },
          { key: 'discount' as SortOption, label: 'Biggest Discount', icon: Percent },
          { key: 'price-low' as SortOption, label: 'Lowest Price', icon: TrendingDown },
          { key: 'popular' as SortOption, label: 'Most Popular', icon: Users },
        ].map((option) => {
          const Icon = option.icon
          return (
            <button
              key={option.key}
              onClick={() => setSortBy(option.key)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium whitespace-nowrap transition-colors ${
                sortBy === option.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-3 w-3" />
              {option.label}
            </button>
          )
        })}
      </div>

      {/* Deals Grid */}
      <div className="px-4 mt-3">
        {loading ? (
          <div className="grid grid-cols-2 gap-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card">
                <div className="aspect-[16/9] animate-pulse bg-muted" />
                <div className="flex flex-col gap-2 p-3">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-full animate-pulse rounded bg-muted" />
                  <div className="h-5 w-16 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedDeals.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <Flame className="h-8 w-8 text-destructive/50" />
            </div>
            <p className="text-sm font-medium text-foreground">No deals available right now</p>
            <p className="mt-1 text-xs text-muted-foreground">Check back soon for flash deals!</p>
            <Button onClick={() => goCategory()} variant="outline" className="mt-4 gap-2">
              Browse All Services
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {sortedDeals.map((product, index) => (
              <DealCard key={product.id} product={product} index={index} dealType={product.dealType} />
            ))}
          </div>
        )}
      </div>

      {/* Coupon Code Banner */}
      <div className="mx-4 mt-6 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
            <Tag className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Exclusive Coupons</p>
            <p className="text-[11px] text-muted-foreground">Tap to copy and apply at checkout</p>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            { code: 'WELCOME10', desc: '10% off first order' },
            { code: 'GRAPSEE20', desc: '20% off orders 5000+' },
            { code: 'FIRST15', desc: '15% off any product' },
            { code: 'FLASH25', desc: '25% off flash deals' },
          ].map((coupon) => (
            <div
              key={coupon.code}
              className="flex-shrink-0 rounded-lg border border-primary/20 bg-background/50 px-3 py-2 text-center"
            >
              <CouponCopyButton code={coupon.code} />
              <p className="text-[8px] text-muted-foreground mt-1">{coupon.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mx-4 mt-4 rounded-2xl bg-gradient-to-r from-destructive/10 via-orange-500/5 to-transparent border border-destructive/20 p-4 text-center">
        <Flame className="mx-auto h-6 w-6 text-destructive mb-2" />
        <p className="text-sm font-semibold text-foreground mb-1">New deals every day!</p>
        <p className="text-xs text-muted-foreground mb-3">Bookmark this page and check back daily for fresh flash deals</p>
        <Button onClick={() => goCategory()} variant="outline" className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10">
          Browse All Services
        </Button>
      </div>
    </motion.div>
  )
}
