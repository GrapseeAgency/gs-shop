'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Sun, Snowflake, Leaf, Flower2, Star, ShoppingCart,
  Heart, Filter, Search, Sparkles, CloudSun, Wind, Umbrella,
  Thermometer, TreePine, Palette,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useShopStore, type Product } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import { toast } from 'sonner'

type Season = 'spring' | 'summer' | 'fall' | 'winter'

const seasonConfig: Record<Season, {
  label: string
  icon: React.ElementType
  gradient: string
  bgGradient: string
  colors: string
  border: string
  description: string
}> = {
  spring: {
    label: 'Spring',
    icon: Flower2,
    gradient: 'from-emerald-500/20 to-green-600/20',
    bgGradient: 'from-emerald-500/15 via-green-500/10 to-lime-500/5',
    colors: 'text-emerald-500',
    border: 'border-emerald-500/30',
    description: 'Fresh starts, fresh deals',
  },
  summer: {
    label: 'Summer',
    icon: Sun,
    gradient: 'from-amber-500/20 to-orange-600/20',
    bgGradient: 'from-amber-500/15 via-orange-500/10 to-yellow-500/5',
    colors: 'text-amber-500',
    border: 'border-amber-500/30',
    description: 'Hot deals for hot days',
  },
  fall: {
    label: 'Fall',
    icon: Leaf,
    gradient: 'from-orange-500/20 to-red-600/20',
    bgGradient: 'from-orange-500/15 via-red-500/10 to-amber-500/5',
    colors: 'text-orange-500',
    border: 'border-orange-500/30',
    description: 'Cozy vibes, cozy prices',
  },
  winter: {
    label: 'Winter',
    icon: Snowflake,
    gradient: 'from-sky-500/20 to-blue-600/20',
    bgGradient: 'from-sky-500/15 via-blue-500/10 to-indigo-500/5',
    colors: 'text-sky-500',
    border: 'border-sky-500/30',
    description: 'Warm up with cool savings',
  },
}

