'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download, X, Smartphone, Wifi, Bell, Zap, Shield,
  ChevronRight, Check, PartyPopper, Apple, Share, Plus,
  Monitor, ArrowRight, RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type InstallStep = 'prompt' | 'guide' | 'success'
type Platform = 'android' | 'ios' | 'desktop'

const DISMISS_KEY = 'grapsee-pwa-dismissed'
const INSTALLED_KEY = 'grapsee-pwa-installed'
const REMIND_DAYS = 3

const featureHighlights = [
  { icon: Zap, title: 'Faster Access', desc: '3x faster loading', color: 'text-amber-500 bg-amber-500/10' },
  { icon: Wifi, title: 'Works Offline', desc: 'Browse without internet', color: 'text-emerald-500 bg-emerald-500/10' },
  { icon: Bell, title: 'Push Notifications', desc: 'Never miss a deal', color: 'text-sky-500 bg-sky-500/10' },
  { icon: Shield, title: 'Secure', desc: 'App-like experience', color: 'text-violet-500 bg-violet-500/10' },
]

const iosSteps = [
  { instruction: 'Tap the Share button', icon: Share, detail: 'Found at the bottom of Safari' },
  { instruction: 'Scroll down and tap "Add to Home Screen"', icon: Plus, detail: 'Look for the + icon' },
  { instruction: 'Tap "Add" to confirm', icon: Check, detail: 'The app icon will appear on your home screen' },
]

const androidSteps = [
  { instruction: 'Tap the menu icon ()', icon: Plus, detail: 'Found at the top right of Chrome' },
  { instruction: 'Tap "Install app" or "Add to Home Screen"', icon: Download, detail: 'The option may also appear in the address bar' },
  { instruction: 'Tap "Install" to confirm', icon: Check, detail: 'The app will be added to your home screen' },
]

