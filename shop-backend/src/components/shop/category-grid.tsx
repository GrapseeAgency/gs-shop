'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe, Smartphone, Server, Palette, Layout, Code, Shield, Database,
  ArrowRight, Grid3X3, List, Star, Sparkles, ShoppingBag, Crown
} from 'lucide-react'
import { type Category } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { Badge } from '@/components/ui/badge'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Globe,
  Smartphone,
  Server,
  Palette,
  Layout,
  Code,
  Shield,
  Database,
}

// Category color themes - each category has its own color identity
const categoryThemes = [
  { gradient: 'from-emerald-500/15 to-teal-500/5', hoverBg: 'hover:bg-emerald-500/5', accent: 'text-emerald-500', accentBg: 'bg-emerald-500', countBg: 'bg-emerald-500/10 text-emerald-600' },
  { gradient: 'from-violet-500/15 to-purple-500/5', hoverBg: 'hover:bg-violet-500/5', accent: 'text-violet-500', accentBg: 'bg-violet-500', countBg: 'bg-violet-500/10 text-violet-600' },
  { gradient: 'from-amber-500/15 to-orange-500/5', hoverBg: 'hover:bg-amber-500/5', accent: 'text-amber-500', accentBg: 'bg-amber-500', countBg: 'bg-amber-500/10 text-amber-600' },
  { gradient: 'from-cyan-500/15 to-blue-500/5', hoverBg: 'hover:bg-cyan-500/5', accent: 'text-cyan-500', accentBg: 'bg-cyan-500', countBg: 'bg-cyan-500/10 text-cyan-600' },
  { gradient: 'from-rose-500/15 to-pink-500/5', hoverBg: 'hover:bg-rose-500/5', accent: 'text-rose-500', accentBg: 'bg-rose-500', countBg: 'bg-rose-500/10 text-rose-600' },
  { gradient: 'from-lime-500/15 to-green-500/5', hoverBg: 'hover:bg-lime-500/5', accent: 'text-lime-500', accentBg: 'bg-lime-500', countBg: 'bg-lime-500/10 text-lime-600' },
  { gradient: 'from-sky-500/15 to-indigo-500/5', hoverBg: 'hover:bg-sky-500/5', accent: 'text-sky-500', accentBg: 'bg-sky-500', countBg: 'bg-sky-500/10 text-sky-600' },
  { gradient: 'from-fuchsia-500/15 to-pink-500/5', hoverBg: 'hover:bg-fuchsia-500/5', accent: 'text-fuchsia-500', accentBg: 'bg-fuchsia-500', countBg: 'bg-fuchsia-500/10 text-fuchsia-600' },
]

// New categories (show "New" badge) - determined by name matching
const newCategoryNames = new Set(['security', 'devops'])

interface CategoryGridProps {
  categories: Category[]
  loading?: boolean
}

function CategorySkeleton() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-border/50 bg-card p-3">
      <div className="h-12 w-12 animate-pulse rounded-xl bg-muted" />
      <div className="h-3.5 w-14 animate-pulse rounded bg-muted" />
      <div className="h-2.5 w-10 animate-pulse rounded bg-muted" />
    </div>
  )
}

function CategoryListSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3">
      <div className="h-10 w-10 animate-pulse rounded-xl bg-muted" />
      <div className="flex-1">
        <div className="h-3.5 w-20 animate-pulse rounded bg-muted mb-1" />
        <div className="h-2.5 w-14 animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}

