'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Shield, CheckCircle2, Clock, AlertCircle,
  ChevronRight, Star, FileText, Link2, DollarSign,
  BadgeCheck, MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useShopRouter } from '@/hooks/use-shop-router'
import { toast } from 'sonner'
import { ShieldCheck, Gift } from 'lucide-react'

interface Claim {
  id: string
  productName: string
  status: 'submitted' | 'under_review' | 'approved' | 'refunded'
  submittedAt: string
  refundAmount: number
}

const successStories = [
  { id: 1, name: 'Sarah M.', product: 'Wireless Earbuds', saved: 450, story: 'Found a lower price and got refunded within 48 hours!' },
  { id: 2, name: 'James K.', product: 'Smart Watch', saved: 1200, story: 'The guarantee saved me big. Process was super smooth.' },
  { id: 3, name: 'Priya R.', product: 'Laptop Stand', saved: 300, story: 'Submitted my claim and got approved the same day.' },
]

const claimStatusSteps = [
  { key: 'submitted', label: 'Submitted', icon: FileText, color: 'text-sky-500' },
  { key: 'under_review', label: 'Under Review', icon: Clock, color: 'text-amber-500' },
  { key: 'approved', label: 'Approved', icon: CheckCircle2, color: 'text-emerald-500' },
  { key: 'refunded', label: 'Refunded', icon: DollarSign, color: 'text-primary' },
]