const desktopSteps = [
  { instruction: 'Click the install icon in the address bar', icon: Download, detail: 'Or click Menu  Install Grapsee Shop' },
  { instruction: 'Click "Install" in the dialog', icon: Check, detail: 'The app will open in its own window' },
]

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [step, setStep] = useState<InstallStep>('prompt')
  const [platform, setPlatform] = useState<Platform>('android')
  const [dismissCount, setDismissCount] = useState(0)

  // Detect platform
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase()
    if (/iphone|ipad|ipod/.test(ua)) {
      setPlatform('ios')
    } else if (/android/.test(ua)) {
      setPlatform('android')
    } else {
      setPlatform('desktop')
    }
  }, [])

  // Check install status
  useEffect(() => {
    // Already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check localStorage for installed flag
    try {
      if (localStorage.getItem(INSTALLED_KEY) === 'true') {
        setIsInstalled(true)
        return
      }
    } catch { /* */ }

    // Check if dismissed and should we show again
    try {
      const dismissed = localStorage.getItem(DISMISS_KEY)
      if (dismissed) {
        const { count, timestamp } = JSON.parse(dismissed)
        setDismissCount(count)
        if (count >= 3) return // Max 3 dismisses, never show again
        const daysSince = (Date.now() - timestamp) / (1000 * 60 * 60 * 24)
        if (daysSince < REMIND_DAYS) return // Not enough days passed
      }
    } catch { /* */ }

    // Listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setTimeout(() => setShowPrompt(true), 3000)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Auto-show after 15s if not dismissed
    const timer = setTimeout(() => {
      if (!isInstalled) setShowPrompt(true)
    }, 15000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      clearTimeout(timer)
    }
  }, [isInstalled])

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        handleInstallSuccess()
      }
      setDeferredPrompt(null)
    } else if (platform === 'ios') {
      // iOS doesn't support beforeinstallprompt, show guide
      setStep('guide')
    } else {
      // Show guide for all other cases
      setStep('guide')
    }
  }

  const handleInstallSuccess = () => {
    setIsInstalled(true)
    setStep('success')
    try {
      localStorage.setItem(INSTALLED_KEY, 'true')
    } catch { /* */ }
    // Auto-hide after celebration
    setTimeout(() => setShowPrompt(false), 5000)
  }

  const handleDismiss = (action: 'dismiss' | 'later') => {
    setShowPrompt(false)
    try {
      const newCount = dismissCount + 1
      setDismissCount(newCount)
      localStorage.setItem(DISMISS_KEY, JSON.stringify({
        count: action === 'dismiss' ? newCount : dismissCount,
        timestamp: Date.now(),
      }))
    } catch { /* */ }
  }

  const handleManualInstalled = () => {
    handleInstallSuccess()
  }

  if (isInstalled) return null

  const currentSteps = platform === 'ios' ? iosSteps : platform === 'android' ? androidSteps : desktopSteps

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          className="fixed inset-x-0 bottom-20 z-30 px-4"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Success Celebration */}
          {step === 'success' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent p-4 shadow-lg backdrop-blur-xl"
            >
              {/* Confetti particles */}
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute h-2 w-2 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    backgroundColor: ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899'][i % 6],
                  }}
                  initial={{ scale: 0, y: 0 }}
                  animate={{
                    scale: [0, 1.5, 0],
                    y: [0, -30 - Math.random() * 40, 50],
                    x: [(Math.random() - 0.5) * 80],
                    rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
                  }}
                  transition={{ duration: 2, delay: i * 0.05, ease: 'easeOut' }}
                />
              ))}

              <div className="flex flex-col items-center text-center py-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20"
                >
                  <PartyPopper className="h-7 w-7 text-emerald-500" />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm font-bold text-foreground"
                >
                  App Installed! 
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-1 text-[11px] text-muted-foreground"
                >
                  Find Grapsee Shop on your home screen
                </motion.p>
              </div>
            </motion.div>
          )}

          {/* Main Prompt */}
          {step === 'prompt' && (
            <div className="overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent shadow-lg backdrop-blur-xl">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/20">
                      <Smartphone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Install Grapsee Shop</p>
                      <p className="text-[10px] text-muted-foreground">Add to home screen for the best experience</p>
                    </div>
                  </div>
                  <button
                    className="text-muted-foreground hover:text-foreground p-1"
                    onClick={() => handleDismiss('dismiss')}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Feature Highlights */}
                <div className="mb-3 grid grid-cols-4 gap-2">
                  {featureHighlights.map((feature, i) => {
                    const FIcon = feature.icon
                    return (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                        className="flex flex-col items-center text-center"
                      >
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${feature.color}`}>
                          <FIcon className="h-3.5 w-3.5" />
                        </div>
                        <p className="mt-1 text-[9px] font-semibold text-foreground line-clamp-1">{feature.title}</p>
                        <p className="text-[7px] text-muted-foreground line-clamp-1">{feature.desc}</p>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="flex-1 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={handleInstall}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Install Now
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[11px] text-muted-foreground"
                    onClick={() => setStep('guide')}
                  >
                    How?
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>

                {/* Maybe Later */}
                <button
                  onClick={() => handleDismiss('later')}
                  className="mt-2 w-full text-center text-[10px] text-muted-foreground hover:text-foreground"
                >
                  Maybe Later {dismissCount > 0 && `(${3 - dismissCount} reminders left)`}
                </button>
              </div>
            </div>
          )}

          {/* Step-by-step Install Guide */}
          {step === 'guide' && (
            <div className="overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-lg backdrop-blur-xl">
              <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      {platform === 'ios' ? <Apple className="h-4 w-4 text-primary" /> :
                       platform === 'android' ? <Smartphone className="h-4 w-4 text-primary" /> :
                       <Monitor className="h-4 w-4 text-primary" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Install Guide</p>
                      <p className="text-[9px] text-muted-foreground">
                        For {platform === 'ios' ? 'Safari / iOS' : platform === 'android' ? 'Chrome / Android' : 'Chrome / Desktop'}
                      </p>
                    </div>
                  </div>
                  <button
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => { setShowPrompt(false); handleDismiss('later') }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Steps */}
                <div className="space-y-2.5">
                  {currentSteps.map((stepItem, i) => {
                    const SIcon = stepItem.icon
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.15 }}
                        className="flex gap-3"
                      >
                        <div className="flex flex-col items-center">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                            {i + 1}
                          </div>
                          {i < currentSteps.length - 1 && (
                            <div className="w-px h-full bg-border/50 mt-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-2">
                          <div className="flex items-center gap-1.5">
                            <SIcon className="h-3.5 w-3.5 text-primary" />
                            <p className="text-xs font-medium text-foreground">{stepItem.instruction}</p>
                          </div>
                          <p className="mt-0.5 text-[10px] text-muted-foreground">{stepItem.detail}</p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Action */}
                <div className="mt-3 flex items-center gap-2">
                  {deferredPrompt ? (
                    <Button
                      size="sm"
                      className="flex-1 gap-1.5 bg-primary text-primary-foreground"
                      onClick={handleInstall}
                    >
                      <Download className="h-3.5 w-3.5" />
                      Install Now
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="flex-1 gap-1.5"
                      variant="outline"
                      onClick={handleManualInstalled}
                    >
                      <Check className="h-3.5 w-3.5" />
                      I&apos;ve Installed It
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[11px] text-muted-foreground"
                    onClick={() => setStep('prompt')}
                  >
                     Back
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

