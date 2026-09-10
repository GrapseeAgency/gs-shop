'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductList } from '@/components/shop/product-list'
import { useShopStore, type Product, type Category } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Globe,
}

const categoryGradients = [
  'from-emerald-500/15 to-teal-500/5',
  'from-violet-500/15 to-purple-500/5',
  'from-amber-500/15 to-orange-500/5',
  'from-cyan-500/15 to-blue-500/5',
  'from-rose-500/15 to-pink-500/5',
  'from-lime-500/15 to-green-500/5',
]

export default function CategoryPage() {
  const { goBack, goCategory } = useShopRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories')
        if (res.ok) setCategories(await res.json())
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
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
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">All Categories</h1>
          <p className="text-xs text-muted-foreground">
            {categories.length} categories available
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Globe className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No categories yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Check back soon for updates</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {categories.map((category, index) => {
            const IconComponent = iconMap[category.icon || ''] || Globe
            const productCount = category._count?.products || 0
            const gradient = categoryGradients[index % categoryGradients.length]

            return (
              <motion.button
                key={category.id}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-border/50 bg-card p-4 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 active:scale-95"
                onClick={() => goCategory(category.id, category.slug)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} transition-transform duration-200 group-hover:scale-110`}>
                  <IconComponent className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground line-clamp-1 text-center">
                  {category.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {productCount} {productCount === 1 ? 'item' : 'items'}
                </span>
                {category.description && (
                  <span className="text-[10px] text-muted-foreground line-clamp-2 text-center">
                    {category.description}
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
