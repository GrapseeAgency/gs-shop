'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft, FolderOpen, Package, TrendingUp, Users,
  Sparkles, Sun, Snowflake, Crown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useShopRouter } from '@/hooks/use-shop-router'
import { useRouter } from 'next/navigation'

interface Collection {
  id: string
  title: string
  description: string
  coverImage: string | null
  productCount: number
  type: string
  tags: string[]
}

const TYPE_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  curated: { icon: FolderOpen, color: 'text-emerald-400', bg: 'from-emerald-500/15 to-emerald-500/5' },
  seasonal: { icon: Sun, color: 'text-amber-400', bg: 'from-amber-500/15 to-amber-500/5' },
  trending: { icon: TrendingUp, color: 'text-rose-400', bg: 'from-rose-500/15 to-rose-500/5' },
  staff_picks: { icon: Crown, color: 'text-violet-400', bg: 'from-violet-500/15 to-violet-500/5' },
}

export default function CollectionsPage() {
  const { goBack } = useShopRouter()
  const router = useRouter()
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  const fetchCollections = useCallback(async () => {
    try {
      const res = await fetch('/api/collections')
      if (res.ok) {
        const data = await res.json()
        setCollections(data.data || [])
      }
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCollections() }, [fetchCollections])

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'curated', label: 'Curated' },
    { key: 'seasonal', label: 'Seasonal' },
    { key: 'trending', label: 'Trending' },
    { key: 'staff_picks', label: 'Staff Picks' },
  ]

  const filtered = activeTab === 'all'
    ? collections
    : collections.filter((c) => c.type === activeTab)

  return (
    <motion.div
      className="pb-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack} className="flex-shrink-0 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-emerald-400" />
              Curated Collections
            </h1>
            <p className="text-[11px] text-muted-foreground">Hand-picked service bundles</p>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="mx-4 mt-3 overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/30">
            <Sparkles className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-base font-bold text-foreground">Explore Collections</p>
            <p className="text-xs text-muted-foreground">Expertly curated service bundles for every need</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Package, label: `${collections.length} Collections`, sub: 'Browse all' },
            { icon: Users, label: 'Expert Curated', sub: 'Hand-picked' },
            { icon: TrendingUp, label: 'Best Value', sub: 'Save up to 40%' },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="rounded-xl bg-background/50 p-2 text-center border border-emerald-500/10">
                <Icon className="mx-auto h-4 w-4 text-emerald-400 mb-1" />
                <p className="text-[10px] font-medium text-foreground">{item.label}</p>
                <p className="text-[8px] text-muted-foreground">{item.sub}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mx-4 mt-3 flex gap-1.5 overflow-x-auto scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Collection Grid */}
      <div className="px-4 mt-3 grid grid-cols-2 gap-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-muted" />
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-2 flex flex-col items-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
              <FolderOpen className="h-8 w-8 text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-foreground">No collections found</p>
            <p className="mt-1 text-xs text-muted-foreground">Try a different filter</p>
          </div>
        ) : (
          filtered.map((collection, index) => {
            const config = TYPE_CONFIG[collection.type] || TYPE_CONFIG.curated
            const Icon = config.icon
            return (
              <motion.button
                key={collection.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card text-left transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => router.push(`/collections/${collection.id}`)}
              >
                {/* Cover */}
                <div className={`relative flex h-28 items-center justify-center bg-gradient-to-br ${config.bg}`}>
                  {collection.coverImage ? (
                    <img src={collection.coverImage} alt={collection.title} className="h-full w-full object-cover" />
                  ) : (
                    <Icon className={`h-10 w-10 ${config.color} opacity-40`} />
                  )}
                  <Badge className={`absolute right-2 top-2 text-[9px] ${config.color} border-0`} style={{ backgroundColor: `${config.color.includes('emerald') ? '#10b981' : config.color.includes('amber') ? '#f59e0b' : config.color.includes('rose') ? '#f43f5e' : '#8b5cf6'}20` }}>
                    {collection.type === 'staff_picks' ? 'Staff Picks' : collection.type.charAt(0).toUpperCase() + collection.type.slice(1)}
                  </Badge>
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                    {collection.title}
                  </h3>
                  <p className="mt-0.5 text-[10px] text-muted-foreground line-clamp-2">
                    {collection.description}
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                      <Package className="mr-0.5 h-2.5 w-2.5" />
                      {collection.productCount} items
                    </Badge>
                    {collection.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-[8px] text-muted-foreground">#{tag}</span>
                    ))}
                  </div>
                </div>
              </motion.button>
            )
          })
        )}
      </div>
    </motion.div>
  )
}
