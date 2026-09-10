'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Trash2,
  PackageOpen,
  Share2,
  Filter,
  ArrowUpDown,
  BadgeCheck,
  Eye,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import { toast } from 'sonner'

type FilterTab = 'all' | 'in-stock' | 'on-sale' | 'under-500'
type SortOption = 'recent' | 'price-low' | 'price-high' | 'name'

export function WishlistView() {
  const { wishlist, removeFromWishlist, addToCart, recentlyViewed } = useShopStore()
  const { goBack, goCategory, goProduct } = useShopRouter()

  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
  const [sortOption, setSortOption] = useState<SortOption>('recent')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [addingAll, setAddingAll] = useState(false)

  // Filter and sort wishlist items
  const filteredItems = useMemo(() => {
    let items = [...wishlist]

    // Apply filter
    switch (activeFilter) {
      case 'in-stock':
        // In a real app, we'd check stock status from API
        items = items.filter((item) => item.price > 0)
        break
      case 'on-sale':
        items = items.filter((item) => item.comparePrice && item.comparePrice > item.price)
        break
      case 'under-500':
        items = items.filter((item) => item.price < 500)
        break
    }

    // Apply sort
    switch (sortOption) {
      case 'recent':
        items.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
        break
      case 'price-low':
        items.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        items.sort((a, b) => b.price - a.price)
        break
      case 'name':
        items.sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    return items
  }, [wishlist, activeFilter, sortOption])

  const filterTabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: wishlist.length },
    { key: 'in-stock', label: 'In Stock', count: wishlist.filter((i) => i.price > 0).length },
    { key: 'on-sale', label: 'On Sale', count: wishlist.filter((i) => i.comparePrice && i.comparePrice > i.price).length },
    { key: 'under-500', label: 'Under $500', count: wishlist.filter((i) => i.price < 500).length },
  ]

  const sortOptions: { key: SortOption; label: string }[] = [
    { key: 'recent', label: 'Recently Added' },
    { key: 'price-low', label: 'Price: Low  High' },
    { key: 'price-high', label: 'Price: High  Low' },
    { key: 'name', label: 'Name A-Z' },
  ]

  const handleAddToCart = (item: typeof wishlist[0]) => {
    addToCart({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: 1,
      imageUrl: item.imageUrl,
    })
    removeFromWishlist(item.productId)
    toast.success('Moved to Cart', {
      description: `${item.name} has been moved to your cart.`,
    })
  }

  const handleAddAllToCart = async () => {
    if (wishlist.length === 0) return
    setAddingAll(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    for (const item of wishlist) {
      addToCart({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: 1,
        imageUrl: item.imageUrl,
      })
    }
    useShopStore.getState().clearWishlist()
    setAddingAll(false)
    toast.success(`${wishlist.length} items moved to cart!`, {
      description: 'All wishlist items have been added to your cart.',
    })
  }

  const handleShare = async () => {
    setSharing(true)
    try {
      const res = await fetch('/api/wishlist/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: wishlist.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl,
          })),
          name: 'My Wishlist',
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (navigator.share) {
          await navigator.share({
            title: 'My Grapsee Wishlist',
            text: `Check out my wishlist with ${wishlist.length} items on Grapsee Shop!`,
            url: data.shareUrl,
          })
        } else {
          await navigator.clipboard.writeText(window.location.origin + data.shareUrl)
          toast.success('Share link copied to clipboard!', {
            description: 'Share this link with friends and family.',
          })
        }
      } else {
        toast.error('Failed to generate share link')
      }
    } catch {
      // User cancelled share or clipboard failed
      toast.info('Share cancelled')
    } finally {
      setSharing(false)
    }
  }

  const getDiscount = (item: typeof wishlist[0]) => {
    if (!item.comparePrice || item.comparePrice <= item.price) return 0
    return Math.round((1 - item.price / item.comparePrice) * 100)
  }

  return (
    <motion.div
      className="px-4 py-2 pb-8"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => goBack()}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            My Wishlist
            {wishlist.length > 0 && (
              <Badge className="bg-primary/10 text-primary border-0 text-[10px] font-bold">
                {wishlist.length}
              </Badge>
            )}
          </h1>
          <p className="text-xs text-muted-foreground">
            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
        {wishlist.length > 0 && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={handleShare}
              disabled={sharing}
            >
              {sharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-destructive hover:text-destructive"
              onClick={() => {
                useShopStore.getState().clearWishlist()
                toast.success('Wishlist cleared')
              }}
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {wishlist.length === 0 ? (
        <motion.div
          className="flex flex-col items-center justify-center py-16 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-rose-500/20 to-pink-600/10">
            <Heart className="h-12 w-12 text-rose-400" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">Your wishlist is empty</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-[260px]">
            Tap the heart icon on products you love to save them here for later.
          </p>
          <Button
            onClick={() => goCategory()}
            className="gap-2 bg-primary text-primary-foreground shadow-lg shadow-primary/20"
          >
            <ShoppingCart className="h-4 w-4" />
            Browse Products
          </Button>
        </motion.div>
      ) : (
        <>
          {/* Filter Tabs */}
          <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-medium whitespace-nowrap transition-colors ${
                  activeFilter === tab.key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                {tab.label}
                <span className={`text-[9px] ${activeFilter === tab.key ? 'text-primary-foreground/70' : 'text-muted-foreground/70'}`}>
                  ({tab.count})
                </span>
              </button>
            ))}
          </div>

          {/* Sort & Bulk Actions */}
          <div className="mb-3 flex items-center justify-between">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-[11px] h-7 border-border/50"
                onClick={() => setShowSortMenu(!showSortMenu)}
              >
                <ArrowUpDown className="h-3 w-3" />
                {sortOptions.find((s) => s.key === sortOption)?.label}
              </Button>
              {showSortMenu && (
                <motion.div
                  className="absolute left-0 top-9 z-50 w-44 rounded-xl border border-border/50 bg-card shadow-lg overflow-hidden"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {sortOptions.map((option) => (
                    <button
                      key={option.key}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-[11px] text-left transition-colors ${
                        sortOption === option.key
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-foreground hover:bg-muted/30'
                      }`}
                      onClick={() => { setSortOption(option.key); setShowSortMenu(false) }}
                    >
                      {sortOption === option.key && <CheckCircle2 className="h-3 w-3" />}
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
            <Button
              size="sm"
              className="gap-1.5 text-[11px] h-7 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={handleAddAllToCart}
              disabled={addingAll}
            >
              {addingAll ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <ShoppingCart className="h-3 w-3" />
              )}
              Add All to Cart
            </Button>
          </div>

          {/* Product List */}
          {filteredItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/50 bg-muted/20 p-6 text-center">
              <Filter className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No items match this filter</p>
              <Button variant="ghost" size="sm" className="mt-2 text-xs text-primary" onClick={() => setActiveFilter('all')}>
                Show All
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item, index) => {
                  const discount = getDiscount(item)
                  return (
                    <motion.div
                      key={item.productId}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      className="flex gap-3 rounded-2xl border border-border/50 bg-card p-3 hover:border-primary/20 transition-colors"
                    >
                      {/* Image */}
                      <button
                        className="relative flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-primary/5"
                        onClick={() => goProduct(item.productId)}
                      >
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center"><PackageOpen className="h-5 w-5 text-muted-foreground" /></div>
                        )}
                        {discount > 0 && (
                          <Badge className="absolute left-1.5 top-1.5 h-5 bg-destructive/90 px-1.5 text-[9px] font-bold text-white">
                            -{discount}%
                          </Badge>
                        )}
                      </button>

                      {/* Info */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <button onClick={() => goProduct(item.productId)} className="text-left">
                            <h3 className="text-sm font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors">
                              {item.name}
                            </h3>
                          </button>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-sm font-bold text-primary">
                              {formatPrice(item.price)}
                            </span>
                            {item.comparePrice && item.comparePrice > item.price && (
                              <span className="text-[10px] text-muted-foreground line-through">
                                {formatPrice(item.comparePrice)}
                              </span>
                            )}
                          </div>
                          {/* Stock & Badges */}
                          <div className="flex items-center gap-1.5 mt-1">
                            <Badge className="h-4 bg-emerald-500/10 text-emerald-400 text-[8px] border-0">
                              <BadgeCheck className="mr-0.5 h-2.5 w-2.5" />
                              In Stock
                            </Badge>
                            {discount > 0 && (
                              <Badge className="h-4 bg-amber-500/10 text-amber-400 text-[8px] border-0">
                                On Sale
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            size="sm"
                            className="flex-1 gap-1 bg-primary/10 text-xs text-primary hover:bg-primary hover:text-primary-foreground h-8"
                            onClick={() => handleAddToCart(item)}
                          >
                            <ShoppingCart className="h-3 w-3" />
                            Add to Cart
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              removeFromWishlist(item.productId)
                              toast.success('Removed from wishlist')
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Share Wishlist Banner */}
          {wishlist.length > 0 && (
            <motion.div
              className="mt-5 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 to-transparent p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Share2 className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-foreground">Share Your Wishlist</span>
              </div>
              <p className="text-[10px] text-muted-foreground mb-2">
                Let friends and family know what you love. Generate a shareable link.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="text-[11px] border-primary/30 text-primary hover:bg-primary/10 h-7"
                onClick={handleShare}
                disabled={sharing}
              >
                {sharing ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Share2 className="mr-1 h-3 w-3" />}
                Generate Share Link
              </Button>
            </motion.div>
          )}
        </>
      )}

      {/* Recently Viewed Section */}
      {recentlyViewed.length > 0 && (
        <motion.section
          className="mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recently Viewed</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {recentlyViewed.slice(0, 6).map((item, index) => (
              <motion.button
                key={item.productId}
                className="flex-shrink-0 w-28 text-center group"
                onClick={() => goProduct(item.productId)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.04 * index }}
              >
                <div className="flex h-20 w-28 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 mb-1.5 group-hover:from-primary/15 group-hover:to-primary/10 transition-colors">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <Eye className="h-6 w-6 text-muted-foreground/30" />
                  )}
                </div>
                <p className="text-[10px] font-medium text-foreground line-clamp-1">{item.name}</p>
                <p className="text-[10px] font-bold text-primary">{formatPrice(item.price)}</p>
              </motion.button>
            ))}
          </div>
        </motion.section>
      )}
    </motion.div>
  )
}
