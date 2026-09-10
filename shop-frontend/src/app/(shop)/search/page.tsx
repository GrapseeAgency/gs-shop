'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Search, X, SlidersHorizontal, Grid2X2, List,
  TrendingUp, Clock, Sparkles, ChevronRight, Star, Zap, Crown,
  Globe, Smartphone, Server, Palette, Layout, Code, Shield, Database,
  Brain, Code2, ShoppingCart, ShieldCheck, BarChart3, Plug, FileText,
  Layers, Gamepad2, Link, Mail, Video, Bot, Wand2, Terminal, Cloud,
  KeyRound, BookOpen, FlaskConical, LayoutTemplate,
} from 'lucide-react'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Globe, Smartphone, Server, Palette, Layout, Code, Shield, Database,
  TrendingUp, Brain, Code2, ShoppingCart, ShieldCheck, BarChart3, Plug,
  FileText, Layers, Gamepad2, Link, Mail, Video, Bot, Wand2, Terminal,
  Cloud, KeyRound, BookOpen, FlaskConical, LayoutTemplate,
}
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { ProductCard, ProductCardSkeleton, formatPrice } from '@/components/shop/product-card'
import { useShopStore, type Product, type Category } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'

type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'newest'
type ViewMode = 'grid' | 'list'

const TRENDING_SEARCHES = [
  'Website', 'Mobile App', 'DevOps', 'E-commerce', 'Portfolio', 'SaaS', 'Dashboard', 'API'
]

