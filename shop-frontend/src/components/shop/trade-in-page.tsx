'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Search, Package, Star, ChevronRight,
  CheckCircle2, Info, ArrowRight, RotateCcw,
  Truck, DollarSign, Shield, X, ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import { toast } from 'sonner'

type TradeInStep = 'select' | 'condition' | 'quote' | 'ship'
type Condition = 'excellent' | 'good' | 'fair' | 'poor'

interface TradeInProduct {
  id: string
  name: string
  imageUrl: string | null
  category: string
  originalPrice: number
  tradeInValues: Record<Condition, number>
}

const conditionDetails: Record<Condition, { label: string; desc: string; color: string; icon: typeof Star }> = {
  excellent: { label: 'Excellent', desc: 'Like new, no scratches', color: 'emerald', icon: CheckCircle2 },
  good: { label: 'Good', desc: 'Minor wear, fully functional', color: 'sky', icon: Star },
  fair: { label: 'Fair', desc: 'Visible wear, works fine', color: 'amber', icon: Info },
  poor: { label: 'Poor', desc: 'Major wear or defects', color: 'red', icon: RotateCcw },
}

export function TradeInPage() {
  const { goBack, goHome } = useShopRouter()
  const [step, setStep] = useState<TradeInStep>('select')
  const [products, setProducts] = useState<TradeInProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<TradeInProduct | null>(null)
  const [condition, setCondition] = useState<Condition | null>(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [quote, setQuote] = useState<{ quoteId: string; tradeInValue: number; expiresAt: string } | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/trade-in')
        if (res.ok) {
          const data = await res.json()
          setProducts(Array.isArray(data.data) ? data.data : [])
        }
      } catch {
        // silent
      }
      setLoading(false)
    }
    fetchProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    if (!search) return products
    return products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
  }, [products, search])

  const tradeInValue = selectedProduct && condition ? selectedProduct.tradeInValues[condition] : 0
  const currentStepIndex = ['select', 'condition', 'quote', 'ship'].indexOf(step)

  const handleGetQuote = async () => {
    if (!selectedProduct || !condition) return
    setQuoteLoading(true)
    try {
      const res = await fetch('/api/trade-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: selectedProduct.id, condition }),
      })
      if (res.ok) {
        const data = await res.json()
        setQuote(data.quote)
        setStep('quote')
      }
    } catch {
      toast.error('Failed to get quote')
    }
    setQuoteLoading(false)
  }

  const stepItems = [
    { key: 'select' as const, label: 'Select' },
    { key: 'condition' as const, label: 'Assess' },
    { key: 'quote' as const, label: 'Quote' },
    { key: 'ship' as const, label: 'Ship' },
  ]

  const faqItems = [
    { q: 'How is trade-in value determined?', a: 'Based on the product condition, market value, and demand. Excellent condition items get up to 60% of original price.' },
    { q: 'How do I ship my item?', a: 'We provide a free prepaid shipping label. Just pack your item securely and drop it off at any courier location.' },
    { q: 'When will I receive my credit?', a: 'After we receive and inspect your item (usually 2-3 business days), the credit is applied to your account.' },
    { q: 'What if my item is rejected?', a: 'If the condition doesn\'t match your assessment, we\'ll send a revised offer. You can accept or have the item returned for free.' },
  ]

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
              <RotateCcw className="h-5 w-5 text-teal-500" /> Trade-In Program
            </h1>
          </div>
        </div>
      </div>

      {/* Step Progress */}
      <div className="px-4 py-3">
        <div className="flex items-center">
          {stepItems.map((s, i) => (
            <div key={s.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  i < currentStepIndex ? 'bg-teal-500 text-white' :
                  i === currentStepIndex ? 'bg-teal-500/10 border-2 border-teal-500 text-teal-500' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {i < currentStepIndex ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                <span className={`text-[10px] mt-1 ${i <= currentStepIndex ? 'text-teal-500 font-medium' : 'text-muted-foreground'}`}>{s.label}</span>
              </div>
              {i < stepItems.length - 1 && (
                <div className={`h-0.5 w-6 -mt-4 ${i < currentStepIndex ? 'bg-teal-500' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="px-4">
        <AnimatePresence mode="wait">
          {/* Step 1: Select Product */}
          {step === 'select' && (
            <motion.div key="select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search your product..."
                  className="w-full rounded-xl border border-border bg-card pl-9 pr-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>

              {/* Product List */}
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3">
                      <div className="h-12 w-12 rounded-lg bg-muted animate-pulse" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
                        <div className="h-2 w-1/2 rounded bg-muted animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredProducts.map((product, index) => (
                    <motion.button
                      key={product.id}
                      className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                        selectedProduct?.id === product.id
                          ? 'border-teal-500 bg-teal-500/5'
                          : 'border-border/50 bg-card hover:border-teal-500/30'
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => { setSelectedProduct(product); setCondition(null) }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-muted/50">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-6 w-6 m-auto text-muted-foreground/40" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                        <p className="text-[11px] text-muted-foreground">{product.category}  {formatPrice(product.originalPrice)}</p>
                        <p className="text-[11px] text-teal-500 font-medium">Trade-in up to {formatPrice(product.tradeInValues.excellent)}</p>
                      </div>
                      {selectedProduct?.id === product.id && <CheckCircle2 className="h-5 w-5 text-teal-500 flex-shrink-0" />}
                    </motion.button>
                  ))}
                </div>
              )}

              {selectedProduct && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Button className="w-full mt-4 gap-2 bg-teal-500 hover:bg-teal-600 text-white" onClick={() => setStep('condition')}>
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Step 2: Condition Assessment */}
          {step === 'condition' && selectedProduct && (
            <motion.div key="condition" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <div className="flex items-center gap-3 rounded-xl border border-teal-500/20 bg-teal-500/5 p-3 mb-4">
                <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-muted/50">
                  {selectedProduct.imageUrl ? (
                    <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="h-full w-full object-cover" />
                  ) : (
                    <Package className="h-5 w-5 m-auto text-muted-foreground/40" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{selectedProduct.name}</p>
                  <p className="text-xs text-muted-foreground">{formatPrice(selectedProduct.originalPrice)}</p>
                </div>
              </div>

              <h3 className="text-sm font-bold text-foreground mb-3">What condition is your item?</h3>

              <div className="space-y-2">
                {(Object.entries(conditionDetails) as [Condition, typeof conditionDetails[Condition]][]).map(([key, detail]) => {
                  const value = selectedProduct.tradeInValues[key]
                  return (
                    <motion.button
                      key={key}
                      onClick={() => setCondition(key)}
                      className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                        condition === key
                          ? `border-${detail.color}-500 bg-${detail.color}-500/5`
                          : 'border-border/50 bg-card hover:border-teal-500/30'
                      }`}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        condition === key ? `bg-${detail.color}-500/20` : 'bg-muted/50'
                      }`}>
                        <detail.icon className={`h-5 w-5 ${condition === key ? `text-${detail.color}-500` : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${condition === key ? `text-${detail.color}-500` : 'text-foreground'}`}>{detail.label}</p>
                        <p className="text-[11px] text-muted-foreground">{detail.desc}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">{formatPrice(value)}</p>
                        <p className="text-[10px] text-muted-foreground">{Math.round((value / selectedProduct.originalPrice) * 100)}% of original</p>
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              {/* Value Preview */}
              {condition && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-xl bg-gradient-to-r from-teal-500/10 to-emerald-500/5 border border-teal-500/20 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Estimated Trade-In Value</span>
                    <span className="text-2xl font-bold text-teal-500">{formatPrice(tradeInValue)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs text-muted-foreground">Credit will be applied to your wallet</span>
                  </div>
                </motion.div>
              )}

              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => setStep('select')}>Back</Button>
                <Button
                  className="flex-1 gap-2 bg-teal-500 hover:bg-teal-600 text-white"
                  disabled={!condition || quoteLoading}
                  onClick={handleGetQuote}
                >
                  {quoteLoading ? 'Getting Quote...' : 'Get Quote'} <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Quote */}
          {step === 'quote' && selectedProduct && condition && quote && (
            <motion.div key="quote" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <div className="flex flex-col items-center py-4">
                <motion.div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/10" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                  <DollarSign className="h-8 w-8 text-teal-500" />
                </motion.div>
                <h2 className="mt-3 text-xl font-bold text-foreground">Your Trade-In Quote</h2>
              </div>

              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Product</span>
                    <span className="text-foreground font-medium">{selectedProduct.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Original Price</span>
                    <span className="text-foreground">{formatPrice(selectedProduct.originalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Condition</span>
                    <Badge className={`${condition === 'excellent' ? 'bg-emerald-500/10 text-emerald-500' : condition === 'good' ? 'bg-sky-500/10 text-sky-500' : condition === 'fair' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'}`}>
                      {conditionDetails[condition].label}
                    </Badge>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between">
                    <span className="text-base font-bold text-foreground">Trade-In Value</span>
                    <span className="text-xl font-bold text-teal-500">{formatPrice(quote.tradeInValue)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Shield className="h-3.5 w-3.5 text-teal-500" />
                    Quote valid until {new Date(quote.expiresAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => setStep('condition')}>Back</Button>
                <Button className="flex-1 gap-2 bg-teal-500 hover:bg-teal-600 text-white" onClick={() => {
                  setStep('ship')
                  toast.success('Quote accepted! Ship your item to proceed.')
                }}>
                  Accept Quote <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Ship */}
          {step === 'ship' && (
            <motion.div key="ship" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <div className="flex flex-col items-center py-4">
                <motion.div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/10" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                  <Truck className="h-8 w-8 text-teal-500" />
                </motion.div>
                <h2 className="mt-3 text-xl font-bold text-foreground">Ship Your Item</h2>
                <p className="mt-1 text-sm text-muted-foreground text-center">Follow these steps to complete your trade-in</p>
              </div>

              <div className="space-y-3">
                {[
                  { step: 1, title: 'Pack Your Item', desc: 'Securely pack the item in its original packaging or a sturdy box.' },
                  { step: 2, title: 'Print Shipping Label', desc: 'Download and print the prepaid shipping label from your email.' },
                  { step: 3, title: 'Drop Off', desc: 'Drop the package at any authorized courier location near you.' },
                  { step: 4, title: 'Get Paid', desc: 'After inspection (2-3 days), credit will be added to your wallet.' },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    className="flex gap-3 rounded-xl border border-border/50 bg-card p-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/10 text-teal-500 text-sm font-bold flex-shrink-0">
                      {s.step}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.title}</p>
                      <p className="text-[11px] text-muted-foreground">{s.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Button className="w-full mt-4 gap-2 bg-teal-500 hover:bg-teal-600 text-white" onClick={() => goHome()}>
                Done <CheckCircle2 className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAQ Accordion Section */}
        {step === 'select' && (
          <div className="mt-8">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
              <Info className="h-4 w-4 text-teal-500" /> Frequently Asked Questions
            </h3>
            <div className="space-y-2">
              {faqItems.map((faq, i) => (
                <div key={i} className="overflow-hidden rounded-xl border border-border/50 bg-card">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-3 text-left"
                  >
                    <p className="text-xs font-medium text-foreground pr-2">{faq.q}</p>
                    <motion.div
                      animate={{ rotate: openFaq === i ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-shrink-0"
                    >
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 pb-3">
                          <p className="text-[11px] text-muted-foreground leading-relaxed">{faq.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

