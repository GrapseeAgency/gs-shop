'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { Gift, ChevronRight, Sparkles, AlertCircle, CheckCircle, X, Box } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MysteryBox {
  id: string
  name: string
  tier: string
  price: number
  valueRange: number[]
  color: string
  icon: string
  items: string[]
  probabilities: { item: string; chance: number }[]
}

interface CommunityReveal {
  user: string
  box: string
  item: string
  avatar: string
  time: string
}

const tierBadgeColors: Record<string, string> = {
  Standard: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  Premium: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Luxury: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Ultimate: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
}

export function MysteryBoxPage() {
  const [boxes, setBoxes] = useState<MysteryBox[]>([])
  const [reveals, setReveals] = useState<CommunityReveal[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBox, setSelectedBox] = useState<MysteryBox | null>(null)
  const [unboxing, setUnboxing] = useState(false)
  const [unboxPhase, setUnboxPhase] = useState<'idle' | 'shake' | 'open' | 'reveal'>('idle')
  const [revealedItem, setRevealedItem] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const { addRewardsPoints } = useShopStore()
  const { goHome } = useShopRouter()

  useEffect(() => {
    fetch('/api/mystery-box')
      .then(res => res.json())
      .then(data => {
        setBoxes(data.boxes || [])
        setReveals(data.communityReveals || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handlePurchase = (box: MysteryBox) => {
    setSelectedBox(box)
    setShowConfirm(true)
  }

  const confirmPurchase = () => {
    if (!selectedBox) return
    setShowConfirm(false)
    setUnboxing(true)
    setUnboxPhase('shake')

    setTimeout(() => setUnboxPhase('open'), 1500)
    setTimeout(() => {
      const randomIdx = Math.floor(Math.random() * selectedBox.items.length)
      setRevealedItem(selectedBox.items[randomIdx])
      setUnboxPhase('reveal')
      addRewardsPoints(Math.floor(selectedBox.price / 10))
    }, 2800)
    setTimeout(() => {
      setUnboxing(false)
      setUnboxPhase('idle')
    }, 5500)
  }

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-4 pb-24">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <button onClick={goHome} className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
           Back
        </button>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Gift className="h-6 w-6 text-purple-500" /> Mystery Box Shop
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Surprise deals worth up to 3x the price!</p>
      </motion.div>

      {/* Unboxing Animation Overlay */}
      <AnimatePresence>
        {unboxing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          >
            <div className="text-center">
              {unboxPhase === 'shake' && (
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.1, 1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: 1 }}
                  className="text-8xl"
                >
                  
                </motion.div>
              )}
              {unboxPhase === 'open' && (
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ scale: 1.3, rotateY: 180 }}
                  transition={{ duration: 1 }}
                  className="text-8xl"
                >
                  
                </motion.div>
              )}
              {unboxPhase === 'reveal' && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <div className="text-6xl mb-4"></div>
                  <p className="text-lg font-bold text-white">You got:</p>
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-2xl font-bold text-yellow-400 mt-2"
                  >
                    {revealedItem}
                  </motion.p>
                  <p className="text-xs text-green-400 mt-2">+{selectedBox ? Math.floor(selectedBox.price / 10) : 0} reward points earned!</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showConfirm && selectedBox && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60"
          >
            <motion.div
              initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }}
              className="w-full max-w-[430px] bg-card rounded-t-2xl p-6 border-t border-border"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-foreground">Confirm Purchase</h3>
                <button onClick={() => setShowConfirm(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
              </div>
              <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-muted/50">
                <span className="text-3xl">{selectedBox.icon}</span>
                <div>
                  <p className="text-sm font-bold text-foreground">{selectedBox.name}</p>
                  <p className="text-xs text-muted-foreground">Value up to {selectedBox.valueRange[1].toLocaleString()}</p>
                </div>
                <p className="ml-auto text-base font-bold text-primary">{selectedBox.price.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <AlertCircle className="h-4 w-4" />
                <span>Items are randomly selected. No refunds after opening.</span>
              </div>
              <Button onClick={confirmPurchase} className="w-full">Confirm & Open Box</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mystery Box Cards */}
      <div className="space-y-3 mb-6">
        {boxes.map((box, idx) => (
          <motion.div
            key={box.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`rounded-xl border border-border bg-gradient-to-r ${box.color} p-4`}
          >
            <div className="flex items-start gap-3">
              <motion.span
                className="text-3xl"
                whileHover={{ scale: 1.2, rotate: [0, -15, 15, 0] }}
              >
                {box.icon}
              </motion.span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-foreground">{box.name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${tierBadgeColors[box.tier] || 'bg-muted'}`}>
                    {box.tier}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Value: {box.valueRange[0].toLocaleString()}  {box.valueRange[1].toLocaleString()}
                </p>
                {/* What's Inside Teaser */}
                <div className="flex gap-1 mb-3">
                  {box.items.map((_, i) => (
                    <div key={i} className="h-6 w-6 rounded bg-foreground/10 flex items-center justify-center text-[10px] text-muted-foreground">
                      ?
                    </div>
                  ))}
                </div>
                {/* Probability Table */}
                <div className="space-y-1 mb-3">
                  {box.probabilities.map(p => (
                    <div key={p.item} className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${p.chance}%` }}
                          transition={{ delay: idx * 0.1 + 0.3, duration: 0.5 }}
                          className="h-full rounded-full bg-primary"
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground w-20 truncate">{p.item}</span>
                      <span className="text-[10px] font-medium text-foreground">{p.chance}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
              <span className="text-lg font-bold text-primary">{box.price.toLocaleString()}</span>
              <Button size="sm" onClick={() => handlePurchase(box)} className="gap-1">
                <Sparkles className="h-3 w-3" /> Open Box
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Community Reveals */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
          <Box className="h-4 w-4" /> Recently Unboxed
        </h2>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {reveals.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.05 }}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-card border border-border/50"
            >
              <span className="text-xl">{r.avatar}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">{r.user} <span className="text-muted-foreground">got</span> <span className="text-primary font-bold">{r.item}</span></p>
                <p className="text-[10px] text-muted-foreground">{r.box} Box  {r.time}</p>
              </div>
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
