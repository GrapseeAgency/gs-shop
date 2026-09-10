'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Minus, Plus, Trash2, ShoppingCart, ArrowRight,
  Tag, Truck, Heart, Gift, ChevronDown, ChevronUp, Sparkles,
  X, Check, Package, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { useShopStore, type Product, type WishlistItem } from '@/lib/store'
import { formatPrice } from '@/components/shop/product-card'
import { useShopRouter } from '@/hooks/use-shop-router'
import { toast } from 'sonner'

// --- Types ---
interface CouponResult {
  valid: boolean
  code?: string
  discount?: number
  discountAmount?: number
  type?: string
  rawDiscount?: number
  label?: string
  error?: string
}

interface ShippingMethod {
  id: string
  name: string
  description: string | null
  price: number
  estimatedDays: string | null
  isActive: boolean
  order: number
}

const FREE_SHIPPING_THRESHOLD = 200

// --- Free Shipping Progress Bar ---
function FreeShippingBar({ subtotal }: { subtotal: number }) {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)

  return (
    <motion.div
      className="rounded-2xl border border-border/50 bg-gradient-to-r from-emerald-500/5 to-emerald-500/10 p-3"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {remaining > 0 ? (
        <>
          <div className="flex items-center gap-2 mb-2">
            <Truck className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-medium text-foreground">
              Add <span className="font-bold text-emerald-500">{formatPrice(remaining)}</span> more for free shipping!
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20">
            <Check className="h-3.5 w-3.5 text-emerald-500" />
          </div>
          <span className="text-xs font-medium text-emerald-500">You qualify for free shipping! </span>
        </div>
      )}
    </motion.div>
  )
}

