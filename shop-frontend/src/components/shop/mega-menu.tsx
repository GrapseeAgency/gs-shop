'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Zap,
  Sparkles,
  TrendingUp,
  Crown,
  Award,
  Search,
  Flame,
  ChevronRight,
  Clock,
  ArrowRight,
  Tag,
  Home,
  LayoutGrid,
  Gavel,
  PartyPopper,
  BookOpen,
  HelpCircle,
  RotateCcw,
  Gift,
  Users,
  Wallet,
  User,
  Package,
  Heart,
  Settings,
  Eye,
  GitCompare,
  Bell,
  MapPin,
  Building2,
  MessageCircle,
  Shield,
  FileText,
  Star,
  ShoppingCart,
  Gem,
  Cpu,
  Activity,
  Box,
  Globe,
  Camera,
  Wand2,
  BarChart3,
} from 'lucide-react'
// Clear cache - DNA icon issue fix v2
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'

interface MegaMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  menuItems?: Array<{
    icon: React.ComponentType<{ className?: string }>
    label: string
    action: () => void
    badge?: string
    isExpandable?: boolean
    subItems?: Array<{
      icon: React.ComponentType<{ className?: string }>
      label: string
      action: () => void
    }>
  }>
}

const quickLinks = [
  { icon: Zap, label: 'Flash Deals', color: 'text-red-500', bg: 'bg-red-500/10', path: 'deals' },
  { icon: Sparkles, label: 'New Arrivals', color: 'text-emerald-500', bg: 'bg-emerald-500/10', path: 'new' },
  { icon: TrendingUp, label: 'Trending', color: 'text-amber-500', bg: 'bg-amber-500/10', path: 'trending' },
  { icon: Crown, label: 'Luxury', color: 'text-purple-500', bg: 'bg-purple-500/10', path: 'luxury' },
  { icon: Award, label: 'Brands', color: 'text-blue-500', bg: 'bg-blue-500/10', path: 'brands' },
  { icon: Flame, label: 'Most Popular', color: 'text-orange-500', bg: 'bg-orange-500/10', path: 'popular' },
]

const categoryLinks = [
  { label: 'Websites', slug: 'websites' },
  { label: 'Mobile Apps', slug: 'mobile-apps' },
  { label: 'E-Commerce', slug: 'ecommerce' },
  { label: 'SaaS', slug: 'saas' },
  { label: 'DevOps', slug: 'devops' },
  { label: 'UI/UX Design', slug: 'design' },
  { label: 'Marketing', slug: 'marketing' },
  { label: 'AI & ML', slug: 'ai-ml' },
]

interface MenuSection {
  title: string
  icon: React.ComponentType<{ className?: string }>
  items: Array<{
    icon: React.ComponentType<{ className?: string }>
    label: string
    path: string
    color?: string
    badge?: string
  }>
}

