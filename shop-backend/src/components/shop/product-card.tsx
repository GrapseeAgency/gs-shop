'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Star, Heart, ShoppingCart, Eye, Zap, GitCompare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useShopStore, type Product } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'

const gradientColors = [
  'from-emerald-500/20 to-teal-600/20',
  'from-violet-500/20 to-purple-600/20',
  'from-amber-500/20 to-orange-600/20',
  'from-rose-500/20 to-pink-600/20',
  'from-cyan-500/20 to-blue-600/20',
  'from-lime-500/20 to-green-600/20',
]

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

interface ProductCardProps {
  product: Product
  index?: number
  variant?: 'grid' | 'horizontal'
}

export function ProductCard({ product, index = 0, variant = 'grid' }: ProductCardProps) {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist, addToCompare, isInCompare, compareList } = useShopStore()
  const isComparing = isInCompare(product.id)
  const { goProduct } = useShopRouter()
  const isWishlisted = isInWishlist(product.id)
  const [imgLoaded, setImgLoaded] = useState(false)
  const gradientIndex =
    product.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    gradientColors.length

  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0

  const handleViewDetails = () => {
    goProduct(product.id)
  }

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
    })
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isWishlisted) {
      removeFromWishlist(product.id)
      toast.success('Removed from wishlist')
    } else {
      addToWishlist({
        productId: product.id,
        name: product.name,
        price: product.price,
        comparePrice: product.comparePrice,
        imageUrl: product.imageUrl,
      })
      toast.success('Added to wishlist!')
    }
  }

  const handleCompare = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isComparing) {
      toast.info('Removed from compare')
    } else if (compareList.length >= 3) {
      toast.error('Max 3 items to compare')
      return
    } else {
      toast.success('Added to compare!')
    }
    if (!isComparing) addToCompare(product)
  }

  if (variant === 'horizontal') {
    return (
      <motion.button
        className="group flex w-full gap-3 rounded-2xl border border-border/50 bg-card p-3 text-left transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98]"
        onClick={handleViewDetails}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Image */}
        <div className={`relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ${gradientColors[gradientIndex]}`}>
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              onLoad={() => setImgLoaded(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-2xl opacity-40"></span>
            </div>
          )}
          {discount > 0 && (
            <Badge className="absolute left-1.5 top-1.5 h-5 bg-destructive/90 px-1.5 text-[10px] font-bold text-white">
              -{discount}%
            </Badge>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col justify-between py-0.5">
          <div>
            <h3 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
              {product.description}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.comparePrice && (
                <span className="text-[11px] text-muted-foreground line-through">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
            </div>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              onClick={handleQuickAdd}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </motion.button>
    )
  }

  return (
    <motion.div
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card transition-all hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Wishlist Button */}
      <button
        onClick={handleWishlist}
        className="absolute right-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-background/60 backdrop-blur-sm transition-all hover:bg-background/90 active:scale-90"
      >
        <Heart
          className={`h-3.5 w-3.5 transition-colors ${
            isWishlisted ? 'fill-red-500 text-red-500' : 'text-foreground/70'
          }`}
        />
      </button>
      {/* Compare Button */}
      <button
        onClick={handleCompare}
        className="absolute right-2 top-11 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-background/60 backdrop-blur-sm transition-all hover:bg-background/90 active:scale-90"
      >
        <GitCompare
          className={`h-3.5 w-3.5 transition-colors ${
            isComparing ? 'text-primary' : 'text-foreground/70'
          }`}
        />
      </button>

      {/* Image Section */}
      <button
        onClick={handleViewDetails}
        className="relative flex-shrink-0 overflow-hidden"
      >
        <div
          className={`flex aspect-[4/3] items-center justify-center bg-gradient-to-br ${gradientColors[gradientIndex]} transition-transform duration-500 group-hover:scale-[1.02]`}
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImgLoaded(true)}
            />
          ) : (
            <div className="text-center">
              <div className="text-4xl opacity-30 transition-transform duration-300 group-hover:scale-110"></div>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.isFeatured && (
            <Badge className="bg-amber-500/90 text-white shadow-sm">
              <Zap className="mr-1 h-3 w-3" />
              Featured
            </Badge>
          )}
          {discount > 0 && (
            <Badge className="bg-destructive/90 text-white shadow-sm">
              -{discount}% OFF
            </Badge>
          )}
        </div>

        {/* Quick View Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/20 group-hover:opacity-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background/90 shadow-lg transition-transform scale-75 group-hover:scale-100">
            <Eye className="h-4 w-4 text-foreground" />
          </div>
        </div>
      </button>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-3">
        <button onClick={handleViewDetails} className="text-left">
          <h3 className="mb-1 text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="mb-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </button>

        {/* Rating Stars (decorative) */}
        <div className="mb-2 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-3 w-3 ${
                star <= 4 ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'
              }`}
            />
          ))}
          <span className="ml-1 text-[10px] text-muted-foreground">(4.0)</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleQuickAdd}
            className="h-7 gap-1 bg-primary/10 px-2.5 text-xs text-primary hover:bg-primary hover:text-primary-foreground transition-all"
            variant="ghost"
          >
            <ShoppingCart className="h-3 w-3" />
            Add
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card">
      <div className="aspect-[4/3] animate-pulse bg-muted" />
      <div className="flex flex-col gap-2 p-3">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        <div className="flex items-center justify-between">
          <div className="h-5 w-16 animate-pulse rounded bg-muted" />
          <div className="h-7 w-14 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  )
}

export { formatPrice }
