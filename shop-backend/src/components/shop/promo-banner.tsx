'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { ArrowRight, Gift, Crown, Sparkles, Truck, Percent, X, ChevronLeft, ChevronRight, Clock, Tag, Zap, Flame, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useShopRouter } from '@/hooks/use-shop-router'

type PromoType = 'percentage' | 'free_shipping' | 'bogo' | 'bundle' | 'flash'

interface PromoSlide {
  id: number
  type: PromoType
  icon: React.ReactNode
  title: string
  subtitle: string
  description: string
  gradient: string
  cta: string
  action: 'deals' | 'luxury' | 'search'
  countdownEnd?: number // timestamp
  badgeIcon?: React.ComponentType<{ className?: string }>
  badgeText?: string
  discountText?: string
}

const promos: PromoSlide[] = [
  {
    id: 1,
    type: 'percentage',
    icon: <Percent className="h-6 w-6" />,
    title: 'Mega Sale',
    subtitle: 'This Weekend Only',
    description: 'Save up to 50% on all digital services. Premium quality at unbeatable prices.',
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    cta: 'Shop Sale',
    action: 'deals',
    countdownEnd: Date.now() + 2 * 24 * 60 * 60 * 1000, // 2 days from now
    badgeIcon: Flame,
    badgeText: 'HOT',
    discountText: '50% OFF',
  },
  {
    id: 2,
    type: 'free_shipping',
    icon: <Truck className="h-6 w-6" />,
    title: 'Free Delivery',
    subtitle: 'Limited Time Offer',
    description: 'Free delivery on all orders this week. No minimum purchase required!',
    gradient: 'from-emerald-500/20 via-green-500/10 to-transparent',
    cta: 'Order Now',
    action: 'search',
    badgeIcon: Truck,
    badgeText: 'FREE',
    discountText: 'FREE SHIP',
  },
  {
    id: 3,
    type: 'bogo',
    icon: <Gift className="h-6 w-6" />,
    title: 'Buy 1 Get 1',
    subtitle: 'BOGO Deals',
    description: 'Buy any service and get a second one free. Mix and match across categories!',
    gradient: 'from-rose-500/20 via-pink-500/10 to-transparent',
    cta: 'Grab Deal',
    action: 'deals',
    badgeIcon: Gift,
    badgeText: 'BOGO',
    discountText: '2 FOR 1',
  },
  {
    id: 4,
    type: 'bundle',
    icon: <Sparkles className="h-6 w-6" />,
    title: 'Bundle & Save',
    subtitle: 'Custom Packages',
    description: 'Combine any 3+ services and save 30%. Build your complete digital suite.',
    gradient: 'from-violet-500/20 via-purple-500/10 to-transparent',
    cta: 'Build Bundle',
    action: 'search',
    badgeIcon: Sparkles,
    badgeText: 'BUNDLE',
    discountText: '30% OFF',
  },
  {
    id: 5,
    type: 'flash',
    icon: <Zap className="h-6 w-6" />,
    title: 'Flash Deal',
    subtitle: 'Ends in Hours',
    description: 'fast deal on premium services. Only available for the next few hours!',
    gradient: 'from-red-500/20 via-orange-500/10 to-transparent',
    cta: 'Flash Sale',
    action: 'deals',
    countdownEnd: Date.now() + 5 * 60 * 60 * 1000, // 5 hours
    badgeIcon: Zap,
    badgeText: 'FLASH',
    discountText: '60% OFF',
  },
  {
    id: 6,
    type: 'percentage',
    icon: <Crown className="h-6 w-6" />,
    title: 'Premium Club',
    subtitle: 'Join & Save 20%',
    description: 'Get exclusive deals, early access, and VIP support with our membership.',
    gradient: 'from-sky-500/20 via-cyan-500/10 to-transparent',
    cta: 'Join Now',
    action: 'luxury',
    badgeIcon: Crown,
    badgeText: 'VIP',
    discountText: '20% OFF',
  },
]

