'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Calculator, CreditCard, TrendingDown,
  Package, ChevronRight, Info, Banknote, Percent,
  Clock, ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import { toast } from 'sonner'

interface TenureOption {
  months: number
  interestRate: number
  monthlyPayment: number
  totalCost: number
  totalInterest: number
}

interface InstallmentProduct {
  id: string
  name: string
  imageUrl: string | null
  category: string
  price: number
  minDownPayment: number
  tenures: TenureOption[]
  eligible: boolean
}

function AnimatedNumber({ value, prefix = '' }: { value: number; prefix?: string }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="font-bold"
    >
      {prefix}{typeof value === 'number' ? (value >= 100 ? formatPrice(value) : `${value}%`) : value}
    </motion.span>
  )
}

export function InstallmentPage() {
  const { goBack, goProduct } = useShopRouter()
  const [products, setProducts] = useState<InstallmentProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<InstallmentProduct | null>(null)
  const [selectedTenure, setSelectedTenure] = useState<number>(12)
  const [downPayment, setDownPayment] = useState(0)
  const [showCalculator, setShowCalculator] = useState(false)
  const [interestRates, setInterestRates] = useState<Record<number, number>>({})

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/installments')
        if (res.ok) {
          const data = await res.json()
          setProducts(Array.isArray(data.data) ? data.data : [])
          setInterestRates(data.interestRates || {})
          if (data.data?.length > 0) {
            setSelectedProduct(data.data[0])
          }
        }
      } catch {
        // silent
      }
      setLoading(false)
    }
    fetchProducts()
  }, [])

  const tenureOptions = [3, 6, 9, 12, 18, 24]

  const calculation = useMemo(() => {
    if (!selectedProduct) return null
    const rate = interestRates[selectedTenure] ?? 6.0
    const principal = selectedProduct.price - downPayment
    const totalWithInterest = principal * (1 + rate / 100)
    const monthlyPayment = Math.round((totalWithInterest / selectedTenure) * 100) / 100
    const totalInterest = totalWithInterest - principal

    return {
      principal: Math.round(principal * 100) / 100,
      totalCost: Math.round(totalWithInterest * 100) / 100,
      monthlyPayment,
      totalInterest: Math.round(totalInterest * 100) / 100,
      interestRate: rate,
    }
  }, [selectedProduct, selectedTenure, downPayment, interestRates])

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
              <CreditCard className="h-5 w-5 text-violet-500" /> Installment Plans
            </h1>
          </div>
        </div>
      </div>

      {/* EMI Calculator Card */}
      <div className="mx-4 mt-3 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-500/15 via-purple-500/10 to-fuchsia-500/5 border border-violet-500/20 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Calculator className="h-4 w-4 text-violet-500" /> EMI Calculator
          </h3>
          <Button variant="ghost" size="sm" className="text-xs text-violet-500" onClick={() => setShowCalculator(!showCalculator)}>
            {showCalculator ? 'Hide' : 'Customize'}
          </Button>
        </div>

        {/* Product selector */}
        {selectedProduct && (
          <div className="flex items-center gap-3 rounded-xl bg-background/50 p-3 mb-3">
            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-muted/50">
              {selectedProduct.imageUrl ? (
                <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="h-full w-full object-cover" />
              ) : (
                <Package className="h-5 w-5 m-auto text-muted-foreground/40" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{selectedProduct.name}</p>
              <p className="text-[11px] text-muted-foreground">{formatPrice(selectedProduct.price)}</p>
            </div>
          </div>
        )}

        <AnimatePresence>
          {showCalculator && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {/* Down Payment */}
              <div className="mb-3">
                <label className="text-[11px] text-muted-foreground mb-1.5 block flex items-center gap-1">
                  <Banknote className="h-3 w-3" /> Down Payment: {formatPrice(downPayment)}
                </label>
                <input
                  type="range"
                  min={0}
                  max={selectedProduct ? selectedProduct.price * 0.5 : 0}
                  step={100}
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  className="w-full accent-violet-500 h-1.5"
                />
                <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5">
                  <span>{formatPrice(0)}</span>
                  <span>{selectedProduct ? formatPrice(selectedProduct.price * 0.5) : formatPrice(0)}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        {calculation && (
          <div className="flex items-center justify-between rounded-xl bg-background/50 p-3">
            <div>
              <p className="text-[10px] text-muted-foreground">Monthly Payment</p>
              <AnimatedNumber value={calculation.monthlyPayment} />
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">{selectedTenure} months  {calculation.interestRate}% interest</p>
              <p className="text-xs text-muted-foreground">Total: {formatPrice(calculation.totalCost + downPayment)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Tenure Selector */}
      <div className="px-4 mt-4">
        <h3 className="text-sm font-bold text-foreground mb-2">Choose Tenure</h3>
        <div className="grid grid-cols-3 gap-2">
          {tenureOptions.map((months) => {
            const rate = interestRates[months] ?? 0
            const isSelected = selectedTenure === months
            return (
              <motion.button
                key={months}
                onClick={() => setSelectedTenure(months)}
                className={`rounded-xl border p-3 text-center transition-all ${
                  isSelected ? 'border-violet-500 bg-violet-500/5' : 'border-border/50 bg-card'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <p className={`text-lg font-bold ${isSelected ? 'text-violet-500' : 'text-foreground'}`}>{months}</p>
                <p className="text-[10px] text-muted-foreground">months</p>
                <Badge className={`text-[9px] mt-1 ${rate === 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted/50 text-muted-foreground'}`}>
                  {rate === 0 ? '0% interest' : `${rate}% APR`}
                </Badge>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Cost Breakdown */}
      {calculation && (
        <div className="px-4 mt-4">
          <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
            <TrendingDown className="h-4 w-4 text-violet-500" /> Cost Breakdown
          </h3>
          <div className="rounded-xl border border-border/50 bg-card p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Product Price</span>
              <span className="text-foreground">{formatPrice(selectedProduct!.price)}</span>
            </div>
            {downPayment > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Down Payment</span>
                <span className="text-emerald-500">-{formatPrice(downPayment)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Principal</span>
              <span className="text-foreground">{formatPrice(calculation.principal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Interest ({calculation.interestRate}%)</span>
              <span className="text-amber-500">+{formatPrice(calculation.totalInterest)}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between text-base">
              <span className="font-bold text-foreground">Total Cost</span>
              <span className="font-bold text-violet-500">{formatPrice(calculation.totalCost + downPayment)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Monthly EMI</span>
              <span className="font-bold text-violet-500">{formatPrice(calculation.monthlyPayment)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      {selectedProduct && (
        <div className="px-4 mt-4">
          <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
            <Percent className="h-4 w-4 text-violet-500" /> Tenure Comparison
          </h3>
          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 px-2 text-left text-muted-foreground font-medium">Tenure</th>
                  <th className="py-2 px-2 text-right text-muted-foreground font-medium">Rate</th>
                  <th className="py-2 px-2 text-right text-muted-foreground font-medium">Monthly</th>
                  <th className="py-2 px-2 text-right text-muted-foreground font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedProduct.tenures.map((t) => (
                  <tr key={t.months} className={`border-b border-border/30 ${selectedTenure === t.months ? 'bg-violet-500/5' : ''}`}>
                    <td className="py-2 px-2 font-medium text-foreground">{t.months} mo</td>
                    <td className="py-2 px-2 text-right text-muted-foreground">{t.interestRate}%</td>
                    <td className="py-2 px-2 text-right font-medium text-violet-500">{formatPrice(t.monthlyPayment)}</td>
                    <td className="py-2 px-2 text-right text-foreground">{formatPrice(t.totalCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Products Available for Installment */}
      <div className="px-4 mt-6">
        <h3 className="text-sm font-bold text-foreground mb-2">Available Products</h3>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
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
            {products.map((product, index) => (
              <motion.button
                key={product.id}
                className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                  selectedProduct?.id === product.id ? 'border-violet-500 bg-violet-500/5' : 'border-border/50 bg-card'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => { setSelectedProduct(product); setDownPayment(0) }}
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
                  <p className="text-xs text-muted-foreground">{product.category}</p>
                  <p className="text-xs text-primary font-bold">{formatPrice(product.price)}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Trust Badges */}
      <div className="px-4 mt-6 grid grid-cols-3 gap-2">
        {[
          { icon: ShieldCheck, label: 'Secure Payments', color: 'emerald' },
          { icon: Clock, label: 'Flexible Tenure', color: 'violet' },
          { icon: CreditCard, label: '0% Available', color: 'sky' },
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center rounded-xl border border-border/50 bg-card p-3 text-center">
            <item.icon className={`h-5 w-5 text-${item.color}-500 mb-1`} />
            <span className="text-[10px] text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Apply CTA */}
      <div className="px-4 mt-4">
        <Button
          className="w-full gap-2 bg-violet-500 hover:bg-violet-600 text-white"
          onClick={() => toast.success('Application submitted!', { description: 'You\'ll receive a confirmation email shortly.' })}
        >
          <CreditCard className="h-4 w-4" /> Apply for Installment
        </Button>
      </div>
    </motion.div>
  )
}