export function PriceGuaranteePage() {
  const { goBack } = useShopRouter()
  const [claimForm, setClaimForm] = useState({ productUrl: '', competitorUrl: '', competitorPrice: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [claims, setClaims] = useState<Claim[]>([
    { id: 'cl1', productName: 'Bluetooth Speaker', status: 'under_review', submittedAt: '2 days ago', refundAmount: 350 },
    { id: 'cl2', productName: 'USB-C Hub', status: 'refunded', submittedAt: '1 week ago', refundAmount: 150 },
  ])
  const [activeStory, setActiveStory] = useState(0)

  const handleSubmitClaim = async () => {
    if (!claimForm.productUrl || !claimForm.competitorUrl || !claimForm.competitorPrice) {
      toast.error('Please fill in all fields')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/price-guarantee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(claimForm),
      })
      if (res.ok) {
        const data = await res.json()
        setClaims(prev => [{ id: data.id || 'cl-new', productName: 'Your Claim', status: 'submitted', submittedAt: 'Just now', refundAmount: parseFloat(claimForm.competitorPrice) }, ...prev])
        setSubmitted(true)
        toast.success('Claim submitted successfully!')
      }
    } catch { /* silent */ }
    setSubmitting(false)
  }

  return (
    <motion.div className="min-h-screen bg-background pb-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack} className="flex-shrink-0 text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Price Guarantee
            </h1>
          </div>
        </div>
      </div>

      {/* Hero / Explanation */}
      <div className="mx-4 mt-3 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-emerald-500/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <BadgeCheck className="h-6 w-6 text-primary" />
          <h2 className="text-lg font-bold text-foreground">30-Day Price Guarantee</h2>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Found a lower price? We&apos;ll refund the difference. If you find the same product at a lower price within 30 days of purchase, submit a claim and we&apos;ll match it.
        </p>
        <div className="mt-3 flex items-center gap-3">
          {[
            { icon: Shield, label: '30 Days', color: 'text-primary' },
            { icon: CheckCircle2, label: 'Full Refund', color: 'text-emerald-500' },
            { icon: Clock, label: '48hr Review', color: 'text-amber-500' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-1">
              <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
              <span className="text-[10px] text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Guarantee Badges */}
      <div className="mx-4 mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
        {[
          { icon: Shield, label: 'Best Price' },
          { icon: BadgeCheck, label: 'Verified' },
          { icon: DollarSign, label: 'Save More' },
          { icon: Clock, label: 'Fast Claim' },
        ].map((badge, i) => (
          <motion.div key={i} className="flex-shrink-0 flex items-center gap-1.5 rounded-full border border-border/50 bg-card px-3 py-1.5" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
            {(() => { const BadgeIcon = badge.icon; return <BadgeIcon className="h-[18px] w-[18px]" />; })()}
            <span className="text-[10px] font-medium text-foreground">{badge.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Submit Claim Form */}
      <div className="mx-4 mt-4">
        <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
          <FileText className="h-4 w-4 text-primary" /> Submit a Claim
        </h3>
        {submitted ? (
          <motion.div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-center" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-foreground">Claim Submitted!</p>
            <p className="text-[10px] text-muted-foreground mt-1">We&apos;ll review it within 48 hours</p>
            <Button variant="outline" size="sm" className="mt-3 text-xs" onClick={() => { setSubmitted(false); setClaimForm({ productUrl: '', competitorUrl: '', competitorPrice: '' }) }}>
              Submit Another
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Product URL on Grapsee</label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="https://grapsee.shop/product/..." className="pl-9 h-9 text-sm bg-muted/30 border-border/30" value={claimForm.productUrl} onChange={e => setClaimForm(prev => ({ ...prev, productUrl: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Competitor URL</label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="https://competitor.com/product/..." className="pl-9 h-9 text-sm bg-muted/30 border-border/30" value={claimForm.competitorUrl} onChange={e => setClaimForm(prev => ({ ...prev, competitorUrl: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Competitor Price</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="number" placeholder="0.00" className="pl-9 h-9 text-sm bg-muted/30 border-border/30" value={claimForm.competitorPrice} onChange={e => setClaimForm(prev => ({ ...prev, competitorPrice: e.target.value }))} />
              </div>
            </div>
            <Button className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={submitting} onClick={handleSubmitClaim}>
              {submitting ? 'Submitting...' : <><Shield className="h-4 w-4" /> Submit Claim</>}
            </Button>
          </div>
        )}
      </div>

      {/* Claim Status Tracker */}
      <div className="mx-4 mt-4">
        <h3 className="text-sm font-bold text-foreground mb-2">Your Claims</h3>
        <div className="space-y-2">
          {claims.map((claim, i) => {
            const stepIndex = claimStatusSteps.findIndex(s => s.key === claim.status)
            return (
              <motion.div key={claim.id} className="rounded-xl border border-border/50 bg-card p-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-foreground">{claim.productName}</p>
                  <Badge className={`text-[9px] ${claim.status === 'refunded' ? 'bg-emerald-500/10 text-emerald-500' : claim.status === 'approved' ? 'bg-primary/10 text-primary' : claim.status === 'under_review' ? 'bg-amber-500/10 text-amber-500' : 'bg-sky-500/10 text-sky-500'}`}>
                    {claim.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  {claimStatusSteps.map((step, si) => (
                    <div key={step.key} className="flex items-center gap-1 flex-1">
                      <div className={`flex items-center justify-center h-5 w-5 rounded-full ${si <= stepIndex ? 'bg-primary/20' : 'bg-muted/30'}`}>
                        <step.icon className={`h-2.5 w-2.5 ${si <= stepIndex ? step.color : 'text-muted-foreground'}`} />
                      </div>
                      {si < claimStatusSteps.length - 1 && (
                        <div className={`flex-1 h-0.5 ${si < stepIndex ? 'bg-primary/40' : 'bg-muted/30'}`} />
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-[9px] text-muted-foreground mt-1.5">{claim.submittedAt} - Refund: ${claim.refundAmount}</p>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Success Stories */}
      <div className="mx-4 mt-4">
        <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
          <Star className="h-4 w-4 text-amber-500" /> Success Stories
        </h3>
        <AnimatePresence mode="wait">
          <motion.div key={activeStory} className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 p-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Star className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">{successStories[activeStory].name}</p>
                <p className="text-[9px] text-muted-foreground">{successStories[activeStory].product} - Saved ${successStories[activeStory].saved}</p>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">&quot;{successStories[activeStory].story}&quot;</p>
          </motion.div>
        </AnimatePresence>
        <div className="flex justify-center gap-2 mt-2">
          {successStories.map((_, i) => (
            <button key={i} onClick={() => setActiveStory(i)} className={`h-2 rounded-full transition-all ${activeStory === i ? 'w-6 bg-primary' : 'w-2 bg-muted'}`} />
          ))}
        </div>
      </div>

      {/* Terms */}
      <div className="mx-4 mt-4 rounded-xl border border-border/50 bg-card p-3">
        <h3 className="text-xs font-bold text-foreground mb-1.5">Terms & Conditions</h3>
        <ul className="space-y-1 text-[10px] text-muted-foreground">
          <li className="flex items-start gap-1.5"><CheckCircle2 className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" /> Claim must be submitted within 30 days of purchase</li>
          <li className="flex items-start gap-1.5"><CheckCircle2 className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" /> Competitor product must be identical (same model, condition)</li>
          <li className="flex items-start gap-1.5"><CheckCircle2 className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" /> Competitor must be an authorized retailer</li>
          <li className="flex items-start gap-1.5"><CheckCircle2 className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" /> Refund processed within 5 business days of approval</li>
        </ul>
      </div>
    </motion.div>
  )
}

