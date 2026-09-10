'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { Crown, Code2, Palette, User } from 'lucide-react'

interface Testimonial {
  id: number
  name: string
  role: string
  company: string
  icon: React.ComponentType<{ className?: string }>
  rating: number
  text: string
}

const testimonials: any[] = []

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % testimonials.length)
  }, [])

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }, [])

  useEffect(() => {
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next])

  const t = testimonials[current]

  return (
    <section className="px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground">What Clients Say</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={prev}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:text-foreground active:scale-90"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={next}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:text-foreground active:scale-90"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <motion.div
        className="rounded-2xl border border-border/50 bg-card p-4"
        layout
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Quote icon */}
            <Quote className="mb-2 h-5 w-5 text-primary/30" />

            {/* Stars */}
            <div className="mb-2 flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3.5 w-3.5 ${
                    star <= t.rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'
                  }`}
                />
              ))}
            </div>

            {/* Text */}
            <p className="mb-3 text-sm leading-relaxed text-foreground/80">
              &ldquo;{t.text}&rdquo;
            </p>

            {/* Author */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                {(() => { const Icon = t.icon; return <Icon className="h-6 w-6 text-primary" />; })()}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {t.role}, {t.company}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? 'w-4 bg-primary' : 'w-1.5 bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </section>
  )
}
