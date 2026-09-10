'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Trash2, ShoppingCart, Search, PackageOpen } from 'lucide-react'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import { toast } from 'sonner'

export function RecentlyViewed() {
  const { recentlyViewed, clearRecentlyViewed, addToCart } = useShopStore()
  const { goProduct, goSearch } = useShopRouter()

  const handleItemClick = (item: typeof recentlyViewed[0]) => {
    goProduct(item.productId)
  }

  const handleQuickAdd = (e: React.MouseEvent, item: typeof recentlyViewed[0]) => {
    e.stopPropagation()
    addToCart({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: 1,
      imageUrl: item.imageUrl,
    })
    toast.success('Added to cart!', { description: item.name })
  }

  const handleClear = () => {
    clearRecentlyViewed()
    toast.info('Browsing history cleared')
  }

  // Empty state
  if (recentlyViewed.length === 0) {
    return (
      <section className="px-4 py-4">
        <motion.div
          className="rounded-3xl border border-dashed border-primary/20 bg-card/65 backdrop-blur-md p-6 text-center shadow-inner relative overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 liquid-aurora opacity-5 -z-10" />
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/5 border border-primary/10 relative overflow-hidden">
            <div className="absolute inset-0 liquid-aurora opacity-25" />
            <Clock className="relative z-10 h-6 w-6 text-primary animate-pulse" />
          </div>
          <h3 className="text-sm font-extrabold text-foreground">No Browsing History</h3>
          <p className="mt-1 text-xs text-muted-foreground/80 max-w-xs mx-auto">
            Start exploring products and they&apos;ll appear here
          </p>
          <button
            onClick={() => goSearch(undefined)}
            className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-2 text-xs font-bold shadow-sm shadow-primary/20 transition-all hover:bg-primary/95 active:scale-95 btn-liquid"
          >
            <Search className="h-3.5 w-3.5" />
            Browse Products
          </button>
        </motion.div>
      </section>
    )
  }

  return (
    <section className="py-4 relative z-10">
      {/* Header */}
      <div className="mb-3.5 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 overflow-hidden shadow-sm">
            <div className="absolute inset-0 liquid-aurora opacity-40 animate-aurora" />
            <Clock className="relative z-10 h-4 w-4 text-primary animate-swell" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-gradient-green">Recently Viewed</h2>
            <p className="text-[10px] font-semibold text-muted-foreground/80">
              {recentlyViewed.length} item{recentlyViewed.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={handleClear}
          className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-destructive transition-colors active:scale-95"
        >
          <Trash2 className="h-3.5 w-3.5 text-destructive/70" />
          Clear
        </button>
      </div>

      {/* Horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto px-4 pb-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <AnimatePresence>
          {recentlyViewed.map((item, index) => (
            <motion.button
              key={item.productId}
              className="group relative flex w-[130px] flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-primary/15 bg-card/65 backdrop-blur-md transition-all duration-300 hover:border-primary/35 hover:shadow-md hover:shadow-primary/5 active:scale-[0.97]"
              onClick={() => handleItemClick(item)}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
              whileTap={{ scale: 0.97 }}
              layout
            >
              {/* Image */}
              <div className="relative flex h-24 items-center justify-center bg-gradient-to-br from-primary/10 to-emerald-500/5 overflow-hidden border-b border-primary/10 liquid-caustic">
                <div className="absolute inset-0 liquid-aurora opacity-10 pointer-events-none" />
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <PackageOpen className="h-6 w-6 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-2.5 text-left w-full">
                <h3 className="text-[10px] font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                  {item.name}
                </h3>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-primary">
                    {formatPrice(item.price)}
                  </span>
                  {/* Quick add button */}
                  <div
                    onClick={(e) => handleQuickAdd(e, item)}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all duration-300 hover:scale-105 active:scale-90 shadow-sm shadow-primary/20 btn-liquid"
                  >
                    <ShoppingCart className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </section>
  )
}

