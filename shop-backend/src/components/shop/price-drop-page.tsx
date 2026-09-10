'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Heart, ShoppingCart, TrendingDown, Bell,
  Eye, ArrowUpDown, ChevronDown, BarChart3, AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import { toast } from 'sonner'

interface PriceDropProduct {
  id: string
  name: string
  originalPrice: number
  currentPrice: number
  imageUrl: string | null
  dropDate: string
  category: string
}

type DropFilter = 'all' | '10' | '20' | '30' | '50'
type SortOption = 'biggest' | 'newest' | 'price-low'

export function PriceDropPage() {
  const { goBack, goProduct } = useShopRouter()
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useShopStore()
  const [products, setProducts] = useState<PriceDropProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [dropFilter, setDropFilter] = useState<DropFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('biggest')
  const [showSort, setShowSort] = useState(false)
  const [watched, setWatched] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/price-drop')
        if (res.ok) {
          const data = await res.json()
          if (data.products?.length) setProducts(data.products)
        }
      } catch { /* silent */ }
      setLoading(false)
    }
    fetchData()
  }, [])

  const getDropPercent = (p: PriceDropProduct) => Math.round((1 - p.currentPrice / p.originalPrice) * 100)

  const filtered = useMemo(() => {
    let result = [...products]
    if (dropFilter !== 'all') {
      const minDrop = parseInt(dropFilter)
      result = result.filter(p => getDropPercent(p) >= minDrop)
    }
    switch (sortBy) {
      case 'biggest': result.sort((a, b) => getDropPercent(b) - getDropPercent(a)); break
      case 'newest': result.sort((a, b) => { /* [] sort by recency */ return 0 }); break
      case 'price-low': result.sort((a, b) => a.currentPrice - b.currentPrice); break
    }
    return result
  }, [products, dropFilter, sortBy])

  const toggleWatch = (id: string) => {
    setWatched(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id); toast.info('Price alert removed') }
      else { next.add(id); toast.success('You\'ll be notified of price changes ') }
      return next
    })
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
              <TrendingDown className="h-5 w-5 text-red-500" /> Price Drops
            </h1>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setShowSort(!showSort)} className="text-muted-foreground">
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
        {/* Sort dropdown */}
        <AnimatePresence>
          {showSort && (
            <motion.div className="mt-2 flex gap-2" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              {[
                { key: 'biggest' as SortOption, label: 'Biggest Drop' },
                { key: 'newest' as SortOption, label: 'Newest' },
                { key: 'price-low' as SortOption, label: 'Price Low-High' },
              ].map(opt => (
                <button key={opt.key} onClick={() => { setSortBy(opt.key); setShowSort(false) }}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${sortBy === opt.key ? 'bg-primary/10 text-primary' : 'bg-muted/50 text-muted-foreground'}`}>
                  {opt.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Summary Banner */}
      <div className="mx-4 mt-3 rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-orange-500/5 p-4">
        <div className="flex items-center gap-2 mb-1">
          <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <TrendingDown className="h-5 w-5 text-red-500" />
          </motion.div>
          <h2 className="text-lg font-bold text-foreground">Prices Just Dropped!</h2>
        </div>
        <p className="text-xs text-muted-foreground">{filtered.length} products with recent price reductions</p>
      </div>

      {/* Drop % Filter */}
      <div className="px-4 mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
        {(['all', '10', '20', '30', '50'] as DropFilter[]).map(key => (
          <motion.button
            key={key}
            onClick={() => setDropFilter(key)}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
              dropFilter === key ? 'bg-red-500/10 text-red-500 border border-red-500/30' : 'bg-muted/50 text-muted-foreground'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            {key === 'all' ? 'All' : `${key}%+`}
          </motion.button>
        ))}
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
            <p className="text-sm font-medium text-foreground">No drops in this range</p>
            <p className="mt-1 text-xs text-muted-foreground">Try a different filter</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filtered.map((product, index) => {
              const wishlisted = isInWishlist(product.id)
              const drop = getDropPercent(product)
              return (
                <motion.div
                  key={product.id}
                  className="relative overflow-hidden rounded-2xl border border-border/50 bg-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Drop Badge */}
                  <div className="absolute top-2 left-2 z-10">
                    <Badge className="bg-red-500/90 text-white text-[9px] font-bold">
                      <TrendingDown className="h-2.5 w-2.5 mr-0.5" /> -{drop}%
                    </Badge>
                  </div>
                  {/* Watch Button */}
                  <button onClick={() => toggleWatch(product.id)} className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-background/60 backdrop-blur-sm">
                    <Bell className={`h-3 w-3 ${watched.has(product.id) ? 'text-amber-500 fill-amber-500' : 'text-white'}`} />
                  </button>
                  {/* Image */}
                  <button className="w-full" onClick={() => goProduct(product.id)}>
                    <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-red-500/10 to-orange-500/5">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <TrendingDown className="h-10 w-10 text-red-500/20" />
                      )}
                    </div>
                  </button>
                  <div className="p-2.5">
                    <button onClick={() => goProduct(product.id)} className="w-full text-left">
                      <p className="text-xs font-medium text-foreground line-clamp-1">{product.name}</p>
                    </button>
                    <p className="text-[9px] text-muted-foreground">{product.dropDate}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-sm font-bold text-foreground">{formatPrice(product.currentPrice)}</span>
                      <span className="text-[10px] text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                    </div>
                    {/* Mini price chart placeholder */}
                    <div className="mt-1.5 flex items-center gap-1">
                      <BarChart3 className="h-3 w-3 text-muted-foreground" />
                      <div className="flex-1 h-3 rounded bg-muted/30 overflow-hidden">
                        <motion.div className="h-full bg-gradient-to-r from-red-500/40 to-red-500/10 rounded" initial={{ width: 0 }} animate={{ width: `${drop}%` }} transition={{ duration: 0.5 }} />
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="mt-1.5 h-6 w-full gap-1 bg-red-500/10 px-2 text-[10px] text-red-500 hover:bg-red-500 hover:text-white"
                      onClick={() => {
                        addToCart({ productId: product.id, name: product.name, price: product.currentPrice, quantity: 1, imageUrl: product.imageUrl })
                        toast.success('Added to cart! ')
                      }}
                    >
                      <ShoppingCart className="h-3 w-3" /> Add
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
