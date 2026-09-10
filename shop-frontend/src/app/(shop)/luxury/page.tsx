'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Crown, Diamond, Star, Shield, ShoppingCart, Zap, Gift, Sparkles, TrendingUp, Award, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useShopStore, type Product } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'

const VIP_BENEFITS = [
  { icon: Sparkles, title: 'Priority Support', desc: '24/7 dedicated assistance' },
  { icon: Shield, title: 'Extended Warranty', desc: '90-day guarantee on all services' },
  { icon: Gift, title: 'Bonus Rewards', desc: '3x points on premium purchases' },
  { icon: TrendingUp, title: 'Early Access', desc: 'First access to new services' },
  { icon: Award, title: 'VIP Badge', desc: 'Exclusive member badge' },
  { icon: Crown, title: 'Premium Queue', desc: 'Priority project delivery' },
]

export default function LuxuryPage() {
  const { goBack, goCategory, goProduct } = useShopRouter()
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useShopStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLuxury = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/products?limit=50&sort=price-desc')
        if (res.ok) {
          const data = await res.json()
          const all = Array.isArray(data) ? data : data.data || []
          setProducts(all)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchLuxury()
  }, [])

  return (
    <motion.div
      className="pb-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-amber-500/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={goBack}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-400" />
              Premium Zone
            </h1>
            <p className="text-[11px] text-muted-foreground">Exclusive premium tier services</p>
          </div>
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
            <Diamond className="mr-1 h-3 w-3" />
            VIP
          </Badge>
        </div>
      </div>

      {/* Premium Hero Banner */}
      <div className="mx-4 mt-3 overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-amber-900/5 p-4">
        {/* Shimmer overlay */}
        <div className="absolute inset-0 animate-shimmer opacity-20 rounded-2xl" />

        <div className="relative flex items-center gap-3 mb-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/30">
            <Diamond className="h-7 w-7 text-amber-400" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">VIP Collection</p>
            <p className="text-xs text-muted-foreground">Our finest, most premium services</p>
          </div>
        </div>

        <div className="relative grid grid-cols-3 gap-2">
          {VIP_BENEFITS.slice(0, 3).map((benefit) => {
            const Icon = benefit.icon
            return (
              <div key={benefit.title} className="rounded-xl bg-background/50 p-2.5 text-center border border-amber-500/10">
                <Icon className="mx-auto h-4 w-4 text-amber-400 mb-1" />
                <p className="text-[10px] font-medium text-foreground">{benefit.title}</p>
                <p className="text-[8px] text-muted-foreground">{benefit.desc}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* VIP Benefits Row */}
      <div className="mt-3 flex gap-2 overflow-x-auto px-4 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {VIP_BENEFITS.map((benefit) => {
          const Icon = benefit.icon
          return (
            <div
              key={benefit.title}
              className="flex flex-shrink-0 items-center gap-2 rounded-xl border border-amber-500/10 bg-amber-500/5 px-3 py-2"
            >
              <Icon className="h-4 w-4 text-amber-400" />
              <div>
                <p className="text-[10px] font-medium text-foreground">{benefit.title}</p>
                <p className="text-[8px] text-muted-foreground">{benefit.desc}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Products */}
      <div className="px-4 mt-3">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Crown className="h-4 w-4 text-amber-400" />
            Premium Services
          </h2>
          <span className="text-[11px] text-muted-foreground">{products.length} services</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
              <Crown className="h-8 w-8 text-amber-400" />
            </div>
            <p className="text-sm font-medium text-foreground">No premium products yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Check back soon for exclusive services</p>
            <Button onClick={() => goCategory()} variant="outline" className="mt-4 gap-2">
              Browse All Services
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product, index) => {
              const discount = product.comparePrice
                ? Math.round((1 - product.price / product.comparePrice) * 100)
                : 0
              const wishlisted = isInWishlist(product.id)
              const isPremium = product.price >= 3000
              const isFeatured = product.isFeatured

              return (
                <motion.div
                  key={product.id}
                  className={`group relative overflow-hidden rounded-2xl border ${
                    isPremium
                      ? 'border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent'
                      : 'border-border/50 bg-card'
                  }`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  {/* Badges */}
                  {isPremium && (
                    <div className="absolute right-3 top-3 z-10">
                      <Badge className="bg-amber-500/90 text-white shadow-md">
                        <Diamond className="mr-1 h-3 w-3" />
                        PREMIUM
                      </Badge>
                    </div>
                  )}
                  {isFeatured && !isPremium && (
                    <div className="absolute right-3 top-3 z-10">
                      <Badge className="bg-primary/90 text-primary-foreground shadow-md">
                        <Zap className="mr-1 h-3 w-3" />
                        Featured
                      </Badge>
                    </div>
                  )}

                  {/* Shimmer for premium */}
                  {isPremium && <div className="absolute inset-0 animate-shimmer opacity-20" />}

                  <div className="relative flex gap-3 p-3">
                    {/* Image */}
                    <button
                      className={`flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl ${
                        isPremium
                          ? 'bg-gradient-to-br from-amber-500/15 to-amber-500/5'
                          : 'bg-gradient-to-br from-primary/20 to-primary/5'
                      }`}
                      onClick={() => goProduct(product.id)}
                    >
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <span className="text-3xl opacity-30">{isPremium ? '' : ''}</span>
                      )}
                    </button>

                    {/* Info */}
                    <div className="flex flex-1 flex-col justify-between py-0.5">
                      <div>
                        <div onClick={() => goProduct(product.id)} className="text-left cursor-pointer">
                          <h3 className={`text-sm font-bold line-clamp-1 ${
                            isPremium ? 'text-foreground group-hover:text-amber-400' : 'text-foreground group-hover:text-primary'
                          } transition-colors`}>
                            {product.name}
                          </h3>
                        </div>
                        <p className="mt-0.5 text-[10px] text-muted-foreground line-clamp-1">
                          {product.description}
                        </p>
                        <div className="mt-1 flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-2.5 w-2.5 ${
                                s <= Math.round(product.rating || 4)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'fill-muted text-muted'
                              }`}
                            />
                          ))}
                          <span className="ml-1 text-[9px] text-muted-foreground">
                            ({product.rating || '4.0'})
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-1">
                          <span className={`text-base font-bold ${isPremium ? 'text-amber-400' : 'text-primary'}`}>
                            {formatPrice(product.price)}
                          </span>
                          {product.comparePrice && product.comparePrice > product.price && (
                            <span className="text-[10px] text-muted-foreground line-through">
                              {formatPrice(product.comparePrice)}
                            </span>
                          )}
                          {discount > 0 && (
                            <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[9px] px-1 py-0">
                              -{discount}%
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isPremium && (
                            <div className="flex items-center gap-0.5 text-[9px] text-amber-400">
                              <Shield className="h-2.5 w-2.5" />
                              VIP
                            </div>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => {
                              if (wishlisted) {
                                removeFromWishlist(product.id)
                              } else {
                                addToWishlist({
                                  productId: product.id,
                                  name: product.name,
                                  price: product.price,
                                  comparePrice: product.comparePrice,
                                  imageUrl: product.imageUrl,
                                })
                              }
                            }}
                          >
                            <Star className={`h-3.5 w-3.5 ${wishlisted ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} />
                          </Button>
                          <Button
                            size="sm"
                            className={`h-7 gap-1 px-2.5 text-[11px] ${
                              isPremium
                                ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white'
                                : 'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground'
                            }`}
                            onClick={() => {
                              addToCart({
                                productId: product.id,
                                name: product.name,
                                price: product.price,
                                quantity: 1,
                                imageUrl: product.imageUrl,
                              })
                            }}
                          >
                            <ShoppingCart className="h-3 w-3" />
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      <Separator className="my-6" />

      {/* Premium Club CTA */}
      <div className="mx-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-amber-900/5 border border-amber-500/20 p-5 text-center relative overflow-hidden">
        <div className="absolute inset-0 animate-shimmer opacity-15" />
        <Crown className="mx-auto h-8 w-8 text-amber-400 mb-2 relative" />
        <p className="text-base font-bold text-foreground mb-1 relative">Join the Premium Club</p>
        <p className="text-xs text-muted-foreground mb-4 relative">Earn triple points and get exclusive access to premium services with priority delivery</p>
        <div className="flex gap-2 justify-center relative">
          <Button onClick={() => goCategory()} className="bg-amber-500 text-white hover:bg-amber-600 gap-2">
            <Crown className="h-4 w-4" />
            Explore All Services
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
