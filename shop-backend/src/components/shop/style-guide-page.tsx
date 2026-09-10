'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, ShoppingBag, Star, Heart, Sparkles, Palette,
  Shirt, Eye, TrendingUp, Sun, Snowflake, Leaf, Zap,
  ChevronRight, Bookmark, Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useShopStore, type Product } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import { toast } from 'sonner'

interface StyleLook {
  id: string
  title: string
  description: string
  season: 'spring' | 'summer' | 'fall' | 'winter'
  products: Product[]
  tip: string
  difficulty: 'easy' | 'medium' | 'advanced'
  savedBy: number
  tags: string[]
}

const styleTips = [
  'Mix textures for a layered look that pops',
  'Stick to 2-3 colors for a cohesive palette',
  'Balance bold pieces with minimal basics',
  'Invest in versatile pieces that work across seasons',
  'Accessorize strategically  less is more',
  'Choose quality over quantity for timeless appeal',
]

const seasonIcons = { spring: Leaf, summer: Sun, fall: Palette, winter: Snowflake }
const seasonColors = {
  spring: 'from-emerald-500/20 to-green-600/10',
  summer: 'from-amber-500/20 to-orange-600/10',
  fall: 'from-orange-500/20 to-red-600/10',
  winter: 'from-sky-500/20 to-blue-600/10',
}

