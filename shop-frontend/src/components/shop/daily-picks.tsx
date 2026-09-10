'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles, Calendar, ArrowRight, RefreshCw, ThumbsUp,
  Clock, Star, ShoppingBag
} from 'lucide-react'
import { User, DollarSign, Flame } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useShopStore, type Product } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'
import { toast } from 'sonner'
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

interface DailyPicksProps {
  // No props needed - strictly uses API data
}

type PickReason = 'staff_pick' | 'top_rated' | 'best_value' | 'new_arrival' | 'trending'

const pickReasonConfig: Record<PickReason, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  staff_pick: { label: 'Staff Pick', icon: User, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  top_rated: { label: 'Top Rated', icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  best_value: { label: 'Best Value', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  new_arrival: { label: 'New Arrival', icon: Sparkles, color: 'text-sky-500', bg: 'bg-sky-500/10' },
  trending: { label: 'Trending', icon: Flame, color: 'text-rose-500', bg: 'bg-rose-500/10' },
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

const pickReasons: PickReason[] = ['staff_pick', 'top_rated', 'best_value', 'new_arrival', 'trending']

function getPickReason(index: number, dayIndex: number): PickReason {
  return pickReasons[(index + dayIndex) % pickReasons.length]
}

export function DailyPicks() {
  const { addToCart } = useShopStore()
  const { goProduct } = useShopRouter()
  const [picks, setPicks] = useState<Product[]>([])
  const [votes, setVotes] = useState<Record<string, number>>({})
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | null>>({})
  const [flipped, setFlipped] = useState<Record<string, boolean>>({})
  const [timeUntilNext, setTimeUntilNext] = useState('')
  const [loading, setLoading] = useState(true)

  const today = new Date()
  const dayIndex = today.getDate() + today.getMonth() * 31

  // Fetch real daily picks from API
  useEffect(() => {
    const fetchDailyPicks = async () => {
      try {
        const res = await fetch('/api/todays-pick')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        
        if (data.success && data.picks && data.picks.length > 0) {
          setPicks(data.picks.slice(0, 2)) // API returns 2 products
        }
        // NO FALLBACK - strictly hide if no API data
      } catch (error) {
        // Silent fail - no fallback, component stays hidden
      } finally {
        setLoading(false)
      }
    }
    
    fetchDailyPicks()
  }, [])

  // Initialize votes
  useEffect(() => {
    const initialVotes: Record<string, number> = {}
    picks.forEach((p, i) => {
      initialVotes[p.id] = Math.floor(Math.random() * 50) + 10 + (3 - i) * 5
    })
    setVotes(initialVotes)
  }, [picks])

  // Countdown timer until next day's picks
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      const diff = tomorrow.getTime() - now.getTime()

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setTimeUntilNext(`${hours}h ${minutes}m ${seconds}s`)
    }
    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [])

  // Silent - don't show if no picks from API
  if (!loading && picks.length === 0) return null

  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' })
  const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const handleVote = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation()
    if (userVotes[productId]) {
      // Remove vote
      setUserVotes(prev => ({ ...prev, [productId]: null }))
      setVotes(prev => ({ ...prev, [productId]: Math.max(0, (prev[productId] || 0) - 1) }))
    } else {
      setUserVotes(prev => ({ ...prev, [productId]: 'up' }))
      setVotes(prev => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }))
      toast.success('Vote recorded! ')
    }
  }

  const handleFlip = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation()
    setFlipped(prev => ({ ...prev, [productId]: !prev[productId] }))
  }

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation()
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
    })
    toast.success(`${product.name} added to cart!`)
  }

  return (
    <section className="py-4 relative z-10">
      {/* Header */}
      <div className="mb-3.5 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 overflow-hidden shadow-sm">
            <div className="absolute inset-0 liquid-aurora opacity-40" />
            <Calendar className="relative z-10 h-4 w-4 text-primary animate-swell" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-extrabold text-gradient-green">Today's Picks</h2>
              <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 text-[9px] px-1.5 py-0 font-extrabold shadow-sm">
                <Sparkles className="mr-0.5 h-2.5 w-2.5 animate-pulse-glow" />
                NEW
              </Badge>
            </div>
            <p className="text-[10px] font-medium text-muted-foreground/80">
              Curated for {dayName}  {dateStr}
            </p>
          </div>
        </div>
        <Badge className="bg-primary/10 text-primary border border-primary/20 font-bold px-2 py-0.5 rounded-full shadow-sm">
          <Sparkles className="mr-1 h-3 w-3" />
          {picks.length} picks
        </Badge>
      </div>

      {/* Refresh Timer */}
      <div className="mx-4 mb-3.5 flex items-center justify-between rounded-2xl glass px-4 py-2 border border-primary/10 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 liquid-aurora opacity-5 -z-10" />
        <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
          <Clock className="h-3.5 w-3.5 text-primary animate-pulse" />
          <span>Next picks in</span>
          <span className="font-mono font-extrabold text-primary tracking-wider">{timeUntilNext}</span>
        </div>
        <RefreshCw className="h-3 w-3 text-primary/70 animate-spin" style={{ animationDuration: '4s' }} />
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3 px-4">
        {picks.map((product, index) => {
          const discount = product.comparePrice
            ? Math.round((1 - product.price / product.comparePrice) * 100)
            : 0
          const reason = getPickReason(index, dayIndex)
          const reasonCfg = pickReasonConfig[reason]
          const voteCount = votes[product.id] || 0
          const hasVoted = !!userVotes[product.id]
          const isFlipped = flipped[product.id]

          return (
            <motion.div
              key={product.id}
              className="group relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              {/* Card with flip effect */}
              <div
                className="relative"
                style={{ perspective: '600px' }}
              >
                <motion.div
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Front */}
                  <div
                    className="relative flex flex-col overflow-hidden rounded-2xl border border-primary/15 bg-card/75 backdrop-blur-md transition-all duration-300 hover:border-primary/35 hover:shadow-md hover:shadow-primary/5"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div onClick={() => goProduct(product.id)} className="text-left w-full cursor-pointer">
                      {/* Pick Number & Reason Badge */}
                      <div className="absolute left-2 top-2 z-10 flex items-center gap-1">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-extrabold text-primary-foreground shadow-sm shadow-primary/20">
                          {index + 1}
                        </div>
                        <span className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[8px] font-extrabold ${reasonCfg.color} ${reasonCfg.bg} border border-primary/10 backdrop-blur-sm`}>
                          {(() => { const Icon = reasonCfg.icon; return <Icon className="h-3 w-3" />; })()}
                          {reasonCfg.label}
                        </span>
                      </div>

                      {/* Vote Button */}
                      <button
                        onClick={(e) => handleVote(e, product.id)}
                        className="absolute right-2 top-2 z-10 flex items-center gap-0.5 rounded-full glass px-2 py-0.5 text-[9px] font-bold shadow-sm transition-all duration-300 hover:scale-105 active:scale-95"
                      >
                        <ThumbsUp className={`h-2.5 w-2.5 transition-transform ${hasVoted ? 'text-primary fill-primary scale-110' : 'text-muted-foreground'}`} />
                        <span className={hasVoted ? 'text-primary' : 'text-muted-foreground'}>{voteCount}</span>
                      </button>

                      {/* Image */}
                      <div className="relative flex h-28 items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 to-emerald-500/5 border-b border-primary/10 liquid-caustic">
                        <div className="absolute inset-0 liquid-aurora opacity-10 pointer-events-none" />
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

                      {/* Info */}
                      <div className="p-2.5">
                        <h3 className="mb-0.5 text-xs font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-extrabold text-primary">
                            {formatPrice(product.price)}
                          </span>
                          {discount > 0 && (
                            <span className="text-[9px] font-semibold text-muted-foreground/80 line-through">
                              {formatPrice(product.comparePrice!)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Row */}
                    <div className="flex border-t border-primary/10 bg-background/20">
                      <button
                        onClick={(e) => handleFlip(e, product.id)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors border-r border-primary/10 hover:bg-primary/5"
                      >
                        <Star className="h-3 w-3 text-primary/70" />
                        Details
                      </button>
                      <button
                        onClick={(e) => handleQuickAdd(e, product)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 text-[10px] font-bold text-primary hover:bg-primary/10 transition-colors btn-liquid"
                      >
                        <ShoppingBag className="h-3 w-3" />
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Back */}
                  <div
                    className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-primary/25 bg-card/95 backdrop-blur-lg p-3 shadow-md"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className={`flex items-center gap-0.5 text-[10px] font-bold ${reasonCfg.color}`}>
                        {(() => { const ReasonIcon = reasonCfg.icon; return <ReasonIcon className="h-3 w-3" />; })()}
                        {reasonCfg.label}
                      </span>
                      <button
                        onClick={(e) => handleFlip(e, product.id)}
                        className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors"
                      >
                         Back
                      </button>
                    </div>
                    <h3 className="mb-1 text-xs font-bold text-foreground line-clamp-2 leading-tight">{product.name}</h3>
                    <p className="flex-1 text-[10px] text-muted-foreground/90 line-clamp-4 leading-relaxed mt-1">
                      {product.description}
                    </p>
                    <div className="mt-2 flex items-center justify-between pt-1 border-t border-primary/5">
                      <span className="text-sm font-extrabold text-primary">{formatPrice(product.price)}</span>
                      <Button size="sm" className="h-7 gap-1 text-[10px] font-bold rounded-full btn-liquid px-3" onClick={() => goProduct(product.id)}>
                        View <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Total Votes Summary */}
      {!loading && (
        <div className="mx-4 mt-3.5 flex items-center justify-center gap-1.5 text-[9px] font-medium text-muted-foreground/80 bg-primary/5 border border-primary/5 py-1 rounded-lg">
          <ThumbsUp className="h-2.5 w-2.5 text-primary" />
          <span>{Object.values(votes).reduce((a, b) => a + b, 0)} total votes today</span>
        </div>
      )}
    </section>
  )
}

