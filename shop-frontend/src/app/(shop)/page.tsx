'use client'

import { useEffect, useState } from 'react'
import { useShopStore, useHydration, type Category, type Product } from '@/lib/store'
import { Hero } from '@/components/shop/hero'
import { CategoryGrid } from '@/components/shop/category-grid'
import { FlashDeals } from '@/components/shop/flash-deals'
import { PersonalizedRecommendations } from '@/components/shop/personalized-recommendations'
import { TrendingProducts } from '@/components/shop/trending-products'
import { NewArrivals } from '@/components/shop/new-arrivals'
import { DailyPicks } from '@/components/shop/daily-picks'
import { LuxuryZone } from '@/components/shop/luxury-zone'
import { PromoBanner } from '@/components/shop/promo-banner'
import { StatsSection } from '@/components/shop/stats-section'
import { TestimonialsSection } from '@/components/shop/testimonials-section'
import { BrandCarousel } from '@/components/shop/brand-carousel'
import { RewardsProgram } from '@/components/shop/rewards-program'
import { NewsletterSection } from '@/components/shop/newsletter-section'
import { FAQSection } from '@/components/shop/faq-section'
import { RecentlyViewed } from '@/components/shop/recently-viewed'
import { ProductList } from '@/components/shop/product-list'
import { MallFooter } from '@/components/shop/mall-footer'
import { MallDirectory } from '@/components/shop/mall-directory'
import { TrendingSearches } from '@/components/shop/trending-searches'
import { EventBanner, useEvents } from '@/components/events/event-banner'
import { CollectionsPreview } from '@/components/shop/collections-preview'
import { BlogPreview } from '@/components/shop/blog-preview'
import { DynamicPlacement } from '@/components/shop/dynamic-placement'
import { HelpQuickLinks } from '@/components/shop/help-quick-links'
import { FlashSalePage } from '@/components/shop/flash-sale-page'
import { BackToTop } from '@/components/shop/back-to-top'
import { Separator } from '@/components/ui/separator'
import { useShopRouter } from '@/hooks/use-shop-router'
import { ChevronRight, Zap, Tag, Crown, Users, Circle, Star, Package, Palette, DollarSign, Map, HandHelping, TrendingDown, CreditCard, Smartphone, Home, Gift, HardDrive, BookOpen, Disc, GraduationCap, Shirt, Clapperboard, Gift as GiftIcon, Shield, Heart, CheckCircle, Trophy, Store, Megaphone, Truck, Moon, Calculator, Puzzle, Sparkles, ArrowRight } from 'lucide-react'

// Events Section Component - Fetches and displays events from API
function EventsSection() {
  const { events, loading } = useEvents(['MEGA_SALE', 'FLASH_SALE', 'AUCTION'], 3)

  if (loading) {
    return (
      <section className="px-4 py-4">
        <div className="h-[280px] rounded-2xl bg-muted animate-pulse" />
      </section>
    )
  }

  if (events.length === 0) {
    return null // No active events, don't render anything
  }

  return (
    <>
      {events.map((event) => (
        <EventBanner key={event.id} event={event} variant="full" />
      ))}
    </>
  )
}

