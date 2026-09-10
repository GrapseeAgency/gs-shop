'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import {
  Cloud, Cpu, Server, Globe, Database, ArrowRight, ChevronDown, Zap, Clock, DollarSign,
  Check, AlertCircle, Send, Navigation, HardDrive, PartyPopper, Crown, Shield, Laptop, Network
} from 'lucide-react'

interface CloudPlatform { name: string; region: string }
interface HandoverQuote {
  key: string; name: string; cost: number; estimatedDays: string; isLocalDelivery: boolean; description: string
}
interface FreeFulfillment { threshold: number; amountNeeded: number; isEligible: boolean }

const DEFAULT_CLOUDS: CloudPlatform[] = [
  { name: 'Vercel', region: 'Serverless Cloud' },
  { name: 'Netlify', region: 'Serverless Cloud' },
  { name: 'Cloudflare Pages', region: 'Edge Network' },
  { name: 'AWS (Amazon Web Services)', region: 'Cloud Infrastructure' },
  { name: 'Google Cloud Platform (GCP)', region: 'Cloud Infrastructure' },
  { name: 'Custom VPS (DigitalOcean/Linode)', region: 'Virtual Private Server' },
  { name: 'Heroku', region: 'PaaS Cloud' },
]

const SOURCE_REGISTRIES = [
  { name: 'Grapsee Private GitHub Registry', region: 'Secure Auth Transfer' },
  { name: 'Direct Zip Download Archive', region: 'Immediate Dashboard File' },
  { name: 'Grapsee GitLab Group Sync', region: 'Secure Auth Transfer' },
]

