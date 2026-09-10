'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, X, ShoppingCart, Gift, Tag, Star, Zap, Crown, MessageCircle,
  Info, Truck, CheckCircle2, AlertTriangle, Shield, Sparkles,
  TrendingDown, Package, Gavel, Settings, ChevronRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useShopRouter } from '@/hooks/use-shop-router'

function playBellSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()

    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(0, ctx.currentTime)
    masterGain.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 0.01)
    masterGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.4)
    masterGain.connect(ctx.destination)

    // Reverb-like convolver via simple delay feedback
    const delay = ctx.createDelay(0.4)
    delay.delayTime.value = 0.18
    const delayGain = ctx.createGain()
    delayGain.gain.value = 0.22
    delay.connect(delayGain)
    delayGain.connect(delay)
    delayGain.connect(masterGain)

    function addTone(freq: number, type: OscillatorType, gainVal: number, startDelay: number, duration: number) {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startDelay)
      // slight pitch drop for bell character
      osc.frequency.exponentialRampToValueAtTime(freq * 0.985, ctx.currentTime + startDelay + 0.12)
      g.gain.setValueAtTime(0, ctx.currentTime + startDelay)
      g.gain.linearRampToValueAtTime(gainVal, ctx.currentTime + startDelay + 0.008)
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startDelay + duration)
      osc.connect(g)
      g.connect(masterGain)
      g.connect(delay)
      osc.start(ctx.currentTime + startDelay)
      osc.stop(ctx.currentTime + startDelay + duration)
    }

    // Primary bell hit D5
    addTone(587.33, 'sine', 0.9, 0,    2.0)
    // Bright harmonic A5 (perfect 5th above)
    addTone(880.0,  'sine', 0.45, 0,   1.4)
    // Bell shimmer D6 (octave)
    addTone(1174.6, 'triangle', 0.22, 0.005, 1.0)
    // Second chime hit F#5 (major 3rd, after 0.22s)
    addTone(739.99, 'sine', 0.6,  0.22, 1.6)
    addTone(1109.0, 'sine', 0.28, 0.22, 1.0)
    // Soft resonance tail low D4
    addTone(293.66, 'sine', 0.18, 0.04, 2.2)

    // Tiny attack click for realism
    const bufSize = ctx.sampleRate * 0.003
    const clickBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate)
    const data = clickBuf.getChannelData(0)
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize)
    const clickSrc = ctx.createBufferSource()
    clickSrc.buffer = clickBuf
    const clickGain = ctx.createGain()
    clickGain.gain.value = 0.06
    clickSrc.connect(clickGain)
    clickGain.connect(masterGain)
    clickSrc.start(ctx.currentTime)

    // Close context after sound finishes
    setTimeout(() => ctx.close(), 3000)
  } catch { /* audio not supported */ }
}

interface NotificationItem {
  id: string
  type: string
  title: string
  message: string
  icon: string | null
  link: string | null
  isRead: boolean
  createdAt: string
}

type FilterTab = 'all' | 'unread' | 'order' | 'deal' | 'reward'

const TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'order', label: 'Orders' },
  { id: 'deal', label: 'Deals' },
  { id: 'reward', label: 'Rewards' },
]

