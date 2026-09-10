'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Heart, Grid, List, Share2, Plus, Pin, Move,
  Trash2, ShoppingBag, Star, LayoutGrid, FolderOpen, Eye,
  Download, ChevronDown, Maximize2, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useShopStore, useHydration, type WishlistItem } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import { toast } from 'sonner'

type BoardLayout = 'masonry' | 'grid' | 'list'
type BoardCategory = 'all' | 'favorites' | 'tech' | 'design' | 'business'

interface BoardSection {
  id: string
  name: string
  color: string
  items: WishlistItem[]
}

function WishboardItem({ item, layout, onRemove, onView }: {
  item: WishlistItem
  layout: BoardLayout
  onRemove: () => void
  onView: () => void
}) {
  const discount = item.comparePrice ? Math.round((1 - item.price / item.comparePrice) * 100) : 0

  if (layout === 'list') {
    return (
      <motion.div
        layout
        className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-2.5"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10, height: 0 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            <Pin className="h-5 w-5 text-primary/30" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <button onClick={onView} className="text-left">
            <p className="text-sm font-semibold text-foreground line-clamp-1">{item.name}</p>
          </button>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-sm font-bold text-foreground">{formatPrice(item.price)}</span>
            {item.comparePrice && (
              <span className="text-[10px] text-muted-foreground line-through">{formatPrice(item.comparePrice)}</span>
            )}
            {discount > 0 && (
              <Badge className="bg-destructive/10 text-destructive text-[8px] px-1">-{discount}%</Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onView} className="flex h-7 w-7 items-center justify-center rounded-full bg-muted/50">
            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button onClick={onRemove} className="flex h-7 w-7 items-center justify-center rounded-full bg-muted/50 hover:bg-red-500/10">
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </motion.div>
    )
  }

  // Masonry / Grid card
  const heights = ['h-36', 'h-44', 'h-32', 'h-40']
  const heightClass = layout === 'masonry' ? heights[item.name.length % heights.length] : 'h-36'

  return (
    <motion.div
      layout
      className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
    >
      <button onClick={onView} className={`relative flex w-full items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 ${heightClass}`}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1">
            <Heart className="h-6 w-6 text-primary/20" />
            <span className="text-[10px] text-muted-foreground">Pinned</span>
          </div>
        )}
        {discount > 0 && (
          <Badge className="absolute left-2 top-2 bg-destructive/90 text-white text-[9px]">-{discount}%</Badge>
        )}
        <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-background/70 backdrop-blur-sm">
          <Pin className="h-3 w-3 text-primary" />
        </div>
        {/* Drag handle indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex h-5 items-center gap-0.5 rounded-full bg-background/70 px-2 backdrop-blur-sm">
            <Move className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
      </button>
      <div className="p-2.5">
        <p className="text-xs font-semibold text-foreground line-clamp-1">{item.name}</p>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm font-bold text-foreground">{formatPrice(item.price)}</span>
          <button onClick={onRemove} className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-red-500/10">
            <Trash2 className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export function WishboardPage() {
  const hydrated = useHydration()
  const { goBack, goProduct } = useShopRouter()
  const { wishlist, removeFromWishlist, clearWishlist } = useShopStore()
  const [layout, setLayout] = useState<BoardLayout>('masonry')
  const [category, setCategory] = useState<BoardCategory>('all')
  const [showShareSheet, setShowShareSheet] = useState(false)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [localWishlist, setLocalWishlist] = useState<WishlistItem[]>([])

  // Sync local wishlist with store
  useState(() => {
    if (hydrated) setLocalWishlist([...wishlist])
  })

  const items = hydrated ? wishlist : []
  const categorizedItems = items.filter((item) => {
    if (category === 'all') return true
    if (category === 'favorites') return item.price < 5000
    if (category === 'tech') return item.name.toLowerCase().includes('saas') || item.name.toLowerCase().includes('app') || item.name.toLowerCase().includes('dashboard')
    if (category === 'design') return item.name.toLowerCase().includes('brand') || item.name.toLowerCase().includes('ui') || item.name.toLowerCase().includes('design')
    if (category === 'business') return item.name.toLowerCase().includes('corporate') || item.name.toLowerCase().includes('website')
    return true
  })

  // Create board sections by categorizing items
  const boardSections: BoardSection[] = [
    { id: 'all', name: 'All Pinned', color: 'from-primary/20 to-primary/5', items: categorizedItems },
  ]

  const handleRemove = useCallback((productId: string) => {
    removeFromWishlist(productId)
    toast.success('Removed from board')
  }, [removeFromWishlist])

  const handleSimulateDrag = useCallback((itemId: string, direction: 'up' | 'down') => {
    setDraggedItem(itemId)
    const idx = categorizedItems.findIndex((i) => i.productId === itemId)
    if (idx === -1) return
    const newIdx = direction === 'up' ? Math.max(0, idx - 1) : Math.min(categorizedItems.length - 1, idx + 1)
    if (newIdx === idx) return

    const newItems = [...categorizedItems]
    const [moved] = newItems.splice(idx, 1)
    newItems.splice(newIdx, 0, moved)
    setLocalWishlist(newItems)
    setTimeout(() => setDraggedItem(null), 300)
    toast.success('Item reordered!')
  }, [categorizedItems])

  const handleShare = async () => {
    const shareText = `My Wishboard on Grapsee Shop\n${items.map((i) => ` ${i.name} - ${formatPrice(i.price)}`).join('\n')}`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'My Wishboard', text: shareText })
      } else {
        await navigator.clipboard.writeText(shareText)
        toast.success('Wishboard copied to clipboard!')
      }
    } catch {
      toast.error('Failed to share')
    }
    setShowShareSheet(false)
  }

  const totalValue = items.reduce((s, i) => s + i.price, 0)

  return (
    <motion.div className="pb-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack} className="flex-shrink-0 text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-primary" /> Wishboard
            </h1>
            <p className="text-[11px] text-muted-foreground">{items.length} pinned  {formatPrice(totalValue)} total</p>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowShareSheet(!showShareSheet)}>
              <Share2 className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setLayout(layout === 'masonry' ? 'grid' : layout === 'grid' ? 'list' : 'masonry')}>
              {layout === 'masonry' ? <Grid className="h-4 w-4 text-muted-foreground" /> :
               layout === 'grid' ? <List className="h-4 w-4 text-muted-foreground" /> :
               <LayoutGrid className="h-4 w-4 text-muted-foreground" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Share Sheet */}
      <AnimatePresence>
        {showShareSheet && (
          <motion.div
            className="mx-4 mt-2 rounded-xl border border-primary/20 bg-primary/5 p-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-foreground">Share your wishboard</span>
              <button onClick={() => setShowShareSheet(false)}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 gap-1 text-xs" onClick={handleShare}>
                <Share2 className="h-3.5 w-3.5" /> Share
              </Button>
              <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs" onClick={() => {
                const text = items.map((i) => `${i.name} - ${formatPrice(i.price)}`).join('\n')
                navigator.clipboard.writeText(text)
                toast.success('Copied!')
              }}>
                <Download className="h-3.5 w-3.5" /> Copy List
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Board Info Card */}
      <div className="mx-4 mt-3 rounded-2xl bg-gradient-to-r from-violet-500/10 via-pink-500/5 to-rose-500/5 border border-violet-500/20 p-4">
        <div className="flex items-center gap-3">
          <motion.div
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/20"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
          >
            <Pin className="h-6 w-6 text-violet-500" />
          </motion.div>
          <div>
            <p className="text-base font-bold text-foreground">My Vision Board</p>
            <p className="text-xs text-muted-foreground">Pin, organize & share your dream picks</p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <div className="flex-1 rounded-lg bg-background/50 p-2 text-center">
            <p className="text-sm font-bold text-foreground">{items.length}</p>
            <p className="text-[9px] text-muted-foreground">Pinned</p>
          </div>
          <div className="flex-1 rounded-lg bg-background/50 p-2 text-center">
            <p className="text-sm font-bold text-foreground">{formatPrice(totalValue)}</p>
            <p className="text-[9px] text-muted-foreground">Total Value</p>
          </div>
          <div className="flex-1 rounded-lg bg-background/50 p-2 text-center">
            <p className="text-sm font-bold text-foreground">{items.filter((i) => i.comparePrice && i.comparePrice > i.price).length}</p>
            <p className="text-[9px] text-muted-foreground">On Sale</p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mt-3 flex gap-2 overflow-x-auto px-4 scrollbar-hide">
        {[
          { key: 'all' as const, label: 'All', icon: Pin },
          { key: 'favorites' as const, label: 'Favorites', icon: Heart },
          { key: 'tech' as const, label: 'Tech', icon: ShoppingBag },
          { key: 'design' as const, label: 'Design', icon: Star },
          { key: 'business' as const, label: 'Business', icon: FolderOpen },
        ].map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
              category === c.key ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground'
            }`}
          >
            <c.icon className="h-3 w-3" />
            {c.label}
          </button>
        ))}
      </div>

      {/* Wishboard Content */}
      <div className="px-4 mt-3">
        {items.length === 0 ? (
          <motion.div className="flex flex-col items-center justify-center py-16 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div
              className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-violet-500/10"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Pin className="h-10 w-10 text-violet-500/40" />
            </motion.div>
            <p className="text-sm font-medium text-foreground">Your wishboard is empty</p>
            <p className="mt-1 text-xs text-muted-foreground">Pin products to create your visual mood board</p>
            <Button variant="outline" className="mt-4 gap-2" onClick={() => goProduct('')}>
              <Plus className="h-4 w-4" /> Browse Products
            </Button>
          </motion.div>
        ) : layout === 'list' ? (
          <div className="space-y-2">
            {categorizedItems.map((item, i) => (
              <div key={item.productId} className="relative">
                <WishboardItem
                  item={item}
                  layout={layout}
                  onRemove={() => handleRemove(item.productId)}
                  onView={() => goProduct(item.productId)}
                />
                {i > 0 && (
                  <button
                    onClick={() => handleSimulateDrag(item.productId, 'up')}
                    className="absolute -top-1 left-1/2 -translate-x-1/2 flex h-4 w-4 items-center justify-center rounded-full bg-muted/50 opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <ChevronDown className="h-3 w-3 text-muted-foreground rotate-180" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : layout === 'grid' ? (
          <div className="grid grid-cols-3 gap-2">
            {categorizedItems.map((item) => (
              <WishboardItem
                key={item.productId}
                item={item}
                layout={layout}
                onRemove={() => handleRemove(item.productId)}
                onView={() => goProduct(item.productId)}
              />
            ))}
          </div>
        ) : (
          // Masonry layout (2 columns with varying heights)
          <div className="columns-2 gap-2 space-y-2">
            {categorizedItems.map((item) => (
              <div key={item.productId} className="break-inside-avoid">
                <WishboardItem
                  item={item}
                  layout={layout}
                  onRemove={() => handleRemove(item.productId)}
                  onView={() => goProduct(item.productId)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {items.length > 0 && (
        <div className="mx-4 mt-4 flex gap-2">
          <Button
            variant="outline"
            className="flex-1 gap-2 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={() => {
              clearWishlist()
              toast.success('Wishboard cleared')
            }}
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear Board
          </Button>
          <Button className="flex-1 gap-2 text-xs" onClick={handleShare}>
            <Share2 className="h-3.5 w-3.5" /> Share Board
          </Button>
        </div>
      )}
    </motion.div>
  )
}
