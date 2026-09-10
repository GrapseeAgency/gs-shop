'use client'

import { motion } from 'framer-motion'
import { Smartphone, Bell, Zap, ShoppingCart, QrCode, Truck, Shield, Star } from 'lucide-react'

function AppleStoreBadge() {
  return (
    <svg width="120" height="36" viewBox="0 0 120 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="36" rx="6" fill="currentColor" className="text-foreground" />
      <path d="M22.5 18.5C22.5 16.5 24.1 15 24.1 15C24.1 15 22.9 13.3 21 13.3C19.1 13.2 18.3 14.5 17.8 14.5C17.3 14.5 16.6 13.3 15 13.3C13.4 13.3 11.8 14.6 11.8 17C11.8 19.4 13.5 22 14.8 22C15.5 22 16.1 21.5 17.1 21.5C18.1 21.5 18.5 22 19.3 22C20.1 22 20.7 21.5 21.5 20.7C22.3 19.9 22.5 18.5 22.5 18.5Z" fill="white" />
      <path d="M20.5 12.3C21.3 11.3 21.7 10 21.6 8.7C20.3 8.8 19 9.5 18.2 10.5C17.5 11.4 17 12.7 17.1 13.9C18.5 14 19.7 13.3 20.5 12.3Z" fill="white" />
      <text x="30" y="15" fill="white" fontSize="7" fontFamily="system-ui">Download on the</text>
      <text x="30" y="27" fill="white" fontSize="12" fontWeight="bold" fontFamily="system-ui">App Store</text>
    </svg>
  )
}

function PlayStoreBadge() {
  return (
    <svg width="120" height="36" viewBox="0 0 120 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="36" rx="6" fill="currentColor" className="text-foreground" />
      <polygon points="12,8 24,18 12,28" fill="#4CAF50" />
      <polygon points="12,8 20,18 12,28 12,8" fill="white" opacity="0.8" />
      <polygon points="20,18 24,18 12,8" fill="#4CAF50" opacity="0.6" />
      <text x="30" y="15" fill="white" fontSize="7" fontFamily="system-ui">GET IT ON</text>
      <text x="30" y="27" fill="white" fontSize="12" fontWeight="bold" fontFamily="system-ui">Google Play</text>
    </svg>
  )
}

export function AppDownloadBanner() {
  const features = [
    { icon: Zap, label: 'Faster shopping', desc: 'fast checkout', color: 'text-amber-400', bg: 'bg-amber-500/15' },
    { icon: Star, label: 'Exclusive deals', desc: 'App-only discounts', color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
    { icon: Truck, label: 'Order tracking', desc: 'Real-time updates', color: 'text-cyan-400', bg: 'bg-cyan-500/15' },
    { icon: Bell, label: 'Push notifications', desc: 'Never miss a deal', color: 'text-rose-400', bg: 'bg-rose-500/15' },
  ]

  return (
    <section className="px-4 py-4">
      <motion.div
        className="relative overflow-hidden rounded-2xl border border-border/50 bg-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />

        <div className="relative p-5">
          {/* Header */}
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Get the Grapsee App</h2>
              <p className="text-xs text-muted-foreground">Shop smarter on the go</p>
            </div>
          </div>

          {/* Animated phone [] + features */}
          <div className="mb-4 flex gap-4">
            {/* Phone [] */}
            <motion.div
              className="relative flex-shrink-0"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="flex h-[140px] w-[70px] flex-col items-center rounded-2xl border-2 border-border/50 bg-gradient-to-b from-background to-muted/30 p-1">
                {/* Notch */}
                <div className="mb-1 h-1.5 w-6 rounded-full bg-muted-foreground/20" />
                {/* Screen content */}
                <div className="flex-1 w-full rounded-lg bg-gradient-to-b from-primary/20 to-primary/5 p-1.5">
                  <div className="mb-1 h-1 w-full rounded bg-primary/30" />
                  <div className="mb-1 flex gap-0.5">
                    <div className="h-3 w-3 rounded bg-primary/20" />
                    <div className="h-3 w-3 rounded bg-primary/15" />
                    <div className="h-3 w-3 rounded bg-primary/10" />
                  </div>
                  <div className="mb-0.5 h-1 w-3/4 rounded bg-primary/20" />
                  <div className="mb-0.5 h-1 w-1/2 rounded bg-primary/15" />
                  <div className="mt-1 h-3 w-full rounded bg-primary/30" />
                </div>
                {/* Home indicator */}
                <div className="mt-1 h-0.5 w-5 rounded-full bg-muted-foreground/20" />
              </div>
              {/* Glow effect */}
              <div className="absolute -inset-4 -z-10 rounded-3xl bg-primary/5 blur-xl" />
            </motion.div>

            {/* Features grid */}
            <div className="grid grid-cols-2 gap-2 flex-1">
              {features.map((feature, i) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={feature.label}
                    className="flex flex-col items-center gap-1 rounded-xl bg-background/50 p-2 text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${feature.bg}`}>
                      <Icon className={`h-4 w-4 ${feature.color}`} />
                    </div>
                    <span className="text-[9px] font-semibold text-foreground leading-tight">
                      {feature.label}
                    </span>
                    <span className="text-[8px] text-muted-foreground leading-tight">
                      {feature.desc}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Store badges */}
          <div className="mb-4 flex items-center gap-3 justify-center">
            <button className="opacity-80 hover:opacity-100 transition-opacity active:scale-95">
              <AppleStoreBadge />
            </button>
            <button className="opacity-80 hover:opacity-100 transition-opacity active:scale-95">
              <PlayStoreBadge />
            </button>
          </div>

          {/* QR Code placeholder */}
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/50 p-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted/50">
                <QrCode className="h-8 w-8 text-muted-foreground" />
              </div>
              <span className="text-[9px] text-muted-foreground">Scan to download</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

