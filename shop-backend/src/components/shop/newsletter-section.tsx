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
        className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-5"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Decorative */}
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -left-4 bottom-0 h-20 w-20 rounded-full bg-primary/5 blur-2xl" />

        <div className="relative">
          {/* Header */}
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
              {subscribed ? <Check className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {subscribed ? 'You\'re In!' : 'Stay in the Loop'}
              </h2>
              <p className="text-[11px] text-muted-foreground">
                {subscribed
                  ? 'Watch your inbox for exclusive deals.'
                  : 'Get exclusive deals, new arrivals & 10% off your first order.'}
              </p>
            </div>
          </div>

          {/* Perks */}
          {!subscribed && (
            <div className="mb-4 flex gap-3">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Gift className="h-3 w-3 text-primary" />
                10% Off First Order
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Sparkles className="h-3 w-3 text-primary" />
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
                className="flex-1 bg-background/50 border-border/50 h-10 text-sm"
              />
              <Button
                type="submit"
                className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 shadow-lg shadow-primary/20"
                disabled={sending}
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>
          ) : (
            <div className="flex items-center gap-2 rounded-xl bg-primary/10 p-3">
              <Check className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Subscribed!</p>
                <p className="text-[10px] text-muted-foreground">
                  Your discount code: <code className="rounded bg-primary/10 px-1.5 py-0.5 text-primary font-mono">{discountCode || 'WELCOME10'}</code>
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </section>
  )
}
