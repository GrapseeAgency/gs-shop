'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp } from 'lucide-react'

const SCROLL_THRESHOLD = 300
const CIRCLE_RADIUS = 18
const CIRCLE_STROKE = 2.5
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS

export function BackToTop() {
  const [visible, setVisible] = useState(false)
  const [scrollPercent, setScrollPercent] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const percent = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0

      setVisible(scrollTop > SCROLL_THRESHOLD)
      setScrollPercent(percent)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const strokeDashoffset = CIRCLE_CIRCUMFERENCE - (scrollPercent / 100) * CIRCLE_CIRCUMFERENCE

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-border/50 bg-background/80 shadow-lg backdrop-blur-md transition-colors hover:bg-background/95 active:bg-background"
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
              type: 'spring',
              stiffness: 260,
              damping: 20,
            },
          }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Back to top"
        >
          {/* Progress Ring */}
          <svg
            className="absolute inset-0 -rotate-90"
            width="44"
            height="44"
            viewBox="0 0 44 44"
          >
            {/* Background track */}
            <circle
              cx="22"
              cy="22"
              r={CIRCLE_RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth={CIRCLE_STROKE}
              className="text-muted/30"
            />
            {/* Progress arc */}
            <motion.circle
              cx="22"
              cy="22"
              r={CIRCLE_RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth={CIRCLE_STROKE}
              strokeLinecap="round"
              className="text-primary"
              strokeDasharray={CIRCLE_CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              initial={false}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            />
          </svg>

          {/* Arrow Icon */}
          <ArrowUp className="h-4 w-4 text-foreground" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
