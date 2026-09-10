'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, ShoppingBag, Zap, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useShopRouter } from '@/hooks/use-shop-router'

interface HeroSlide {
  id: number
  badge: string
  title: string
  highlight: string
  description: string
  cta: string
  gradient: string
  icon: React.ReactNode
}

const slides: HeroSlide[] = [
  {
    id: 1,
    badge: 'Welcome to Grapsee Mall',
    title: 'Build Your',
    highlight: 'Digital Empire',
    description: 'Premium websites, apps & DevOps  crafted by elite engineers. Your one-stop digital shopping mall.',
    cta: 'Shop Now',
    gradient: 'from-emerald-600/30 via-teal-500/10 to-transparent',
    icon: <Sparkles className="h-6 w-6" />,
  },
  {
    id: 2,
    badge: 'Flash Deals Live',
    title: 'Up to',
    highlight: '50% OFF',
    description: 'Limited time deals on Digital services. Don\'t miss out on our biggest sale this season!',
    cta: 'Grab Deals',
    gradient: 'from-orange-600/30 via-amber-500/10 to-transparent',
    icon: <Zap className="h-6 w-6" />,
  },
  {
    id: 3,
    badge: 'New Arrivals',
    title: 'modern',
    highlight: 'Tech Solutions',
    description: 'Latest AI-powered tools and next-gen applications now available in our digital marketplace.',
    cta: 'Explore',
    gradient: 'from-violet-600/30 via-purple-500/10 to-transparent',
    icon: <TrendingUp className="h-6 w-6" />,
  },
  {
    id: 4,
    badge: 'Enterprise Grade',
    title: 'Scale Your',
    highlight: 'Business',
    description: 'From startups to enterprises  complete digital transformation packages at your fingertips.',
    cta: 'Get Started',
    gradient: 'from-cyan-600/30 via-blue-500/10 to-transparent',
    icon: <ShoppingBag className="h-6 w-6" />,
  },
]

export function Hero() {
  const { goCategory, goSearch } = useShopRouter()
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }, [])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }, [])

  // Auto-rotate
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000)
    return () => clearInterval(timer)
  }, [nextSlide])

  const slide = slides[currentSlide]

  return (
    <section className="relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        </AnimatePresence>
        {/* Decorative elements */}
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
        <div className="absolute left-1/2 top-1/4 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 py-6 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
          >
            {/* Badge */}
            <motion.div
              className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <span className="mr-1">{slide.icon}</span>
              {slide.badge}
            </motion.div>

            {/* Title */}
            <h1 className="mb-2 text-[28px] font-extrabold leading-tight text-foreground tracking-tight">
              {slide.title}
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {slide.highlight}
              </span>
            </h1>

            {/* Description */}
            <p className="mb-5 max-w-[280px] text-sm leading-relaxed text-muted-foreground">
              {slide.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => goCategory()}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
                size="lg"
              >
                {slide.cta}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => goSearch()}
                className="border-border/50 bg-background/50 backdrop-blur-sm"
                size="lg"
              >
                Search
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide Navigation */}
        <div className="mt-6 flex items-center justify-between">
          {/* Dots */}
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentSlide
                    ? 'w-6 bg-primary'
                    : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>

          {/* Arrow buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={prevSlide}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-90"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextSlide}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-90"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
