'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Flame, Gavel, Users, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useShopRouter } from '@/hooks/use-shop-router'
import {
  MegaSaleIllustration,
  AuctionIllustration,
  CommunityIllustration,
  BlogIllustration,
} from './illustrations'

// Types matching API response
export interface EventData {
  id: string
  type: 'MEGA_SALE' | 'AUCTION' | 'COMMUNITY' | 'BLOG_FEATURED' | 'FLASH_SALE'
  title: string
  subtitle?: string
  description?: string
  status: 'UPCOMING' | 'ACTIVE' | 'ENDED' | 'HIDDEN'
  timeLeft: {
    days: number
    hours: number
    minutes: number
    seconds: number
  } | null
  startTime: string
  endTime: string
  gradient: {
    from: string
    via?: string
    to: string
  }
  badge?: {
    text?: string
    color?: string
  }
  cta: {
    text: string
    link?: string
  }
  discountText?: string
  illustrationType: string
  product?: {
    id: string
    name: string
    slug: string
    imageUrl?: string
  }
  auctionData?: {
    currentBid: number
    bidCount: number
    minBidIncrement: number
    startPrice: number
  }
  priority: number
  isActive: boolean
}

// Get illustration component based on type
function getIllustration(type: string) {
  switch (type) {
    case 'MEGA_SALE':
    case 'FLASH_SALE':
      return <MegaSaleIllustration />
    case 'AUCTION':
      return <AuctionIllustration />
    case 'COMMUNITY':
      return <CommunityIllustration />
    case 'BLOG_FEATURED':
      return <BlogIllustration />
    default:
      return <MegaSaleIllustration />
  }
}

// Get icon based on type
function getIcon(type: string) {
  switch (type) {
    case 'MEGA_SALE':
    case 'FLASH_SALE':
      return Flame
    case 'AUCTION':
      return Gavel
    case 'COMMUNITY':
      return Users
    case 'BLOG_FEATURED':
      return BookOpen
    default:
      return Flame
  }
}

// Flip digit component for countdown
function FlipDigit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center overflow-hidden rounded-xl bg-white/20 backdrop-blur-md border border-white/10 shadow-lg">
        <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-black/20" />
        <span className="text-lg sm:text-xl font-extrabold text-white tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="mt-1 text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider text-white/70">
        {label}
      </span>
    </div>
  )
}

