'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useShopRouter } from '@/hooks/use-shop-router'
import { RatingStars } from '@/components/shop/rating-stars'
import {
  ArrowRight, Star, Shield, Package, TrendingUp, Clock, MapPin,
  MessageSquare, Phone, Mail, ShoppingBag, BadgeCheck, Award, Store, Users,
} from 'lucide-react'

interface SellerProduct {
  id: string; name: string; price: number; comparePrice: number | null
  imageUrl: string | null; rating: number; reviewCount: number; category: string; discount?: number
}

interface SellerReview { id: string; author: string; rating: number; comment: string; date: string }

interface SellerData {
  id: string; slug: string; name: string; logo: string | null; coverImage: string | null
  description: string; rating: number; reviewCount: number; totalProducts: number
  totalSales: number; responseTime: string; isVerified: boolean; joinedDate: string
  location: string; specialties: string[]; products: SellerProduct[]; reviews: SellerReview[]
}

function SellerProfileInner() {
  const { goBack, goProduct } = useShopRouter()
  const searchParams = useSearchParams()
  const slug = searchParams.get('slug') || 'tech-gadgets-bd'

  const [seller, setSeller] = useState<SellerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'products' | 'reviews' | 'about'>('products')

  const fetchSeller = useCallback(async () => {
    try {
      const res = await fetch(`/api/seller-profile?slug=${slug}`)
      const data = await res.json()
      if (data.seller) {
        setSeller({
          id: data.seller.id || data.seller.slug,
          slug: data.seller.slug,
          name: data.seller.name,
          logo: data.seller.avatar || null,
          coverImage: data.seller.coverImage || null,
          description: data.seller.bio || '',
          rating: data.stats?.rating || 4.2,
          reviewCount: data.stats?.reviewCount || 0,
          totalProducts: data.stats?.productCount || 0,
          totalSales: data.stats?.totalSales || 0,
          responseTime: '< 2 hours',
          isVerified: (data.stats?.totalSales || 0) > 100,
          joinedDate: data.seller.joinedAt || '2024-01-01',
          location: 'Dhaka, Bangladesh',
          specialties: ['Digital Services', 'E-Commerce'],
          products: (data.products || []).map((p: Record<string, unknown>) => ({
            id: p.id as string, name: p.name as string, price: p.price as number,
            comparePrice: (p.comparePrice as number) || (p.discount as number) ? Math.round((p.price as number) * 1.2) : null,
            imageUrl: (p.imageUrl as string) || null, rating: (p.rating as number) || 4.0,
            reviewCount: (p.reviewCount as number) || 0, category: (p.category as string) || '',
          })),
          reviews: (data.reviews || []).map((r: Record<string, unknown>) => ({
            id: r.id as string, author: (r.author as string) || 'Anonymous', rating: (r.rating as number) || 4,
            comment: (r.comment as string) || '', date: (r.date as string) || new Date().toISOString(),
          })),
        })
      }
    } catch { /* fallback handled by null state */ } finally { setLoading(false) }
  }, [slug])

  useEffect(() => { fetchSeller() }, [fetchSeller])

  if (loading) {
    return (
      <div className="min-h-screen bg-background"><div className="animate-pulse"><div className="h-40 bg-muted" /><div className="px-4 -mt-8"><div className="h-16 w-16 bg-muted rounded-xl" /><div className="h-6 bg-muted rounded-lg w-48 mt-3" /></div></div></div>
    )
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center"><Store className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm font-medium text-foreground">Seller not found</p><p className="text-xs text-muted-foreground mt-1">The seller profile you&apos;re looking for doesn&apos;t exist</p><button onClick={goBack} className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Go Back</button></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Cover + Header */}
      <div className="relative">
        <div className="h-36 bg-gradient-to-br from-violet-600/30 via-purple-500/20 to-fuchsia-500/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(139,92,246,0.2),transparent_70%)]" />
          <div className="absolute top-3 left-3"><button onClick={goBack} className="p-1.5 rounded-lg bg-background/60 backdrop-blur-sm hover:bg-background/80 active:scale-95 transition"><ArrowRight className="w-5 h-5 rotate-180" /></button></div>
        </div>
        <div className="px-4 -mt-10 relative z-10">
          <div className="flex items-end gap-3">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg border-4 border-background">
              <Store className="w-7 h-7 text-white" />
            </motion.div>
            <div className="pb-1 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-foreground truncate">{seller.name}</h1>
                {seller.isVerified && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.3 }}><BadgeCheck className="w-5 h-5 text-sky-400 flex-shrink-0" /></motion.div>}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <RatingStars rating={seller.rating} size="sm" showValue />
                <span className="text-xs text-muted-foreground">({seller.reviewCount} reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mx-4 mt-4 grid grid-cols-3 gap-2">
        {[
          { icon: Package, label: 'Products', value: seller.totalProducts, color: 'text-violet-400' },
          { icon: TrendingUp, label: 'Sales', value: seller.totalSales, color: 'text-emerald-400' },
          { icon: Clock, label: 'Response', value: seller.responseTime, color: 'text-sky-400' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-3 text-center">
            <stat.icon className={`w-4 h-4 ${stat.color} mx-auto mb-1`} />
            <p className="text-sm font-bold text-foreground">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Badges */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mx-4 mt-3 flex flex-wrap gap-2">
        {seller.isVerified && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-xs text-sky-400 font-medium"><Shield className="w-3 h-3" />Verified Seller</span>}
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted/50 text-xs text-muted-foreground"><MapPin className="w-3 h-3" />{seller.location}</span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted/50 text-xs text-muted-foreground"><Award className="w-3 h-3" />Since {new Date(seller.joinedDate).getFullYear()}</span>
      </motion.div>

      {/* Specialties */}
      <div className="mx-4 mt-3 flex gap-2 flex-wrap">
        {seller.specialties.map((spec) => <span key={spec} className="px-2.5 py-1 rounded-full bg-violet-500/10 text-xs text-violet-400 font-medium">{spec}</span>)}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mx-4 mt-4 p-1 bg-muted/50 rounded-xl">
        {([['products', 'Products', Package], ['reviews', 'Reviews', Star], ['about', 'About', Users]] as const).map(([key, label, Icon]) => (
          <button key={key} onClick={() => setActiveTab(key)} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === key ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}>
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'products' && (
          <motion.div key="products" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-4 mt-4">
            {seller.products.length === 0 ? (
              <div className="text-center py-12"><Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">No products yet</p></div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {seller.products.map((product, idx) => (
                  <motion.div key={product.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.04 }} onClick={() => goProduct(product.id)} className="rounded-xl border border-border bg-card p-3 cursor-pointer hover:border-violet-500/20 transition active:scale-[0.98]">
                    <div className="w-full aspect-square rounded-lg bg-muted/50 flex items-center justify-center mb-2 overflow-hidden">
                      {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" /> : <ShoppingBag className="w-8 h-8 text-muted-foreground/30" />}
                    </div>
                    <p className="text-xs font-medium text-foreground line-clamp-2">{product.name}</p>
                    <div className="flex items-center gap-1 mt-1"><RatingStars rating={product.rating} size="sm" /><span className="text-[10px] text-muted-foreground">({product.reviewCount})</span></div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm font-bold text-foreground">{product.price.toLocaleString()}</p>
                      {product.comparePrice && <p className="text-[10px] text-muted-foreground line-through">{product.comparePrice.toLocaleString()}</p>}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'reviews' && (
          <motion.div key="reviews" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-4 mt-4 space-y-3">
            <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
              <div className="text-center"><p className="text-3xl font-bold text-foreground">{seller.rating}</p><RatingStars rating={seller.rating} size="md" /><p className="text-xs text-muted-foreground mt-1">{seller.reviewCount} reviews</p></div>
              <div className="flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const pct = stars === 5 ? 60 : stars === 4 ? 25 : stars === 3 ? 10 : stars === 2 ? 3 : 2
                  return (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground w-3">{stars}</span><Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                      <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.2, duration: 0.5 }} className="h-full bg-amber-400 rounded-full" /></div>
                      <span className="text-[10px] text-muted-foreground w-6">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
            {seller.reviews.map((review, idx) => (
              <motion.div key={review.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center"><span className="text-xs font-bold text-violet-400">{review.author.charAt(0)}</span></div><div><p className="text-sm font-medium text-foreground">{review.author}</p><p className="text-[10px] text-muted-foreground">{review.date}</p></div></div>
                  <RatingStars rating={review.rating} size="sm" />
                </div>
                <p className="text-xs text-muted-foreground">{review.comment}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'about' && (
          <motion.div key="about" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-4 mt-4 space-y-4">
            <div className="rounded-xl border border-border bg-card p-4"><h3 className="text-sm font-semibold text-foreground mb-2">About</h3><p className="text-sm text-muted-foreground leading-relaxed">{seller.description}</p></div>
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Contact Seller</h3>
              <button className="w-full py-2.5 rounded-lg bg-violet-500 text-white text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.98] transition"><MessageSquare className="w-4 h-4" />Send Message</button>
              <div className="flex gap-2">
                <button className="flex-1 py-2 rounded-lg border border-border text-sm text-foreground flex items-center justify-center gap-1.5 hover:bg-muted/50 transition"><Mail className="w-3.5 h-3.5" />Email</button>
                <button className="flex-1 py-2 rounded-lg border border-border text-sm text-foreground flex items-center justify-center gap-1.5 hover:bg-muted/50 transition"><Phone className="w-3.5 h-3.5" />Call</button>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              {[
                { icon: MapPin, label: 'Location', value: seller.location },
                { icon: Clock, label: 'Response Time', value: seller.responseTime },
                { icon: Package, label: 'Total Products', value: String(seller.totalProducts) },
                { icon: TrendingUp, label: 'Total Sales', value: String(seller.totalSales) },
                { icon: Award, label: 'Member Since', value: new Date(seller.joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) },
              ].map((info) => (
                <div key={info.label} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2"><info.icon className="w-4 h-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">{info.label}</span></div>
                  <span className="text-sm font-medium text-foreground">{info.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function SellerProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background"><div className="animate-pulse"><div className="h-40 bg-muted" /><div className="px-4 -mt-8"><div className="h-16 w-16 bg-muted rounded-xl" /><div className="h-6 bg-muted rounded-lg w-48 mt-3" /></div></div></div>
    }>
      <SellerProfileInner />
    </Suspense>
  )
}

