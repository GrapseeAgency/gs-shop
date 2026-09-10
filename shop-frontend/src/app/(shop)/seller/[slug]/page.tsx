'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Store, MapPin, Star, ShoppingBag, Clock, Shield,
  ChevronLeft, MessageCircle, Share2, Heart,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import { toast } from 'sonner'

interface SellerProfile {
  id: string
  slug: string
  name: string
  description: string
  logo?: string
  coverImage?: string
  isVerified: boolean
  verificationBadge: string
  joinedAt: string
  stats: {
    totalProducts: number
    totalSales: number
    rating: number
    reviewCount: number
    responseTime?: string
  }
  policies: {
    return: string
    shipping: string
    freeShippingThreshold?: number
  }
  products: {
    id: string
    name: string
    slug: string
    price: number
    comparePrice?: number
    imageUrl?: string
    rating: number
    reviewCount: number
    soldCount: number
    category?: { name: string; slug: string }
    isFeatured: boolean
  }[]
  reviews: {
    id: string
    rating: number
    title?: string
    content: string
    isVerified: boolean
    createdAt: string
    user: { name: string; avatar?: string }
  }[]
  socialLinks?: {
    facebook?: string
    twitter?: string
    instagram?: string
    website?: string
  }
}

export default function SellerStorefrontPage() {
  const params = useParams()
  const { slug } = params as { slug: string }
  const router = useShopRouter()
  const [seller, setSeller] = useState<SellerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'products' | 'reviews' | 'about'>('products')
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const res = await fetch(`/api/seller/${slug}`)
        if (res.ok) {
          const data = await res.json()
          setSeller(data.seller)
        } else {
          toast.error('Seller not found')
          router.push('/seller-center')
        }
      } catch {
        toast.error('Failed to load seller profile')
      }
      setLoading(false)
    }

    if (slug) {
      fetchSeller()
    }
  }, [slug, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-32 w-32 rounded-full bg-muted" />
          <div className="h-4 w-48 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Seller not found</p>
      </div>
    )
  }

  const verificationBadgeColors: Record<string, string> = {
    verified: 'bg-blue-500/10 text-blue-500',
    premium: 'bg-purple-500/10 text-purple-500',
    top_seller: 'bg-amber-500/10 text-amber-500',
    platinum: 'bg-emerald-500/10 text-emerald-500',
  }

  return (
    <motion.div
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header Navigation */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="font-semibold text-sm">{seller.name}</span>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => toast.info('Share feature coming soon!')}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 via-primary/10 to-background overflow-hidden">
        {seller.coverImage ? (
          <img src={seller.coverImage} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      {/* Profile Info */}
      <div className="px-4 -mt-12 relative">
        <div className="flex items-end gap-4">
          {/* Logo */}
          <div className="relative">
            <div className="h-24 w-24 rounded-2xl bg-muted border-4 border-background overflow-hidden shadow-lg">
              {seller.logo ? (
                <img src={seller.logo} alt={seller.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                  <Store className="h-10 w-10 text-primary/50" />
                </div>
              )}
            </div>
            {seller.isVerified && (
              <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-background rounded-full flex items-center justify-center">
                <Shield className="h-4 w-4 text-blue-500 fill-blue-500" />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex-1 flex items-center justify-end gap-2 mb-2">
            <Button
              variant="outline"
              size="sm"
              className={isFollowing ? 'bg-primary text-primary-foreground' : ''}
              onClick={() => setIsFollowing(!isFollowing)}
            >
              <Heart className={`h-4 w-4 mr-1 ${isFollowing ? 'fill-current' : ''}`} />
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
            <Button variant="outline" size="sm">
              <MessageCircle className="h-4 w-4 mr-1" />
              Message
            </Button>
          </div>
        </div>

        {/* Store Info */}
        <div className="mt-4 space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{seller.name}</h1>
            {seller.verificationBadge !== 'none' && (
              <Badge
                variant="secondary"
                className={verificationBadgeColors[seller.verificationBadge] || 'bg-muted'}
              >
                {seller.verificationBadge.replace('_', ' ')}
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {seller.description || 'No description available'}
          </p>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-amber-500" />
              <span>{seller.stats.rating.toFixed(1)} ({seller.stats.reviewCount})</span>
            </div>
            <div className="flex items-center gap-1">
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>{seller.stats.totalSales} sales</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>Joined {new Date(seller.joinedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Policies */}
        <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide pb-1">
          <Badge variant="outline" className="shrink-0 text-xs">
            <Shield className="h-3 w-3 mr-1" />
            {seller.policies.return}
          </Badge>
          <Badge variant="outline" className="shrink-0 text-xs">
            <MapPin className="h-3 w-3 mr-1" />
            {seller.policies.shipping}
          </Badge>
          {seller.policies.freeShippingThreshold && (
            <Badge variant="outline" className="shrink-0 text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              Free shipping over {formatPrice(seller.policies.freeShippingThreshold)}
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-6">
        <div className="flex gap-4 border-b border-border">
          {(['products', 'reviews', 'about'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-sm font-medium capitalize transition-colors relative ${
                activeTab === tab
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 py-4">
        {activeTab === 'products' && (
          <div className="space-y-4">
            {seller.products.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No products available</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {seller.products.map((product) => (
                  <motion.div
                    key={product.id}
                    className="group cursor-pointer"
                    onClick={() => router.pushProduct(product.slug)}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="aspect-square rounded-xl bg-muted overflow-hidden relative">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                      )}
                      {product.isFeatured && (
                        <Badge className="absolute top-2 left-2 bg-amber-500 text-white text-[10px]">
                          Featured
                        </Badge>
                      )}
                      {product.comparePrice && (
                        <Badge className="absolute top-2 right-2 bg-red-500 text-white text-[10px]">
                          Sale
                        </Badge>
                      )}
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs font-medium line-clamp-2">{product.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{formatPrice(product.price)}</span>
                        {product.comparePrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatPrice(product.comparePrice)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <div className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span>{product.rating.toFixed(1)}</span>
                        </div>
                        <span></span>
                        <span>{product.soldCount} sold</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {seller.reviews.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No reviews yet</p>
            ) : (
              <div className="space-y-3">
                {seller.reviews.map((review) => (
                  <div key={review.id} className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                          {review.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{review.user.name}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < review.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.title && (
                      <p className="text-sm font-medium">{review.title}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{review.content}</p>
                    {review.isVerified && (
                      <Badge variant="outline" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified Purchase
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium mb-2">About {seller.name}</h3>
              <p className="text-muted-foreground">
                {seller.description || 'No description available.'}
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Policies</h3>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Returns:</strong> {seller.policies.return}</p>
                <p><strong>Shipping:</strong> {seller.policies.shipping}</p>
                {seller.policies.freeShippingThreshold && (
                  <p>
                    <strong>Free Shipping:</strong> On orders over {formatPrice(seller.policies.freeShippingThreshold)}
                  </p>
                )}
              </div>
            </div>

            {seller.socialLinks && Object.keys(seller.socialLinks).length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Connect</h3>
                <div className="flex gap-2">
                  {seller.socialLinks.website && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={seller.socialLinks.website} target="_blank" rel="noopener noreferrer">
                        Website
                      </a>
                    </Button>
                  )}
                  {seller.socialLinks.facebook && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={seller.socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                        Facebook
                      </a>
                    </Button>
                  )}
                  {seller.socialLinks.instagram && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={seller.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                        Instagram
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Member since {new Date(seller.joinedAt).toLocaleDateString()}</span>
                <span>{seller.stats.totalSales} sales</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
