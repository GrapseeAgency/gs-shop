'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Search, Smartphone, Laptop, Headphones, ShoppingBag, Watch, Camera, Palette, Bot, Cloud, Flame } from 'lucide-react'
import { useShopRouter } from '@/hooks/use-shop-router'
import { useShopStore } from '@/lib/store'

interface TrendingTerm {
  term: string
  icon: React.ComponentType<{ className?: string }>
  count: string
}

// Default icons for different term categories
const getIconForTerm = (term: string): React.ComponentType<{ className?: string }> => {
  const termLower = term.toLowerCase()
  if (termLower.includes('phone') || termLower.includes('mobile')) return Smartphone
  if (termLower.includes('laptop') || termLower.includes('computer')) return Laptop
  if (termLower.includes('headphone') || termLower.includes('ear')) return Headphones
  if (termLower.includes('watch')) return Watch
  if (termLower.includes('camera')) return Camera
  if (termLower.includes('design') || termLower.includes('art')) return Palette
  if (termLower.includes('ai') || termLower.includes('bot')) return Bot
  if (termLower.includes('cloud')) return Cloud
  if (termLower.includes('shop') || termLower.includes('bag')) return ShoppingBag
  return Search
}

const gradientPairs = [
  'from-rose-500/20 to-pink-500/10',
  'from-violet-500/20 to-purple-500/10',
  'from-cyan-500/20 to-blue-500/10',
  'from-amber-500/20 to-yellow-500/10',
  'from-emerald-500/20 to-green-500/10',
  'from-fuchsia-500/20 to-pink-500/10',
  'from-sky-500/20 to-indigo-500/10',
  'from-orange-500/20 to-red-500/10',
  'from-teal-500/20 to-cyan-500/10',
  'from-lime-500/20 to-green-500/10',
]

export function TrendingSearches() {
  const { goSearch } = useShopRouter()
  const { recentSearches, addRecentSearch } = useShopStore()
  const [terms, setTerms] = useState<TrendingTerm[]>([])
  const [firePulse, setFirePulse] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetch real trending searches from API
  useEffect(() => {
    const fetchTrendingSearches = async () => {
      try {
        const res = await fetch('/api/trending-searches')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        
        if (data.success && data.searches && data.searches.length > 0) {
          const apiTerms: TrendingTerm[] = data.searches.map((search: any, index: number) => ({
            term: search.term,
            icon: getIconForTerm(search.term),
            count: search.hitCount > 1000 
              ? `${(search.hitCount / 1000).toFixed(1)}K` 
              : String(search.hitCount)
          }))
          setTerms(apiTerms.slice(0, 10))
        }
        // NO FALLBACK - strictly hide if no API data
      } catch (error) {
        // Silent fail - no fallback, component stays hidden
      } finally {
        setLoading(false)
      }
    }
    
    fetchTrendingSearches()
  }, [])


  // Pulse fire emoji
  useEffect(() => {
    const interval = setInterval(() => {
      setFirePulse(true)
      setTimeout(() => setFirePulse(false), 600)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleSearch = (term: string) => {
    addRecentSearch(term)
    goSearch(term)
  }

  // Silent - don't show if no real data
  if (!loading && terms.length === 0) return null

  return (
    <section className="px-4 py-4">
      {/* Header */}
      <motion.div
        className="mb-3 flex items-center gap-2"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20">
          <TrendingUp className="h-4 w-4 text-primary" />
        </div>
        <div className="flex items-center gap-1.5">
          <h2 className="text-base font-bold text-foreground">Trending Searches</h2>
          <motion.span
            animate={{ scale: firePulse ? [1, 1.4, 1] : 1 }}
            transition={{ duration: 0.4 }}
          >
            <Flame className="h-5 w-5 text-orange-500" />
          </motion.span>
        </div>
      </motion.div>

      {/* Loading state */}
      {loading && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-24 rounded-full bg-muted animate-pulse flex-shrink-0" />
          ))}
        </div>
      )}

      {/* Horizontal scrollable pills */}
      {!loading && (
        <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {terms.map((item, index) => (
            <motion.button
              key={item.term}
              onClick={() => handleSearch(item.term)}
              className="group relative flex-shrink-0"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Pill card */}
              <div className={`flex items-center gap-2 rounded-full border border-border/50 bg-gradient-to-r ${gradientPairs[index % gradientPairs.length]} px-3.5 py-2 transition-all group-hover:border-primary/30 group-hover:shadow-md group-active:shadow-sm`}>
                {(() => { const Icon = item.icon; return <Icon className="h-4 w-4" />; })()}
                <span className="text-xs font-medium text-foreground whitespace-nowrap">
                  {item.term}
                </span>
                {/* Search count badge */}
                <span className="flex items-center gap-0.5 rounded-full bg-background/60 px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">
                  <Search className="h-2.5 w-2.5" />
                  {item.count}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </section>
  )
}
