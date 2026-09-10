'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  ShoppingBag,
  RefreshCw,
  ChevronRight,
  AlertCircle,
  XCircle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'

interface OrderItem {
  id: string
  orderId: string
  productId: string
  productName: string
  price: number
  quantity: number
  imageUrl: string | null
}

interface Order {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  total: number
  discount: number
  couponCode: string | null
  status: string
  paymentMethod: string | null
  paymentId: string | null
  notes: string | null
  shippingAddress: string | null
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: 'Pending', color: 'text-amber-500', bgColor: 'bg-amber-500/10 border-amber-500/20', icon: Clock },
  'in-progress': { label: 'In Progress', color: 'text-sky-500', bgColor: 'bg-sky-500/10 border-sky-500/20', icon: Truck },
  processing: { label: 'Processing', color: 'text-sky-500', bgColor: 'bg-sky-500/10 border-sky-500/20', icon: Loader2 },
  completed: { label: 'Completed', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
  delivered: { label: 'Delivered', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'text-red-500', bgColor: 'bg-red-500/10 border-red-500/20', icon: XCircle },
}

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.pending
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function formatTime(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

// Gradient colors for product thumbnail fallbacks
const gradientColors = [
  'from-emerald-500/20 to-teal-600/20',
  'from-violet-500/20 to-purple-600/20',
  'from-amber-500/20 to-orange-600/20',
  'from-rose-500/20 to-pink-600/20',
  'from-cyan-500/20 to-blue-600/20',
]

export function OrdersView() {
  const { lastOrderId } = useShopStore()
  const { goBack, goCategory, goOrderDetail, goContact } = useShopRouter()

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [email, setEmail] = useState('')
  const [emailSaved, setEmailSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load saved email from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('grapsee-orders-email')
      if (saved) {
        setEmail(saved)
        setEmailSaved(true)
      }
    } catch {
      // ignore
    }
  }, [])

  const fetchOrders = useCallback(async (userEmail?: string) => {
    const queryEmail = userEmail || email
    if (!queryEmail.trim()) {
      setLoading(false)
      return
    }

    try {
      setError(null)
      const res = await fetch(`/api/orders?email=${encodeURIComponent(queryEmail.trim())}`)
      if (res.ok) {
        const data = await res.json()
        setOrders(Array.isArray(data) ? data : [])
      } else {
        setError('Failed to fetch orders')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [email])

  useEffect(() => {
    if (emailSaved && email.trim()) {
      fetchOrders(email)
    } else {
      setLoading(false)
    }
  }, [emailSaved, email, fetchOrders])

  const handleSaveEmail = () => {
    if (!email.trim()) return
    try {
      localStorage.setItem('grapsee-orders-email', email.trim())
    } catch {
      // ignore
    }
    setEmailSaved(true)
    setLoading(true)
    fetchOrders(email)
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchOrders()
  }

  const handleChangeEmail = () => {
    setEmailSaved(false)
    setOrders([])
  }

  // Loading state
  if (loading) {
    return (
      <motion.div
        className="px-4 py-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="mb-4 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => goBack()}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">My Orders</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-3 text-sm text-muted-foreground">Loading your orders...</p>
        </div>
      </motion.div>
    )
  }

  // Email entry form
  if (!emailSaved) {
    return (
      <motion.div
        className="px-4 py-2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-4 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => goBack()}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">My Orders</h1>
        </div>

        <motion.div
          className="flex flex-col items-center py-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
            <Package className="h-10 w-10 text-primary" />
          </div>
          <h3 className="mb-1 text-base font-semibold text-foreground">Track Your Orders</h3>
          <p className="mb-6 max-w-xs text-sm text-muted-foreground">
            Enter the email you used when placing your order to view your order history.
          </p>

          <div className="w-full max-w-sm space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="order-email" className="text-sm text-muted-foreground">
                Email Address
              </Label>
              <Input
                id="order-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveEmail()}
                className="h-11 bg-card"
              />
            </div>
            <Button
              onClick={handleSaveEmail}
              disabled={!email.trim()}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 h-11"
            >
              View Orders
            </Button>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="px-4 py-2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => goBack()}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground">My Orders</h1>
            <p className="text-[11px] text-muted-foreground">{email}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleChangeEmail}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <AlertCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <motion.div
          className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm text-red-500">{error}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            className="mt-2 border-red-500/30 text-red-500 hover:bg-red-500/10"
          >
            Try Again
          </Button>
        </motion.div>
      )}

      {/* Empty State */}
      {!error && orders.length === 0 && (
        <motion.div
          className="flex flex-col items-center justify-center py-16 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
            <Package className="h-10 w-10 text-primary" />
          </div>
          <h3 className="mb-1 text-base font-semibold text-foreground">No orders found</h3>
          <p className="mb-4 max-w-xs text-sm text-muted-foreground">
            No orders were found for this email address. Start shopping to place your first order!
          </p>
          <Button
            onClick={() => goCategory()}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
          >
            <ShoppingBag className="h-4 w-4" />
            Start Shopping
          </Button>
        </motion.div>
      )}

      {/* Orders List */}
      {!error && orders.length > 0 && (
        <div className="space-y-3">
          {/* Stats bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <div className="flex-shrink-0 rounded-full bg-primary/10 px-3 py-1.5">
              <span className="text-[11px] font-medium text-primary">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
            </div>
            {orders.filter((o) => o.status === 'pending' || o.status === 'processing' || o.status === 'in-progress').length > 0 && (
              <div className="flex-shrink-0 rounded-full bg-amber-500/10 px-3 py-1.5">
                <span className="text-[11px] font-medium text-amber-500">
                  {orders.filter((o) => o.status === 'pending' || o.status === 'processing' || o.status === 'in-progress').length} active
                </span>
              </div>
            )}
            {orders.filter((o) => o.status === 'completed' || o.status === 'delivered').length > 0 && (
              <div className="flex-shrink-0 rounded-full bg-emerald-500/10 px-3 py-1.5">
                <span className="text-[11px] font-medium text-emerald-500">
                  {orders.filter((o) => o.status === 'completed' || o.status === 'delivered').length} completed
                </span>
              </div>
            )}
          </div>

          {/* Pull to refresh indicator */}
          <AnimatePresence>
            {refreshing && (
              <motion.div
                className="flex items-center justify-center gap-2 py-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">Refreshing...</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Order Cards */}
          <AnimatePresence mode="popLayout">
            {orders.map((order, index) => {
              const statusConfig = getStatusConfig(order.status)
              const StatusIcon = statusConfig.icon
              const orderNumber = order.id.slice(-8).toUpperCase()
              const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
              const firstItem = order.items[0]
              const extraItems = order.items.length - 1

              return (
                <motion.button
                  key={order.id}
                  className="group w-full rounded-2xl border border-border/50 bg-card p-4 text-left transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98]"
                  onClick={() => goOrderDetail(order.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Order Header */}
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-foreground">Order #{orderNumber}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatDate(order.createdAt)}  {formatTime(order.createdAt)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`gap-1 border ${statusConfig.bgColor} ${statusConfig.color}`}
                    >
                      <StatusIcon className={`h-3 w-3 ${order.status === 'processing' ? 'animate-spin' : ''}`} />
                      <span className="text-[10px] font-medium">{statusConfig.label}</span>
                    </Badge>
                  </div>

                  {/* Items Preview */}
                  <div className="mb-3 flex items-center gap-2">
                    {/* Thumbnails */}
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 4).map((item, i) => {
                        const gradientIdx =
                          item.productName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) %
                          gradientColors.length
                        return (
                          <div
                            key={item.id}
                            className={`relative h-10 w-10 overflow-hidden rounded-lg border-2 border-card bg-gradient-to-br ${gradientColors[gradientIdx]}`}
                            style={{ zIndex: 4 - i }}
                          >
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.productName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <span className="text-xs opacity-40"></span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Items info */}
                    <div className="flex-1 min-w-0">
                      {firstItem && (
                        <p className="text-xs font-medium text-foreground truncate">
                          {firstItem.productName}
                        </p>
                      )}
                      <p className="text-[11px] text-muted-foreground">
                        {itemCount} item{itemCount !== 1 ? 's' : ''}
                        {extraItems > 0 && ` (+${extraItems} more)`}
                      </p>
                    </div>

                    {/* Total */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-primary">{formatPrice(order.total)}</p>
                      {order.discount > 0 && (
                        <p className="text-[10px] text-emerald-500">-{formatPrice(order.discount)} saved</p>
                      )}
                    </div>
                  </div>

                  {/* Bottom action hint */}
                  <div className="flex items-center justify-between border-t border-border/30 pt-2">
                    <div className="flex items-center gap-1.5">
                      {order.couponCode && (
                        <Badge variant="secondary" className="text-[9px] bg-primary/10 text-primary">
                          {order.couponCode}
                        </Badge>
                      )}
                      {order.paymentMethod && (
                        <span className="text-[10px] text-muted-foreground capitalize">
                          {order.paymentMethod === 'cash' ? ' Cash' : order.paymentMethod === 'bank' ? ' Bank' : ' Online'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 text-primary">
                      <span className="text-[10px] font-medium">View Details</span>
                      <ChevronRight className="h-3 w-3" />
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </AnimatePresence>

          {/* Help */}
          <div className="rounded-xl bg-gradient-to-r from-primary/5 to-transparent p-3 text-center">
            <p className="text-xs text-muted-foreground mb-2">Need help with your order?</p>
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-primary/20 text-primary hover:bg-primary/10"
              onClick={() => goContact()}
            >
              Contact Support
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