export function CategoryGrid({ categories, loading }: CategoryGridProps) {
  const { goCategory } = useShopRouter()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [pressedId, setPressedId] = useState<string | null>(null)

  if (loading) {
    return (
      <section className="px-4 py-3">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">Shop by Category</h2>
        </div>
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <CategorySkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <CategoryListSkeleton key={i} />
            ))}
          </div>
        )}
      </section>
    )
  }

  if (categories.length === 0) return null

  const handleCategoryClick = (categoryId: string, slug?: string) => {
    goCategory(categoryId, slug)
  }

  // Find the featured category (first featured or most products)
  const featuredIndex = categories.findIndex(c => c._count?.products && c._count.products > 3)

  return (
    <section className="px-4 py-3">
      {/* Section Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-foreground">Shop by Category</h2>
          <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
            {categories.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-0.5 rounded-lg border border-border/50 bg-muted/30 p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              <Grid3X3 className="h-3 w-3" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              <List className="h-3 w-3" />
            </button>
          </div>
          <button
            onClick={() => goCategory()}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            View All
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          /* Grid View */
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-4 gap-2"
          >
            {categories.map((category, index) => {
              const IconComponent = iconMap[category.icon || ''] || Globe
              const productCount = category._count?.products || 0
              const theme = categoryThemes[index % categoryThemes.length]
              const isNew = newCategoryNames.has(category.slug?.toLowerCase() || '')
              const isFeatured = index === featuredIndex

              return (
                <motion.button
                  key={category.id}
                  className={`group relative flex flex-col items-center gap-1.5 rounded-2xl border bg-card p-2.5 transition-all active:scale-95 ${
                    isFeatured
                      ? 'border-primary/30 shadow-sm shadow-primary/5 ' + theme.hoverBg
                      : 'border-border/50 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5 ' + theme.hoverBg
                  }`}
                  onClick={() => handleCategoryClick(category.id, category.slug)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.04 }}
                  whileTap={{ scale: 0.95 }}
                  onHoverStart={() => setPressedId(category.id)}
                  onHoverEnd={() => setPressedId(null)}
                >
                  {/* Featured highlight */}
                  {isFeatured && (
                    <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                      <Crown className="h-2.5 w-2.5 text-primary-foreground" />
                    </div>
                  )}

                  {/* New Badge */}
                  {isNew && (
                    <div className="absolute -top-1.5 -left-1 z-10">
                      <span className="flex items-center gap-0.5 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[7px] font-bold text-white shadow-sm">
                        <Sparkles className="h-2 w-2" />
                        NEW
                      </span>
                    </div>
                  )}

                  {/* Icon with animated hover */}
                  <motion.div
                    className={`relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${theme.gradient} overflow-hidden`}
                    animate={pressedId === category.id ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <IconComponent className={`h-5 w-5 ${theme.accent}`} />
                    {/* Hover shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={pressedId === category.id ? { x: '100%' } : { x: '-100%' }}
                      transition={{ duration: 0.5 }}
                    />
                  </motion.div>

                  {/* Category Name */}
                  <span className="text-[11px] font-semibold text-foreground line-clamp-1 text-center leading-tight">
                    {category.name}
                  </span>

                  {/* Product Count Badge */}
                  <span className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[8px] font-medium ${theme.countBg}`}>
                    <ShoppingBag className="h-2 w-2" />
                    {productCount}
                  </span>
                </motion.button>
              )
            })}
          </motion.div>
        ) : (
          /* List View */
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {categories.map((category, index) => {
              const IconComponent = iconMap[category.icon || ''] || Globe
              const productCount = category._count?.products || 0
              const theme = categoryThemes[index % categoryThemes.length]
              const isNew = newCategoryNames.has(category.slug?.toLowerCase() || '')
              const isFeatured = index === featuredIndex

              return (
                <motion.button
                  key={category.id}
                  className={`group flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left transition-all active:scale-[0.98] ${
                    isFeatured
                      ? 'border-primary/30 shadow-sm'
                      : 'border-border/50 hover:border-primary/20 hover:shadow-md'
                  }`}
                  onClick={() => handleCategoryClick(category.id, category.slug)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Icon */}
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${theme.gradient}`}>
                    <IconComponent className={`h-5 w-5 ${theme.accent}`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-semibold text-foreground line-clamp-1">{category.name}</h3>
                      {isNew && (
                        <span className="flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-bold text-emerald-500">
                          <Sparkles className="h-2 w-2" />
                          NEW
                        </span>
                      )}
                      {isFeatured && (
                        <span className="flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[8px] font-bold text-primary">
                          <Crown className="h-2 w-2" />
                          TOP
                        </span>
                      )}
                    </div>
                    {category.description && (
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{category.description}</p>
                    )}
                  </div>

                  {/* Count */}
                  <div className={`flex items-center gap-0.5 rounded-full px-2 py-1 text-[10px] font-medium ${theme.countBg}`}>
                    <ShoppingBag className="h-2.5 w-2.5" />
                    {productCount}
                  </div>

                  {/* Arrow */}
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
