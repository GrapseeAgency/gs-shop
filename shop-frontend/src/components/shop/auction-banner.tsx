'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Flame, Gavel, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useShopRouter } from '@/hooks/use-shop-router'

interface LiveAuction {
  id: string
  product: { name: string; imageUrl: string | null }
  currentBid: number
  bidCount: number
  endTime: string
}

function useCountdown(endTime: string) {
  const calculate = useCallback(() => {
    const diff = new Date(endTime).getTime() - Date.now()
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 }
    return {
      hours: Math.floor(diff / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    }
  }, [endTime])

  const [timeLeft, setTimeLeft] = useState(calculate)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(calculate())
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [calculate])

  return timeLeft
}

function CountdownDigit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/20 text-sm font-bold text-white backdrop-blur-sm">
        {String(value).padStart(2, '0')}
      </div>
      <span className="mt-0.5 text-[8px] font-medium uppercase text-orange-100">{label}</span>
    </div>
  )
}

export function AuctionBanner() {
  const { goAuctions } = useShopRouter()
  const [auction, setAuction] = useState<LiveAuction | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLiveAuction = async () => {
      try {
        const res = await fetch('/api/auctions?status=live')
        if (res.ok) {
          const data = await res.json()
          const auctions: LiveAuction[] = data.data || data
          if (auctions.length > 0) {
            setAuction(auctions[0])
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchLiveAuction()
  }, [])

  const timeLeft = useCountdown(auction?.endTime || new Date().toISOString())

  if (loading) {
    return (
      <section className="px-4 py-4">
        <div className="h-28 animate-pulse rounded-2xl bg-gradient-to-r from-red-500/20 to-orange-500/20" />
      </section>
    )
  }

  if (!auction) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="px-4 py-4"
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 via-orange-500 to-amber-500 p-5 shadow-lg shadow-red-500/20">
        {/* Background decoration */}
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-glass-deep/10 blur-2xl" />
        <div className="absolute -bottom-3 -left-3 h-20 w-20 rounded-full bg-yellow-300/15 blur-xl" />

        <div className="relative z-10">
          {/* Header */}
          <div className="mb-3 flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Flame className="h-5 w-5 text-yellow-200" />
            </motion.div>
            <h3 className="text-lg font-bold text-white">Live Auctions</h3>
          </div>

          {/* Featured auction */}
          <div className="mb-3 rounded-xl bg-black/15 p-3 backdrop-blur-sm">
            <p className="text-sm font-semibold text-white truncate">
              {auction.product.name}
            </p>
            <div className="mt-1.5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-orange-100">Current Bid</p>
                <p className="text-base font-bold text-white">{auction.currentBid.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-orange-100">
                <Gavel className="h-3 w-3" />
                <span>{auction.bidCount} bids</span>
              </div>
            </div>
          </div>

          {/* Countdown + CTA */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CountdownDigit value={timeLeft.hours} label="HRS" />
              <span className="text-white/60 text-sm font-bold">:</span>
              <CountdownDigit value={timeLeft.minutes} label="MIN" />
              <span className="text-white/60 text-sm font-bold">:</span>
              <CountdownDigit value={timeLeft.seconds} label="SEC" />
            </div>
            <Button
              onClick={() => goAuctions()}
              className="bg-glass-deep text-red-600 hover:bg-glass-deep/90 shadow-md font-bold text-sm px-4 gap-1.5"
            >
              Bid Now
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

