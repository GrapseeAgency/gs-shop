'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Check, ChevronRight, Calculator, FileText, Clock, Award, AlertCircle, ShieldCheck, Zap, Crown, Diamond } from 'lucide-react'
import { useShopRouter } from '@/hooks/use-shop-router'

interface WarrantyPlan {
  id: string
  name: string
  duration: number
  price: number
  coverage: string[]
  iconName: string
  color: string
  recommended?: boolean
}

interface ActiveWarranty {
  id: string
  productName: string
  planName: string
  expiresAt: string
  status: string
}

const planIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  shield: ShieldCheck,
  lightning: Zap,
  crown: Crown,
  diamond: Diamond,
}

const []: WarrantyPlan[] = [
  { id: '1', name: 'Standard', duration: 12, price: 5, coverage: ['Manufacturing defects', 'Hardware failure', 'Free repairs'], iconName: 'shield', color: 'from-gray-500/20 to-slate-500/20' },
  { id: '2', name: 'Extended', duration: 24, price: 8, coverage: ['All Standard coverage', 'Accidental damage', 'Free replacements'], iconName: 'lightning', color: 'from-blue-500/20 to-indigo-500/20', recommended: true },
  { id: '3', name: 'Premium', duration: 36, price: 12, coverage: ['All Extended coverage', 'Liquid damage', 'Priority support', 'Loaner device'], iconName: 'crown', color: 'from-amber-500/20 to-yellow-500/20' },
  { id: '4', name: 'Lifetime', duration: 999, price: 20, coverage: ['All Premium coverage', 'Unlimited claims', 'Free upgrades', 'No deductibles'], iconName: 'diamond', color: 'from-purple-500/20 to-violet-500/20' },
]

const []: ActiveWarranty[] = [
  { id: '1', productName: 'Wireless Earbuds Pro', planName: 'Extended', expiresAt: '2026-05-15', status: 'Active' },
  { id: '2', productName: 'Smart Watch Ultra', planName: 'Premium', expiresAt: '2027-03-20', status: 'Active' },
]

