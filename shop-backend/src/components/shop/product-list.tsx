'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PackageOpen, ChevronDown, Star, Heart, ShoppingCart, GitCompare,
  Grid3X3, List, SortAsc, SlidersHorizontal, Check, X, RotateCcw,
  Search, ArrowUpDown, TrendingUp, Sparkles, Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductCard, ProductCardSkeleton, formatPrice } from '@/components/shop/product-card'
import { useShopStore, type Product } from '@/lib/store'
import { toast } from 'sonner'

type SortOption = 'popular' | 'newest' | 'price-low' | 'price-high' | 'rating'

const sortLabels: Record<SortOption, string> = {
  popular: 'Popular',
  newest: 'Newest',
  'price-low': 'Price: LowHigh',
  'price-high': 'Price: HighLow',
  rating: 'Top Rated',
}

const priceRanges = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under $50', min: 0, max: 50 },
  { label: '$50 - $200', min: 50, max: 200 },
  { label: '$200 - $500', min: 200, max: 500 },
  { label: '$500+', min: 500, max: Infinity },
]

const ratingOptions = [
  { label: 'All', value: 0 },
  { label: '3+ ', value: 3 },
  { label: '4+ ', value: 4 },
  { label: '4.5+ ', value: 4.5 },
]

interface ProductListProps {
  products: Product[]
  loading?: boolean
  emptyMessage?: string
  emptyDescription?: string
  pageSize?: number
  showCount?: boolean
}

