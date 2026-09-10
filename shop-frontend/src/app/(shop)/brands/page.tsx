'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Globe, Smartphone, Server, Palette, Layout, Code, Shield, Database, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useShopRouter } from '@/hooks/use-shop-router'

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

interface BrandData {
  id: string
  name: string
  slug: string
  logo: string | null
  icon: string | null
  order: number
  isActive: boolean
}

const brandColors: Record<string, string> = {
  react: 'text-cyan-400',
  nextjs: 'text-foreground',
  aws: 'text-amber-400',
  docker: 'text-blue-400',
  typescript: 'text-blue-400',
  figma: 'text-violet-400',
  postgresql: 'text-blue-400',
  vercel: 'text-foreground',
  kubernetes: 'text-blue-400',
  stripe: 'text-violet-400',
  firebase: 'text-amber-400',
  tailwindcss: 'text-cyan-400',
}

const brandCategories: Record<string, string> = {
  react: 'Frontend',
  nextjs: 'Framework',
  aws: 'Cloud',
  docker: 'DevOps',
  typescript: 'Language',
  figma: 'Design',
  postgresql: 'Database',
  vercel: 'Platform',
  kubernetes: 'DevOps',
  stripe: 'Payments',
  firebase: 'Backend',
  tailwindcss: 'Styling',
}

const brandIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  react: Code,
  nextjs: Globe,
  aws: Shield,
  docker: Server,
  typescript: Code,
  figma: Palette,
  postgresql: Database,
  vercel: Globe,
  kubernetes: Layout,
  stripe: Shield,
  firebase: Server,
  tailwindcss: Palette,
}

function SkeletonCard() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3 animate-pulse">
      <div className="h-10 w-10 rounded-lg bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-20 rounded bg-muted" />
        <div className="h-3 w-14 rounded bg-muted" />
      </div>
    </div>
  )
}

export default function BrandsPage() {
  const { goBack, goCategory } = useShopRouter()
  const [brands, setBrands] = useState<BrandData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBrands() {
      try {
        setLoading(true)
        const res = await fetch('/api/brands')
        if (res.ok) {
          const data = await res.json()
          setBrands(Array.isArray(data) ? data : [])
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchBrands()
  }, [])

  return (
    <motion.div
      className="px-4 py-2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={goBack}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-foreground">Technologies & Brands</h1>
          <p className="text-xs text-muted-foreground">Tech stack we work with</p>
        </div>
      </div>

      {/* Intro */}
      <div className="mb-4 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 p-3">
        <p className="text-xs leading-relaxed text-muted-foreground">
          We leverage the latest and most reliable technologies to deliver exceptional digital products. Here are the tools and frameworks our expert teams use.
        </p>
      </div>

      {/* Tech Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : brands.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Globe className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">No brands available</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Check back later for updates</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {brands.map((brand, index) => {
            const Icon = brandIcons[brand.slug] || Code
            const color = brandColors[brand.slug] || 'text-primary'
            const category = brandCategories[brand.slug] || 'Technology'
            return (
              <motion.div
                key={brand.id}
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50">
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{brand.name}</p>
                  <p className="text-[10px] text-muted-foreground">{category}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <Separator className="my-4" />

      {/* CTA */}
      <div className="mb-4 rounded-xl bg-gradient-to-r from-primary/10 to-transparent p-4 text-center">
        <p className="text-sm font-semibold text-foreground mb-1">Need a specific tech stack?</p>
        <p className="text-xs text-muted-foreground mb-3">We can build with any technology you prefer</p>
        <Button onClick={() => goCategory()} className="bg-primary text-primary-foreground">
          Browse Services
        </Button>
      </div>
    </motion.div>
  )
}
