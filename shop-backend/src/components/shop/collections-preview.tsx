'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, FolderOpen, Sparkles, TrendingUp, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useShopRouter } from '@/hooks/use-shop-router'

interface Collection {
  id: string
  title: string
  description: string
  type: string
  productCount: number
  isFeatured: boolean
}

const typeIcons: Record<string, React.ElementType> = {
  seasonal: Sparkles,
  curated: FolderOpen,
  trending: TrendingUp,
  staff_pick: Star,
  new: ArrowRight,
}

const typeGradients: Record<string, string> = {
  seasonal: 'from-emerald-500 to-teal-500',
  curated: 'from-violet-500 to-purple-500',
  trending: 'from-rose-500 to-pink-500',
  staff_pick: 'from-amber-500 to-orange-500',
  new: 'from-sky-500 to-blue-500',
}

export function CollectionsPreview() {
  const { goCollections, goCollectionDetail } = useShopRouter()
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await fetch('/api/collections?featured=true')
        if (res.ok) {
          const data = await res.json()
          const items: Collection[] = data.data || data
          setCollections(items.slice(0, 8))
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchCollections()
  }, [])

  return (
    <section className="py-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between px-4">
        <div>
          <h2 className="text-base font-bold text-foreground">Curated Collections</h2>
          <p className="text-[11px] text-muted-foreground">Hand-picked for you</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => goCollections()}
          className="gap-1 text-xs font-medium text-primary hover:text-primary/80"
        >
          View All
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="min-w-[140px] h-[160px] animate-pulse rounded-xl bg-muted"
              />
            ))
          : collections.map((col, i) => {
              const Icon = typeIcons[col.type] || FolderOpen
              const gradient = typeGradients[col.type] || 'from-gray-500 to-gray-600'

              return (
                <motion.button
                  key={col.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
                  onClick={() => goCollectionDetail(col.id)}
                  className="group min-w-[140px] flex-shrink-0 text-left"
                >
                  {/* Cover card */}
                  <div
                    className={`relative h-[120px] overflow-hidden rounded-xl bg-gradient-to-br ${gradient} shadow-md`}
                  >
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full border-4 border-white/30" />
                      <div className="absolute -bottom-2 -left-2 h-16 w-16 rounded-full border-4 border-white/20" />
                    </div>

                    <div className="relative z-10 flex h-full flex-col justify-between p-3">
                      <Icon className="h-5 w-5 text-white/80" />
                      <div>
                        <p className="text-xs font-bold text-white leading-tight line-clamp-2">
                          {col.title}
                        </p>
                        <p className="mt-0.5 text-[10px] font-medium text-white/70">
                          {col.productCount} items
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.button>
              )
            })}
      </div>
    </section>
  )
}
