'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, Check, Gift, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useShopStore } from '@/lib/store'
import { toast } from 'sonner'

export function NewsletterSection() {
  const { setNewsletterSubscribed, newsletterSubscribed } = useShopStore()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(newsletterSubscribed)
  const [sending, setSending] = useState(false)
  const [discountCode, setDiscountCode] = useState<string | null>(null)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email')
      return
    }

    setSending(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setSubscribed(true)
        setNewsletterSubscribed(true)
        setDiscountCode(data.discountCode || 'WELCOME10')
        toast.success('Subscribed!', {
          description: `Your discount code: ${data.discountCode || 'WELCOME10'}`,
        })
        setEmail('')
      } else {
        toast.error(data.error || 'Failed to subscribe')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="px-4 py-4">
      <motion.div
        className="relative overflow-hidden rounded-3xl glass-deep p-5 liquid-scene"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Aurora depth blobs */}
        <div className="absolute -right-12 -top-12 h-44 w-44 liquid-blob opacity-60 pointer-events-none" />
        <div className="absolute -left-6 bottom-0 h-28 w-28 liquid-blob-slow opacity-50 pointer-events-none" />
        <div className="absolute right-1/3 top-1/2 h-16 w-16 liquid-blob-accent opacity-30 pointer-events-none" />
        {/* Animated border */}
        <div className="absolute inset-0 rounded-3xl liquid-border pointer-events-none" />

        <div className="relative z-10">
          {/* Header */}
          <div className="mb-4 flex items-start gap-3">
            <motion.div
              className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 overflow-hidden flex-shrink-0"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="absolute inset-0 liquid-aurora opacity-50" />
              <span className="relative text-lg">
                {subscribed ? <Check className="h-5 w-5 text-primary" /> : <Mail className="h-5 w-5 text-primary" />}
              </span>
            </motion.div>
            <div>
              <h2 className="text-base font-black text-gradient-green">
                {subscribed ? "You're In!" : 'Stay in the Loop'}
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {subscribed
                  ? 'Watch your inbox for exclusive deals.'
                  : 'Get exclusive deals, new arrivals & 10% off your first order.'}
              </p>
            </div>
          </div>

          {/* Perks */}
          {!subscribed && (
            <div className="mb-4 flex gap-3">
              <div className="flex items-center gap-1.5 rounded-full bg-primary/5 border border-primary/10 px-2.5 py-1 text-[10px] text-primary font-medium">
                <Gift className="h-3 w-3" />
                10% Off First Order
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-primary/5 border border-primary/10 px-2.5 py-1 text-[10px] text-primary font-medium">
                <Sparkles className="h-3 w-3 animate-pulse" />
                Early Access
              </div>
            </div>
          )}

          {/* Form */}
          {!subscribed ? (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-background/60 border-border/40 backdrop-blur-sm h-10 text-sm focus:border-primary/40 transition-colors"
              />
              <Button
                type="submit"
                className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 shadow-lg shadow-primary/25 btn-liquid font-bold"
                disabled={sending}
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>
          ) : (
            <motion.div
              className="flex items-center gap-2 rounded-2xl bg-primary/10 border border-primary/20 p-3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 border border-primary/30 flex-shrink-0">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Subscribed!</p>
                <p className="text-[10px] text-muted-foreground">
                  Your discount code: <code className="rounded-md bg-primary/10 px-1.5 py-0.5 text-primary font-mono font-bold">{discountCode || 'WELCOME10'}</code>
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  )
}

