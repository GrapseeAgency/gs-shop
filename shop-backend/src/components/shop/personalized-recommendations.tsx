'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Info } from 'lucide-react'
import { type Product } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface RecommendedProduct extends Product {
  reason?: string
}

export function PersonalizedRecommendations() {
  const { goProduct } = useShopRouter()
  const [products, setProducts] = useState<RecommendedProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await fetch('/api/products/recommendations?limit=6')
        if (res.ok) {
          const data = await res.json()
          setProducts(data.data || [])
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [])

  if (!loading && products.length === 0) return null

  return (
    <section className="py-4">
      {/* Header */}
      <div className="mb-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Recommended For You</h2>
              <p className="text-[10px] text-muted-foreground">Based on your preferences</p>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="flex h-6 w-6 items-center justify-center rounded-full bg-muted/50 text-muted-foreground">
                  <Info className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="text-xs">
                <p>Products recommended based on category,<br />price range, and trending items</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Horizontal scrollable cards */}
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {loading ? (
          // Skeletons
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-[160px] flex-shrink-0 animate-pulse">
              <div className="aspect-[4/3] rounded-2xl bg-muted" />
              <div className="mt-2 h-3 w-3/4 rounded bg-muted" />
              <div className="mt-1 h-4 w-1/2 rounded bg-muted" />
            </div>
          ))
        ) : (
          products.map((product, index) => (
            <motion.button
              key={product.id}
              className="group relative flex w-[160px] flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-border/50 bg-card transition-all hover:border-primary/20 hover:shadow-lg active:scale-[0.97]"
              onClick={() => goProduct(product.id)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Image */}
              <div className="flex h-28 items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-3xl opacity-30"></span>
                )}
              </div>

              {/* Info */}
              <div className="p-2.5">
                <h3 className="mb-1 text-xs font-semibold text-foreground line-clamp-1">
                  {product.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-primary">
                    {formatPrice(product.price)}
                  </span>
                  {product.comparePrice && (
                    <span className="text-[10px] text-muted-foreground line-through">
                      {formatPrice(product.comparePrice)}
                    </span>
                  )}
                </div>
                {/* Reason badge */}
                {product.reason && (
                  <Badge variant="outline" className="mt-1.5 h-5 border-primary/20 bg-primary/5 px-1.5 text-[9px] text-primary">
                    {product.reason}
                  </Badge>
                )}
              </div>
            </motion.button>
          ))
        )}
      </div>
    </section>
  )
}
