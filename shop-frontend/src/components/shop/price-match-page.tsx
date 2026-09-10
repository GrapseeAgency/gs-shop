'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Shield, ExternalLink, Search, ChevronDown,
  CheckCircle2, Clock, AlertCircle, DollarSign, HelpCircle,
  Trophy, X, Send, Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import { toast } from 'sonner'

interface PriceMatch {
  id: string
  productId: string
  productName: string
  ourPrice: number
  competitorPrice: number
  competitorUrl: string | null
  status: string
  savings?: number
  savingsPercent?: number
  matchedPrice?: number | null
  createdAt: string
}

type MatchStatus = 'pending' | 'under_review' | 'approved' | 'refunded'

const statusConfig: Record<MatchStatus, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  pending: { label: 'Submitted', icon: Clock, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  under_review: { label: 'Under Review', icon: Search, color: 'text-sky-500', bgColor: 'bg-sky-500/10' },
  approved: { label: 'Approved', icon: CheckCircle2, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' },
  refunded: { label: 'Refunded', icon: DollarSign, color: 'text-violet-500', bgColor: 'bg-violet-500/10' },
}

export function PriceMatchPage() {
  const { goBack } = useShopRouter()
  const [matches, setMatches] = useState<PriceMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ competitorUrl: '', productUrl: '', email: '' })
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/price-match')
        if (res.ok) {
          const data = await res.json()
          setMatches(data.priceMatches || [])
        }
      } catch {
        // silent
      }
      setLoading(false)
    }
    fetchMatches()
  }, [])

  const handleSubmit = async () => {
    if (!form.competitorUrl.trim() || !form.productUrl.trim() || !form.email.trim()) {
      toast.error('Please fill all fields')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/price-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: 'prod-1',
          productName: 'Product from ' + form.productUrl,
          ourPrice: 199.99,
          competitorPrice: 179.99,
          competitorUrl: form.competitorUrl,
          customerEmail: form.email,
        }),
      })
      if (res.ok) {
        toast.success('Price match request submitted!')
        setForm({ competitorUrl: '', productUrl: '', email: '' })
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to submit')
      }
    } catch {
      toast.error('Failed to submit')
    }
    setSubmitting(false)
  }

  const faqItems = [
    { q: 'What is the Price Match Guarantee?', a: 'If you find a lower price on an identical product from a qualifying competitor, we\'ll match it and beat it by 5%.' },
    { q: 'Which competitors qualify?', a: 'We match prices from authorized retailers selling the same new product. Marketplaces, auction sites, and membership-only stores are excluded.' },
    { q: 'How long does the review take?', a: 'Most requests are reviewed within 24 hours. Complex cases may take up to 48 hours.' },
    { q: 'What happens after approval?', a: 'The matched price is applied to your account as store credit, and you\'ll receive a notification with the updated price.' },
    { q: 'Can I request multiple price matches?', a: 'Yes, you can submit one price match request per product. Each request is reviewed individually.' },
  ]

  return (
    <motion.div className="min-h-screen bg-background pb-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack} className="flex-shrink-0 text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-500" /> Price Match
            </h1>
          </div>
        </div>
      </div>

      {/* Guarantee Banner */}
      <div className="mx-4 mt-3 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-green-500/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-5 w-5 text-emerald-500" />
          <h3 className="text-sm font-bold text-foreground">We Beat Any Price by 5%</h3>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Found it cheaper elsewhere? We&apos;ll not only match the competitor&apos;s price but beat it by an additional 5%. That&apos;s our Price Match Guarantee.
        </p>
        <div className="flex gap-2 mt-3">
          <Badge className="bg-emerald-500/10 text-emerald-500 text-[9px] border border-emerald-500/20">
            <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" /> Verified
          </Badge>
          <Badge className="bg-sky-500/10 text-sky-500 text-[9px] border border-sky-500/20">
            <Clock className="h-2.5 w-2.5 mr-0.5" /> 24hr Review
          </Badge>
        </div>
      </div>

      {/* Submit Form */}
      <div className="mx-4 mt-3 rounded-2xl border border-border/50 bg-card p-4">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Send className="h-4 w-4 text-emerald-500" /> Request Price Match
        </h3>
        <div className="space-y-2.5">
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block">Competitor URL</label>
            <div className="relative">
              <ExternalLink className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="https://competitor.com/product..."
                className="pl-9 h-9 text-sm bg-muted/30 border-border/30"
                value={form.competitorUrl}
                onChange={(e) => setForm(prev => ({ ...prev, competitorUrl: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block">Product URL or ID</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Our product URL or ID"
                className="pl-9 h-9 text-sm bg-muted/30 border-border/30"
                value={form.productUrl}
                onChange={(e) => setForm(prev => ({ ...prev, productUrl: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block">Your Email</label>
            <Input
              placeholder="your@email.com"
              type="email"
              className="h-9 text-sm bg-muted/30 border-border/30"
              value={form.email}
              onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          <Button
            className="w-full gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting ? 'Submitting...' : <><Send className="h-4 w-4" /> Submit Request</>}
          </Button>
        </div>
      </div>

      {/* Status Tracker */}
      <div className="mx-4 mt-4">
        <h3 className="text-sm font-bold text-foreground mb-2">How It Works</h3>
        <div className="flex items-center gap-1">
          {(Object.entries(statusConfig) as [MatchStatus, typeof statusConfig[MatchStatus]][]).map(([key, cfg], i) => (
            <div key={key} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${cfg.bgColor}`}>
                  <cfg.icon className={`h-4 w-4 ${cfg.color}`} />
                </div>
                <span className={`text-[9px] mt-1 ${cfg.color} font-medium text-center`}>{cfg.label}</span>
              </div>
              {i < 3 && <div className="h-0.5 w-4 -mt-4 bg-border" />}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Matches */}
      <div className="mx-4 mt-4">
        <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" /> Recent Successful Matches
        </h3>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border/50 bg-card p-3">
                <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
                <div className="h-2 w-1/2 rounded bg-muted animate-pulse mt-2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {matches.map((match, i) => {
              const status = (match.status || 'pending') as MatchStatus
              const cfg = statusConfig[status] || statusConfig.pending
              return (
                <motion.div
                  key={match.id}
                  className="rounded-xl border border-border/50 bg-card p-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-foreground truncate pr-2">{match.productName}</p>
                    <Badge className={`${cfg.bgColor} ${cfg.color} text-[9px] flex-shrink-0`}>
                      <cfg.icon className="h-2.5 w-2.5 mr-0.5" /> {cfg.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                    <span>Our: {formatPrice(match.ourPrice)}</span>
                    <span>Their: {formatPrice(match.competitorPrice)}</span>
                    {match.savings != null && (
                      <span className="text-emerald-500 font-medium">Save {formatPrice(match.savings)}</span>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* FAQ */}
      <div className="mx-4 mt-4">
        <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-emerald-500" /> FAQ
        </h3>
        <div className="space-y-2">
          {faqItems.map((faq, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-border/50 bg-card">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-3 text-left"
              >
                <p className="text-xs font-medium text-foreground pr-2">{faq.q}</p>
                <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3">
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

