'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Gift, Plus, Share2, Search, Heart, X,
  CheckCircle2, ChevronDown, Calendar, Users, Package, Link,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import { toast } from 'sonner'
import { Sparkles, PartyPopper, Star, Shield, Trophy } from 'lucide-react'

interface GiftRegistry {
  id: string
  title: string
  description: string | null
  occasion: string
  productIds: string[]
  createdBy: string
  isPublic: boolean
  eventDate: string | null
  createdAt: string
  updatedAt: string
  itemCount?: number
  daysUntilEvent?: number | null
}

type Occasion = 'all' | 'wedding' | 'birthday' | 'baby' | 'housewarming' | 'graduation'

const occasionIcons: Record<Occasion, React.ComponentType<{ className?: string }>> = {
  all: Gift,
  wedding: Sparkles,
  birthday: PartyPopper,
  baby: Star,
  housewarming: Shield,
  graduation: Trophy,
}

const occasionConfig: Record<Occasion, { label: string; color: string }> = {
  all: { label: 'All', color: 'text-foreground' },
  wedding: { label: 'Wedding', color: 'text-rose-500' },
  birthday: { label: 'Birthday', color: 'text-amber-500' },
  baby: { label: 'Baby', color: 'text-sky-500' },
  housewarming: { label: 'Housewarming', color: 'text-emerald-500' },
  graduation: { label: 'Graduation', color: 'text-violet-500' },
}

