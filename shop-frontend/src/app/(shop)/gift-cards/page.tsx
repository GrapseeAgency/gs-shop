'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  ArrowLeft, Gift, CreditCard, PartyPopper, Snowflake, Crown,
  Copy, Check, Eye, EyeOff, Send, Loader2, Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'

interface GiftCardData {
  id: string
  code: string
  amount: number
  balance: number
  isRedeemed: boolean
  redeemedBy: string | null
  message: string | null
  design: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const designs = [
  { id: 'classic', name: 'Classic', icon: CreditCard, gradient: 'from-emerald-500 to-teal-600', pattern: '    ' },
  { id: 'birthday', name: 'Birthday', icon: PartyPopper, gradient: 'from-amber-500 to-orange-600', pattern: '   ' },
  { id: 'holiday', name: 'Holiday', icon: Snowflake, gradient: 'from-rose-500 to-pink-600', pattern: '    ' },
  { id: 'premium', name: 'Premium', icon: Crown, gradient: 'from-violet-500 to-purple-600', pattern: '    ' },
]

const presetAmounts = [50, 100, 250, 500, 1000]

export default function GiftCardsPage() {
  const { goBack } = useShopRouter()
  const [giftCards, setGiftCards] = useState<GiftCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDesign, setSelectedDesign] = useState('classic')
  const [selectedAmount, setSelectedAmount] = useState<number | null>(100)
  const [customAmount, setCustomAmount] = useState('')
  const [giftMessage, setGiftMessage] = useState('')
  const [purchasing, setPurchasing] = useState(false)
  const [showCodeMap, setShowCodeMap] = useState<Record<string, boolean>>({})
  const [redeemCode, setRedeemCode] = useState('')
  const [redeemEmail, setRedeemEmail] = useState('')
  const [redeeming, setRedeeming] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    fetchGiftCards()
  }, [])

  const fetchGiftCards = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/gift-cards')
      if (res.ok) {
        const json = await res.json()
        setGiftCards(json.data || [])
      }
    } catch {
      toast.error('Failed to load gift cards')
    } finally {
      setLoading(false)
    }
  }

  const getAmount = () => {
    if (customAmount && Number(customAmount) > 0) return Number(customAmount)
    return selectedAmount || 100
  }

  const handlePurchase = async () => {
    const amount = getAmount()
    if (!amount || amount <= 0) {
      toast.error('Please select or enter a valid amount')
      return
    }
    try {
      setPurchasing(true)
      const res = await fetch('/api/gift-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          design: selectedDesign,
          message: giftMessage || null,
        }),
      })
      if (res.ok) {
        toast.success('Gift card purchased successfully!')
        setGiftMessage('')
        setCustomAmount('')
        setSelectedAmount(100)
        fetchGiftCards()
      } else {
        const json = await res.json()
        toast.error(json.error || 'Failed to purchase gift card')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setPurchasing(false)
    }
  }

  const handleRedeem = async () => {
    if (!redeemCode.trim()) {
      toast.error('Please enter a gift card code')
      return
    }
    if (!redeemEmail.trim()) {
      toast.error('Please enter your email')
      return
    }
    try {
      setRedeeming(true)
      const res = await fetch('/api/gift-cards/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: redeemCode.trim(), email: redeemEmail.trim() }),
      })
      if (res.ok) {
        const json = await res.json()
        toast.success(json.message || 'Gift card redeemed!')
        setRedeemCode('')
        setRedeemEmail('')
        fetchGiftCards()
      } else {
        const json = await res.json()
        toast.error(json.error || 'Failed to redeem')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setRedeeming(false)
    }
  }

  const toggleCodeVisibility = (id: string) => {
    setShowCodeMap((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const copyCode = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedId(id)
      toast.success('Code copied!')
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const maskCode = (code: string) => {
    const parts = code.split('-')
    return parts.map((p, i) => (i < 3 ? '****' : p)).join('-')
  }

  const currentDesign = designs.find((d) => d.id === selectedDesign) || designs[0]
  const DesignIcon = currentDesign.icon

  return (
    <motion.div
      className="px-4 py-2 pb-8"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={goBack}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Gift className="h-5 w-5 text-emerald-400" />
            Gift Cards
          </h1>
          <p className="text-xs text-muted-foreground">Give the perfect gift</p>
        </div>
      </div>

      {/* Hero Section */}
      <div className="mb-5 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-cyan-500/5 border border-emerald-500/20 p-5 relative overflow-hidden">
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl" />
        <div className="absolute -left-4 -bottom-4 h-20 w-20 rounded-full bg-teal-500/10 blur-2xl" />
        <div className="relative">
          <motion.div
            className="flex items-center gap-2 mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Sparkles className="h-5 w-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-foreground">Gift Cards</h2>
          </motion.div>
          <p className="text-sm text-muted-foreground">
            Send the gift of choice. Perfect for any occasion.
          </p>
        </div>
      </div>

      {/* Design Selector */}
      <section className="mb-5">
        <h3 className="mb-3 text-sm font-bold text-foreground">Choose Design</h3>
        <div className="grid grid-cols-4 gap-2">
          {designs.map((design) => {
            const Icon = design.icon
            return (
              <motion.button
                key={design.id}
                className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all ${
                  selectedDesign === design.id
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                    : 'border-border/50 bg-card hover:border-primary/30'
                }`}
                onClick={() => setSelectedDesign(design.id)}
                whileTap={{ scale: 0.95 }}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${design.gradient}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-[10px] font-medium text-foreground">{design.name}</span>
              </motion.button>
            )
          })}
        </div>
      </section>

      {/* Amount Selector */}
      <section className="mb-5">
        <h3 className="mb-3 text-sm font-bold text-foreground">Select Amount</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {presetAmounts.map((amt) => (
            <motion.button
              key={amt}
              className={`rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-all ${
                selectedAmount === amt && !customAmount
                  ? 'border-primary bg-primary/10 text-primary shadow-md'
                  : 'border-border/50 bg-card text-foreground hover:border-primary/30'
              }`}
              onClick={() => {
                setSelectedAmount(amt)
                setCustomAmount('')
              }}
              whileTap={{ scale: 0.95 }}
            >
              {formatPrice(amt)}
            </motion.button>
          ))}
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">$</span>
          <Input
            placeholder="Custom amount"
            type="number"
            min="1"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value)
              if (e.target.value) setSelectedAmount(null)
            }}
            className="pl-7 h-11 rounded-xl border-border/50 bg-card"
          />
        </div>
      </section>

      {/* Message */}
      <section className="mb-5">
        <h3 className="mb-3 text-sm font-bold text-foreground">Gift Message (Optional)</h3>
        <textarea
          placeholder="Write a personal message..."
          value={giftMessage}
          onChange={(e) => setGiftMessage(e.target.value)}
          maxLength={200}
          className="w-full rounded-xl border border-border/50 bg-card p-3 text-sm text-foreground placeholder:text-muted-foreground/60 resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <p className="mt-1 text-[10px] text-muted-foreground text-right">{giftMessage.length}/200</p>
      </section>

      {/* Gift Card Preview */}
      <section className="mb-5">
        <h3 className="mb-3 text-sm font-bold text-foreground">Preview</h3>
        <motion.div
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${currentDesign.gradient} p-5 shadow-xl`}
          layout
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.3),transparent)]" />
          </div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <DesignIcon className="h-5 w-5 text-white/90" />
                <span className="text-sm font-bold text-white/90">Grapsee</span>
              </div>
              <span className="text-[10px] text-white/60 uppercase tracking-wider">{currentDesign.name}</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{formatPrice(getAmount())}</p>
            <div className="mt-3 text-[10px] text-white/50 tracking-[0.2em]">{currentDesign.pattern}</div>
            {giftMessage && (
              <p className="mt-3 text-xs text-white/70 italic line-clamp-2">&ldquo;{giftMessage}&rdquo;</p>
            )}
          </div>
        </motion.div>
      </section>

      {/* Purchase Button */}
      <motion.div className="mb-6">
        <Button
          className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all"
          onClick={handlePurchase}
          disabled={purchasing}
        >
          {purchasing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Gift className="mr-2 h-4 w-4" />
          )}
          {purchasing ? 'Processing...' : `Purchase Gift Card  ${formatPrice(getAmount())}`}
        </Button>
      </motion.div>

      <Separator className="my-6" />

      {/* My Gift Cards List */}
      <section className="mb-6">
        <h3 className="mb-3 text-sm font-bold text-foreground flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-primary" />
          My Gift Cards
          {giftCards.length > 0 && (
            <Badge variant="secondary" className="text-[10px]">{giftCards.length}</Badge>
          )}
        </h3>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : giftCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Gift className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No gift cards yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Purchase your first gift card above</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {giftCards.map((card, idx) => {
              const cardDesign = designs.find((d) => d.id === card.design) || designs[0]
              const CardIcon = cardDesign.icon
              const isCodeVisible = showCodeMap[card.id] || false

              return (
                <motion.div
                  key={card.id}
                  className="rounded-xl border border-border/50 bg-card p-4 overflow-hidden"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${cardDesign.gradient} flex-shrink-0`}>
                      <CardIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-foreground">{cardDesign.name}</span>
                        {card.isRedeemed ? (
                          <Badge className="bg-muted text-muted-foreground text-[10px]">Redeemed</Badge>
                        ) : card.isActive ? (
                          <Badge className="bg-emerald-500/10 text-emerald-400 text-[10px]">Active</Badge>
                        ) : (
                          <Badge className="bg-destructive/10 text-destructive text-[10px]">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-lg font-bold text-primary">{formatPrice(card.amount)}</p>
                      {!card.isRedeemed && (
                        <p className="text-xs text-muted-foreground">
                          Balance: <span className="font-medium text-foreground">{formatPrice(card.balance)}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Code */}
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted/50 p-2.5">
                    <code className="flex-1 text-xs font-mono text-foreground tracking-wider">
                      {isCodeVisible ? card.code : maskCode(card.code)}
                    </code>
                    <button onClick={() => toggleCodeVisibility(card.id)} className="text-muted-foreground hover:text-foreground">
                      {isCodeVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button onClick={() => copyCode(card.code, card.id)} className="text-muted-foreground hover:text-foreground">
                      {copiedId === card.id ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>

                  {card.message && (
                    <p className="mt-2 text-xs text-muted-foreground italic line-clamp-1">&ldquo;{card.message}&rdquo;</p>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </section>

      <Separator className="my-6" />

      {/* Redeem Section */}
      <section className="mb-4">
        <h3 className="mb-3 text-sm font-bold text-foreground flex items-center gap-2">
          <Send className="h-4 w-4 text-amber-400" />
          Redeem Gift Card
        </h3>
        <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Gift Card Code</label>
            <Input
              placeholder="XXXX-XXXX-XXXX-XXXX"
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
              className="h-11 rounded-xl font-mono tracking-wider"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Your Email</label>
            <Input
              placeholder="you@example.com"
              type="email"
              value={redeemEmail}
              onChange={(e) => setRedeemEmail(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>
          <Button
            className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold shadow-lg shadow-amber-500/20"
            onClick={handleRedeem}
            disabled={redeeming}
          >
            {redeeming ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {redeeming ? 'Redeeming...' : 'Redeem Gift Card'}
          </Button>
        </div>
      </section>
    </motion.div>
  )
}
