'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight, BadgePlus, ShoppingCart, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { type Product } from '@/lib/store'
import { useShopStore } from '@/lib/store'
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

interface NewArrivalsProps {
  products?: Product[]
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

export function NewArrivals() {
  const { goSearch, goProduct } = useShopRouter()
  const { addToCart } = useShopStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/new-arrivals?limit=8')
      .then((res) => res.json())
      .then((data) => {
        // STRICT VALIDATION - Only show if we have valid products
        const prods = Array.isArray(data) ? data : (data.products || [])
        const validProducts = prods.filter((p: any) => p.id && p.name && typeof p.price === 'number')
        if (validProducts.length > 0) {
          setProducts(validProducts.slice(0, 8))
        }
        // NO FALLBACK - strictly hide if no valid products
      })
      .catch(() => {
        // Silent fail - no fallback
      })
      .finally(() => setLoading(false))
  }, [])

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation()
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
    })
    toast.success('Added to cart!', { description: product.name })
  }

  const discount = (p: Product) =>
    p.comparePrice ? Math.round((1 - p.price / p.comparePrice) * 100) : 0

  if (!loading && products.length === 0) return null

  return (
    <section className="py-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-purple-400/10 animate-aurora" />
            <Sparkles className="relative h-4 w-4 text-violet-400" />
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-gradient-green"> New Arrivals</h2>
            {!loading && products.length > 0 && (
              <Badge className="bg-violet-500/90 text-white text-[9px] px-1.5 py-0 shadow-sm shadow-violet-500/30">
                {products.length} new
              </Badge>
            )}
          </div>
        </div>
        <button
          onClick={() => goSearch(undefined)}
          className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
        >
          See All New
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="flex gap-3 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex w-[150px] flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-border/30 bg-card/60 backdrop-blur-md">
              <div className="h-28 animate-shimmer" />
              <div className="p-2.5 space-y-2">
                <div className="h-3 w-3/4 animate-shimmer rounded-full" />
                <div className="h-3 w-1/2 animate-shimmer rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Horizontal scroll */}
      <AnimatePresence>
        {!loading && (
          <motion.div
            className="flex gap-3 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {products.map((product, index) => {
              const disc = discount(product)
              return (
                <motion.div
                  key={product.id}
                  role="button"
                  tabIndex={0}
                  className="group relative flex w-[150px] flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-border/30 bg-card/60 backdrop-blur-md card-premium hover:border-violet-500/35 active:scale-[0.97]"
                  onClick={() => goProduct(product.id)}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {/* NEW Badge */}
                  <Badge className="absolute left-2 top-2 z-10 gap-0.5 bg-violet-500/90 text-white shadow-sm shadow-violet-500/30">
                    <BadgePlus className="h-3 w-3" />
                    NEW
                  </Badge>

                  {/* Discount badge */}
                  {disc > 0 && (
                    <Badge className="absolute right-2 top-2 z-10 bg-destructive/90 text-white text-[9px] px-1.5 py-0">
                      -{disc}%
                    </Badge>
                  )}

                  {/* Image liquid caustic */}
                  <div className="relative flex h-28 items-center justify-center overflow-hidden bg-gradient-to-br from-violet-500/15 to-purple-500/5 liquid-caustic">
                    <div className="absolute inset-0 liquid-aurora opacity-15 group-hover:opacity-30 transition-opacity duration-500" />
                    <div className="relative z-10 group-hover:scale-105 transition-transform duration-500">
                      {getProductIllustration(product.slug) || (product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <span className="text-3xl opacity-30"></span>
                      ))}
                    </div>
                    {/* Quick view overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/15 group-hover:opacity-100 z-20">
                      <Eye className="h-5 w-5 text-white drop-shadow-lg" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-2.5">
                    <h3 className="mb-1 text-xs font-bold text-foreground line-clamp-1 group-hover:text-violet-400 transition-colors">
                      {product.name}
                    </h3>
                    <p className="mb-1.5 text-[10px] text-muted-foreground line-clamp-1">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-extrabold text-primary">
                          {formatPrice(product.price)}
                        </span>
                        {product.comparePrice && (
                          <span className="text-[9px] text-muted-foreground line-through">
                            {formatPrice(product.comparePrice)}
                          </span>
                        )}
                      </div>
                      {/* Quick add liquid bubble */}
                      <motion.div
                        onClick={(e) => handleQuickAdd(e, product)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary transition-all hover:bg-primary hover:text-primary-foreground hover:border-transparent hover:shadow-md hover:shadow-primary/30 active:scale-90"
                        whileTap={{ scale: 0.85 }}
                      >
                        <ShoppingCart className="h-3 w-3" />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