// --- Coupon Input ---
function CouponSection({
  subtotal,
  onCouponApplied,
}: {
  subtotal: number
  onCouponApplied: (coupon: CouponResult) => void
}) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [applied, setApplied] = useState<CouponResult | null>(null)

  const handleApply = async () => {
    if (!code.trim()) {
      toast.error('Please enter a coupon code')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), cartTotal: subtotal }),
      })
      const data: CouponResult = await res.json()
      if (data.valid) {
        setApplied(data)
        onCouponApplied(data)
        toast.success(`Coupon applied: ${data.label}`, {
          description: `You save ${formatPrice(data.discountAmount || 0)}`,
        })
      } else {
        toast.error(data.error || 'Invalid coupon code')
      }
    } catch {
      toast.error('Failed to validate coupon')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = () => {
    setApplied(null)
    setCode('')
    onCouponApplied({ valid: false })
    toast.info('Coupon removed')
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-3">
      <div className="flex items-center gap-2 mb-2">
        <Tag className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">Coupon Code</span>
      </div>
      {applied ? (
        <motion.div
          className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Gift className="h-4 w-4 text-emerald-500" />
          <div className="flex-1">
            <span className="text-xs font-bold text-emerald-500">{applied.code}</span>
            <span className="ml-2 text-xs text-muted-foreground">{applied.label}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={handleRemove}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </motion.div>
      ) : (
        <div className="flex gap-2">
          <Input
            placeholder=""
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="h-9 text-sm bg-background"
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          />
          <Button
            size="sm"
            onClick={handleApply}
            disabled={loading || !code.trim()}
            className="h-9 px-4 bg-primary text-primary-foreground shadow-lg shadow-primary/20"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              'Apply'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

// --- Shipping Method Selector ---
function ShippingSelector({
  onSelect,
  selectedId,
}: {
  onSelect: (method: ShippingMethod) => void
  selectedId: string | null
}) {
  const [methods, setMethods] = useState<ShippingMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const res = await fetch('/api/shipping')
        if (res.ok) {
          const data = await res.json()
          const list: ShippingMethod[] = data.data || []
          setMethods(list)
          if (list.length > 0 && !selectedId) {
            onSelect(list[0])
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchMethods()
  }, [selectedId, onSelect])

  if (loading) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card p-3">
        <div className="flex items-center gap-2 mb-2">
          <Truck className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Shipping Method</span>
        </div>
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  if (methods.length === 0) return null

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-3">
      <button
        className="flex w-full items-center justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Shipping Method</span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="mt-2 space-y-2"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {methods.map((method) => {
              const isSelected = selectedId === method.id
              return (
                <motion.button
                  key={method.id}
                  className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border/50 hover:border-border'
                  }`}
                  onClick={() => onSelect(method)}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                      isSelected ? 'border-primary bg-primary' : 'border-border'
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground">{method.name}</span>
                      {method.estimatedDays && (
                        <Badge variant="secondary" className="h-4 px-1 text-[9px]">
                          {method.estimatedDays} days
                        </Badge>
                      )}
                    </div>
                    {method.description && (
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{method.description}</p>
                    )}
                  </div>
                  <span className={`text-xs font-bold ${method.price === 0 ? 'text-emerald-500' : 'text-foreground'}`}>
                    {method.price === 0 ? 'FREE' : formatPrice(method.price)}
                  </span>
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// --- Suggested Products ---
function SuggestedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { goProduct } = useShopRouter()
  const { addToCart } = useShopStore()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products?featured=true&limit=4')
        if (res.ok) {
          const data = await res.json()
          setProducts(Array.isArray(data) ? data : data.data || [])
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  if (loading) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">You Might Also Like</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-28">
              <div className="aspect-square animate-pulse rounded-xl bg-muted" />
              <div className="mt-2 h-3 w-16 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (products.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-foreground">You Might Also Like</h3>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        {products.map((product, i) => (
          <motion.div
            key={product.id}
            className="flex-shrink-0 w-28"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div
              onClick={() => goProduct(product.id)}
              className="w-full text-left cursor-pointer"
            >
              <div className="relative aspect-square overflow-hidden rounded-xl border border-border/50 bg-card">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package className="h-6 w-6 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <h4 className="mt-1.5 text-[11px] font-medium text-foreground line-clamp-1">{product.name}</h4>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary">{formatPrice(product.price)}</span>
                <button
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    addToCart({
                      productId: product.id,
                      name: product.name,
                      price: product.price,
                      quantity: 1,
                      imageUrl: product.imageUrl,
                    })
                    toast.success('Added to cart!')
                  }}
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// --- Main Cart Page ---
export default function CartPage() {
  const { goBack, goCheckout, goCategory, goWishlist } = useShopRouter()
  const {
    cart, removeFromCart, updateQuantity, getCartTotal, clearCart,
    addToWishlist, isInWishlist, wishlist,
  } = useShopStore()
  const subtotal = getCartTotal()

  const [coupon, setCoupon] = useState<CouponResult | null>(null)
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod | null>(null)

  const discountAmount = useMemo(() => {
    if (!coupon?.valid) return 0
    return coupon.discountAmount || 0
  }, [coupon])

  const shippingCost = useMemo(() => {
    if (!shippingMethod) return 0
    // Free shipping if over threshold
    if (subtotal >= FREE_SHIPPING_THRESHOLD && shippingMethod.price > 0) return 0
    return shippingMethod.price
  }, [shippingMethod, subtotal])

  const total = useMemo(() => {
    return Math.max(0, subtotal - discountAmount + shippingCost)
  }, [subtotal, discountAmount, shippingCost])

  const handleCouponApplied = (result: CouponResult) => {
    setCoupon(result.valid ? result : null)
  }

  const handleShippingSelect = (method: ShippingMethod) => {
    setShippingMethod(method)
  }

  const handleSaveForLater = (item: typeof cart[0]) => {
    if (!isInWishlist(item.productId)) {
      addToWishlist({
        productId: item.productId,
        name: item.name,
        price: item.price,
        comparePrice: null,
        imageUrl: item.imageUrl,
      })
      toast.success('Moved to wishlist', { description: `${item.name} saved for later` })
    } else {
      toast.info('Already in your wishlist')
    }
    removeFromCart(item.id)
  }

  return (
    <motion.div
      className="px-4 py-2"
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
            <ShoppingCart className="h-5 w-5 text-primary" />
            Your Cart
          </h1>
          <p className="text-xs text-muted-foreground">
            {cart.length === 0
              ? 'Your cart is empty'
              : `${cart.length} item${cart.length > 1 ? 's' : ''} in your cart`}
          </p>
        </div>
        {cart.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-destructive hover:text-destructive"
            onClick={clearCart}
          >
            Clear All
          </Button>
        )}
      </div>

      {cart.length === 0 ? (
        <motion.div
          className="flex flex-col items-center justify-center py-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <ShoppingCart className="h-10 w-10 text-muted-foreground" />
          </div>
          <p className="mb-2 text-sm font-medium text-foreground">Cart is empty</p>
          <p className="mb-4 text-xs text-muted-foreground">
            Browse our products and add items to your cart
          </p>
          <Button
            onClick={() => goCategory()}
            variant="outline"
            className="gap-2"
          >
            Start Shopping
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      ) : (
        <>
          {/* Free Shipping Progress Bar */}
          <div className="mb-3">
            <FreeShippingBar subtotal={subtotal} />
          </div>

          {/* Cart Items */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex gap-3 rounded-2xl border border-border/50 bg-card p-3"
                >
                  {/* Item image/placeholder */}
                  <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl opacity-40"></span>
                    )}
                  </div>

                  {/* Item details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-medium text-foreground line-clamp-1">
                        {item.name}
                      </h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <span className="text-sm font-semibold text-primary">
                      {formatPrice(item.price)}
                    </span>

                    {/* Quantity controls + save for later */}
                    <div className="mt-auto flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium text-foreground">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <span className="ml-auto text-sm font-medium text-foreground">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>

                    {/* Save for Later */}
                    <button
                      className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors self-start"
                      onClick={() => handleSaveForLater(item)}
                    >
                      <Heart className="h-3 w-3" />
                      Save for later
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <Separator className="my-4" />

          {/* Coupon Section */}
          <div className="mb-3">
            <CouponSection subtotal={subtotal} onCouponApplied={handleCouponApplied} />
          </div>

          {/* Shipping Method Selector */}
          <div className="mb-3">
            <ShippingSelector
              onSelect={handleShippingSelect}
              selectedId={shippingMethod?.id || null}
            />
          </div>

          <Separator className="my-4" />

          {/* Order Summary */}
          <div className="rounded-2xl border border-border/50 bg-card p-4">
            <h3 className="mb-3 text-sm font-bold text-foreground">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal ({cart.length} items)</span>
                <span className="text-sm font-medium text-foreground">{formatPrice(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <motion.div
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <div className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-sm text-emerald-500">Discount</span>
                    {coupon?.code && (
                      <code className="rounded bg-emerald-500/10 px-1 py-0.5 text-[9px] font-mono text-emerald-500">
                        {coupon.code}
                      </code>
                    )}
                  </div>
                  <span className="text-sm font-medium text-emerald-500">-{formatPrice(discountAmount)}</span>
                </motion.div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Shipping</span>
                <span className={`text-sm font-medium ${shippingCost === 0 ? 'text-emerald-500' : 'text-foreground'}`}>
                  {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}
                </span>
              </div>

              <Separator />

              <div className="flex items-center justify-between pt-1">
                <span className="text-base font-bold text-foreground">Total</span>
                <span className="text-lg font-bold text-primary">{formatPrice(total)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 p-2">
                  <Gift className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-[11px] text-emerald-500 font-medium">
                    You&apos;re saving {formatPrice(discountAmount + (shippingCost === 0 && subtotal >= FREE_SHIPPING_THRESHOLD ? shippingMethod?.price || 0 : 0))} on this order!
                  </span>
                </div>
              )}
            </div>

            <Button
              onClick={() => goCheckout()}
              className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-semibold shadow-lg shadow-primary/20"
              size="lg"
            >
              Review Order & Pay
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCart}
              className="mt-2 w-full text-muted-foreground hover:text-destructive"
            >
              Clear Cart
            </Button>
          </div>

          <Separator className="my-4" />

          {/* Suggested Products */}
          <div className="mb-4">
            <SuggestedProducts />
          </div>

          {/* Wishlist Quick Access */}
          {wishlist.length > 0 && (
            <motion.div
              className="mb-4 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-rose-400" />
                  <span className="text-xs text-foreground">
                    <span className="font-bold">{wishlist.length}</span> item{wishlist.length !== 1 ? 's' : ''} in your wishlist
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary h-7"
                  onClick={goWishlist}
                >
                  View Wishlist
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  )
}