export function WarrantyCenterPage() {
  const router = useShopRouter()
  const [plans, setPlans] = useState<WarrantyPlan[]>([])
  const [activeWarranties, setActiveWarranties] = useState<ActiveWarranty[]>([])
  const [loading, setLoading] = useState(true)
  const [productValue, setProductValue] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [showCalculator, setShowCalculator] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/warranty-center')
        if (res.ok) {
          const data = await res.json()
          setPlans(data.plans || [])
          setActiveWarranties(data.warranties || [])
        } else {
          setPlans([])
          setActiveWarranties([])
        }
      } catch {
        setPlans([])
        setActiveWarranties([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const calculatePrice = (plan: WarrantyPlan) => {
    const value = parseFloat(productValue) || 0
    if (value === 0) return ''
    return `${Math.round(value * plan.price / 100).toLocaleString()}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="pb-6">
      {/* Hero */}
      <div className="px-4 pt-4 pb-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-violet-500/20 border border-blue-500/20 p-5 text-center"
        >
          <Shield className="h-10 w-10 text-primary mx-auto mb-2" />
          <h1 className="text-xl font-bold text-foreground">Warranty Center</h1>
          <p className="text-xs text-muted-foreground mt-1">Protect your purchases with extended warranty plans</p>
        </motion.div>
      </div>

      {/* Warranty Plans */}
      <div className="px-4 py-3">
        <h2 className="text-base font-bold text-foreground mb-3">Choose Your Plan</h2>
        <div className="space-y-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedPlan(selectedPlan === plan.id ? null : plan.id)}
              className={`rounded-xl border p-4 transition-all cursor-pointer ${
                selectedPlan === plan.id ? 'border-primary bg-primary/5' : 'border-border bg-card'
              } ${plan.recommended ? 'ring-1 ring-primary/30' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {(() => {
                    const IconComponent = planIcons[plan.iconName] || ShieldCheck
                    return <IconComponent className="h-9 w-9 text-primary" />
                  })()}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-foreground">{plan.name}</h3>
                      {plan.recommended && (
                        <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary">Recommended</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {plan.duration === 999 ? 'Lifetime coverage' : `${plan.duration} months coverage`}  {plan.price}% of product price
                    </p>
                  </div>
                </div>
                <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${selectedPlan === plan.id ? 'rotate-90' : ''}`} />
              </div>

              {selectedPlan === plan.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-3 pt-3 border-t border-border/50"
                >
                  <ul className="space-y-1.5">
                    {plan.coverage.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-green-500 shrink-0" />
                        <span className="text-xs text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={(e) => { e.stopPropagation() }}
                    className="mt-3 w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-xs font-semibold transition-all active:scale-[0.98]"
                  >
                    Select {plan.name} Plan
                  </button>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Price Calculator */}
      <div className="px-4 py-3">
        <button
          onClick={() => setShowCalculator(!showCalculator)}
          className="w-full flex items-center justify-between rounded-xl bg-card border border-border p-4"
        >
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">Price Calculator</span>
          </div>
          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${showCalculator ? 'rotate-90' : ''}`} />
        </button>
        {showCalculator && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="mt-3 rounded-xl bg-card border border-border p-4">
            <div className="mb-3">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Product Value ()</label>
              <input
                type="number"
                placeholder="Enter product price"
                value={productValue}
                onChange={(e) => setProductValue(e.target.value)}
                className="w-full rounded-xl bg-background border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              {plans.map(plan => (
                <div key={plan.id} className="flex items-center justify-between rounded-lg bg-background/50 px-3 py-2">
                  <span className="flex items-center gap-1 text-xs text-foreground">{(() => {
                    const IconComponent = planIcons[plan.iconName] || ShieldCheck
                    return <IconComponent className="h-4 w-4 text-primary" />
                  })()}{plan.name}</span>
                  <span className="text-sm font-bold text-primary">{calculatePrice(plan)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Active Warranties */}
      <div className="px-4 py-3">
        <h2 className="text-base font-bold text-foreground mb-3">Your Active Warranties</h2>
        {activeWarranties.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No active warranties yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeWarranties.map((warranty) => (
              <div key={warranty.id} className="rounded-xl bg-card border border-border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{warranty.productName}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{warranty.planName} Plan</p>
                  </div>
                  <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[10px] font-medium text-green-600">{warranty.status}</span>
                </div>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Expires: {warranty.expiresAt}</span>
                </div>
                <button className="mt-2 text-xs font-medium text-primary">File a Claim </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Coverage Comparison Table */}
      <div className="px-4 py-3">
        <h2 className="text-base font-bold text-foreground mb-3">Coverage Comparison</h2>
        <div className="rounded-xl bg-card border border-border overflow-hidden">
          <div className="grid grid-cols-5 gap-1 p-2 bg-muted/30 text-[10px] font-semibold text-muted-foreground">
            <span className="col-span-1">Feature</span>
            {plans.map(p => <span key={p.id} className="text-center">{p.name}</span>)}
          </div>
          {[
            { feature: 'Hardware', values: [true, true, true, true] },
            { feature: 'Accidental', values: [false, true, true, true] },
            { feature: 'Liquid', values: [false, false, true, true] },
            { feature: 'Free Repair', values: [true, true, true, true] },
            { feature: 'Replacement', values: [false, true, true, true] },
            { feature: 'Priority Support', values: [false, false, true, true] },
            { feature: 'Loaner Device', values: [false, false, true, true] },
            { feature: 'Free Upgrades', values: [false, false, false, true] },
          ].map((row, i) => (
            <div key={i} className="grid grid-cols-5 gap-1 p-2 border-t border-border/30">
              <span className="col-span-1 text-[10px] text-foreground">{row.feature}</span>
              {row.values.map((v, j) => (
                <span key={j} className="text-center">{v ? <Check className="h-3 w-3 text-green-500 mx-auto" /> : <span className="text-[10px] text-muted-foreground"></span>}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