function SeasonalProductCard({ product, index, season }: { product: Product; index: number; season: Season }) {
  const { goProduct } = useShopRouter()
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useShopStore()
  const config = seasonConfig[season]
  const wishlisted = isInWishlist(product.id)
  const discount = product.comparePrice ? Math.round((1 - product.price / product.comparePrice) * 100) : 0

  return (
    <motion.div
      className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="w-full text-left cursor-pointer" onClick={() => goProduct(product.id)}>
        <div className={`flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br ${config.gradient}`}>
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <span className="opacity-30">{(() => { const Icon = config.icon; return <Icon className="h-14 w-14" />; })()}</span>
          )}
          {discount > 0 && (
            <Badge className="absolute left-2 top-2 bg-destructive/90 text-white text-[10px]">
              -{discount}%
            </Badge>
          )}
        </div>
      </div>

      <div className="p-3">
        <div onClick={() => goProduct(product.id)} className="w-full text-left cursor-pointer">
          <h3 className="text-sm font-bold text-foreground line-clamp-1">{product.name}</h3>
          <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{product.description}</p>
        </div>
        <div className="mt-1 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className={`h-3 w-3 ${s <= 4 ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'}`} />
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-foreground">{formatPrice(product.price)}</span>
            {product.comparePrice && (
              <span className="text-[11px] text-muted-foreground line-through">{formatPrice(product.comparePrice)}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (wishlisted) removeFromWishlist(product.id)
                else addToWishlist({ productId: product.id, name: product.name, price: product.price, comparePrice: product.comparePrice, imageUrl: product.imageUrl })
              }}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-muted/50"
            >
              <Heart className={`h-3.5 w-3.5 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
            </button>
            <Button
              size="sm"
              className="h-7 gap-1 bg-primary/10 px-2.5 text-[11px] text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={() => {
                addToCart({ productId: product.id, name: product.name, price: product.price, quantity: 1, imageUrl: product.imageUrl })
                toast.success('Added to cart!')
              }}
            >
              <ShoppingCart className="h-3 w-3" />Add
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function SeasonalPage() {
  const { goBack, goCategory } = useShopRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSeason, setActiveSeason] = useState<Season>('spring')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchSeasonal = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/seasonal?season=${activeSeason}`)
        if (res.ok) {
          const data = await res.json()
          const raw = Array.isArray(data) ? data : data.data || []
          if (raw.length > 0) {
            setProducts(raw)
            setLoading(false)
            return
          }
        }
      } catch {
        // fallback
      }

      // Fallback to products API
      try {
        const res = await fetch('/api/products?limit=20')
        if (res.ok) {
          const data = await res.json()
          setProducts(Array.isArray(data) ? data : data.data || [])
        }
      } catch {
        // silent
      }
      setLoading(false)
    }
    fetchSeasonal()
  }, [activeSeason])

  const config = seasonConfig[activeSeason]
  const Icon = config.icon

  const filteredProducts = products.filter((p) => {
    if (!searchQuery) return true
    return p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // Festive floating icons
  const festiveIcons: string[] = activeSeason === 'spring' ? ['flower', 'sparkle', 'star', 'confetti'] :
    activeSeason === 'summer' ? ['sun', 'fire', 'star', 'sparkle'] :
    activeSeason === 'fall' ? ['leaf', 'party', 'star', 'gift'] :
    ['snowflake', 'star', 'gift', 'confetti']

  return (
    <motion.div className="pb-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack} className="flex-shrink-0 text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" /> Seasonal Shop
            </h1>
            <p className="text-[11px] text-muted-foreground">{config.description}</p>
          </div>
        </div>
      </div>

      {/* Seasonal Banner with Floating Animated Icons */}
      <div className={`relative mx-4 mt-3 overflow-hidden rounded-2xl bg-gradient-to-r ${config.bgGradient} border ${config.border} p-6`}>
        {/* Floating festive animated icons */}
        {festiveIcons.map((iconKey, i) => (
          <motion.span
            key={i}
            className="absolute opacity-30 pointer-events-none"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.3, 0],
              scale: [0.5, 1.2, 0.8],
              y: [0, -20, -40],
              x: [0, (i % 2 === 0 ? 10 : -10)],
            }}
            transition={{
              repeat: Infinity,
              duration: 4 + i,
              delay: i * 0.8,
            }}
            style={{
              left: `${15 + i * 20}%`,
              top: '50%',
            }}
          >
            {(() => { const Icon = config.icon; return <Icon className="h-6 w-6 text-white" />; })()}
          </motion.span>
        ))}

        <div className="relative z-10 flex flex-col items-center text-center">
          <motion.span
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            {(() => { const Icon = config.icon; return <Icon className="h-12 w-12" />; })()}
          </motion.span>
          <h2 className="mt-2 text-2xl font-bold text-foreground">{config.label} Collection</h2>
          <p className="mt-1 text-sm text-muted-foreground">{config.description}</p>
          <div className="mt-3 flex gap-2">
            <Badge className={`${config.colors} border ${config.border}`} variant="outline">
              <Sparkles className="mr-1 h-3 w-3" />Trending
            </Badge>
            <Badge variant="outline" className={config.border}>
              <Thermometer className="mr-1 h-3 w-3" />Season Picks
            </Badge>
          </div>
        </div>
      </div>

      {/* Season Selector */}
      <div className="mt-3 flex gap-2 px-4 overflow-x-auto scrollbar-hide">
        {(Object.keys(seasonConfig) as Season[]).map((season) => {
          const sc = seasonConfig[season]
          const SIcon = sc.icon
          const isActive = activeSeason === season
          return (
            <motion.button
              key={season}
              onClick={() => setActiveSeason(season)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? `bg-gradient-to-r ${sc.gradient} ${sc.colors} border ${sc.border} shadow-sm`
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <SIcon className="h-3.5 w-3.5" />
              {(() => { const Icon = sc.icon; return <Icon className="h-3.5 w-3.5" />; })()}
              {sc.label}
            </motion.button>
          )
        })}
      </div>

      {/* Search */}
      <div className="px-4 mt-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={`Search ${config.label} products...`}
            className="pl-9 h-9 text-sm bg-muted/30 border-border/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Results count */}
      <div className="px-4 mt-2 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          {filteredProducts.length} products in {config.label}
        </span>
        <Button variant="ghost" size="sm" className="h-6 gap-1 text-[10px] text-muted-foreground">
          <Filter className="h-3 w-3" /> Sort
        </Button>
      </div>

      {/* Products Grid */}
      <div className="px-4 mt-2">
        {loading ? (
          <div className="grid grid-cols-2 gap-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card">
                <div className="aspect-[4/3] animate-pulse bg-muted" />
                <div className="flex flex-col gap-2 p-3">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-full animate-pulse rounded bg-muted" />
                  <div className="h-5 w-16 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <motion.div className="flex flex-col items-center justify-center py-16 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <span className="mb-4">{(() => { const SeasonIcon = config.icon; return <SeasonIcon className="h-16 w-16 text-muted-foreground" />; })()}</span>
            <p className="text-sm font-medium text-foreground">No {config.label.toLowerCase()} products yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Check back soon for seasonal deals!</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filteredProducts.map((product, index) => (
              <SeasonalProductCard key={product.id} product={product} index={index} season={activeSeason} />
            ))}
          </div>
        )}
      </div>

      {/* Season CTA */}
      <div className={`mx-4 mt-6 rounded-2xl bg-gradient-to-r ${config.bgGradient} border ${config.border} p-4 text-center`}>
        <Icon className={`mx-auto h-6 w-6 ${config.colors} mb-2`} />
        <p className="text-sm font-semibold text-foreground mb-1">{config.label} deals refresh weekly!</p>
        <p className="text-xs text-muted-foreground mb-3">Don&apos;t miss out on limited-time seasonal offers</p>
        <Button onClick={() => goCategory()} variant="outline" className={`gap-2 ${config.border} ${config.colors} hover:opacity-80`}>
          Browse All Products
        </Button>
      </div>
    </motion.div>
  )
}

