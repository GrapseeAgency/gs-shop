"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { useShopStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, AlertCircle, Wallet, Building2, Globe, Bitcoin } from "lucide-react"
import Image from "next/image"

// Payment method type
type PaymentMethod = "card" | "bank" | "local" | "paypal" | "crypto"

// Card type detection
function detectCardType(number: string): "visa" | "mastercard" | "unknown" {
  const clean = number.replace(/\s/g, "")
  if (/^4/.test(clean)) return "visa"
  if (/^5[1-5]/.test(clean)) return "mastercard"
  return "unknown"
}

// Format card number with spaces
function formatCardNumber(value: string): string {
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
  const parts = v.match(/.{1,4}/g) || []
  return parts.join(" ").substring(0, 23)
}

// Mask card number for display - handles 13-19 digit cards
function maskCardNumber(number: string): string {
  const clean = number.replace(/\s/g, "")
  if (clean.length <= 4) return clean || "   "

  const last4 = clean.slice(-4)
  const maskedCount = clean.length - 4

  // Build masked portion with proper 4-digit grouping
  const groups: string[] = []
  for (let i = 0; i < maskedCount; i += 4) {
    const groupSize = Math.min(4, maskedCount - i)
    groups.push("".repeat(groupSize))
  }

  return [...groups, last4].join(" ")
}

