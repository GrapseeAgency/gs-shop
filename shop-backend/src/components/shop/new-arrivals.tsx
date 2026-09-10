'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight, BadgePlus, ShoppingCart, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { type Product } from '@/lib/store'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'

interface NewArrivalsProps {
  products?: Product[]
}

export function NewArrivals({ products: propProducts }: NewArrivalsProps) {
  const { goSearch, goProduct } = useShopRouter()
  const { addToCart } = useShopStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (propProducts && propProducts.length > 0) {
      const sorted = [...propProducts]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8)
      setProducts(sorted)
      setLoading(false)
      return
    }

    fetch('/api/products/new-arrivals?limit=8')
      .then((res) => res.json())
      .then((data) => {
        const prods = Array.isArray(data) ? data : []
        setProducts(prods)
      })
      .catch(() => {
        // Fallback: fetch regular products and sort
        fetch('/api/products?limit=8')
          .then((r) => r.json())
          .then((d) => {
            const prods = Array.isArray(d) ? d : d.products || []
            setProducts(
              [...prods]
                .sort((a: Product, b: Product) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 8)
            )
          })
          .catch(() => {})
      })
      .finally(() => setLoading(false))
  }, [propProducts])

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation()
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
    })
    toast.success('Added to cart!', { description: product.name })
  }

  const discount = (p: Product) =>
    p.comparePrice ? Math.round((1 - p.price / p.comparePrice) * 100) : 0

  if (!loading && products.length === 0) return null

  return (
    <section className="py-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/20">
            <Sparkles className="h-4 w-4 text-violet-400" />
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-foreground"> New Arrivals</h2>
            {!loading && products.length > 0 && (
              <Badge className="bg-violet-500/90 text-white text-[9px] px-1.5 py-0">
                {products.length} new
              </Badge>
            )}
          </div>
        </div>
        <button
          onClick={() => goSearch(undefined)}
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          See All New
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="flex gap-3 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex w-[150px] flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-border/50 bg-card">
              <div className="h-28 animate-pulse bg-muted" />
              <div className="p-2.5 space-y-2">
                <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Horizontal scroll */}
      <AnimatePresence>
        {!loading && (
          <motion.div
            className="flex gap-3 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {products.map((product, index) => {
              const disc = discount(product)
              return (
                <motion.button
                  key={product.id}
                  className="group relative flex w-[150px] flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-border/50 bg-card transition-all hover:border-violet-500/30 hover:shadow-lg active:scale-[0.97]"
                  onClick={() => goProduct(product.id)}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {/* NEW Badge */}
                  <Badge className="absolute left-2 top-2 z-10 gap-0.5 bg-violet-500/90 text-white shadow-sm">
                    <BadgePlus className="h-3 w-3" />
                    NEW
                  </Badge>

                  {/* Discount badge */}
                  {disc > 0 && (
                    <Badge className="absolute right-2 top-2 z-10 bg-destructive/90 text-white text-[9px] px-1.5 py-0">
                      -{disc}%
                    </Badge>
                  )}

                  {/* Image */}
                  <div className="relative flex h-28 items-center justify-center bg-gradient-to-br from-violet-500/10 to-purple-500/5 overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <span className="text-3xl opacity-30"></span>
                    )}
                    {/* Quick view overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/20 group-hover:opacity-100">
                      <Eye className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-2.5">
                    <h3 className="mb-1 text-xs font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="mb-1.5 text-[10px] text-muted-foreground line-clamp-1">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-bold text-primary">
                          {formatPrice(product.price)}
                        </span>
                        {product.comparePrice && (
                          <span className="text-[9px] text-muted-foreground line-through">
                            {formatPrice(product.comparePrice)}
                          </span>
                        )}
                      </div>
                      {/* Quick add */}
                      <div
                        onClick={(e) => handleQuickAdd(e, product)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary transition-all hover:bg-primary hover:text-primary-foreground active:scale-90"
                      >
                        <ShoppingCart className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
