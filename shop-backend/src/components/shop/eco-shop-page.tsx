'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Leaf, Droplets, TreePine, Wind, Recycle,
  Heart, ShoppingCart, Star, Search, Filter, X,
  Package, Award, Sprout, Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import { toast } from 'sonner'

interface EcoProduct {
  id: string
  productId: string
  ecoScore: number
  ecoBadge: string
  co2Saved: number
  waterSaved: number
  product: { name: string; price: number; imageUrl: string | null }
  badgeColor?: string
  badgeIcon?: string
  scoreLevel?: string
  totalImpact?: { co2Saved: number; waterSaved: number; treesEquivalent: number }
}

type EcoCategory = 'all' | 'organic' | 'recycled' | 'sustainable' | 'carbon-neutral' | 'fair-trade'

const categoryConfig: Record<EcoCategory, { label: string; icon: React.ElementType; color: string }> = {
  all: { label: 'All', icon: Leaf, color: 'text-emerald-500' },
  organic: { label: 'Organic', icon: Sprout, color: 'text-emerald-500' },
  recycled: { label: 'Recycled', icon: Recycle, color: 'text-sky-500' },
  sustainable: { label: 'Sustainable', icon: Wind, color: 'text-teal-500' },
  'carbon-neutral': { label: 'Carbon Neutral', icon: TreePine, color: 'text-lime-500' },
  'fair-trade': { label: 'Fair Trade', icon: Shield, color: 'text-amber-500' },
}

function EcoRating({ score }: { score: number }) {
  const leaves = Math.round(score / 20)
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Leaf key={i} className={`h-3.5 w-3.5 ${i <= leaves ? 'fill-emerald-500 text-emerald-500' : 'fill-muted text-muted'}`} />
      ))}
      <span className="ml-1 text-[10px] font-medium text-muted-foreground">{score}</span>
    </div>
  )
}