function SearchContent() {
  const searchParams = useSearchParams()
  const queryParam = searchParams.get('q') || ''
  const { goBack, goCategory } = useShopRouter()
  const {
    searchQuery, setSearchQuery, recentSearches, addRecentSearch, clearRecentSearches,
  } = useShopStore()

  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showFilters, setShowFilters] = useState(false)

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minRating, setMinRating] = useState(0)
  const [sortBy, setSortBy] = useState<SortOption>('relevance')
  const [flashDealsOnly, setFlashDealsOnly] = useState(false)
  const [premiumOnly, setPremiumOnly] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize from URL param
  useEffect(() => {
    if (queryParam && !searchQuery) {
      setSearchQuery(queryParam)
    }
  }, [queryParam, searchQuery, setSearchQuery])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Load categories
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.ok ? res.json() : [])
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  // Search suggestions
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([])
      return
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=6`)
        if (res.ok) {
          const data = await res.json()
          const products = Array.isArray(data) ? data : data.data || []
          setSuggestions(products.map((p: Product) => p.name).slice(0, 5))
        }
      } catch {
        setSuggestions([])
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Main search with filters
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ search: searchQuery, limit: '40' })
        if (selectedCategory) params.set('category', selectedCategory)
        if (sortBy !== 'relevance') params.set('sort', sortBy)
        if (flashDealsOnly) params.set('deals', 'true')
        if (premiumOnly) params.set('featured', 'true')

        const res = await fetch(`/api/products?${params}`)
        if (res.ok) {
          const data = await res.json()
          let products: Product[] = Array.isArray(data) ? data : data.data || []

          // Client-side filters for price and rating
          if (minPrice) {
            const min = parseFloat(minPrice)
            if (!isNaN(min)) products = products.filter(p => p.price >= min)
          }
          if (maxPrice) {
            const max = parseFloat(maxPrice)
            if (!isNaN(max)) products = products.filter(p => p.price <= max)
          }
          if (minRating > 0) {
            products = products.filter(p => { const r = (p as unknown as Record<string, unknown>).rating; return r !== undefined ? Number(r) >= minRating : true })
          }

          setResults(products)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    }
  }, [searchQuery, selectedCategory, sortBy, flashDealsOnly, premiumOnly, minPrice, maxPrice, minRating])

  const handleSubmitSearch = useCallback(() => {
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery)
      setShowSuggestions(false)
    }
  }, [searchQuery, addRecentSearch])

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setSearchQuery(suggestion)
    addRecentSearch(suggestion)
    setShowSuggestions(false)
  }, [setSearchQuery, addRecentSearch])

  const handleRecentSearchClick = useCallback((query: string) => {
    setSearchQuery(query)
    setShowSuggestions(false)
  }, [setSearchQuery])

  const clearFilters = () => {
    setSelectedCategory(null)
    setMinPrice('')
    setMaxPrice('')
    setMinRating(0)
    setSortBy('relevance')
    setFlashDealsOnly(false)
    setPremiumOnly(false)
  }

  const activeFilterCount = [
    selectedCategory,
    minPrice,
    maxPrice,
    minRating > 0,
    sortBy !== 'relevance',
    flashDealsOnly,
    premiumOnly,
  ].filter(Boolean).length

  return (
    <motion.div
      className="px-4 py-2"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Search header */}
      <div className="mb-3 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setSearchQuery('')
            goBack()
          }}
          className="flex-shrink-0 text-muted-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmitSearch()
            }}
            className="bg-card pl-9 pr-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
              onClick={() => {
                setSearchQuery('')
                setResults([])
                inputRef.current?.focus()
              }}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={`flex-shrink-0 relative ${showFilters ? 'text-primary' : 'text-muted-foreground'}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-5 w-5" />
          {activeFilterCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Autocomplete / Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && searchQuery.length >= 2 && suggestions.length > 0 && (
          <motion.div
            className="mb-3 overflow-hidden rounded-xl border border-border/50 bg-card shadow-lg"
            initial={{ opacity: 0, y: -5, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="p-1">
              <div className="flex items-center gap-2 px-3 py-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Suggestions</span>
              </div>
              {suggestions.map((suggestion, i) => (
                <button
                  key={suggestion}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-primary/5 active:scale-[0.98]"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <Search className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                  <span className="text-sm text-foreground">{suggestion}</span>
                  <ChevronRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="mb-4 overflow-hidden rounded-2xl border border-border/50 bg-card"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4 space-y-4">
              {/* Category Chips */}
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Category</p>
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                  <button
                    className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                      !selectedCategory
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted text-muted-foreground hover:bg-primary/10'
                    }`}
                    onClick={() => setSelectedCategory(null)}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                        selectedCategory === cat.slug
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-muted text-muted-foreground hover:bg-primary/10'
                      }`}
                      onClick={() => setSelectedCategory(cat.slug)}
                    >
                      {cat.icon && <span className="mr-1">{cat.icon}</span>}
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Price Range</p>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Min"
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="h-9 text-xs"
                  />
                  <span className="text-xs text-muted-foreground">to</span>
                  <Input
                    placeholder="Max"
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Minimum Rating</p>
                <div className="flex gap-2">
                  {[0, 3, 3.5, 4, 4.5].map((rating) => (
                    <button
                      key={rating}
                      className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                        minRating === rating
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-muted text-muted-foreground hover:bg-primary/10'
                      }`}
                      onClick={() => setMinRating(rating)}
                    >
                      {rating === 0 ? (
                        'Any'
                      ) : (
                        <>
                          <Star className="h-3 w-3 fill-current" />
                          {rating}+
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Sort By</p>
                <div className="flex flex-wrap gap-2">
                  {([
                    ['relevance', 'Relevance'],
                    ['price-asc', 'Price: Low  High'],
                    ['price-desc', 'Price: High  Low'],
                    ['rating', 'Top Rated'],
                    ['newest', 'Newest'],
                  ] as [SortOption, string][]).map(([value, label]) => (
                    <button
                      key={value}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                        sortBy === value
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-muted text-muted-foreground hover:bg-primary/10'
                      }`}
                      onClick={() => setSortBy(value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium text-foreground">Flash Deals Only</span>
                  </div>
                  <Switch
                    checked={flashDealsOnly}
                    onCheckedChange={setFlashDealsOnly}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium text-foreground">Premium Only</span>
                  </div>
                  <Switch
                    checked={premiumOnly}
                    onCheckedChange={setPremiumOnly}
                  />
                </div>
              </div>

              {/* Clear Filters */}
              {activeFilterCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={clearFilters}
                >
                  Clear All Filters ({activeFilterCount})
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && !showFilters && (
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {selectedCategory && (
            <Badge variant="secondary" className="flex-shrink-0 gap-1 text-[10px]">
              {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
              <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => setSelectedCategory(null)} />
            </Badge>
          )}
          {sortBy !== 'relevance' && (
            <Badge variant="secondary" className="flex-shrink-0 gap-1 text-[10px]">
              Sort: {sortBy === 'price-asc' ? 'LowHigh' : sortBy === 'price-desc' ? 'HighLow' : sortBy === 'rating' ? 'Top Rated' : 'Newest'}
              <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => setSortBy('relevance')} />
            </Badge>
          )}
          {flashDealsOnly && (
            <Badge variant="secondary" className="flex-shrink-0 gap-1 text-[10px]">
              Flash Deals
              <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => setFlashDealsOnly(false)} />
            </Badge>
          )}
          {premiumOnly && (
            <Badge variant="secondary" className="flex-shrink-0 gap-1 text-[10px]">
              Premium
              <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => setPremiumOnly(false)} />
            </Badge>
          )}
        </div>
      )}

      {/* Search Results */}
      {searchQuery.trim() ? (
        <>
          {/* Results header with count and view toggle */}
          <div className="mb-3 flex items-center justify-between">
            <motion.p
              className="text-sm font-medium text-foreground"
              key={results.length}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {loading ? (
                <span className="text-muted-foreground">Searching...</span>
              ) : (
                <>
                  <span className="text-primary font-bold">{results.length}</span>{' '}
                  result{results.length !== 1 ? 's' : ''}
                </>
              )}
            </motion.p>
            {results.length > 0 && (
              <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-muted/50 p-0.5">
                <button
                  className={`flex h-7 w-7 items-center justify-center rounded-md transition-all ${
                    viewMode === 'grid' ? 'bg-background shadow-sm' : ''
                  }`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid2X2 className="h-3.5 w-3.5" />
                </button>
                <button
                  className={`flex h-7 w-7 items-center justify-center rounded-md transition-all ${
                    viewMode === 'list' ? 'bg-background shadow-sm' : ''
                  }`}
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Results Grid/List */}
          {loading ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-2.5' : 'space-y-2.5'}>
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : results.length === 0 ? (
            <motion.div
              className="flex flex-col items-center justify-center py-16 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-base font-semibold text-foreground">No results found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                We couldn&apos;t find anything for &ldquo;{searchQuery}&rdquo;
              </p>
              <div className="mt-6 space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Try searching for</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {TRENDING_SEARCHES.slice(0, 4).map((term) => (
                    <button
                      key={term}
                      className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-all hover:bg-primary/20 active:scale-95"
                      onClick={() => handleSuggestionClick(term)}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-2.5' : 'space-y-2.5'}>
              {results.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  variant={viewMode === 'list' ? 'horizontal' : 'grid'}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        /* Empty state - Recent searches & Popular categories */
        <div className="space-y-6">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-foreground">Recent Searches</span>
                </div>
                <button
                  className="text-[10px] font-medium text-primary hover:underline"
                  onClick={clearRecentSearches}
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((query) => (
                  <button
                    key={query}
                    className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:bg-primary/10 active:scale-95"
                    onClick={() => handleRecentSearchClick(query)}
                  >
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {query}
                    <X
                      className="h-3 w-3 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation()
                        useShopStore.setState({ recentSearches: useShopStore.getState().recentSearches.filter((s: string) => s !== query) })
                      }}
                    />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Trending Searches */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Trending Now</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRENDING_SEARCHES.map((term, i) => (
                <motion.button
                  key={term}
                  className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-all hover:bg-primary/20 active:scale-95"
                  onClick={() => handleSuggestionClick(term)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <TrendingUp className="h-3 w-3" />
                  {term}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Popular Categories */}
          {categories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Popular Categories</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {categories.slice(0, 6).map((cat, i) => (
                  <motion.button
                    key={cat.id}
                    className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3 text-left transition-all hover:border-primary/20 hover:shadow-md active:scale-[0.97]"
                    onClick={() => {
                      setSelectedCategory(cat.slug)
                      setSearchQuery('')
                      goCategory(cat.id, cat.slug)
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      {(() => {
                        const IconComp = iconMap[cat.icon || ''] || Globe
                        return <IconComp className="h-5 w-5 text-primary" />
                      })()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">{cat.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {cat._count?.products || 0} products
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Empty state illustration */}
          {recentSearches.length === 0 && (
            <motion.div
              className="flex flex-col items-center justify-center py-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">Search Products</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Find websites, apps, and DevOps services
              </p>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
