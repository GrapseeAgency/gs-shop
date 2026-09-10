'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  ArrowLeft, MapPin, Phone, Clock, Navigation, Search,
  Building2, Loader2, Globe
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useShopRouter } from '@/hooks/use-shop-router'

interface StoreData {
  id: string
  name: string
  address: string
  city: string
  phone: string | null
  hours: string | null
  latitude: number | null
  longitude: number | null
  isActive: boolean
  createdAt: string
}

// Simulate distance from user (random but consistent per store)
function getSimulatedDistance(store: StoreData): string {
  if (store.latitude && store.longitude) {
    const hash = store.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    const distance = (hash % 50) + 1
    return `${distance} km`
  }
  return ''
}

export default function StoresPage() {
  const { goBack } = useShopRouter()
  const [stores, setStores] = useState<StoreData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchStores() {
      try {
        setLoading(true)
        const res = await fetch('/api/stores')
        if (res.ok) {
          const json = await res.json()
          setStores(json.data || [])
        }
      } catch {
        toast.error('Failed to load stores')
      } finally {
        setLoading(false)
      }
    }
    fetchStores()
  }, [])

  const cities = useMemo(() => {
    const citySet = new Set(stores.map(s => s.city))
    return Array.from(citySet)
  }, [stores])

  const filteredStores = stores.filter(store => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      store.name.toLowerCase().includes(q) ||
      store.city.toLowerCase().includes(q) ||
      store.address.toLowerCase().includes(q)
    )
  })

  const getDirections = (store: StoreData) => {
    if (store.latitude && store.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`, '_blank')
    } else {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(store.address + ', ' + store.city)}`, '_blank')
    }
  }

  return (
    <motion.div
      className="px-4 py-2 pb-8"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={goBack}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-400" />
            Store Locator
          </h1>
          <p className="text-xs text-muted-foreground">Find us near you</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by city or store name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-11 rounded-xl bg-card border-border/50"
        />
      </div>

      {/* City Chips */}
      {cities.length > 0 && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              !searchQuery ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
            onClick={() => setSearchQuery('')}
          >
            All
          </button>
          {cities.map(city => (
            <button
              key={city}
              className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                searchQuery.toLowerCase() === city.toLowerCase()
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
              onClick={() => setSearchQuery(searchQuery.toLowerCase() === city.toLowerCase() ? '' : city)}
            >
              {city}
            </button>
          ))}
        </div>
      )}

      {/* Store List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl border border-border/50 bg-card p-4 animate-pulse">
              <div className="h-5 w-2/3 rounded bg-muted mb-3" />
              <div className="h-3 w-full rounded bg-muted mb-2" />
              <div className="h-3 w-1/2 rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : filteredStores.length === 0 ? (
        <motion.div
          className="flex flex-col items-center justify-center py-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Building2 className="h-10 w-10 text-muted-foreground/30" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {searchQuery ? 'No stores found' : 'No stores available'}
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            {searchQuery ? 'Try a different search term' : 'Check back later for updates'}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filteredStores.map((store, index) => (
            <motion.div
              key={store.id}
              className="rounded-xl border border-border/50 bg-card p-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                  <Building2 className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-foreground truncate">{store.name}</h3>
                    <Badge className={`${store.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-destructive/10 text-destructive'} text-[9px] flex-shrink-0`}>
                      {store.isActive ? 'Open' : 'Closed'}
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{store.address}, {store.city}</span>
                    </div>
                    {store.phone && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3 flex-shrink-0" />
                        <span>{store.phone}</span>
                      </div>
                    )}
                    {store.hours && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span>{store.hours}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Distance & Directions */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Navigation className="h-3 w-3" />
                  <span>{getSimulatedDistance(store)} away</span>
                </div>
                <Button
                  size="sm"
                  className="h-8 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs"
                  variant="ghost"
                  onClick={() => getDirections(store)}
                >
                  <Navigation className="mr-1 h-3 w-3" />
                  Get Directions
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
