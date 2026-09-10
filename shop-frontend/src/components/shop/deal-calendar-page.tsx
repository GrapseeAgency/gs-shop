'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Calendar, Clock, Tag, Zap, Package, Gift,
  Bell, BellRing, ChevronLeft, ChevronRight, Star, Flame,
  Filter, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { toast } from 'sonner'

interface DealItem {
  id: string
  title: string
  description: string
  dealType: string
  discount: number
  startsAt: string
  endsAt: string
  isActive: boolean
  month: string
  config?: { icon: string; color: string; label: string }
  isLive?: boolean
  isUpcoming?: boolean
  isPast?: boolean
  daysUntilStart?: number
  daysUntilEnd?: number
  durationDays?: number
}

type DealFilter = 'all' | 'flash' | 'bundle' | 'clearance' | 'bogo'

const filterConfig: Record<DealFilter, { label: string; icon: React.ElementType; color: string }> = {
  all: { label: 'All', icon: Calendar, color: 'text-foreground' },
  flash: { label: 'Flash Sale', icon: Zap, color: 'text-amber-500' },
  bundle: { label: 'Bundle', icon: Package, color: 'text-violet-500' },
  clearance: { label: 'Clearance', icon: Tag, color: 'text-rose-500' },
  bogo: { label: 'BOGO', icon: Gift, color: 'text-emerald-500' },
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function DealCalendarPage() {
  const { goBack } = useShopRouter()
  const [deals, setDeals] = useState<DealItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<DealFilter>('all')
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedDate, setSelectedDate] = useState<number | null>(new Date().getDate())
  const [reminders, setReminders] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/deal-calendar')
        if (res.ok) {
          const data = await res.json()
          setDeals(data.deals || [])
        }
      } catch {
        // silent
      }
      setLoading(false)
    }
    fetchDeals()
  }, [])

  const filteredDeals = useMemo(() => {
    if (activeFilter === 'all') return deals
    return deals.filter(d => d.dealType === activeFilter || d.dealType === 'seasonal' && activeFilter === 'flash')
  }, [deals, activeFilter])

  const dealsForSelectedDate = useMemo(() => {
    if (!selectedDate) return []
    return filteredDeals.filter(d => {
      const start = new Date(d.startsAt)
      const end = new Date(d.endsAt)
      const selected = new Date(currentYear, currentMonth, selectedDate)
      return selected >= start && selected <= end
    })
  }, [filteredDeals, selectedDate, currentMonth, currentYear])

  const getDealDates = () => {
    const dates: Record<number, DealItem[]> = {}
    filteredDeals.forEach(d => {
      const start = new Date(d.startsAt)
      const end = new Date(d.endsAt)
      const current = new Date(currentYear, currentMonth, 1)
      while (current <= end && current.getMonth() === currentMonth && current.getFullYear() === currentYear) {
        if (current >= start) {
          const day = current.getDate()
          if (!dates[day]) dates[day] = []
          dates[day].push(d)
        }
        current.setDate(current.getDate() + 1)
      }
    })
    return dates
  }

  const dealDates = getDealDates()
  const today = new Date()
  const isToday = (day: number) =>
    today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const prevDays = new Date(currentYear, currentMonth, 0).getDate()
    const days: { day: number; isCurrentMonth: boolean; isToday: boolean; hasDeals: boolean; dealCount: number }[] = []
    for (let i = firstDay - 1; i >= 0; i--) days.push({ day: prevDays - i, isCurrentMonth: false, isToday: false, hasDeals: false, dealCount: 0 })
    for (let d = 1; d <= daysInMonth; d++) {
      const dd = dealDates[d] || []
      days.push({ day: d, isCurrentMonth: true, isToday: isToday(d), hasDeals: dd.length > 0, dealCount: dd.length })
    }
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) days.push({ day: i, isCurrentMonth: false, isToday: false, hasDeals: false, dealCount: 0 })
    return days
  }, [currentMonth, currentYear, dealDates])

  const navigateMonth = (dir: number) => {
    let m = currentMonth + dir
    let y = currentYear
    if (m < 0) { m = 11; y-- }
    if (m > 11) { m = 0; y++ }
    setCurrentMonth(m)
    setCurrentYear(y)
    setSelectedDate(null)
  }

  const toggleReminder = (dealId: string) => {
    setReminders(prev => {
      const next = new Set(prev)
      if (next.has(dealId)) { next.delete(dealId); toast.info('Reminder removed') }
      else { next.add(dealId); toast.success('Reminder set! We\'ll notify you.') }
      return next
    })
  }

  return (
    <motion.div className="min-h-screen bg-background pb-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack} className="flex-shrink-0 text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-500" /> Deal Calendar
            </h1>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="px-4 mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
        {(Object.keys(filterConfig) as DealFilter[]).map(key => {
          const cfg = filterConfig[key]
          const isActive = activeFilter === key
          return (
            <motion.button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                isActive ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' : 'bg-muted/50 text-muted-foreground'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <cfg.icon className="h-3 w-3" /> {cfg.label}
            </motion.button>
          )
        })}
      </div>

      {/* Calendar */}
      <div className="mx-4 mt-3 rounded-2xl border border-border/50 bg-card overflow-hidden">
        {/* Month Nav */}
        <div className="flex items-center justify-between p-3 border-b border-border/30">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigateMonth(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-sm font-bold text-foreground">{MONTHS[currentMonth]} {currentYear}</h3>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigateMonth(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-border/20">
          {DAYS.map(d => (
            <div key={d} className="py-2 text-center text-[10px] font-medium text-muted-foreground">{d}</div>
          ))}
        </div>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((cd, i) => (
            <motion.button
              key={i}
              onClick={() => cd.isCurrentMonth && setSelectedDate(cd.day)}
              className={`relative flex flex-col items-center justify-center py-2 text-xs transition-all ${
                !cd.isCurrentMonth ? 'text-muted-foreground/30' :
                selectedDate === cd.day ? 'bg-amber-500/10 text-amber-500 font-bold' :
                cd.isToday ? 'bg-primary/5 text-primary font-bold' :
                'text-foreground hover:bg-muted/30'
              }`}
              whileTap={cd.isCurrentMonth ? { scale: 0.9 } : undefined}
            >
              <span className={`h-6 w-6 flex items-center justify-center rounded-full ${
                cd.isToday && selectedDate !== cd.day ? 'ring-1 ring-primary/40' : ''
              }`}>{cd.day}</span>
              {cd.hasDeals && (
                <div className="flex gap-0.5 mt-0.5">
                  {Array.from({ length: Math.min(cd.dealCount, 3) }).map((_, j) => (
                    <div key={j} className="h-1 w-1 rounded-full bg-amber-500" />
                  ))}
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Today's Deals Highlight */}
      {deals.filter(d => d.isLive).length > 0 && (
        <div className="mx-4 mt-3">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-bold text-foreground">Live Now</span>
            <Badge className="bg-amber-500/10 text-amber-500 text-[10px]">{deals.filter(d => d.isLive).length} active</Badge>
          </div>
        </div>
      )}

      {/* Deals for Selected Date */}
      <div className="px-4 mt-2">
        <h3 className="text-sm font-bold text-foreground mb-2">
          {selectedDate ? `Deals for ${MONTHS[currentMonth]} ${selectedDate}` : 'Select a date to view deals'}
        </h3>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3">
                <div className="h-10 w-10 rounded-xl bg-muted animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
                  <div className="h-2 w-1/2 rounded bg-muted animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : selectedDate && dealsForSelectedDate.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground/20 mb-2" />
            <p className="text-sm text-muted-foreground">No deals on this date</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {dealsForSelectedDate.map((deal, i) => (
                <motion.div
                  key={deal.id}
                  className="rounded-xl border border-border/50 bg-card p-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-lg flex-shrink-0">
                      {deal.config?.icon || ''}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{deal.title}</p>
                        {deal.isLive && <Badge className="bg-emerald-500/10 text-emerald-500 text-[9px] flex-shrink-0">LIVE</Badge>}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{deal.description}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <Badge variant="outline" className="text-[9px] border-amber-500/30 text-amber-500">
                          {deal.config?.label || deal.dealType}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {deal.durationDays || Math.ceil((new Date(deal.endsAt).getTime() - new Date(deal.startsAt).getTime()) / 86400000)} days
                        </span>
                        <span className="text-xs font-bold text-rose-500">-{deal.discount}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/20">
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(deal.startsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(deal.endsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 gap-1 text-[10px]"
                      onClick={() => toggleReminder(deal.id)}
                    >
                      {reminders.has(deal.id) ? (
                        <><BellRing className="h-3 w-3 text-amber-500" /> Reminder On</>
                      ) : (
                        <><Bell className="h-3 w-3" /> Set Reminder</>
                      )}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  )
}

