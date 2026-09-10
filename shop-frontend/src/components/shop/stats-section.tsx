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

const buildStats = (products = 0, happyCustomers = 0, averageRating = 0, reviewCount = 0): StatData[] => [
  { icon: Users, value: happyCustomers, suffix: '', label: 'Happy Customers', color: 'text-emerald-400', bgColor: 'from-emerald-500/20 to-emerald-600/10' },
  { icon: ShoppingBag, value: products, suffix: '', label: 'Products', color: 'text-violet-400', bgColor: 'from-violet-500/20 to-violet-600/10' },
  { icon: Globe, value: 999, suffix: '%', label: 'Uptime', color: 'text-cyan-400', bgColor: 'from-cyan-500/20 to-cyan-600/10' },
  { icon: Headphones, value: 24, suffix: '/7', label: 'Support', color: 'text-amber-400', bgColor: 'from-amber-500/20 to-amber-600/10' },
  { icon: Star, value: Math.round(averageRating * 10), suffix: '', label: 'Rating', color: 'text-rose-400', bgColor: 'from-rose-500/20 to-rose-600/10' },
  { icon: MessageSquare, value: reviewCount, suffix: '', label: 'Reviews', color: 'text-sky-400', bgColor: 'from-sky-500/20 to-sky-600/10' },
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
    if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace(/\.0$/, '')}M+`
    if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K+`
    if (n === 999) return '99.9'
    if (n > 0 && n < 100 && suffix === '') return (n / 10).toFixed(1)
    if (n === 0) return '0'
    return n.toLocaleString()
  }

  return (
    <span ref={ref} className="text-lg font-bold text-foreground sm:text-xl">
      {isInView ? formatCount(count) : '0'}{suffix}
    </span>
  )
}

export function StatsSection() {
  const [stats, setStats] = useState<StatData[]>(buildStats())
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' })

  useEffect(() => {
    fetch('/api/public-stats')
      .then((res) => res.json())
      .then((data) => {
        if (data?.stats) {
          const { products, happyCustomers, averageRating, reviewCount } = data.stats
          setStats(buildStats(products, happyCustomers, averageRating, reviewCount))
        }
      })
      .catch(() => {})
  }, [])

  return (
    <section className="px-4 py-6" ref={sectionRef}>
      <motion.div
        className="relative overflow-hidden rounded-3xl glass-deep p-5 liquid-scene"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        {/* Deep aurora background blobs */}
        <div className="absolute -right-16 -top-16 h-48 w-48 liquid-blob opacity-50 pointer-events-none" />
        <div className="absolute -left-8 bottom-0 h-32 w-32 liquid-blob-slow opacity-40 pointer-events-none" />
        {/* Flowing border glow */}
        <div className="absolute inset-0 rounded-3xl liquid-border pointer-events-none" />

        <div className="relative z-10">
          <div className="mb-5 text-center">
            <motion.h2
              className="text-base font-black text-gradient-animated sm:text-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
            >
              Trusted Worldwide
            </motion.h2>
            <motion.p
              className="text-[11px] text-muted-foreground mt-0.5"
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
                  className="group relative flex flex-col items-center gap-1.5 rounded-2xl border border-border/20 bg-background/40 backdrop-blur-sm p-3 card-premium overflow-hidden"
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.1 + index * 0.07 }}
                  whileHover={{ scale: 1.04 }}
                >
                  {/* Micro liquid-caustic shimmer */}
                  <div className="absolute inset-0 liquid-caustic pointer-events-none opacity-50" />
                  <motion.div
                    className={`relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${stat.bgColor} overflow-hidden`}
                    whileHover={{ scale: 1.1, borderRadius: '40% 60% 60% 40% / 40% 40% 60% 60%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  >
                    <div className="absolute inset-0 animate-aurora opacity-40" />
                    <Icon className={`relative h-4 w-4 ${stat.color}`} />
                  </motion.div>
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                  <span className="text-[9px] text-muted-foreground text-center leading-tight font-semibold tracking-wide uppercase">
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

