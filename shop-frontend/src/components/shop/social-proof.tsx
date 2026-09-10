'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Star, UserPlus, Gift, Heart, X } from 'lucide-react'

interface ProofEvent {
  id: string
  type: 'purchase' | 'review' | 'signup' | 'reward' | 'wishlist' | 'cart'
  title: string
  userName: string
  description: string
  productName?: string
  location?: string
  timestamp: string
}

const fallbackEvents: ProofEvent[] = [
  { id: 'sp-1', type: 'purchase', title: 'Just purchased', userName: 'Sarah', description: 'purchased iPhone 15 Pro', productName: 'iPhone 15 Pro', location: 'Dhaka', timestamp: new Date(Date.now() - 120000).toISOString() },
  { id: 'sp-2', type: 'reward', title: 'Earned points', userName: 'Ahmed', description: 'earned 50 reward points', location: 'Chittagong', timestamp: new Date(Date.now() - 300000).toISOString() },
  { id: 'sp-3', type: 'review', title: 'Left a review', userName: 'Fatima', description: 'left a 5-star review on MacBook Air', productName: 'MacBook Air', location: 'Sylhet', timestamp: new Date(Date.now() - 600000).toISOString() },
  { id: 'sp-4', type: 'signup', title: 'Just joined', userName: 'Rafiq', description: 'signed up for a new account', location: 'Rajshahi', timestamp: new Date(Date.now() - 900000).toISOString() },
  { id: 'sp-5', type: 'purchase', title: 'Just purchased', userName: 'Nadia', description: 'purchased Samsung Galaxy S24', productName: 'Samsung Galaxy S24', location: 'Khulna', timestamp: new Date(Date.now() - 1200000).toISOString() },
  { id: 'sp-6', type: 'wishlist', title: 'Added to wishlist', userName: 'Kamal', description: 'saved Sony WH-1000XM5', productName: 'Sony WH-1000XM5', location: 'Comilla', timestamp: new Date(Date.now() - 1500000).toISOString() },
  { id: 'sp-7', type: 'reward', title: 'Daily bonus', userName: 'Taslima', description: 'claimed daily login bonus (+5 pts)', location: 'Gazipur', timestamp: new Date(Date.now() - 1800000).toISOString() },
  { id: 'sp-8', type: 'purchase', title: 'Just purchased', userName: 'Imran', description: 'purchased iPad Pro M2', productName: 'iPad Pro M2', location: 'Narayanganj', timestamp: new Date(Date.now() - 2400000).toISOString() },
  { id: 'sp-9', type: 'review', title: 'Left a review', userName: 'Zahir', description: 'left a 4-star review on AirPods Pro', productName: 'AirPods Pro', location: 'Dhaka', timestamp: new Date(Date.now() - 3000000).toISOString() },
  { id: 'sp-10', type: 'signup', title: 'Just joined', userName: 'Rumi', description: 'signed up for a new account', location: 'Chittagong', timestamp: new Date(Date.now() - 3600000).toISOString() },
]

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  purchase: { icon: ShoppingCart, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  review: { icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/15' },
  signup: { icon: UserPlus, color: 'text-violet-400', bg: 'bg-violet-500/15' },
  reward: { icon: Gift, color: 'text-rose-400', bg: 'bg-rose-500/15' },
  wishlist: { icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/15' },
  cart: { icon: ShoppingCart, color: 'text-cyan-400', bg: 'bg-cyan-500/15' },
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function SocialProof() {
  const [events, setEvents] = useState<ProofEvent[]>(fallbackEvents)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visible, setVisible] = useState(false)
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())

  // Fetch real data
  useEffect(() => {
    fetch('/api/activity?mode=social-proof&limit=10')
      .then((res) => res.json())
      .then((data) => {
        if (data.data && data.data.length > 0) {
          setEvents(data.data)
        }
      })
      .catch(() => {})
  }, [])

  const showNext = useCallback(() => {
    setVisible(false)
    setTimeout(() => {
      setCurrentIndex((prev) => {
        let next = (prev + 1) % events.length
        // Skip dismissed
        let attempts = 0
        while (dismissedIds.has(events[next]?.id) && attempts < events.length) {
          next = (next + 1) % events.length
          attempts++
        }
        return next
      })
      setVisible(true)
    }, 400)
  }, [events, dismissedIds])

  useEffect(() => {
    const initialTimer = setTimeout(() => {
      setVisible(true)
    }, 5000)

    const interval = setInterval(showNext, 5000)

    return () => {
      clearTimeout(initialTimer)
      clearInterval(interval)
    }
  }, [showNext])

  const dismiss = (id: string) => {
    setDismissedIds((prev) => new Set(prev).add(id))
    setVisible(false)
    setTimeout(() => showNext(), 300)
  }

  if (events.length === 0) return null

  const event = events[currentIndex]
  if (!event || dismissedIds.has(event.id)) return null

  const config = typeConfig[event.type] || typeConfig.purchase
  const Icon = config.icon

  return (
    <div className="fixed bottom-20 left-4 z-30 pointer-events-none" style={{ maxWidth: 'calc(100vw - 32px)' }}>
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={event.id}
            className="mx-auto max-w-sm rounded-xl border border-border/50 bg-card/95 backdrop-blur-lg shadow-xl pointer-events-auto"
            initial={{ opacity: 0, x: -40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="flex items-center gap-2.5 p-3">
              {/* Type icon */}
              <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${config.bg}`}>
                <Icon className={`h-4 w-4 ${config.color}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground">
                  <span className="font-semibold">{event.userName}</span>{' '}
                  {event.location && (
                    <span className="text-muted-foreground">from {event.location}</span>
                  )}
                </p>
                <p className="text-[11px] text-muted-foreground line-clamp-1">
                  {event.description}
                </p>
              </div>

              {/* Time + dismiss */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-[9px] text-muted-foreground">
                  {timeAgo(event.timestamp)}
                </span>
                <button
                  onClick={() => dismiss(event.id)}
                  className="flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  aria-label="Dismiss notification"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

