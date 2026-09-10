'use client'

import { useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useShopRouter } from '@/hooks/use-shop-router'
import {
  Search, ArrowRight, Package, Truck, CheckCircle2, Clock, MapPin,
  Phone, MessageSquare, User, ExternalLink, Navigation, AlertCircle,
  Box, Flag,
} from 'lucide-react'

interface TrackingStep { status: string; label: string; location: string; date: string; completed: boolean; current: boolean }
interface TrackingData { trackingNumber: string; carrier: { name: string; logo: string; phone: string }; deliveryAddress: string; steps: TrackingStep[]; estimatedDelivery: string; currentStatus: string }

const STEP_ICONS: Record<string, typeof Package> = {
  order_placed: Package, processing: Box, shipped: Truck,
  in_transit: Navigation, out_for_delivery: Truck, delivered: CheckCircle2,
}

function OrderTrackingInner() {
  const { goBack, goContact } = useShopRouter()
  const searchParams = useSearchParams()
  const initialOrderId = searchParams.get('id') || ''

  const [searchQuery, setSearchQuery] = useState(initialOrderId)
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(!!initialOrderId)

  const trackOrder = useCallback(async (query?: string) => {
    const q = (query || searchQuery).trim()
    if (!q) { setError('Please enter an order ID, tracking number, or email'); return }
    setError(''); setLoading(true); setSearched(true)
    try {
      // If looks like an email, look up most recent order first
      if (q.includes('@')) {
        const ordersRes = await fetch(`/api/orders?email=${encodeURIComponent(q)}`)
        if (ordersRes.ok) {
          const orders = await ordersRes.json()
          if (Array.isArray(orders) && orders.length > 0) {
            const latestId = orders[0].id
            const res = await fetch(`/api/orders/${encodeURIComponent(latestId)}/track`)
            if (res.ok) { setTrackingData(await res.json()); return }
          }
        }
        setError('No orders found for this email.'); setTrackingData(null); return
      }
      // Otherwise treat as order ID or tracking number
      const res = await fetch(`/api/orders/${encodeURIComponent(q)}/track`)
      if (!res.ok) { setError('Order not found. Please check the ID and try again.'); setTrackingData(null); return }
      const data = await res.json(); setTrackingData(data)
    } catch { setError('Failed to fetch tracking information.'); setTrackingData(null) } finally { setLoading(false) }
  }, [searchQuery])

  // Auto-track if initial order ID provided
  useState(() => { if (initialOrderId) trackOrder(initialOrderId) })

  const formatDate = (d: string) => { try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) } catch { return d } }

  return (
    <div className="min-h-screen bg-background pb-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="p-1.5 rounded-lg hover:bg-muted active:scale-95 transition"><ArrowRight className="w-5 h-5 rotate-180" /></button>
          <div><h1 className="text-lg font-bold text-foreground flex items-center gap-2"><MapPin className="w-5 h-5 text-sky-500" />Order Tracking</h1><p className="text-xs text-muted-foreground">Track your order in real-time</p></div>
        </div>
      </motion.div>

      <div className="px-4 mt-4 space-y-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setError('') }} onKeyDown={(e) => e.key === 'Enter' && trackOrder()} placeholder="Order ID, tracking number, or email" className="w-full pl-9 pr-4 py-3 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/50" />
            </div>
            <button onClick={() => trackOrder()} disabled={loading} className="px-4 rounded-xl bg-sky-500 text-white text-sm font-medium active:scale-95 transition disabled:opacity-50">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Track'}
            </button>
          </div>
          {error && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</motion.p>}
        </motion.div>

        <AnimatePresence mode="wait">
          {!searched ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}><Package className="w-16 h-16 text-muted-foreground/30 mx-auto" /></motion.div>
              <h3 className="text-lg font-semibold text-foreground mt-4">Track Your Order</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-[250px] mx-auto">Enter your order ID, tracking number, or email address to see real-time delivery updates</p>
              <div className="mt-4 space-y-1.5 text-left max-w-[240px] mx-auto">
                <p className="text-[10px] text-muted-foreground/70 font-medium uppercase tracking-wider">Accepted formats</p>
                <p className="text-[11px] text-muted-foreground font-mono bg-muted/50 rounded px-2 py-1">cm8abc123... (Order ID)</p>
                <p className="text-[11px] text-muted-foreground font-mono bg-muted/50 rounded px-2 py-1">GRPS-XXXXXXXX (Tracking #)</p>
                <p className="text-[11px] text-muted-foreground font-mono bg-muted/50 rounded px-2 py-1">you@email.com</p>
              </div>
            </motion.div>
          ) : trackingData ? (
            <motion.div key="tracking" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
              {/* Tracking Number */}
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div><p className="text-xs text-muted-foreground">Tracking Number</p><p className="text-sm font-bold text-foreground flex items-center gap-1.5">{trackingData.trackingNumber}<button onClick={() => navigator.clipboard?.writeText(trackingData.trackingNumber)} className="text-sky-400"><ExternalLink className="w-3 h-3" /></button></p></div>
                  <div className="text-right"><p className="text-xs text-muted-foreground">Carrier</p><p className="text-sm font-medium text-foreground">{trackingData.carrier.name}</p></div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="w-3 h-3" /><span className="truncate">{trackingData.deliveryAddress}</span></div>
              </div>

              {/* Estimated Delivery */}
              <div className="rounded-xl bg-sky-500/10 border border-sky-500/20 p-4">
                <div className="flex items-center justify-between">
                  <div><p className="text-xs text-sky-400">Estimated Delivery</p><p className="text-lg font-bold text-foreground">{formatDate(trackingData.estimatedDelivery)}</p></div>
                  <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center"><Truck className="w-6 h-6 text-sky-400" /></div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="rounded-xl border border-border bg-muted/30 h-36 flex items-center justify-center relative overflow-hidden">
                <div className="text-center z-10"><Navigation className="w-8 h-8 text-sky-400/40 mx-auto mb-1" /><p className="text-xs text-muted-foreground">Live map coming soon</p></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.1),transparent_70%)]" />
                <motion.div animate={{ x: [0, 200, 0] }} transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }} className="absolute top-1/2 -translate-y-1/2"><Truck className="w-5 h-5 text-sky-400/60" /></motion.div>
              </div>

              {/* Driver Info */}
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center"><User className="w-5 h-5 text-sky-400" /></div>
                  <div className="flex-1"><p className="text-sm font-medium text-foreground">Your Delivery Driver</p><p className="text-xs text-muted-foreground">{trackingData.carrier.name}</p></div>
                  <div className="flex gap-2">
                    <button className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Phone className="w-4 h-4 text-emerald-400" /></button>
                    <button className="w-9 h-9 rounded-lg bg-sky-500/10 flex items-center justify-center"><MessageSquare className="w-4 h-4 text-sky-400" /></button>
                  </div>
                </div>
              </div>

              {/* Animated Timeline */}
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2"><Flag className="w-4 h-4 text-sky-400" />Delivery Progress</h3>
                <div className="space-y-0">
                  {trackingData.steps.map((step, idx) => {
                    const Icon = STEP_ICONS[step.status] || Package
                    return (
                      <motion.div key={step.status} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: idx * 0.1 + 0.2, type: 'spring' }} className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${step.completed ? step.current ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-emerald-500/20' : 'bg-muted/50'}`}>
                            <Icon className={`w-4 h-4 ${step.completed ? step.current ? 'text-white' : 'text-emerald-400' : 'text-muted-foreground'}`} />
                          </motion.div>
                          {idx < trackingData.steps.length - 1 && <motion.div initial={{ height: 0 }} animate={{ height: '100%' }} transition={{ delay: idx * 0.1 + 0.3, duration: 0.4 }} className={`w-0.5 min-h-[32px] ${step.completed ? 'bg-emerald-400' : 'bg-muted'}`} />}
                        </div>
                        <div className="pb-4 flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className={`text-sm font-medium ${step.completed ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                                {step.label}{step.current && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-normal">Current</span>}
                              </p>
                              <p className="text-xs text-muted-foreground">{step.location}</p>
                            </div>
                            <p className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">{formatDate(step.date)}</p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              <button onClick={goContact} className="w-full py-3 rounded-xl border border-border bg-card text-sm font-medium text-foreground flex items-center justify-center gap-2 hover:bg-muted/50 transition active:scale-[0.98]">
                <MessageSquare className="w-4 h-4" />Contact Support
              </button>
            </motion.div>
          ) : !loading ? (
            <motion.div key="notfound" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm font-medium text-foreground">Order not found</p><p className="text-xs text-muted-foreground mt-1">Check the order ID and try again</p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}

export function OrderTrackingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-muted border-t-foreground rounded-full" /></div>
    }>
      <OrderTrackingInner />
    </Suspense>
  )
}

