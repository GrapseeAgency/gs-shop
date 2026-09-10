'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Zap, Clock, ArrowRight, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { type Product } from '@/lib/store'
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

// Countdown timer hook accepts stable timestamp number to avoid infinite re-renders
function useCountdown(targetTs: number) {
  const calc = useCallback(() => {
    const diff = targetTs - Date.now()
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 }
    return {
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    }
  }, [targetTs])

  const [timeLeft, setTimeLeft] = useState(calc)

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calc()), 1000)
    return () => clearInterval(timer)
  }, [calc])

  return timeLeft
}

function CountdownDigit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10 border border-destructive/25 shadow-sm shadow-destructive/5 relative overflow-hidden animate-swell">
        <div className="absolute inset-0 bg-gradient-to-tr from-destructive/20 to-orange-500/10 opacity-30 animate-aurora" />
        <span className="relative z-10 text-sm font-black text-destructive leading-none">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="mt-0.5 text-[8px] font-bold tracking-wider text-muted-foreground">{label}</span>
    </div>
  )
}

export function FlashDeals() {
  const { goProduct, goDeals } = useShopRouter()
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })

  // Fetch flash deals from API
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await fetch('/api/flash-sale')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        
        // STRICT VALIDATION - Only show if we have valid sales
        if (data.success && data.sales && data.sales.length > 0) {
          // Transform to include product data
          const validDeals = data.sales.filter((sale: any) => 
            sale.product && sale.product.id && sale.product.name
          )
          if (validDeals.length > 0) {
            setDeals(validDeals)
            // Set countdown from first sale's endTime
            if (validDeals[0].endTime) {
              const endTime = new Date(validDeals[0].endTime).getTime()
              const updateCountdown = () => {
                const now = Date.now()
                const diff = Math.max(0, endTime - now)
                setTimeLeft({
                  hours: Math.floor(diff / (1000 * 60 * 60)),
                  minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                  seconds: Math.floor((diff % (1000 * 60)) / 1000)
                })
              }
              updateCountdown()
              const timer = setInterval(updateCountdown, 1000)
              return () => clearInterval(timer)
            }
          }
        }
        // NO FALLBACK - strictly hide if no valid sales
      } catch (error) {
        // Silent fail - no fallback
      } finally {
        setLoading(false)
      }
    }
    
    fetchDeals()
  }, [])

  // Silent - don't show if no deals
  if (!loading && deals.length === 0) return null

  return (
    <section className="py-4">
      {/* Header */}
      <div className="mb-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-destructive/10 border border-destructive/20 shadow-inner animate-pulse">
              <Flame className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Flash Deals</h2>
              <p className="text-[10px] text-muted-foreground">Ends today!</p>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-1">
            <Clock className="mr-1 h-3.5 w-3.5 text-destructive animate-breathe" />
            <CountdownDigit value={timeLeft.hours} label="HRS" />
            <span className="text-sm font-bold text-destructive leading-none mb-2">:</span>
            <CountdownDigit value={timeLeft.minutes} label="MIN" />
            <span className="text-sm font-bold text-destructive leading-none mb-2">:</span>
            <CountdownDigit value={timeLeft.seconds} label="SEC" />
          </div>
        </div>
      </div>

      {/* Horizontal scrollable deal cards on mobile, responsive grid on desktop */}
      <div className="flex md:grid md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto md:overflow-x-visible px-4 pb-2 md:pb-0 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {deals.map((sale, index) => {
          const product = sale.product
          const discount = sale.discountPercent || Math.round((1 - sale.salePrice / (product.comparePrice || product.price)) * 100)
          return (
            <motion.div
              key={sale.id}
              role="button"
              tabIndex={0}
              className="group relative flex w-[160px] md:w-auto flex-shrink-0 md:flex-shrink flex-col overflow-hidden rounded-2xl border border-border/30 bg-card/60 backdrop-blur-md transition-all card-premium hover:border-destructive/40 active:scale-[0.97]"
              onClick={() => goProduct(product.id)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Deal Badge */}
              <Badge className="absolute left-2 top-2 z-10 bg-destructive hover:bg-destructive text-white shadow-md animate-swell font-bold px-2 py-0.5 border border-white/20">
                <Zap className="mr-0.5 h-3 w-3 fill-white/20" />-{discount}%
              </Badge>

              {/* Image */}
              <div className="flex h-28 items-center justify-center overflow-hidden bg-gradient-to-br from-destructive/10 to-orange-500/5 relative liquid-caustic">
                {getProductIllustration(product.slug) || (product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <span className="text-3xl opacity-30"></span>
                ))}
              </div>

              {/* Info */}
              <div className="p-2.5">
                <h3 className="mb-1 text-xs font-bold text-foreground line-clamp-1 group-hover:text-destructive transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-extrabold text-destructive">
                    {formatPrice(sale.salePrice)}
                  </span>
                  <span className="text-[10px] text-muted-foreground line-through font-medium">
                    {formatPrice(product.comparePrice || product.price)}
                  </span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* See All Deals */}
      <div className="mt-3 px-4">
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/15 btn-liquid shadow-sm hover:shadow-destructive/10 font-bold"
          onClick={() => goDeals()}
        >
          View All Deals
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </section>
  )
}

