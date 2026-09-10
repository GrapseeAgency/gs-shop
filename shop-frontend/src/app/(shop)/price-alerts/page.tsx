'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  ArrowLeft, Bell, TrendingDown, Trash2, Plus, Loader2,
  Info, CheckCircle2, AlertTriangle, Search, Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'

interface PriceAlertData {
  id: string
  productId: string
  productName: string
  targetPrice: number
  currentPrice: number
  email: string
  isTriggered: boolean
  isActive: boolean
  createdAt: string
}

interface ProductOption {
  id: string
  name: string
  price: number
}

export default function PriceAlertsPage() {
  const { goBack } = useShopRouter()
  const [alerts, setAlerts] = useState<PriceAlertData[]>([])
  const [products, setProducts] = useState<ProductOption[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [productSearch, setProductSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null)
  const [targetPrice, setTargetPrice] = useState('')
  const [alertEmail, setAlertEmail] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [alertsRes, productsRes] = await Promise.all([
        fetch('/api/price-alerts'),
        fetch('/api/products'),
      ])
      if (alertsRes.ok) {
        const json = await alertsRes.json()
        setAlerts(json.data || [])
      }
      if (productsRes.ok) {
        const json = await productsRes.json()
        setProducts(json.data || json || [])
      }
    } catch {
      toast.error('Failed to load price alerts')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAlert = async () => {
    if (!selectedProduct) {
      toast.error('Please select a product')
      return
    }
    const tp = Number(targetPrice)
    if (!tp || tp <= 0) {
      toast.error('Please enter a valid target price')
      return
    }
    if (!alertEmail.trim() || !alertEmail.includes('@')) {
      toast.error('Please enter a valid email')
      return
    }
    try {
      setCreating(true)
      const res = await fetch('/api/price-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          targetPrice: tp,
          currentPrice: selectedProduct.price,
          email: alertEmail.trim(),
        }),
      })
      if (res.ok) {
        toast.success('Price alert created!')
        setShowCreateForm(false)
        setSelectedProduct(null)
        setTargetPrice('')
        setAlertEmail('')
        setProductSearch('')
        fetchData()
      } else {
        const json = await res.json()
        toast.error(json.error || 'Failed to create alert')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteAlert = async (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
    try {
      await fetch('/api/price-alerts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      toast.success('Alert deleted')
    } catch {
      toast.error('Failed to delete alert')
    }
  }

  const activeAlerts = alerts.filter(a => a.isActive && !a.isTriggered)
  const triggeredAlerts = alerts.filter(a => a.isTriggered)

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  ).slice(0, 8)

  const steps = [
    { step: 1, title: 'Select a Product', desc: 'Choose which product to track', icon: Search, color: 'from-emerald-500/15 to-emerald-700/5' },
    { step: 2, title: 'Set Target Price', desc: 'Specify the price you want', icon: TrendingDown, color: 'from-amber-500/15 to-amber-700/5' },
    { step: 3, title: 'Get Notified', desc: 'We email you when the price drops', icon: Bell, color: 'from-violet-500/15 to-violet-700/5' },
  ]

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
            <TrendingDown className="h-5 w-5 text-amber-400" />
            Price Alerts
          </h1>
          <p className="text-xs text-muted-foreground">Never miss a price drop</p>
        </div>
        <Button
          size="sm"
          className="h-8 rounded-lg bg-primary/10 text-primary hover:bg-primary/20"
          variant="ghost"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          <Plus className="h-4 w-4 mr-1" />
          New
        </Button>
      </div>

      {/* How It Works */}
      <section className="mb-4">
        <div className="space-y-2">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.step}
                className={`flex items-center gap-3 rounded-xl bg-gradient-to-r ${step.color} border border-border/50 p-3`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-xs font-bold text-foreground">
                  {step.step}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground">{step.title}</p>
                  <p className="text-[10px] text-muted-foreground">{step.desc}</p>
                </div>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Create Alert Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              Create Price Alert
            </h3>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Product</label>
              {selectedProduct ? (
                <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-card p-3">
                  <span className="flex-1 text-sm text-foreground">{selectedProduct.name}</span>
                  <span className="text-xs text-primary font-medium">{formatPrice(selectedProduct.price)}</span>
                  <button onClick={() => { setSelectedProduct(null); setProductSearch('') }} className="text-muted-foreground hover:text-foreground">
                    
                  </button>
                </div>
              ) : (
                <>
                  <Input
                    placeholder="Search for a product..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="h-10 rounded-xl mb-2"
                  />
                  {productSearch && (
                    <div className="max-h-32 overflow-y-auto space-y-1 rounded-xl border border-border/50 bg-card p-2">
                      {filteredProducts.length === 0 ? (
                        <p className="text-xs text-muted-foreground p-2 text-center">No products found</p>
                      ) : (
                        filteredProducts.map(p => (
                          <button
                            key={p.id}
                            className="flex items-center justify-between w-full rounded-lg px-3 py-2 text-left hover:bg-muted/50 transition-colors"
                            onClick={() => { setSelectedProduct(p); setProductSearch(''); setTargetPrice(String(Math.round(p.price * 0.8))) }}
                          >
                            <span className="text-xs text-foreground truncate">{p.name}</span>
                            <span className="text-xs text-primary font-medium flex-shrink-0 ml-2">{formatPrice(p.price)}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Target Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">$</span>
                <Input
                  type="number"
                  placeholder="Enter target price"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="pl-7 h-10 rounded-xl"
                  min="0"
                  step="0.01"
                />
              </div>
              {selectedProduct && targetPrice && (
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {Number(targetPrice) < selectedProduct.price
                    ? `${Math.round((1 - Number(targetPrice) / selectedProduct.price) * 100)}% below current price`
                    : 'Target price is at or above current price'}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Email for Notification</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
                className="h-10 rounded-xl"
              />
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold shadow-lg shadow-amber-500/20"
                onClick={handleCreateAlert}
                disabled={creating || !selectedProduct}
              >
                {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bell className="mr-2 h-4 w-4" />}
                {creating ? 'Creating...' : 'Create Alert'}
              </Button>
              <Button
                variant="ghost"
                className="h-10 rounded-xl"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Separator className="my-4" />

      {/* Active Alerts */}
      <section className="mb-4">
        <h3 className="mb-3 text-sm font-bold text-foreground flex items-center gap-2">
          <Bell className="h-4 w-4 text-amber-400" />
          Active Alerts
          {activeAlerts.length > 0 && (
            <Badge variant="secondary" className="text-[10px]">{activeAlerts.length}</Badge>
          )}
        </h3>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : activeAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Bell className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No active alerts</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Create one to track price changes</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeAlerts.map((alert, idx) => {
              const progress = Math.max(0, Math.min(100, ((alert.currentPrice - alert.targetPrice) / alert.currentPrice) * 100))
              return (
                <motion.div
                  key={alert.id}
                  className="rounded-xl border border-border/50 bg-card p-4"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{alert.productName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">Current: <span className="font-medium text-foreground">{formatPrice(alert.currentPrice)}</span></span>
                        <span className="text-[10px] text-muted-foreground"></span>
                        <span className="text-xs text-emerald-400 font-medium">Target: {formatPrice(alert.targetPrice)}</span>
                      </div>
                    </div>
                    <button
                      className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      onClick={() => handleDeleteAlert(alert.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <Progress value={100 - progress} className="h-2" />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>{formatPrice(alert.targetPrice)}</span>
                      <span>{Math.round(100 - progress)}% to target</span>
                      <span>{formatPrice(alert.currentPrice)}</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </section>

      {/* Triggered Alerts */}
      {triggeredAlerts.length > 0 && (
        <>
          <Separator className="my-4" />
          <section className="mb-4">
            <h3 className="mb-3 text-sm font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Triggered Alerts
              <Badge variant="secondary" className="text-[10px]">{triggeredAlerts.length}</Badge>
            </h3>
            <div className="space-y-2">
              {triggeredAlerts.map((alert, idx) => (
                <motion.div
                  key={alert.id}
                  className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{alert.productName}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-xs text-emerald-400 font-medium">Price reached {formatPrice(alert.targetPrice)}</span>
                      </div>
                    </div>
                    <button
                      className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      onClick={() => handleDeleteAlert(alert.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </>
      )}
    </motion.div>
  )
}
