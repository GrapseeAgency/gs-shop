'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Search, X, Mic, MicOff, TrendingUp, Clock,
  SlidersHorizontal, Check, ChevronDown, Star, Tag, Sparkles,
  Lightbulb, RotateCcw, PackageOpen, Smartphone, Laptop, Headphones,
  BarChart3, Bot, Globe, Settings, Palette
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductList } from '@/components/shop/product-list'
import { useShopStore, type Product } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  phone: Smartphone,
  laptop: Laptop,
  headphones: Headphones,
  chart: BarChart3,
  robot: Bot,
  globe: Globe,
  gear: Settings,
  palette: Palette,
}

const trendingSearches = [
  { term: 'iPhone', iconKey: 'phone' },
  { term: 'Laptop', iconKey: 'laptop' },
  { term: 'Headphones', iconKey: 'headphones' },
  { term: 'Dashboard', iconKey: 'chart' },
  { term: 'Chatbot', iconKey: 'robot' },
  { term: 'Website', iconKey: 'globe' },
  { term: 'Mobile App', iconKey: 'phone' },
  { term: 'DevOps', iconKey: 'gear' },
]

const searchSuggestions: Record<string, string[]> = {
  'w': ['Website Design', 'Web Development', 'WordPress Setup'],
  'a': ['App Development', 'API Integration', 'AI Chatbot'],
  'd': ['Dashboard UI', 'DevOps Setup', 'Database Design'],
  's': ['SaaS Platform', 'Security Audit', 'SEO Optimization'],
  'm': ['Mobile App', 'Marketing Website', 'Maintenance Plan'],
  'e': ['E-commerce Store', 'Email Template', 'Enterprise Solution'],
  'c': ['Chatbot', 'Corporate Website', 'CMS Development'],
  'l': ['Landing Page', 'Logo Design', 'Live Chat'],
}

type SortOption = 'relevance' | 'price-low' | 'price-high' | 'newest' | 'rating'

const priceRanges = [
  { label: 'All', min: 0, max: Infinity },
  { label: 'Under $100', min: 0, max: 100 },
  { label: '$100-$500', min: 100, max: 500 },
  { label: '$500-$2000', min: 500, max: 2000 },
  { label: 'Over $2000', min: 2000, max: Infinity },
]

