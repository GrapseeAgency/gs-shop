'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote, User } from 'lucide-react'

interface Testimonial {
  id: string
  name: string
  role: string
  company: string
  avatar: string | null
  rating: number
  text: string
}

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/testimonials')
      .then((res) => res.json())
      .then((data) => {
        setTestimonials(data.testimonials || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const next = useCallback(() => {
    setCurrent((prev) => (testimonials.length > 0 ? (prev + 1) % testimonials.length : 0))
  }, [testimonials.length])

  const prev = useCallback(() => {
    setCurrent((prev) =>
      testimonials.length > 0 ? (prev - 1 + testimonials.length) % testimonials.length : 0
    )
  }, [testimonials.length])

  useEffect(() => {
    if (testimonials.length === 0) return
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next, testimonials.length])

  if (loading) {
    return (
      <section className="px-4 py-4">
        <div className="mb-3">
          <h2 className="text-base font-black text-gradient-green">What Clients Say</h2>
        </div>
        <div className="h-48 animate-shimmer rounded-3xl border border-border/30" />
      </section>
    )
  }

  if (testimonials.length === 0) {
    return null
  }

  const t = testimonials[current]

  return (
    <section className="px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-black text-gradient-green">What Clients Say</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={prev}
            className="flex h-7 w-7 items-center justify-center rounded-full glass border-border/30 text-muted-foreground hover:text-primary hover:border-primary/30 active:scale-90 transition-all"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={next}
            className="flex h-7 w-7 items-center justify-center rounded-full glass border-border/30 text-muted-foreground hover:text-primary hover:border-primary/30 active:scale-90 transition-all"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <motion.div className="relative overflow-hidden rounded-3xl glass-deep p-5 liquid-scene" layout>
        {/* Aurora depth blobs */}
        <div className="absolute -right-10 -top-10 h-36 w-36 liquid-blob opacity-40 pointer-events-none" />
        <div className="absolute -left-6 bottom-0 h-24 w-24 liquid-blob-slow opacity-30 pointer-events-none" />

        <AnimatePresence mode="wait">
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
            className="relative z-10"
          >
            {/* Liquid-tinted quote mark */}
            <div className="relative mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 overflow-hidden">
              <div className="absolute inset-0 liquid-aurora opacity-50" />
              <Quote className="relative h-4 w-4 text-primary" />
            </div>

            {/* Stars flowing amber */}
            <div className="mb-3 flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.div
                  key={star}
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: star * 0.06, type: 'spring', stiffness: 400 }}
                >
                  <Star
                    className={`h-3.5 w-3.5 ${
                      star <= t.rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'
                    }`}
                  />
                </motion.div>
              ))}
            </div>

            <p className="mb-4 text-sm leading-relaxed text-foreground/85 italic">
              &ldquo;{t.text}&rdquo;
            </p>

            {/* Avatar row glassmorphic bubble */}
            <div className="flex items-center gap-3">
              <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/25 overflow-hidden shadow-lg shadow-primary/10">
                <div className="absolute inset-0 liquid-aurora opacity-40" />
                {t.avatar ? (
                  <img src={t.avatar} alt={t.name} className="relative h-11 w-11 rounded-full object-cover" />
                ) : (
                  <User className="relative h-6 w-6 text-primary" />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{t.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {t.role}, {t.company}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Liquid dot indicators */}
        <div className="mt-4 flex items-center justify-center gap-1.5 relative z-10">
          {testimonials.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current ? 'w-5 h-2 bg-primary shadow-sm shadow-primary/40' : 'w-2 h-2 bg-muted-foreground/25 hover:bg-primary/40'
              }`}
              animate={i === current ? { scaleY: [1, 1.3, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          ))}
        </div>
      </motion.div>
    </section>
  )
}

