'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, ShoppingCart, Gift, Tag, Star, Zap, Crown, MessageCircle, Info, Clock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useShopRouter } from '@/hooks/use-shop-router'

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

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  zap: Zap,
  gift: Gift,
  tag: Tag,
  star: Star,
  crown: Crown,
  package: ShoppingCart,
  info: Info,
  clock: Clock,
  message: MessageCircle,
}

const iconColorMap: Record<string, string> = {
  deal: 'text-destructive',
  reward: 'text-amber-500',
  promo: 'text-primary',
  system: 'text-amber-400',
  order: 'text-emerald-500',
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

export function NotificationsCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)
  const { goDeals, goRewards, goOrders, goLuxury, goCategory, goHome } = useShopRouter()

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const json = await res.json()
        setNotifications(json.data || [])
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Refetch when opening
  const handleOpen = () => {
    setIsOpen(true)
    fetchNotifications()
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      })
    } catch {
      // silently fail
    }
  }

  const markRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
    } catch {
      // silently fail
    }
  }

  const deleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    try {
      await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
    } catch {
      // silently fail
    }
  }

  const handleAction = (notification: NotificationItem) => {
    markRead(notification.id)
    setIsOpen(false)
    if (notification.link) {
      const href = notification.link
      if (href === '/deals') goDeals()
      else if (href === '/rewards') goRewards()
      else if (href === '/orders') goOrders()
      else if (href === '/luxury') goLuxury()
      else if (href.startsWith('/category/')) {
        const slug = href.split('/category/')[1]
        goCategory(undefined, slug)
      }
      else goHome()
    }
  }

  const getIcon = (notification: NotificationItem) => {
    const iconName = notification.icon || notification.type
    const Icon = iconMap[iconName] || Bell
    return Icon
  }

  const getIconColor = (notification: NotificationItem) => {
    return iconColorMap[notification.type] || 'text-muted-foreground'
  }

  return (
    <>
      {/* Bell Button */}
      <button
        className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-card border border-border/50 transition-colors hover:bg-muted/50 active:scale-95"
        onClick={handleOpen}
      >
        <Bell className="h-4 w-4 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
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
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="fixed inset-x-0 top-0 z-50 max-h-[85vh] overflow-y-auto rounded-b-3xl border-b border-border/50 bg-background shadow-2xl"
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/30 bg-background/90 backdrop-blur-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <h2 className="text-base font-bold text-foreground">Notifications</h2>
                  {unreadCount > 0 && (
                    <Badge className="bg-destructive text-white text-[9px]">{unreadCount} new</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      className="text-[11px] font-medium text-primary hover:underline"
                      onClick={markAllRead}
                    >
                      Mark all read
                    </button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="p-4 space-y-2">
                {loading ? (
                  // Loading skeletons
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="flex gap-3 rounded-xl p-3 animate-pulse">
                        <div className="h-9 w-9 rounded-xl bg-muted flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-3/4 rounded bg-muted" />
                          <div className="h-3 w-full rounded bg-muted" />
                          <div className="h-3 w-1/4 rounded bg-muted" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center py-8 text-center">
                    <Bell className="h-10 w-10 text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">No notifications yet</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">We&apos;ll let you know when something arrives</p>
                  </div>
                ) : (
                  notifications.map((notification, index) => {
                    const Icon = getIcon(notification)
                    const iconColor = getIconColor(notification)
                    return (
                      <motion.div
                        key={notification.id}
                        className={`relative flex gap-3 rounded-xl p-3 transition-colors ${
                          notification.isRead ? 'bg-transparent' : 'bg-primary/5 border border-primary/10'
                        }`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                      >
                        {/* Icon */}
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-muted/50">
                          <Icon className={`h-4 w-4 ${iconColor}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-semibold ${notification.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                              {notification.title}
                            </p>
                            <button
                              className="flex-shrink-0 text-muted-foreground hover:text-foreground"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-2">{notification.message}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-[9px] text-muted-foreground">{timeAgo(notification.createdAt)}</span>
                            {notification.link && (
                              <button
                                className="text-[10px] font-medium text-primary hover:underline"
                                onClick={() => handleAction(notification)}
                              >
                                View
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Unread dot */}
                        {!notification.isRead && (
                          <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-primary" />
                        )}
                      </motion.div>
                    )
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
