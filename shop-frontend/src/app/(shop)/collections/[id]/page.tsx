'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft, FolderOpen, ShoppingCart, Star, Package
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useShopStore, type Product } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { toast } from 'sonner'
import { useParams } from 'next/navigation'

interface CollectionData {
  id: string
  title: string
  description: string
  type: string
  products: Array<{
    id: string
    name: string
    slug: string
    description: string
    price: number
    comparePrice: number | null
    imageUrl: string | null
    category: { name: string; slug: string }
  }>
  productCount: number
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
}

export default function CollectionDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const { goBack, goProduct } = useShopRouter()
  const { addToCart } = useShopStore()
  const [collection, setCollection] = useState<CollectionData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchCollection = useCallback(async () => {
    if (!id) return
    try {
      const res = await fetch(`/api/collections/${id}`)
      if (res.ok) {
        const data = await res.json()
        setCollection(data)
      }
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchCollection() }, [fetchCollection])

  if (loading) {
    return (
      <div className="px-4 py-4 space-y-4">
        <div className="h-40 animate-pulse rounded-2xl bg-muted" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="flex flex-col items-center py-16 text-center px-4">
        <FolderOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <p className="text-sm font-medium text-foreground">Collection not found</p>
        <Button variant="outline" onClick={goBack} className="mt-4">Go Back</Button>
      </div>
    )
  }

  return (
    <motion.div
      className="pb-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack} className="flex-shrink-0 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-foreground line-clamp-1">{collection.title}</h1>
            <p className="text-[11px] text-muted-foreground">{collection.productCount} items</p>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="mx-4 mt-3 overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/30">
            <FolderOpen className="h-7 w-7 text-emerald-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{collection.title}</p>
            <p className="text-xs text-muted-foreground">{collection.description}</p>
          </div>
        </div>
        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
          <Package className="mr-1 h-3 w-3" />
          {collection.type === 'staff_picks' ? 'Staff Picks' : collection.type.charAt(0).toUpperCase() + collection.type.slice(1)}
        </Badge>
      </div>

      {/* Products Grid */}
      <div className="px-4 mt-3">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Products</h2>
          <span className="text-[11px] text-muted-foreground">{collection.products.length} items</span>
        </div>

        {collection.products.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <Package className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No products in this collection yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {collection.products.map((product, index) => {
              const discount = product.comparePrice
                ? Math.round((1 - product.price / product.comparePrice) * 100)
                : 0

              return (
                <motion.div
                  key={product.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <button
                    className="relative flex h-28 items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5"
                    onClick={() => goProduct(product.id)}
                  >
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-3xl opacity-30"></span>
                    )}
                    {discount > 0 && (
                      <Badge className="absolute left-2 top-2 bg-destructive/90 text-white text-[9px]">
                        -{discount}%
                      </Badge>
                    )}
                  </button>
                  <div className="p-2.5">
                    <div onClick={() => goProduct(product.id)} className="text-left w-full cursor-pointer">
                      <h3 className="text-xs font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{product.description}</p>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-bold text-primary">{formatPrice(product.price)}</span>
                        {product.comparePrice && (
                          <span className="ml-1 text-[10px] text-muted-foreground line-through">
                            {formatPrice(product.comparePrice)}
                          </span>
                        )}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                        onClick={() => {
                          addToCart({
                            productId: product.id,
                            name: product.name,
                            price: product.price,
                            quantity: 1,
                            imageUrl: product.imageUrl,
                          })
                          toast.success('Added to cart!')
                        }}
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      <Separator className="my-6" />
    </motion.div>
  )
}
