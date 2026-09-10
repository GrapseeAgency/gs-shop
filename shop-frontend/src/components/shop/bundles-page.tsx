'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Package, ShoppingCart, BadgePercent, Star, Heart,
  Gift, Users, ChevronRight, Sparkles, Tag, Check, ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import { toast } from 'sonner'

interface BundleItem {
  id: string
  name: string
  price: number
  imageUrl: string | null
}

interface Bundle {
  id: string
  title: string
  description: string
  items: BundleItem[]
  individualPrice: number
  bundlePrice: number
  discount: number
  savings: number
  category: string
  rating: number
  reviewCount: number
  purchasedCount: number
  badge?: string
}

function BundleCard({ bundle, index }: { bundle: Bundle; index: number }) {
  const { goProduct } = useShopRouter()
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useShopStore()
  const [expanded, setExpanded] = useState(false)

  const handleAddBundle = () => {
    bundle.items.forEach((item) => {
      addToCart({
        productId: item.id,
        name: item.name,
        price: bundle.bundlePrice / bundle.items.length,
        quantity: 1,
        imageUrl: item.imageUrl,
      })
    })
    toast.success('Bundle added to cart!', {
      description: `${bundle.items.length} items  Save ${formatPrice(bundle.savings)}`,
    })
  }

  const anyWishlisted = bundle.items.some((item) => isInWishlist(item.id))

  return (
    <motion.div
      className="overflow-hidden rounded-2xl border border-border/50 bg-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
    >
      {/* Header with gradient */}
      <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4">
        {/* Discount Badge */}
        <div className="absolute right-3 top-3">
          <Badge className="bg-emerald-500/90 text-white shadow-sm">
            <BadgePercent className="mr-0.5 h-3 w-3" />Save {bundle.discount}%
          </Badge>
        </div>
        {bundle.badge && (
          <Badge className="bg-amber-500/90 text-white shadow-sm mb-2">
            <Sparkles className="mr-0.5 h-3 w-3" />{bundle.badge}
          </Badge>
        )}
        <h3 className="text-base font-bold text-foreground pr-20">{bundle.title}</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{bundle.description}</p>

        {/* Rating & Purchased */}
        <div className="mt-2 flex items-center gap-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`h-3 w-3 ${s <= Math.round(bundle.rating) ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'}`} />
            ))}
            <span className="text-[10px] text-muted-foreground ml-0.5">({bundle.reviewCount})</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Users className="h-3 w-3" />
            {bundle.purchasedCount} bought
          </div>
        </div>
      </div>

      {/* Items Preview */}
      <div className="px-4 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {bundle.items.map((item, i) => (
            <motion.button
              key={item.id}
              className="flex-shrink-0 relative"
              onClick={() => goProduct(item.id)}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-muted/50 border border-border/30">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <Package className="h-6 w-6 text-muted-foreground/40" />
                )}
              </div>
              {i < bundle.items.length - 1 && (
                <div className="absolute -right-2 top-1/2 z-10 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground">
                  +
                </div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Expand Items List */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 flex items-center gap-1 text-[11px] text-primary hover:underline"
        >
          {expanded ? 'Hide' : 'View all'} {bundle.items.length} items
          <ChevronRight className={`h-3 w-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-2 space-y-1.5">
                {bundle.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 rounded-lg bg-muted/30 px-2 py-1.5">
                    <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-md bg-muted/50">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <Package className="h-4 w-4 m-auto text-muted-foreground/40" />
                      )}
                    </div>
                    <span className="flex-1 text-[11px] text-foreground truncate">{item.name}</span>
                    <span className="text-[11px] text-muted-foreground">{formatPrice(item.price)}</span>
                    <button onClick={() => {
                      if (isInWishlist(item.id)) removeFromWishlist(item.id)
                      else addToWishlist({ productId: item.id, name: item.name, price: item.price, comparePrice: null, imageUrl: item.imageUrl })
                    }}>
                      <Heart className={`h-3.5 w-3.5 ${isInWishlist(item.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Price Comparison */}
      <div className="mx-4 mb-3 rounded-xl bg-muted/30 border border-border/30 p-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground line-through">Individually: {formatPrice(bundle.individualPrice)}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-base font-bold text-emerald-500">{formatPrice(bundle.bundlePrice)}</span>
              <Badge className="bg-emerald-500/10 text-emerald-500 text-[9px] px-1.5 border-emerald-500/20">
                <Tag className="mr-0.5 h-2.5 w-2.5" />Bundle Price
              </Badge>
            </div>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-emerald-500/10 px-3 py-1.5">
            <span className="text-lg font-bold text-emerald-500">-{formatPrice(bundle.savings)}</span>
            <span className="text-[9px] text-emerald-500/80">You Save</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-4 pb-3">
        <Button
          className="flex-1 gap-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white"
          onClick={handleAddBundle}
        >
          <ShoppingCart className="h-4 w-4" />
          Add Bundle to Cart
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 border-emerald-500/20"
          onClick={() => {
            bundle.items.forEach((item) => {
              if (!isInWishlist(item.id)) {
                addToWishlist({ productId: item.id, name: item.name, price: item.price, comparePrice: null, imageUrl: item.imageUrl })
              }
            })
            toast.success('Bundle wishlisted!')
          }}
        >
          <Heart className={`h-4 w-4 ${anyWishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
        </Button>
      </div>
    </motion.div>
  )
}

export function BundlesPage() {
  const { goBack, goCategory, goDeals } = useShopRouter()
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'popular' | 'best-value' | 'new'>('all')

  useEffect(() => {
    const fetchBundles = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/bundles')
        if (res.ok) {
          const data = await res.json()
          const raw = Array.isArray(data) ? data : data.data || []
          if (raw.length > 0) {
            const mapped: Bundle[] = raw.map((b: Record<string, unknown>, i: number) => {
              const items = Array.isArray(b.items) ? b.items : []
              const individualPrice = items.reduce((s: number, it: Record<string, unknown>) => s + (it.price as number || 0), (b.individualPrice as number) || 0)
              const bundlePrice = (b.bundlePrice as number) || individualPrice * 0.75
              return {
                id: b.id as string || `bundle-${i}`,
                title: (b.title as string) || (b.name as string) || 'Mega Bundle',
                description: (b.description as string) || 'Save big when you buy together!',
                items: items.map((it: Record<string, unknown>) => ({
                  id: (it.id as string) || `item-${i}`,
                  name: (it.name as string) || 'Product',
                  price: (it.price as number) || 0,
                  imageUrl: (it.imageUrl as string | null) || null,
                })),
                individualPrice,
                bundlePrice,
                discount: Math.round((1 - bundlePrice / individualPrice) * 100),
                savings: individualPrice - bundlePrice,
                category: (b.category as string) || 'General',
                rating: (b.rating as number) || 4.5,
                reviewCount: (b.reviewCount as number) || 20 + i * 5,
                purchasedCount: (b.purchasedCount as number) || 50 + i * 13,
                badge: i === 0 ? 'Best Seller' : i === 1 ? 'Staff Pick' : i === 2 ? 'New' : undefined,
              }
            })
            setBundles(mapped)
          }
        }
      } catch {
        // fallback to generated bundles from products
      }

      // Fallback: create bundles from products API
      if (bundles.length === 0) {
        try {
          const res = await fetch('/api/products?limit=12')
          if (res.ok) {
            const data = await res.json()
            const raw = Array.isArray(data) ? data : data.data || []
            const generatedBundles: Bundle[] = []
            for (let i = 0; i < raw.length - 2; i += 3) {
              const items = raw.slice(i, i + 3).map((p: Record<string, unknown>) => ({
                id: p.id as string,
                name: p.name as string,
                price: p.price as number,
                imageUrl: (p.imageUrl as string | null) || null,
              }))
              const individualPrice = items.reduce((s, it) => s + it.price, 0)
              const bundlePrice = Math.round(individualPrice * 0.7 * 100) / 100
              generatedBundles.push({
                id: `bundle-${i}`,
                title: `${items[0]?.name || 'Product'} Essentials Bundle`,
                description: 'Buy together & save big on this curated combination!',
                items,
                individualPrice,
                bundlePrice,
                discount: 30,
                savings: individualPrice - bundlePrice,
                category: 'Popular',
                rating: 4.3 + (i % 5) * 0.15,
                reviewCount: 15 + i * 4,
                purchasedCount: 40 + i * 11,
                badge: i === 0 ? 'Best Seller' : i === 3 ? 'Staff Pick' : undefined,
              })
            }
            setBundles(generatedBundles)
          }
        } catch {
          // silent
        }
      }
      setLoading(false)
    }
    fetchBundles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredBundles = bundles.filter((b) => {
    if (filter === 'all') return true
    if (filter === 'popular') return b.purchasedCount > 60
    if (filter === 'best-value') return b.discount >= 25
    if (filter === 'new') return b.badge === 'New'
    return true
  })

  const totalSavings = bundles.reduce((s, b) => s + b.savings, 0)

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
              <Package className="h-5 w-5 text-emerald-500" /> Bundle Deals
            </h1>
            <p className="text-[11px] text-muted-foreground">Buy together & save up to {bundles.length > 0 ? Math.max(...bundles.map(b => b.discount)) : 30}%</p>
          </div>
        </div>
      </div>

      {/* Savings Banner */}
      <div className="mx-4 mt-3 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-cyan-500/5 border border-emerald-500/20 p-4">
        <div className="flex items-center gap-3">
          <motion.div
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Gift className="h-6 w-6 text-emerald-500" />
          </motion.div>
          <div>
            <p className="text-base font-bold text-foreground">Save {formatPrice(totalSavings)}+</p>
            <p className="text-xs text-muted-foreground">{bundles.length} bundles available</p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <div className="flex-1 rounded-lg bg-background/50 p-2 text-center">
            <ShieldCheck className="mx-auto h-4 w-4 text-emerald-500 mb-0.5" />
            <p className="text-[9px] text-muted-foreground">Quality Guaranteed</p>
          </div>
          <div className="flex-1 rounded-lg bg-background/50 p-2 text-center">
            <Package className="mx-auto h-4 w-4 text-teal-500 mb-0.5" />
            <p className="text-[9px] text-muted-foreground">Curated Combos</p>
          </div>
          <div className="flex-1 rounded-lg bg-background/50 p-2 text-center">
            <Check className="mx-auto h-4 w-4 text-cyan-500 mb-0.5" />
            <p className="text-[9px] text-muted-foreground">Instant Savings</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mt-3 flex gap-2 overflow-x-auto px-4 scrollbar-hide">
        {[
          { key: 'all' as const, label: 'All Bundles', icon: Package },
          { key: 'popular' as const, label: 'Most Popular', icon: Users },
          { key: 'best-value' as const, label: 'Best Value', icon: BadgePercent },
          { key: 'new' as const, label: 'New Bundles', icon: Sparkles },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f.key ? 'bg-emerald-500 text-white' : 'bg-muted/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            <f.icon className="h-3 w-3" />
            {f.label}
          </button>
        ))}
      </div>

      {/* Bundles List */}
      <div className="px-4 mt-3 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card">
              <div className="h-20 animate-pulse bg-muted" />
              <div className="flex flex-col gap-2 p-4">
                <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-3 w-full animate-pulse rounded bg-muted" />
                <div className="h-10 w-full animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))
        ) : filteredBundles.length === 0 ? (
          <motion.div className="flex flex-col items-center justify-center py-16 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
              <Package className="h-8 w-8 text-emerald-500/50" />
            </div>
            <p className="text-sm font-medium text-foreground">No bundles found</p>
            <p className="mt-1 text-xs text-muted-foreground">Try a different filter or check back later</p>
          </motion.div>
        ) : (
          filteredBundles.map((bundle, index) => (
            <BundleCard key={bundle.id} bundle={bundle} index={index} />
          ))
        )}
      </div>

      {/* CTA */}
      <div className="mx-4 mt-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 p-4 text-center">
        <Gift className="mx-auto h-6 w-6 text-emerald-500 mb-2" />
        <p className="text-sm font-semibold text-foreground mb-1">Custom bundles coming soon!</p>
        <p className="text-xs text-muted-foreground mb-3">Mix & match your own products for exclusive discounts</p>
        <div className="flex gap-2 justify-center">
          <Button onClick={() => goDeals()} variant="outline" className="gap-2 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10">
            View Flash Deals
          </Button>
          <Button onClick={() => goCategory()} variant="outline" className="gap-2">
            Browse Products
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

