'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import {
  MapPin, Phone, Clock, ArrowRight, Search, Navigation, CheckCircle2,
  AlertCircle, XCircle, Package, ChevronDown, Info, Store, Loader2, Map,
} from 'lucide-react'

interface StoreLocation {
  id: string; name: string; address: string; city: string; phone: string | null
  hours: string | null; latitude: number | null; longitude: number | null
  distance: number | null; isActive: boolean; pickupAvailable?: boolean
  currentQueue?: number; estimatedWait?: string; directionsUrl?: string | null
}

interface PickupOrder {
  id: string; orderNumber: string; storeName: string
  status: 'ready' | 'processing' | 'picked_up'; readyDate: string; items: number
}

type AvailabilityStatus = 'available' | 'busy' | 'unavailable'

const AVAILABILITY: Record<AvailabilityStatus, { label: string; color: string; icon: typeof CheckCircle2; bg: string }> = {
  available: { label: 'Available', color: 'text-emerald-400', icon: CheckCircle2, bg: 'bg-emerald-500/10' },
  busy: { label: 'Busy', color: 'text-amber-400', icon: AlertCircle, bg: 'bg-amber-500/10' },
  unavailable: { label: 'Unavailable', color: 'text-red-400', icon: XCircle, bg: 'bg-red-500/10' },
}