const TYPE_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; iconColor: string; iconBg: string; borderColor: string }> = {
  order:          { icon: Package,      iconColor: 'text-emerald-500', iconBg: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20' },
  order_placed:   { icon: ShoppingCart, iconColor: 'text-emerald-500', iconBg: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20' },
  order_shipped:  { icon: Truck,        iconColor: 'text-cyan-500',    iconBg: 'bg-cyan-500/10',    borderColor: 'border-cyan-500/20' },
  order_delivered:{ icon: CheckCircle2, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-600/10', borderColor: 'border-emerald-600/20' },
  order_cancelled:{ icon: X,            iconColor: 'text-destructive', iconBg: 'bg-destructive/10', borderColor: 'border-destructive/20' },
  deal:           { icon: Zap,          iconColor: 'text-orange-500',  iconBg: 'bg-orange-500/10',  borderColor: 'border-orange-500/20' },
  flash_deal:     { icon: Zap,          iconColor: 'text-orange-500',  iconBg: 'bg-orange-500/10',  borderColor: 'border-orange-500/20' },
  price_drop:     { icon: TrendingDown, iconColor: 'text-amber-500',   iconBg: 'bg-amber-500/10',   borderColor: 'border-amber-500/20' },
  back_in_stock:  { icon: Tag,          iconColor: 'text-violet-500',  iconBg: 'bg-violet-500/10',  borderColor: 'border-violet-500/20' },
  low_stock:      { icon: AlertTriangle,iconColor: 'text-yellow-500',  iconBg: 'bg-yellow-500/10',  borderColor: 'border-yellow-500/20' },
  reward:         { icon: Star,         iconColor: 'text-amber-500',   iconBg: 'bg-amber-500/10',   borderColor: 'border-amber-500/20' },
  reward_earned:  { icon: Star,         iconColor: 'text-amber-500',   iconBg: 'bg-amber-500/10',   borderColor: 'border-amber-500/20' },
  reward_tier_up: { icon: Crown,        iconColor: 'text-yellow-500',  iconBg: 'bg-yellow-500/10',  borderColor: 'border-yellow-500/20' },
  birthday_offer: { icon: Gift,         iconColor: 'text-pink-500',    iconBg: 'bg-pink-500/10',    borderColor: 'border-pink-500/20' },
  auction_outbid: { icon: Gavel,        iconColor: 'text-destructive', iconBg: 'bg-destructive/10', borderColor: 'border-destructive/20' },
  auction_won:    { icon: Crown,        iconColor: 'text-yellow-500',  iconBg: 'bg-yellow-500/10',  borderColor: 'border-yellow-500/20' },
  new_arrival:    { icon: Sparkles,     iconColor: 'text-indigo-500',  iconBg: 'bg-indigo-500/10',  borderColor: 'border-indigo-500/20' },
  promo:          { icon: Tag,          iconColor: 'text-primary',     iconBg: 'bg-primary/10',     borderColor: 'border-primary/20' },
  review_reminder:{ icon: MessageCircle,iconColor: 'text-blue-500',    iconBg: 'bg-blue-500/10',    borderColor: 'border-blue-500/20' },
  security_alert: { icon: Shield,       iconColor: 'text-destructive', iconBg: 'bg-destructive/10', borderColor: 'border-destructive/20' },
  system:         { icon: Info,         iconColor: 'text-muted-foreground', iconBg: 'bg-muted/50', borderColor: 'border-border/30' },
}

function getTypeConfig(type: string) {
  return TYPE_CONFIG[type] ?? TYPE_CONFIG.system
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return date.toLocaleDateString()
}

function SwipeableCard({
  notification,
  onDelete,
  onAction,
  onMarkRead,
  index,
}: {
  notification: NotificationItem
  onDelete: (id: string) => void
  onAction: (n: NotificationItem) => void
  onMarkRead: (id: string) => void
  index: number
}) {
  const [dragX, setDragX] = useState(0)
  const cfg = getTypeConfig(notification.type)
  const Icon = cfg.icon
  const isSwiping = dragX < -20

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -120, height: 0, marginBottom: 0, padding: 0 }}
      transition={{ delay: index * 0.04 }}
      className="relative overflow-hidden rounded-xl"
    >
      {/* Delete hint behind */}
      <div className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 transition-opacity ${isSwiping ? 'opacity-100' : 'opacity-0'} text-destructive`}>
        <X className="h-4 w-4" />
        <span className="text-[10px] font-medium">Delete</span>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -90, right: 0 }}
        dragElastic={0.1}
        onDrag={(_, info) => setDragX(info.offset.x)}
        onDragEnd={(_, info) => {
          setDragX(0)
          if (info.offset.x < -60) onDelete(notification.id)
        }}
        className={`relative flex gap-3 rounded-xl border p-3 transition-colors cursor-grab active:cursor-grabbing ${
          notification.isRead
            ? `bg-card ${cfg.borderColor} border-opacity-30`
            : `bg-primary/5 border-primary/20`
        }`}
        onClick={() => { if (!notification.isRead) onMarkRead(notification.id) }}
      >
        {/* Type icon */}
        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${cfg.iconBg}`}>
          <Icon className={`h-4 w-4 ${cfg.iconColor}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <p className={`text-sm font-semibold leading-tight ${notification.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
              {notification.title}
            </p>
            <button
              className="flex-shrink-0 rounded p-0.5 text-muted-foreground hover:text-destructive transition-colors"
              onClick={e => { e.stopPropagation(); onDelete(notification.id) }}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
            {notification.message}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-[9px] text-muted-foreground/70">{timeAgo(notification.createdAt)}</span>
            {notification.link && (
              <button
                className="text-[10px] font-semibold text-primary hover:underline"
                onClick={e => { e.stopPropagation(); onAction(notification) }}
              >
                View 
              </button>
            )}
          </div>
        </div>

        {/* Unread dot */}
        {!notification.isRead && (
          <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-primary shadow-sm shadow-primary/50" />
        )}
      </motion.div>
    </motion.div>
  )
}

export function NotificationsCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [unreadCount, setUnreadCount] = useState(0)
  const pollRef = useRef<NodeJS.Timeout | null>(null)
  const openPollRef = useRef<NodeJS.Timeout | null>(null)
  const prevCountRef = useRef<number>(0)
  const { goDeals, goRewards, goOrders, goLuxury, goCategory, goHome, goNotifications, goNotificationPreferences } = useShopRouter()

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?countOnly=true')
      if (res.ok) {
        const json = await res.json()
        const newCount = json.count ?? 0
        if (newCount > prevCountRef.current && prevCountRef.current !== 0) {
          playBellSound()
        }
        prevCountRef.current = newCount
        setUnreadCount(newCount)
      }
    } catch { /* silent */ }
  }, [])

  const fetchNotifications = useCallback(async (tab: FilterTab = 'all') => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (tab === 'unread') params.set('unread', 'true')
      else if (tab !== 'all') params.set('type', tab)
      const res = await fetch(`/api/notifications?${params}`)
      if (res.ok) {
        const json = await res.json()
        const data: NotificationItem[] = json.data || []
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.isRead).length)
      }
    } catch { /* silent */ } finally {
      setLoading(false)
    }
  }, [])

  // Background count poll every 30s
  useEffect(() => {
    fetchCount()
    pollRef.current = setInterval(fetchCount, 30_000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [fetchCount])

  // Poll while overlay is open every 60s
  useEffect(() => {
    if (isOpen) {
      fetchNotifications(activeTab)
      openPollRef.current = setInterval(() => fetchNotifications(activeTab), 60_000)
    } else {
      if (openPollRef.current) clearInterval(openPollRef.current)
    }
    return () => { if (openPollRef.current) clearInterval(openPollRef.current) }
  }, [isOpen, activeTab, fetchNotifications])

  const handleOpen = () => { setIsOpen(true); playBellSound() }

  const handleClose = () => {
    setIsOpen(false)
    // Auto-mark all visible as read on close
    const unread = notifications.filter(n => !n.isRead)
    if (unread.length > 0) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
      fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      }).catch(() => {})
    }
  }

  const handleTabChange = (tab: FilterTab) => {
    setActiveTab(tab)
    fetchNotifications(tab)
  }

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true }),
    }).catch(() => {})
  }

  const markRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => {})
  }

  const deleteNotification = async (id: string) => {
    const notif = notifications.find(n => n.id === id)
    setNotifications(prev => prev.filter(n => n.id !== id))
    if (notif && !notif.isRead) setUnreadCount(prev => Math.max(0, prev - 1))
    await fetch('/api/notifications', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => {})
  }

  const handleAction = (notification: NotificationItem) => {
    markRead(notification.id)
    setIsOpen(false)
    if (!notification.link) return
    const href = notification.link
    if (href === '/deals') goDeals()
    else if (href === '/rewards') goRewards()
    else if (href === '/orders') goOrders()
    else if (href === '/luxury') goLuxury()
    else if (href.startsWith('/category/')) goCategory(undefined, href.split('/category/')[1])
    else goHome()
  }

  const tabCount = (tab: FilterTab) => {
    if (tab === 'all') return notifications.length
    if (tab === 'unread') return notifications.filter(n => !n.isRead).length
    return notifications.filter(n => n.type === tab || n.type.startsWith(tab)).length
  }

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-card border border-border/50 transition-colors hover:bg-muted/50 active:scale-95"
        onClick={handleOpen}
        aria-label="Open notifications"
      >
        <Bell className="h-4 w-4 text-muted-foreground" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key={unreadCount}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-0.5 text-[9px] font-bold text-primary-foreground shadow-sm shadow-primary/40"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
        {/* Pulse ring when unread */}
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-primary/40 animate-ping" />
        )}
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
            />
            <motion.div
              className="fixed md:absolute inset-x-0 md:left-auto md:right-0 top-0 md:top-full z-50 flex flex-col w-full md:w-[380px] max-h-[88vh] md:max-h-[520px] rounded-b-3xl md:rounded-2xl border-b md:border border-border/50 bg-background shadow-2xl md:mt-2"
              initial={{ y: -15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/30 bg-background/95 backdrop-blur-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <h2 className="text-base font-bold text-foreground">Notifications</h2>
                  {unreadCount > 0 && (
                    <Badge className="bg-primary/20 text-primary border border-primary/30 text-[9px] px-1.5">{unreadCount} new</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      className="rounded-lg px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary/10 transition-colors"
                      onClick={markAllRead}
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors"
                    onClick={() => { setIsOpen(false); goNotificationPreferences() }}
                    aria-label="Notification settings"
                  >
                    <Settings className="h-3.5 w-3.5" />
                  </button>
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors"
                    onClick={handleClose}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-1.5 overflow-x-auto px-4 py-2.5 scrollbar-hide border-b border-border/20">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex-shrink-0 rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {tab.label}
                    {tab.id !== 'all' && tabCount(tab.id) > 0 && (
                      <span className="ml-1 opacity-70">({tabCount(tab.id)})</span>
                    )}
                  </button>
                ))}
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex gap-3 rounded-xl border border-border/20 p-3 animate-pulse">
                        <div className="h-9 w-9 rounded-xl bg-muted flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3.5 w-3/4 rounded bg-muted" />
                          <div className="h-3 w-full rounded bg-muted" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <motion.div
                    className="flex flex-col items-center py-10 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                      <Bell className="h-7 w-7 text-muted-foreground/30" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {activeTab === 'unread' ? 'All caught up!' : 'No notifications yet'}
                    </p>
                    <p className="text-[11px] text-muted-foreground/60 mt-1">
                      We'll let you know when something arrives
                    </p>
                  </motion.div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {notifications.map((n, i) => (
                      <SwipeableCard
                        key={n.id}
                        notification={n}
                        index={i}
                        onDelete={deleteNotification}
                        onAction={handleAction}
                        onMarkRead={markRead}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-border/20 px-4 py-3">
                <button
                  className="flex w-full items-center justify-between rounded-xl bg-muted/40 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/60 transition-colors"
                  onClick={() => { setIsOpen(false); goNotifications() }}
                >
                  <span>View all notifications</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

