'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Sparkles, Gift, Star, Trophy, RotateCcw,
  X, Clock, Zap, ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { toast } from 'sonner'

interface Prize {
  id: string
  label: string
  type: 'discount' | 'shipping' | 'points' | 'none'
  value: number
  color: string
  probability: number
}

interface SpinHistory {
  prize: Prize
  date: string
}

const WHEEL_SEGMENTS = 8
const SEGMENT_ANGLE = 360 / WHEEL_SEGMENTS

const segmentIcons = ['', '', '', '', '', '', '', '']

export default function SpinWinPage() {
  const { goBack, addRewardsPoints } = useShopStore()
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [loading, setLoading] = useState(true)
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [spinsLeft, setSpinsLeft] = useState(3)
  const [showResult, setShowResult] = useState<Prize | null>(null)
  const [history, setHistory] = useState<SpinHistory[]>([])
  const [showConfetti, setShowConfetti] = useState(false)
  const wheelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load spin state from localStorage
    const today = new Date().toDateString()
    const saved = localStorage.getItem('grapsee-spin-state')
    if (saved) {
      try {
        const state = JSON.parse(saved)
        if (state.date === today) {
          setSpinsLeft(state.spinsLeft ?? 3)
          setHistory(state.history ?? [])
        } else {
          setSpinsLeft(3)
          setHistory([])
        }
      } catch {
        setSpinsLeft(3)
      }
    }
  }, [])

  const saveSpinState = useCallback((spins: number, hist: SpinHistory[]) => {
    localStorage.setItem('grapsee-spin-state', JSON.stringify({
      date: new Date().toDateString(),
      spinsLeft: spins,
      history: hist,
    }))
  }, [])

  const fetchPrizes = useCallback(async () => {
    try {
      const res = await fetch('/api/spin-prizes')
      if (res.ok) {
        const data = await res.json()
        setPrizes(data.data || [])
      }
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPrizes() }, [fetchPrizes])

  const displayPrizes = prizes.length > 0 ? prizes : [
    { id: 'p1', label: '10% Off', type: 'discount' as const, value: 10, color: '#f97316', probability: 25 },
    { id: 'p2', label: 'Free Ship', type: 'shipping' as const, value: 0, color: '#22c55e', probability: 20 },
    { id: 'p3', label: '50 Pts', type: 'points' as const, value: 50, color: '#3b82f6', probability: 20 },
    { id: 'p4', label: '25% Off', type: 'discount' as const, value: 25, color: '#ef4444', probability: 10 },
    { id: 'p5', label: '100 Pts', type: 'points' as const, value: 100, color: '#a855f7', probability: 10 },
    { id: 'p6', label: 'Try Again', type: 'none' as const, value: 0, color: '#6b7280', probability: 10 },
    { id: 'p7', label: '5% Off', type: 'discount' as const, value: 5, color: '#eab308', probability: 3 },
    { id: 'p8', label: '500 Pts!', type: 'points' as const, value: 500, color: '#ec4899', probability: 2 },
  ]

  const handleSpin = async () => {
    if (spinning || spinsLeft <= 0) return
    setSpinning(true)
    setShowResult(null)
    setShowConfetti(false)

    try {
      const res = await fetch('/api/spin-prizes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'guest' }),
      })
      if (res.ok) {
        const data = await res.json()
        const prize = data.prize as Prize

        // Calculate target segment
        const prizeIndex = displayPrizes.findIndex((p) => p.id === prize.id)
        const targetIndex = prizeIndex >= 0 ? prizeIndex : Math.floor(Math.random() * WHEEL_SEGMENTS)
        const targetAngle = 360 - (targetIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2)
        const spins = 5 + Math.floor(Math.random() * 3)
        const newRotation = rotation + spins * 360 + targetAngle

        setRotation(newRotation)

        // Wait for animation
        setTimeout(() => {
          setSpinning(false)
          const newSpinsLeft = spinsLeft - 1
          setSpinsLeft(newSpinsLeft)

          const newEntry: SpinHistory = { prize, date: new Date().toISOString() }
          const newHistory = [newEntry, ...history].slice(0, 20)
          setHistory(newHistory)
          saveSpinState(newSpinsLeft, newHistory)

          if (prize.type !== 'none') {
            setShowConfetti(true)
            if (prize.type === 'points') {
              addRewardsPoints(prize.value)
              toast.success(`${prize.label}!`, { description: `${prize.value} points added to your account` })
            } else {
              toast.success(`${prize.label}!`, { description: 'Your reward has been saved' })
            }
          } else {
            toast('Better luck next time! ', { description: 'Try again tomorrow for more spins' })
          }

          setShowResult(prize)
        }, 4500)
      }
    } catch {
      toast.error('Spin failed. Try again!')
      setSpinning(false)
    }
  }

  return (
    <motion.div
      className="pb-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack} className="flex-shrink-0 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-pink-400" />
              Spin & Win
            </h1>
            <p className="text-[11px] text-muted-foreground">Spin the wheel for rewards</p>
          </div>
          <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/30">
            {spinsLeft} spins left
          </Badge>
        </div>
      </div>

      {/* Spin Wheel Section */}
      <div className="flex flex-col items-center px-4 mt-4">
        {/* Wheel */}
        <div className="relative">
          {/* Outer glow ring */}
          <div className="absolute inset-[-8px] rounded-full bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-orange-500/20 blur-md" />

          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
            <div className="h-0 w-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-foreground" />
          </div>

          {/* Wheel container */}
          <div
            ref={wheelRef}
            className="relative h-[280px] w-[280px] rounded-full border-4 border-border/50 shadow-2xl overflow-hidden"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? 'transform 4.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
            }}
          >
            {displayPrizes.map((prize, i) => {
              const angle = i * SEGMENT_ANGLE
              return (
                <div
                  key={prize.id}
                  className="absolute inset-0"
                  style={{
                    clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos(((angle - 90) * Math.PI) / 180)}% ${50 + 50 * Math.sin(((angle - 90) * Math.PI) / 180)}%, ${50 + 50 * Math.cos(((angle + SEGMENT_ANGLE - 90) * Math.PI) / 180)}% ${50 + 50 * Math.sin(((angle + SEGMENT_ANGLE - 90) * Math.PI) / 180)}%)`,
                    backgroundColor: prize.color,
                  }}
                >
                  <div
                    className="absolute text-white font-bold text-[10px] whitespace-nowrap"
                    style={{
                      top: '25%',
                      left: '50%',
                      transform: `rotate(${angle + SEGMENT_ANGLE / 2}deg) translateX(-50%)`,
                      transformOrigin: '0 100%',
                    }}
                  >
                    <span className="text-sm mr-1">{segmentIcons[i]}</span>
                    {prize.label}
                  </div>
                </div>
              )
            })}
            {/* Center circle */}
            <div className="absolute inset-0 m-auto h-16 w-16 rounded-full bg-background border-4 border-border shadow-lg flex items-center justify-center">
              <Gift className="h-6 w-6 text-pink-400" />
            </div>
          </div>
        </div>

        {/* Spin Button */}
        <Button
          className="mt-6 h-14 px-12 rounded-2xl text-lg font-bold gap-2 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 text-white shadow-lg shadow-pink-500/25 hover:opacity-90 disabled:opacity-50"
          onClick={handleSpin}
          disabled={spinning || spinsLeft <= 0}
        >
          {spinning ? (
            <div className="h-6 w-6 animate-spin rounded-full border-3 border-white border-t-transparent" />
          ) : (
            <>
              <RotateCcw className="h-5 w-5" />
              SPIN NOW
            </>
          )}
        </Button>

        {spinsLeft <= 0 && !spinning && (
          <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Come back tomorrow for more spins!
          </p>
        )}
      </div>

      {/* Prize Result Modal */}
      <AnimatePresence>
        {showResult && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowResult(null); setShowConfetti(false) }}
            />
            {/* Confetti */}
            {showConfetti && (
              <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
                {Array.from({ length: 40 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: '-10px',
                      backgroundColor: ['#f97316', '#22c55e', '#3b82f6', '#ef4444', '#a855f7', '#eab308', '#ec4899'][i % 7],
                    }}
                    initial={{ y: 0, opacity: 1 }}
                    animate={{ y: window.innerHeight + 50, opacity: 0, rotate: Math.random() * 720 }}
                    transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5 }}
                  />
                ))}
              </div>
            )}
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl border-t border-border bg-background p-6 pb-8"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted" />
              <div className="flex flex-col items-center text-center">
                <div
                  className="mb-4 flex h-20 w-20 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${showResult.color}20` }}
                >
                  {showResult.type === 'none' ? (
                    <Star className="h-10 w-10" style={{ color: showResult.color }} />
                  ) : (
                    <Trophy className="h-10 w-10" style={{ color: showResult.color }} />
                  )}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1">
                  {showResult.type === 'none' ? 'Almost!' : 'You Won! '}
                </h3>
                <p className="text-2xl font-bold mb-2" style={{ color: showResult.color }}>
                  {showResult.label}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  {showResult.type === 'discount'
                    ? `Get ${showResult.value}% off your next purchase`
                    : showResult.type === 'points'
                    ? `${showResult.value} points added to your account`
                    : showResult.type === 'shipping'
                    ? 'Free shipping on your next order'
                    : 'Better luck next time!'}
                </p>
                <Button
                  className="w-full gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                  onClick={() => { setShowResult(null); setShowConfetti(false) }}
                >
                  {spinsLeft > 0 ? (
                    <><RotateCcw className="h-4 w-4" /> Spin Again ({spinsLeft} left)</>
                  ) : (
                    <><ChevronRight className="h-4 w-4" /> Done</>
                  )}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spin History */}
      <div className="px-4 mt-6">
        <h3 className="mb-3 text-sm font-bold text-foreground flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          Prize History
        </h3>
        {history.length === 0 ? (
          <div className="rounded-2xl border border-border/50 bg-card p-6 text-center">
            <Gift className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">No prizes yet. Spin the wheel!</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {history.map((entry, i) => (
              <motion.div
                key={`${entry.date}-${i}`}
                className="flex items-center gap-3 rounded-xl border border-border/30 bg-card p-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${entry.prize.color}20` }}
                >
                  <Zap className="h-4 w-4" style={{ color: entry.prize.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground">{entry.prize.label}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="text-[9px]"
                  style={{ color: entry.prize.color, borderColor: `${entry.prize.color}40` }}
                >
                  {entry.prize.type === 'discount' ? `${entry.prize.value}% OFF` :
                   entry.prize.type === 'points' ? `${entry.prize.value} PTS` :
                   entry.prize.type === 'shipping' ? 'FREE SHIP' : ''}
                </Badge>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="px-4 mt-6">
        <div className="rounded-2xl border border-border/50 bg-card p-4">
          <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-400" />
            How It Works
          </h3>
          <div className="space-y-2">
            {[
              { step: '1', text: 'Get 3 free spins every day' },
              { step: '2', text: 'Tap SPIN NOW to spin the wheel' },
              { step: '3', text: 'Win discounts, points, or free shipping' },
              { step: '4', text: 'Prizes are automatically applied' },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                  {item.step}
                </div>
                <p className="text-[11px] text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
