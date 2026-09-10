'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart,
  Heart,
  Star,
  Eye,
  ChevronRight,
  Shield,
  Truck,
  RotateCcw,
  Ruler,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
import { useShopStore, type Product } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import { InventoryBadge } from '@/components/shop/inventory-badge'
import { toast } from 'sonner'

interface QuickViewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  stock?: number
}

const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const colorOptions = [
  { name: 'Midnight', value: '#1e293b' },
  { name: 'Ocean', value: '#0369a1' },
  { name: 'Forest', value: '#15803d' },
  { name: 'Sunset', value: '#c2410c' },
]

export function ProductQuickView({ open, onOpenChange, product, stock }: QuickViewProps) {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useShopStore()
  const { goProduct } = useShopRouter()
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)

  // Reset selections when product changes
  useEffect(() => {
    setSelectedSize(null)
    setSelectedColor(null)
  }, [product?.id])

  if (!product) return null

  const wishlisted = isInWishlist(product.id)
  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0
  const stockCount = stock ?? 25

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
    })
    toast.success('Added to cart', {
      description: `${product.name} has been added to your cart.`,
    })
    onOpenChange(false)
  }

  const handleWishlist = () => {
    if (wishlisted) {
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

  const handleViewFull = () => {
    onOpenChange(false)
    goProduct(product.id)
  }

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="mx-auto max-w-lg bg-background">
          <DrawerHeader className="pb-1">
            <DrawerTitle className="sr-only">Quick View</DrawerTitle>
            <DrawerDescription className="sr-only">Product quick preview</DrawerDescription>
          </DrawerHeader>

          <motion.div
            className="px-4 pb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Product Image + Info Row */}
            <div className="flex gap-3 mb-4">
              <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-4xl opacity-30"></span>
                  </div>
                )}
                {discount > 0 && (
                  <Badge className="absolute left-1.5 top-1.5 h-5 bg-destructive/90 px-1.5 text-[10px] font-bold text-white">
                    -{discount}%
                  </Badge>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between min-w-0">
                <div>
                  <h3 className="text-sm font-bold text-foreground line-clamp-2">
                    {product.name}
                  </h3>
                  {product.category && (
                    <p className="text-[10px] text-muted-foreground">{product.category.name}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    {product.comparePrice && (
                      <span className="text-xs text-muted-foreground line-through">
                        {formatPrice(product.comparePrice)}
                      </span>
                    )}
                  </div>
                  <InventoryBadge stock={stockCount} className="mt-1" />
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="mb-3 flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3.5 w-3.5 ${
                      star <= 4 ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">4.0 (128 reviews)</span>
            </div>

            {/* Size Selector */}
            <div className="mb-3">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">Size</span>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="flex items-center gap-1 text-[10px] text-primary hover:underline"
                >
                  <Ruler className="h-3 w-3" />
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sizeOptions.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`flex h-8 min-w-[2.5rem] items-center justify-center rounded-lg border px-2 text-xs font-medium transition-all ${
                      selectedSize === size
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border/50 text-foreground hover:border-primary/30'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selector */}
            <div className="mb-3">
              <span className="mb-1.5 block text-xs font-medium text-foreground">Color</span>
              <div className="flex gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 transition-all ${
                      selectedColor === color.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border/50 hover:border-primary/20'
                    }`}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: color.value }}
                    />
                    <span className="text-[10px] font-medium text-foreground">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <Separator className="my-3" />

            {/* Trust Badges */}
            <div className="mb-4 flex items-center gap-3">
              {[
                { icon: Shield, label: 'Secure' },
                { icon: Truck, label: 'Fast Ship' },
                { icon: RotateCcw, label: '30-Day' },
              ].map((badge) => {
                const Icon = badge.icon
                return (
                  <div key={badge.label} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Icon className="h-3 w-3 text-primary" />
                    {badge.label}
                  </div>
                )
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={handleAddToCart}
                className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-11 shadow-lg shadow-primary/20"
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleWishlist}
                className="h-11 w-11 flex-shrink-0"
              >
                <Heart className={`h-4 w-4 ${wishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>

            {/* View Full Details */}
            <Button
              variant="ghost"
              className="mt-2 w-full gap-1.5 text-xs text-primary"
              onClick={handleViewFull}
            >
              View Full Details
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </motion.div>
        </DrawerContent>
      </Drawer>
    </>
  )
}

