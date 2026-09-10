'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  ArrowRight,
  Copy,
  Check,
  Truck,
  Download,
  Share2,
  Gift,
  ShoppingBag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'

/* Confetti particles */
function ConfettiParticle({ index }: { index: number }) {
  const colors = ['#10b981', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6', '#14b8a6']
  const color = colors[index % colors.length]
  const leftPos = 10 + Math.random() * 80
  const delay = Math.random() * 0.6
  const duration = 1.5 + Math.random() * 1.5
  const drift = (Math.random() - 0.5) * 60

  return (
    <motion.div
      className="absolute top-0 h-2 w-2 rounded-sm"
      style={{ left: `${leftPos}%`, backgroundColor: color }}
      initial={{ y: -10, x: 0, rotate: 0, opacity: 1 }}
      animate={{ y: 300, x: drift, rotate: 720, opacity: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
    />
  )
}

function ConfettiBurst() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => (
        <ConfettiParticle key={i} index={i} />
      ))}
    </div>
  )
}

/* Animated Checkmark */
function AnimatedCheckmark() {
  return (
    <motion.div
      className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary/10"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ duration: 0.6, delay: 0.2, type: 'spring', stiffness: 200 }}
    >
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-primary/30"
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <CheckCircle2 className="h-12 w-12 text-primary" />
    </motion.div>
  )
}

/* Main Component */
export function OrderSuccess() {
  const { lastOrderId, cart, rewardsPoints } = useShopStore()
  const { goHome, goTrack, goInvoice } = useShopRouter()
  const [copied, setCopied] = useState(false)
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3500)
    return () => clearTimeout(timer)
  }, [])

  const handleCopyId = useCallback(async () => {
    if (!lastOrderId) return
    try {
      await navigator.clipboard.writeText(lastOrderId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }, [lastOrderId])

  // Estimate delivery: 57 business days
  const deliveryDate = new Date()
  deliveryDate.setDate(deliveryDate.getDate() + 7)
  const deliveryStr = deliveryDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })

  // Rewards earned: 1 point per $1 spent (simplified)
  const orderTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const pointsEarned = Math.floor(orderTotal * 1)

  // Item count
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <motion.div
      className="relative flex min-h-[80vh] flex-col items-center justify-center px-4 py-8 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
    >
      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && <ConfettiBurst />}
      </AnimatePresence>

      {/* Animated checkmark */}
      <AnimatedCheckmark />

      {/* Title */}
      <motion.h1
        className="mb-2 mt-6 text-2xl font-bold text-foreground"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        Order Placed! 
      </motion.h1>

      <motion.p
        className="mb-4 max-w-sm text-sm text-muted-foreground"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        Thank you for your order! Our team will get in touch with you shortly to discuss the next steps.
      </motion.p>

      {/* Order ID with copy */}
      {lastOrderId && (
        <motion.div
          className="mb-4 flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <span className="text-xs text-muted-foreground">Order ID:</span>
          <span className="text-xs font-semibold text-foreground">{lastOrderId}</span>
          <button
            onClick={handleCopyId}
            className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-muted active:scale-90 transition-all"
          >
            {copied ? (
              <Check className="h-3 w-3 text-emerald-500" />
            ) : (
              <Copy className="h-3 w-3 text-muted-foreground" />
            )}
          </button>
        </motion.div>
      )}

      {/* Order summary card */}
      <motion.div
        className="mb-4 w-full max-w-sm rounded-xl border border-border/50 bg-card p-4 text-left"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <h3 className="mb-3 text-xs font-semibold text-foreground uppercase tracking-wider">
          Order Summary
        </h3>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Items</span>
            <span className="font-medium text-foreground">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total</span>
            <span className="font-semibold text-foreground">{orderTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400">Standard (57 days)</span>
          </div>
          <div className="border-t border-border/50 pt-2 flex justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <Truck className="h-3 w-3" />
              Est. Delivery
            </span>
            <span className="font-medium text-foreground">{deliveryStr}</span>
          </div>
        </div>
      </motion.div>

      {/* Rewards earned notification */}
      {pointsEarned > 0 && (
        <motion.div
          className="mb-4 w-full max-w-sm rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-3 flex items-center gap-3"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.85, type: 'spring' }}
        >
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/20">
            <Gift className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
              +{pointsEarned} points earned!
            </p>
            <p className="text-[10px] text-muted-foreground">
              Total: {(rewardsPoints + pointsEarned).toLocaleString()} points
            </p>
          </div>
        </motion.div>
      )}

      {/* Action buttons */}
      <motion.div
        className="mb-4 w-full max-w-sm space-y-2.5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.95 }}
      >
        {lastOrderId && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 gap-2 text-xs active:scale-[0.98] transition-transform"
              onClick={() => goTrack(lastOrderId)}
            >
              <Truck className="h-3.5 w-3.5" />
              Track Order
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2 text-xs active:scale-[0.98] transition-transform"
              onClick={() => goInvoice(lastOrderId)}
            >
              <Download className="h-3.5 w-3.5" />
              Invoice
            </Button>
          </div>
        )}

        <Button
          onClick={() => goHome()}
          className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-transform"
          size="lg"
        >
          <ShoppingBag className="h-4 w-4" />
          Continue Shopping
          <ArrowRight className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Social share */}
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[10px] text-muted-foreground">Share your purchase</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="flex justify-center gap-2">
          {['Twitter', 'Facebook', 'WhatsApp'].map((platform) => (
            <Button
              key={platform}
              variant="outline"
              size="sm"
              className="gap-1.5 text-[10px] active:scale-95 transition-transform"
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.share) {
                  navigator.share({
                    title: 'Just ordered on Grapsee!',
                    text: `I just placed an order on Grapsee Shop! `,
                    url: window.location.origin,
                  }).catch(() => {})
                }
              }}
            >
              <Share2 className="h-3 w-3" />
              {platform}
            </Button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