const menuSections: MenuSection[] = [
  {
    title: 'Shop',
    icon: ShoppingCart,
    items: [
      { icon: LayoutGrid, label: 'All Categories', path: 'categories', color: 'text-primary' },
      { icon: Zap, label: 'Flash Deals', path: 'deals', color: 'text-destructive' },
      { icon: Crown, label: 'Premium Zone', path: 'luxury', color: 'text-purple-500' },
      { icon: Gavel, label: 'Live Auctions', path: 'auctions', color: 'text-amber-500' },
      { icon: Sparkles, label: 'Curated Collections', path: 'collections', color: 'text-emerald-500' },
    ],
  },
  {
    title: 'Engage',
    icon: Gem,
    items: [
      { icon: PartyPopper, label: 'Spin & Win', path: 'spin-win', color: 'text-violet-500', badge: 'NEW' },
      { icon: Star, label: 'Rewards', path: 'rewards', color: 'text-amber-500' },
      { icon: Gem, label: 'VIP Membership', path: 'vip', color: 'text-purple-500' },
      { icon: Gift, label: 'Gift Cards', path: 'gift-cards', color: 'text-rose-500' },
      { icon: Users, label: 'Referrals', path: 'referrals', color: 'text-emerald-500' },
    ],
  },
  {
    title: 'Discover',
    icon: BookOpen,
    items: [
      { icon: BookOpen, label: 'Blog', path: 'blog', color: 'text-sky-500' },
      { icon: Flame, label: 'Live Shopping', path: 'live-shopping', color: 'text-red-500' },
      { icon: Award, label: 'Brand Hub', path: 'brands', color: 'text-blue-500' },
      { icon: MessageCircle, label: 'Reviews', path: 'reviews', color: 'text-amber-500' },
    ],
  },
  {
    title: 'Account',
    icon: User,
    items: [
      { icon: User, label: 'Profile', path: 'profile', color: 'text-foreground' },
      { icon: Package, label: 'My Orders', path: 'orders', color: 'text-primary' },
      { icon: Heart, label: 'Wishlist', path: 'wishlist', color: 'text-rose-500' },
      { icon: Wallet, label: 'Wallet', path: 'wallet', color: 'text-cyan-500' },
      { icon: Tag, label: 'Vouchers', path: 'vouchers', color: 'text-emerald-500' },
      { icon: MapPin, label: 'Track Order', path: 'track-order', color: 'text-orange-500' },
    ],
  },
  {
    title: 'Support',
    icon: HelpCircle,
    items: [
      { icon: HelpCircle, label: 'Help Center', path: 'help', color: 'text-teal-500' },
      { icon: RotateCcw, label: 'Returns', path: 'returns', color: 'text-orange-500' },
      { icon: MessageCircle, label: 'Contact Us', path: 'contact', color: 'text-primary' },
      { icon: FileText, label: 'FAQ', path: 'faq', color: 'text-muted-foreground' },
    ],
  },
  {
    title: ' Neural Tech',
    icon: Cpu,
    items: [
      { icon: Cpu, label: 'Neural Interface', path: 'neural-interface', color: 'text-blue-500', badge: 'NEW' },
      { icon: MessageCircle, label: 'Personal Shopper AI', path: 'personal-shopper', color: 'text-cyan-500' },
      { icon: Wand2, label: 'AI Life Planning', path: 'ai-life-planning', color: 'text-purple-500' },
      { icon: Shield, label: 'Emotional Truth', path: 'emotional-truth', color: 'text-pink-500' },
      { icon: BarChart3, label: 'Reviews 2.0', path: 'reviews-2.0', color: 'text-indigo-500' },
      { icon: Zap, label: 'Neural Bidding', path: 'neural-bidding', color: 'text-yellow-500' },
      { icon: TrendingUp, label: 'Trend Oracle', path: 'trend-oracle', color: 'text-green-500' },
      { icon: Users, label: 'Social Influence', path: 'social-influence', color: 'text-orange-500' },
    ],
  },
  {
    title: ' Quantum Tech',
    icon: Zap,
    items: [
      { icon: Zap, label: 'Quantum Computing', path: 'quantum', color: 'text-green-500', badge: 'NEW' },
      { icon: Sparkles, label: 'Quantum Collectibles', path: 'quantum-collectibles', color: 'text-purple-500' },
      { icon: Zap, label: 'Quantum Teleportation', path: 'quantum-teleportation', color: 'text-cyan-500' },
      { icon: Clock, label: 'Time Travel Sessions', path: 'time-travel', color: 'text-blue-500' },
      { icon: Crown, label: 'Brand Hub', path: 'brand-hub', color: 'text-amber-500' },
      { icon: Star, label: 'Beyond Commerce', path: 'beyond-commerce', color: 'text-rose-500' },
    ],
  },
  {
    title: ' Biological Tech',
    icon: Heart,
    items: [
      { icon: Heart, label: 'DNA Analysis', path: 'dna-analysis', color: 'text-red-500', badge: 'NEW' },
      { icon: Activity, label: 'Bio-Hacking', path: 'bio-hacking', color: 'text-emerald-500' },
      { icon: Activity, label: 'Bio-Optimization', path: 'bio-optimization', color: 'text-green-500' },
      { icon: Heart, label: 'DNA Matching', path: 'dna-matching', color: 'text-blue-500' },
      { icon: Cpu, label: 'Neural Interface', path: 'neural-interface', color: 'text-purple-500' },
      { icon: Shield, label: 'Health Monitoring', path: 'health-monitoring', color: 'text-orange-500' },
      { icon: Zap, label: 'Genetic Enhancement', path: 'genetic-enhancement', color: 'text-pink-500' },
    ],
  },
  {
    title: ' Visual Tech',
    icon: Sparkles,
    items: [
      { icon: Sparkles, label: 'Holographic System', path: 'holographic', color: 'text-purple-500', badge: 'NEW' },
      { icon: Star, label: 'Digital Twin', path: 'digital-twin', color: 'text-blue-500' },
      { icon: Eye, label: 'Virtual Showroom', path: 'virtual-showroom', color: 'text-cyan-500' },
      { icon: Box, label: 'Holographic Commerce', path: 'holographic-commerce', color: 'text-green-500' },
      { icon: Settings, label: 'Reality Customization', path: 'reality-customization', color: 'text-orange-500' },
      { icon: Globe, label: 'Metaverse Worlds', path: 'metaverse-worlds', color: 'text-pink-500' },
      { icon: Zap, label: 'AR Shopping', path: 'ar-shopping', color: 'text-yellow-500' },
      { icon: Camera, label: '3D Product View', path: '3d-product-view', color: 'text-indigo-500' },
    ],
  },
  {
    title: ' Social Tech',
    icon: Users,
    items: [
      { icon: Crown, label: 'Social Capital', path: 'social-capital', color: 'text-purple-500', badge: 'NEW' },
      { icon: Users, label: 'Style Tribe', path: 'style-tribe', color: 'text-blue-500' },
      { icon: Crown, label: 'Trend Council', path: 'trend-council', color: 'text-amber-500' },
      { icon: Gift, label: 'Collective Shopping', path: 'collective-shopping', color: 'text-green-500' },
      { icon: TrendingUp, label: 'Social Influence', path: 'social-influence', color: 'text-orange-500' },
      { icon: Star, label: 'Elite Trendsetting', path: 'elite-trendsetting', color: 'text-pink-500' },
      { icon: Users, label: 'Community Hub', path: 'community-hub', color: 'text-cyan-500' },
      { icon: MessageCircle, label: 'Social Shopping', path: 'social-shopping', color: 'text-indigo-500' },
    ],
  },
  {
    title: ' Commerce Tech',
    icon: ShoppingCart,
    items: [
      { icon: Crown, label: 'Luxury Products', path: 'luxury-products', color: 'text-amber-500', badge: 'NEW' },
      { icon: BarChart3, label: 'Reviews 2.0', path: 'reviews-2.0', color: 'text-indigo-500' },
      { icon: Users, label: 'Live Shopping', path: 'live-shopping', color: 'text-red-500' },
      { icon: Gift, label: 'Shopping Games', path: 'shopping-games', color: 'text-purple-500' },
      { icon: Crown, label: 'Social Capital', path: 'social-capital', color: 'text-blue-500' },
      { icon: Eye, label: 'Virtual Showroom', path: 'virtual-showroom', color: 'text-cyan-500' },
      { icon: Sparkles, label: 'Holographic Commerce', path: 'holographic-commerce', color: 'text-green-500' },
      { icon: Zap, label: 'Neural Bidding', path: 'neural-bidding', color: 'text-yellow-500' },
      { icon: Star, label: 'Quantum Collectibles', path: 'quantum-collectibles', color: 'text-pink-500' },
      { icon: Crown, label: 'Brand Hub', path: 'brand-hub', color: 'text-rose-500' },
      { icon: Star, label: 'Premium Services', path: 'premium-services', color: 'text-orange-500' },
      { icon: Gift, label: 'Exclusive Access', path: 'exclusive-access', color: 'text-emerald-500' },
      { icon: Crown, label: 'Luxury Experiences', path: 'luxury-experiences', color: 'text-violet-500' },
      { icon: TrendingUp, label: 'Smart Commerce', path: 'smart-commerce', color: 'text-slate-500' },
      { icon: Zap, label: 'Future Shopping', path: 'future-shopping', color: 'text-fuchsia-500' },
    ],
  },
  {
    title: 'More',
    icon: Eye,
    items: [
      { icon: Home, label: 'Home', path: 'home', color: 'text-foreground' },
      { icon: Eye, label: 'Recently Viewed', path: 'recently-viewed', color: 'text-slate-500' },
      { icon: GitCompare, label: 'Compare', path: 'compare', color: 'text-indigo-500' },
      { icon: Bell, label: 'Price Alerts', path: 'price-alerts', color: 'text-amber-500' },
      { icon: Settings, label: 'Settings', path: 'settings', color: 'text-muted-foreground' },
      { icon: Building2, label: 'About', path: 'about', color: 'text-foreground' },
      { icon: Shield, label: 'Privacy', path: 'privacy', color: 'text-muted-foreground' },
      { icon: FileText, label: 'Terms', path: 'terms', color: 'text-muted-foreground' },
    ],
  },
]