export function StorePickupPage() {
  const { goBack, goCheckout } = useShopRouter()
  const [pickupOrders, setPickupOrders] = useState<PickupOrder[]>([])
  const [stores, setStores] = useState<StoreLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStore, setSelectedStore] = useState<string | null>(null)
  const [expandedInstructions, setExpandedInstructions] = useState<number | null>(null)
  const [activeSection, setActiveSection] = useState<'stores' | 'orders' | 'instructions'>('stores')

  // Fetch pickup orders on component mount
  useEffect(() => {
    fetchPickupOrders()
  }, [])

  const fetchPickupOrders = async () => {
    try {
      const response = await fetch('/api/orders/pickup')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setPickupOrders(data.data)
        }
      }
    } catch (error) {
      console.error('Error fetching pickup orders:', error)
    }
  }

  const fetchStores = useCallback(async () => {
    try {
      const res = await fetch('/api/store-pickup')
      const data = await res.json()
      setStores(data.data || [])
    } catch { setStores([]) } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchStores() }, [fetchStores])

  const getAvailability = (store: StoreLocation): AvailabilityStatus => {
    if (!store.isActive || store.pickupAvailable === false) return 'unavailable'
    const queue = store.currentQueue ?? (store.name.length % 5)
    if (queue === 0) return 'available'
    if (queue <= 2) return 'available'
    if (queue <= 4) return 'busy'
    return 'busy'
  }

  const filteredStores = stores.filter((s) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q) || s.address.toLowerCase().includes(q)
  })

  const instructions = [
    { step: 1, title: 'Select a Store', desc: 'Choose your preferred store from the list above', icon: MapPin },
    { step: 2, title: 'Place Your Order', desc: 'Select "Store Pickup" as the delivery method at checkout', icon: Package },
    { step: 3, title: 'Wait for Confirmation', desc: 'You\'ll be notified when your order is ready for pickup', icon: Clock },
    { step: 4, title: 'Pick Up Your Order', desc: 'Visit the store with your order number and valid ID', icon: CheckCircle2 },
  ]

  return (
    <div className="min-h-screen bg-background pb-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="p-1.5 rounded-lg hover:bg-muted active:scale-95 transition"><ArrowRight className="w-5 h-5 rotate-180" /></button>
          <div><h1 className="text-lg font-bold text-foreground flex items-center gap-2"><Store className="w-5 h-5 text-violet-500" />Store Pickup</h1><p className="text-xs text-muted-foreground">Find a store near you</p></div>
        </div>
      </motion.div>

      <div className="flex gap-1 mx-4 mt-4 p-1 bg-muted/50 rounded-xl">
        {([['stores', 'Stores', MapPin], ['orders', 'My Pickups', Package], ['instructions', 'How It Works', Info]] as const).map(([key, label, Icon]) => (
          <button key={key} onClick={() => setActiveSection(key)} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${activeSection === key ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}>
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeSection === 'stores' && (
          <motion.div key="stores" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-4 mt-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by city or area..." className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
            </div>

            <div className="relative rounded-xl overflow-hidden border border-border bg-muted/30 h-36 flex items-center justify-center">
              <div className="text-center"><Map className="w-8 h-8 text-muted-foreground mx-auto mb-2" /><p className="text-xs text-muted-foreground">Interactive map coming soon</p><p className="text-[10px] text-muted-foreground/60">{filteredStores.length} stores found</p></div>
              {stores.length > 0 && <div className="absolute top-2 right-2 flex gap-1">{stores.slice(0, 3).map((s) => <div key={s.id} className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />)}</div>}
            </div>

            {loading ? (
              <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="animate-pulse rounded-xl border border-border p-4 h-32 bg-muted/30" />)}</div>
            ) : filteredStores.length === 0 ? (
              <div className="text-center py-12"><MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm font-medium text-foreground">No stores found</p><p className="text-xs text-muted-foreground mt-1">Try a different search term</p></div>
            ) : (
              <div className="space-y-3">
                {filteredStores.map((store, idx) => {
                  const avail = getAvailability(store)
                  const config = AVAILABILITY[avail]
                  const StatusIcon = config.icon
                  const isSelected = selectedStore === store.id
                  return (
                    <motion.div key={store.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} onClick={() => setSelectedStore(isSelected ? null : store.id)} className={`rounded-xl border p-4 cursor-pointer transition-all ${isSelected ? 'border-violet-500/40 bg-violet-500/5' : 'border-border bg-card hover:border-violet-500/20'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-foreground truncate">{store.name}</h4>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${config.bg} ${config.color}`}><StatusIcon className="w-3 h-3" />{config.label}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{store.address}</p>
                          <div className="flex flex-wrap gap-3 mt-2">
                            {store.phone && <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Phone className="w-3 h-3" />{store.phone}</span>}
                            {store.hours && <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Clock className="w-3 h-3" />{store.hours}</span>}
                            {store.distance != null && <span className="flex items-center gap-1 text-[10px] text-violet-400"><Navigation className="w-3 h-3" />{store.distance} km</span>}
                          </div>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isSelected ? 'rotate-180' : ''}`} />
                      </div>
                      <AnimatePresence>{isSelected && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 pt-3 border-t border-border space-y-3">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span>This store is available for pickup</span></div>
                          <button onClick={(e) => { e.stopPropagation(); goCheckout() }} className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium active:scale-[0.98] transition flex items-center justify-center gap-2">Select for Pickup <ArrowRight className="w-4 h-4" /></button>
                        </motion.div>
                      )}</AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}

        {activeSection === 'orders' && (
          <motion.div key="orders" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-4 mt-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Package className="w-4 h-4 text-violet-500" />Ready-for-Pickup Orders</h3>
            {pickupOrders.length === 0 ? (
              <div className="text-center py-12"><Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm font-medium text-foreground">No pickup orders</p></div>
            ) : pickupOrders.map((order, idx) => (
              <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between">
                  <div><p className="text-sm font-semibold text-foreground">{order.orderNumber}</p><p className="text-xs text-muted-foreground mt-0.5">{order.storeName}</p>
                    <div className="flex items-center gap-3 mt-2"><span className="text-[10px] text-muted-foreground">{order.items} item(s)</span><span className="text-[10px] text-muted-foreground">Ready: {order.readyDate}</span></div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${order.status === 'ready' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {order.status === 'ready' ? <CheckCircle2 className="w-3 h-3" /> : <Loader2 className="w-3 h-3 animate-spin" />}
                    {order.status === 'ready' ? 'Ready' : 'Processing'}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeSection === 'instructions' && (
          <motion.div key="instructions" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="px-4 mt-4 space-y-3">
            {instructions.map((item, i) => (
              <motion.div key={item.step} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                <button onClick={() => setExpandedInstructions(expandedInstructions === item.step ? null : item.step)} className="w-full rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0"><item.icon className="w-4 h-4 text-violet-400" /></div>
                    <div className="flex-1 text-left"><p className="text-sm font-medium text-foreground">Step {item.step}: {item.title}</p></div>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedInstructions === item.step ? 'rotate-180' : ''}`} />
                  </div>
                  <AnimatePresence>{expandedInstructions === item.step && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-xs text-muted-foreground mt-2 ml-11">{item.desc}</motion.p>
                  )}</AnimatePresence>
                </button>
              </motion.div>
            ))}
            <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-4">
              <h4 className="text-sm font-semibold text-violet-400 mb-2">Pickup Tips</h4>
              <ul className="space-y-1.5">
                {['Bring your order confirmation and valid ID', 'Pick up within 5 days of "Ready" status', 'Store hours may vary on holidays', 'Contact the store if you need help'].map((tip, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2"><CheckCircle2 className="w-3 h-3 text-violet-400 mt-0.5 flex-shrink-0" />{tip}</li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

