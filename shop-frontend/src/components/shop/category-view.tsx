'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Filter, SortAsc, ChevronDown, X, SlidersHorizontal,
  Check, PackageOpen, Grid3X3, List, Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductList } from '@/components/shop/product-list'
import { useShopStore, type Product, type Category } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { ProductCard, ProductCardSkeleton, formatPrice } from '@/components/shop/product-card'
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
  { label: '$500 - $1000', min: 500, max: 1000 },
  { label: 'Over $1000', min: 1000, max: Infinity },
]

const subcategoryEmojis: Record<string, string> = {
  websites: '',
  apps: '',
  devops: '',
  design: '',
  marketing: '',
  security: '',
}

export function CategoryView() {
  const { selectedCategoryId } = useShopStore()
  const { goHome, goBack, goCategory, goProduct } = useShopRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [subcategories, setSubcategories] = useState<{ id: string; name: string; count: number }[]>([])
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>('popular')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedPriceRange, setSelectedPriceRange] = useState(0)
  const [minRating, setMinRating] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [visibleCount, setVisibleCount] = useState(8)

  useEffect(() => {
    if (!selectedCategoryId) {
      goHome()
      return
    }

    const fetchData = async () => {
      setLoading(true)
      try {
        const catRes = await fetch('/api/categories')
        if (catRes.ok) {
          const categories: Category[] = await catRes.json()
          const currentCat = categories.find((c) => c.id === selectedCategoryId)
          setCategory(currentCat || null)

          if (currentCat?.slug) {
            const prodRes = await fetch(`/api/products?category=${currentCat.slug}`)
            if (prodRes.ok) {
              const prodData = await prodRes.json()
              const allProducts: Product[] = Array.isArray(prodData) ? prodData : prodData.data || []
              setProducts(allProducts)

              // Generate subcategories from products
              const catMap = new Map<string, { id: string; name: string; count: number }>()
              allProducts.forEach(p => {
                if (p.category) {
                  const key = p.category.id
                  if (!catMap.has(key)) {
                    catMap.set(key, { id: p.category.id, name: p.category.name, count: 0 })
                  }
                  catMap.get(key)!.count++
                }
              })
              setSubcategories(Array.from(catMap.values()))
            }
          } else {
            const prodRes = await fetch('/api/products')
            if (prodRes.ok) {
              const prodData = await prodRes.json()
              const allProducts: Product[] = Array.isArray(prodData) ? prodData : prodData.data || []
              setProducts(allProducts.filter((p) => p.categoryId === selectedCategoryId))
            }
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedCategoryId])

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products]

    // Subcategory filter
    if (activeSubcategory) {
      result = result.filter(p => p.categoryId === activeSubcategory)
    }

    // Price range filter
    const range = priceRanges[selectedPriceRange]
    result = result.filter(p => p.price >= range.min && p.price < range.max)

    // Rating filter
    if (minRating > 0) {
      // Since we don't have real ratings on products, keep all (would filter in production)
    }

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
  }, [products, activeSubcategory, selectedPriceRange, minRating, sortBy])

  const activeFilterCount = [
    activeSubcategory ? 1 : 0,
    selectedPriceRange > 0 ? 1 : 0,
    minRating > 0 ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  const resetFilters = () => {
    setActiveSubcategory(null)
    setSelectedPriceRange(0)
    setMinRating(0)
    setSortBy('popular')
  }

  const visibleProducts = filteredProducts.slice(0, visibleCount)
  const hasMore = visibleCount < filteredProducts.length

  return (
    <motion.div
      className="px-4 py-2 pb-24"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Category Hero Banner */}
      <div className="relative mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-5">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -left-4 -bottom-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => goBack()}
          className="absolute left-2 top-2 h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="text-center pt-4">
          <span className="text-3xl">{subcategoryEmojis[category?.slug || ''] || ''}</span>
          <h1 className="mt-2 text-xl font-bold text-foreground">
            {category?.name || 'Category'}
          </h1>
          {category?.description && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2 max-w-[250px] mx-auto">{category.description}</p>
          )}
          <Badge variant="secondary" className="mt-2 text-[10px]">
            <PackageOpen className="mr-1 h-3 w-3" />
            {products.length} products
          </Badge>
        </div>
      </div>

      {/* Subcategory Chips */}
      {subcategories.length > 1 && (
        <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setActiveSubcategory(null)}
            className={`flex-shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors ${
              !activeSubcategory ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            All
          </button>
          {subcategories.map(sub => (
            <button
              key={sub.id}
              onClick={() => setActiveSubcategory(activeSubcategory === sub.id ? null : sub.id)}
              className={`flex-shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors ${
                activeSubcategory === sub.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {subcategoryEmojis[sub.name.toLowerCase()] || ''} {sub.name} ({sub.count})
            </button>
          ))}
        </div>
      )}

      {/* Sort & Filter Bar */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Sort Button */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1 text-[11px]"
              onClick={() => { setShowSortMenu(!showSortMenu); setShowFilters(false) }}
            >
              <SortAsc className="h-3 w-3" />
              {sortLabels[sortBy]}
              <ChevronDown className="h-3 w-3" />
            </Button>
            <AnimatePresence>
              {showSortMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.95 }}
                  className="absolute left-0 top-full z-20 mt-1 w-44 rounded-xl border border-border/50 bg-card shadow-lg"
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

          {/* Filter Button */}
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1 text-[11px] relative"
            onClick={() => { setShowFilters(!showFilters); setShowSortMenu(false) }}
          >
            <SlidersHorizontal className="h-3 w-3" />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-muted/30 p-0.5">
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

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-3 overflow-hidden rounded-xl border border-border/50 bg-card"
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

              {/* Minimum Rating */}
              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Minimum Rating</p>
                <div className="flex gap-1">
                  {[0, 3, 4, 4.5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                        minRating === rating ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {rating === 0 ? 'All' : `${rating}+`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset */}
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-border/50 py-1.5 text-[10px] text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                  Clear all filters ({activeFilterCount})
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Count */}
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground">
          <span className="font-semibold text-foreground">{filteredProducts.length}</span> products found
        </p>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        /* Empty State */
        <motion.div
          className="flex flex-col items-center justify-center py-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <PackageOpen className="h-10 w-10 text-muted-foreground" />
          </motion.div>
          <p className="text-sm font-semibold text-foreground">No products found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try adjusting your filters or browse other categories
          </p>
          {activeFilterCount > 0 && (
            <Button variant="outline" size="sm" className="mt-3 gap-1 text-xs" onClick={resetFilters}>
              <X className="h-3 w-3" />
              Clear Filters
            </Button>
          )}
          <Button variant="ghost" size="sm" className="mt-2 text-xs text-primary" onClick={() => goCategory()}>
            Browse All Categories
          </Button>
        </motion.div>
      ) : (
        /* Product Grid / List */
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {visibleProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {visibleProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} variant="horizontal" />
              ))}
            </div>
          )}

          {/* Load More */}
          {hasMore && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => setVisibleCount(prev => prev + 8)}
              >
                Load More ({filteredProducts.length - visibleCount} remaining)
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}