// Upcoming placeholder component
function UpcomingPlaceholder({ event }: { event: EventData }) {
  const Icon = getIcon(event.type)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 overflow-hidden rounded-2xl"
      style={{
        background: `linear-gradient(135deg, ${event.gradient.from}, ${event.gradient.via || event.gradient.from}, ${event.gradient.to})`,
      }}
    >
      <div className="relative px-5 py-6">
        {/* Badge */}
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">
          <Icon className="h-3.5 w-3.5 text-white/80" />
          <span className="text-[11px] font-bold text-white/90">COMING SOON</span>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
          {event.title}
        </h3>
        <p className="text-xs text-white/70 mb-3">
          {event.subtitle || 'Stay tuned for amazing offers!'}
        </p>

        <div className="flex items-center gap-2 text-white/60 text-xs">
          <span>Starts at:</span>
          <span className="font-medium">
            {new Date(event.startTime).toLocaleDateString()}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// Main event banner component
export function EventBanner({ 
  event, 
  variant = 'full' 
}: { 
  event: EventData
  variant?: 'full' | 'compact' 
}) {
  const { goDeals, goAuctions, goProduct } = useShopRouter()
  const [timeLeft, setTimeLeft] = useState(event.timeLeft)
  const Icon = getIcon(event.type)

  // Countdown timer effect
  useEffect(() => {
    if (event.status !== 'ACTIVE' || !event.endTime) return

    const calculateTimeLeft = () => {
      const diff = new Date(event.endTime).getTime() - Date.now()
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      }
    }

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [event.status, event.endTime])

  // Handle CTA click
  const handleClick = useCallback(() => {
    switch (event.type) {
      case 'MEGA_SALE':
      case 'FLASH_SALE':
        goDeals()
        break
      case 'AUCTION':
        goAuctions()
        break
      case 'COMMUNITY':
        // Navigate to community page
        break
      case 'BLOG_FEATURED':
        // Navigate to blog
        break
      default:
        if (event.cta.link) {
          // Navigate to link
        }
    }
  }, [event.type, event.cta.link, goDeals, goAuctions])

  // Don't render if hidden
  if (event.status === 'HIDDEN' || !event.isActive) {
    return null
  }

  // Show upcoming placeholder
  if (event.status === 'UPCOMING') {
    return <UpcomingPlaceholder event={event} />
  }

  // Compact variant (for smaller spaces)
  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-4 overflow-hidden rounded-2xl shadow-lg"
        style={{ height: '160px' }}
      >
        <div className="relative h-full">
          {/* Illustration */}
          <div className="absolute inset-0">
            {getIllustration(event.type)}
          </div>
          
          {/* Content overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="h-3 w-3 text-white/80" />
                  <span className="text-[10px] font-bold text-white/80 uppercase">
                    {event.badge?.text || event.type.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white leading-tight">
                  {event.title}
                </h3>
              </div>
              
              <Button
                size="sm"
                onClick={handleClick}
                className="h-7 px-2 bg-white/90 hover:bg-white text-gray-900 text-xs font-bold"
              >
                {event.cta.text}
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // Full variant (default)
  return (
    <section className="px-4 py-4">
      <motion.div
        className="relative overflow-hidden rounded-2xl shadow-2xl"
        style={{ height: '280px' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Illustration background */}
        <div className="absolute inset-0">
          {getIllustration(event.type)}
        </div>

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-between p-5">
          {/* Top section - Badge */}
          <div>
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5"
            >
              <Icon 
                className="h-4 w-4" 
                style={{ color: event.badge?.color || '#fbbf24' }}
              />
              <span 
                className="text-[11px] font-bold"
                style={{ color: event.badge?.color || '#fbbf24' }}
              >
                {event.badge?.text || 'EVENT LIVE'}
              </span>
            </motion.div>
          </div>

          {/* Middle section - Title & Description */}
          <div className="flex-1 flex flex-col justify-center">
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-lg"
            >
              {event.title}
            </motion.h2>
            
            {event.subtitle && (
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-1 text-sm text-white/80 drop-shadow"
              >
                {event.subtitle}
              </motion.p>
            )}

            {/* Auction specific data */}
            {event.type === 'AUCTION' && event.auctionData && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-3 bg-white/10 backdrop-blur rounded-lg p-2 inline-flex items-center gap-3 w-fit"
              >
                <div>
                  <div className="text-[10px] text-white/60">Current Bid</div>
                  <div className="text-lg font-bold text-white">
                    {event.auctionData.currentBid.toLocaleString()}
                  </div>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div>
                  <div className="text-[10px] text-white/60">Bids</div>
                  <div className="text-sm font-bold text-white">
                    {event.auctionData.bidCount}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Bottom section - Countdown & CTA */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            {/* Countdown */}
            {timeLeft && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="text-[10px] text-white/60 mb-1 uppercase tracking-wider">
                  Ends In
                </div>
                <div className="flex items-center gap-1.5">
                  {timeLeft.days > 0 && (
                    <FlipDigit value={timeLeft.days} label="Days" />
                  )}
                  <FlipDigit value={timeLeft.hours} label="HRS" />
                  <span className="mt-[-12px] text-lg font-bold text-white/60">:</span>
                  <FlipDigit value={timeLeft.minutes} label="MIN" />
                  <span className="mt-[-12px] text-lg font-bold text-white/60">:</span>
                  <FlipDigit value={timeLeft.seconds} label="SEC" />
                </div>
              </motion.div>
            )}

            {/* CTA Button */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                onClick={handleClick}
                size="lg"
                className="gap-2 bg-white hover:bg-white/90 text-gray-900 font-bold shadow-xl"
              >
                {event.cta.text}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

// Hook to fetch events
export function useEvents(types?: string[], limit: number = 5) {
  const [events, setEvents] = useState<EventData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const params = new URLSearchParams()
        if (types) params.set('types', types.join(','))
        params.set('limit', limit.toString())
        
        const res = await fetch(`/api/events?${params}`)
        if (!res.ok) throw new Error('Failed to fetch events')
        
        const data = await res.json()
        setEvents(data.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [types?.join(','), limit])

  return { events, loading, error }
}
