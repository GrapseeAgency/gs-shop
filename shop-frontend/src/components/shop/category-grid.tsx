'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe, Smartphone, Server, Palette, Layout, Code, Shield, Database,
  ArrowRight, Grid3X3, List, Star, Sparkles, ShoppingBag, Crown,
  TrendingUp, Brain, Code2, ShoppingCart, ShieldCheck, BarChart3,
  Plug, FileText, Layers, Gamepad2, Link, Mail, Video, Bot,
  Wand2, Terminal, Cloud, KeyRound, BookOpen, FlaskConical, LayoutTemplate,
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
  TrendingUp,
  Brain,
  Code2,
  ShoppingCart,
  ShieldCheck,
  BarChart3,
  Plug,
  FileText,
  Layers,
  Gamepad2,
  Link,
  Mail,
  Video,
  Bot,
  Wand2,
  Terminal,
  Cloud,
  KeyRound,
  BookOpen,
  FlaskConical,
  LayoutTemplate,
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

const INITIAL_VISIBLE = 8

export function CategoryGrid({ categories, loading }: CategoryGridProps) {
  const { goCategory } = useShopRouter()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [pressedId, setPressedId] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  if (loading) {
    return (
      <section className="px-6 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Shop by Category</h2>
        </div>
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
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

  if (categories.length === 0) {
    return (
      <section className="px-4 py-3">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <CategorySkeleton key={i} />
          ))}
        </div>
      </section>
    )
  }

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
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
              {(showAll ? categories : categories.slice(0, INITIAL_VISIBLE)).map((category, index) => {
                const IconComponent = iconMap[category.icon || ''] || Globe
                const theme = categoryThemes[index % categoryThemes.length]
                const isNew = newCategoryNames.has(category.slug?.toLowerCase() || '')

                return (
                  <motion.div
                    key={category.id}
                    role="button"
                    tabIndex={0}
                    className="group relative flex flex-col items-center gap-1.5 rounded-xl border border-border/30 bg-card/60 backdrop-blur-md p-2.5 transition-all active:scale-95 cursor-pointer card-premium"
                    onClick={() => handleCategoryClick(category.id, category.slug)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                    whileTap={{ scale: 0.95 }}
                    onHoverStart={() => setPressedId(category.id)}
                    onHoverEnd={() => setPressedId(null)}
                  >
                    {isNew && (
                      <div className="absolute -top-1 -right-1 z-10 h-3.5 w-3.5 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm shadow-emerald-500/30">
                        <Sparkles className="h-2 w-2 text-white animate-pulse" />
                      </div>
                    )}

                    <motion.div
                      className={`relative flex h-10 w-10 items-center justify-center bg-gradient-to-br ${theme.gradient} overflow-hidden shadow-inner`}
                      animate={pressedId === category.id 
                        ? { scale: 1.15, rotate: 6, borderRadius: "38% 62% 63% 37% / 41% 44% 56% 59%" } 
                        : { scale: 1, rotate: 0, borderRadius: "12px" }
                      }
                      transition={{ type: 'spring', stiffness: 350, damping: 15 }}
                    >
                      <IconComponent className={`h-4.5 w-4.5 ${theme.accent} transition-transform group-hover:scale-110`} />
                    </motion.div>

                    <span className="text-[10px] font-bold text-foreground/80 group-hover:text-primary transition-colors line-clamp-1 text-center leading-tight w-full mt-0.5">
                      {category.name}
                    </span>
                  </motion.div>
                )
              })}
            </div>

            {/* Show More / Less */}
            {categories.length > INITIAL_VISIBLE && (
              <motion.div className="mt-3 flex justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/40 px-4 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  {showAll ? (
                    <>Show less <Star className="h-3 w-3" /></>
                  ) : (
                    <>+{categories.length - INITIAL_VISIBLE} more categories <ArrowRight className="h-3 w-3" /></>
                  )}
                </button>
              </motion.div>
            )}
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
            {(showAll ? categories : categories.slice(0, INITIAL_VISIBLE)).map((category, index) => {
              const IconComponent = iconMap[category.icon || ''] || Globe
              const productCount = category._count?.products || 0
              const theme = categoryThemes[index % categoryThemes.length]
              const isNew = newCategoryNames.has(category.slug?.toLowerCase() || '')
              const isFeatured = index === featuredIndex

              return (
                <motion.div
                  key={category.id}
                  role="button"
                  tabIndex={0}
                  className={`group flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all active:scale-[0.98] card-premium bg-card/60 backdrop-blur-md ${
                    isFeatured
                      ? 'border-primary/40 shadow-sm'
                      : 'border-border/30 hover:border-primary/30'
                  }`}
                  onClick={() => handleCategoryClick(category.id, category.slug)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Icon */}
                  <motion.div 
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center bg-gradient-to-br ${theme.gradient} overflow-hidden shadow-inner`}
                    whileHover={{ scale: 1.1, rotate: -5, borderRadius: "38% 62% 63% 37% / 41% 44% 56% 59%" }}
                    transition={{ type: 'spring', stiffness: 350, damping: 15 }}
                  >
                    <IconComponent className={`h-5 w-5 ${theme.accent}`} />
                  </motion.div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-semibold text-foreground line-clamp-1">{category.name}</h3>
                      {isNew && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-500">
                          <Sparkles className="h-2 w-2" />
                          NEW
                        </span>
                      )}
                      {isFeatured && (
                        <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
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
                  <div className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium ${theme.countBg}`}>
                    <ShoppingBag className="h-2.5 w-2.5" />
                    {productCount}
                  </div>

                  {/* Arrow */}
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </motion.div>
              )
            })}

            {/* Show More / Less list view */}
            {categories.length > INITIAL_VISIBLE && (
              <div className="flex justify-center pt-1">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/40 px-4 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  {showAll ? (
                    <>Show less <Star className="h-3 w-3" /></>
                  ) : (
                    <>+{categories.length - INITIAL_VISIBLE} more categories <ArrowRight className="h-3 w-3" /></>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

