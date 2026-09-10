'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, RotateCcw, Package, CheckCircle, Clock, AlertCircle,
  ChevronDown, ChevronUp, FileText, Shield, Truck, RefreshCw, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { toast } from 'sonner'

interface ReturnTimelineItem {
  status: string
  date: string
  label: string
}

interface ReturnItem {
  id: string
  orderId: string
  productName: string
  productId: string
  reason: string
  description: string
  status: string
  createdAt: string
  updatedAt: string
  refundAmount: number
  timeline: ReturnTimelineItem[]
}

const STATUS_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string; label: string }> = {
  submitted: { icon: FileText, color: 'text-sky-400', bg: 'bg-sky-500/10', label: 'Submitted' },
  reviewing: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Under Review' },
  approved: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Approved' },
  processing: { icon: RefreshCw, color: 'text-violet-400', bg: 'bg-violet-500/10', label: 'Processing' },
  completed: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Completed' },
  rejected: { icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Rejected' },
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
}

export default function ReturnsPage() {
  const { goBack } = useShopRouter()
  const { cart } = useShopStore()
  const [returns, setReturns] = useState<ReturnItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewForm, setShowNewForm] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState('')
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [expandedReturn, setExpandedReturn] = useState<string | null>(null)

  const fetchReturns = useCallback(async () => {
    try {
      const res = await fetch('/api/returns')
      if (res.ok) {
        const data = await res.json()
        setReturns(data.data || [])
      }
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchReturns() }, [fetchReturns])

  const handleSubmitReturn = async () => {
    if (!selectedOrder || !reason) {
      toast.error('Please select an order and provide a reason')
      return
    }
    setSubmitting(true)
    try {
      const cartItem = cart.find((item) => item.productId === selectedOrder)
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: `ORD-${Date.now()}`,
          productId: selectedOrder,
          productName: cartItem?.name || 'Product',
          reason,
          description,
        }),
      })
      if (res.ok) {
        toast.success('Return request submitted!', { description: 'We will review your request within 24 hours' })
        setShowNewForm(false)
        setSelectedOrder('')
        setReason('')
        setDescription('')
        fetchReturns()
      } else {
        toast.error('Failed to submit return request')
      }
    } catch {
      toast.error('Failed to submit return request')
    } finally {
      setSubmitting(false)
    }
  }

  const returnReasons = [
    'Service did not meet expectations',
    'Changed my mind',
    'Duplicate purchase',
    'Found a better alternative',
    'Delivery too slow',
    'Wrong item purchased',
    'Other',
  ]

  return (
    <motion.div
      className="pb-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack} className="flex-shrink-0 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-emerald-400" />
              Returns & Refunds
            </h1>
            <p className="text-[11px] text-muted-foreground">Manage your returns</p>
          </div>
          <Button
            size="sm"
            className="gap-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white text-xs"
            onClick={() => setShowNewForm(true)}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            New Return
          </Button>
        </div>
      </div>

      {/* Active Returns */}
      <div className="px-4 mt-3">
        <h3 className="mb-3 text-sm font-bold text-foreground">Your Returns</h3>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : returns.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
              <RotateCcw className="h-8 w-8 text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-foreground">No returns yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Start a return if you need a refund</p>
          </div>
        ) : (
          <div className="space-y-3">
            {returns.map((ret, index) => {
              const statusConfig = STATUS_CONFIG[ret.status] || STATUS_CONFIG.submitted
              const StatusIcon = statusConfig.icon
              const isExpanded = expandedReturn === ret.id

              return (
                <motion.div
                  key={ret.id}
                  className="overflow-hidden rounded-2xl border border-border/50 bg-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <button
                    className="w-full p-4 text-left"
                    onClick={() => setExpandedReturn(isExpanded ? null : ret.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${statusConfig.bg}`}>
                        <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-foreground line-clamp-1">{ret.productName}</h4>
                        <p className="text-[10px] text-muted-foreground">{ret.orderId}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge className={`text-[9px] ${statusConfig.color} border-0 ${statusConfig.bg}`}>
                            {statusConfig.label}
                          </Badge>
                          {ret.refundAmount > 0 && (
                            <span className="text-[10px] font-medium text-emerald-400">
                              {formatPrice(ret.refundAmount)}
                            </span>
                          )}
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        className="px-4 pb-4"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Separator className="mb-3" />
                        <p className="text-xs text-muted-foreground mb-2">
                          <span className="font-medium text-foreground">Reason:</span> {ret.reason}
                        </p>
                        {ret.description && (
                          <p className="text-xs text-muted-foreground mb-3">
                            <span className="font-medium text-foreground">Details:</span> {ret.description}
                          </p>
                        )}

                        {/* Status Timeline */}
                        <h5 className="text-[11px] font-semibold text-foreground mb-2">Timeline</h5>
                        <div className="space-y-2">
                          {ret.timeline.map((step, i) => {
                            const stepConfig = STATUS_CONFIG[step.status] || STATUS_CONFIG.submitted
                            const StepIcon = stepConfig.icon
                            return (
                              <div key={i} className="flex items-center gap-2">
                                <div className="flex flex-col items-center">
                                  <div className={`flex h-6 w-6 items-center justify-center rounded-full ${stepConfig.bg}`}>
                                    <StepIcon className={`h-3 w-3 ${stepConfig.color}`} />
                                  </div>
                                  {i < ret.timeline.length - 1 && (
                                    <div className="h-3 w-0.5 bg-border/50" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="text-[11px] font-medium text-foreground">{step.label}</p>
                                  <p className="text-[9px] text-muted-foreground">
                                    {new Date(step.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      <Separator className="my-6" />

      {/* Return Policy */}
      <div className="px-4">
        <div className="rounded-2xl border border-border/50 bg-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            Return Policy
          </h3>
          <div className="space-y-2.5">
            {[
              { icon: RotateCcw, label: '30-Day Returns', desc: 'Request a return within 30 days of purchase', color: 'text-emerald-400' },
              { icon: RefreshCw, label: 'Easy Refunds', desc: 'Refunds processed within 3-5 business days', color: 'text-sky-400' },
              { icon: Truck, label: 'Free Return Shipping', desc: 'No additional cost for returning items', color: 'text-amber-400' },
              { icon: Shield, label: 'Satisfaction Guaranteed', desc: 'Full refund if service doesn\'t meet expectations', color: 'text-violet-400' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted">
                    <Icon className={`h-3.5 w-3.5 ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">{item.label}</p>
                    <p className="text-[9px] text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* New Return Modal */}
      <AnimatePresence>
        {showNewForm && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewForm(false)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl border-t border-border bg-background max-h-[85vh] overflow-y-auto"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="mx-auto my-3 h-1 w-10 rounded-full bg-muted" />
              <div className="px-5 pb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-foreground">New Return Request</h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowNewForm(false)} className="text-muted-foreground">
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Select Order */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-foreground mb-2 block">Select Product</label>
                  {cart.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {cart.map((item) => (
                        <button
                          key={item.productId}
                          className={`w-full flex items-center gap-2 rounded-xl border p-2.5 text-left transition-all ${
                            selectedOrder === item.productId
                              ? 'border-primary bg-primary/5'
                              : 'border-border/50 hover:border-primary/30'
                          }`}
                          onClick={() => setSelectedOrder(item.productId)}
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Package className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground line-clamp-1">{item.name}</p>
                            <p className="text-[10px] text-muted-foreground">{formatPrice(item.price)}</p>
                          </div>
                          {selectedOrder === item.productId && (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground rounded-lg bg-muted/50 p-3">
                      No items in cart. Enter a product ID manually.
                    </p>
                  )}
                  <Input
                    placeholder="Or enter product/order ID"
                    value={selectedOrder}
                    onChange={(e) => setSelectedOrder(e.target.value)}
                    className="mt-2 text-xs"
                  />
                </div>

                {/* Reason */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-foreground mb-2 block">Reason</label>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {returnReasons.map((r) => (
                      <button
                        key={r}
                        className={`w-full rounded-lg border p-2.5 text-left text-xs transition-all ${
                          reason === r
                            ? 'border-primary bg-primary/5 text-primary font-medium'
                            : 'border-border/50 text-foreground hover:border-primary/30'
                        }`}
                        onClick={() => setReason(r)}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-foreground mb-2 block">Additional Details (Optional)</label>
                  <textarea
                    className="w-full rounded-xl border border-border/50 bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
                    rows={3}
                    placeholder="Tell us more about why you're returning this..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full gap-2"
                  disabled={!selectedOrder || !reason || submitting}
                  onClick={handleSubmitReturn}
                >
                  {submitting ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    <RotateCcw className="h-4 w-4" />
                  )}
                  {submitting ? 'Submitting...' : 'Submit Return Request'}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
