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
      className="px-4 py-2 pb-24 relative z-10"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Search header */}
      <div className="mb-4 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setSearchQuery('')
            goBack()
          }}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground hover:bg-primary/5 rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
          <Input
            ref={inputRef}
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-card/75 backdrop-blur-md border border-primary/20 focus-visible:ring-primary focus-visible:ring-offset-background pl-10 pr-16 rounded-full shadow-inner shadow-primary/5 h-10 font-medium"
          />
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            {/* Voice Search */}
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 rounded-full ${isListening ? 'text-red-500 bg-red-500/10' : 'text-muted-foreground hover:text-primary hover:bg-primary/5'}`}
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
                className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-primary/5"
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
            className="mb-3.5 flex items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 py-2.5 shadow-sm"
          >
            <motion.div
              className="h-3 w-3 rounded-full bg-red-500 shadow-md shadow-red-500/30"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-xs font-bold text-red-500">Listening to your voice...</span>
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
            className="mb-3.5 rounded-2xl border border-primary/15 bg-card/90 backdrop-blur-md shadow-lg overflow-hidden"
          >
            <div className="p-2.5">
              <p className="px-2 py-1 text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground/80">Suggestions</p>
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setSearchQuery(suggestion)}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-bold text-foreground hover:bg-primary/10 transition-colors"
                >
                  <Lightbulb className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Before Search - Recent & Trending */}
      {!searchQuery.trim() && (
        <div className="space-y-5">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-bold text-foreground">Recent Searches</span>
                </div>
                <button
                  onClick={clearRecentSearches}
                  className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recentSearches.map((query, i) => (
                  <div key={i} className="group flex items-center gap-1 rounded-full border border-primary/15 bg-card/60 backdrop-blur-sm px-3 py-1 shadow-sm">
                    <button
                      onClick={() => setSearchQuery(query)}
                      className="text-[11px] font-bold text-foreground hover:text-primary transition-colors"
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
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-xs font-bold text-foreground">Trending Searches</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {trendingSearches.map((item, i) => (
                <motion.button
                  key={item.term}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSearchQuery(item.term)}
                  className="flex items-center gap-1.5 rounded-full border border-primary/15 bg-card/60 backdrop-blur-md px-3 py-1.5 text-[11px] font-semibold text-foreground transition-all hover:border-primary/35 hover:shadow-sm hover:shadow-primary/5 hover:bg-primary/5 active:scale-95"
                >
                  {(() => {
                    const IconComponent = iconMap[item.iconKey] || Search
                    return <IconComponent className="h-3.5 w-3.5 text-primary" />
                  })()}
                  {item.term}
                  {i < 3 && (
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-0 text-[7px] px-1 py-0 h-3 font-extrabold">
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
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse-glow" />
              <span className="text-xs font-bold text-foreground">Browse by Category</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { name: 'Websites', iconKey: 'globe' },
                { name: 'Mobile Apps', iconKey: 'phone' },
                { name: 'DevOps', iconKey: 'gear' },
                { name: 'Design', iconKey: 'palette' },
              ].map(cat => (
                <button
                  key={cat.name}
                  onClick={() => goCategory()}
                  className="flex items-center gap-2 rounded-2xl border border-primary/15 bg-card/65 backdrop-blur-md p-3 text-left transition-all hover:border-primary/35 hover:bg-primary/5 active:scale-[0.98] shadow-sm relative overflow-hidden"
                >
                  <div className="absolute inset-0 liquid-aurora opacity-5 -z-10" />
                  {(() => {
                    const IconComponent = iconMap[cat.iconKey] || Search
                    return (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/15 relative overflow-hidden">
                        <div className="absolute inset-0 liquid-aurora opacity-20" />
                        <IconComponent className="relative z-10 h-4 w-4 text-primary" />
                      </div>
                    )
                  })()}
                  <span className="text-xs font-bold text-foreground">{cat.name}</span>
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
            <div className="mb-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-semibold text-muted-foreground/80">
                  <span className="font-extrabold text-foreground">{filteredResults.length}</span> results
                </p>
                {activeFilterCount > 0 && (
                  <Badge className="bg-primary/10 text-primary border border-primary/20 text-[9px] px-1.5 py-0 font-bold">
                    {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7.5 gap-1 text-[10px] font-bold rounded-full border-primary/20 bg-background/50 hover:bg-background/80"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="h-3 w-3 text-primary" />
                  Filter
                  {activeFilterCount > 0 && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[7px] font-bold text-primary-foreground shadow-sm">{activeFilterCount}</span>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Category Filter Chips */}
          {resultCategories.length > 1 && (
            <div className="mb-3 flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`flex-shrink-0 rounded-full px-3 py-1 text-[10px] font-bold transition-all ${
                  !selectedCategory 
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20' 
                    : 'bg-card border border-primary/10 text-muted-foreground hover:text-foreground'
                }`}
              >
                All ({results.length})
              </button>
              {resultCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  className={`flex-shrink-0 rounded-full px-3 py-1 text-[10px] font-bold transition-all ${
                    selectedCategory === cat.id 
                      ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20' 
                      : 'bg-card border border-primary/10 text-muted-foreground hover:text-foreground'
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
                className="mb-3.5 overflow-hidden rounded-2xl border border-primary/15 bg-card/85 backdrop-blur-lg shadow-md"
              >
                <div className="p-3.5 space-y-3.5">
                  {/* Sort */}
                  <div>
                    <p className="mb-1.5 text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground/80">Sort By</p>
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
                          className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold transition-all duration-200 ${
                            sortBy === key 
                              ? 'bg-primary text-primary-foreground border-primary/10 shadow-sm' 
                              : 'bg-muted/40 text-muted-foreground border-primary/10 hover:text-foreground hover:bg-muted/65'
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
                    <p className="mb-1.5 text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground/80">Price Range</p>
                    <div className="flex flex-wrap gap-1">
                      {priceRanges.map((range, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedPriceRange(i)}
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold transition-all duration-200 ${
                            selectedPriceRange === i 
                              ? 'bg-primary text-primary-foreground border-primary/10 shadow-sm' 
                              : 'bg-muted/40 text-muted-foreground border-primary/10 hover:text-foreground hover:bg-muted/65'
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <p className="mb-1.5 text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground/80">Min Rating</p>
                    <div className="flex gap-1">
                      {[0, 3, 4, 4.5].map(rating => (
                        <button
                          key={rating}
                          onClick={() => setMinRating(rating)}
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold transition-all duration-200 ${
                            minRating === rating 
                              ? 'bg-primary text-primary-foreground border-primary/10 shadow-sm' 
                              : 'bg-muted/40 text-muted-foreground border-primary/10 hover:text-foreground hover:bg-muted/65'
                          }`}
                        >
                          {rating === 0 ? 'All' : `${rating}+ `}
                        </button>
                      ))}
                    </div>
                  </div>

                  {activeFilterCount > 0 && (
                    <button onClick={resetFilters} className="flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-primary/25 py-2 text-[10px] font-bold text-primary hover:bg-primary/5 transition-colors">
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
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 border border-primary/15 relative overflow-hidden"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="absolute inset-0 liquid-aurora opacity-25" />
                <PackageOpen className="relative z-10 h-8 w-8 text-primary" />
              </motion.div>
              <p className="text-sm font-bold text-foreground">No results for &quot;{searchQuery}&quot;</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-[250px] leading-relaxed">
                We couldn&apos;t find anything matching your search. Try these suggestions:
              </p>
              <div className="mt-3.5 space-y-1 w-fit mx-auto">
                {noResultsSuggestions.map((suggestion, i) => (
                  <p key={i} className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                    {suggestion}
                  </p>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5 justify-center max-w-xs mx-auto">
                {trendingSearches.slice(0, 4).map(item => (
                  <button
                    key={item.term}
                    onClick={() => setSearchQuery(item.term)}
                    className="flex items-center gap-1 rounded-full border border-primary/15 bg-card/60 px-2.5 py-1 text-[10px] font-bold text-foreground hover:bg-primary/5 hover:border-primary/30"
                  >
                    {(() => {
                      const IconComponent = iconMap[item.iconKey] || Search
                      return <IconComponent className="h-3 w-3 text-primary" />
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

