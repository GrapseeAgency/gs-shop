'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  ArrowLeft, Bell, ShoppingCart, Gift, Tag, Star, Zap, Crown,
  MessageCircle, Info, Truck, CheckCircle2, AlertTriangle, Shield,
  Sparkles, TrendingDown, Package, Gavel, Trash2, CheckCheck,
  RefreshCw, Settings,
} from 'lucide-react'
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
  metadata: string | null
  priority: string
  isRead: boolean
  createdAt: string
}

const TYPE_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; iconColor: string; iconBg: string; borderColor: string; label: string }> = {
  order:          { icon: Package,      iconColor: 'text-emerald-500', iconBg: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20', label: 'Order' },
  order_placed:   { icon: ShoppingCart, iconColor: 'text-emerald-500', iconBg: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20', label: 'Order Placed' },
  order_shipped:  { icon: Truck,        iconColor: 'text-cyan-500',    iconBg: 'bg-cyan-500/10',    borderColor: 'border-cyan-500/20',    label: 'Shipped' },
  order_delivered:{ icon: CheckCircle2, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-600/10', borderColor: 'border-emerald-600/20', label: 'Delivered' },
  order_cancelled:{ icon: AlertTriangle,iconColor: 'text-destructive', iconBg: 'bg-destructive/10', borderColor: 'border-destructive/20', label: 'Cancelled' },
  deal:           { icon: Zap,          iconColor: 'text-orange-500',  iconBg: 'bg-orange-500/10',  borderColor: 'border-orange-500/20',  label: 'Deal' },
  flash_deal:     { icon: Zap,          iconColor: 'text-orange-500',  iconBg: 'bg-orange-500/10',  borderColor: 'border-orange-500/20',  label: 'Flash Deal' },
  price_drop:     { icon: TrendingDown, iconColor: 'text-amber-500',   iconBg: 'bg-amber-500/10',   borderColor: 'border-amber-500/20',   label: 'Price Drop' },
  back_in_stock:  { icon: Tag,          iconColor: 'text-violet-500',  iconBg: 'bg-violet-500/10',  borderColor: 'border-violet-500/20',  label: 'Back in Stock' },
  low_stock:      { icon: AlertTriangle,iconColor: 'text-yellow-500',  iconBg: 'bg-yellow-500/10',  borderColor: 'border-yellow-500/20',  label: 'Low Stock' },
  reward:         { icon: Star,         iconColor: 'text-amber-500',   iconBg: 'bg-amber-500/10',   borderColor: 'border-amber-500/20',   label: 'Reward' },
  reward_earned:  { icon: Star,         iconColor: 'text-amber-500',   iconBg: 'bg-amber-500/10',   borderColor: 'border-amber-500/20',   label: 'Points Earned' },
  reward_tier_up: { icon: Crown,        iconColor: 'text-yellow-500',  iconBg: 'bg-yellow-500/10',  borderColor: 'border-yellow-500/20',  label: 'Tier Up!' },
  birthday_offer: { icon: Gift,         iconColor: 'text-pink-500',    iconBg: 'bg-pink-500/10',    borderColor: 'border-pink-500/20',    label: 'Birthday Offer' },
  auction_outbid: { icon: Gavel,        iconColor: 'text-destructive', iconBg: 'bg-destructive/10', borderColor: 'border-destructive/20', label: 'Outbid' },
  auction_won:    { icon: Crown,        iconColor: 'text-yellow-500',  iconBg: 'bg-yellow-500/10',  borderColor: 'border-yellow-500/20',  label: 'Auction Won' },
  new_arrival:    { icon: Sparkles,     iconColor: 'text-indigo-500',  iconBg: 'bg-indigo-500/10',  borderColor: 'border-indigo-500/20',  label: 'New Arrival' },
  promo:          { icon: Tag,          iconColor: 'text-primary',     iconBg: 'bg-primary/10',     borderColor: 'border-primary/20',     label: 'Promo' },
  review_reminder:{ icon: MessageCircle,iconColor: 'text-blue-500',    iconBg: 'bg-blue-500/10',    borderColor: 'border-blue-500/20',    label: 'Review' },
  security_alert: { icon: Shield,       iconColor: 'text-destructive', iconBg: 'bg-destructive/10', borderColor: 'border-destructive/20', label: 'Security' },
  system:         { icon: Info,         iconColor: 'text-muted-foreground', iconBg: 'bg-muted/50', borderColor: 'border-border/30',       label: 'System' },
}

function getTypeConfig(type: string) {
  return TYPE_CONFIG[type] ?? TYPE_CONFIG.system
}

type FilterTab = 'all' | 'unread' | 'order' | 'deal' | 'reward'

const tabs: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'order', label: 'Orders' },
  { id: 'deal', label: 'Deals' },
  { id: 'reward', label: 'Rewards' },
]

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

function getActionLabel(type: string): string | null {
  if (type.startsWith('order')) return 'Track Order'
  if (type === 'auction_outbid' || type === 'auction_won') return 'View Auction'
  if (type === 'price_drop' || type === 'back_in_stock' || type === 'low_stock') return 'Shop Now'
  if (type === 'reward_earned' || type === 'reward_tier_up') return 'View Rewards'
  if (type === 'review_reminder') return 'Write Review'
  if (type === 'new_arrival') return 'Explore'
  if (type === 'birthday_offer' || type === 'promo' || type === 'flash_deal' || type === 'deal') return 'View Deal'
  if (type === 'security_alert') return 'Review Now'
  return null
}

export default function NotificationsPage() {
  const { goBack, goDeals, goRewards, goOrders, goLuxury, goCategory, goHome, goNotificationPreferences } = useShopRouter()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')

  const fetchNotifications = useCallback(async (tab: FilterTab = 'all') => {
    try {
      const params = new URLSearchParams()
      if (tab === 'unread') params.set('unread', 'true')
      else if (tab !== 'all') params.set('type', tab)
      const res = await fetch(`/api/notifications?${params}`)
      if (res.ok) {
        const json = await res.json()
        setNotifications(json.data || [])
      }
    } catch {
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications(activeTab)
  }, [fetchNotifications, activeTab])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchNotifications(activeTab)
    toast.success('Refreshed')
  }

  const markRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => {})
  }

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true }),
    }).catch(() => {})
    toast.success('All marked as read')
  }

  const deleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    await fetch('/api/notifications', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => {})
  }

  const handleAction = (notification: NotificationItem) => {
    markRead(notification.id)
    if (!notification.link) return
    const href = notification.link
    if (href === '/deals' || href === '/flash-sale') goDeals()
    else if (href === '/rewards') goRewards()
    else if (href === '/orders' || href.startsWith('/orders/')) goOrders()
    else if (href === '/luxury') goLuxury()
    else if (href.startsWith('/category/')) goCategory(undefined, href.split('/category/')[1])
    else goHome()
  }

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true
    if (activeTab === 'unread') return !n.isRead
    return n.type === activeTab || n.type.startsWith(activeTab)
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <motion.div
      className="px-4 py-2 pb-8"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={goBack} className="flex-shrink-0 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notifications
          </h1>
          <p className="text-xs text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted/50"
          onClick={goNotificationPreferences}
        >
          <Settings className="h-4 w-4" />
        </button>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted/50"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.id === 'unread' && unreadCount > 0 && (
              <span className="ml-1 opacity-70">({unreadCount})</span>
            )}
          </button>
        ))}
      </div>

      {/* Actions bar */}
      {unreadCount > 0 && (
        <div className="mb-3 flex justify-end">
          <button
            className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
            onClick={markAllRead}
          >
            <CheckCheck className="h-3 w-3" />
            Mark all as read
          </button>
        </div>
      )}

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-2.5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex gap-3 rounded-2xl border border-border/20 bg-card p-4 animate-pulse">
              <div className="h-11 w-11 rounded-xl bg-muted flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-1/3 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <motion.div
          className="flex flex-col items-center justify-center py-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Bell className="h-10 w-10 text-muted-foreground/30" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {activeTab === 'unread' ? 'All caught up!' : 'No notifications yet'}
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            {activeTab === 'unread' ? 'Nothing left to read' : 'We\'ll notify you when something arrives'}
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-2.5">
            {filteredNotifications.map((notification, index) => {
              const cfg = getTypeConfig(notification.type)
              const Icon = cfg.icon
              const actionLabel = getActionLabel(notification.type)
              const metadata = notification.metadata ? (() => { try { return JSON.parse(notification.metadata) } catch { return null } })() : null
              const isUrgent = notification.priority === 'urgent' || notification.priority === 'high'
              return (
                <motion.div
                  key={notification.id}
                  layout
                  className={`relative rounded-2xl border-l-[3px] border border-r-border/20 border-t-border/20 border-b-border/20 p-4 transition-colors ${
                    notification.isRead ? 'bg-card' : 'bg-primary/5 border-t-primary/10 border-r-primary/10 border-b-primary/10'
                  }`}
                  style={{ borderLeftColor: notification.isRead ? 'transparent' : undefined }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100, height: 0, padding: 0, marginBottom: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <div className="flex gap-3">
                    {/* Icon with type color */}
                    <div className={`relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${cfg.iconBg}`}>
                      <Icon className={`h-5 w-5 ${cfg.iconColor}`} />
                      {isUrgent && !notification.isRead && (
                        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-destructive border-2 border-background animate-pulse" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Type badge + actions */}
                      <div className="flex items-start justify-between gap-1 mb-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[9px] font-bold uppercase tracking-wide ${cfg.iconColor}`}>
                            {cfg.label}
                          </span>
                          {isUrgent && (
                            <span className="rounded-full bg-destructive/20 px-1.5 py-0.5 text-[8px] font-bold text-destructive uppercase">
                              Urgent
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          {!notification.isRead && (
                            <button
                              className="flex h-6 w-6 items-center justify-center rounded-md text-primary hover:bg-primary/10"
                              onClick={() => markRead(notification.id)}
                              title="Mark as read"
                            >
                              <CheckCheck className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => deleteNotification(notification.id)}
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className={`text-sm font-semibold leading-snug ${notification.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {notification.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {notification.message}
                      </p>

                      {/* Metadata row */}
                      {metadata && (metadata.price || metadata.productName) && (
                        <div className={`mt-1.5 flex items-center gap-2 rounded-lg px-2 py-1.5 ${cfg.iconBg}`}>
                          {metadata.productName && (
                            <span className="text-[11px] font-medium text-foreground truncate">{metadata.productName}</span>
                          )}
                          {metadata.price && (
                            <span className={`text-[11px] font-bold ${cfg.iconColor}`}>${metadata.price}</span>
                          )}
                        </div>
                      )}

                      {/* Footer row */}
                      <div className="mt-2 flex items-center gap-3">
                        <span className="text-[10px] text-muted-foreground/70">{timeAgo(notification.createdAt)}</span>
                        {(notification.link || actionLabel) && (
                          <button
                            className={`text-[11px] font-semibold hover:underline ${cfg.iconColor}`}
                            onClick={() => handleAction(notification)}
                          >
                            {actionLabel ?? 'View '}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Unread left accent bar */}
                  {!notification.isRead && (
                    <div className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-primary shadow-md shadow-primary/30" />
                  )}
                </motion.div>
              )
            })}
          </div>
        </AnimatePresence>
      )}
    </motion.div>
  )
}
