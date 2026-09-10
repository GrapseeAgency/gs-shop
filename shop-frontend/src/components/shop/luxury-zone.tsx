'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Crown, Diamond, Star, ArrowRight, Sparkles, Shield, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useShopStore, type Product } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import {
  IllustrationBusinessLandingPage,
  IllustrationEcommerce,
  IllustrationCorporateWebsite,
  IllustrationPortfolioWebsite,
  IllustrationSaaSDashboard,
  IllustrationiOSAndroidApp,
  IllustrationMVPAppPrototype,
  IllustrationFoodDeliveryApp,
  IllustrationCICDPipeline,
  IllustrationCloudInfrastructure,
  IllustrationDockerKubernetes,
  IllustrationBrandIdentityDesign,
  IllustrationUIUXAudit,
  IllustrationMobileAppUIKit,
  IllustrationAIChatbotIntegration,
  IllustrationMLDataPipeline,
  IllustrationSEOOptimizationPackage,
  IllustrationSocialMediaStrategy,
  // 15 NEW
  IllustrationMiniLandingPage,
  IllustrationStarterBusinessSite,
  IllustrationLinkInBioPage,
  IllustrationSimpleTodoApp,
  IllustrationBasicCalculatorApp,
  IllustrationExpenseTrackerLite,
  IllustrationAutoBackupScript,
  IllustrationServerMonitorBot,
  IllustrationIconPackStarter,
  IllustrationWireframeKitLite,
  IllustrationAITextSummarizer,
  IllustrationSmartEmailClassifier,
  IllustrationBasicImageRecognitionAPI,
  IllustrationMetaTagsOptimizer,
  IllustrationLocalSEOBooster,
} from './product-illustrations'

interface LuxuryZoneProps {
  // No props needed - strictly uses API data
}

interface LuxuryProduct {
  id: string
  name: string
  slug: string
  price: number
  comparePrice?: number | null
  imageUrl: string | null
  description?: string | null
  rating?: number | null
}

// Get illustration component based on product slug
const getProductIllustration = (slug: string) => {
  switch (slug) {
    // Websites (Blue theme)
    case 'business-landing-page':
      return <IllustrationBusinessLandingPage />
    case 'ecommerce-website':
      return <IllustrationEcommerce />
    case 'corporate-website':
      return <IllustrationCorporateWebsite />
    case 'portfolio-website':
      return <IllustrationPortfolioWebsite />
    case 'saas-dashboard':
      return <IllustrationSaaSDashboard />
    // Mobile Apps (Emerald theme)
    case 'ios-android-app':
      return <IllustrationiOSAndroidApp />
    case 'mvp-app-prototype':
      return <IllustrationMVPAppPrototype />
    case 'food-delivery-app':
      return <IllustrationFoodDeliveryApp />
    // DevOps (Purple theme)
    case 'cicd-pipeline-setup':
      return <IllustrationCICDPipeline />
    case 'cloud-infrastructure':
      return <IllustrationCloudInfrastructure />
    case 'docker-kubernetes-setup':
      return <IllustrationDockerKubernetes />
    // UI/UX Design (Rose theme)
    case 'brand-identity-design':
      return <IllustrationBrandIdentityDesign />
    case 'uiux-audit':
      return <IllustrationUIUXAudit />
    case 'mobile-app-ui-kit':
      return <IllustrationMobileAppUIKit />
    // AI & ML (Cyan theme)
    case 'ai-chatbot-integration':
      return <IllustrationAIChatbotIntegration />
    case 'ml-data-pipeline':
      return <IllustrationMLDataPipeline />
    // SEO & Marketing (Amber theme)
    case 'seo-optimization-package':
      return <IllustrationSEOOptimizationPackage />
    case 'social-media-strategy':
      return <IllustrationSocialMediaStrategy />
    // 15 NEW
    case 'mini-landing-page':
      return <IllustrationMiniLandingPage />
    case 'starter-business-site':
      return <IllustrationStarterBusinessSite />
    case 'link-in-bio-page':
      return <IllustrationLinkInBioPage />
    case 'simple-todo-app':
      return <IllustrationSimpleTodoApp />
    case 'basic-calculator-app':
      return <IllustrationBasicCalculatorApp />
    case 'expense-tracker-lite':
      return <IllustrationExpenseTrackerLite />
    case 'auto-backup-script':
      return <IllustrationAutoBackupScript />
    case 'server-monitor-bot':
      return <IllustrationServerMonitorBot />
    case 'icon-pack-starter':
      return <IllustrationIconPackStarter />
    case 'wireframe-kit-lite':
      return <IllustrationWireframeKitLite />
    case 'ai-text-summarizer':
      return <IllustrationAITextSummarizer />
    case 'smart-email-classifier':
      return <IllustrationSmartEmailClassifier />
    case 'basic-image-recognition-api':
      return <IllustrationBasicImageRecognitionAPI />
    case 'meta-tags-optimizer':
      return <IllustrationMetaTagsOptimizer />
    case 'local-seo-booster':
      return <IllustrationLocalSEOBooster />
    default:
      return null
  }
}

