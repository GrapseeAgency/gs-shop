'use client'

import { motion } from 'framer-motion'
import { Monitor, Shirt, Home, Crown, ChevronRight } from 'lucide-react'
import { useShopRouter } from '@/hooks/use-shop-router'

interface Floor {
  id: number
  name: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  categories: string[]
  color: string
}

const floors: Floor[] = [
  {
    id: 1,
    name: 'Electronics & Tech',
    subtitle: 'Websites, Apps & DevOps',
    icon: Monitor,
    gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
    categories: ['Websites', 'Mobile Apps', 'DevOps', 'APIs'],
    color: 'text-cyan-500',
  },
  {
    id: 2,
    name: 'Fashion & Lifestyle',
    subtitle: 'Design & Branding',
    icon: Shirt,
    gradient: 'from-pink-500/20 via-rose-500/10 to-transparent',
    categories: ['UI/UX Design', 'Brand Identity', 'Social Media', 'Graphics'],
    color: 'text-pink-500',
  },
  {
    id: 3,
    name: 'Home & Living',
    subtitle: 'Productivity & Tools',
    icon: Home,
    gradient: 'from-emerald-500/20 via-green-500/10 to-transparent',
    categories: ['Dashboards', 'Analytics', 'Automation', 'CRM'],
    color: 'text-emerald-500',
  },
  {
    id: 4,
    name: 'Premium & Luxury',
    subtitle: 'Enterprise Solutions',
    icon: Crown,
    gradient: 'from-amber-500/20 via-yellow-500/10 to-transparent',
    categories: ['Enterprise Apps', 'Cloud Infra', 'AI/ML', 'Consulting'],
    color: 'text-amber-500',
  },
]

export function MallDirectory() {
  const { goCategory } = useShopRouter()

  return (
    <section className="py-4 relative z-10">
      {/* Header */}
      <div className="mb-3.5 px-4">
        <div className="flex items-center gap-2">
          <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 overflow-hidden shadow-sm">
            <div className="absolute inset-0 liquid-aurora opacity-40 animate-aurora" />
            <Crown className="relative z-10 h-4 w-4 text-primary animate-swell" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-gradient-green">Shop by Floor</h2>
            <p className="text-[10px] font-semibold text-muted-foreground/80">Browse like a real mall</p>
          </div>
        </div>
      </div>

      {/* Floor cards - horizontal scroll on mobile, responsive grid on desktop */}
      <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-3 overflow-x-auto md:overflow-x-visible px-4 pb-2.5 md:pb-0 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {floors.map((floor, index) => {
          const Icon = floor.icon
          return (
            <motion.div
              key={floor.id}
              role="button"
              tabIndex={0}
              className="group relative flex w-[200px] md:w-auto flex-shrink-0 md:flex-shrink flex-col overflow-hidden rounded-2xl border border-primary/15 bg-card/60 backdrop-blur-md transition-all duration-300 hover:border-primary/35 hover:shadow-md hover:shadow-primary/5 active:scale-[0.97]"
              onClick={() => goCategory()}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Gradient background with liquid caustic/aurora */}
              <div className={`relative flex h-24 items-center justify-center bg-gradient-to-br ${floor.gradient} overflow-hidden border-b border-primary/10`}>
                <div className="absolute inset-0 liquid-caustic opacity-30 pointer-events-none" />
                <div className="absolute inset-0 liquid-aurora opacity-10 pointer-events-none" />
                <Icon className={`relative z-10 h-10 w-10 ${floor.color} opacity-60 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105`} />
              </div>

              {/* Floor info */}
              <div className="p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground/80">
                    Floor {floor.id}
                  </span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-sm font-extrabold text-foreground group-hover:text-primary transition-colors leading-tight">
                  {floor.name}
                </h3>
                <p className="text-[10px] font-medium text-muted-foreground/90 mb-2.5 mt-0.5 leading-snug">{floor.subtitle}</p>

                {/* Category tags */}
                <div className="flex flex-wrap gap-1 mt-auto">
                  {floor.categories.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex rounded-md bg-primary/5 border border-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary shadow-sm"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

