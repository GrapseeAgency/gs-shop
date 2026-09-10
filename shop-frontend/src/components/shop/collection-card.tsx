'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Sun, TrendingUp, Award, Star, ShoppingBag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'


type CollectionType = 'curated' | 'seasonal' | 'trending' | 'staff_pick' | 'new'

interface CollectionCardProps {
  id?: string
  title: string
  description?: string
  itemCount: number
  type: CollectionType
  imageUrl?: string | null
  isFeatured?: boolean
  gradient?: string
  onClick?: () => void
  index?: number
}

const typeConfig: Record<CollectionType, {
  icon: React.ElementType
  label: string
  color: string
  bg: string
  gradient: string
}> = {
  curated: { icon: Sparkles, label: 'Curated', color: 'text-violet-400', bg: 'bg-violet-500/15', gradient: 'from-violet-500/40 to-purple-700/30' },
  seasonal: { icon: Sun, label: 'Seasonal', color: 'text-orange-400', bg: 'bg-orange-500/15', gradient: 'from-orange-500/40 to-amber-700/30' },
  trending: { icon: TrendingUp, label: 'Trending', color: 'text-rose-400', bg: 'bg-rose-500/15', gradient: 'from-rose-500/40 to-pink-700/30' },
  staff_pick: { icon: Award, label: 'Staff Pick', color: 'text-amber-400', bg: 'bg-amber-500/15', gradient: 'from-amber-500/40 to-emerald-700/30' },
  new: { icon: Star, label: 'New', color: 'text-pink-400', bg: 'bg-pink-500/15', gradient: 'from-pink-500/40 to-rose-700/30' },
}

export function CollectionCard({
  title,
  description,
  itemCount,
  type,
  imageUrl,
  isFeatured = false,
  gradient,
  onClick,
  index = 0,
}: CollectionCardProps) {
  const config = typeConfig[type] || typeConfig.curated
  const TypeIcon = config.icon
  const bgGradient = gradient || config.gradient

  return (
    <motion.button
      className="group relative flex w-[180px] flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-border/50 bg-card transition-all hover:border-primary/20 hover:shadow-lg"
      onClick={onClick}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Featured ribbon */}
      {isFeatured && (
        <div className="absolute right-0 top-0 z-20">
          <div className="bg-primary text-primary-foreground text-[8px] font-bold px-2.5 py-0.5 rounded-bl-lg">
             Featured
          </div>
        </div>
      )}

      {/* Cover with gradient */}
      <div className={`relative flex h-28 items-center justify-center bg-gradient-to-br ${bgGradient} overflow-hidden`}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <>
            {/* Background animated icon */}
            <span className="absolute opacity-20 pointer-events-none">
              <TypeIcon className="h-14 w-14" />
            </span>
            <TypeIcon className={`h-10 w-10 ${config.color} opacity-60 transition-transform duration-300 group-hover:scale-110`} />
          </>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        {/* Title overlay on gradient */}
        <h3 className="absolute bottom-2 left-2 right-2 text-xs font-bold text-white line-clamp-2 drop-shadow-md">
          {title}
        </h3>

        {/* Type badge */}
        <Badge className={`absolute left-2 top-2 gap-0.5 ${config.bg} ${config.color} text-[9px] px-1.5 py-0 border-0`}>
          <TypeIcon className="h-2.5 w-2.5" />
          {config.label}
        </Badge>

        {/* Item count badge */}
        <div className="absolute bottom-2 right-2 flex items-center gap-0.5 rounded-full bg-black/40 px-1.5 py-0.5 backdrop-blur-sm">
          <ShoppingBag className="h-2.5 w-2.5 text-white/80" />
          <span className="text-[9px] font-semibold text-white/90">
            {itemCount}
          </span>
        </div>
      </div>

      {/* Info section */}
      <div className="flex items-center justify-between p-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          {description && (
            <p className="text-[9px] text-muted-foreground line-clamp-1 mt-0.5">
              {description}
            </p>
          )}
        </div>
        <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
    </motion.button>
  )
}

