'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Users, ShoppingBag, Globe, Headphones, Star, MessageSquare } from 'lucide-react'

interface StatData {
  icon: React.ElementType
  value: number
  suffix: string
  label: string
  color: string
  bgColor: string
}

const fallbackStats: StatData[] = [
  { icon: Users, value: 50000, suffix: '+', label: 'Happy Customers', color: 'text-emerald-400', bgColor: 'from-emerald-500/20 to-emerald-600/10' },
  { icon: ShoppingBag, value: 500, suffix: '+', label: 'Products', color: 'text-violet-400', bgColor: 'from-violet-500/20 to-violet-600/10' },
  { icon: Globe, value: 999, suffix: '%', label: 'Uptime', color: 'text-cyan-400', bgColor: 'from-cyan-500/20 to-cyan-600/10' },
  { icon: Headphones, value: 24, suffix: '/7', label: 'Support', color: 'text-amber-400', bgColor: 'from-amber-500/20 to-amber-600/10' },
  { icon: Star, value: 48, suffix: '', label: 'Rating', color: 'text-rose-400', bgColor: 'from-rose-500/20 to-rose-600/10' },
  { icon: MessageSquare, value: 10000, suffix: '+', label: 'Reviews', color: 'text-sky-400', bgColor: 'from-sky-500/20 to-sky-600/10' },
]

function AnimatedNumber({ value, suffix, duration = 2 }: { value: number; suffix: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const end = value
    const stepTime = (duration * 1000) / Math.min(end, 60)
    const increment = Math.max(1, Math.ceil(end / 60))

    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [isInView, value, duration])

  const formatCount = (n: number) => {
    if (n >= 10000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`
    if (n === 48) return (n / 10).toFixed(1)
    if (n === 999) return '99.9'
    return n.toLocaleString()
  }

  return (
    <span ref={ref} className="text-lg font-bold text-foreground sm:text-xl">
      {isInView ? formatCount(count) : '0'}{suffix}
    </span>
  )
}

export function StatsSection() {
  const [stats, setStats] = useState<StatData[]>(fallbackStats)
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' })

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.totalProducts !== undefined) {
          setStats([
            { icon: Users, value: 50000, suffix: '+', label: 'Happy Customers', color: 'text-emerald-400', bgColor: 'from-emerald-500/20 to-emerald-600/10' },
            { icon: ShoppingBag, value: data.totalProducts || 500, suffix: '+', label: 'Products', color: 'text-violet-400', bgColor: 'from-violet-500/20 to-violet-600/10' },
            { icon: Globe, value: 999, suffix: '%', label: 'Uptime', color: 'text-cyan-400', bgColor: 'from-cyan-500/20 to-cyan-600/10' },
            { icon: Headphones, value: 24, suffix: '/7', label: 'Support', color: 'text-amber-400', bgColor: 'from-amber-500/20 to-amber-600/10' },
            { icon: Star, value: Math.round((data.avgRating || 4.8) * 10), suffix: '', label: 'Rating', color: 'text-rose-400', bgColor: 'from-rose-500/20 to-rose-600/10' },
            { icon: MessageSquare, value: data.totalReviews || 10000, suffix: '+', label: 'Reviews', color: 'text-sky-400', bgColor: 'from-sky-500/20 to-sky-600/10' },
          ])
        }
      })
      .catch(() => {})
  }, [])

  return (
    <section className="px-4 py-6" ref={sectionRef}>
      <motion.div
        className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        {/* Gradient border glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        {/* Glass effect */}
        <div className="absolute inset-0 backdrop-blur-xl" />

        <div className="relative">
          <div className="mb-5 text-center">
            <motion.h2
              className="text-base font-bold text-foreground sm:text-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
            >
              Trusted Worldwide
            </motion.h2>
            <motion.p
              className="text-[11px] text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.2 }}
            >
              Numbers that speak for themselves
            </motion.p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  className="relative flex flex-col items-center gap-1.5 rounded-xl border border-border/30 bg-gradient-to-br from-background/80 to-background/40 p-3 backdrop-blur-sm"
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.1 + index * 0.07 }}
                  whileHover={{ scale: 1.03, borderColor: 'rgba(var(--primary), 0.3)' }}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                  <span className="text-[9px] text-muted-foreground text-center leading-tight font-medium">
                    {stat.label}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
