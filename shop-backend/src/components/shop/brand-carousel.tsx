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

const fallbackBrands: Brand[] = [
  { id: '1', name: 'React', slug: 'react', logo: 'R', description: 'Frontend framework', productCount: 24, isFeatured: true, category: 'Frontend' },
  { id: '2', name: 'Next.js', slug: 'nextjs', logo: 'N', description: 'Full-stack framework', productCount: 18, isFeatured: true, category: 'Framework' },
  { id: '3', name: 'Node.js', slug: 'nodejs', logo: 'N', description: 'Backend runtime', productCount: 15, isFeatured: false, category: 'Backend' },
  { id: '4', name: 'AWS', slug: 'aws', logo: 'A', description: 'Cloud platform', productCount: 22, isFeatured: true, category: 'Cloud' },
  { id: '5', name: 'Figma', slug: 'figma', logo: 'F', description: 'Design tool', productCount: 12, isFeatured: false, category: 'Design' },
  { id: '6', name: 'Docker', slug: 'docker', logo: 'D', description: 'Containerization', productCount: 10, isFeatured: false, category: 'DevOps' },
  { id: '7', name: 'TypeScript', slug: 'typescript', logo: 'TS', description: 'Programming language', productCount: 20, isFeatured: true, category: 'Language' },
  { id: '8', name: 'PostgreSQL', slug: 'postgresql', logo: 'PG', description: 'Database', productCount: 8, isFeatured: false, category: 'Database' },
  { id: '9', name: 'Vercel', slug: 'vercel', logo: 'V', description: 'Deployment', productCount: 14, isFeatured: true, category: 'Deploy' },
  { id: '10', name: 'Stripe', slug: 'stripe', logo: 'S', description: 'Payment processing', productCount: 6, isFeatured: false, category: 'Payments' },
]

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
  const [brands, setBrands] = useState<Brand[]>(fallbackBrands)
  const [activeDot, setActiveDot] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/brands')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: Brand[] = data.map((b: Record<string, unknown>, i: number) => ({
            id: b.id as string || String(i),
            name: b.name as string,
            slug: b.slug as string,
            logo: (b.icon as string) || (b.logo as string) || 'B',
            description: b.description as string || null,
            productCount: (b._count as Record<string, number>)?.products || Math.floor(Math.random() * 20) + 3,
            isFeatured: b.isFeatured as boolean || false,
            category: b.category as string || 'Tech',
          }))
          setBrands(mapped)
        }
      })
      .catch(() => {})
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

  return (
    <section className="py-4">
      <div className="mb-3 flex items-center justify-between px-4">
        <div>
          <h2 className="text-base font-bold text-foreground">Shop by Brand</h2>
          <p className="text-[11px] text-muted-foreground">Top brands you trust</p>
        </div>
        <button
          onClick={() => goBrands()}
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          View All
          <ArrowRight className="h-3 w-3" />
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
            className={`group relative flex w-[140px] flex-shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br ${brandGradients[index % brandGradients.length]} bg-card transition-all hover:border-primary/20 hover:shadow-lg active:scale-[0.97]`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.04 }}
          >
            {/* Featured badge */}
            {brand.isFeatured && (
              <Badge className="absolute right-2 top-2 z-10 gap-0.5 bg-amber-500/90 text-white text-[8px] px-1.5 py-0">
                <Verified className="h-2.5 w-2.5" />
                Premium
              </Badge>
            )}

            {/* Logo placeholder */}
            <div className="flex h-20 items-center justify-center">
              <span className="text-2xl font-bold text-primary transition-transform duration-300 group-hover:scale-110">
                {brand.name.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col p-3 pt-0">
              <h3 className="text-xs font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {brand.name}
              </h3>
              <p className="text-[9px] text-muted-foreground line-clamp-1">{brand.category}</p>
              <div className="mt-1.5 flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="text-[9px] font-medium text-muted-foreground">
                  {brand.productCount} products
                </span>
              </div>
              <button
                onClick={() => goBrands()}
                className="mt-2 w-full rounded-lg bg-primary/10 py-1.5 text-[10px] font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground active:scale-95"
              >
                Shop Now
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-1.5 px-4">
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
              i === activeDot ? 'w-5 bg-primary' : 'w-1.5 bg-muted-foreground/30'
            }`}
            aria-label={`Go to page ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
