'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Radio, MessageCircle, ShoppingBag, Video,
  Zap, Bell, Sparkles, Play, Wifi, Users, Heart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useShopRouter } from '@/hooks/use-shop-router'
import { toast } from 'sonner'

const upcomingFeatures = [
  { icon: Video, label: 'Live Stream', desc: 'Real-time video shopping sessions with host', color: 'text-red-500', bg: 'bg-red-500/10' },
  { icon: MessageCircle, label: 'Live Chat', desc: 'Chat with the host and other shoppers', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { icon: Zap, label: 'Flash Deals', desc: 'Exclusive deals only during live sessions', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { icon: Users, label: 'Co-watching', desc: 'Shop together with friends in real time', color: 'text-violet-500', bg: 'bg-violet-500/10' },
  { icon: ShoppingBag, label: 'One-tap Buy', desc: 'Purchase featured products instantly', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { icon: Bell, label: 'Stream Reminders', desc: 'Get notified before sessions go live', color: 'text-pink-500', bg: 'bg-pink-500/10' },
]

export default function LivePage() {
  const { goBack } = useShopRouter()
  const [notified, setNotified] = useState(false)
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(true)
      setTimeout(() => setPulse(false), 600)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleNotify = () => {
    setNotified(true)
    toast.success("You'll be notified when Live Shopping launches!")
  }

  return (
    <motion.div
      className="min-h-screen pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack} className="text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-red-500" />
            <h1 className="text-lg font-bold text-foreground">Live Shopping</h1>
          </div>
          <Badge className="ml-auto bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">
            Coming Soon
          </Badge>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative mx-4 mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-red-500/20 via-rose-500/10 to-orange-500/15 border border-red-500/20 p-8 text-center">
        {/* Animated background orbs */}
        <motion.div
          className="absolute -top-8 -left-8 h-32 w-32 rounded-full bg-red-500/10 blur-2xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ repeat: Infinity, duration: 4 }}
        />
        <motion.div
          className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-orange-500/10 blur-2xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.7, 0.4] }}
          transition={{ repeat: Infinity, duration: 5 }}
        />

        {/* Main icon */}
        <motion.div
          className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-red-500 to-rose-600 shadow-xl shadow-red-500/30"
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        >
          <Play className="h-12 w-12 text-white fill-white ml-1" />
          {/* Ripple rings */}
          {[1, 2, 3].map((ring) => (
            <motion.div
              key={ring}
              className="absolute inset-0 rounded-3xl border-2 border-red-400/40"
              animate={{ scale: [1, 1.4 + ring * 0.2], opacity: [0.6, 0] }}
              transition={{ repeat: Infinity, duration: 2, delay: ring * 0.4 }}
            />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="mb-2 flex items-center justify-center gap-2">
            <motion.div
              animate={{ scale: pulse ? [1, 1.3, 1] : 1 }}
              transition={{ duration: 0.4 }}
            >
              <Sparkles className="h-5 w-5 text-amber-500" />
            </motion.div>
            <span className="text-xs font-bold uppercase tracking-widest text-red-500">
              Feature in Development
            </span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Live Shopping</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
            We're building something exciting  real-time live streams where you can shop, chat, and grab exclusive deals all at once.
          </p>
        </motion.div>

        {/* Notify button */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          {notified ? (
            <motion.div
              className="flex items-center justify-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-5 py-2.5 mx-auto w-fit"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Heart className="h-4 w-4 text-emerald-500 fill-emerald-500" />
              <span className="text-sm font-semibold text-emerald-600">You're on the list!</span>
            </motion.div>
          ) : (
            <Button
              className="gap-2 rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-shadow"
              onClick={handleNotify}
            >
              <Bell className="h-4 w-4" />
              Notify me when it's live
            </Button>
          )}
        </motion.div>
      </div>

      {/* What's Coming */}
      <div className="mx-4 mt-6">
        <motion.div
          className="mb-4 flex items-center gap-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Wifi className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">What's Coming</h3>
        </motion.div>

        <div className="grid grid-cols-2 gap-3">
          {upcomingFeatures.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.label}
                className="rounded-2xl border border-border/50 bg-card p-4 flex flex-col gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i + 0.4, duration: 0.3 }}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${feature.bg}`}>
                  <Icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">{feature.label}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground leading-snug">{feature.desc}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Bottom tagline */}
      <motion.div
        className="mx-4 mt-6 rounded-2xl border border-border/30 bg-muted/30 p-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <p className="text-xs text-muted-foreground">
          Live Shopping is currently under development and will be available in a future update.
          <br />
          <span className="font-medium text-foreground">Stay tuned  it's going to be worth the wait.</span>
        </p>
      </motion.div>
    </motion.div>
  )
}