export function ShippingCalculatorPage() {
  const { goBack, goCheckout } = useShopRouter()
  const cartTotal = useShopStore((s) => s.getCartTotal())
  const [platforms, setPlatforms] = useState<CloudPlatform[]>(DEFAULT_CLOUDS)
  const [sourceRegistry, setSourceRegistry] = useState('Grapsee Private GitHub Registry')
  const [targetCloud, setTargetCloud] = useState('')
  const [complexityIndex, setComplexityIndex] = useState('1')
  const [orderTotal, setOrderTotal] = useState(cartTotal > 0 ? String(cartTotal) : '')
  const [quotes, setQuotes] = useState<HandoverQuote[]>([])
  const [freeFulfillment, setFreeFulfillment] = useState<FreeFulfillment | null>(null)
  const [loading, setLoading] = useState(false)
  const [calculated, setCalculated] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [showOrigin, setShowOrigin] = useState(false)
  const [showDest, setShowDest] = useState(false)
  const [originSearch, setOriginSearch] = useState('')
  const [destSearch, setDestSearch] = useState('')

  useEffect(() => {
    fetch('/api/shipping/calculator')
      .then((r) => r.json())
      .then((d) => { if (d.cities) setPlatforms(d.cities) })
      .catch(() => {})
  }, [])

  const calculateHandover = useCallback(async () => {
    if (!sourceRegistry || !targetCloud) return
    setLoading(true)
    try {
      const res = await fetch('/api/shipping/calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: sourceRegistry,
          destination: targetCloud,
          weight: parseFloat(complexityIndex) || 1,
          orderTotal: parseFloat(orderTotal) || 0
        }),
      })
      const data = await res.json()
      if (data.methods) {
        setQuotes(data.methods)
        setFreeFulfillment(data.freeShipping)
        setCalculated(true)
        setSelectedMethod(data.methods[0]?.key || null)
      }
    } catch {
      // Fallback
      setQuotes([
        { key: 'standard', name: 'Instant Zip & Email', cost: 0, estimatedDays: 'Instant', isLocalDelivery: true, description: 'Immediate package access inside your client dashboard' },
        { key: 'github', name: 'GitHub Repo Invite & Sync', cost: 500, estimatedDays: '1-2 Hours', isLocalDelivery: false, description: 'Private repository transfer with future update sync' },
        { key: 'setup', name: 'Professional Cloud Deployment', cost: 1500, estimatedDays: '12-24 Hours', isLocalDelivery: false, description: 'Grapsee engineer deploys and configures the app on your server' },
      ])
      setFreeFulfillment({ threshold: 5000, amountNeeded: Math.max(0, 5000 - (parseFloat(orderTotal) || 0)), isEligible: false })
      setCalculated(true)
      setSelectedMethod('standard')
    } finally { setLoading(false) }
  }, [sourceRegistry, targetCloud, complexityIndex, orderTotal])

  const filteredOrigin = SOURCE_REGISTRIES.filter((c) => c.name.toLowerCase().includes(originSearch.toLowerCase()))
  const filteredDest = platforms.filter((c) => c.name.toLowerCase().includes(destSearch.toLowerCase()))

  const PlatformDropdown = ({ items, show, setShow, selected, onSelect, search, setSearch, label, icon: Icon }: {
    items: CloudPlatform[]; show: boolean; setShow: (v: boolean) => void; selected: string
    onSelect: (name: string) => void; search: string; setSearch: (v: string) => void; label: string; icon: typeof Cloud
  }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><Icon className="w-3.5 h-3.5 text-emerald-400" />{label}</label>
      <div className="relative">
        <button onClick={() => { setShow(!show) }} className="w-full flex items-center justify-between px-3 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground hover:border-emerald-500/20 transition-all">
          <span className={selected ? 'text-foreground font-medium' : 'text-muted-foreground'}>{selected || `Select ${label.toLowerCase()}`}</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
        <AnimatePresence>{show && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute z-20 w-full mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
            <div className="p-2"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full px-2 py-1.5 bg-muted/50 rounded-lg text-xs focus:outline-none" autoFocus /></div>
            {items.map((item) => (
              <button key={item.name} onClick={() => { onSelect(item.name); setShow(false); setSearch('') }} className={`w-full px-3 py-2 text-left text-sm hover:bg-muted/50 flex items-center justify-between ${selected === item.name ? 'bg-emerald-500/10 text-emerald-400 font-semibold' : 'text-foreground'}`}>
                <span>{item.name}</span><span className="text-[10px] text-muted-foreground">{item.region}</span>
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
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Cloud className="w-5 h-5 text-emerald-500" /> Digital Handover Calculator
            </h1>
            <p className="text-xs text-muted-foreground">Compare digital delivery & cloud deployment rates</p>
          </div>
        </div>
      </motion.div>

      <div className="px-4 mt-4 space-y-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <PlatformDropdown items={filteredOrigin} show={showOrigin} setShow={(v) => { setShowOrigin(v); setShowDest(false) }} selected={sourceRegistry} onSelect={setSourceRegistry} search={originSearch} setSearch={setOriginSearch} label="Source Code Registry" icon={Laptop} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <PlatformDropdown items={filteredDest} show={showDest} setShow={(v) => { setShowDest(v); setShowOrigin(false) }} selected={targetCloud} onSelect={setTargetCloud} search={destSearch} setSearch={setDestSearch} label="Target Deployment Cloud" icon={Server} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-emerald-400" />Project Complexity</label>
            <select value={complexityIndex} onChange={(e) => setComplexityIndex(e.target.value)} className="w-full px-3 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
              <option value="1">1x (Simple Assets/ZIP)</option>
              <option value="1.5">1.5x (Standard SaaS App)</option>
              <option value="2.5">2.5x (Complex System)</option>
              <option value="4">4x (Enterprise SaaS Stack)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-emerald-400" />Order Total ()</label>
            <input type="number" value={orderTotal} onChange={(e) => setOrderTotal(e.target.value)} placeholder="0" className="w-full px-3 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          </div>
        </motion.div>

        {/* Free Deployment threshold alert */}
        {freeFulfillment && !freeFulfillment.isEligible && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-emerald-400">Spend {(freeFulfillment.amountNeeded).toLocaleString()} more for FREE installation & setup deployment!</p>
              <div className="mt-1.5 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, ((parseFloat(orderTotal) || 0) / freeFulfillment.threshold) * 100)}%` }} className="h-full bg-emerald-500 rounded-full" />
              </div>
            </div>
          </motion.div>
        )}
        {freeFulfillment?.isEligible && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 flex items-center gap-3">
            <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p className="text-sm font-medium text-emerald-400 flex items-center gap-1">Awesome! You qualify for FREE Professional Cloud Deployment! <PartyPopper className="h-4 w-4" /></p>
          </motion.div>
        )}

        <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} onClick={calculateHandover} disabled={!sourceRegistry || !targetCloud || loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-lg shadow-emerald-500/20 disabled:opacity-50">
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Cloud className="w-4 h-4" />Compare Handover & Deploys</>}
        </motion.button>

        <AnimatePresence>{calculated && quotes.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Network className="w-4 h-4 text-emerald-500" />Fulfillment Delivery Methods</h3>
            {quotes.map((q, idx) => (
              <motion.div key={q.key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.08 }} onClick={() => setSelectedMethod(q.key)} className={`rounded-xl border p-4 cursor-pointer transition-all ${selectedMethod === q.key ? 'border-emerald-500/40 bg-emerald-500/5 shadow-md' : 'border-border bg-card hover:border-emerald-500/20'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      {q.key === 'standard' ? <Cloud className="h-5 w-5 text-emerald-500" /> : q.key === 'github' ? <Laptop className="h-5 w-5 text-emerald-500" /> : <Server className="h-5 w-5 text-emerald-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{q.name}</p>
                      <p className="text-xs text-muted-foreground">{q.description}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {q.cost === 0 ? <p className="text-sm font-bold text-emerald-400">FREE</p> : <p className="text-sm font-bold text-foreground">{q.cost}</p>}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end mt-0.5"><Clock className="w-3 h-3" />{q.estimatedDays}</div>
                  </div>
                </div>
                {selectedMethod === q.key && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      {q.cost === 0 ? 'Fulfillment is completely free' : `Fulfillment & setup setup charge: ${q.cost} BDT`}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ))}
            <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onClick={goCheckout} className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-lg shadow-emerald-500/20">
              <Send className="w-4 h-4" />Proceed to Checkout with Setup <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}</AnimatePresence>
      </div>
    </div>
  )
}