export function EcoShopPage() {
  const { goBack, goProduct } = useShopRouter()
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useShopStore()
  const [ecoProducts, setEcoProducts] = useState<EcoProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<EcoCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [summary, setSummary] = useState<{ totalCo2: number; totalWater: number; avgScore: number } | null>(null)
  const [pledgeSigned, setPledgeSigned] = useState(false)

  useEffect(() => {
    const fetchEco = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (activeCategory !== 'all') params.set('badge', activeCategory)
        const res = await fetch(`/api/eco-shop?${params}`)
        if (res.ok) {
          const data = await res.json()
          setEcoProducts(data.ecoProducts || [])
          setSummary(data.summary || null)
        }
      } catch {
        // silent
      }
      setLoading(false)
    }
    fetchEco()
  }, [activeCategory])

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return ecoProducts
    const q = searchQuery.toLowerCase()
    return ecoProducts.filter(p =>
      p.product?.name?.toLowerCase().includes(q) ||
      p.ecoBadge.toLowerCase().includes(q)
    )
  }, [ecoProducts, searchQuery])

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
              <Leaf className="h-5 w-5 text-emerald-500" /> Eco Shop
            </h1>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
            <Sprout className="h-3 w-3 mr-1" /> Green
          </Badge>
        </div>
      </div>

      {/* Impact Metrics */}
      {summary && (
        <div className="mx-4 mt-3 grid grid-cols-3 gap-2">
          {[
            { icon: Wind, label: 'CO Saved', value: `${summary.totalCo2.toFixed(1)}kg`, color: 'text-teal-500', bg: 'bg-teal-500/10' },
            { icon: Droplets, label: 'Water Saved', value: `${summary.totalWater}L`, color: 'text-sky-500', bg: 'bg-sky-500/10' },
            { icon: TreePine, label: 'Avg Score', value: `${summary.avgScore}`, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          ].map((metric, i) => (
            <motion.div
              key={i}
              className="rounded-xl border border-border/50 bg-card p-3 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full ${metric.bg}`}>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </div>
              <p className="mt-1.5 text-sm font-bold text-foreground">{metric.value}</p>
              <p className="text-[10px] text-muted-foreground">{metric.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Shop Green Pledge */}
      <div className="mx-4 mt-3 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-green-500/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sprout className="h-5 w-5 text-emerald-500" />
          <h3 className="text-sm font-bold text-foreground">Shop Green Pledge</h3>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
          Choose eco-friendly products and reduce your environmental footprint. Every green purchase makes a difference!
        </p>
        {!pledgeSigned ? (
          <Button
            className="w-full gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
            onClick={() => { setPledgeSigned(true); toast.success('Pledge signed! ') }}
          >
            <Award className="h-4 w-4" /> Take the Green Pledge
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-emerald-500 text-sm">
            <Award className="h-4 w-4" /> You pledged to shop green!
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="px-4 mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
        {(Object.keys(categoryConfig) as EcoCategory[]).map(key => {
          const cfg = categoryConfig[key]
          const isActive = activeCategory === key
          return (
            <motion.button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                isActive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : 'bg-muted/50 text-muted-foreground'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {(() => { const CatIcon = cfg.icon; return <CatIcon className="h-4 w-4" />; })()} {cfg.label}
            </motion.button>
          )
        })}
      </div>

      {/* Search */}
      <div className="px-4 mt-3 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search eco products..."
          className="pl-9 h-9 text-sm bg-muted/30 border-border/30"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Product Grid */}
      <div className="px-4 mt-3">
        {loading ? (
          <div className="grid grid-cols-2 gap-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card">
                <div className="aspect-[4/3] animate-pulse bg-muted" />
                <div className="p-3 space-y-2">
                  <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-2 w-full animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <motion.div className="flex flex-col items-center justify-center py-16 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <span className="text-5xl mb-4"></span>
            <p className="text-sm font-medium text-foreground">No eco products found</p>
            <p className="mt-1 text-xs text-muted-foreground">Check back for new green arrivals!</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filteredProducts.map((product, index) => {
              const wishlisted = isInWishlist(product.productId)
              return (
                <motion.div
                  key={product.id}
                  className="relative overflow-hidden rounded-2xl border border-border/50 bg-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Eco Badge */}
                  <div className="absolute top-2 left-2 z-10">
                    <Badge className="bg-emerald-500/90 text-white text-[9px]">
                      {product.badgeIcon || ''} {product.ecoBadge}
                    </Badge>
                  </div>
                  {/* Wishlist */}
                  <button
                    onClick={() => wishlisted ? removeFromWishlist(product.productId) : addToWishlist({ productId: product.productId, name: product.product.name, price: product.product.price, comparePrice: null, imageUrl: product.product.imageUrl })}
                    className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-background/60 backdrop-blur-sm"
                  >
                    <Heart className={`h-3 w-3 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                  </button>
                  {/* Image */}
                  <button className="w-full" onClick={() => goProduct(product.productId)}>
                    <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-emerald-500/10 to-green-500/5">
                      {product.product.imageUrl ? (
                        <img src={product.product.imageUrl} alt={product.product.name} className="h-full w-full object-cover" />
                      ) : (
                        <Leaf className="h-10 w-10 text-emerald-500/20" />
                      )}
                    </div>
                  </button>
                  <div className="p-2.5">
                    <button onClick={() => goProduct(product.productId)} className="w-full text-left">
                      <p className="text-xs font-medium text-foreground line-clamp-1">{product.product.name}</p>
                    </button>
                    <EcoRating score={product.ecoScore} />
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-sm font-bold text-foreground">{formatPrice(product.product.price)}</span>
                      <Button
                        size="sm"
                        className="h-6 gap-1 bg-emerald-500/10 px-2 text-[10px] text-emerald-500 hover:bg-emerald-500 hover:text-white"
                        onClick={() => {
                          addToCart({ productId: product.productId, name: product.product.name, price: product.product.price, quantity: 1, imageUrl: product.product.imageUrl })
                          toast.success('Added to cart!')
                        }}
                      >
                        <ShoppingCart className="h-3 w-3" /> Add
                      </Button>
                    </div>
                    {/* Impact */}
                    <div className="flex gap-2 mt-1.5 text-[9px] text-muted-foreground">
                      <span className="flex items-center gap-0.5"><Wind className="h-2.5 w-2.5" />{product.co2Saved}kg CO</span>
                      <span className="flex items-center gap-0.5"><Droplets className="h-2.5 w-2.5" />{product.waterSaved}L</span>
                    </div>
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
