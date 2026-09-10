'use client'

// Import all 18 product illustrations
import { useState } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Star, Heart, ShoppingCart, Eye, Zap, GitCompare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useShopStore, type Product } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
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
  // 15 NEW low-priced products
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


const gradientColors = [
  'from-emerald-500/20 to-teal-600/20',
  'from-violet-500/20 to-purple-600/20',
  'from-amber-500/20 to-orange-600/20',
  'from-rose-500/20 to-pink-600/20',
  'from-cyan-500/20 to-blue-600/20',
  'from-lime-500/20 to-green-600/20',
]

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

interface ProductCardProps {
  product: Product
  index?: number
  variant?: 'grid' | 'horizontal'
}

export function ProductCard({ product, index = 0, variant = 'grid' }: ProductCardProps) {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist, addToCompare, isInCompare, compareList } = useShopStore()
  const isComparing = isInCompare(product.id)
  const { goProduct } = useShopRouter()
  const isWishlisted = isInWishlist(product.id)
  const [imgLoaded, setImgLoaded] = useState(false)
  const gradientIndex =
    product.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    gradientColors.length

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
      // ========== 15 NEW LOW-PRICED PRODUCTS ==========
      // Websites
      case 'mini-landing-page':
        return <IllustrationMiniLandingPage />
      case 'starter-business-site':
        return <IllustrationStarterBusinessSite />
      case 'link-in-bio-page':
        return <IllustrationLinkInBioPage />
      // Mobile Apps
      case 'simple-todo-app':
        return <IllustrationSimpleTodoApp />
      case 'basic-calculator-app':
        return <IllustrationBasicCalculatorApp />
      case 'expense-tracker-lite':
        return <IllustrationExpenseTrackerLite />
      // DevOps
      case 'auto-backup-script':
        return <IllustrationAutoBackupScript />
      case 'server-monitor-bot':
        return <IllustrationServerMonitorBot />
      // UI/UX Design
      case 'icon-pack-starter':
        return <IllustrationIconPackStarter />
      case 'wireframe-kit-lite':
        return <IllustrationWireframeKitLite />
      // AI & ML
      case 'ai-text-summarizer':
        return <IllustrationAITextSummarizer />
      case 'smart-email-classifier':
        return <IllustrationSmartEmailClassifier />
      case 'basic-image-recognition-api':
        return <IllustrationBasicImageRecognitionAPI />
      // SEO & Marketing
      case 'meta-tags-optimizer':
        return <IllustrationMetaTagsOptimizer />
      case 'local-seo-booster':
        return <IllustrationLocalSEOBooster />
      default:
        return null
    }
  }

  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0

  const handleViewDetails = () => {
    goProduct(product.id)
  }

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
    })
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isWishlisted) {
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

  const handleCompare = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isComparing) {
      toast.info('Removed from compare')
    } else if (compareList.length >= 3) {
      toast.error('Max 3 items to compare')
      return
    } else {
      toast.success('Added to compare!')
    }
    if (!isComparing) addToCompare(product.id)
  }

  if (variant === 'horizontal') {
    return (
      <motion.div
        role="button"
        tabIndex={0}
        className="group flex w-full gap-3 rounded-2xl border border-border/50 bg-card p-3 text-left transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98]"
        onClick={handleViewDetails}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Image */}
        <div className={`relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ${gradientColors[gradientIndex]}`}>
          {getProductIllustration(product.slug) || (product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              onLoad={() => setImgLoaded(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-2xl opacity-40"></span>
            </div>
          ))}
          {discount > 0 && (
            <Badge className="absolute left-1.5 top-1.5 h-5 bg-destructive/90 px-1.5 text-[10px] font-bold text-white">
              -{discount}%
            </Badge>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col justify-between py-0.5">
          <div>
            <h3 className="text-base font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
              {product.description}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.comparePrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
            </div>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              onClick={handleQuickAdd}
            >
              <ShoppingCart className="h-4 w-4" />
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card cursor-pointer card-premium"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleViewDetails}
    >
      {/* Wishlist */}
      <button
        onClick={handleWishlist}
        className="absolute right-2 top-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-background/70 backdrop-blur-sm transition-all hover:bg-background active:scale-90"
      >
        <Heart className={`h-3 w-3 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-foreground/60'}`} />
      </button>

      {/* Image */}
      <div className={`relative aspect-square overflow-hidden bg-gradient-to-br ${gradientColors[gradientIndex]}`}>
        {getProductIllustration(product.slug) || (product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-3xl opacity-25"></span>
          </div>
        ))}

        {/* Badges */}
        <div className="absolute left-1.5 top-1.5 flex flex-col gap-1 z-10">
          {discount > 0 && (
            <span className="rounded-md bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
              -{discount}%
            </span>
          )}
          {product.isFeatured && (
            <span className="rounded-md bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none flex items-center gap-0.5">
              <Zap className="h-2.5 w-2.5" />Hot
            </span>
          )}
        </div>

        {/* Liquid shimmer sweep on image */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 animate-shimmer rounded-none" />
        </div>

        {/* Hover overlay glass-deep with ripple ring */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/10 backdrop-blur-[2px]">
          <motion.div
            className="relative flex h-10 w-10 items-center justify-center rounded-full glass-deep shadow-lg"
            whileHover={{ scale: 1.15 }}
          >
            <Eye className="h-4 w-4 text-foreground" />
            {/* Ripple ring on hover */}
            <span className="absolute inset-0 rounded-full animate-pulse" style={{ boxShadow: '0 0 0 4px oklch(0.637 0.176 162 / 30%)' }} />
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1.5 p-2.5">
        <h3 className="text-xs font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors leading-snug">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-0.5">
          {[1,2,3,4,5].map(s => (
            <Star key={s} className={`h-2.5 w-2.5 ${s <= Math.round(product.rating || 4) ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'}`} />
          ))}
          <span className="ml-1 text-[9px] text-muted-foreground">{product.rating?.toFixed(1) || '4.0'}</span>
        </div>

        {/* Price row */}
        <div className="mt-auto flex items-center justify-between gap-1 pt-0.5">
          <div className="flex items-baseline gap-1 min-w-0">
            <span className="text-sm font-bold text-primary truncate">{formatPrice(product.price)}</span>
            {product.comparePrice && (
              <span className="text-[10px] text-muted-foreground line-through hidden sm:inline">{formatPrice(product.comparePrice)}</span>
            )}
          </div>
          <motion.button
            onClick={handleQuickAdd}
            className="btn-liquid flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.1 }}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <div className="absolute inset-0 animate-shimmer" />
      </div>
      <div className="flex flex-col gap-3 p-4">
        <div className="h-4 w-3/4 rounded bg-muted overflow-hidden relative">
          <div className="absolute inset-0 animate-shimmer" />
        </div>
        <div className="h-3 w-full rounded bg-muted overflow-hidden relative">
          <div className="absolute inset-0 animate-shimmer" />
        </div>
        <div className="h-3 w-1/2 rounded bg-muted overflow-hidden relative">
          <div className="absolute inset-0 animate-shimmer" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-5 w-16 rounded bg-muted overflow-hidden relative">
            <div className="absolute inset-0 animate-shimmer" />
          </div>
          <div className="h-7 w-7 rounded-full bg-muted overflow-hidden relative">
            <div className="absolute inset-0 animate-shimmer" />
          </div>
        </div>
      </div>
    </div>
  )
}

export { formatPrice }

