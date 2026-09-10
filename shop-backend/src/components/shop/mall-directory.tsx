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
    <section className="py-4">
      {/* Header */}
      <div className="mb-3 px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20">
            <Crown className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Shop by Floor</h2>
            <p className="text-[10px] text-muted-foreground">Browse like a real mall</p>
          </div>
        </div>
      </div>

      {/* Floor cards - horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {floors.map((floor, index) => {
          const Icon = floor.icon
          return (
            <motion.button
              key={floor.id}
              className="group relative flex w-[200px] flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-border/50 bg-card transition-all hover:border-primary/20 hover:shadow-lg active:scale-[0.97]"
              onClick={() => goCategory()}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Gradient background */}
              <div className={`flex h-24 items-center justify-center bg-gradient-to-br ${floor.gradient}`}>
                <Icon className={`h-10 w-10 ${floor.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
              </div>

              {/* Floor info */}
              <div className="p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    Floor {floor.id}
                  </span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {floor.name}
                </h3>
                <p className="text-[10px] text-muted-foreground mb-2">{floor.subtitle}</p>

                {/* Category tags */}
                <div className="flex flex-wrap gap-1">
                  {floor.categories.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex rounded-md bg-muted/50 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}