function CountdownTimer({ endTime }: { endTime: number }) {
  const [timeLeft, setTimeLeft] = useState(endTime - Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = endTime - Date.now()
      if (remaining <= 0) {
        setTimeLeft(0)
        clearInterval(interval)
      } else {
        setTimeLeft(remaining)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [endTime])

  if (timeLeft <= 0) return null

  const hours = Math.floor(timeLeft / (1000 * 60 * 60))
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)

  return (
    <div className="mt-1.5 flex items-center gap-1">
      <Clock className="h-3 w-3 text-primary/70" />
      <div className="flex items-center gap-0.5">
        {[
          { value: hours, label: 'h' },
          { value: minutes, label: 'm' },
          { value: seconds, label: 's' },
        ].map((unit, i) => (
          <span key={i} className="flex items-center">
            <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded bg-primary/10 px-1 text-[10px] font-bold text-primary tabular-nums">
              {String(unit.value).padStart(2, '0')}
            </span>
            <span className="mx-0.5 text-[8px] text-primary/50">{unit.label}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

const typeConfig: Record<PromoType, { color: string; border: string }> = {
  percentage: { color: 'text-amber-500', border: 'border-amber-500/30' },
  free_shipping: { color: 'text-emerald-500', border: 'border-emerald-500/30' },
  bogo: { color: 'text-rose-500', border: 'border-rose-500/30' },
  bundle: { color: 'text-violet-500', border: 'border-violet-500/30' },
  flash: { color: 'text-red-500', border: 'border-red-500/30' },
}

export function PromoBanner() {
  const { goCategory, goSearch, goDeals, goLuxury } = useShopRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dismissed, setDismissed] = useState<Set<number>>(new Set())
  const [allDismissed, setAllDismissed] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [direction, setDirection] = useState(0)

  // Load dismissed state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('grapsee-promo-dismissed')
      if (saved) {
        const parsed = JSON.parse(saved) as number[]
        setDismissed(new Set(parsed))
      }
    } catch { /* ignore */ }
  }, [])

  // Save dismissed state to localStorage
  const saveDismissed = (newSet: Set<number>) => {
    setDismissed(newSet)
    try {
      localStorage.setItem('grapsee-promo-dismissed', JSON.stringify([...newSet]))
    } catch { /* ignore */ }
  }

  // Filter visible promos
  const visiblePromos = promos.filter(p => !dismissed.has(p.id))

  useEffect(() => {
    if (visiblePromos.length === 0) {
      setAllDismissed(true)
      return
    }
    setAllDismissed(false)
    if (currentIndex >= visiblePromos.length) {
      setCurrentIndex(0)
    }
  }, [visiblePromos.length, currentIndex])

  // Auto-slide
  const startAutoSlide = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setDirection(1)
      setCurrentIndex(prev => (prev + 1) % visiblePromos.length)
    }, 5000)
  }, [visiblePromos.length])

  useEffect(() => {
    if (visiblePromos.length > 1) {
      startAutoSlide()
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [visiblePromos.length, startAutoSlide])

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
    startAutoSlide()
  }

  const goNext = () => {
    setDirection(1)
    setCurrentIndex(prev => (prev + 1) % visiblePromos.length)
    startAutoSlide()
  }

  const goPrev = () => {
    setDirection(-1)
    setCurrentIndex(prev => (prev - 1 + visiblePromos.length) % visiblePromos.length)
    startAutoSlide()
  }

  const handleDismiss = (e: React.MouseEvent, promoId: number) => {
    e.stopPropagation()
    const newSet = new Set(dismissed)
    newSet.add(promoId)
    saveDismissed(newSet)
  }

  const handleDismissAll = () => {
    const newSet = new Set(promos.map(p => p.id))
    saveDismissed(newSet)
  }

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -50) goNext()
    else if (info.offset.x > 50) goPrev()
  }

  if (allDismissed || visiblePromos.length === 0) return null

  const currentPromo = visiblePromos[currentIndex]
  if (!currentPromo) return null

  const handleAction = () => {
    currentPromo.action === 'search' ? goSearch() : currentPromo.action === 'deals' ? goDeals() : goLuxury()
  }

  const slideVariants: Variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  }

  return (
    <section className="px-4 py-3">
      <div className="relative overflow-hidden rounded-2xl">
        {/* Sliding Banner */}
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentPromo.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className={`relative cursor-grab active:cursor-grabbing overflow-hidden rounded-2xl bg-gradient-to-r ${currentPromo.gradient} border border-border/30 p-4`}
          >
            {/* Decorative */}
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
            <div className="absolute -left-4 -bottom-4 h-20 w-20 rounded-full bg-primary/3 blur-2xl" />

            {/* Dismiss Button */}
            <button
              onClick={(e) => handleDismiss(e, currentPromo.id)}
              className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-background/40 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-background/70 hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>

            {/* Discount Badge */}
            {currentPromo.discountText && (
              <div className="absolute right-2 top-9">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${typeConfig[currentPromo.type].color} ${typeConfig[currentPromo.type].border} border bg-background/60 backdrop-blur-sm`}>
                  <Tag className="mr-0.5 h-2.5 w-2.5" />
                  {currentPromo.discountText}
                </span>
              </div>
            )}

            <div className="relative flex items-start gap-3">
              {/* Icon */}
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {currentPromo.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {currentPromo.badgeIcon && (
                    <span className="flex items-center gap-0.5 text-[9px] font-bold">
                      {(() => { const Icon = currentPromo.badgeIcon || Flame; return <Icon className="h-3.5 w-3.5" />; })()}
                      {currentPromo.badgeText}
                    </span>
                  )}
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                    {currentPromo.subtitle}
                  </p>
                </div>
                <h3 className="text-sm font-bold text-foreground">{currentPromo.title}</h3>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
                  {currentPromo.description}
                </p>

                {/* Countdown */}
                {currentPromo.countdownEnd && (
                  <CountdownTimer endTime={currentPromo.countdownEnd} />
                )}

                <Button
                  size="sm"
                  className="mt-2 h-7 gap-1 bg-primary/10 px-3 text-[11px] text-primary hover:bg-primary hover:text-primary-foreground"
                  variant="ghost"
                  onClick={handleAction}
                >
                  {currentPromo.cta}
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Dots */}
        {visiblePromos.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <button onClick={goPrev} className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            {visiblePromos.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIndex ? 'w-5 bg-primary' : 'w-1.5 bg-muted-foreground/30'
                }`}
              />
            ))}
            <button onClick={goNext} className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Dismiss All */}
        {visiblePromos.length > 1 && (
          <button
            onClick={handleDismissAll}
            className="mx-auto mt-1 flex items-center gap-1 text-[9px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-2.5 w-2.5" />
            Dismiss all promos
          </button>
        )}
      </div>
    </section>
  )
}
