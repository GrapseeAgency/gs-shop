'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useShopStore } from '@/lib/store'
import {
  X,
  Mail,
  Gift,
  Sparkles,
  ArrowRight,
  Check,
  Percent,
  Bell,
} from 'lucide-react'

export function EmailCapturePopup() {
  const newsletterSubscribed = useShopStore((s) => s.newsletterSubscribed)
  const setNewsletterSubscribed = useShopStore((s) => s.setNewsletterSubscribed)
  const emailPopupDismissed = useShopStore((s) => s.emailPopupDismissed)
  const setEmailPopupDismissed = useShopStore((s) => s.setEmailPopupDismissed)
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Check if already dismissed via Zustand store (persisted)
    if (emailPopupDismissed || newsletterSubscribed) return

    // Show popup after 30 seconds
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 30000)

    return () => clearTimeout(timer)
  }, [emailPopupDismissed, newsletterSubscribed])

  const handleDismiss = () => {
    setIsVisible(false)
    setEmailPopupDismissed(true)
  }

  const handleSubscribe = async () => {
    if (!email || !email.includes('@')) return
    setLoading(true)

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (data.success) {
        setSuccess(true)
        setNewsletterSubscribed(true)
        // Auto-close after showing success
        setTimeout(() => {
          setIsVisible(false)
        }, 3000)
      }
    } catch {
      // Handle error silently
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isVisible && !emailPopupDismissed && !newsletterSubscribed && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto"
          >
            <div className="relative rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">
              {/* Dismiss Button */}
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center hover:bg-background/80 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Gradient Header */}
              <div className="relative bg-gradient-to-br from-rose-500/20 via-pink-500/10 to-violet-500/20 p-6 pb-4 text-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(244,63,94,0.15),transparent_60%)]" />

                {/* Animated Sparkles */}
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                  className="absolute top-3 left-6"
                >
                  <Sparkles className="w-4 h-4 text-rose-400/40" />
                </motion.div>
                <motion.div
                  animate={{ rotate: [360, 0] }}
                  transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
                  className="absolute bottom-4 right-8"
                >
                  <Sparkles className="w-3 h-3 text-violet-400/40" />
                </motion.div>

                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-rose-500/30"
                >
                  {success ? (
                    <Check className="w-7 h-7 text-white" />
                  ) : (
                    <Percent className="w-7 h-7 text-white" />
                  )}
                </motion.div>

                {success ? (
                  <>
                    <h2 className="text-xl font-bold text-foreground">You&apos;re In! </h2>
                    <p className="text-sm text-muted-foreground mt-1">Check your inbox for the discount code</p>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-foreground">Get 10% Off!</h2>
                    <p className="text-sm text-muted-foreground mt-1">Your first order when you subscribe</p>
                  </>
                )}
              </div>

              {/* Content */}
              {!success ? (
                <div className="p-5 space-y-4">
                  {/* Benefits */}
                  <div className="space-y-2">
                    {[
                      { icon: Gift, text: '10% discount on your first order' },
                      { icon: Bell, text: 'Early access to flash sales' },
                      { icon: Sparkles, text: 'Exclusive member-only deals' },
                    ].map((benefit, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        className="flex items-center gap-2"
                      >
                        <benefit.icon className="w-4 h-4 text-rose-400 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">{benefit.text}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Email Input */}
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                        placeholder="Enter your email"
                        className="w-full pl-9 pr-3 py-2.5 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                      />
                    </div>
                    <button
                      onClick={handleSubscribe}
                      disabled={loading || !email}
                      className="px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-medium flex items-center gap-1 active:scale-95 transition disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Disclaimer */}
                  <p className="text-[10px] text-center text-muted-foreground">
                    No spam, unsubscribe anytime. We respect your privacy.
                  </p>
                </div>
              ) : (
                <div className="p-5 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="inline-block px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                  >
                    <p className="text-xs text-emerald-400">Discount code: <span className="font-bold">WELCOME10</span></p>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

