'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { X, Flame, Truck, Diamond, Gift, Timer } from 'lucide-react'

const announcements: { icon: React.ComponentType<{ className?: string }>; text: string }[] = [
  { icon: Flame, text: 'Flash Sale: Up to 70% OFF on all digital services!' },
  { icon: Truck, text: 'Free Shipping on orders over 500' },
  { icon: Diamond, text: 'Premium Members get 2X rewards on every purchase' },
  { icon: Gift, text: 'New users get 10% OFF - Code: WELCOME10' },
  { icon: Timer, text: 'Limited Time: Buy 2 Get 1 Free on select items' },
]

export function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  const [direction, setDirection] = useState(1)
  const x = useMotionValue(0)
  const opacity = useTransform(x, [-100, 0, 100], [0.5, 1, 0.5])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const goTo = useCallback((index: number) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }, [currentIndex])

  const goNext = useCallback(() => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % announcements.length)
  }, [])

  const goPrev = useCallback(() => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length)
  }, [])

  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(goNext, 4000)
  }, [goNext])

  useEffect(() => {
    startInterval()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [startInterval])

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -40) {
      goNext()
    } else if (info.offset.x > 40) {
      goPrev()
    }
    startInterval()
  }

  if (dismissed) return null

  const slideVariants: Variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  }

  return (
    <div className="relative overflow-hidden">
      {/* Gradient animated background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/80"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        style={{ backgroundSize: '200% 100%' }}
      />
      {/* Shimmer overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />

      <div className="relative flex items-center px-4 py-2">
        <div className="flex-1 overflow-hidden">
          <motion.div
            className="cursor-grab active:cursor-grabbing"
            style={{ x, opacity }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.3}
            onDragEnd={handleDragEnd}
          >
            <AnimatePresence mode="wait" custom={direction}>
              <motion.p
                key={currentIndex}
                custom={direction}
                className="flex items-center justify-center gap-1.5 text-center text-[11px] font-medium text-primary-foreground sm:text-xs"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {(() => { const Icon = announcements[currentIndex].icon; return <Icon className="h-4 w-4" />; })()}
                {announcements[currentIndex].text}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Dot indicators */}
        <div className="absolute bottom-0.5 left-1/2 flex -translate-x-1/2 gap-1">
          {announcements.map((_, i) => (
            <button
              key={i}
              onClick={() => { goTo(i); startInterval() }}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? 'w-4 bg-primary-foreground'
                  : 'w-1 bg-primary-foreground/40'
              }`}
              aria-label={`Go to announcement ${i + 1}`}
            />
          ))}
        </div>

        {/* Dismiss button */}
        <button
          onClick={() => setDismissed(true)}
          className="ml-2 flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground/20 text-primary-foreground transition-all hover:bg-primary-foreground/30 active:scale-90"
          aria-label="Dismiss announcement"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}