export default function PaymentPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { cart, getCartTotal, clearCart } = useShopStore()

  const [orderPreview, setOrderPreview] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [saveCard, setSaveCard] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Selected payment method
  const [activeMethod, setActiveMethod] = useState<PaymentMethod>("card")

  // Contact email for receipt (required for ALL methods)
  const [contactEmail, setContactEmail] = useState("")

  // Auto-fill email from user profile
  useEffect(() => {
    const userEmail = (session?.user as any)?.email
    if (userEmail && /\S+@\S+\.\S+/.test(userEmail)) {
      setContactEmail(userEmail)
    }
  }, [session])

  // Card form state
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvv, setCardCvv] = useState("")
  const [cardType, setCardType] = useState<"visa" | "mastercard" | "unknown">("unknown")

  // Bank transfer state
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [swiftCode, setSwiftCode] = useState("")
  const [accountHolder, setAccountHolder] = useState("")

  // Local payment state
  const [localId, setLocalId] = useState("")
  const [localRegion, setLocalRegion] = useState("")

  // PayPal state
  const [paypalEmail, setPaypalEmail] = useState("")

  // Crypto state
  const [walletAddress, setWalletAddress] = useState("")
  const [selectedCrypto, setSelectedCrypto] = useState<"eth" | "btc" | "usdc">("eth")

  // Load order preview
  useEffect(() => {
    setMounted(true)
    const savedPreview = sessionStorage.getItem("orderPreview")
    console.log("Raw orderPreview from sessionStorage:", savedPreview)
    if (savedPreview) {
      const preview = JSON.parse(savedPreview)
      console.log("Parsed orderPreview:", preview)
      console.log("priceChart:", preview?.priceChart)
      setOrderPreview(preview)
      // Pre-fill card number if saved (from previous session or user data)
      if (preview?.savedCard?.number) {
        setCardNumber(preview.savedCard.number)
        setCardName(preview.savedCard.name || "")
        setCardExpiry(preview.savedCard.expiry || "")
      }
    }
  }, [])

  // Detect card type on number change
  useEffect(() => {
    setCardType(detectCardType(cardNumber))
  }, [cardNumber])

  // Only product price - no fees, free delivery, no tax
  // Force convert to number - backend may return strings
  const basePrice = Number(orderPreview?.priceChart?.base)
  const totalPrice = Number(orderPreview?.priceChart?.total)
  const cartTotal = getCartTotal()

  const rawTotal = (!isNaN(basePrice) && basePrice > 0) ? basePrice :
                   (!isNaN(totalPrice) && totalPrice > 0) ? totalPrice :
                   cartTotal

  const total = isNaN(rawTotal) ? 0 : rawTotal

  console.log("Total calculated:", {
    base: orderPreview?.priceChart?.base,
    totalFromApi: orderPreview?.priceChart?.total,
    basePrice,
    totalPrice,
    cartTotal,
    rawTotal,
    finalTotal: total
  })

  // Format items for API - ensure they have required fields
  const orderItems = (orderPreview?.items || cart).map((item: any) => ({
    productId: item.productId || item.id,
    name: item.name || item.productName,
    unitPrice: item.unitPrice || item.price || 0,
    quantity: item.quantity || 1,
    imageUrl: item.imageUrl || item.image,
  }))

  const handleBack = () => {
    router.push("/checkout/preview")
  }

  const handleCardConfirm = async () => {
    if (!contactEmail || !cardNumber || !cardExpiry || !cardCvv) {
      toast.error("Please fill in email and all card details")
      return
    }
    if (!/\S+@\S+\.\S+/.test(contactEmail)) {
      toast.error("Please enter a valid email address")
      return
    }

    // Debug: Check items
    if (!orderItems || orderItems.length === 0) {
      toast.error("No items in order. Please go back and try again.")
      return
    }

    setLoading(true)
    try {
      const payload = {
        amount: total,
        items: orderItems,
        cardNumber: cardNumber.replace(/\s/g, ""),
        cardName: cardName || "CARD HOLDER",
        cardExpiry,
        cardCvv,
        saveCard,
        contactEmail,
        userId: (session?.user as any)?.id,
      }
      console.log("Sending payment payload:", payload)

      const res = await fetch("/api/payment/card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (data.success) {
        sessionStorage.setItem("paymentInfo", JSON.stringify({
          method: "card",
          cardType,
          cardNumber: maskCardNumber(cardNumber),
          cardExpiry,
          last4: cardNumber.replace(/\s/g, "").slice(-4),
          contactEmail,
          total,
          orderId: data.orderId,
        }))
        router.push("/checkout/confirm")
      } else {
        toast.error(data.error || "Payment failed")
      }
    } catch (error) {
      toast.error("Payment processing failed")
    } finally {
      setLoading(false)
    }
  }

  const handleBankConfirm = async () => {
    if (!contactEmail || !bankName || !accountNumber || !swiftCode || !accountHolder) {
      toast.error("Please fill in email and all bank details")
      return
    }
    if (!/\S+@\S+\.\S+/.test(contactEmail)) {
      toast.error("Please enter a valid email address")
      return
    }

    // Debug: Check items
    if (!orderItems || orderItems.length === 0) {
      toast.error("No items in order. Please go back and try again.")
      return
    }

    setLoading(true)
    try {
      const payload = {
        amount: total,
        items: orderItems,
        bankName,
        accountNumber,
        swiftCode,
        accountHolder,
        contactEmail,
        userId: (session?.user as any)?.id,
      }
      console.log("Sending bank transfer payload:", payload)

      const res = await fetch("/api/payment/bank-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (data.success) {
        sessionStorage.setItem("paymentInfo", JSON.stringify({
          method: "bank",
          bankName,
          accountNumber: `${accountNumber.slice(-4)}`,
          contactEmail,
          total,
          orderId: data.orderId,
        }))
        router.push("/checkout/confirm")
      } else {
        toast.error(data.error || "Bank transfer failed")
      }
    } catch (error) {
      toast.error("Bank transfer processing failed")
    } finally {
      setLoading(false)
    }
  }

  // Placeholder handlers for coming soon methods
  const handleLocalConfirm = () => toast.info("Local payment coming soon")
  const handlePaypalConfirm = () => toast.info("PayPal integration coming soon")
  const handleCryptoConfirm = () => toast.info("Crypto payment coming soon")

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  // Payment method tabs config
  const paymentMethods = [
    { id: "card" as PaymentMethod, icon: "/icons/payment/card.svg", label: "Card" },
    { id: "bank" as PaymentMethod, icon: "/icons/payment/bank.svg", label: "Bank" },
    { id: "local" as PaymentMethod, icon: "/icons/payment/local Transaction.svg", label: "Local", disabled: true },
    { id: "paypal" as PaymentMethod, icon: "/icons/payment/paypal.svg", label: "PayPal", disabled: true },
    { id: "crypto" as PaymentMethod, icon: "/icons/payment/crypto.svg", label: "Crypto", disabled: true },
  ]

  return (
    <div className="min-h-dvh bg-background">
      <div className="py-6 px-4 sm:py-8">
        <div className="max-w-md mx-auto lg:max-w-lg xl:max-w-xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={handleBack} className="-ml-2 hover:bg-accent">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg sm:text-xl font-semibold">Add Payment Method</h1>
        </div>

        {/* Payment Method Selector - Horizontal Scroll on Mobile */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => !method.disabled && setActiveMethod(method.id)}
              disabled={method.disabled}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border min-w-[70px] transition-all ${
                activeMethod === method.id
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : method.disabled
                  ? "border-muted bg-muted/30 opacity-50 cursor-not-allowed"
                  : "border-border hover:border-primary/50 hover:bg-accent"
              }`}
            >
              <div className="w-8 h-6 relative">
                <Image
                  src={method.icon}
                  alt={method.label}
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xs font-medium">{method.label}</span>
            </button>
          ))}
        </div>

        {/* Payment Forms */}
        <div className="space-y-6">
          {/* CARD PAYMENT FORM */}
          {activeMethod === "card" && (
            <>
              {/* Card Preview - Grapsee Theme */}
              <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-5 sm:p-6 mb-6 text-white shadow-lg relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-xl" />

                <div className="relative flex justify-between items-start mb-8">
                  <span className="text-xs font-medium tracking-wide opacity-90">BANK NAME</span>
                  {/* Sub-icons: Visa & Mastercard (auto-detected or both shown) */}
                  <div className="flex gap-1.5">
                    {/* Visa - highlighted when detected */}
                    <div className={`w-10 h-6 relative rounded bg-white/10 p-0.5 transition-all ${cardType === "visa" ? "ring-1 ring-white/60" : "opacity-50"}`}>
                      <Image src="/icons/payment/visa-card.svg" alt="Visa" fill className="object-contain" />
                    </div>
                    {/* Mastercard - highlighted when detected */}
                    <div className={`w-10 h-6 relative rounded bg-white/10 p-0.5 transition-all ${cardType === "mastercard" ? "ring-1 ring-white/60" : "opacity-50"}`}>
                      <Image src="/icons/payment/mastercard-card.svg" alt="Mastercard" fill className="object-contain" />
                    </div>
                  </div>
                </div>

                <p className="text-xl sm:text-2xl tracking-widest font-mono mb-6 sm:mb-8">
                  {maskCardNumber(cardNumber)}
                </p>

                <div className="relative flex justify-between items-end">
                  <div>
                    <p className="text-[10px] sm:text-xs opacity-70 mb-0.5">CARD HOLDER</p>
                    <p className="text-xs sm:text-sm font-medium tracking-wide uppercase truncate max-w-[160px]">
                      {cardName || "YOUR NAME"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] sm:text-xs opacity-70 mb-0.5">VALID THRU</p>
                    <p className="text-xs sm:text-sm font-medium">{cardExpiry || "MM/YY"}</p>
                  </div>
                </div>
              </div>

              {/* Card Form */}
              <div className="space-y-4">
                {/* Contact Email - Required for receipt (ALL methods) */}
                <div>
                  <Label className="text-sm font-medium">Email for Receipt <span className="text-red-500">*</span></Label>
                  <Input
                    type="email"
                    placeholder="your.email@gmail.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Card Number</Label>
                  <div className="relative mt-1.5">
                    <Input
                      placeholder="   "
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      maxLength={23}
                      className="pr-12 text-base tracking-wide"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-5">
                      {cardType === "mastercard" ? (
                        <Image src="/icons/payment/mastercard-card.svg" alt="MC" fill className="object-contain" />
                      ) : cardType === "visa" ? (
                        <Image src="/icons/payment/visa-card.svg" alt="Visa" fill className="object-contain" />
                      ) : null}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Card Holder Name</Label>
                  <Input
                    placeholder="JOHN DOE"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value.toUpperCase())}
                    className="mt-1.5 uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label className="text-sm font-medium">Expire Date</Label>
                    <Input
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => {
                        let v = e.target.value.replace(/\D/g, "")
                        if (v.length >= 2) v = v.slice(0, 2) + "/" + v.slice(2, 4)
                        setCardExpiry(v)
                      }}
                      maxLength={5}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">CVC/CVV2</Label>
                    <Input
                      placeholder=""
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      maxLength={4}
                      type="password"
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 py-2">
                  <Checkbox
                    id="saveCard"
                    checked={saveCard}
                    onCheckedChange={(checked) => setSaveCard(checked as boolean)}
                  />
                  <label htmlFor="saveCard" className="text-sm text-muted-foreground">
                    Save your card information. It&apos;s confidential.
                  </label>
                </div>

                <Button
                  className="w-full mt-4"
                  size="lg"
                  onClick={handleCardConfirm}
                  disabled={loading || !mounted}
                >
                  {loading ? "Processing..." : mounted ? `Confirm Payment ${formatPrice(total)}` : "Loading..."}
                </Button>
              </div>
            </>
          )}

          {/* BANK TRANSFER FORM */}
          {activeMethod === "bank" && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3">
                  <Building2 className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Bank Transfer</h3>
                    <p className="text-xs text-muted-foreground">Direct bank-to-bank transfer</p>
                  </div>
                </div>
              </div>

              {/* Contact Email - Required for receipt (ALL methods) */}
              <div>
                <Label className="text-sm font-medium">Email for Receipt <span className="text-red-500">*</span></Label>
                <Input
                  type="email"
                  placeholder="your.email@gmail.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Bank Name</Label>
                <Input
                  placeholder="e.g., Chase Bank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Account Holder Name</Label>
                <Input
                  placeholder="Full name as on account"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Account Number</Label>
                <Input
                  placeholder="Your bank account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">SWIFT/BIC Code</Label>
                <Input
                  placeholder="e.g., CHASUS33"
                  value={swiftCode}
                  onChange={(e) => setSwiftCode(e.target.value.toUpperCase())}
                  maxLength={11}
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">8 or 11 character code</p>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 flex gap-2">
                <AlertCircle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Transfer instructions will be sent to your email after confirmation.
                </p>
              </div>

              <Button
                className="w-full mt-4"
                size="lg"
                onClick={handleBankConfirm}
                disabled={loading || !mounted}
              >
                {loading ? "Processing..." : mounted ? `Initiate Transfer ${formatPrice(total)}` : "Loading..."}
              </Button>
            </div>
          )}

          {/* LOCAL PAYMENT - COMING SOON */}
          {activeMethod === "local" && (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Local Payment</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Regional payment methods are not available in your region yet.
              </p>
              <Button variant="outline" onClick={() => setActiveMethod("card")}>
                Use Card Instead
              </Button>
            </div>
          )}

          {/* PAYPAL - COMING SOON */}
          {activeMethod === "paypal" && (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Image src="/icons/payment/paypal.svg" alt="PayPal" width={32} height={32} className="opacity-50" />
              </div>
              <h3 className="font-semibold mb-2">PayPal</h3>
              <p className="text-sm text-muted-foreground mb-4">
                PayPal integration is coming soon.
              </p>
              <Button variant="outline" onClick={() => setActiveMethod("card")}>
                Use Card Instead
              </Button>
            </div>
          )}

          {/* CRYPTO - COMING SOON */}
          {activeMethod === "crypto" && (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Bitcoin className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Cryptocurrency</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Crypto payments (ETH, BTC, USDC) coming soon.
              </p>
              <div className="flex gap-2 justify-center">
                <span className="px-2 py-1 bg-muted rounded text-xs">ETH</span>
                <span className="px-2 py-1 bg-muted rounded text-xs">BTC</span>
                <span className="px-2 py-1 bg-muted rounded text-xs">USDC</span>
              </div>
              <Button variant="outline" className="mt-4" onClick={() => setActiveMethod("card")}>
                Use Card Instead
              </Button>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}