export function MegaMenu({ open, onOpenChange, menuItems }: MegaMenuProps) {
  const { recentSearches, clearRecentSearches, setSearchQuery } = useShopStore()
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)
  const {
    goHome, goDeals, goLuxury, goBrands, goCategory, goSearch,
    goAuctions, goSpinWin, goCollections,
    goBlog, goHelp, goReturns,
    goRewards, goGiftCards, goReferrals, goWallet,
    goProfile, goOrders, goWishlist, goSettings,
    goRecentlyViewed, goCompare, goPriceAlerts, goStores,
    goAbout, goContact, goPrivacy, goTerms,
    goVoucher, goVip, goLive, goReviews, goFaq, goTrack,
    router,
  } = useShopRouter()
  const [searchInput, setSearchInput] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Build flat searchable index from all menu sections + quick links + categories
  const allSearchableItems = [
    ...quickLinks.map((l, i) => ({ icon: l.icon, label: l.label, color: l.color, path: `quick:${l.path}`, section: 'Quick Links', uniqueKey: `quick-${i}-${l.path}` })),
    ...categoryLinks.map((c, i) => ({ icon: ChevronRight, label: c.label, color: 'text-primary', path: `cat:${c.slug}`, section: 'Categories', uniqueKey: `cat-${i}-${c.slug}` })),
    ...menuSections.flatMap((s, si) => s.items.map((item, ii) => ({ ...item, section: s.title, uniqueKey: `sec-${si}-${ii}-${item.path}` }))),
  ]

  const query = searchInput.trim().toLowerCase()
  const filteredItems = query.length >= 1
    ? allSearchableItems.filter(i => i.label.toLowerCase().includes(query) || i.section.toLowerCase().includes(query))
    : []
  const isSearching = query.length >= 1

  // Auto-focus input when menu opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
    else setSearchInput('')
  }, [open])

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onOpenChange(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onOpenChange])

  const navigateTo = (path: string) => {
    onOpenChange(false)
    switch (path) {
      case 'home': goHome(); break
      case 'categories': goCategory(); break
      case 'deals': goDeals(); break
      case 'luxury': goLuxury(); break
      case 'brands': goBrands(); break
      case 'new':
      case 'trending':
      case 'popular':
        goCategory(); break
      case 'auctions': goAuctions(); break
      case 'spin-win': goSpinWin(); break
      case 'collections': goCollections(); break
      case 'blog': goBlog(); break
      case 'help': goHelp(); break
      case 'returns': goReturns(); break
      case 'rewards': goRewards(); break
      case 'gift-cards': goGiftCards(); break
      case 'referrals': goReferrals(); break
      case 'wallet': goWallet(); break
      case 'profile': goProfile(); break
      case 'orders': goOrders(); break
      case 'wishlist': goWishlist(); break
      case 'settings': goSettings(); break
      case 'recently-viewed': goRecentlyViewed(); break
      case 'compare': goCompare(); break
      case 'price-alerts': goPriceAlerts(); break
      case 'stores': goStores(); break
      case 'about': goAbout(); break
      case 'contact': goContact(); break
      case 'privacy': goPrivacy(); break
      case 'terms': goTerms(); break
      case 'vip': goVip(); break
      case 'vouchers': goVoucher(); break
      case 'track-order': goTrack(); break
      case 'live-shopping': goLive(); break
      case 'reviews': goReviews(); break
      case 'faq': goFaq(); break
      // Revolutionary Features
      case 'neural-interface': router.push('/neural-interface'); break
      case 'personal-shopper': router.push('/personal-shopper'); break
      case 'ai-life-planning': router.push('/ai-life-planning'); break
      case 'emotional-truth': router.push('/emotional-truth'); break
      case 'reviews-2.0': router.push('/reviews-2.0'); break
      case 'neural-bidding': router.push('/neural-bidding'); break
      case 'trend-oracle': router.push('/trend-oracle'); break
      case 'social-influence': router.push('/social-influence'); break
      case 'quantum': router.push('/quantum'); break
      case 'quantum-collectibles': router.push('/quantum-collectibles'); break
      case 'quantum-teleportation': router.push('/quantum-teleportation'); break
      case 'time-travel': router.push('/time-travel'); break
      case 'brand-hub': router.push('/brand-hub'); break
      case 'beyond-commerce': router.push('/beyond-commerce'); break
      case 'dna-analysis': router.push('/dna-analysis'); break
      case 'bio-hacking': router.push('/bio-hacking'); break
      case 'bio-optimization': router.push('/bio-optimization'); break
      case 'dna-matching': router.push('/dna-matching'); break
      case 'health-monitoring': router.push('/health-monitoring'); break
      case 'genetic-enhancement': router.push('/genetic-enhancement'); break
      case 'holographic': router.push('/holographic'); break
      case 'digital-twin': router.push('/digital-twin'); break
      case 'virtual-showroom': router.push('/virtual-showroom'); break
      case 'holographic-commerce': router.push('/holographic-commerce'); break
      case 'reality-customization': router.push('/reality-customization'); break
      case 'metaverse-worlds': router.push('/metaverse-worlds'); break
      case 'ar-shopping': router.push('/ar-shopping'); break
      case '3d-product-view': router.push('/3d-product-view'); break
      case 'social-capital': router.push('/social-capital'); break
      case 'style-tribe': router.push('/style-tribe'); break
      case 'trend-council': router.push('/trend-council'); break
      case 'collective-shopping': router.push('/collective-shopping'); break
      case 'elite-trendsetting': router.push('/elite-trendsetting'); break
      case 'community-hub': router.push('/community-hub'); break
      case 'social-shopping': router.push('/social-shopping'); break
      case 'luxury-products': router.push('/luxury-products'); break
      case 'shopping-games': router.push('/shopping-games'); break
      case 'premium-services': router.push('/premium-services'); break
      case 'exclusive-access': router.push('/exclusive-access'); break
      case 'luxury-experiences': router.push('/luxury-experiences'); break
      case 'smart-commerce': router.push('/smart-commerce'); break
      case 'future-shopping': router.push('/future-shopping'); break
      default: break
    }
  }

  const handleQuickLink = (path: string) => {
    navigateTo(path)
  }

  const handleCategoryClick = (slug: string) => {
    onOpenChange(false)
    goCategory(undefined, slug)
  }

  const handleFilteredItemClick = (path: string) => {
    if (path.startsWith('cat:')) {
      handleCategoryClick(path.replace('cat:', ''))
    } else if (path.startsWith('quick:')) {
      navigateTo(path.replace('quick:', ''))
    } else {
      navigateTo(path)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
          />

          {/* Menu Panel - Full screen on mobile */}
          <motion.div
            ref={menuRef}
            className="fixed inset-x-0 top-0 z-50 max-h-screen overflow-y-auto bg-background sm:inset-x-auto sm:right-0 sm:top-14 sm:w-96 sm:max-h-[85vh] sm:rounded-b-2xl sm:border sm:border-border/50 sm:shadow-2xl"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Mobile Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/50 bg-background/95 px-4 py-3 backdrop-blur-lg sm:hidden">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
                  <span className="text-xs font-bold text-primary-foreground">G</span>
                </div>
                <span className="text-sm font-bold text-foreground">Quick Menu</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-4 space-y-5">
              {/* Menu Search filters sections/features, NOT products */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  placeholder="Find a feature or page..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setSearchInput('')
                    if (e.key === 'Enter' && filteredItems.length === 1) handleFilteredItemClick(filteredItems[0].path)
                  }}
                  className="bg-muted/50 pl-9 pr-9 h-10"
                />
                {searchInput && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                    onClick={() => setSearchInput('')}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              {/* Live filtered results */}
              {isSearching && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key="filtered"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                  >
                    {filteredItems.length === 0 ? (
                      <div className="flex flex-col items-center gap-1.5 py-6 text-center">
                        <Search className="h-8 w-8 text-muted-foreground/40" />
                        <p className="text-xs text-muted-foreground">No features found for &ldquo;{searchInput}&rdquo;</p>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}
                        </p>
                        {filteredItems.map((item) => {
                          const Icon = item.icon
                          return (
                            <button
                              key={item.uniqueKey}
                              onClick={() => handleFilteredItemClick(item.path)}
                              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary/5 active:scale-[0.98]"
                            >
                              <Icon className={`h-4 w-4 flex-shrink-0 ${item.color || 'text-muted-foreground'}`} />
                              <span className="flex-1 text-left">{item.label}</span>
                              <span className="text-[9px] text-muted-foreground bg-muted/60 rounded px-1.5 py-0.5">{item.section}</span>
                              <ChevronRight className="h-3 w-3 text-muted-foreground/50 flex-shrink-0" />
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}

              {/* Static content hidden while searching */}
              {!isSearching && <><div>
                <h4 className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Quick Links
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {quickLinks.map((link) => {
                    const Icon = link.icon
                    return (
                      <motion.button
                        key={link.label}
                        onClick={() => handleQuickLink(link.path)}
                        className="flex flex-col items-center gap-1.5 rounded-xl border border-border/30 bg-card p-3 transition-all hover:border-primary/20 hover:shadow-md active:scale-95"
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${link.bg}`}>
                          <Icon className={`h-4 w-4 ${link.color}`} />
                        </div>
                        <span className="text-[10px] font-medium text-foreground text-center leading-tight">
                          {link.label}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Revolutionary Features Section */}
              {menuItems && menuItems.length > 0 && (
                <div>
                  <Separator />
                  <div className="space-y-0.5">
                    {menuItems.map((item, index) => {
                      const ItemIcon = item.icon
                      const isExpanded = expandedMenu === item.label
                      
                      return (
                        <div key={index}>
                          <button
                            onClick={() => {
                              if (item.isExpandable) {
                                setExpandedMenu(isExpanded ? null : item.label)
                              } else {
                                item.action()
                                onOpenChange(false)
                              }
                            }}
                            className="flex items-center gap-2.5 w-full rounded-lg px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary/5 active:scale-[0.98]"
                          >
                            <ItemIcon className="h-4 w-4 text-primary" />
                            <span className="flex-1 text-left">{item.label}</span>
                            {item.badge && (
                              <Badge className="bg-primary/10 text-primary text-[8px] px-1.5 h-4">{item.badge}</Badge>
                            )}
                            {item.isExpandable && (
                              <ChevronRight className={`h-3 w-3 text-muted-foreground/50 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            )}
                          </button>
                          
                          {/* Expandable Sub-items */}
                          {item.isExpandable && item.subItems && isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="ml-6 mt-1 space-y-0.5"
                            >
                              {item.subItems.map((subItem, subIndex) => {
                                const SubIcon = subItem.icon
                                return (
                                  <button
                                    key={subIndex}
                                    onClick={() => {
                                      subItem.action()
                                      onOpenChange(false)
                                    }}
                                    className="flex items-center gap-2.5 w-full rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/5 active:scale-[0.98]"
                                  >
                                    <SubIcon className="h-3 w-3" />
                                    <span className="flex-1 text-left">{subItem.label}</span>
                                    <ChevronRight className="h-2.5 w-2.5 text-muted-foreground/30" />
                                  </button>
                                )
                              })}
                            </motion.div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Category Links */}
              <div>
                <h4 className="mb-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Categories
                </h4>
                <div className="grid grid-cols-2 gap-1.5">
                  {categoryLinks.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => handleCategoryClick(cat.slug)}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-primary/5 active:scale-[0.98]"
                    >
                      {cat.label}
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Full Navigation Sections */}
              {menuSections.map((section) => {
                const SectionIcon = section.icon
                return (
                  <div key={section.title}>
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <SectionIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {section.title}
                      </h4>
                    </div>
                    <div className="space-y-0.5">
                      {section.items.map((item, itemIndex) => {
                        const ItemIcon = item.icon
                        return (
                          <button
                            key={`${section.title}-${item.path}-${itemIndex}`}
                            onClick={() => navigateTo(item.path)}
                            className="flex items-center gap-2.5 w-full rounded-lg px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary/5 active:scale-[0.98]"
                          >
                            <ItemIcon className={`h-4 w-4 ${item.color || 'text-muted-foreground'}`} />
                            <span className="flex-1 text-left">{item.label}</span>
                            {item.badge && (
                              <Badge className="bg-primary/10 text-primary text-[8px] px-1.5 h-4">{item.badge}</Badge>
                            )}
                            <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {/* Promo Banner */}
              <div className="overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold text-foreground">Limited Offer</span>
                  <Badge className="bg-destructive/90 text-white text-[9px] px-1.5">-30%</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
                  Get 30% off your first purchase. Use code <span className="font-bold text-foreground">WELCOME30</span> at checkout.
                </p>
                <Button
                  size="sm"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-8"
                  onClick={() => {
                    onOpenChange(false)
                    goDeals()
                  }}
                >
                  Shop Deals
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
              </>}

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