export default function HomePage() {
  const hydrated = useHydration()
  const { goCategory, goVoucher, goVip, goLive, goReviews, goFlashSale, goBundles, goCommunity, goAffiliate, goStyleGuide, goSitemap, goGroupBuy, goInstallment, goTradeIn, goOutfitMaker, goDigitalDownloads, goSellerCenter, goProductVideos, goProductQuiz, goLoyaltyCalculator, goShippingCalculator, goTryBeforeBuy, goPriceDrop, goGiftWrapping, goRental, goStudentDiscount, goReviewMegaphone, goMysteryReward, goDarkStore, goCodeQuality, goOpenSource, goDeliveryProtection, goTechLibrary } = useShopRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, featRes, prodRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products?featured=true'),
          fetch('/api/products'),
        ])

        if (catRes.ok) {
          setCategories(await catRes.json())
        } else {
          console.error('Failed to fetch categories:', catRes.status, catRes.statusText)
        }

        if (featRes.ok) {
          const featData = await featRes.json()
          setFeaturedProducts(Array.isArray(featData) ? featData : featData.data || [])
        } else {
          console.error('Failed to fetch featured products:', featRes.status, featRes.statusText)
        }

        if (prodRes.ok) {
          const prodData = await prodRes.json()
          setAllProducts(Array.isArray(prodData) ? prodData : prodData.data || [])
        } else {
          console.error('Failed to fetch products:', prodRes.status, prodRes.statusText)
        }
      } catch (error) {
        console.error('Error fetching homepage data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Prevent hydration mismatch
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-xs text-muted-foreground">Loading Grapsee Mall...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* 1. Hero Carousel */}
      <Hero />

      {/* 2. Category Quick Access */}
      <CategoryGrid categories={categories} loading={loading} />

      <Separator className="mx-4" />

      {/* 3. Trending Searches */}
      <TrendingSearches />

      <Separator className="mx-4" />

      {/* 4. Flash Deals with Countdown */}
      <FlashDeals />

      <Separator className="mx-4" />

      {/* 5. Personalized Recommendations (NEW) */}
      <PersonalizedRecommendations />

      <Separator className="mx-4" />

      {/* 6. Mega Sale / Events Banner */}
      <EventsSection />

      <Separator className="mx-4" />

      {/* 7. Mall Directory - Shop by Floor (NEW) */}
      <MallDirectory />

      <Separator className="mx-4" />

      {/* 8. Trending Products (Horizontal Scroll) */}
      <TrendingProducts />

      <Separator className="mx-4" />

      {/* 9. New Arrivals */}
      <NewArrivals />

      <Separator className="mx-4" />

      {/* 10. Promo Banners */}
      <PromoBanner />

      <Separator className="mx-4" />

      {/* 11. Daily Picks (2x2 Grid) */}
      <DailyPicks />

      <Separator className="mx-4" />

      {/* 12. Luxury Zone */}
      <LuxuryZone />

      <Separator className="mx-4" />

      <Separator className="mx-4" />

      {/* Curated Collections */}
      <CollectionsPreview />
      <Separator className="mx-4 opacity-30" />

      {/* Voucher & VIP Banner */}
      <section className="px-4 py-3.5 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-2 gap-3 max-w-3xl mx-auto">
          <button onClick={() => goVoucher()} className="group relative overflow-hidden rounded-2xl border border-orange-500/20 bg-card/65 backdrop-blur-md p-4 text-left transition-all duration-300 hover:border-orange-500/40 hover:shadow-md hover:shadow-orange-500/5 active:scale-[0.98]">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 -z-10" />
            <div className="absolute inset-0 liquid-aurora opacity-5 -z-10" />
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 border border-orange-500/20 overflow-hidden shadow-sm">
              <Tag className="h-4.5 w-4.5 text-orange-500 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-sm font-bold text-foreground mt-2.5">Voucher Center</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Save more with coupons</p>
          </button>
          <button onClick={() => goVip()} className="group relative overflow-hidden rounded-2xl border border-amber-500/20 bg-card/65 backdrop-blur-md p-4 text-left transition-all duration-300 hover:border-amber-500/40 hover:shadow-md hover:shadow-amber-500/5 active:scale-[0.98]">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-amber-500/5 -z-10" />
            <div className="absolute inset-0 liquid-aurora opacity-5 -z-10" />
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 overflow-hidden shadow-sm">
              <Crown className="h-4.5 w-4.5 text-amber-500 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-sm font-bold text-foreground mt-2.5">VIP Club</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Exclusive perks & rewards</p>
          </button>
        </div>
      </section>
      <Separator className="mx-4 opacity-30" />

      {/* 13. Featured Products Grid */}
      {featuredProducts.length > 0 && (
        <section className="px-4 py-4 relative z-10">
          <div className="mb-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 overflow-hidden shadow-sm">
                <div className="absolute inset-0 liquid-aurora opacity-40 animate-aurora" />
                <Sparkles className="relative z-10 h-4 w-4 text-primary animate-swell" />
              </div>
              <h2 className="text-base font-extrabold text-gradient-green">Featured Products</h2>
            </div>
            <button
              onClick={() => goCategory()}
              className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
            >
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <ProductList
            products={featuredProducts}
            loading={loading}
            emptyMessage="No featured products yet"
          />
        </section>
      )}

      <Separator className="mx-4 opacity-30" />

      {/* 14. Recently Viewed */}
      <RecentlyViewed />

      <Separator className="mx-4 opacity-30" />

      {/* 15. Stats Section - Social Proof */}
      <StatsSection />

      <Separator className="mx-4 opacity-30" />

      {/* 16. All Products Grid */}
      <section className="px-4 py-4 relative z-10">
        <div className="mb-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 overflow-hidden shadow-sm">
              <div className="absolute inset-0 liquid-aurora opacity-40 animate-aurora" />
              <Package className="relative z-10 h-4 w-4 text-primary animate-swell" />
            </div>
            <h2 className="text-base font-extrabold text-gradient-green">All Products</h2>
          </div>
          <span className="text-xs font-bold text-primary bg-primary/5 border border-primary/10 px-2.5 py-0.5 rounded-full shadow-sm">{allProducts.length} items</span>
        </div>
        <ProductList
          products={allProducts}
          loading={loading}
          emptyMessage="No products available yet"
        />
      </section>

      <Separator className="mx-4 opacity-30" />

      {/* 17. Testimonials */}
      <TestimonialsSection />

      <Separator className="mx-4 opacity-30" />

      {/* Blog Preview */}
      <BlogPreview />
      <Separator className="mx-4 opacity-30" />

      {/* Community Preview */}
      <section className="px-4 py-4 relative z-10">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 overflow-hidden shadow-sm">
              <div className="absolute inset-0 liquid-aurora opacity-40 animate-aurora" />
              <Users className="relative z-10 h-4 w-4 text-primary animate-swell" />
            </div>
            <h2 className="text-base font-extrabold text-gradient-green">Community</h2>
          </div>
          <button onClick={() => goCommunity()} className="text-xs font-bold text-primary hover:text-primary/80 transition-colors">Join Now</button>
        </div>
        <button onClick={() => goCommunity()} className="w-full rounded-2xl border border-primary/15 bg-card/65 backdrop-blur-md p-4 text-left transition-all duration-300 hover:border-primary/35 hover:shadow-md hover:shadow-primary/5 active:scale-[0.98] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-green-500/5 -z-10" />
          <div className="absolute inset-0 liquid-aurora opacity-5 -z-10" />
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5">
              <div className="h-8.5 w-8.5 rounded-full bg-blue-500/30 border-2 border-background shadow-sm" />
              <div className="h-8.5 w-8.5 rounded-full bg-pink-500/30 border-2 border-background shadow-sm" />
              <div className="h-8.5 w-8.5 rounded-full bg-green-500/30 border-2 border-background shadow-sm" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-foreground">Share Your Style</h3>
              <p className="text-[10px] text-muted-foreground/90 mt-0.5">Join our growing community of members</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-0.5" />
          </div>
        </button>
      </section>
      <Separator className="mx-4 opacity-30" />

      {/* Live Shopping Banner */}
      <section className="px-4 py-3 relative z-10">
        <button onClick={() => goLive()} className="w-full rounded-2xl bg-gradient-to-r from-red-500/10 via-pink-500/10 to-purple-500/10 border border-red-500/20 p-4 text-left transition-all duration-300 hover:shadow-md hover:shadow-red-500/5 active:scale-[0.98] relative overflow-hidden group">
          <div className="absolute inset-0 liquid-aurora opacity-5 -z-10" />
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 relative overflow-hidden shadow-inner">
              <div className="absolute inset-0 liquid-aurora opacity-20" />
              <Circle className="relative z-10 h-5 w-5 text-red-500 fill-red-500 animate-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                Live Shopping
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
              </h3>
              <p className="text-[10px] text-muted-foreground/90 mt-0.5">Watch, chat & shop in real-time</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-0.5" />
          </div>
        </button>
      </section>
      <Separator className="mx-4 opacity-30" />

      {/* 19. FAQ / Help Center */}
      <FAQSection />

      <Separator className="mx-4 opacity-30" />

      {/* 20. Brand/Tech Carousel */}
      <BrandCarousel />

      <Separator className="mx-4 opacity-30" />

      {/* 21. Newsletter */}
      <NewsletterSection />

      <Separator className="mx-4 opacity-30" />

      {/* 22. Rewards Program */}
      <RewardsProgram />

      {/* Quick Help */}
      <HelpQuickLinks />
      <Separator className="mx-4 opacity-30" />

      {/* Review Center Preview */}
      <section className="px-4 py-4 relative z-10">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 overflow-hidden shadow-sm">
              <div className="absolute inset-0 liquid-aurora opacity-40 animate-aurora" />
              <Star className="relative z-10 h-4 w-4 text-primary animate-swell" />
            </div>
            <h2 className="text-base font-extrabold text-gradient-green">Customer Reviews</h2>
          </div>
          <button onClick={() => goReviews()} className="text-xs font-bold text-primary hover:text-primary/80 transition-colors">See All</button>
        </div>
        <button onClick={() => goReviews()} className="w-full rounded-2xl border border-primary/15 bg-card/65 backdrop-blur-md p-4 transition-all duration-300 hover:border-primary/35 hover:shadow-md hover:shadow-primary/5 active:scale-[0.98] relative overflow-hidden">
          <div className="absolute inset-0 liquid-aurora opacity-5 -z-10" />
          <div className="flex items-center gap-3.5">
            <div className="text-2xl font-black text-primary">4.8</div>
            <div>
              <div className="flex gap-0.5 text-yellow-400"><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /></div>
              <p className="text-[10px] font-semibold text-muted-foreground/80 mt-0.5">Based on verified customer reviews</p>
            </div>
          </div>
        </button>
      </section>
      <Separator className="mx-4 opacity-30" />

      {/* Quick Links Grid */}
      <section className="px-4 py-4 max-w-7xl mx-auto relative z-10">
        <h2 className="text-base font-bold text-foreground mb-3 max-w-3xl mx-auto">Quick Links</h2>
        <div className="grid grid-cols-4 gap-2.5 max-w-3xl mx-auto">
          <button onClick={() => goBundles()} className="group flex flex-col items-center gap-1 rounded-2xl border border-primary/10 bg-card/60 backdrop-blur-md p-3.5 transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 active:scale-95 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 liquid-aurora opacity-5 pointer-events-none -z-10" />
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 overflow-hidden mx-auto mb-1">
              <Package className="relative z-10 h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[10px] font-bold text-foreground">Bundles</span>
          </button>
          <button onClick={() => goStyleGuide()} className="group flex flex-col items-center gap-1 rounded-2xl border border-primary/10 bg-card/60 backdrop-blur-md p-3.5 transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 active:scale-95 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 liquid-aurora opacity-5 pointer-events-none -z-10" />
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/10 border border-pink-500/20 overflow-hidden mx-auto mb-1">
              <Palette className="relative z-10 h-4 w-4 text-pink-500 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[10px] font-bold text-foreground">Style</span>
          </button>
          <button onClick={() => goAffiliate()} className="group flex flex-col items-center gap-1 rounded-2xl border border-primary/10 bg-card/60 backdrop-blur-md p-3.5 transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 active:scale-95 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 liquid-aurora opacity-5 pointer-events-none -z-10" />
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 border border-green-500/20 overflow-hidden mx-auto mb-1">
              <DollarSign className="relative z-10 h-4 w-4 text-green-500 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[10px] font-bold text-foreground">Affiliate</span>
          </button>
          <button onClick={() => goSitemap()} className="group flex flex-col items-center gap-1 rounded-2xl border border-primary/10 bg-card/60 backdrop-blur-md p-3.5 transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 active:scale-95 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 liquid-aurora opacity-5 pointer-events-none -z-10" />
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20 overflow-hidden mx-auto mb-1">
              <Map className="relative z-10 h-4 w-4 text-purple-500 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[10px] font-bold text-foreground">Sitemap</span>
          </button>
        </div>
      </section>

      {/* Group Buy Preview */}
      <section className="px-4 py-4 max-w-7xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-3.5 max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 overflow-hidden shadow-sm">
              <div className="absolute inset-0 liquid-aurora opacity-40 animate-aurora" />
              <HandHelping className="relative z-10 h-4 w-4 text-primary animate-swell" />
            </div>
            <h2 className="text-base font-extrabold text-gradient-green">Group Buy</h2>
          </div>
          <button onClick={() => goGroupBuy()} className="text-xs font-bold text-primary hover:text-primary/80 transition-colors">Join Now</button>
        </div>
        <button onClick={() => goGroupBuy()} className="w-full max-w-3xl mx-auto block rounded-2xl border border-primary/15 bg-card/65 backdrop-blur-md p-4 text-left transition-all duration-300 hover:border-primary/35 hover:shadow-md hover:shadow-primary/5 active:scale-[0.98] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-teal-500/5 -z-10" />
          <div className="absolute inset-0 liquid-aurora opacity-5 -z-10" />
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 overflow-hidden shadow-sm">
              <HandHelping className="h-5 w-5 text-primary group-hover:scale-105 transition-transform animate-swell" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-foreground">Buy Together, Save Together</h3>
              <p className="text-[10px] text-muted-foreground/85 mt-0.5">Up to 60% off when you join a group buy</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-0.5" />
          </div>
        </button>
      </section>
      <Separator className="mx-4 opacity-30" />

      {/* Price Drop Alert */}
      <section className="px-4 py-3 max-w-7xl mx-auto relative z-10">
        <button onClick={() => goPriceDrop()} className="w-full max-w-3xl mx-auto block rounded-2xl border border-primary/15 bg-card/65 backdrop-blur-md p-4 text-left transition-all duration-300 hover:border-primary/35 hover:shadow-md hover:shadow-primary/5 active:scale-[0.98] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-rose-500/5 to-pink-500/5 -z-10" />
          <div className="absolute inset-0 liquid-aurora opacity-5 -z-10" />
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 border border-destructive/20 overflow-hidden shadow-sm">
              <TrendingDown className="h-5 w-5 text-destructive group-hover:scale-105 transition-transform" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-foreground">Price Drop Alerts</h3>
              <p className="text-[10px] text-muted-foreground/85 mt-0.5">Track price drops on your favorite items</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-0.5" />
          </div>
        </button>
      </section>
      <Separator className="mx-4 opacity-30" />

      {/* Installment & Trade-In Row */}
      <section className="px-4 py-3 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-2 gap-3 max-w-3xl mx-auto">
          <button onClick={() => goInstallment()} className="group relative overflow-hidden rounded-2xl border border-blue-500/20 bg-card/65 backdrop-blur-md p-4 text-left transition-all duration-300 hover:border-blue-500/40 hover:shadow-md hover:shadow-blue-500/5 active:scale-[0.98]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 -z-10" />
            <div className="absolute inset-0 liquid-aurora opacity-5 -z-10" />
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 overflow-hidden shadow-sm">
              <CreditCard className="h-4.5 w-4.5 text-blue-500 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-sm font-bold text-foreground mt-2.5">Installments</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">0% EMI plans</p>
          </button>
          <button onClick={() => goTradeIn()} className="group relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-card/65 backdrop-blur-md p-4 text-left transition-all duration-300 hover:border-cyan-500/40 hover:shadow-md hover:shadow-cyan-500/5 active:scale-[0.98]">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 -z-10" />
            <div className="absolute inset-0 liquid-aurora opacity-5 -z-10" />
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 overflow-hidden shadow-sm">
              <Smartphone className="h-4.5 w-4.5 text-cyan-500 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-sm font-bold text-foreground mt-2.5">Trade-In</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Up to 55% value</p>
          </button>
        </div>
      </section>
      <Separator className="mx-4 opacity-30" />

      {/* Try Before You Buy + Mystery Reward Row */}
      <section className="px-4 py-3 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-2 gap-3 max-w-3xl mx-auto">
          <button onClick={() => goTryBeforeBuy()} className="group relative overflow-hidden rounded-2xl border border-violet-500/20 bg-card/65 backdrop-blur-md p-4 text-left transition-all duration-300 hover:border-violet-500/40 hover:shadow-md hover:shadow-violet-500/5 active:scale-[0.98]">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 -z-10" />
            <div className="absolute inset-0 liquid-aurora opacity-5 -z-10" />
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/20 overflow-hidden shadow-sm">
              <Home className="h-4.5 w-4.5 text-violet-500 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-sm font-bold text-foreground mt-2.5">Try at Home</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Try before you buy</p>
          </button>
          <button onClick={() => goMysteryReward()} className="group relative overflow-hidden rounded-2xl border border-amber-500/20 bg-card/65 backdrop-blur-md p-4 text-left transition-all duration-300 hover:border-amber-500/40 hover:shadow-md hover:shadow-amber-500/5 active:scale-[0.98]">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 -z-10" />
            <div className="absolute inset-0 liquid-aurora opacity-5 -z-10" />
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 overflow-hidden shadow-sm">
              <GiftIcon className="h-4.5 w-4.5 text-amber-500 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-sm font-bold text-foreground mt-2.5">Mystery Reward</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Reveal your prize!</p>
          </button>
        </div>
      </section>
      <Separator className="mx-4 opacity-30" />

      {/* Digital Downloads */}
      <section className="px-4 py-3 max-w-7xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-3 max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 overflow-hidden shadow-sm">
              <div className="absolute inset-0 liquid-aurora opacity-40 animate-aurora" />
              <HardDrive className="relative z-10 h-4 w-4 text-primary animate-swell" />
            </div>
            <h2 className="text-base font-extrabold text-gradient-green">Digital Downloads</h2>
          </div>
          <button onClick={() => goDigitalDownloads()} className="text-xs font-bold text-primary hover:text-primary/80 transition-colors">Browse All</button>
        </div>
        <div className="grid grid-cols-4 gap-2.5 max-w-3xl mx-auto">
          <button onClick={() => goDigitalDownloads()} className="group flex flex-col items-center gap-1 rounded-2xl border border-primary/10 bg-card/60 backdrop-blur-md p-3.5 transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 active:scale-95 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 liquid-aurora opacity-5 pointer-events-none -z-10" />
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 overflow-hidden mx-auto mb-1">
              <BookOpen className="relative z-10 h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[10px] font-bold text-foreground">eBooks</span>
          </button>
          <button onClick={() => goDigitalDownloads()} className="group flex flex-col items-center gap-1 rounded-2xl border border-primary/10 bg-card/60 backdrop-blur-md p-3.5 transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 active:scale-95 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 liquid-aurora opacity-5 pointer-events-none -z-10" />
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gray-500/10 border border-gray-500/20 overflow-hidden mx-auto mb-1">
              <Disc className="relative z-10 h-4 w-4 text-gray-500 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[10px] font-bold text-foreground">Software</span>
          </button>
          <button onClick={() => goDigitalDownloads()} className="group flex flex-col items-center gap-1 rounded-2xl border border-primary/10 bg-card/60 backdrop-blur-md p-3.5 transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 active:scale-95 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 liquid-aurora opacity-5 pointer-events-none -z-10" />
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20 overflow-hidden mx-auto mb-1">
              <Palette className="relative z-10 h-4 w-4 text-purple-500 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[10px] font-bold text-foreground">Templates</span>
          </button>
          <button onClick={() => goDigitalDownloads()} className="group flex flex-col items-center gap-1 rounded-2xl border border-primary/10 bg-card/60 backdrop-blur-md p-3.5 transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 active:scale-95 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 liquid-aurora opacity-5 pointer-events-none -z-10" />
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 overflow-hidden mx-auto mb-1">
              <GraduationCap className="relative z-10 h-4 w-4 text-indigo-500 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[10px] font-bold text-foreground">Courses</span>
          </button>
        </div>
      </section>
      <Separator className="mx-4 opacity-30" />

      {/* Outfit Maker + Rental Row */}
      <section className="px-4 py-3 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-2 gap-3 max-w-3xl mx-auto">
          <button onClick={() => goOutfitMaker()} className="group relative overflow-hidden rounded-2xl border border-pink-500/20 bg-card/65 backdrop-blur-md p-4 text-left transition-all duration-300 hover:border-pink-500/40 hover:shadow-md hover:shadow-pink-500/5 active:scale-[0.98]">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-500/5 -z-10" />
            <div className="absolute inset-0 liquid-aurora opacity-5 -z-10" />
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/10 border border-pink-500/20 overflow-hidden shadow-sm">
              <Shirt className="h-4.5 w-4.5 text-pink-500 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-sm font-bold text-foreground mt-2.5">Outfit Maker</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Create your look</p>
          </button>
          <button onClick={() => goRental()} className="group relative overflow-hidden rounded-2xl border border-teal-500/20 bg-card/65 backdrop-blur-md p-4 text-left transition-all duration-300 hover:border-teal-500/40 hover:shadow-md hover:shadow-teal-500/5 active:scale-[0.98]">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 -z-10" />
            <div className="absolute inset-0 liquid-aurora opacity-5 -z-10" />
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 border border-teal-500/20 overflow-hidden shadow-sm">
              <Clapperboard className="h-4.5 w-4.5 text-teal-500 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-sm font-bold text-foreground mt-2.5">Rent Products</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">From 500/day</p>
          </button>
        </div>
      </section>
      <Separator className="mx-4 opacity-30" />

      {/* Services Grid */}
      <section className="px-4 py-3 max-w-7xl mx-auto relative z-10">
        <h2 className="text-base font-bold text-foreground mb-3 max-w-3xl mx-auto">Services</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5 max-w-3xl mx-auto">
          <button onClick={() => goGiftWrapping()} className="group flex flex-col items-center gap-1 rounded-2xl border border-primary/10 bg-card/60 backdrop-blur-md p-3.5 transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 active:scale-95 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 liquid-aurora opacity-5 pointer-events-none -z-10" />
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/10 border border-pink-500/20 overflow-hidden mx-auto mb-1">
              <GiftIcon className="relative z-10 h-4 w-4 text-pink-500 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[10px] font-bold text-foreground">Gift Wrap</span>
          </button>
          <button onClick={() => goCodeQuality()} className="group flex flex-col items-center gap-1 rounded-2xl border border-primary/10 bg-card/60 backdrop-blur-md p-3.5 transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 active:scale-95 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 liquid-aurora opacity-5 pointer-events-none -z-10" />
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 overflow-hidden mx-auto mb-1">
              <Shield className="relative z-10 h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[10px] font-bold text-foreground">Code Quality</span>
          </button>
          <button onClick={() => goOpenSource()} className="group flex flex-col items-center gap-1 rounded-2xl border border-primary/10 bg-card/60 backdrop-blur-md p-3.5 transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 active:scale-95 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 liquid-aurora opacity-5 pointer-events-none -z-10" />
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 border border-green-500/20 overflow-hidden mx-auto mb-1">
              <Heart className="relative z-10 h-4 w-4 text-green-500 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[10px] font-bold text-foreground">Open Source</span>
          </button>
          <button onClick={() => goStudentDiscount()} className="group flex flex-col items-center gap-1 rounded-2xl border border-primary/10 bg-card/60 backdrop-blur-md p-3.5 transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 active:scale-95 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 liquid-aurora opacity-5 pointer-events-none -z-10" />
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 border border-orange-500/20 overflow-hidden mx-auto mb-1">
              <GraduationCap className="relative z-10 h-4 w-4 text-orange-500 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[10px] font-bold text-foreground">Student</span>
          </button>
          <button onClick={() => goDeliveryProtection()} className="group flex flex-col items-center gap-1 rounded-2xl border border-primary/10 bg-card/60 backdrop-blur-md p-3.5 transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 active:scale-95 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 liquid-aurora opacity-5 pointer-events-none -z-10" />
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 border border-green-500/20 overflow-hidden mx-auto mb-1">
              <CheckCircle className="relative z-10 h-4 w-4 text-green-500 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[10px] font-bold text-foreground">Protected</span>
          </button>
          <button onClick={() => goTechLibrary()} className="group flex flex-col items-center gap-1 rounded-2xl border border-primary/10 bg-card/60 backdrop-blur-md p-3.5 transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 active:scale-95 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 liquid-aurora opacity-5 pointer-events-none -z-10" />
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/10 border border-yellow-500/20 overflow-hidden mx-auto mb-1">
              <Trophy className="relative z-10 h-4 w-4 text-yellow-500 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[10px] font-bold text-foreground">Resources</span>
          </button>
        </div>
      </section>
      <Separator className="mx-4 opacity-30" />

      {/* Seller Center + Review Megaphone */}
      <section className="px-4 py-3 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-2 gap-3 max-w-3xl mx-auto">
          <button onClick={() => goSellerCenter()} className="group relative overflow-hidden rounded-2xl border border-amber-500/20 bg-card/65 backdrop-blur-md p-4 text-left transition-all duration-300 hover:border-amber-500/40 hover:shadow-md hover:shadow-amber-500/5 active:scale-[0.98]">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 -z-10" />
            <div className="absolute inset-0 liquid-aurora opacity-5 -z-10" />
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 overflow-hidden shadow-sm">
              <Store className="h-4.5 w-4.5 text-amber-500 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-sm font-bold text-foreground mt-2.5">Become a Seller</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Earn up to 95%</p>
          </button>
          <button onClick={() => goReviewMegaphone()} className="group relative overflow-hidden rounded-2xl border border-purple-500/20 bg-card/65 backdrop-blur-md p-4 text-left transition-all duration-300 hover:border-purple-500/40 hover:shadow-md hover:shadow-purple-500/5 active:scale-[0.98]">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 -z-10" />
            <div className="absolute inset-0 liquid-aurora opacity-5 -z-10" />
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20 overflow-hidden shadow-sm">
              <Megaphone className="h-4.5 w-4.5 text-purple-500 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-sm font-bold text-foreground mt-2.5">Top Reviewers</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Community stars</p>
          </button>
        </div>
      </section>
      <Separator className="mx-4 opacity-30" />

      {/* More Features Quick Grid */}
      <section className="px-4 py-4 max-w-7xl mx-auto relative z-10">
        <h2 className="text-base font-bold text-foreground mb-3 max-w-3xl mx-auto">More Features</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2.5 max-w-3xl mx-auto">
          <button onClick={() => goProductVideos()} className="group flex flex-col items-center gap-1 rounded-2xl border border-primary/10 bg-card/60 backdrop-blur-md p-3 transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 active:scale-95 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 liquid-aurora opacity-5 pointer-events-none -z-10" />
            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 overflow-hidden mx-auto mb-1">
              <Clapperboard className="relative z-10 h-3.5 w-3.5 text-red-500 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[9px] font-bold text-foreground">Videos</span>
          </button>
          <button onClick={() => goProductQuiz()} className="group flex flex-col items-center gap-1 rounded-2xl border border-primary/10 bg-card/60 backdrop-blur-md p-3 transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 active:scale-95 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 liquid-aurora opacity-5 pointer-events-none -z-10" />
            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20 overflow-hidden mx-auto mb-1">
              <Puzzle className="relative z-10 h-3.5 w-3.5 text-purple-500 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[9px] font-bold text-foreground">Quiz</span>
          </button>
          <button onClick={() => goLoyaltyCalculator()} className="group flex flex-col items-center gap-1 rounded-2xl border border-primary/10 bg-card/60 backdrop-blur-md p-3 transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 active:scale-95 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 liquid-aurora opacity-5 pointer-events-none -z-10" />
            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/10 border border-orange-500/20 overflow-hidden mx-auto mb-1">
              <Calculator className="relative z-10 h-3.5 w-3.5 text-orange-500 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[9px] font-bold text-foreground">Calc</span>
          </button>
          <button onClick={() => goShippingCalculator()} className="group flex flex-col items-center gap-1 rounded-2xl border border-primary/10 bg-card/60 backdrop-blur-md p-3 transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 active:scale-95 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 liquid-aurora opacity-5 pointer-events-none -z-10" />
            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 overflow-hidden mx-auto mb-1">
              <Truck className="relative z-10 h-3.5 w-3.5 text-blue-500 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[9px] font-bold text-foreground">Shipping</span>
          </button>
          <button onClick={() => goGroupBuy()} className="group flex flex-col items-center gap-1 rounded-2xl border border-primary/10 bg-card/60 backdrop-blur-md p-3 transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 active:scale-95 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 liquid-aurora opacity-5 pointer-events-none -z-10" />
            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-green-500/10 border border-green-500/20 overflow-hidden mx-auto mb-1">
              <HandHelping className="relative z-10 h-3.5 w-3.5 text-green-500 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[9px] font-bold text-foreground">Group</span>
          </button>
          <button onClick={() => goDarkStore()} className="group flex flex-col items-center gap-1 rounded-2xl border border-primary/10 bg-card/60 backdrop-blur-md p-3 transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 active:scale-95 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 liquid-aurora opacity-5 pointer-events-none -z-10" />
            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 overflow-hidden mx-auto mb-1">
              <Moon className="relative z-10 h-3.5 w-3.5 text-indigo-500 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[9px] font-bold text-foreground">Dark</span>
          </button>
          <button onClick={() => goPriceDrop()} className="group flex flex-col items-center gap-1 rounded-2xl border border-primary/10 bg-card/60 backdrop-blur-md p-3 transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 active:scale-95 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 liquid-aurora opacity-5 pointer-events-none -z-10" />
            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 overflow-hidden mx-auto mb-1">
              <TrendingDown className="relative z-10 h-3.5 w-3.5 text-red-500 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[9px] font-bold text-foreground">Drop</span>
          </button>
          <button onClick={() => goMysteryReward()} className="group flex flex-col items-center gap-1 rounded-2xl border border-primary/10 bg-card/60 backdrop-blur-md p-3 transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 active:scale-95 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 liquid-aurora opacity-5 pointer-events-none -z-10" />
            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 overflow-hidden mx-auto mb-1">
              <GiftIcon className="relative z-10 h-3.5 w-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[9px] font-bold text-foreground">Mystery</span>
          </button>
        </div>
      </section>
      <Separator className="mx-4 opacity-30" />

      {/* 23. Mall Footer */}
      <MallFooter />

      <BackToTop />
    </div>
  )
}