export function SearchView() {
  const { searchQuery, setSearchQuery, recentSearches, addRecentSearch, clearRecentSearches } = useShopStore()
  const { goBack, goCategory, goProduct } = useShopRouter()
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('relevance')
  const [selectedPriceRange, setSelectedPriceRange] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [minRating, setMinRating] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Fetch search results
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}`)
        if (res.ok) {
          const data = await res.json()
          setResults(Array.isArray(data) ? data : data.data || [])
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Save search to recent when user stops typing
  useEffect(() => {
    if (searchQuery.trim() && !loading && results.length > 0) {
      const timer = setTimeout(() => {
        addRecentSearch(searchQuery.trim())
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [searchQuery, results.length, loading, addRecentSearch])

  // Filter and sort results
  const filteredResults = useMemo(() => {
    let filtered = [...results]

    if (selectedCategory) {
      filtered = filtered.filter(p => p.categoryId === selectedCategory)
    }

    const range = priceRanges[selectedPriceRange]
    filtered = filtered.filter(p => p.price >= range.min && p.price < range.max)

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'rating':
        filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
        break
    }

    return filtered
  }, [results, selectedCategory, selectedPriceRange, sortBy])

  // Get suggestions based on current input
  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return []
    const firstChar = searchQuery.trim()[0].toLowerCase()
    return searchSuggestions[firstChar] || []
  }, [searchQuery])

  // Extract categories from results
  const resultCategories = useMemo(() => {
    const cats = new Map<string, { id: string; name: string; count: number }>()
    results.forEach(p => {
      if (p.category) {
        const existing = cats.get(p.category.id)
        if (existing) {
          existing.count++
        } else {
          cats.set(p.category.id, { id: p.category.id, name: p.category.name, count: 1 })
        }
      }
    })
    return Array.from(cats.values())
  }, [results])

  const activeFilterCount = [
    selectedCategory ? 1 : 0,
    selectedPriceRange > 0 ? 1 : 0,
    minRating > 0 ? 1 : 0,
    sortBy !== 'relevance' ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  const resetFilters = () => {
    setSelectedCategory(null)
    setSelectedPriceRange(0)
    setMinRating(0)
    setSortBy('relevance')
  }

  // Voice search
  const toggleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return
    }

    if (isListening) {
      setIsListening(false)
      return
    }

    try {
      const SpeechRecognition = (window as unknown as Record<string, unknown>).SpeechRecognition || (window as unknown as Record<string, unknown>).webkitSpeechRecognition
      const recognition = new (SpeechRecognition as new () => { lang: string; continuous: boolean; interimResults: boolean; onstart: (() => void) | null; onend: (() => void) | null; onerror: (() => void) | null; onresult: ((e: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void) | null; start(): void; stop(): void })()
      recognition.lang = 'en-US'
      recognition.continuous = false
      recognition.interimResults = false

      recognition.onstart = () => setIsListening(true)
      recognition.onresult = (event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => {
        const transcript = event.results[0][0].transcript
        setSearchQuery(transcript)
        setIsListening(false)
      }
      recognition.onerror = () => setIsListening(false)
      recognition.onend = () => setIsListening(false)
      recognition.start()
    } catch {
      setIsListening(false)
    }
  }

  const noResultsSuggestions = [
    'Try broader keywords',
    'Check for typos',
    'Browse our categories',
    'Search for "dashboard" or "website"',
  ]

  return (
    <motion.div
      className="px-4 py-2 pb-24"
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
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-card pl-9 pr-16"
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            {/* Voice Search */}
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${isListening ? 'text-red-500' : 'text-muted-foreground'}`}
              onClick={toggleVoiceSearch}
            >
              {isListening ? (
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
                  <MicOff className="h-3.5 w-3.5" />
                </motion.div>
              ) : (
                <Mic className="h-3.5 w-3.5" />
              )}
            </Button>
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Voice listening indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 flex items-center justify-center gap-2 rounded-xl bg-red-500/10 py-2"
          >
            <motion.div
              className="h-3 w-3 rounded-full bg-red-500"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-xs font-medium text-red-500">Listening...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Suggestions Dropdown */}
      <AnimatePresence>
        {searchQuery.trim() && suggestions.length > 0 && !loading && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mb-3 rounded-xl border border-border/50 bg-card shadow-lg overflow-hidden"
          >
            <div className="p-2">
              <p className="px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Suggestions</p>
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setSearchQuery(suggestion)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-foreground hover:bg-accent transition-colors"
                >
                  <Lightbulb className="h-3 w-3 text-amber-500" />
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Before Search - Recent & Trending */}
      {!searchQuery.trim() && (
        <div className="space-y-4">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold text-foreground">Recent Searches</span>
                </div>
                <button
                  onClick={clearRecentSearches}
                  className="text-[10px] text-muted-foreground hover:text-foreground"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recentSearches.map((query, i) => (
                  <div key={i} className="group flex items-center gap-1 rounded-full border border-border/50 bg-muted/30 px-2.5 py-1">
                    <button
                      onClick={() => setSearchQuery(query)}
                      className="text-[11px] text-foreground hover:text-primary transition-colors"
                    >
                      {query}
                    </button>
                    <button
                      onClick={() => {
                        // Remove individual search
                        const filtered = recentSearches.filter((_, idx) => idx !== i)
                        // We can't remove individual, so we clear and re-add
                        clearRecentSearches()
                        filtered.forEach(q => addRecentSearch(q))
                      }}
                      className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-semibold text-foreground">Trending Searches</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {trendingSearches.map((item, i) => (
                <motion.button
                  key={item.term}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSearchQuery(item.term)}
                  className="flex items-center gap-1 rounded-full border border-border/50 bg-card px-2.5 py-1.5 text-[11px] font-medium text-foreground transition-all hover:border-primary/30 hover:shadow-sm active:scale-95"
                >
                  {(() => {
                    const IconComponent = iconMap[item.iconKey] || Search
                    return <IconComponent className="h-4 w-4 text-muted-foreground" />
                  })()}
                  {item.term}
                  {i < 3 && (
                    <Badge className="bg-amber-500/10 text-amber-500 border-0 text-[7px] px-1 py-0 h-3">
                      HOT
                    </Badge>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Browse Categories */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground">Browse by Category</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Websites', iconKey: 'globe' },
                { name: 'Mobile Apps', iconKey: 'phone' },
                { name: 'DevOps', iconKey: 'gear' },
                { name: 'Design', iconKey: 'palette' },
              ].map(cat => (
                <button
                  key={cat.name}
                  onClick={() => goCategory()}
                  className="flex items-center gap-2 rounded-xl border border-border/50 bg-card p-3 text-left transition-colors hover:bg-accent active:scale-[0.98]"
                >
                  {(() => {
                    const IconComponent = iconMap[cat.iconKey] || Search
                    return <IconComponent className="h-7 w-7 text-primary" />
                  })()}
                  <span className="text-xs font-medium text-foreground">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchQuery.trim() && (
        <>
          {/* Filter Bar */}
          {results.length > 0 && (
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-[11px] text-muted-foreground">
                  <span className="font-semibold text-foreground">{filteredResults.length}</span> results
                </p>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                    {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 text-[10px]"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="h-3 w-3" />
                  Filter
                  {activeFilterCount > 0 && (
                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[7px] text-primary-foreground">{activeFilterCount}</span>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Category Filter Chips */}
          {resultCategories.length > 1 && (
            <div className="mb-2 flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`flex-shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                  !selectedCategory ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                All ({results.length})
              </button>
              {resultCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  className={`flex-shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                    selectedCategory === cat.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {cat.name} ({cat.count})
                </button>
              ))}
            </div>
          )}

          {/* Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-3 overflow-hidden rounded-xl border border-border/50 bg-card"
              >
                <div className="p-3 space-y-3">
                  {/* Sort */}
                  <div>
                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Sort By</p>
                    <div className="flex flex-wrap gap-1">
                      {([
                        ['relevance', 'Relevance'],
                        ['price-low', 'Price: LowHigh'],
                        ['price-high', 'Price: HighLow'],
                        ['newest', 'Newest'],
                        ['rating', 'Top Rated'],
                      ] as [SortOption, string][]).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => setSortBy(key)}
                          className={`flex items-center gap-0.5 rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                            sortBy === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {sortBy === key && <Check className="h-2.5 w-2.5" />}
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

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
                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Min Rating</p>
                    <div className="flex gap-1">
                      {[0, 3, 4, 4.5].map(rating => (
                        <button
                          key={rating}
                          onClick={() => setMinRating(rating)}
                          className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${
                            minRating === rating ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {rating === 0 ? 'All' : `${rating}+ `}
                        </button>
                      ))}
                    </div>
                  </div>

                  {activeFilterCount > 0 && (
                    <button onClick={resetFilters} className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-border/50 py-1.5 text-[10px] text-muted-foreground hover:text-foreground">
                      <RotateCcw className="h-3 w-3" />
                      Reset All Filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          {filteredResults.length > 0 ? (
            <ProductList
              products={filteredResults}
              loading={loading}
              emptyMessage={`No results for "${searchQuery}"`}
            />
          ) : !loading ? (
            /* No Results */
            <motion.div
              className="flex flex-col items-center justify-center py-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <motion.div
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <PackageOpen className="h-8 w-8 text-muted-foreground" />
              </motion.div>
              <p className="text-sm font-semibold text-foreground">No results for &quot;{searchQuery}&quot;</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-[250px]">
                We couldn&apos;t find anything matching your search. Try these suggestions:
              </p>
              <div className="mt-3 space-y-1">
                {noResultsSuggestions.map((suggestion, i) => (
                  <p key={i} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                    {suggestion}
                  </p>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
                {trendingSearches.slice(0, 4).map(item => (
                  <button
                    key={item.term}
                    onClick={() => setSearchQuery(item.term)}
                    className="flex items-center gap-1 rounded-full border border-border/50 bg-card px-2 py-1 text-[10px] text-foreground hover:bg-accent"
                  >
                    {(() => {
                    const IconComponent = iconMap[item.iconKey] || Search
                    return <IconComponent className="h-4 w-4 text-muted-foreground" />
                  })()} {item.term}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : null}
        </>
      )}
    </motion.div>
  )
}
