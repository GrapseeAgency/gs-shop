'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Heart, ShoppingCart, Moon, Sun, Clock,
  Zap, Flame, Eye, Sparkles, Timer, Lock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import { toast } from 'sonner'

interface DarkStoreProduct {
  id: string
  name: string
  price: number
  originalPrice: number
  imageUrl: string | null
  isFlashDeal: boolean
  category: string
}



function CountdownTimer({ targetHour, label }: { targetHour: number; label: string }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const calc = () => {
      const now = new Date()
      const target = new Date(now)
      target.setHours(targetHour, 0, 0, 0)
      if (target <= now) target.setDate(target.getDate() + 1)
      const diff = target.getTime() - now.getTime()
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft({ hours: h, minutes: m, seconds: s })
    }
    calc()
    const interval = setInterval(calc, 1000)
    return () => clearInterval(interval)
  }, [targetHour])

  return (
    <div className="flex items-center gap-1.5">
      <Timer className="h-3.5 w-3.5 text-amber-400" />
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <div className="flex gap-1">
        {[
          { val: timeLeft.hours, label: 'H' },
          { val: timeLeft.minutes, label: 'M' },
          { val: timeLeft.seconds, label: 'S' },
        ].map((t, i) => (
          <div key={i} className="flex items-center gap-0.5">
            <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded bg-amber-500/20 text-[10px] font-bold text-amber-400 px-1">
              {String(t.val).padStart(2, '0')}
            </span>
            {i < 2 && <span className="text-[10px] text-amber-400/50">:</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

export function DarkStorePage() {
  const { goBack, goProduct } = useShopRouter()
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist, darkStoreOpen, setDarkStoreOpen } = useShopStore()
  const [products, setProducts] = useState<DarkStoreProduct[]>([])
  const [loading, setLoading] = useState(true)

  const currentHour = new Date().getHours()
  const isOpen = currentHour >= 22 || currentHour < 6
  const openHour = isOpen ? 6 : 22

  useEffect(() => {
    setDarkStoreOpen(isOpen)
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/dark-store')
        if (res.ok) {
          const data = await res.json()
          if (data.products?.length) setProducts(data.products)
        }
      } catch { /* silent */ }
      setLoading(false)
    }
    fetchData()
  }, [isOpen, setDarkStoreOpen])

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
              <Moon className="h-5 w-5 text-violet-400" /> Dark Store
            </h1>
          </div>
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="open" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
                <Badge className="bg-emerald-500/90 text-white text-[10px] gap-1">
                  <Flame className="h-3 w-3" /> Open Now
                </Badge>
              </motion.div>
            ) : (
              <motion.div key="closed" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
                <Badge className="bg-muted text-muted-foreground text-[10px] gap-1">
                  <Lock className="h-3 w-3" /> Opens at 10PM
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Hero */}
      <div className="mx-4 mt-3 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-950/40 to-slate-950/60 p-4">
        <div className="flex items-center gap-2 mb-2">
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
            <Moon className="h-6 w-6 text-violet-400" />
          </motion.div>
          <h2 className="text-xl font-bold text-foreground">After-Hours Exclusive</h2>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          The Dark Store opens when the rest close. Exclusive late-night deals available only from 10PM to 6AM.
        </p>
        <CountdownTimer targetHour={openHour} label={isOpen ? 'Closes in' : 'Opens in'} />
      </div>

      {/* Flash Deal Banner */}
      {isOpen && (
        <motion.div className="mx-4 mt-3 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              <Zap className="h-5 w-5 text-amber-400" />
            </motion.div>
            <div className="flex-1">
              <p className="text-xs font-bold text-amber-400">Flash Deals Active!</p>
              <p className="text-[10px] text-muted-foreground">Special pricing only available tonight</p>
            </div>
            <Eye className="h-4 w-4 text-amber-400/60" />
          </div>
        </motion.div>
      )}

      {/* Night Theme Indicator */}
      <div className="mx-4 mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-400" />
          <span className="text-xs font-medium text-foreground">Late-Night Exclusives</span>
        </div>
        <span className="text-[10px] text-muted-foreground">{products.length} deals</span>
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
        ) : products.length === 0 ? (
          <motion.div className="flex flex-col items-center justify-center py-16 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <span className="text-5xl mb-4"></span>
            <p className="text-sm font-medium text-foreground">The Dark Store is sleeping</p>
            <p className="mt-1 text-xs text-muted-foreground">Come back after 10PM for exclusive deals</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {products.map((product, index) => {
              const wishlisted = isInWishlist(product.id)
              const discount = Math.round((1 - product.price / product.originalPrice) * 100)
              return (
                <motion.div
                  key={product.id}
                  className={`relative overflow-hidden rounded-2xl border bg-card ${product.isFlashDeal ? 'border-amber-500/40' : 'border-border/50'}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Badges */}
                  <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                    {product.isFlashDeal && (
                      <Badge className="bg-amber-500/90 text-white text-[9px] gap-0.5">
                        <Zap className="h-2.5 w-2.5" /> Flash
                      </Badge>
                    )}
                    <Badge className="bg-red-500/90 text-white text-[9px]">-{discount}%</Badge>
                  </div>
                  {/* Wishlist */}
                  <button
                    onClick={() => wishlisted ? removeFromWishlist(product.id) : addToWishlist({ productId: product.id, name: product.name, price: product.price, comparePrice: product.originalPrice, imageUrl: product.imageUrl })}
                    className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-background/60 backdrop-blur-sm"
                  >
                    <Heart className={`h-3 w-3 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                  </button>
                  {/* Image */}
                  <div className="w-full cursor-pointer" onClick={() => goProduct(product.id)}>
                    <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-violet-950/30 to-slate-950/40">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <Moon className="h-10 w-10 text-violet-400/20" />
                      )}
                    </div>
                  </div>
                  <div className="p-2.5">
                    <div onClick={() => goProduct(product.id)} className="w-full text-left cursor-pointer">
                      <p className="text-xs font-medium text-foreground line-clamp-1">{product.name}</p>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-sm font-bold text-foreground">{formatPrice(product.price)}</span>
                      <span className="text-[10px] text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
                    </div>
                    <Button
                      size="sm"
                      className={`mt-1.5 h-6 w-full gap-1 text-[10px] ${product.isFlashDeal ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white' : 'bg-violet-500/10 text-violet-500 hover:bg-violet-500 hover:text-white'}`}
                      onClick={() => {
                        addToCart({ productId: product.id, name: product.name, price: product.price, quantity: 1, imageUrl: product.imageUrl })
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

