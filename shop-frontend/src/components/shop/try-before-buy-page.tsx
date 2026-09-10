'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Plus, Minus, ShoppingBag, Truck, Clock, ArrowRight, Check, RotateCcw } from 'lucide-react'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'

interface TrialProduct {
  id: string
  name: string
  price: number
  imageUrl: string | null
  category: string
  rating: number
  trialDays: number
}

const trialSteps = [
  { icon: ShoppingBag, label: 'Select', desc: 'Choose up to 3 items to try' },
  { icon: Truck, label: 'Shipped', desc: 'Items delivered to your door' },
  { icon: Home, label: 'Try at Home', desc: 'Test for 7 days risk-free' },
  { icon: Check, label: 'Decide', desc: 'Keep what you love, return the rest' },
]

export function TryBeforeBuyPage() {
  const router = useShopRouter()
  const { trialItems, addToTrial, removeFromTrial, clearTrial, isInTrial } = useShopStore()
  const [products, setProducts] = useState<TrialProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [showSummary, setShowSummary] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/try-before-buy')
        if (res.ok) {
          const data = await res.json()
          setProducts(Array.isArray(data) ? data : data.data ?? [])
        } else {
          setProducts([])
        }
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleToggleTrial = (productId: string) => {
    if (isInTrial(productId)) {
      removeFromTrial(productId)
    } else if (trialItems.length < 3) {
      addToTrial(productId)
    }
  }

  const selectedProducts = products.filter(p => isInTrial(p.id))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="pb-24">
      {/* Hero */}
      <div className="px-4 pt-4 pb-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-indigo-500/20 border border-violet-500/20 p-5"
        >
          <div className="flex items-center gap-3 mb-2">
            <Home className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Try Before You Buy</h1>
              <p className="text-xs text-muted-foreground">Test products at home for 7 days</p>
            </div>
          </div>
          <div className="rounded-xl bg-background/50 p-3 mt-2">
            <p className="text-sm font-semibold text-foreground">Only pay for what you keep!</p>
            <p className="text-xs text-muted-foreground mt-1">Select up to 3 items, try them at home, and only pay for the ones you decide to keep. Free returns on the rest.</p>
          </div>
        </motion.div>
      </div>

      {/* How It Works */}
      <div className="px-4 py-3">
        <h2 className="text-base font-bold text-foreground mb-3">How It Works</h2>
        <div className="grid grid-cols-4 gap-2">
          {trialSteps.map((step, i) => (
            <div key={i} className="text-center">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-1">
                <step.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-[10px] font-semibold text-foreground">{step.label}</p>
              <p className="text-[8px] text-muted-foreground mt-0.5 leading-tight">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trial Counter */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between rounded-xl bg-card border border-border p-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Selected: {trialItems.length}/3</span>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div key={i} className={`h-2 w-8 rounded-full transition-colors ${i < trialItems.length ? 'bg-primary' : 'bg-muted'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="px-4 py-2">
        <h2 className="text-base font-bold text-foreground mb-3">Eligible Products</h2>
        <div className="space-y-3">
          {products.map((product, index) => {
            const inTrial = isInTrial(product.id)
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-xl bg-card border p-4 transition-all ${inTrial ? 'border-primary bg-primary/5' : 'border-border'}`}
              >
                <div className="flex items-start gap-3">
                  <div className="h-16 w-16 rounded-lg bg-muted/30 flex items-center justify-center shrink-0">
                    <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate">{product.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{product.category}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-primary">{product.price.toLocaleString()}</span>
                      <div className="flex items-center gap-0.5">
                        <span className="text-[10px] text-yellow-500"></span>
                        <span className="text-[10px] text-muted-foreground">{product.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">{product.trialDays}-day trial</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleTrial(product.id)}
                    disabled={!inTrial && trialItems.length >= 3}
                    className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center transition-all ${
                      inTrial
                        ? 'bg-primary text-primary-foreground'
                        : trialItems.length >= 3
                          ? 'bg-muted text-muted-foreground cursor-not-allowed'
                          : 'bg-primary/10 text-primary border border-primary/20'
                    }`}
                  >
                    {inTrial ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* FAQ */}
      <div className="px-4 py-3 mt-2">
        <h2 className="text-base font-bold text-foreground mb-3">FAQ</h2>
        <div className="space-y-2">
          {[
            { q: 'How long is the trial period?', a: 'Each product comes with a 7-day home trial period starting from the delivery date.' },
            { q: 'What happens if I keep an item?', a: 'If you decide to keep the item, you will be charged the full price. No additional fees apply.' },
            { q: 'How do I return items?', a: 'Simply schedule a pickup from your order tracking page. Returns are completely free.' },
            { q: 'Is there a deposit required?', a: 'No deposit is required. We trust you to try the products and make your decision.' },
          ].map((item, i) => (
            <div key={i} className="rounded-xl bg-card border border-border p-3">
              <p className="text-sm font-semibold text-foreground">{item.q}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Sticky Summary */}
      <AnimatePresence>
        {trialItems.length > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur-sm p-4 z-50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{trialItems.length} item{trialItems.length > 1 ? 's' : ''} selected</p>
                <p className="text-sm font-bold text-foreground">{selectedProducts.reduce((sum, p) => sum + p.price, 0).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={clearTrial}
                  className="rounded-xl bg-muted px-4 py-2.5 text-xs font-medium text-foreground transition-all active:scale-95"
                >
                  Clear
                </button>
                <button
                  onClick={() => router.goCheckout()}
                  className="rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground transition-all active:scale-95"
                >
                  Start Trial
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

