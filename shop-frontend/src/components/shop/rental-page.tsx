'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Heart, ShoppingCart, Clock, Shield,
  Camera, Gamepad2, Wrench, Monitor, PartyPopper,
  Calendar, DollarSign, Info, CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import { toast } from 'sonner'

interface RentalProduct {
  id: string
  name: string
  dailyRate: number
  weeklyRate: number
  monthlyRate: number
  securityDeposit: number
  imageUrl: string | null
  category: string
}

type Duration = '1-day' | '3-days' | '1-week' | '1-month'
type RentalCategory = 'all' | 'electronics' | 'cameras' | 'tools' | 'gaming' | 'events'

const durationConfig: Record<Duration, { label: string; days: number }> = {
  '1-day': { label: '1 Day', days: 1 },
  '3-days': { label: '3 Days', days: 3 },
  '1-week': { label: '1 Week', days: 7 },
  '1-month': { label: '1 Month', days: 30 },
}

const categoryConfig: Record<RentalCategory, { label: string; icon: React.ElementType }> = {
  all: { label: 'All', icon: Monitor },
  electronics: { label: 'Electronics', icon: Monitor },
  cameras: { label: 'Cameras', icon: Camera },
  tools: { label: 'Tools', icon: Wrench },
  gaming: { label: 'Gaming', icon: Gamepad2 },
  events: { label: 'Events', icon: PartyPopper },
}



export function RentalPage() {
  const { goBack, goProduct } = useShopRouter()
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useShopStore()
  const [products, setProducts] = useState<RentalProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [duration, setDuration] = useState<Duration>('1-day')
  const [category, setCategory] = useState<RentalCategory>('all')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/rental')
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
    if (category === 'all') return products
    return products.filter(p => p.category === category)
  }, [products, category])

  const getRate = (product: RentalProduct) => {
    switch (duration) {
      case '1-day': return product.dailyRate
      case '3-days': return product.dailyRate * 3
      case '1-week': return product.weeklyRate
      case '1-month': return product.monthlyRate
    }
  }

  const getRateLabel = () => {
    switch (duration) {
      case '1-day': return '/day'
      case '3-days': return '/3 days'
      case '1-week': return '/week'
      case '1-month': return '/month'
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
              <Clock className="h-5 w-5 text-primary" /> Rent Products
            </h1>
          </div>
          <Badge className="bg-primary/10 text-primary border border-primary/30 text-[10px]">
            Rent
          </Badge>
        </div>
      </div>

      {/* Hero */}
      <div className="mx-4 mt-3 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-sky-500/5 p-4">
        <h2 className="text-lg font-bold text-foreground mb-1">Rent, Don&apos;t Buy</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Why buy when you can rent? Get premium products for a fraction of the cost. Perfect for short-term needs.
        </p>
      </div>

      {/* Duration Selector */}
      <div className="mx-4 mt-3">
        <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-primary" /> Rental Duration
        </h3>
        <div className="flex gap-2">
          {(Object.keys(durationConfig) as Duration[]).map(key => (
            <motion.button
              key={key}
              onClick={() => setDuration(key)}
              className={`flex-1 rounded-xl py-2 text-center text-xs font-medium transition-all ${
                duration === key ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted/50 text-muted-foreground border border-border/50'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {durationConfig[key].label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Security Deposit Info */}
      <div className="mx-4 mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-amber-500" />
          <div>
            <p className="text-[10px] font-medium text-foreground">Security Deposit Required</p>
            <p className="text-[9px] text-muted-foreground">Fully refundable upon return in good condition</p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="px-4 mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
        {(Object.keys(categoryConfig) as RentalCategory[]).map(key => {
          const cfg = categoryConfig[key]
          return (
            <motion.button
              key={key}
              onClick={() => setCategory(key)}
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                category === key ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-muted/50 text-muted-foreground'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {(() => { const CatIcon = cfg.icon; return <CatIcon className="h-4 w-4" />; })()} {cfg.label}
            </motion.button>
          )
        })}
      </div>

      {/* Products Grid */}
      <div className="px-4 mt-3">
        {loading ? (
          <div className="grid grid-cols-1 gap-2.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3 rounded-xl border border-border/50 bg-card p-3">
                <div className="h-20 w-20 flex-shrink-0 animate-pulse rounded-lg bg-muted" />
                <div className="flex-1 space-y-2"><div className="h-3 w-3/4 animate-pulse rounded bg-muted" /><div className="h-2 w-full animate-pulse rounded bg-muted" /></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div className="flex flex-col items-center justify-center py-16 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <span className="text-5xl mb-4"></span>
            <p className="text-sm font-medium text-foreground">No products in this category</p>
          </motion.div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((product, index) => {
              const wishlisted = isInWishlist(product.id)
              const rate = getRate(product)
              return (
                <motion.div
                  key={product.id}
                  className="flex gap-3 rounded-xl border border-border/50 bg-card p-3"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Image */}
                  <div className="flex-shrink-0 cursor-pointer" onClick={() => goProduct(product.id)}>
                    <div className="h-20 w-20 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary/10 to-sky-500/5">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover rounded-lg" />
                      ) : (
                        <Clock className="h-8 w-8 text-primary/20" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div onClick={() => goProduct(product.id)} className="w-full text-left cursor-pointer">
                      <p className="text-xs font-medium text-foreground line-clamp-1">{product.name}</p>
                    </div>
                    <p className="text-[9px] text-muted-foreground capitalize">{product.category}</p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-sm font-bold text-foreground">{formatPrice(rate)}</span>
                      <span className="text-[9px] text-muted-foreground">{getRateLabel()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-muted-foreground">
                      <Shield className="h-2.5 w-2.5" /> Deposit: {formatPrice(product.securityDeposit)}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        size="sm"
                        className="h-6 gap-1 bg-primary/10 px-2 text-[10px] text-primary hover:bg-primary hover:text-white flex-1"
                        onClick={() => {
                          addToCart({ productId: product.id, name: product.name, price: rate, quantity: 1, imageUrl: product.imageUrl })
                          toast.success('Added to cart! ')
                        }}
                      >
                        <ShoppingCart className="h-3 w-3" /> Rent
                      </Button>
                      <button
                        onClick={() => wishlisted ? removeFromWishlist(product.id) : addToWishlist({ productId: product.id, name: product.name, price: rate, comparePrice: null, imageUrl: product.imageUrl })}
                        className="h-6 w-6 flex items-center justify-center rounded-full bg-muted/50"
                      >
                        <Heart className={`h-3 w-3 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Rental Agreement Summary */}
      <div className="mx-4 mt-4 rounded-xl border border-border/50 bg-card p-3">
        <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-primary" /> Rental Agreement
        </h3>
        <div className="space-y-1.5">
          {[
            'Return product in original condition',
            'Security deposit refunded within 3-5 days',
            'Free damage protection included',
            'Late return fee: 1.5x daily rate per day',
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

