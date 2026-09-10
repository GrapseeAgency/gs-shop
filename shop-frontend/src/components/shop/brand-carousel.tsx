'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Star, ArrowRight, Verified } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useShopRouter } from '@/hooks/use-shop-router'

interface Brand {
  id: string
  name: string
  slug: string
  logo: string | null
  description: string | null
  productCount: number
  isFeatured: boolean
  category: string
}

const brandGradients = [
  'from-rose-500/10 to-pink-500/5',
  'from-violet-500/10 to-purple-500/5',
  'from-emerald-500/10 to-green-500/5',
  'from-amber-500/10 to-yellow-500/5',
  'from-cyan-500/10 to-blue-500/5',
  'from-fuchsia-500/10 to-pink-500/5',
]

export function BrandCarousel() {
  const { goBrands } = useShopRouter()
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [activeDot, setActiveDot] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/brands')
      .then((res) => res.json())
      .then((data) => {
        // STRICT VALIDATION - Only show if we have valid brands with required fields
        const validBrands: Brand[] = []
        if (Array.isArray(data) && data.length > 0) {
          data.forEach((b: Record<string, unknown>, i: number) => {
            // Must have id and name
            if (b.id && b.name) {
              validBrands.push({
                id: b.id as string,
                name: b.name as string,
                slug: b.slug as string || String(b.id),
                logo: (b.icon as string) || (b.logo as string) || null,
                description: b.description as string || null,
                productCount: (b._count as Record<string, number>)?.products || 0,
                isFeatured: b.isFeatured as boolean || false,
                category: b.category as string || 'Tech',
              })
            }
          })
        }
        // ONLY set if we have VALID brands - no fallback
        if (validBrands.length > 0) {
          setBrands(validBrands)
        }
        // NO FALLBACK - strictly hide if no valid brands
      })
      .catch(() => {
        // Silent fail - no fallback
      })
      .finally(() => setLoading(false))
  }, [])

  // Auto scroll
  useEffect(() => {
    if (isPaused || !scrollRef.current) return
    const container = scrollRef.current
    const scrollWidth = container.scrollWidth
    const clientWidth = container.clientWidth

    const interval = setInterval(() => {
      if (container.scrollLeft + clientWidth >= scrollWidth - 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' })
        setActiveDot(0)
      } else {
        container.scrollBy({ left: 160, behavior: 'smooth' })
        setActiveDot((prev) => prev + 1)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isPaused])

  // Update active dot on manual scroll
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    const totalPages = Math.ceil(scrollWidth / clientWidth)
    const currentPage = Math.round(scrollLeft / clientWidth)
    setActiveDot(Math.min(currentPage, totalPages - 1))
  }, [])

  const totalPages = Math.max(1, Math.ceil(brands.length / 3))

  // Silent - don't show if no brands (must be after all hooks)
  if (!loading && brands.length === 0) return null

  return (
    <section className="py-4 relative z-10">
      <div className="mb-3.5 flex items-center justify-between px-4">
        <div>
          <h2 className="text-base font-extrabold text-gradient-green">Shop by Brand</h2>
          <p className="text-[10px] font-semibold text-muted-foreground/80">Top brands you trust</p>
        </div>
        <button
          onClick={() => goBrands()}
          className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
        >
          View All
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="flex gap-3 overflow-x-auto px-4 pb-3 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {brands.map((brand, index) => (
          <motion.div
            key={brand.id}
            className={`group relative flex w-[140px] flex-shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-primary/15 bg-card/60 backdrop-blur-md transition-all duration-300 hover:border-primary/35 hover:shadow-lg active:scale-[0.97]`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.04 }}
          >
            {/* Ambient liquid flow inside card */}
            <div className={`absolute inset-0 bg-gradient-to-br ${brandGradients[index % brandGradients.length]} opacity-60 mix-blend-overlay -z-10`} />
            <div className="absolute inset-0 liquid-caustic opacity-20 pointer-events-none -z-10" />

            {/* Featured badge */}
            {brand.isFeatured && (
              <Badge className="absolute right-2 top-2 z-10 gap-0.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-[8px] px-1.5 py-0 border border-amber-400/20 font-extrabold shadow-sm rounded-full">
                <Verified className="h-2.5 w-2.5 animate-pulse" />
                Premium
              </Badge>
            )}

            {/* Logo placeholder */}
            <div className="flex h-20 items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 liquid-aurora opacity-10 pointer-events-none" />
              <span className="text-2xl font-black text-primary transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 relative z-10">
                {brand.name.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col p-3 pt-0 text-left relative z-10">
              <h3 className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors leading-tight">
                {brand.name}
              </h3>
              <p className="text-[9px] font-semibold text-muted-foreground/80 mt-0.5">{brand.category}</p>
              <div className="mt-1.5 flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="text-[9px] font-bold text-muted-foreground/90">
                  {brand.productCount} products
                </span>
              </div>
              <button
                onClick={() => goBrands()}
                className="mt-3.5 w-full rounded-lg bg-primary text-primary-foreground py-1.5 text-[10px] font-bold transition-all duration-300 hover:bg-primary/95 active:scale-95 btn-liquid shadow-sm shadow-primary/15"
              >
                Shop Now
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-1.5 px-4 mt-1">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              if (scrollRef.current) {
                scrollRef.current.scrollTo({
                  left: i * scrollRef.current.clientWidth,
                  behavior: 'smooth',
                })
                setActiveDot(i)
              }
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeDot ? 'w-5 bg-primary shadow-sm shadow-primary/20' : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
            aria-label={`Go to page ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}

