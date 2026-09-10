'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, GitCompare, X, ShoppingCart, Star, Clock, Trash2, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useShopStore, type Product } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'

export default function ComparePage() {
  const { compareList, removeFromCompare, clearCompare, addToCart } = useShopStore()
  const { goBack, goProduct, goSearch } = useShopRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      if (compareList.length === 0) {
        setProducts([])
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const results = await Promise.all(
          compareList.map(async (id) => {
            const res = await fetch(`/api/products/${id}`)
            if (res.ok) return await res.json()
            return null
          })
        )
        setProducts(results.filter(Boolean))
      } catch { /* */ } finally { setLoading(false) }
    }
    fetchProducts()
  }, [compareList])

  const getFeatureList = (p: Product): string[] => {
    if (!p.features) return []
    try { return JSON.parse(p.features) } catch { return [] }
  }

  const getTechStack = (p: Product): string[] => {
    if (!p.techStack) return []
    try { return JSON.parse(p.techStack) } catch { return [] }
  }

  const lowestPrice = products.length > 0 ? Math.min(...products.map(p => p.price)) : 0
  const highestRating = products.length > 0 ? Math.max(...products.map(p => p.rating || 0)) : 0

  return (
    <motion.div className="pb-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/30 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={goBack} className="text-muted-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                <GitCompare className="h-5 w-5 text-primary" />
                Compare
              </h1>
              <p className="text-[11px] text-muted-foreground">{products.length} of 3 products</p>
            </div>
          </div>
          {products.length > 0 && (
            <Button variant="ghost" size="sm" className="gap-1 text-destructive" onClick={clearCompare}>
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <motion.div className="flex flex-col items-center justify-center py-16 text-center px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <GitCompare className="h-10 w-10 text-primary" />
          </div>
          <p className="text-base font-semibold text-foreground">No products to compare</p>
          <p className="mt-1 text-sm text-muted-foreground">Add products to compare by tapping the compare icon</p>
          <Button onClick={() => goSearch()} className="mt-4 gap-2">
            <Plus className="h-4 w-4" /> Find Products
          </Button>
        </motion.div>
      ) : (
        <div className="px-4 mt-3">
          {/* Product Headers - horizontal scroll */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {products.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-[160px] rounded-2xl border border-border/50 bg-card overflow-hidden">
                <div className="relative">
                  <div onClick={() => goProduct(product.id)} className="w-full cursor-pointer">
                    <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-4xl opacity-30"></span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1.5 top-1.5 h-6 w-6 bg-background/80 backdrop-blur-sm"
                    onClick={() => removeFromCompare(product.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="p-2.5">
                  <div onClick={() => goProduct(product.id)} className="text-left w-full cursor-pointer">
                    <h3 className="text-xs font-bold text-foreground line-clamp-2">{product.name}</h3>
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className={`text-sm font-bold ${product.price === lowestPrice ? 'text-emerald-500' : 'text-primary'}`}>
                      {formatPrice(product.price)}
                    </span>
                    {product.comparePrice && (
                      <span className="text-[9px] text-muted-foreground line-through">{formatPrice(product.comparePrice)}</span>
                    )}
                  </div>
                  {product.price === lowestPrice && products.length > 1 && (
                    <Badge className="mt-1 bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[8px] px-1">Best Price</Badge>
                  )}
                  <Button
                    size="sm"
                    className="mt-2 w-full h-7 gap-1 text-[10px] bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                    onClick={() => addToCart({ productId: product.id, name: product.name, price: product.price, quantity: 1, imageUrl: product.imageUrl })}
                  >
                    <ShoppingCart className="h-3 w-3" /> Add to Cart
                  </Button>
                </div>
              </div>
            ))}
            {/* Add More Slot */}
            {products.length < 3 && (
              <button
                className="flex-shrink-0 w-[160px] flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/50 bg-muted/20 p-4 text-center hover:border-primary/30 hover:bg-primary/5 transition-colors"
                onClick={() => goSearch()}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Plus className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-xs font-medium text-muted-foreground">Add Product</p>
              </button>
            )}
          </div>

          {/* Comparison Rows */}
          <div className="mt-4 space-y-3">
            {/* Rating */}
            <div className="rounded-xl border border-border/50 bg-card p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Rating</p>
              <div className="flex gap-3">
                {products.map((p) => (
                  <div key={p.id} className="flex-1 text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`h-3 w-3 ${s <= Math.round(p.rating || 0) ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'}`} />
                      ))}
                    </div>
                    <p className={`text-sm font-bold mt-1 ${(p.rating || 0) === highestRating && products.length > 1 ? 'text-amber-400' : 'text-foreground'}`}>
                      {p.rating || '4.0'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="rounded-xl border border-border/50 bg-card p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Features</p>
              <div className="flex gap-3">
                {products.map((p) => (
                  <div key={p.id} className="flex-1">
                    <ul className="space-y-1">
                      {getFeatureList(p).slice(0, 5).map((f, i) => (
                        <li key={i} className="text-[11px] text-foreground flex items-start gap-1">
                          <span className="text-emerald-500 mt-0.5"></span>
                          <span className="line-clamp-1">{f}</span>
                        </li>
                      ))}
                      {getFeatureList(p).length === 0 && <li className="text-[11px] text-muted-foreground">-</li>}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech Stack */}
            <div className="rounded-xl border border-border/50 bg-card p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Tech Stack</p>
              <div className="flex gap-3">
                {products.map((p) => (
                  <div key={p.id} className="flex-1">
                    <div className="flex flex-wrap gap-1">
                      {getTechStack(p).map((t, i) => (
                        <Badge key={i} variant="secondary" className="text-[9px] px-1.5 py-0">{t}</Badge>
                      ))}
                      {getTechStack(p).length === 0 && <span className="text-[11px] text-muted-foreground">-</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Time */}
            <div className="rounded-xl border border-border/50 bg-card p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Delivery Time</p>
              <div className="flex gap-3">
                {products.map((p) => (
                  <div key={p.id} className="flex-1 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium text-foreground">{p.deliveryTime || 'Standard'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Comparison Summary */}
            <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent p-4">
              <p className="text-sm font-bold text-foreground mb-2">Quick Summary</p>
              <div className="space-y-1.5">
                {products.length > 1 && (
                  <p className="text-xs text-emerald-500">
                     Save {formatPrice(Math.max(...products.map(p => p.price)) - Math.min(...products.map(p => p.price)))} with the lowest-priced option
                  </p>
                )}
                {products.length > 1 && highestRating > 0 && (
                  <p className="text-xs text-amber-400">
                     Highest rated: {products.find(p => (p.rating || 0) === highestRating)?.name || 'N/A'}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Tap any product to view full details
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
