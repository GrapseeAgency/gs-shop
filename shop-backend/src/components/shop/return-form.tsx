'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, Upload, AlertCircle, CheckCircle, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface Order {
  id: string
  orderNumber: string
  items: { productId: string; productName: string; price: number }[]
}

const returnReasons = [
  { value: 'defective', label: 'Defective / Damaged item' },
  { value: 'wrong_item', label: 'Wrong item received' },
  { value: 'not_as_described', label: 'Not as described' },
  { value: 'changed_mind', label: 'Changed my mind' },
  { value: 'other', label: 'Other' },
]

interface ReturnFormProps {
  onSuccess?: (data: Record<string, unknown>) => void
  className?: string
}

export function ReturnForm({ onSuccess, className = '' }: ReturnFormProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState('')
  const [selectedProduct, setSelectedProduct] = useState('')
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [photoUploaded, setPhotoUploaded] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  // Fetch user orders
  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        const orderList = Array.isArray(data) ? data : data.orders || []
        const mapped: Order[] = orderList.map((o: Record<string, unknown>) => ({
          id: o.id as string,
          orderNumber: (o.orderNumber as string) || o.id as string,
          items: Array.isArray(o.items)
            ? o.items.map((it: Record<string, unknown>) => ({
                productId: (it.productId as string) || '',
                productName: (it.productName as string) || (it.name as string) || 'Unknown',
                price: (it.price as number) || 0,
              }))
            : [],
        }))
        setOrders(mapped)
      })
      .catch(() => {})
  }, [])

  const selectedOrderData = orders.find((o) => o.id === selectedOrder)
  const canSubmit = selectedOrder && selectedProduct && reason && description.trim().length >= 10

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setError('')

    try {
      const productItem = selectedOrderData?.items.find((i) => i.productId === selectedProduct)
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder,
          productId: selectedProduct,
          productName: productItem?.productName || '',
          reason,
          description,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setSubmitted(true)
        toast.success('Return request submitted!', {
          description: 'We will review your request within 24 hours.',
        })
        onSuccess?.(data)
      } else {
        setError(data.error || 'Failed to submit return request')
        toast.error('Failed to submit return request')
      }
    } catch {
      setError('Network error. Please try again.')
      toast.error('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Success state
  if (submitted) {
    return (
      <motion.div
        className={`flex flex-col items-center justify-center py-8 text-center ${className}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
          <CheckCircle className="h-8 w-8 text-emerald-400" />
        </div>
        <h3 className="text-base font-bold text-foreground">Return Request Submitted</h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-[260px]">
          We&apos;ll review your request and get back to you within 24 hours.
        </p>
        <Button
          variant="outline"
          className="mt-4 text-xs"
          onClick={() => {
            setSubmitted(false)
            setSelectedOrder('')
            setSelectedProduct('')
            setReason('')
            setDescription('')
            setPhotoUploaded(false)
          }}
        >
          Submit Another Return
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      className={`space-y-4 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/15">
          <RotateCcw className="h-4 w-4 text-rose-400" />
        </div>
        <h3 className="text-sm font-bold text-foreground">Request a Return</h3>
      </div>

      {/* Order selector */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-foreground">Select Order</label>
        <div className="relative">
          <select
            value={selectedOrder}
            onChange={(e) => {
              setSelectedOrder(e.target.value)
              setSelectedProduct('')
            }}
            className="w-full appearance-none rounded-xl border border-border/50 bg-background px-3 py-2.5 text-xs text-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/30"
          >
            <option value="">Choose an order...</option>
            {orders.map((order) => (
              <option key={order.id} value={order.id}>
                {order.orderNumber} ({order.items.length} item{order.items.length !== 1 ? 's' : ''})
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      {/* Product selector */}
      <AnimatePresence>
        {selectedOrderData && selectedOrderData.items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <label className="mb-1.5 block text-xs font-medium text-foreground">Select Product</label>
            <div className="relative">
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full appearance-none rounded-xl border border-border/50 bg-background px-3 py-2.5 text-xs text-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/30"
              >
                <option value="">Choose a product...</option>
                {selectedOrderData.items.map((item) => (
                  <option key={item.productId} value={item.productId}>
                    {item.productName}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reason dropdown */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-foreground">Reason for Return</label>
        <div className="relative">
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full appearance-none rounded-xl border border-border/50 bg-background px-3 py-2.5 text-xs text-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/30"
          >
            <option value="">Select a reason...</option>
            {returnReasons.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-foreground">
          Description
          <span className="ml-1 text-[9px] text-muted-foreground">(min 10 characters)</span>
        </label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the issue in detail..."
          className="min-h-[80px] resize-none rounded-xl border-border/50 text-xs focus:border-primary"
          rows={3}
        />
        <p className="mt-1 text-right text-[9px] text-muted-foreground">
          {description.length}/500
        </p>
      </div>

      {/* Photo upload placeholder */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-foreground">Photo Evidence</label>
        <button
          onClick={() => {
            setPhotoUploaded(!photoUploaded)
            if (!photoUploaded) toast.success('Photo uploaded (simulated)')
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/50 p-4 text-xs text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/5 active:scale-[0.98]"
        >
          <Upload className="h-4 w-4" />
          {photoUploaded ? ' Photo uploaded' : 'Upload a photo (optional)'}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <motion.div
          className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
          <span className="text-[11px] text-destructive">{error}</span>
        </motion.div>
      )}

      {/* Submit button */}
      <Button
        className="w-full gap-2"
        onClick={handleSubmit}
        disabled={!canSubmit || submitting}
      >
        <RotateCcw className="h-4 w-4" />
        {submitting ? 'Submitting...' : 'Submit Return Request'}
      </Button>
    </motion.div>
  )
}