export function LuxuryZone() {
  const { addToCart } = useShopStore()
  const { goLuxury, goProduct } = useShopRouter()
  const [luxuryProducts, setLuxuryProducts] = useState<LuxuryProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLuxuryProducts = async () => {
      try {
        const res = await fetch('/api/luxury-zone')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        
        if (data.success && data.products && data.products.length > 0) {
          setLuxuryProducts(data.products.slice(0, 3))
        }
        // NO FALLBACK - strictly hide if no admin-marked luxury products
      } catch (error) {
        // Silent fail - no fallback, component stays hidden
      } finally {
        setLoading(false)
      }
    }
    
    fetchLuxuryProducts()
  }, [])

  // Silent - don't show if no luxury products
  if (!loading && luxuryProducts.length === 0) return null

  return (
    <section className="py-4 relative z-10">
      {/* Header */}
      <div className="mb-3.5 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 overflow-hidden shadow-sm">
            <div className="absolute inset-0 liquid-aurora opacity-40 animate-aurora" />
            <Crown className="relative z-10 h-4 w-4 text-amber-500 animate-swell" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-gradient-green">Luxury Zone</h2>
            <p className="text-[10px] font-semibold text-muted-foreground/80">Premium tier excellence</p>
          </div>
        </div>
        <button
          onClick={() => goLuxury()}
          className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
        >
          View All
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="space-y-3 px-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl animate-shimmer border border-primary/10" />
          ))}
        </div>
      )}

      {/* Luxury Cards - Full width stacked */}
      {!loading && (
        <div className="space-y-3.5 px-4">
          {luxuryProducts.map((product, index) => {
            const discount = product.comparePrice
              ? Math.round((1 - product.price / product.comparePrice) * 100)
              : 0

            return (
              <motion.div
                key={product.id}
                className="group relative overflow-hidden rounded-2xl border border-amber-500/25 bg-card/60 backdrop-blur-md transition-all duration-300 hover:border-amber-500/45 hover:shadow-md hover:shadow-amber-500/5 p-3"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {/* Dynamic gold gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-primary/5 to-transparent -z-10" />
                {/* Liquid effects */}
                <div className="absolute inset-0 liquid-aurora opacity-10 pointer-events-none -z-10" />
                <div className="absolute inset-0 liquid-caustic opacity-25 pointer-events-none -z-10" />
                <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full liquid-blob opacity-20 pointer-events-none -z-10" />

                {/* Premium Badge */}
                <div className="absolute right-3 top-3 z-10">
                  <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-extrabold shadow-sm border border-amber-400/20 rounded-full px-2 py-0.5 text-[9px]">
                    <Diamond className="mr-0.5 h-3 w-3 animate-pulse" />
                    PREMIUM
                  </Badge>
                </div>

                <div className="relative flex gap-3 z-10">
                  {/* Image */}
                  <button
                    className="relative flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-amber-500/15 to-amber-500/5 border border-amber-500/20 shadow-sm"
                    onClick={() => goProduct(product.id)}
                  >
                    <div className="absolute inset-0 liquid-aurora opacity-15" />
                    <div className="relative z-10">
                      {getProductIllustration(product.slug) || (product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <span className="text-3xl opacity-30"></span>
                      ))}
                    </div>
                  </button>

                  {/* Info */}
                  <div className="flex flex-1 flex-col justify-between py-0.5">
                    <div>
                      <h3 className="text-sm font-extrabold text-foreground line-clamp-1 group-hover:text-amber-500 transition-colors leading-tight">
                        {product.name}
                      </h3>
                      <p className="mt-1 text-[10px] text-muted-foreground/90 line-clamp-1">
                        {product.description}
                      </p>
                      <div className="mt-1.5 flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                        ))}
                        <span className="ml-1 text-[9px] font-semibold text-muted-foreground/80">(5.0)</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-extrabold text-amber-500">
                          {formatPrice(product.price)}
                        </span>
                        {product.comparePrice && (
                          <span className="text-[10px] font-semibold text-muted-foreground/80 line-through">
                            {formatPrice(product.comparePrice)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5 text-[9px] font-bold text-amber-500">
                          <Shield className="h-2.5 w-2.5" />
                          VIP
                        </div>
                        <Button
                          size="sm"
                          className="h-7 gap-1 bg-amber-500 text-white hover:bg-amber-600 text-[11px] font-bold rounded-full btn-liquid shadow-sm shadow-amber-500/25 px-3"
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
    </section>
  )
}

