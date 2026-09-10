'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Tag,
  Shield,
  Truck,
  Clock,
  CheckCircle2,
  CreditCard,
  Banknote,
  Smartphone,
  Wallet,
  MapPin,
  Package,
  Plus,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import { toast } from 'sonner'

interface CouponData {
  discount: number
  label: string
}

interface ShippingMethod {
  id: string
  name: string
  description: string | null
  price: number
  estimatedDays: string | null
}

interface AddressData {
  id: string
  label: string
  name: string
  phone: string
  address: string
  city: string
  area: string | null
  isDefault: boolean
}

const FALLBACK_COUPONS: Record<string, { discount: number; label: string }> = {
  SAVE10: { discount: 0.10, label: '10% off' },
  SAVE20: { discount: 0.20, label: '20% off' },
  WELCOME: { discount: 0.15, label: '15% off welcome' },
}

const STEPS = [
  { id: 1, label: 'Cart', icon: Package },
  { id: 2, label: 'Shipping', icon: Truck },
  { id: 3, label: 'Payment', icon: CreditCard },
  { id: 4, label: 'Confirm', icon: CheckCircle2 },
]

export function CheckoutForm() {
  const { cart, getCartTotal, clearCart } = useShopStore()
  const { goOrderSuccess, goBack } = useShopRouter()
  const subtotal = getCartTotal()

  const [currentStep, setCurrentStep] = useState(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState<string | null>(null)
  const [couponData, setCouponData] = useState<CouponData | null>(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [orderNotes, setOrderNotes] = useState('')
  const [loading, setLoading] = useState(false)

  // Shipping
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([])
  const [selectedShipping, setSelectedShipping] = useState<string>('')
  const [shippingCost, setShippingCost] = useState(0)
  const [loadingShipping, setLoadingShipping] = useState(true)

  // Addresses
  const [addresses, setAddresses] = useState<AddressData[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string>('')
  const [loadingAddresses, setLoadingAddresses] = useState(true)
  const [showNewAddress, setShowNewAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({ label: 'home', name: '', phone: '', address: '', city: '', area: '', postalCode: '' })

  // Fetch shipping methods
  useEffect(() => {
    const fetchShipping = async () => {
      try {
        const res = await fetch('/api/shipping')
        if (res.ok) {
          const data = await res.json()
          const methods = data.data || []
          setShippingMethods(methods)
          if (methods.length > 0) {
            setSelectedShipping(methods[0].id)
            setShippingCost(methods[0].price || 0)
          }
        }
      } catch {
        // Fallback
        
        
        
      } finally {
        setLoadingShipping(false)
      }
    }
    fetchShipping()
  }, [])

  // Fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await fetch('/api/addresses?userId=user-1')
        if (res.ok) {
          const data = await res.json()
          const addrs = data.data || []
          setAddresses(addrs)
          const defaultAddr = addrs.find((a: AddressData) => a.isDefault)
          if (defaultAddr) {
            setSelectedAddress(defaultAddr.id)
            setName(defaultAddr.name)
            setPhone(defaultAddr.phone)
          }
        }
      } catch {
        // fallback
      } finally {
        setLoadingAddresses(false)
      }
    }
    fetchAddresses()
  }, [])

  const discountAmount = couponData ? subtotal * couponData.discount : 0
  const total = subtotal - discountAmount + shippingCost

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase()
    if (!code) return

    setValidatingCoupon(true)
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, cartTotal: subtotal }),
      })
      const data = await res.json()

      if (data.valid) {
        setCouponApplied(code)
        setCouponData({ discount: data.discount, label: data.label })
        toast.success(`Coupon applied: ${data.label}`)
      } else {
        toast.error(data.error || 'Invalid coupon code')
      }
    } catch {
      if (FALLBACK_COUPONS[code]) {
        setCouponApplied(code)
        setCouponData(FALLBACK_COUPONS[code])
        toast.success(`Coupon applied: ${FALLBACK_COUPONS[code].label}`)
      } else {
        toast.error('Invalid coupon code')
      }
    } finally {
      setValidatingCoupon(false)
    }
  }

  const handleAddAddress = async () => {
    if (!newAddress.name || !newAddress.phone || !newAddress.address || !newAddress.city) {
      toast.error('Please fill in all required fields')
      return
    }
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'user-1', ...newAddress, isDefault: addresses.length === 0 }),
      })
      if (res.ok) {
        const addr = await res.json()
        setAddresses((prev) => [...prev, addr])
        setSelectedAddress(addr.id)
        setName(addr.name)
        setPhone(addr.phone)
        setShowNewAddress(false)
        toast.success('Address added successfully')
      }
    } catch {
      toast.error('Failed to add address')
    }
  }

  const canProceedToShipping = cart.length > 0
  const canProceedToPayment = name.trim() !== '' && email.trim() !== '' && (selectedAddress || (newAddress.name && newAddress.address))
  const canProceedToConfirm = paymentMethod !== ''

  const handleNext = () => {
    if (currentStep === 1 && !canProceedToShipping) {
      toast.error('Your cart is empty')
      return
    }
    if (currentStep === 2 && !canProceedToPayment) {
      toast.error('Please fill in shipping details')
      return
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4))
  }

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !email.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name.trim(),
          customerEmail: email.trim(),
          customerPhone: phone.trim() || undefined,
          paymentMethod,
          shippingMethodId: selectedShipping || undefined,
          notes: orderNotes.trim() || undefined,
          items: cart.map((item) => ({
            productId: item.productId,
            productName: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          couponCode: couponApplied || undefined,
          discountAmount: discountAmount || undefined,
          shippingCost: shippingCost || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create order')
      }

      const order = await response.json()

      // Handle payment gateway redirect
      if (paymentMethod === 'sslcommerz') {
        const payRes = await fetch('/api/payment/sslcommerz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            amount: order.total,
            currency: 'BDT',
            customerName: name.trim(),
            customerEmail: email.trim(),
            customerPhone: phone.trim() || undefined,
          }),
        })
        const payData = await payRes.json()
        if (payData.gatewayPageURL) {
          clearCart()
          window.location.href = payData.gatewayPageURL
          return
        }
        toast.error(payData.error || 'SSLCommerz initiation failed')
        return
      }

      if (paymentMethod === 'stripe') {
        const payRes = await fetch('/api/payment/stripe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            amount: order.total,
            currency: 'usd',
            customerEmail: email.trim(),
            customerName: name.trim(),
          }),
        })
        const payData = await payRes.json()
        if (payData.clientSecret) {
          clearCart()
          // Redirect to Stripe checkout page
          goOrderSuccess(order.id)
          toast.info('Redirecting to Stripe payment...')
          return
        }
        toast.error(payData.error || 'Stripe initiation failed')
        return
      }

      clearCart()
      toast.success('Order placed successfully!')
      goOrderSuccess(order.id)
    } catch {
      toast.error('Failed to place order', {
        description: 'Try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="px-4 py-4 pb-8"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => goBack()} className="flex-shrink-0 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold text-foreground">Checkout</h1>
      </div>

      {/* Step Progress Indicator */}
      <div className="mb-5">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <motion.div
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                      isCompleted ? 'bg-primary text-primary-foreground' :
                      isActive ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' :
                      'bg-muted text-muted-foreground'
                    }`}
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <StepIcon className="h-4 w-4" />
                    )}
                  </motion.div>
                  <span className={`text-[9px] mt-1 font-medium ${isActive ? 'text-primary' : isCompleted ? 'text-primary' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 mt-[-14px] rounded-full transition-colors ${currentStep > step.id ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Order Summary Sidebar (always visible) */}
      <div className="mb-4 rounded-2xl border border-border/50 bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Order Summary</h3>
        <div className="max-h-32 space-y-2 overflow-y-auto custom-scrollbar">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground line-clamp-1 flex-1 mr-2">
                {item.name}  {item.quantity}
              </span>
              <span className="font-medium text-foreground flex-shrink-0">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <Separator className="my-3" />

        {/* Coupon Code */}
        <div className="mb-3">
          <Label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
            <Tag className="h-3 w-3" />
            Coupon Code
          </Label>
          {couponApplied ? (
            <div className="flex items-center justify-between rounded-lg bg-primary/10 p-2.5">
              <div>
                <span className="text-xs font-semibold text-primary">{couponApplied}</span>
                <span className="ml-2 text-[10px] text-muted-foreground">{couponData?.label}</span>
              </div>
              <button
                className="text-[10px] text-destructive hover:underline"
                onClick={() => {
                  setCouponApplied(null)
                  setCouponData(null)
                  setCouponCode('')
                }}
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder=""
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 h-9 text-xs bg-card"
              />
              <Button
                size="sm"
                variant="outline"
                className="h-9 text-xs border-primary/30 text-primary hover:bg-primary/10"
                onClick={handleApplyCoupon}
                disabled={!couponCode.trim() || validatingCoupon}
              >
                {validatingCoupon ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Apply'}
              </Button>
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-primary">Discount ({couponData?.label})</span>
              <span className="font-medium text-primary">-{formatPrice(discountAmount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-medium text-foreground">
              {shippingCost === 0 ? <span className="text-primary">Free</span> : formatPrice(shippingCost)}
            </span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Total</span>
            <span className="text-xl font-bold text-primary">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {/* Step 1: Cart Review */}
        {currentStep === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            <div className="space-y-3 mb-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 rounded-xl border border-border/50 bg-card p-3">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex-shrink-0">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <Package className="h-6 w-6 text-muted-foreground/30" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground line-clamp-1">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    <p className="text-sm font-bold text-primary mt-0.5">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex flex-1 items-center gap-1.5 rounded-lg bg-muted/30 p-2">
                <Shield className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                <span className="text-[9px] text-muted-foreground">Secure</span>
              </div>
              <div className="flex flex-1 items-center gap-1.5 rounded-lg bg-muted/30 p-2">
                <Truck className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                <span className="text-[9px] text-muted-foreground">Fast Ship</span>
              </div>
              <div className="flex flex-1 items-center gap-1.5 rounded-lg bg-muted/30 p-2">
                <Clock className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                <span className="text-[9px] text-muted-foreground">Guarantee</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Shipping */}
        {currentStep === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            <h3 className="text-sm font-semibold text-foreground mb-3">Shipping Address</h3>

            {/* Saved Addresses */}
            {loadingAddresses ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : addresses.length > 0 ? (
              <RadioGroup value={selectedAddress} onValueChange={(val) => {
                setSelectedAddress(val)
                const addr = addresses.find((a) => a.id === val)
                if (addr) { setName(addr.name); setPhone(addr.phone) }
              }} className="space-y-2 mb-3">
                {addresses.map((addr) => (
                  <div key={addr.id} className={`flex items-start gap-2 rounded-xl border p-3 transition-colors ${selectedAddress === addr.id ? 'border-primary/50 bg-primary/5' : 'border-border/50 bg-card'}`}>
                    <RadioGroupItem value={addr.id} id={addr.id} className="mt-1" />
                    <Label htmlFor={addr.id} className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs font-semibold text-foreground">{addr.name}</span>
                        <Badge className={`h-4 px-1.5 text-[8px] ${addr.isDefault ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          {addr.label}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{addr.address}, {addr.city}</p>
                      <p className="text-[10px] text-muted-foreground">{addr.phone}</p>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : null}

            {/* Add New Address Toggle */}
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1 text-xs mb-3 border-dashed"
              onClick={() => setShowNewAddress(!showNewAddress)}
            >
              <Plus className="h-3 w-3" />
              Add New Address
            </Button>

            {/* New Address Form */}
            {showNewAddress && (
              <motion.div
                className="rounded-xl border border-primary/20 bg-card p-3 mb-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Label</Label>
                      <select value={newAddress.label} onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })} className="w-full h-8 rounded-md border border-border bg-background px-2 text-xs">
                        <option value="home">Home</option>
                        <option value="office">Office</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">City *</Label>
                      <Input value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className="h-8 text-xs" placeholder="" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Full Name *</Label>
                    <Input value={newAddress.name} onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })} className="h-8 text-xs" placeholder="" />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Phone *</Label>
                    <Input value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} className="h-8 text-xs" placeholder="" type="tel" />
                  </div>
                  <div>
                    <Label className="text-[10px] text-muted-foreground">Address *</Label>
                    <Input value={newAddress.address} onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })} className="h-8 text-xs" placeholder="" />
                  </div>
                  <Button size="sm" className="text-xs h-8 w-full" onClick={handleAddAddress}>Save Address</Button>
                </div>
              </motion.div>
            )}

            <Separator className="my-4" />

            {/* Contact Info */}
            <h3 className="text-sm font-semibold text-foreground mb-3">Contact Information</h3>
            <div className="space-y-3 mb-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input id="name" placeholder="" value={name} onChange={(e) => setName(e.target.value)} required className="bg-card" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input id="email" type="email" placeholder="" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-card" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone-checkout" className="text-foreground">
                  Phone <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input id="phone-checkout" type="tel" placeholder="" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-card" />
              </div>
            </div>

            <Separator className="my-4" />

            {/* Shipping Method */}
            <h3 className="text-sm font-semibold text-foreground mb-3">Shipping Method</h3>
            {loadingShipping ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <RadioGroup value={selectedShipping} onValueChange={(val) => {
                setSelectedShipping(val)
                const method = shippingMethods.find((m) => m.id === val)
                setShippingCost(method?.price || 0)
              }} className="space-y-2 mb-4">
                {shippingMethods.map((method) => (
                  <div key={method.id} className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${selectedShipping === method.id ? 'border-primary/50 bg-primary/5' : 'border-border/50 bg-card'}`}>
                    <RadioGroupItem value={method.id} id={`ship-${method.id}`} />
                    <Label htmlFor={`ship-${method.id}`} className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-foreground">{method.name}</span>
                          <p className="text-[10px] text-muted-foreground">{method.description || method.estimatedDays}</p>
                        </div>
                        <span className="text-sm font-bold text-foreground">
                          {method.price === 0 ? <span className="text-primary">Free</span> : formatPrice(method.price)}
                        </span>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </motion.div>
        )}

        {/* Step 3: Payment */}
        {currentStep === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            <h3 className="text-sm font-semibold text-foreground mb-3">Payment Method</h3>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2 mb-4">
              <div className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${paymentMethod === 'cash' ? 'border-primary/50 bg-primary/5' : 'border-border/50 bg-card'}`}>
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="flex-1 cursor-pointer flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                    <Banknote className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-foreground">Cash on Delivery</span>
                    <p className="text-[10px] text-muted-foreground">Pay when you receive</p>
                  </div>
                </Label>
              </div>
              <div className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${paymentMethod === 'card' ? 'border-primary/50 bg-primary/5' : 'border-border/50 bg-card'}`}>
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex-1 cursor-pointer flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                    <CreditCard className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-foreground">Credit / Debit Card</span>
                    <p className="text-[10px] text-muted-foreground">Visa, Mastercard, Amex</p>
                  </div>
                </Label>
              </div>
              <div className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${paymentMethod === 'mobile' ? 'border-primary/50 bg-primary/5' : 'border-border/50 bg-card'}`}>
                <RadioGroupItem value="mobile" id="mobile" />
                <Label htmlFor="mobile" className="flex-1 cursor-pointer flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                    <Smartphone className="h-4 w-4 text-violet-400" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-foreground">Mobile Banking</span>
                    <p className="text-[10px] text-muted-foreground">bKash, Nagad, Rocket</p>
                  </div>
                </Label>
              </div>
              <div className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${paymentMethod === 'wallet' ? 'border-primary/50 bg-primary/5' : 'border-border/50 bg-card'}`}>
                <RadioGroupItem value="wallet" id="wallet" />
                <Label htmlFor="wallet" className="flex-1 cursor-pointer flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                    <Wallet className="h-4 w-4 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-foreground">Grapsee Wallet</span>
                    <p className="text-[10px] text-muted-foreground">Use your wallet balance</p>
                  </div>
                </Label>
              </div>
              <div className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${paymentMethod === 'stripe' ? 'border-primary/50 bg-primary/5' : 'border-border/50 bg-card'}`}>
                <RadioGroupItem value="stripe" id="stripe" />
                <Label htmlFor="stripe" className="flex-1 cursor-pointer flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
                    <CreditCard className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-foreground">Stripe (International)</span>
                    <p className="text-[10px] text-muted-foreground">Visa, Mastercard  global payments</p>
                  </div>
                </Label>
              </div>
              <div className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${paymentMethod === 'sslcommerz' ? 'border-primary/50 bg-primary/5' : 'border-border/50 bg-card'}`}>
                <RadioGroupItem value="sslcommerz" id="sslcommerz" />
                <Label htmlFor="sslcommerz" className="flex-1 cursor-pointer flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                    <span className="text-base"></span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-foreground">SSLCommerz (Bangladesh)</span>
                    <p className="text-[10px] text-muted-foreground">bKash, Nagad, VISA, bank  local BDT</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            <Separator className="my-4" />

            {/* Order Notes */}
            <h3 className="text-sm font-semibold text-foreground mb-3">Order Notes</h3>
            <Input
              placeholder="Any special requirements..."
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              className="bg-card"
            />
          </motion.div>
        )}

        {/* Step 4: Confirm */}
        {currentStep === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            <h3 className="text-sm font-semibold text-foreground mb-3">Review Your Order</h3>

            {/* Shipping Info Summary */}
            <div className="rounded-xl border border-border/50 bg-card p-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">Shipping To</span>
              </div>
              <p className="text-xs text-foreground font-medium">{name}</p>
              <p className="text-[10px] text-muted-foreground">{email}</p>
              {phone && <p className="text-[10px] text-muted-foreground">{phone}</p>}
            </div>

            {/* Shipping Method Summary */}
            <div className="rounded-xl border border-border/50 bg-card p-3 mb-3">
              <div className="flex items-center gap-2 mb-1">
                <Truck className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">Delivery Method</span>
              </div>
              <p className="text-xs text-foreground">
                {shippingMethods.find((m) => m.id === selectedShipping)?.name || 'Standard Delivery'}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {shippingMethods.find((m) => m.id === selectedShipping)?.description || '5-7 business days'}
              </p>
            </div>

            {/* Payment Method Summary */}
            <div className="rounded-xl border border-border/50 bg-card p-3 mb-3">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">Payment</span>
              </div>
              <p className="text-xs text-foreground">
                {paymentMethod === 'cash' ? 'Cash on Delivery' : paymentMethod === 'card' ? 'Credit / Debit Card' : paymentMethod === 'mobile' ? 'Mobile Banking' : 'Grapsee Wallet'}
              </p>
            </div>

            {/* Items Summary */}
            <div className="rounded-xl border border-border/50 bg-card p-3 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">Items ({cart.length})</span>
              </div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs">
                    <span className="text-foreground line-clamp-1 flex-1 mr-2">{item.name}  {item.quantity}</span>
                    <span className="text-foreground font-medium flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Final Total */}
            <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent p-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-primary">Discount</span>
                    <span className="text-primary">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm font-bold text-foreground">Total</span>
                  <span className="text-lg font-bold text-primary">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex gap-3 mt-5">
        {currentStep > 1 && (
          <Button
            variant="outline"
            className="flex-1 h-11"
            onClick={handlePrev}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        )}

        {currentStep < 4 ? (
          <Button
            className="flex-1 bg-primary text-primary-foreground h-11 shadow-lg shadow-primary/20"
            onClick={handleNext}
            disabled={
              (currentStep === 1 && !canProceedToShipping) ||
              (currentStep === 2 && !canProceedToPayment)
            }
          >
            Continue
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button
            className="flex-1 bg-primary text-primary-foreground h-11 shadow-lg shadow-primary/20 text-base font-semibold"
            onClick={handleSubmit}
            disabled={loading || cart.length === 0}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Place Order  ${formatPrice(total)}`
            )}
          </Button>
        )}
      </div>
    </motion.div>
  )
}
