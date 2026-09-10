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
          className="rounded-2xl border border-dashed border-border/50 bg-card/50 p-6 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
            <Clock className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">No Browsing History</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Start exploring products and they&apos;ll appear here
          </p>
          <button
            onClick={() => goSearch(undefined)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-4 py-2 text-xs font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground active:scale-95"
          >
            <Search className="h-3.5 w-3.5" />
            Browse Products
          </button>
        </motion.div>
      </section>
    )
  }

  return (
    <section className="py-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20">
            <Clock className="h-4 w-4 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground"> Recently Viewed</h2>
            <p className="text-[10px] text-muted-foreground">
              {recentlyViewed.length} item{recentlyViewed.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={handleClear}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-destructive transition-colors active:scale-95"
        >
          <Trash2 className="h-3 w-3" />
          Clear
        </button>
      </div>

      {/* Horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <AnimatePresence>
          {recentlyViewed.map((item, index) => (
            <motion.button
              key={item.productId}
              className="group relative flex w-[130px] flex-shrink-0 flex-col overflow-hidden rounded-xl border border-border/50 bg-card transition-all hover:border-primary/20 hover:shadow-md active:scale-[0.97]"
              onClick={() => handleItemClick(item)}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
              whileTap={{ scale: 0.97 }}
              layout
            >
              {/* Image */}
              <div className="relative flex h-24 items-center justify-center bg-gradient-to-br from-cyan-500/10 to-blue-500/5 overflow-hidden">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <PackageOpen className="h-6 w-6 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-2.5">
                <h3 className="text-[10px] font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                  {item.name}
                </h3>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-primary">
                    {formatPrice(item.price)}
                  </span>
                  {/* Quick add button */}
                  <div
                    onClick={(e) => handleQuickAdd(e, item)}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary transition-all hover:bg-primary hover:text-primary-foreground active:scale-90"
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
