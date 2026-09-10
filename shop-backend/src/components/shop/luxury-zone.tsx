'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Crown, Diamond, Star, ArrowRight, Sparkles, Shield, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useShopStore, type Product } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'

interface LuxuryZoneProps {
  // No props needed - strictly uses API data
}

interface LuxuryProduct {
  id: string
  name: string
  slug: string
  price: number
  comparePrice?: number | null
  imageUrl: string | null
  description?: string | null
  rating?: number | null
}

export function LuxuryZone() {
  const { addToCart } = useShopStore()
  const { goLuxury, goProduct } = useShopRouter()
  const [luxuryProducts, setLuxuryProducts] = useState<LuxuryProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLuxuryProducts = async () => {
      try {
        const res = await fetch('/api/luxury-zone')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        
        if (data.success && data.products && data.products.length > 0) {
          setLuxuryProducts(data.products.slice(0, 3))
        }
        // NO FALLBACK - strictly hide if no admin-marked luxury products
      } catch (error) {
        // Silent fail - no fallback, component stays hidden
      } finally {
        setLoading(false)
      }
    }
    
    fetchLuxuryProducts()
  }, [])

  // Silent - don't show if no luxury products
  if (!loading && luxuryProducts.length === 0) return null

  return (
    <section className="py-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20">
            <Crown className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Luxury Zone</h2>
            <p className="text-[10px] text-muted-foreground">Premium tier excellence</p>
          </div>
        </div>
        <button
          onClick={() => goLuxury()}
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          View All
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="space-y-3 px-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {/* Luxury Cards - Full width stacked */}
      {!loading && (
      <div className="space-y-3 px-4">
        {luxuryProducts.map((product, index) => {
          const discount = product.comparePrice
            ? Math.round((1 - product.price / product.comparePrice) * 100)
            : 0

          return (
            <motion.div
              key={product.id}
              className="group relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              {/* Premium Badge */}
              <div className="absolute right-3 top-3 z-10">
                <Badge className="bg-amber-500/90 text-white shadow-md">
                  <Diamond className="mr-1 h-3 w-3" />
                  PREMIUM
                </Badge>
              </div>

              {/* Decorative shimmer */}
              <div className="absolute inset-0 animate-shimmer opacity-30" />

              <div className="relative flex gap-3 p-3">
                {/* Image */}
                <button
                  className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-amber-500/15 to-amber-500/5"
                  onClick={() => goProduct(product.id)}
                >
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <span className="text-3xl opacity-30"></span>
                  )}
                </button>

                {/* Info */}
                <div className="flex flex-1 flex-col justify-between py-0.5">
                  <div>
                    <h3 className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-amber-400 transition-colors">
                      {product.name}
                    </h3>
                    <p className="mt-0.5 text-[10px] text-muted-foreground line-clamp-1">
                      {product.description}
                    </p>
                    <div className="mt-1 flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                      ))}
                      <span className="ml-1 text-[9px] text-muted-foreground">(5.0)</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="text-base font-bold text-amber-400">
                        {formatPrice(product.price)}
                      </span>
                      {product.comparePrice && (
                        <span className="text-[10px] text-muted-foreground line-through">
                          {formatPrice(product.comparePrice)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5 text-[9px] text-amber-400">
                        <Shield className="h-2.5 w-2.5" />
                        VIP
                      </div>
                      <Button
                        size="sm"
                        className="h-7 gap-1 bg-amber-500/10 px-2.5 text-[11px] text-amber-400 hover:bg-amber-500 hover:text-white"
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
              </div>
            </motion.div>
          )
        })}
      </div>
      )}
    </section>
  )
}
