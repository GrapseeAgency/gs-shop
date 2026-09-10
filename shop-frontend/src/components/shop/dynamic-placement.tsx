'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight, X, Info, Flame, BadgeAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useShopRouter } from '@/hooks/use-shop-router'

export interface Placement {
  id: string
  zone: string
  title: string
  content: string | null
  imageUrl: string | null
  linkUrl: string | null
  bgColor: string
  textColor: string
  type: string // banner, card, nudge, alert
  isActive: boolean
  order: number
}

interface DynamicPlacementProps {
  zone: string
  className?: string
}

export function DynamicPlacement({ zone, className = '' }: DynamicPlacementProps) {
  const router = useShopRouter()
  const [placements, setPlacements] = useState<Placement[]>([])
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const fetchPlacements = async () => {
      try {
        const res = await fetch(`/api/placements?zone=${zone}`)
        if (res.ok) {
          const data = await res.json()
          setPlacements(Array.isArray(data.placements) ? data.placements : [])
        }
      } catch (err) {
        console.error('Failed to load placement:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPlacements()
  }, [zone])

  if (loading || dismissed || placements.length === 0) {
    return null
  }

  // Handle click linking
  const handleAction = (linkUrl: string | null) => {
    if (!linkUrl) return
    if (linkUrl.startsWith('http')) {
      window.open(linkUrl, '_blank')
    } else {
      // Find matching shop router helper or push path
      if (linkUrl === '/deals') router.goDeals()
      else if (linkUrl === '/rewards') router.goRewards()
      else if (linkUrl === '/events') router.goEvents()
      else window.location.href = linkUrl
    }
  }

  // Render the first active item
  const item = placements[0]

  // Template A: Announcement Sticky Alert (global header bar style)
  if (item.type === 'alert') {
    const bgStyle = item.bgColor.includes('from-') 
      ? `bg-gradient-to-r ${item.bgColor}` 
      : `bg-[${item.bgColor}]`

    return (
      <AnimatePresence>
        <motion.div
          className={`w-full relative py-2.5 px-8 text-center text-xs font-semibold flex items-center justify-center gap-2 shadow-sm ${bgStyle} ${className}`}
          style={{ color: item.textColor }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div 
            onClick={() => handleAction(item.linkUrl)}
            className={`flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition-opacity`}
          >
            <Sparkles className="h-4 w-4 animate-spin text-white flex-shrink-0" style={{ animationDuration: '3s' }} />
            <span>{item.title}</span>
            {item.content && (
              <span className="hidden md:inline-block font-normal opacity-90 border-l border-white/30 pl-2">
                {item.content}
              </span>
            )}
            {item.linkUrl && (
              <ArrowRight className="h-3 w-3 inline-block ml-1 animate-pulse" />
            )}
          </div>
          
          <button 
            onClick={() => setDismissed(true)} 
            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 p-1 text-white"
          >
            <X className="h-3 w-3" />
          </button>
        </motion.div>
      </AnimatePresence>
    )
  }

  // Template B: Promotional Marketing Card (glassmorphism dashboard box)
  if (item.type === 'card') {
    const isGradient = item.bgColor.includes('from-') || item.bgColor.includes('via-')
    const cardBgClass = isGradient 
      ? `bg-gradient-to-br ${item.bgColor}` 
      : item.bgColor.includes('bg-') 
        ? item.bgColor 
        : 'bg-card'

    return (
      <motion.div
        className={`overflow-hidden rounded-2xl p-5 shadow-lg border border-border/40 relative group ${cardBgClass} ${className}`}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-violet-500 animate-ping" />
              <h3 className="text-base font-bold text-foreground flex items-center gap-1.5" style={{ color: item.textColor }}>
                <Flame className="h-4 w-4 text-violet-500" />
                {item.title}
              </h3>
            </div>
            {item.content && (
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                {item.content}
              </p>
            )}
          </div>

          {item.linkUrl && (
            <Button
              onClick={() => handleAction(item.linkUrl)}
              className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-5 text-xs rounded-xl shadow-md transition-all active:scale-95 flex-shrink-0"
            >
              Get Started <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          )}
        </div>

        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-violet-500/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 rounded-2xl" />
      </motion.div>
    )
  }

  // Template C: Inline Glow Nudge (cart, drawer, or sidebar list reminder)
  const nudgeBg = item.bgColor.includes('from-') 
    ? `bg-gradient-to-r ${item.bgColor}` 
    : item.bgColor.includes('bg-') 
      ? item.bgColor 
      : 'bg-primary/5'

  return (
    <motion.div
      onClick={() => handleAction(item.linkUrl)}
      className={`rounded-xl p-3 border border-border/50 flex items-start gap-2.5 cursor-pointer hover:border-primary/20 transition-all ${nudgeBg} ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="h-5 w-5 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 animate-pulse">
        <Info className="h-3.5 w-3.5" style={{ color: item.textColor }} />
      </div>
      <div className="flex-1 space-y-0.5">
        <h4 className="text-[11px] font-bold text-foreground leading-tight" style={{ color: item.textColor }}>
          {item.title}
        </h4>
        {item.content && (
          <p className="text-[10px] text-muted-foreground leading-snug">
            {item.content}
          </p>
        )}
      </div>
      {item.linkUrl && (
        <ArrowRight className="h-3 w-3 text-muted-foreground self-center flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity" />
      )}
    </motion.div>
  )
}

