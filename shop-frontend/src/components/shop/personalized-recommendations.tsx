'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Info } from 'lucide-react'
import { type Product } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import { Badge } from '@/components/ui/badge'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface RecommendedProduct extends Product {
  reason?: string
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

export function PersonalizedRecommendations() {
  const { goProduct } = useShopRouter()
  const [products, setProducts] = useState<RecommendedProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await fetch('/api/products/recommendations?limit=6')
        if (res.ok) {
          const data = await res.json()
          setProducts(data.data || [])
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [])

  if (!loading && products.length === 0) return null

  return (
    <section className="py-4">
      {/* Header */}
      <div className="mb-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 overflow-hidden">
              <div className="absolute inset-0 liquid-aurora opacity-40" />
              <Sparkles className="relative h-4 w-4 text-primary animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gradient-green">Recommended For You</h2>
              <p className="text-[10px] text-muted-foreground">Based on your preferences</p>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/5 border border-primary/15 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                  <Info className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="text-xs">
                <p>Products recommended based on category,<br />price range, and trending items</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Horizontal scrollable cards on mobile, responsive grid on desktop */}
      <div className="flex md:grid md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto md:overflow-x-visible px-4 pb-2 md:pb-0 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {loading ? (
          // Liquid shimmer skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-[160px] md:w-auto flex-shrink-0 md:flex-shrink rounded-2xl overflow-hidden border border-border/30 bg-card/60 backdrop-blur-md">
              <div className="h-28 animate-shimmer" />
              <div className="p-2.5 space-y-1.5">
                <div className="h-3 w-3/4 rounded-full animate-shimmer" />
                <div className="h-4 w-1/2 rounded-full animate-shimmer" />
              </div>
            </div>
          ))
        ) : (
          products.map((product, index) => (
            <motion.div
              key={product.id}
              role="button"
              tabIndex={0}
              className="group relative flex w-[160px] md:w-auto flex-shrink-0 md:flex-shrink flex-col overflow-hidden rounded-2xl border border-border/30 bg-card/60 backdrop-blur-md card-premium hover:border-primary/30 active:scale-[0.97]"
              onClick={() => goProduct(product.id)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Image */}
              <div className="flex h-28 items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 relative liquid-caustic">
                <div className="absolute inset-0 liquid-aurora opacity-20 group-hover:opacity-35 transition-opacity" />
                <div className="relative z-10 group-hover:scale-105 transition-transform duration-500">
                  {getProductIllustration(product.slug) || (product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl opacity-30"></span>
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="p-2.5">
                <h3 className="mb-1 text-xs font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-extrabold text-primary">
                    {formatPrice(product.price)}
                  </span>
                  {product.comparePrice && (
                    <span className="text-[10px] text-muted-foreground line-through">
                      {formatPrice(product.comparePrice)}
                    </span>
                  )}
                </div>
                {/* Reason badge */}
                {product.reason && (
                  <Badge variant="outline" className="mt-1.5 h-5 border-primary/20 bg-primary/5 px-1.5 text-[9px] text-primary">
                    {product.reason}
                  </Badge>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </section>
  )
}

