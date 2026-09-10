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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'

interface MegaMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
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

export function MegaMenu({ open, onOpenChange }: MegaMenuProps) {
  const { recentSearches, clearRecentSearches, setSearchQuery } = useShopStore()
  const {
    goHome, goDeals, goLuxury, goBrands, goCategory, goSearch,
    goAuctions, goSpinWin, goCollections,
    goBlog, goHelp, goReturns,
    goRewards, goGiftCards, goReferrals, goWallet,
    goProfile, goOrders, goWishlist, goSettings,
    goRecentlyViewed, goCompare, goPriceAlerts, goStores,
    goAbout, goContact, goPrivacy, goTerms,
    goVoucher, goVip, goLive, goReviews, goFaq, goTrack,
  } = useShopRouter()
  const [searchInput, setSearchInput] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)

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

  const handleSearch = () => {
    if (searchInput.trim()) {
      setSearchQuery(searchInput)
      onOpenChange(false)
      goSearch()
    }
  }

  const handleRecentSearch = (query: string) => {
    setSearchQuery(query)
    onOpenChange(false)
    goSearch()
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
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Quick search..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="bg-muted/50 pl-9 pr-9 h-10"
                />
                {searchInput && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                    onClick={handleSearch}
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              {/* Quick Links Grid */}
              <div>
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
                      {section.items.map((item) => {
                        const ItemIcon = item.icon
                        return (
                          <button
                            key={item.path}
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

              {/* Support Chat Toggle */}
              <div>
                <button
                  onClick={() => {
                    onOpenChange(false)
                    // Dispatch custom event to open support chat
                    window.dispatchEvent(new CustomEvent('open-support-chat'))
                  }}
                  className="flex items-center gap-2.5 w-full rounded-lg bg-primary/5 border border-primary/10 px-3 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/10 active:scale-[0.98]"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="flex-1 text-left">Support Chat</span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-emerald-500">Online</span>
                  </span>
                </button>
              </div>

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

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <Clock className="mr-1 inline h-3 w-3" />
                      Recent Searches
                    </h4>
                    <button
                      onClick={clearRecentSearches}
                      className="text-[10px] text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.slice(0, 6).map((query) => (
                      <button
                        key={query}
                        onClick={() => handleRecentSearch(query)}
                        className="rounded-full bg-muted/50 px-2.5 py-1 text-[10px] font-medium text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                      >
                        {query}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