function StyleCard({ look, index }: { look: StyleLook; index: number }) {
  const { goProduct } = useShopRouter()
  const { addToCart, addToWishlist, isInWishlist, removeFromWishlist } = useShopStore()
  const [saved, setSaved] = useState(false)

  const totalPrice = look.products.reduce((s, p) => s + p.price, 0)
  const SeasonIcon = seasonIcons[look.season]

  const handleShopTheLook = () => {
    look.products.forEach((p) => {
      addToCart({ productId: p.id, name: p.name, price: p.price, quantity: 1, imageUrl: p.imageUrl })
    })
    toast.success(`${look.products.length} items added to cart!`, { description: `"${look.title}" look` })
  }

  return (
    <motion.div
      className="overflow-hidden rounded-2xl border border-border/50 bg-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
    >
      {/* Hero Section with Season Theme */}
      <div className={`relative bg-gradient-to-br ${seasonColors[look.season]} p-4`}>
        <div className="absolute right-3 top-3">
          <Badge className="bg-background/70 backdrop-blur-sm text-foreground text-[9px]">
            <SeasonIcon className="mr-0.5 h-3 w-3" />
            {look.season}
          </Badge>
        </div>
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-background/50 backdrop-blur-sm">
            <Shirt className="h-5 w-5 text-foreground/60" />
          </div>
          <div className="flex-1 min-w-0 pr-16">
            <h3 className="text-base font-bold text-foreground">{look.title}</h3>
            <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{look.description}</p>
          </div>
        </div>

        {/* Products in Look - Horizontal Scroll */}
        <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {look.products.map((product, i) => {
            const wishlisted = isInWishlist(product.id)
            return (
              <motion.button
                key={product.id}
                className="flex-shrink-0 relative w-20"
                onClick={() => goProduct(product.id)}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-background/50 backdrop-blur-sm border border-border/30">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <ShoppingBag className="h-6 w-6 text-muted-foreground/30" />
                  )}
                </div>
                <p className="mt-1 text-[9px] text-foreground line-clamp-1 text-center font-medium">{product.name}</p>
                <p className="text-[9px] text-muted-foreground text-center">{formatPrice(product.price)}</p>
                {i < look.products.length - 1 && (
                  <div className="absolute -right-1.5 top-8 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground">
                    +
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Style Tip */}
      <div className="mx-3 mt-3 rounded-lg bg-amber-500/5 border border-amber-500/10 px-2.5 py-1.5">
        <div className="flex items-start gap-1.5">
          <Info className="h-3 w-3 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-600 dark:text-amber-400 leading-relaxed">{look.tip}</p>
        </div>
      </div>

      {/* Tags */}
      <div className="flex gap-1.5 overflow-x-auto px-3 mt-2 scrollbar-hide">
        {look.tags.map((tag) => (
          <Badge key={tag} variant="outline" className="text-[9px] px-1.5 whitespace-nowrap">{tag}</Badge>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 pt-2 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground">{formatPrice(totalPrice)}</span>
          <Badge className={`text-[8px] px-1.5 ${
            look.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-500' :
            look.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-500' :
            'bg-rose-500/10 text-rose-500'
          }`}>
            {look.difficulty}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5">
          <motion.button
            onClick={() => {
              setSaved(!saved)
              toast.success(saved ? 'Unsaved' : 'Look saved!')
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/50"
            whileTap={{ scale: 0.85 }}
          >
            <Bookmark className={`h-3.5 w-3.5 ${saved ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground'}`} />
          </motion.button>
          <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={handleShopTheLook}>
            <ShoppingBag className="h-3.5 w-3.5" /> Shop the Look
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

export function StyleGuidePage() {
  const { goBack, goCategory } = useShopRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSeason, setActiveSeason] = useState<'all' | 'spring' | 'summer' | 'fall' | 'winter'>('all')
  const [currentTip, setCurrentTip] = useState(0)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
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
    fetchProducts()
  }, [])

  // Rotate style tips
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % styleTips.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Generate looks from products
  const looks: StyleLook[] = []
  const seasons: Array<'spring' | 'summer' | 'fall' | 'winter'> = ['spring', 'summer', 'fall', 'winter']

  for (let i = 0; i < Math.min(6, Math.floor(products.length / 3)); i++) {
    const startIdx = i * 3
    const lookProducts = products.slice(startIdx, startIdx + 3)
    if (lookProducts.length < 2) continue

    const season = seasons[i % 4]
    const lookNames = [
      'The Modern Professional',
      'Creative Studio Setup',
      'Minimal Developer Kit',
      'Startup Launch Pack',
      'Designer\'s Essential Bundle',
      'The Full Stack Combo',
    ]
    const descriptions = [
      'Everything you need for a polished, professional digital presence',
      'Curated tools for the creative mind  design meets functionality',
      'Clean, efficient, and powerful  less is more',
      'Launch your startup with the right foundation',
      'The designer\'s toolkit for creating stunning work',
      'Full stack of tools for the modern developer',
    ]
    const tips = [
      'Start with a strong foundation, then build layers of complexity',
      'Creative work thrives when your tools complement each other',
      'Minimal setups reduce decision fatigue and boost productivity',
      'Launch fast, iterate often  your tools should enable this',
      'Invest in tools that amplify your creative output',
      'A full stack approach means seamless integration across projects',
    ]
    const tagsOptions = [
      ['Professional', 'Clean', 'Corporate'],
      ['Creative', 'Bold', 'Modern'],
      ['Minimal', 'Efficient', 'Clean'],
      ['Startup', 'Growth', 'Agile'],
      ['Design', 'Aesthetic', 'Quality'],
      ['Developer', 'Full-Stack', 'Power'],
    ]
    const difficulties: Array<'easy' | 'medium' | 'advanced'> = ['easy', 'medium', 'advanced']

    looks.push({
      id: `look-${i}`,
      title: lookNames[i] || `Style #${i + 1}`,
      description: descriptions[i] || 'A curated combination of products',
      season,
      products: lookProducts,
      tip: tips[i] || 'Quality over quantity',
      difficulty: difficulties[i % 3],
      savedBy: 30 + i * 17,
      tags: tagsOptions[i] || ['Trending'],
    })
  }

  const filteredLooks = looks.filter((l) => activeSeason === 'all' || l.season === activeSeason)

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
              <Palette className="h-5 w-5 text-primary" /> Style Guide
            </h1>
            <p className="text-[11px] text-muted-foreground">Curated looks & combinations</p>
          </div>
        </div>
      </div>

      {/* Rotating Style Tip Banner */}
      <div className="mx-4 mt-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-orange-500/5 border border-amber-500/20 p-4">
        <div className="flex items-center gap-3">
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <Sparkles className="h-5 w-5 text-amber-500" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-amber-500 font-medium uppercase tracking-wider">Style Tip</p>
            <AnimatePresence mode="wait">
              <motion.p
                key={currentTip}
                className="text-sm text-foreground font-medium"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {styleTips[currentTip]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Season Filter */}
      <div className="mt-3 flex gap-2 overflow-x-auto px-4 scrollbar-hide">
        {[
          { key: 'all' as const, label: 'All Looks', icon: Eye },
          { key: 'spring' as const, label: 'Spring', icon: Leaf },
          { key: 'summer' as const, label: 'Summer', icon: Sun },
          { key: 'fall' as const, label: 'Fall', icon: Palette },
          { key: 'winter' as const, label: 'Winter', icon: Snowflake },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveSeason(s.key)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
              activeSeason === s.key ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground'
            }`}
          >
            <s.icon className="h-3 w-3" />
            {s.label}
          </button>
        ))}
      </div>

      {/* Trending Highlight */}
      <div className="mx-4 mt-3 flex items-center gap-2 rounded-xl bg-muted/30 border border-border/30 p-2.5">
        <TrendingUp className="h-4 w-4 text-emerald-500" />
        <span className="text-[11px] text-muted-foreground">
          <span className="font-medium text-foreground">{filteredLooks.length} curated looks</span>  Shop complete combinations
        </span>
      </div>

      {/* Looks Grid */}
      <div className="px-4 mt-3 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card">
              <div className="h-32 animate-pulse bg-muted" />
              <div className="flex flex-col gap-2 p-4">
                <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-3 w-full animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))
        ) : filteredLooks.length === 0 ? (
          <motion.div className="flex flex-col items-center justify-center py-16 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Palette className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-sm font-medium text-foreground">No looks available yet</p>
            <p className="mt-1 text-xs text-muted-foreground">We&apos;re creating new style guides!</p>
          </motion.div>
        ) : (
          filteredLooks.map((look, index) => (
            <StyleCard key={look.id} look={look} index={index} />
          ))
        )}
      </div>

      {/* CTA */}
      <div className="mx-4 mt-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-4 text-center">
        <Zap className="mx-auto h-6 w-6 text-primary mb-2" />
        <p className="text-sm font-semibold text-foreground mb-1">Create your own look!</p>
        <p className="text-xs text-muted-foreground mb-3">Mix and match products to build your perfect combination</p>
        <Button onClick={() => goCategory()} variant="outline" className="gap-2">
          Browse Products <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
    </motion.div>
  )
}
