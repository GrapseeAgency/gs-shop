'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Filter,
  ArrowUpDown,
  Package,
  SlidersHorizontal,
  X,
  ChevronDown,
  Star,
  ShoppingCart,
  Heart,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ProductCard, ProductCardSkeleton, formatPrice } from '@/components/shop/product-card'
import { useShopStore, type Product, type Category } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { toast } from 'sonner'

type SortOption = 'popular' | 'newest' | 'price-low' | 'price-high' | 'rating'

const gradientColors = [
  'from-emerald-500/30 to-teal-600/30',
  'from-violet-500/30 to-purple-600/30',
  'from-amber-500/30 to-orange-600/30',
  'from-rose-500/30 to-pink-600/30',
  'from-cyan-500/30 to-blue-600/30',
  'from-lime-500/30 to-green-600/30',
]

export default function CategorySlugPage() {
  const params = useParams()
  const slug = params.slug as string
  const { goBack, goCategory, goProduct } = useShopRouter()
  const { setSelectedCategoryId, addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useShopStore()

  const [products, setProducts] = useState<Product[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)

  // Filters
  const [sortOption, setSortOption] = useState<SortOption>('popular')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])
  const [maxPrice, setMaxPrice] = useState(10000)
  const [inStockOnly, setInStockOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const ITEMS_PER_PAGE = 12

  useEffect(() => {
    if (!slug) return

    const fetchData = async () => {
      setLoading(true)
      setPage(1)
      try {
        // Fetch category by slug
        const catRes = await fetch(`/api/categories/${slug}`)
        if (catRes.ok) {
          const catData = await catRes.json()
          setCategory(catData)
          setSelectedCategoryId(catData.id)
        }

        // Fetch products for this category
        const prodRes = await fetch(`/api/products?category=${slug}&limit=${ITEMS_PER_PAGE}`)
        if (prodRes.ok) {
          const prodData = await prodRes.json()
          const items = Array.isArray(prodData) ? prodData : prodData.data || []
          setProducts(items)
          setHasMore(items.length >= ITEMS_PER_PAGE)

          // Set max price for range filter
          if (items.length > 0) {
            const highestPrice = Math.max(...items.map((p: Product) => p.price))
            setMaxPrice(Math.ceil(highestPrice / 100) * 100)
            setPriceRange([0, Math.ceil(highestPrice / 100) * 100])
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [slug, setSelectedCategoryId])

  // Load more products
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const res = await fetch(`/api/products?category=${slug}&limit=${ITEMS_PER_PAGE}&page=${nextPage}`)
      if (res.ok) {
        const data = await res.json()
        const items = Array.isArray(data) ? data : data.data || []
        setProducts((prev) => [...prev, ...items])
        setHasMore(items.length >= ITEMS_PER_PAGE)
        setPage(nextPage)
      }
    } catch {
      // ignore
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, hasMore, page, slug])

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let items = [...products]

    // Price range filter
    items = items.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])

    // In-stock filter (products with price > 0 are "in stock")
    if (inStockOnly) {
      items = items.filter((p) => p.isActive)
    }

    // Sort
    switch (sortOption) {
      case 'popular':
        items.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || a.order - b.order)
        break
      case 'newest':
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'price-low':
        items.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        items.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        items.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
        break
    }

    return items
  }, [products, priceRange, inStockOnly, sortOption])

  const sortOptions: { key: SortOption; label: string }[] = [
    { key: 'popular', label: 'Most Popular' },
    { key: 'newest', label: 'Newest First' },
    { key: 'price-low', label: 'Price: Low  High' },
    { key: 'price-high', label: 'Price: High  Low' },
    { key: 'rating', label: 'Top Rated' },
  ]

  const gradientIndex = category?.name
    ? category.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradientColors.length
    : 0

  const activeFilterCount = [
    priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0,
    inStockOnly ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  return (
    <motion.div
      className="px-4 py-2 pb-8"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Category Hero Banner */}
      <motion.div
        className={`mb-4 rounded-2xl bg-gradient-to-br ${gradientColors[gradientIndex]} border border-border/30 p-5 relative overflow-hidden`}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="relative z-10">
          <button
            onClick={goBack}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-xs">Back</span>
          </button>
          <h1 className="text-xl font-bold text-foreground mb-1">
            {category?.name || 'Category'}
          </h1>
          {category?.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{category.description}</p>
          )}
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/20 text-primary border-0 text-[10px]">
              <Package className="mr-1 h-3 w-3" />
              {products.length} Products
            </Badge>
            {category?.icon && (
              <span className="text-lg">{category.icon}</span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Filter Bar */}
      <div className="mb-4 flex items-center gap-2">
        {/* Sort */}
        <div className="relative flex-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1.5 text-[11px] h-8 border-border/50 justify-between"
            onClick={() => { setShowSortMenu(!showSortMenu); setShowFilters(false) }}
          >
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="h-3 w-3" />
              {sortOptions.find((s) => s.key === sortOption)?.label}
            </div>
            <ChevronDown className="h-3 w-3" />
          </Button>
          {showSortMenu && (
            <motion.div
              className="absolute left-0 top-9 z-50 w-48 rounded-xl border border-border/50 bg-card shadow-lg overflow-hidden"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {sortOptions.map((option) => (
                <button
                  key={option.key}
                  className={`flex w-full items-center gap-2 px-3 py-2.5 text-xs text-left transition-colors ${
                    sortOption === option.key ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-muted/30'
                  }`}
                  onClick={() => { setSortOption(option.key); setShowSortMenu(false) }}
                >
                  {sortOption === option.key && <Eye className="h-3 w-3" />}
                  {option.label}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Filters Toggle */}
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-[11px] h-8 border-border/50 relative"
          onClick={() => { setShowFilters(!showFilters); setShowSortMenu(false) }}
        >
          <SlidersHorizontal className="h-3 w-3" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="h-4 w-4 p-0 flex items-center justify-center bg-primary text-primary-foreground text-[8px] absolute -top-1 -right-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="mb-4 rounded-2xl border border-border/50 bg-card p-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-foreground">Filters</h3>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[10px] text-destructive h-5 px-1.5"
                  onClick={() => { setPriceRange([0, maxPrice]); setInStockOnly(false) }}
                >
                  Clear All
                </Button>
              )}
            </div>

            {/* Price Range */}
            <div className="mb-4">
              <Label className="text-xs font-medium text-foreground mb-2 block">
                Price Range: {formatPrice(priceRange[0])}  {formatPrice(priceRange[1])}
              </Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-8">$0</span>
                  <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="flex-1 h-1.5 accent-primary"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-8">${maxPrice}</span>
                  <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="flex-1 h-1.5 accent-primary"
                  />
                </div>
              </div>
            </div>

            {/* In Stock Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground">In Stock Only</span>
              <button
                onClick={() => setInStockOnly(!inStockOnly)}
                className={`relative h-6 w-11 rounded-full transition-colors ${inStockOnly ? 'bg-primary' : 'bg-muted'}`}
              >
                <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${inStockOnly ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Count */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
        </p>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-[10px] text-primary h-5 px-1.5"
            onClick={() => { setPriceRange([0, maxPrice]); setInStockOnly(false); setSortOption('popular') }}
          >
            <X className="h-3 w-3 mr-0.5" />
            Reset Filters
          </Button>
        )}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <motion.div
          className="flex flex-col items-center justify-center py-16 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Package className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">No products found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Try adjusting your filters or browse all categories
          </p>
          <Button
            onClick={() => goCategory()}
            variant="outline"
            className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
          >
            Browse All Categories
          </Button>
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="mt-5 text-center">
              <Button
                variant="outline"
                className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                      <Package className="h-4 w-4" />
                    </motion.div>
                    Loading...
                  </>
                ) : (
                  <>
                    Load More Products
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}

function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement> & { className?: string }) {
  return <label className={className} {...props}>{children}</label>
}
