'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ShoppingCart,
  Clock,
  Check,
  Zap,
  Heart,
  Share2,
  Shield,
  Truck,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import { toast } from 'sonner'

const trustBadges = [
  { icon: Shield, label: 'Secure Payment' },
  { icon: Truck, label: 'Fast Delivery' },
  { icon: RotateCcw, label: '30-Day Refund' },
]

export function ProductDetail() {
  const { selectedProduct, addToCart, addToWishlist, removeFromWishlist, isInWishlist, addToRecentlyViewed } = useShopStore()
  const { goCheckout, goBack } = useShopRouter()

  // Track recently viewed must be called before any conditional returns
  useEffect(() => {
    if (selectedProduct) {
      addToRecentlyViewed(selectedProduct)
    }
  }, [selectedProduct?.id])

  if (!selectedProduct) return null

  const product = selectedProduct
  const features: string[] = product.features ? JSON.parse(product.features) : []
  const techStack: string[] = product.techStack ? JSON.parse(product.techStack) : []
  const wishlisted = isInWishlist(product.id)

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
  }

  const handleBuyNow = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
    })
    goCheckout()
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    }
  }

  return (
    <motion.div
      className="pb-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => goBack()}
          className="gap-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => {
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
            }}
          >
            <Heart className={`h-4 w-4 ${wishlisted ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Product Image */}
      <div className="mx-4 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-56 w-full object-cover sm:h-72"
          />
        ) : (
          <div className="flex h-56 items-center justify-center sm:h-72">
            <div className="text-center">
              <div className="text-6xl opacity-30"></div>
              <p className="mt-2 text-sm text-muted-foreground">{product.category?.name || 'Product'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Image Dots (decorative) */}
      <div className="mt-3 flex items-center justify-center gap-1.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${i === 1 ? 'w-4 bg-primary' : 'w-1.5 bg-muted-foreground/30'}`}
          />
        ))}
      </div>

      {/* Product Info */}
      <div className="px-4 pt-4">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h1 className="text-xl font-bold text-foreground leading-tight">{product.name}</h1>
          {product.isFeatured && (
            <Badge className="flex-shrink-0 bg-amber-500/10 text-amber-500 border-amber-500/20">
              <Zap className="mr-1 h-3 w-3" />
              Featured
            </Badge>
          )}
        </div>

        {product.category && (
          <p className="mb-3 text-xs text-muted-foreground">
            {product.category.name}
          </p>
        )}

        {/* Price Block */}
        <div className="mb-4 rounded-xl bg-gradient-to-r from-primary/10 to-transparent p-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && (
              <>
                <span className="text-base text-muted-foreground line-through">
                  {formatPrice(product.comparePrice)}
                </span>
                <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                  Save {formatPrice(product.comparePrice - product.price)}
                </Badge>
              </>
            )}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mb-4 flex items-center justify-between gap-2">
          {trustBadges.map((badge) => {
            const Icon = badge.icon
            return (
              <div
                key={badge.label}
                className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-muted/30 p-2"
              >
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-[9px] text-muted-foreground text-center">{badge.label}</span>
              </div>
            )
          })}
        </div>

        {/* Delivery Time */}
        {product.deliveryTime && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-muted/30 p-3">
            <Clock className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-sm text-muted-foreground">
              Delivery: <span className="font-medium text-foreground">{product.deliveryTime}</span>
            </span>
          </div>
        )}

        {/* Description */}
        <div className="mb-4">
          <h3 className="mb-2 text-sm font-semibold text-foreground">Description</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        </div>

        <Separator className="my-4" />

        {/* Features */}
        {features.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-semibold text-foreground">What&apos;s Included</h3>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tech Stack */}
        {techStack.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-semibold text-foreground">Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <Badge
                  key={tech}
                  variant="secondary"
                  className="bg-secondary/50 text-secondary-foreground"
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Sticky Action Buttons */}
        <div className="flex gap-3 pb-2">
          <Button
            onClick={handleAddToCart}
            variant="outline"
            className="flex-1 gap-2 border-primary/30 text-primary hover:bg-primary/10 h-11"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
          <Button
            onClick={handleBuyNow}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-11 shadow-lg shadow-primary/20"
          >
            Buy Now
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
