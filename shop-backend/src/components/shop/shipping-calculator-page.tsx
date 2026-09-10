'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import {
  Truck, Package, MapPin, ArrowRight, ChevronDown, Zap, Clock, DollarSign,
  Check, AlertCircle, Send, Navigation, Weight, PartyPopper, Crown,
} from 'lucide-react'

interface City { name: string; region: string }
interface ShippingQuote {
  methodId: string; methodName: string; icon: React.ComponentType<{ className?: string }>; price: number
  estimatedDays: string; isFree: boolean; description: string
}
interface FreeShipping { threshold: number; amountNeeded: number; isEligible: boolean }

const DEFAULT_CITIES: City[] = [
  { name: 'Dhaka', region: 'Dhaka Division' }, { name: 'Chattogram', region: 'Chattogram Division' },
  { name: 'Sylhet', region: 'Sylhet Division' }, { name: 'Rajshahi', region: 'Rajshahi Division' },
  { name: 'Khulna', region: 'Khulna Division' }, { name: 'Barishal', region: 'Barishal Division' },
  { name: 'Rangpur', region: 'Rangpur Division' }, { name: 'Mymensingh', region: 'Mymensingh Division' },
]

export function ShippingCalculatorPage() {
  const { goBack, goCheckout } = useShopRouter()
  const cartTotal = useShopStore((s) => s.getCartTotal())
  const [cities, setCities] = useState<City[]>(DEFAULT_CITIES)
  const [originCity, setOriginCity] = useState('')
  const [destinationCity, setDestinationCity] = useState('')
  const [weight, setWeight] = useState('1')
  const [orderTotal, setOrderTotal] = useState(cartTotal > 0 ? String(cartTotal) : '')
  const [quotes, setQuotes] = useState<ShippingQuote[]>([])
  const [freeShipping, setFreeShipping] = useState<FreeShipping | null>(null)
  const [loading, setLoading] = useState(false)
  const [calculated, setCalculated] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [showOrigin, setShowOrigin] = useState(false)
  const [showDest, setShowDest] = useState(false)
  const [originSearch, setOriginSearch] = useState('')
  const [destSearch, setDestSearch] = useState('')

  useEffect(() => {
    fetch('/api/shipping/calculator').then((r) => r.json()).then((d) => { if (d.cities) setCities(d.cities) }).catch(() => {})
  }, [])

  const calculateShipping = useCallback(async () => {
    if (!originCity || !destinationCity) return
    setLoading(true)
    try {
      const res = await fetch('/api/shipping/calculator', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originCity, destinationCity, weight: parseFloat(weight) || 1, orderTotal: parseFloat(orderTotal) || 0 }),
      })
      const data = await res.json()
      if (data.quotes) { setQuotes(data.quotes); setFreeShipping(data.freeShipping); setCalculated(true); setSelectedMethod(data.quotes[0]?.methodId || null) }
    } catch {
      setQuotes([
        { methodId: 'standard', methodName: 'Standard Delivery', icon: Truck, price: 60, estimatedDays: '3-5', isFree: false, description: '3-5 business days' },
        { methodId: 'express', methodName: 'Express Delivery', icon: Zap, price: 120, estimatedDays: '1-2', isFree: false, description: '1-2 business days' },
        { methodId: 'pickup', methodName: 'Store Pickup', icon: Package, price: 0, estimatedDays: '0', isFree: true, description: 'Always free!' },
      ])
      setFreeShipping({ threshold: 2000, amountNeeded: Math.max(0, 2000 - (parseFloat(orderTotal) || 0)), isEligible: false })
      setCalculated(true); setSelectedMethod('standard')
    } finally { setLoading(false) }
  }, [originCity, destinationCity, weight, orderTotal])

  const filteredOrigin = cities.filter((c) => c.name.toLowerCase().includes(originSearch.toLowerCase()))
  const filteredDest = cities.filter((c) => c.name.toLowerCase().includes(destSearch.toLowerCase()))

  const CityDropdown = ({ cities: cityList, show, setShow, selected, onSelect, search, setSearch, label, icon: Icon }: {
    cities: City[]; show: boolean; setShow: (v: boolean) => void; selected: string
    onSelect: (name: string) => void; search: string; setSearch: (v: string) => void; label: string; icon: typeof Navigation
  }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><Icon className="w-3.5 h-3.5" />{label}</label>
      <div className="relative">
        <button onClick={() => { setShow(!show) }} className="w-full flex items-center justify-between px-3 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground">
          <span className={selected ? 'text-foreground' : 'text-muted-foreground'}>{selected || `Select ${label.toLowerCase()}`}</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
        <AnimatePresence>{show && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute z-20 w-full mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
            <div className="p-2"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full px-2 py-1.5 bg-muted/50 rounded-lg text-xs focus:outline-none" autoFocus /></div>
            {cityList.map((city) => (
              <button key={city.name} onClick={() => { onSelect(city.name); setShow(false); setSearch('') }} className={`w-full px-3 py-2 text-left text-sm hover:bg-muted/50 flex items-center justify-between ${selected === city.name ? 'bg-emerald-500/10 text-emerald-400' : 'text-foreground'}`}>
                <span>{city.name}</span><span className="text-[10px] text-muted-foreground">{city.region}</span>
              </button>
            ))}
          </motion.div>
        )}</AnimatePresence>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background pb-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="p-1.5 rounded-lg hover:bg-muted active:scale-95 transition"><ArrowRight className="w-5 h-5 rotate-180" /></button>
          <div><h1 className="text-lg font-bold text-foreground flex items-center gap-2"><Truck className="w-5 h-5 text-emerald-500" />Shipping Calculator</h1><p className="text-xs text-muted-foreground">Compare rates & delivery times</p></div>
        </div>
      </motion.div>

      <div className="px-4 mt-4 space-y-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <CityDropdown cities={filteredOrigin} show={showOrigin} setShow={(v) => { setShowOrigin(v); setShowDest(false) }} selected={originCity} onSelect={setOriginCity} search={originSearch} setSearch={setOriginSearch} label="Origin City" icon={Navigation} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <CityDropdown cities={filteredDest} show={showDest} setShow={(v) => { setShowDest(v); setShowOrigin(false) }} selected={destinationCity} onSelect={setDestinationCity} search={destSearch} setSearch={setDestSearch} label="Destination City" icon={MapPin} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><Weight className="w-3.5 h-3.5" />Weight (kg)</label>
            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} min="0.5" step="0.5" className="w-full px-3 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" />Order Total ()</label>
            <input type="number" value={orderTotal} onChange={(e) => setOrderTotal(e.target.value)} placeholder="0" className="w-full px-3 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
        </motion.div>

        {/* Free Shipping Indicator */}
        {freeShipping && !freeShipping.isEligible && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-emerald-400">Spend {freeShipping.amountNeeded.toLocaleString()} more for free shipping!</p>
              <div className="mt-1.5 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, ((parseFloat(orderTotal) || 0) / freeShipping.threshold) * 100)}%` }} className="h-full bg-emerald-500 rounded-full" />
              </div>
            </div>
          </motion.div>
        )}
        {freeShipping?.isEligible && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 flex items-center gap-3">
            <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p className="text-sm font-medium text-emerald-400 flex items-center gap-1">You qualify for free standard shipping! <PartyPopper className="h-4 w-4" /></p>
          </motion.div>
        )}

        <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} onClick={calculateShipping} disabled={!originCity || !destinationCity || loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-lg shadow-emerald-500/20 disabled:opacity-50">
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Package className="w-4 h-4" />Calculate Shipping</>}
        </motion.button>

        <AnimatePresence>{calculated && quotes.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Truck className="w-4 h-4 text-emerald-500" />Available Shipping Methods</h3>
            {quotes.map((q, idx) => (
              <motion.div key={q.methodId} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.08 }} onClick={() => setSelectedMethod(q.methodId)} className={`rounded-xl border p-4 cursor-pointer transition-all ${selectedMethod === q.methodId ? 'border-emerald-500/40 bg-emerald-500/5 shadow-md' : 'border-border bg-card hover:border-emerald-500/20'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">{(() => { const Icon = q.icon; return <Icon className="h-5 w-5 text-emerald-500" />; })()}</div>
                    <div><p className="text-sm font-semibold text-foreground">{q.methodName}</p><p className="text-xs text-muted-foreground">{q.description}</p></div>
                  </div>
                  <div className="text-right">
                    {q.isFree || q.price === 0 ? <p className="text-sm font-bold text-emerald-400">FREE</p> : <p className="text-sm font-bold text-foreground">{q.price}</p>}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3 h-3" />{q.estimatedDays === '0' ? 'Instant' : `${q.estimatedDays} days`}</div>
                  </div>
                </div>
                {selectedMethod === q.methodId && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground"><Check className="w-3 h-3 inline mr-1 text-emerald-400" />{q.isFree ? 'Free shipping applied' : `Shipping cost: ${q.price}`}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
            <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onClick={goCheckout} className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-lg shadow-emerald-500/20">
              <Send className="w-4 h-4" />Ship Now <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}</AnimatePresence>
      </div>
    </div>
  )
}
