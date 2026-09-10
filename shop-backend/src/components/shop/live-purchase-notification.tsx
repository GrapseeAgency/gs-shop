'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, MapPin } from 'lucide-react'

interface PurchaseEvent {
  id: number
  city: string
  product: string
  minutesAgo: number
  flag: string
}

const cities = [
  { name: 'New York', flag: '' },
  { name: 'London', flag: '' },
  { name: 'Tokyo', flag: '' },
  { name: 'Dubai', flag: '' },
  { name: 'Sydney', flag: '' },
  { name: 'Singapore', flag: '' },
  { name: 'Paris', flag: '' },
  { name: 'Berlin', flag: '' },
]

const products = [
  'Premium E-Commerce Suite',
  'Mobile App Pro',
  'DevOps Setup Package',
  'UI/UX Redesign Kit',
  'Startup Bundle',
  'Custom API Platform',
  'Cloud Migration Service',
  'Landing Page Pro',
  'SaaS Dashboard',
  'AI Chatbot Suite',
  'Marketing Automation',
  'Brand Identity Pack',
]

function generateEvent(index: number): PurchaseEvent {
  const city = cities[index % cities.length]
  const product = products[(index * 3 + 7) % products.length]
  const minutesAgo = ((index * 7 + 3) % 30) + 1
  return {
    id: index,
    city: city.name,
    product,
    minutesAgo,
    flag: city.flag,
  }
}

export function LivePurchaseNotification() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const showNext = useCallback(() => {
    if (dismissed) return
    setVisible(false)
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1)
      setVisible(true)
    }, 500)
  }, [dismissed])

  useEffect(() => {
    // Show first notification after 8s
    const initialTimer = setTimeout(() => {
      if (!dismissed) setVisible(true)
    }, 8000)

    // Then every 30-60 seconds
    const interval = setInterval(() => {
      if (!dismissed) showNext()
    }, 35000 + Math.random() * 25000)

    return () => {
      clearTimeout(initialTimer)
      clearInterval(interval)
    }
  }, [showNext, dismissed])

  const handleDismiss = () => {
    setVisible(false)
    setDismissed(true)
  }

  if (dismissed) return null

  const event = generateEvent(currentIndex)

  return (
    <div className="fixed bottom-20 left-3 right-3 z-30 pointer-events-none sm:left-auto sm:right-4 sm:max-w-xs">
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={event.id}
            className="pointer-events-auto rounded-2xl border border-border/30 bg-card/95 backdrop-blur-lg p-3 shadow-2xl shadow-black/10"
            initial={{ opacity: 0, y: 40, scale: 0.9, x: -20 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: 20, scale: 0.9, x: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex items-start gap-2.5">
              {/* Icon */}
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                <ShoppingBag className="h-4 w-4 text-primary" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-xs leading-relaxed text-foreground">
                  Someone in{' '}
                  <span className="font-semibold">
                    {event.flag} {event.city}
                  </span>{' '}
                  just purchased
                </p>
                <p className="text-[11px] font-medium text-primary truncate">
                  {event.product}
                </p>
                <div className="mt-0.5 flex items-center gap-1">
                  <span className="text-[9px] text-muted-foreground">
                    {event.minutesAgo} min ago
                  </span>
                  <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                  <span className="text-[9px] text-muted-foreground">Verified</span>
                </div>
              </div>

              {/* Dismiss */}
              <button
                onClick={handleDismiss}
                className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
