'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import {
  Mail, ArrowRight, Check, Bell, Tag, Sparkles, Gift, Star,
  Zap, BookOpen, Crown, Shield,
} from 'lucide-react'

interface Preference { key: string; label: string; description: string; icon: typeof Bell; color: string }
const PREFERENCES: Preference[] = [
  { key: 'deals', label: 'Deals & Offers', description: 'Flash sales, discounts, and promo codes', icon: Tag, color: 'text-emerald-400' },
  { key: 'newArrivals', label: 'New Arrivals', description: 'Latest products and launches', icon: Sparkles, color: 'text-sky-400' },
  { key: 'blog', label: 'Blog & Tips', description: 'Style guides and shopping tips', icon: BookOpen, color: 'text-violet-400' },
  { key: 'vip', label: 'VIP Offers', description: 'Exclusive member-only deals', icon: Crown, color: 'text-amber-400' },
]

const BENEFITS = [
  { icon: Tag, text: 'Exclusive 10% off your first order', color: 'text-emerald-400' },
  { icon: Bell, text: 'Early access to sales & deals', color: 'text-sky-400' },
  { icon: Gift, text: 'Birthday surprises & rewards', color: 'text-violet-400' },
  { icon: Star, text: 'Member-only product launches', color: 'text-amber-400' },
  { icon: Zap, text: 'Instant deal notifications', color: 'text-rose-400' },
]

export function EmailSubscribePage() {
  const { goBack } = useShopRouter()
  const newsletterSubscribed = useShopStore((s) => s.newsletterSubscribed)
  const setNewsletterSubscribed = useShopStore((s) => s.setNewsletterSubscribed)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [preferences, setPreferences] = useState<Record<string, boolean>>({ deals: true, newArrivals: true, blog: false, vip: false })
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(newsletterSubscribed)
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [discountCode, setDiscountCode] = useState('')

  const togglePreference = (key: string) => setPreferences((prev) => ({ ...prev, [key]: !prev[key] }))

  const handleSubscribe = async () => {
    if (!email || !email.includes('@')) { setError('Please enter a valid email address'); return }
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/email-subscribe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, source: 'subscribe-page', preferences }),
      })
      const data = await res.json()
      if (data.success) {
        setSubscribed(true); setShowSuccess(true); setNewsletterSubscribed(true)
        setDiscountCode(data.welcomeBonus ? 'WELCOME50' : 'WELCOME10')
      } else { setError(data.error || 'Something went wrong') }
    } catch { setError('Failed to subscribe. Please try again.') } finally { setLoading(false) }
  }

  const handleUnsubscribe = () => { setSubscribed(false); setNewsletterSubscribed(false); setShowSuccess(false) }

  return (
    <div className="min-h-screen bg-background pb-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="p-1.5 rounded-lg hover:bg-muted active:scale-95 transition"><ArrowRight className="w-5 h-5 rotate-180" /></button>
          <div><h1 className="text-lg font-bold text-foreground flex items-center gap-2"><Mail className="w-5 h-5 text-sky-500" />Newsletter</h1><p className="text-xs text-muted-foreground">Stay updated with the best deals</p></div>
        </div>
      </motion.div>

      <div className="px-4 mt-4 space-y-4">
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="space-y-4">
              <div className="rounded-2xl bg-gradient-to-br from-emerald-500/20 via-green-500/10 to-teal-500/20 border border-emerald-500/20 p-6 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-emerald-400" />
                </motion.div>
                <h2 className="text-lg font-bold text-foreground">You&apos;re In! </h2>
                <p className="text-sm text-muted-foreground mt-1">Welcome to the Grapsee family</p>
                {discountCode && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3">
                    <p className="text-xs text-emerald-400 mb-1">Your 10% discount code:</p>
                    <p className="text-xl font-bold tracking-wider text-foreground">{discountCode}</p>
                  </motion.div>
                )}
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Your Preferences</h3>
                <div className="space-y-2">
                  {PREFERENCES.map((pref) => (
                    <div key={pref.key} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2"><pref.icon className={`w-4 h-4 ${pref.color}`} /><span className="text-sm text-foreground">{pref.label}</span></div>
                      <span className={`text-xs ${preferences[pref.key] ? 'text-emerald-400' : 'text-muted-foreground'}`}>{preferences[pref.key] ? 'On' : 'Off'}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium text-foreground">Email Subscription</p><p className="text-xs text-muted-foreground mt-0.5">Manage your subscription</p></div>
                  <button onClick={handleUnsubscribe} className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/10 transition">Unsubscribe</button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-sky-500/20 via-violet-500/10 to-rose-500/20 border border-sky-500/20 p-5">
                <div className="absolute top-3 right-3"><motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }}><Mail className="w-8 h-8 text-sky-400/40" /></motion.div></div>
                <h2 className="text-xl font-bold text-foreground">Get 10% Off</h2>
                <p className="text-sm text-muted-foreground mt-1">Your first order when you subscribe!</p>
                <div className="flex items-center gap-2 mt-3"><Gift className="w-4 h-4 text-sky-400" /><span className="text-xs text-sky-400 font-medium">WELCOME10 discount code</span></div>
              </motion.div>

              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Why Subscribe?</h3>
                <div className="space-y-2.5">
                  {BENEFITS.map((b, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.06 }} className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0"><b.icon className={`w-3.5 h-3.5 ${b.color}`} /></div>
                      <span className="text-sm text-muted-foreground">{b.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Your Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" className="w-full px-3 py-2.5 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/50" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email Address</label>
                  <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError('') }} placeholder="you@example.com" className="w-full px-3 py-2.5 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sky-500/50" />
                  {error && <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400 mt-1">{error}</motion.p>}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">Email Preferences</h3>
                <div className="space-y-3">
                  {PREFERENCES.map((pref) => (
                    <button key={pref.key} onClick={() => togglePreference(pref.key)} className="w-full flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${preferences[pref.key] ? 'bg-sky-500/20' : 'bg-muted/50'}`}><pref.icon className={`w-3.5 h-3.5 ${preferences[pref.key] ? pref.color : 'text-muted-foreground'}`} /></div>
                        <div className="text-left"><p className="text-sm text-foreground">{pref.label}</p><p className="text-[10px] text-muted-foreground">{pref.description}</p></div>
                      </div>
                      <div className={`w-10 h-6 rounded-full transition-colors relative ${preferences[pref.key] ? 'bg-sky-500' : 'bg-muted'}`}>
                        <motion.div animate={{ x: preferences[pref.key] ? 16 : 0 }} className="w-5 h-5 rounded-full bg-glass-deep shadow-md absolute top-0.5 left-0.5" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onClick={handleSubscribe} disabled={loading || !email} className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-lg shadow-sky-500/20 disabled:opacity-50">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Mail className="w-4 h-4" />Subscribe & Get 10% Off</>}
              </motion.button>

              <p className="text-[10px] text-center text-muted-foreground"><Shield className="w-3 h-3 inline mr-1" />We respect your privacy. Unsubscribe anytime.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

