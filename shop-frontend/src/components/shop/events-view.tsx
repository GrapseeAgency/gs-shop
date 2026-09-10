'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Calendar, Clock, MapPin, Sparkles,
  Share2, Award, Info, ChevronRight, CheckCircle2,
  CalendarDays, Flame, AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useShopRouter } from '@/hooks/use-shop-router'
import { toast } from 'sonner'

export interface Event {
  id: string
  title: string
  description: string | null
  startDate: string
  endDate: string | null
  imageUrl: string | null
  isActive: boolean
  createdAt: string
}

type FilterType = 'all' | 'ongoing' | 'upcoming' | 'past'

export function EventsView() {
  const { goBack } = useShopRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/events')
        if (res.ok) {
          const data = await res.json()
          setEvents(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error('Failed to load events:', error)
        toast.error('Could not load upcoming events')
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  const getEventStatus = (event: Event): 'ongoing' | 'upcoming' | 'past' => {
    const now = new Date().getTime()
    const start = new Date(event.startDate).getTime()
    const end = event.endDate ? new Date(event.endDate).getTime() : null

    if (!event.isActive) return 'past'
    if (now < start) return 'upcoming'
    if (end && now > end) return 'past'
    return 'ongoing'
  }

  const filteredEvents = events.filter(event => {
    const status = getEventStatus(event)
    if (filter === 'all') return true
    return status === filter
  })

  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatEventTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleShare = (event: Event) => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description || `Join Grapsee Event: ${event.title}!`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(`${event.title} starts on ${formatEventDate(event.startDate)}! Join us on Grapsee Shop.`)
      toast.success('Event details copied to clipboard!')
    }
  }

  const handleRegister = (event: Event) => {
    toast.success(`Registered successfully for "${event.title}"! Check your email for joining links.`)
  }

  return (
    <motion.div
      className="pb-8 min-h-screen bg-background"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2">
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
              <CalendarDays className="h-5 w-5 text-violet-500" />
              Community Events
            </h1>
            <p className="text-[11px] text-muted-foreground">{events.length} events scheduled</p>
          </div>
        </div>
      </div>

      {/* Featured Banner */}
      <div className="mx-4 mt-4 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600/15 via-purple-600/10 to-transparent border border-violet-500/20 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/20 animate-pulse">
            <Sparkles className="h-6 w-6 text-violet-500" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Grapsee Tech & Sales Community</h2>
            <p className="text-xs text-muted-foreground">Learn, build, and save with exclusive webinars and direct sales.</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-4 flex gap-2 overflow-x-auto px-4 scrollbar-hide">
        {[
          { key: 'all' as FilterType, label: 'All Events' },
          { key: 'ongoing' as FilterType, label: 'Live Now' },
          { key: 'upcoming' as FilterType, label: 'Upcoming' },
          { key: 'past' as FilterType, label: 'Completed' }
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors ${
              filter === item.key
                ? 'bg-violet-600 text-white'
                : 'bg-muted/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="px-4 mt-4 space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card p-4 space-y-3">
              <div className="h-40 w-full animate-pulse bg-muted rounded-xl" />
              <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
              <div className="h-8 w-24 animate-pulse rounded bg-muted" />
            </div>
          ))
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground">No events found</p>
            <p className="mt-1 text-xs text-muted-foreground">Check back later for new community schedules!</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredEvents.map((event, index) => {
              const status = getEventStatus(event)
              return (
                <motion.div
                  key={event.id}
                  className="overflow-hidden rounded-2xl border border-border/50 bg-card hover:border-violet-500/25 transition-all shadow-sm flex flex-col"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: index * 0.05 }}
                >
                  {/* Event Image Banner */}
                  <div className="relative h-44 w-full bg-gradient-to-br from-violet-600/20 via-purple-600/5 to-transparent flex items-center justify-center">
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Calendar className="h-10 w-10 text-violet-500/40" />
                        <span className="text-xs text-muted-foreground">Community Event</span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 z-10">
                      {status === 'ongoing' && (
                        <Badge className="bg-emerald-500 text-white shadow-md animate-pulse border-none flex items-center gap-1">
                          <Flame className="h-3 w-3" /> LIVE NOW
                        </Badge>
                      )}
                      {status === 'upcoming' && (
                        <Badge className="bg-violet-600 text-white shadow-md border-none flex items-center gap-1">
                          <Clock className="h-3 w-3" /> UPCOMING
                        </Badge>
                      )}
                      {status === 'past' && (
                        <Badge className="bg-muted text-muted-foreground shadow-sm border-none flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> COMPLETED
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-foreground leading-tight hover:text-violet-500 transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                        {event.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border/40 space-y-2 text-xs">
                      {/* Dates */}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 text-violet-500" />
                        <span>
                          {formatEventDate(event.startDate)}
                          {event.endDate && ` - ${formatEventDate(event.endDate)}`}
                        </span>
                      </div>

                      {/* Times */}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 text-violet-500" />
                        <span>
                          {formatEventTime(event.startDate)}
                          {event.endDate && ` to ${formatEventTime(event.endDate)}`}
                        </span>
                      </div>

                      {/* Location (Standard Online/Webinar) */}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 text-violet-500" />
                        <span>Live Webinar / Grapsee Portal</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4">
                      <Button
                        onClick={() => handleRegister(event)}
                        disabled={status === 'past'}
                        className={`flex-1 font-bold ${
                          status === 'past'
                            ? 'bg-muted text-muted-foreground cursor-not-allowed'
                            : 'bg-violet-600 hover:bg-violet-700 text-white'
                        }`}
                      >
                        {status === 'past' ? 'Completed' : status === 'ongoing' ? 'Join Stream' : 'RSVP Now'}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleShare(event)}
                        className="border-violet-500/20 text-violet-500 hover:bg-violet-500/10"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  )
}

