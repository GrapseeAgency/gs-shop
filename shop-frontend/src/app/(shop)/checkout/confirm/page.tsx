"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { useShopStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield, Clock, Zap, Package, CreditCard, Mail, Lock } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

// Green color palette
const COLORS = {
  hunter: "#355E3B",
  emerald: "#50C878",
  viridian: "#40826D",
  malachite: "#0BDA51",
  bottle: "#006A4E",
  cadmium: "#006B3C",
  deepJungle: "#004B49",
  british: "#004225",
  brunswick: "#1B4332",
  imperial: "#00755E",
  mint: "#98FF98",
  sage: "#8FBC8F",
  spring: "#00FF7F",
  seafoam: "#93E9BE",
}

export default function OrderConfirmPage() {
  const router = useRouter()
  const { clearCart } = useShopStore()
  const { data: session } = useSession()

  const [orderPreview, setOrderPreview] = useState<any>(null)
  const [paymentInfo, setPaymentInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedPreview = sessionStorage.getItem("orderPreview")
    const savedPayment = sessionStorage.getItem("paymentInfo")

    if (savedPreview) setOrderPreview(JSON.parse(savedPreview))
    if (savedPayment) setPaymentInfo(JSON.parse(savedPayment))
    else router.push("/checkout/payment")
  }, [router])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const handleSubmitOrder = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/orders/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: paymentInfo?.orderId }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success("Order confirmed! ")
        clearCart()
        sessionStorage.removeItem("orderPreview")
        sessionStorage.removeItem("paymentInfo")
        router.push(`/order-success?id=${paymentInfo?.orderId}`)
      } else {
        toast.error(data.error || "Failed to submit order")
      }
    } catch (error) {
      toast.error("Order submission failed")
    } finally {
      setLoading(false)
    }
  }

  const itemsTotal = orderPreview?.priceChart?.base || orderPreview?.items?.reduce((sum: number, item: any) => sum + (item.totalPrice || 0), 0) || 0
  const discount = orderPreview?.priceChart?.discount || 0
  const total = Math.max(0, itemsTotal - discount)

  if (!orderPreview || !paymentInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1B4332] via-[#2D5A3D] to-[#355E3B]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Zap className="h-10 w-10 text-[#50C878]" />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAF9]">
      <div className="py-6 px-4 sm:py-8">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/checkout/payment")}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm text-gray-700 transition-all hover:bg-gray-50 hover:shadow-md"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Order Preview</h1>
            </div>
            <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
              {orderPreview?.items?.length || 1} item
            </span>
          </motion.div>

          {/* Price Lock Banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 p-3.5"
          >
            <div className="flex items-center gap-2.5 text-amber-700">
              <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">
                Prices are locked for 30 minutes. Complete your order before{" "}
                <span className="font-bold">{new Date(Date.now() + 30 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} AM</span>.
              </span>
            </div>
          </motion.div>

          {/* Product Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4 rounded-2xl bg-white shadow-lg shadow-gray-200/50 overflow-hidden border border-gray-100"
          >
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#0BDA51] to-[#006A4E] flex items-center justify-center shadow-md shadow-[#0BDA51]/20">
                  <Package className="h-4.5 w-4.5 text-white" />
                </div>
                <span className="font-bold text-gray-900 text-base">Product Summary</span>
              </div>
            </div>
            <div className="p-5">
              {orderPreview?.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-[15px]">{item.productName || item.name || "Grapsee Smart Watch"}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Qty: {item.quantity || 1}  {formatPrice(item.unitPrice || item.price || 299.99)}</p>
                  </div>
                  <span className="font-bold text-gray-900 text-[15px]">{formatPrice(item.totalPrice || (item.unitPrice || item.price || 299.99) * (item.quantity || 1))}</span>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Base Total</span>
                  <span className="font-bold text-gray-900 text-base">{formatPrice(itemsTotal)}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Price Chart Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-4 rounded-2xl bg-white shadow-lg shadow-gray-200/50 overflow-hidden border border-gray-100"
          >
            <div className="px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#50C878] to-[#355E3B] flex items-center justify-center shadow-md shadow-[#50C878]/20">
                  <CreditCard className="h-4.5 w-4.5 text-white" />
                </div>
                <span className="font-bold text-gray-900 text-base">Price Chart</span>
              </div>
            </div>
            <div className="p-5">
              <div className="flex justify-between text-[15px] mb-4">
                <span className="text-gray-600">Base</span>
                <span className="font-semibold text-gray-900">{formatPrice(itemsTotal)}</span>
              </div>
              
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 mb-2.5 uppercase tracking-wide">Fees</p>
                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Platform Fee</span>
                    <span className="font-medium text-[#0BDA51]">$0.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Transaction Fee</span>
                    <span className="font-medium text-[#0BDA51]">$0.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-[#0BDA51]">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (8%)</span>
                    <span className="font-medium text-[#0BDA51]">$0.00</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-gray-700">Total Fees</span>
                  <span className="font-bold text-[#0BDA51]">$0.00</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-[#0BDA51]">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Payment Method Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6 rounded-2xl bg-white shadow-lg shadow-gray-200/50 overflow-hidden border border-gray-100"
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#006A4E] to-[#00755E] flex items-center justify-center shadow-md shadow-[#006A4E]/20">
                    <Lock className="h-4.5 w-4.5 text-white" />
                  </div>
                  <span className="font-bold text-gray-900 text-base">Payment Method</span>
                </div>
                <button
                  onClick={() => router.push("/checkout/payment")}
                  className="text-sm font-semibold text-[#006A4E] hover:text-[#0BDA51] transition-colors flex items-center gap-1"
                >
                  Change
                </button>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-[#98FF98]/30 to-[#93E9BE]/30 border border-[#50C878]/40">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#006A4E] to-[#00755E] flex items-center justify-center shadow-md">
                  {paymentInfo?.method === "bank" ? (
                    <span className="text-white text-xs font-bold">BANK</span>
                  ) : (
                    <CreditCard className="h-5 w-5 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  {paymentInfo?.method === "bank" ? (
                    <p className="font-bold text-gray-900 text-[15px]">{paymentInfo?.bankName}</p>
                  ) : (
                    <p className="font-bold text-gray-900 text-[15px]">
                      {paymentInfo?.cardType === "visa" ? "Visa" : paymentInfo?.cardType === "mastercard" ? "Mastercard" : "Card"} 
                      <span className="ml-2 text-gray-400 font-medium"> {paymentInfo?.last4 || "4242"}</span>
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-0.5">{paymentInfo?.contactEmail || "receipt@grapsee.com"}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Security Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-6 flex items-center justify-center gap-2 text-[#40826D]"
          >
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">256-bit SSL secured payment</span>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <button
              onClick={handleSubmitOrder}
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#006A4E] via-[#0BDA51] to-[#006A4E] p-4 text-lg font-bold text-white shadow-xl shadow-[#0BDA51]/25 transition-all hover:shadow-2xl hover:shadow-[#0BDA51]/35 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Zap className="h-5 w-5" />
                    </motion.div>
                    Processing...
                  </>
                ) : (
                  <>
                    Select Payment Method
                    <ArrowLeft className="h-5 w-5 rotate-180" />
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#0BDA51] via-[#50C878] to-[#0BDA51] opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          </motion.div>

          {/* Terms */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-4 text-center text-xs text-gray-500"
          >
            By clicking above, you agree to our <span className="text-[#006A4E] font-medium">Terms of Use</span> and <span className="text-[#006A4E] font-medium">Privacy Policy</span>
          </motion.p>
        </div>
      </div>
    </div>
  )
}
