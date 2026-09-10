'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Clock,
  Trash2,
  Eye,
  ShoppingCart,
  Heart,
  Package,
  Calendar,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import { toast } from 'sonner'

interface RecentItem {
  productId: string
  name: string
  price: number
  imageUrl: string | null
  viewedAt: number
}

interface GroupedItems {
  label: string
  items: RecentItem[]
}

export default function RecentlyViewedPage() {
  const { recentlyViewed, clearRecentlyViewed, addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useShopStore()
  const { goBack, goProduct, goCategory } = useShopRouter()

  // Group items by date
  const groupedItems = useMemo(() => {
    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000
    const startOfToday = new Date().setHours(0, 0, 0, 0)
    const startOfYesterday = startOfToday - oneDay
    const startOfWeek = startOfToday - (new Date().getDay() * oneDay)

    const groups: GroupedItems[] = [
      { label: 'Today', items: [] },
      { label: 'Yesterday', items: [] },
      { label: 'This Week', items: [] },
      { label: 'Earlier', items: [] },
    ]

    recentlyViewed.forEach((item) => {
      if (item.viewedAt >= startOfToday) {
        groups[0].items.push(item)
      } else if (item.viewedAt >= startOfYesterday) {
        groups[1].items.push(item)
      } else if (item.viewedAt >= startOfWeek) {
        groups[2].items.push(item)
      } else {
        groups[3].items.push(item)
      }
    })

    return groups.filter((g) => g.items.length > 0)
  }, [recentlyViewed])

  const handleQuickAddToCart = (item: typeof recentlyViewed[0], e: React.MouseEvent) => {
    e.stopPropagation()
    addToCart({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: 1,
      imageUrl: item.imageUrl,
    })
    toast.success('Added to cart', { description: item.name })
  }

  const handleToggleWishlist = (item: typeof recentlyViewed[0], e: React.MouseEvent) => {
    e.stopPropagation()
    if (isInWishlist(item.productId)) {
      removeFromWishlist(item.productId)
      toast.success('Removed from wishlist')
    } else {
      addToWishlist({
        productId: item.productId,
        name: item.name,
        price: item.price,
        comparePrice: null,
        imageUrl: item.imageUrl,
      })
      toast.success('Added to wishlist!')
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <motion.div
      className="px-4 py-2 pb-8"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              Recently Viewed
            </h1>
            <p className="text-[11px] text-muted-foreground">
              {recentlyViewed.length} {recentlyViewed.length === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>
        {recentlyViewed.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-destructive hover:text-destructive"
            onClick={() => {
              clearRecentlyViewed()
              toast.success('Browsing history cleared')
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear All
          </Button>
        )}
      </div>

      {/* Empty State */}
      {recentlyViewed.length === 0 ? (
        <motion.div
          className="flex flex-col items-center justify-center py-16 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/5">
            <Eye className="h-12 w-12 text-primary/40" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">No recently viewed items</h3>
          <p className="text-sm text-muted-foreground max-w-[260px] mb-5">
            Browse products and they will appear here so you can easily find them again.
          </p>
          <Button
            onClick={() => goCategory()}
            className="gap-2 bg-primary text-primary-foreground shadow-lg shadow-primary/20"
          >
            <Sparkles className="h-4 w-4" />
            Explore Products
          </Button>
        </motion.div>
      ) : (
        <>
          {/* Stats Bar */}
          <div className="mb-4 flex gap-2">
            <div className="flex-1 rounded-xl bg-primary/5 border border-primary/10 p-2.5 text-center">
              <p className="text-lg font-bold text-primary">{recentlyViewed.length}</p>
              <p className="text-[9px] text-muted-foreground">Total Items</p>
            </div>
            <div className="flex-1 rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-2.5 text-center">
              <p className="text-lg font-bold text-emerald-400">{groupedItems.length}</p>
              <p className="text-[9px] text-muted-foreground">Days Active</p>
            </div>
            <div className="flex-1 rounded-xl bg-amber-500/5 border border-amber-500/10 p-2.5 text-center">
              <p className="text-lg font-bold text-amber-400">
                {recentlyViewed.length > 0 ? formatDate(recentlyViewed[0].viewedAt) : '-'}
              </p>
              <p className="text-[9px] text-muted-foreground">Last Viewed</p>
            </div>
          </div>

          {/* Grouped by Date */}
          <div className="space-y-5">
            {groupedItems.map((group, groupIndex) => (
              <div key={group.label}>
                {/* Date Group Header */}
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <h3 className="text-xs font-bold text-foreground">{group.label}</h3>
                  <Badge className="h-4 bg-muted text-muted-foreground text-[8px] border-0 px-1.5">
                    {group.items.length}
                  </Badge>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {group.items.map((item, index) => {
                    const wishlisted = isInWishlist(item.productId)
                    return (
                      <motion.div
                        key={item.productId}
                        className="group flex items-center gap-3 rounded-2xl border border-border/50 bg-card p-3 text-left transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
                        onClick={() => goProduct(item.productId)}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: groupIndex * 0.05 + index * 0.03 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Image */}
                        <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-primary/5">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <Package className="h-6 w-6 text-muted-foreground/30" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                            {item.name}
                          </h4>
                          <p className="text-base font-bold text-primary mt-0.5">{formatPrice(item.price)}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <Eye className="h-2.5 w-2.5" />
                              Viewed {formatDate(item.viewedAt)}
                            </span>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex flex-col gap-1.5 flex-shrink-0">
                          <button
                            onClick={(e) => handleQuickAddToCart(item, e)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            <ShoppingCart className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleToggleWishlist(item, e)}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                              wishlisted
                                ? 'bg-rose-500/10 text-rose-500'
                                : 'bg-muted/50 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500'
                            }`}
                          >
                            <Heart className={`h-3.5 w-3.5 ${wishlisted ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {groupIndex < groupedItems.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  )
}
