'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useShopRouter } from '@/hooks/use-shop-router'

function useCountdown(targetDate: Date) {
  const calculateTimeLeft = useCallback(() => {
    const difference = targetDate.getTime() - new Date().getTime()
    if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    }
  }, [targetDate])

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)
    return () => clearInterval(timer)
  }, [calculateTimeLeft])

  return timeLeft
}

function FlipDigit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white/20 backdrop-blur-md border border-white/10 shadow-lg">
        {/* Flip line */}
        <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-black/20" />
        <span className="text-xl font-extrabold text-white tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-white/70">
        {label}
      </span>
    </div>
  )
}

export function CountdownSaleBanner() {
  const { goDeals } = useShopRouter()

  // Sale ends 3 days from now
  const saleEnd = new Date()
  saleEnd.setDate(saleEnd.getDate() + 3)
  saleEnd.setHours(23, 59, 59, 999)

  const timeLeft = useCountdown(saleEnd)

  return (
    <section className="px-4 py-4">
      <motion.div
        className="relative overflow-hidden rounded-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-red-600 to-pink-600" />

        {/* Shimmer effect */}
        <div className="absolute inset-0 animate-shimmer" />

        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -left-4 bottom-0 h-24 w-24 rounded-full bg-white/10 blur-xl" />

        {/* Content */}
        <div className="relative z-10 px-5 py-5">
          {/* Badge */}
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">
            <Flame className="h-3.5 w-3.5 text-yellow-300" />
            <span className="text-[11px] font-bold text-white">MEGA SALE LIVE NOW</span>
          </div>

          {/* Title */}
          <h2 className="mb-1 text-2xl font-extrabold text-white tracking-tight">
            MEGA SALE ENDS IN
          </h2>
          <p className="mb-4 text-xs text-white/70">
            Up to 70% off on premium digital services
          </p>

          {/* Countdown */}
          <div className="mb-4 flex items-center gap-2">
            {timeLeft.days > 0 && (
              <FlipDigit value={timeLeft.days} label="Days" />
            )}
            <FlipDigit value={timeLeft.hours} label="HRS" />
            <span className="mt-[-12px] text-xl font-bold text-white/60">:</span>
            <FlipDigit value={timeLeft.minutes} label="MIN" />
            <span className="mt-[-12px] text-xl font-bold text-white/60">:</span>
            <FlipDigit value={timeLeft.seconds} label="SEC" />
          </div>

          {/* CTA */}
          <Button
            onClick={() => goDeals()}
            className="gap-2 bg-white text-red-600 hover:bg-white/90 font-bold shadow-xl shadow-black/20"
            size="lg"
          >
            Shop the Sale
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </section>
  )
}
