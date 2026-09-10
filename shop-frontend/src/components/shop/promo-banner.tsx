'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
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
    <div className="mt-2 flex items-center gap-1.5 bg-background/30 backdrop-blur-sm px-2 py-1 rounded-lg border border-primary/10 w-fit">
      <Clock className="h-3 w-3 text-primary" />
      <div className="flex items-center gap-0.5">
        {[
          { value: hours, label: 'h' },
          { value: minutes, label: 'm' },
          { value: seconds, label: 's' },
        ].map((unit, i) => (
          <span key={i} className="flex items-center">
            <span className="inline-flex h-5 min-w-[22px] items-center justify-center rounded-md glass border border-primary/20 px-1 text-[10px] font-bold text-primary tabular-nums shadow-sm">
              {String(unit.value).padStart(2, '0')}
            </span>
            <span className="mx-0.5 text-[8px] font-semibold text-primary">{unit.label}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

const typeConfig: Record<PromoType, { color: string; border: string; bg: string }> = {
  percentage: { color: 'text-amber-500', border: 'border-amber-500/30', bg: 'bg-amber-500/10' },
  free_shipping: { color: 'text-emerald-500', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
  bogo: { color: 'text-rose-500', border: 'border-rose-500/30', bg: 'bg-rose-500/10' },
  bundle: { color: 'text-violet-500', border: 'border-violet-500/30', bg: 'bg-violet-500/10' },
  flash: { color: 'text-red-500', border: 'border-red-500/30', bg: 'bg-red-500/10' },
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

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0, scale: 0.95 }),
  }

  return (
    <section className="px-4 py-3 relative z-10">
      <div className="relative overflow-hidden">
        {/* Sliding Banner */}
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentPromo.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="relative cursor-grab active:cursor-grabbing overflow-hidden rounded-3xl glass-deep border border-primary/20 p-5 shadow-lg shadow-primary/5"
          >
            {/* Dynamic color-coded gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${currentPromo.gradient} opacity-70 mix-blend-overlay -z-10`} />
            
            {/* Ambient liquid components */}
            <div className="absolute inset-0 liquid-aurora opacity-10 pointer-events-none -z-20" />
            <div className="absolute inset-0 liquid-caustic opacity-30 pointer-events-none -z-20" />
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full liquid-blob opacity-30 pointer-events-none -z-20" />
            <div className="absolute -left-6 -bottom-6 h-24 w-24 rounded-full liquid-blob-slow opacity-25 pointer-events-none -z-20" />

            {/* Dismiss Button */}
            <button
              onClick={(e) => handleDismiss(e, currentPromo.id)}
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full glass text-muted-foreground transition-all duration-300 hover:scale-105 hover:bg-background/80 hover:text-foreground shadow-sm"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {/* Discount Badge */}
            {currentPromo.discountText && (
              <div className="absolute right-3 top-11">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${typeConfig[currentPromo.type].color} ${typeConfig[currentPromo.type].bg} border ${typeConfig[currentPromo.type].border} shadow-sm backdrop-blur-md`}>
                  <Tag className="mr-0.5 h-2.5 w-2.5" />
                  {currentPromo.discountText}
                </span>
              </div>
            )}

            <div className="relative flex items-start gap-4 z-10">
              {/* Icon */}
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 relative overflow-hidden shadow-sm shadow-primary/5">
                <div className="absolute inset-0 liquid-aurora opacity-40" />
                <span className="relative z-10">{currentPromo.icon}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  {currentPromo.badgeIcon && (
                    <span className={`flex items-center gap-0.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded ${typeConfig[currentPromo.type].bg} ${typeConfig[currentPromo.type].color} border ${typeConfig[currentPromo.type].border}`}>
                      {(() => { const Icon = currentPromo.badgeIcon; return <Icon className="h-3 w-3" />; })()}
                      {currentPromo.badgeText}
                    </span>
                  )}
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                    {currentPromo.subtitle}
                  </p>
                </div>
                
                <h3 className="text-base font-extrabold text-foreground tracking-tight leading-tight">{currentPromo.title}</h3>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground/90 line-clamp-2">
                  {currentPromo.description}
                </p>

                {/* Countdown */}
                {currentPromo.countdownEnd && (
                  <CountdownTimer endTime={currentPromo.countdownEnd} />
                )}

                <Button
                  size="sm"
                  className="mt-3.5 h-8 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/95 text-[11px] font-bold rounded-full btn-liquid shadow-md shadow-primary/20 px-4"
                  onClick={handleAction}
                >
                  {currentPromo.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Dots */}
        {visiblePromos.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-3">
            <button onClick={goPrev} className="flex h-7 w-7 items-center justify-center rounded-full glass text-muted-foreground hover:text-foreground hover:bg-accent/40 shadow-sm transition-all hover:scale-105 active:scale-95">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full glass/30 backdrop-blur-sm border border-primary/5">
              {visiblePromos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentIndex 
                      ? 'w-5 bg-primary shadow-sm shadow-primary/30' 
                      : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>
            <button onClick={goNext} className="flex h-7 w-7 items-center justify-center rounded-full glass text-muted-foreground hover:text-foreground hover:bg-accent/40 shadow-sm transition-all hover:scale-105 active:scale-95">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Dismiss All */}
        {visiblePromos.length > 1 && (
          <button
            onClick={handleDismissAll}
            className="mx-auto mt-2 flex items-center gap-1 text-[9px] font-semibold text-muted-foreground hover:text-primary transition-colors hover:underline"
          >
            <X className="h-2.5 w-2.5" />
            Dismiss all promos
          </button>
        )}
      </div>
    </section>
  )
}

