'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Heart, ShoppingCart, Gift,
  GraduationCap, Stethoscope, TreePine, ShieldAlert,
  DollarSign, UtensilsCrossed, Trees, TrendingUp,
  Share2, Info, ChevronRight, HandHeart, Frown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import { toast } from 'sonner'

interface CharityProduct {
  id: string
  name: string
  price: number
  imageUrl: string | null
  cause: string
  donationPercent: number
  partner: string
}

type CauseFilter = 'all' | 'education' | 'health' | 'environment' | 'disaster-relief'

const causeConfig: Record<CauseFilter, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  all: { label: 'All', icon: Gift, color: 'text-primary', bg: 'bg-primary/10' },
  education: { label: 'Education', icon: GraduationCap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  health: { label: 'Health', icon: Stethoscope, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  environment: { label: 'Environment', icon: TreePine, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  'disaster-relief': { label: 'Disaster Relief', icon: ShieldAlert, color: 'text-orange-500', bg: 'bg-orange-500/10' },
}

function AnimatedCounter({ value, label, icon: Icon, color, prefix = '', suffix = '' }: { value: number; label: string; icon: React.ElementType; color: string; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = Math.max(1, Math.floor(value / 40))
    const timer = setInterval(() => {
      start += step
      if (start >= value) { start = value; clearInterval(timer) }
      setCount(start)
    }, 30)
    return () => clearInterval(timer)
  }, [value])
  return (
    <motion.div className="rounded-xl border border-border/50 bg-card p-3 text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full ${color.replace('text-', 'bg-').replace(/-\d+$/, '-500/10')}`}>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <p className="mt-1.5 text-sm font-bold text-foreground">{prefix}{count.toLocaleString()}{suffix}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </motion.div>
  )
}

export function CharityShopPage() {
  const { goBack, goProduct } = useShopRouter()
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useShopStore()
  const [products, setProducts] = useState<CharityProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activeCause, setActiveCause] = useState<CauseFilter>('all')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(false)
      try {
        const res = await fetch('/api/charity-shop')
        if (res.ok) {
          const data = await res.json()
          if (data.products?.length) setProducts(data.products)
        } else {
          setError(true)
        }
      } catch {
        setError(true)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const filtered = useMemo(() => {
    if (activeCause === 'all') return products
    return products.filter(p => p.cause === activeCause)
  }, [products, activeCause])

  const totalDonated = 124500
  const mealsProvided = 8520
  const treesPlanted = 3250

  const totalImpact = useCallback(() => {
    const donationTotal = filtered.reduce((sum, p) => sum + (p.price * p.donationPercent / 100), 0)
    return donationTotal
  }, [filtered])

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
              <HandHeart className="h-5 w-5 text-primary" /> Shop for a Cause
            </h1>
          </div>
          <Badge className="bg-primary/10 text-primary border border-primary/30 text-[10px]">
             Charity
          </Badge>
        </div>
      </div>

      {/* Hero Section */}
      <div className="mx-4 mt-3 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-pink-500/5 p-4">
        <motion.h2 className="text-xl font-bold text-foreground mb-1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          Every Purchase Gives Back
        </motion.h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Shop with purpose. A portion of every purchase goes directly to charity partners making a real difference in communities worldwide.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-primary">Over $124K donated this year</span>
        </div>
        {/* Your impact for current filter */}
        <div className="mt-2 rounded-lg bg-background/50 p-2">
          <div className="flex items-center gap-1.5">
            <Info className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">
              Viewing {filtered.length} products  {formatPrice(totalImpact())} total potential donation
            </span>
          </div>
        </div>
      </div>

      {/* Impact Metrics */}
      <div className="mx-4 mt-3 grid grid-cols-3 gap-2">
        <AnimatedCounter value={totalDonated} label="Total Donated" icon={DollarSign} color="text-primary" prefix="$" />
        <AnimatedCounter value={mealsProvided} label="Meals Provided" icon={UtensilsCrossed} color="text-orange-500" />
        <AnimatedCounter value={treesPlanted} label="Trees Planted" icon={Trees} color="text-emerald-500" />
      </div>

      {/* Charity Partners */}
      <div className="mx-4 mt-4">
        <h3 className="text-sm font-bold text-foreground mb-2">Our Charity Partners</h3>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {[
            { name: 'Books for All', cause: 'education', icon: GraduationCap, color: 'bg-amber-500/10 text-amber-500', desc: '12K children helped' },
            { name: 'MedReach', cause: 'health', icon: Stethoscope, color: 'bg-rose-500/10 text-rose-500', desc: '8K patients served' },
            { name: 'Green Tomorrow', cause: 'environment', icon: TreePine, color: 'bg-emerald-500/10 text-emerald-500', desc: '3K+ trees planted' },
            { name: 'RapidAid', cause: 'disaster-relief', icon: ShieldAlert, color: 'bg-orange-500/10 text-orange-500', desc: '5K families aided' },
          ].map((partner, i) => (
            <motion.button key={i} className="flex-shrink-0 rounded-xl border border-border/50 bg-card p-3 min-w-[130px] text-left" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileTap={{ scale: 0.97 }} onClick={() => setActiveCause(partner.cause as CauseFilter)}>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${partner.color}`}>
                <partner.icon className="h-4 w-4" />
              </div>
              <p className="mt-1.5 text-xs font-medium text-foreground">{partner.name}</p>
              <p className="text-[9px] text-muted-foreground">{partner.desc}</p>
              <ChevronRight className="h-3 w-3 text-muted-foreground mt-1" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Cause Filter */}
      <div className="px-4 mt-4 flex gap-2 overflow-x-auto scrollbar-hide">
        {(Object.keys(causeConfig) as CauseFilter[]).map(key => {
          const cfg = causeConfig[key]
          const isActive = activeCause === key
          return (
            <motion.button
              key={key}
              onClick={() => setActiveCause(key)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                isActive ? `${cfg.bg} ${cfg.color} border border-current/30` : 'bg-muted/50 text-muted-foreground'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {(() => { const Icon = cfg.icon; return <Icon className="h-4 w-4" />; })()} {cfg.label}
            </motion.button>
          )
        })}
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
        ) : error ? (
          <motion.div className="flex flex-col items-center justify-center py-16 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <span className="mb-4"><Frown className="h-12 w-12 text-muted-foreground" /></span>
            <p className="text-sm font-medium text-foreground">Failed to load charity products</p>
            <Button variant="outline" size="sm" className="mt-3 text-xs" onClick={() => window.location.reload()}>Try Again</Button>
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div className="flex flex-col items-center justify-center py-16 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <span className="mb-4"><Heart className="h-14 w-14 text-muted-foreground" /></span>
            <p className="text-sm font-medium text-foreground">No products found for this cause</p>
            <p className="mt-1 text-xs text-muted-foreground">Try selecting a different cause</p>
            <Button variant="outline" size="sm" className="mt-3 text-xs" onClick={() => setActiveCause('all')}>View All</Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filtered.map((product, index) => {
              const wishlisted = isInWishlist(product.id)
              const donationAmt = (product.price * product.donationPercent / 100)
              const causeCfg = causeConfig[product.cause as CauseFilter] || causeConfig.all
              return (
                <motion.div
                  key={product.id}
                  className="relative overflow-hidden rounded-2xl border border-border/50 bg-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                    <Badge className="bg-primary/90 text-white text-[9px] flex items-center gap-0.5">
                      <Heart className="h-3 w-3" /> {product.donationPercent}% donated
                    </Badge>
                    <Badge className={`${causeCfg.bg} ${causeCfg.color} text-[8px] flex items-center gap-0.5`}>
                      {(() => { const CauseIcon = causeCfg.icon; return <CauseIcon className="h-3 w-3" />; })()} {causeCfg.label}
                    </Badge>
                  </div>
                  <button
                    onClick={() => wishlisted ? removeFromWishlist(product.id) : addToWishlist({ productId: product.id, name: product.name, price: product.price, comparePrice: null, imageUrl: product.imageUrl })}
                    className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-background/60 backdrop-blur-sm"
                  >
                    <Heart className={`h-3 w-3 ${wishlisted ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                  </button>
                  <button className="w-full" onClick={() => goProduct(product.id)}>
                    <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-primary/10 to-pink-500/5">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <Gift className="h-10 w-10 text-primary/20" />
                      )}
                    </div>
                  </button>
                  <div className="p-2.5">
                    <button onClick={() => goProduct(product.id)} className="w-full text-left">
                      <p className="text-xs font-medium text-foreground line-clamp-1">{product.name}</p>
                    </button>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{product.partner}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <div>
                        <span className="text-sm font-bold text-foreground">{formatPrice(product.price)}</span>
                        <p className="text-[9px] text-primary">{formatPrice(donationAmt)} donated</p>
                      </div>
                      <Button
                        size="sm"
                        className="h-6 gap-1 bg-primary/10 px-2 text-[10px] text-primary hover:bg-primary hover:text-white"
                        onClick={() => {
                          addToCart({ productId: product.id, name: product.name, price: product.price, quantity: 1, imageUrl: product.imageUrl })
                          toast.success(`${formatPrice(donationAmt)} will be donated! `)
                        }}
                      >
                        <ShoppingCart className="h-3 w-3" /> Add
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Share Impact CTA */}
      <div className="mx-4 mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3">
        <div className="flex items-center gap-3">
          <Share2 className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="text-xs font-medium text-foreground">Spread the Word</p>
            <p className="text-[9px] text-muted-foreground">Share this cause with friends and amplify the impact</p>
          </div>
          <Button size="sm" variant="outline" className="text-[10px] h-7" onClick={() => {
            if (navigator.share) {
              navigator.share({ title: 'Grapsee Charity Shop', text: 'Shop for a cause! Every purchase makes a difference. ' })
            } else {
              navigator.clipboard.writeText('Shop for a cause on Grapsee! Every purchase makes a difference. ')
              toast.success('Link copied!')
            }
          }}>
            Share
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