export function GiftRegistryPage() {
  const { goBack } = useShopRouter()
  const [registries, setRegistries] = useState<GiftRegistry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeOccasion, setActiveOccasion] = useState<Occasion>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ title: '', description: '', occasion: 'wedding', eventDate: '', isPublic: true })

  useEffect(() => {
    const fetchRegistries = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (activeOccasion !== 'all') params.set('occasion', activeOccasion)
        params.set('public', 'true')
        const res = await fetch(`/api/gift-registry?${params}`)
        if (res.ok) {
          const data = await res.json()
          setRegistries(data.registries || [])
        }
      } catch {
        // silent
      }
      setLoading(false)
    }
    fetchRegistries()
  }, [activeOccasion])

  const filteredRegistries = useMemo(() => {
    if (!searchQuery) return registries
    const q = searchQuery.toLowerCase()
    return registries.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.createdBy.toLowerCase().includes(q) ||
      r.occasion.toLowerCase().includes(q)
    )
  }, [registries, searchQuery])

  const handleCreate = async () => {
    if (!createForm.title.trim()) { toast.error('Please enter a title'); return }
    try {
      const res = await fetch('/api/gift-registry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createForm,
          createdBy: 'user@example.com',
          productIds: [],
        }),
      })
      if (res.ok) {
        const data = await res.json()
        toast.success('Registry created!')
        setShowCreate(false)
        setRegistries(prev => [data.registry, ...prev])
        setCreateForm({ title: '', description: '', occasion: 'wedding', eventDate: '', isPublic: true })
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to create registry')
      }
    } catch {
      toast.error('Failed to create registry')
    }
  }

  const handleShare = (registry: GiftRegistry) => {
    if (navigator.share) {
      navigator.share({ title: registry.title, text: `Check out ${registry.title} on Grapsee Shop!`, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied!')
    }
  }

  return (
    <motion.div className="min-h-screen bg-background pb-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack} className="flex-shrink-0 text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Gift className="h-5 w-5 text-rose-500" /> Gift Registry
            </h1>
          </div>
          <Button size="sm" className="gap-1.5 bg-rose-500 hover:bg-rose-600 text-white" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" /> Create
          </Button>
        </div>
      </div>

      {/* Occasion Filter */}
      <div className="px-4 mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
        {(Object.keys(occasionConfig) as Occasion[]).map(key => {
          const cfg = occasionConfig[key]
          const isActive = activeOccasion === key
          return (
            <motion.button
              key={key}
              onClick={() => setActiveOccasion(key)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                isActive ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30' : 'bg-muted/50 text-muted-foreground'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {(() => { const Icon = occasionIcons[key]; return <Icon className="h-4 w-4" />; })()} {cfg.label}
            </motion.button>
          )
        })}
      </div>

      {/* Search */}
      <div className="px-4 mt-3 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search registries..."
          className="pl-9 h-9 text-sm bg-muted/30 border-border/30"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Registry List */}
      <div className="px-4 mt-3">
        {loading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border/50 bg-card p-4">
                <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-muted animate-pulse mt-2" />
                <div className="h-2 w-1/3 rounded bg-muted animate-pulse mt-3" />
              </div>
            ))}
          </div>
        ) : filteredRegistries.length === 0 ? (
          <motion.div className="flex flex-col items-center justify-center py-16 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <span className="text-5xl mb-4"></span>
            <p className="text-sm font-medium text-foreground">No registries found</p>
            <p className="mt-1 text-xs text-muted-foreground">Create your first gift registry!</p>
            <Button className="mt-4 gap-2 bg-rose-500 hover:bg-rose-600 text-white" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" /> Create Registry
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-2.5">
            {filteredRegistries.map((registry, index) => {
              const cfg = occasionConfig[registry.occasion as Occasion] || occasionConfig.birthday
              const progress = registry.itemCount ? Math.min(Math.round((registry.itemCount / 10) * 100), 100) : 0
              return (
                <motion.div
                  key={registry.id}
                  className="rounded-2xl border border-border/50 bg-card p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 flex-shrink-0">
                      {(() => { const Icon = occasionIcons[registry.occasion as Occasion] || PartyPopper; return <Icon className="h-6 w-6 text-rose-500" />; })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-foreground truncate">{registry.title}</h3>
                        {registry.isPublic && (
                          <Badge className="bg-sky-500/10 text-sky-500 text-[9px] flex-shrink-0">Public</Badge>
                        )}
                      </div>
                      {registry.description && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{registry.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {registry.createdBy.split('@')[0]}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3" /> {registry.itemCount || 0} items
                        </span>
                        {registry.daysUntilEvent != null && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {registry.daysUntilEvent}d left
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-muted-foreground">Fulfilled</span>
                      <span className="font-medium text-foreground">{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/20">
                    <Button size="sm" variant="outline" className="flex-1 h-7 gap-1.5 text-[11px]">
                      <Heart className="h-3 w-3" /> View Items
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 gap-1.5 text-[11px]" onClick={() => handleShare(registry)}>
                      <Share2 className="h-3 w-3" />
                    </Button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Registry Sheet */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              className="w-full max-w-md rounded-t-3xl bg-card border-t border-border p-5"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-foreground">Create Gift Registry</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowCreate(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="space-y-3">
                <Input
                  placeholder="Registry title"
                  className="h-9 text-sm"
                  value={createForm.title}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                />
                <Input
                  placeholder="Description (optional)"
                  className="h-9 text-sm"
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(occasionConfig) as Occasion[]).filter(k => k !== 'all').map(key => {
                    const cfg = occasionConfig[key]
                    const isActive = createForm.occasion === key
                    return (
                      <button
                        key={key}
                        onClick={() => setCreateForm(prev => ({ ...prev, occasion: key }))}
                        className={`flex items-center gap-1.5 rounded-xl border p-2.5 text-xs transition-all ${
                          isActive ? 'border-rose-500 bg-rose-500/5 text-rose-500' : 'border-border/50 text-muted-foreground'
                        }`}
                      >
                        {(() => { const Icon = occasionIcons[key]; return <Icon className="h-4 w-4" />; })()} {cfg.label}
                      </button>
                    )
                  })}
                </div>
                <Input
                  type="date"
                  className="h-9 text-sm"
                  value={createForm.eventDate}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, eventDate: e.target.value }))}
                />
                <Button className="w-full gap-2 bg-rose-500 hover:bg-rose-600 text-white" onClick={handleCreate}>
                  <Gift className="h-4 w-4" /> Create Registry
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