export function ProductList({
  products,
  loading,
  emptyMessage = 'No products found',
  emptyDescription = 'Check back soon for updates',
  pageSize = 8,
  showCount = true,
}: ProductListProps) {
  const [visibleCount, setVisibleCount] = useState(pageSize)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('popular')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedPriceRange, setSelectedPriceRange] = useState(0)
  const [minRating, setMinRating] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist, addToCompare, isInCompare, compareList } = useShopStore()

  // Filter and sort products
  const processedProducts = useMemo(() => {
    let result = [...products]

    // Price range filter
    const range = priceRanges[selectedPriceRange]
    result = result.filter(p => p.price >= range.min && p.price < range.max)

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'price-low':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        result.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
        break
      case 'popular':
      default:
        result.sort((a, b) => a.order - b.order)
        break
    }

    return result
  }, [products, sortBy, selectedPriceRange, minRating])

  const activeFilterCount = [
    selectedPriceRange > 0 ? 1 : 0,
    minRating > 0 ? 1 : 0,
    sortBy !== 'popular' ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  const resetFilters = () => {
    setSelectedPriceRange(0)
    setMinRating(0)
    setSortBy('popular')
  }

  const visibleProducts = processedProducts.slice(0, visibleCount)
  const hasMore = visibleCount < processedProducts.length

  // Infinite scroll with IntersectionObserver
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          setIsLoadingMore(true)
          // Simulate loading delay
          setTimeout(() => {
            setVisibleCount(prev => prev + pageSize)
            setIsLoadingMore(false)
          }, 500)
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    )

    observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [hasMore, pageSize, isLoadingMore])

  // Reset visible count when products change
  useEffect(() => {
    setVisibleCount(pageSize)
  }, [products, pageSize])

  // Loading state
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-28 animate-pulse rounded bg-muted" />
          <div className="flex gap-1">
            <div className="h-7 w-7 animate-pulse rounded bg-muted" />
            <div className="h-7 w-7 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className={`grid gap-2.5 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1'}`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  // Empty state
  if (products.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-16 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <PackageOpen className="h-10 w-10 text-muted-foreground" />
        </motion.div>
        <p className="text-sm font-semibold text-foreground">{emptyMessage}</p>
        <p className="mt-1 text-xs text-muted-foreground">{emptyDescription}</p>
        {activeFilterCount > 0 && (
          <Button variant="outline" size="sm" className="mt-3 gap-1 text-xs" onClick={resetFilters}>
            <RotateCcw className="h-3 w-3" />
            Reset Filters
          </Button>
        )}
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span>Try adjusting your filters</span>
        </div>
      </motion.div>
    )
  }

  // No results after filtering
  if (processedProducts.length === 0 && products.length > 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-12 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/10">
          <Filter className="h-6 w-6 text-amber-500" />
        </div>
        <p className="text-sm font-semibold text-foreground">No products match your filters</p>
        <p className="mt-1 text-xs text-muted-foreground">Try adjusting price range or rating</p>
        <Button variant="outline" size="sm" className="mt-3 gap-1 text-xs" onClick={resetFilters}>
          <X className="h-3 w-3" />
          Clear All Filters
        </Button>
      </motion.div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        {/* Product count & sale badge */}
        {showCount && (
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{visibleProducts.length}</span> of{' '}
              <span className="font-semibold text-foreground">{processedProducts.length}</span>
              {processedProducts.length !== products.length && (
                <span className="text-muted-foreground"> (filtered from {products.length})</span>
              )}
            </p>
            {products.some((p) => p.comparePrice) && (
              <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                {products.filter((p) => p.comparePrice).length} on sale
              </Badge>
            )}
          </div>
        )}

        {/* View & Sort Controls */}
        <div className="flex items-center gap-1">
          {/* Sort */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1 text-[10px] px-2"
              onClick={() => { setShowSortMenu(!showSortMenu); setShowFilters(false) }}
            >
              <ArrowUpDown className="h-3 w-3" />
              <span className="hidden sm:inline">{sortLabels[sortBy]}</span>
            </Button>
            <AnimatePresence>
              {showSortMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.95 }}
                  className="absolute right-0 top-full z-20 mt-1 w-40 rounded-xl border border-border/50 bg-card shadow-lg"
                >
                  {(Object.entries(sortLabels) as [SortOption, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => { setSortBy(key); setShowSortMenu(false) }}
                      className={`flex w-full items-center justify-between px-3 py-2 text-[11px] transition-colors first:rounded-t-xl last:rounded-b-xl ${
                        sortBy === key ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-accent'
                      }`}
                    >
                      {label}
                      {sortBy === key && <Check className="h-3 w-3" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Filter */}
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1 text-[10px] px-2 relative"
            onClick={() => { setShowFilters(!showFilters); setShowSortMenu(false) }}
          >
            <SlidersHorizontal className="h-3 w-3" />
            {activeFilterCount > 0 && (
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[7px] text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-0.5 rounded-lg border border-border/50 bg-muted/30 p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              <Grid3X3 className="h-3 w-3" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              <List className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden rounded-xl border border-border/50 bg-card"
          >
            <div className="p-3 space-y-3">
              {/* Price Range */}
              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Price Range</p>
                <div className="flex flex-wrap gap-1">
                  {priceRanges.map((range, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedPriceRange(i)}
                      className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                        selectedPriceRange === i ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Minimum Rating</p>
                <div className="flex gap-1">
                  {ratingOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setMinRating(opt.value)}
                      className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                        minRating === opt.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-border/50 py-1.5 text-[10px] text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3 w-3" />
                  Clear all filters ({activeFilterCount})
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Grid / List */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 gap-2.5 sm:grid-cols-3"
          >
            {visibleProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {visibleProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} variant="horizontal" />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Load More / Infinite Scroll Trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center pt-2">
          {isLoadingMore ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <motion.div
                className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              Loading more...
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setVisibleCount((prev) => prev + pageSize)}
            >
              Load More
              <ChevronDown className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}

      {/* End of results indicator */}
      {!hasMore && processedProducts.length > pageSize && (
        <motion.div
          className="flex items-center justify-center gap-2 py-2 text-[10px] text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="h-px w-8 bg-border" />
          <span>You&apos;ve seen it all!</span>
          <Sparkles className="h-3 w-3" />
          <div className="h-px w-8 bg-border" />
        </motion.div>
      )}
    </div>
  )
}
