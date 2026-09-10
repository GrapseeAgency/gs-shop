'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ShoppingCart, Menu, X, Grid3X3, Tag, Gift, Crown, Info, Clock, GitCompare, Users, MapPin, Bell, Wallet, Gavel, PartyPopper, LayoutGrid, BookOpen, HelpCircle, RotateCcw, Ticket, Radio, Star, LogIn, LogOut, User, Settings, Package, Sparkles, DollarSign, ChefHat, Scan, Pill, Cat, Wrench, CreditCard, Receipt, Car, FileText, Truck, GraduationCap, Activity, ScanBarcode, Calculator, Video, Layout, Palette, Code, Play, Wand2, RefreshCw, Terminal, Database, Award, Scale, FormInput, Calendar, ChevronDown, Brain, Atom, Heart, TrendingUp, Shield, MessageCircle, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { NotificationsCenter } from '@/components/shop/notifications-center'
import { MegaMenu } from '@/components/shop/mega-menu'
import { useSession, signOut } from 'next-auth/react'
import { LanguageSwitcher } from '@/components/shop/language-switcher'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { DynamicPlacement } from '@/components/shop/dynamic-placement'

export function Header() {
  const { setCartOpen, getCartCount } = useShopStore()
  const {
    goCategory, goDeals, goRewards, goAbout, goHome, goSearch, goLuxury,
    goRecentlyViewed, goCompare, goGiftCards, goReferrals, goStores,
    goPriceAlerts, goWallet, goAuctions, goSpinWin, goCollections, goBlog,
    goHelp, goReturns, goTrack, goVoucher, goVip, goFaq, goLive, goReviews,
    goProfile, goOrders, goSettings, goFeatures, goPriceDropRefund,
    goAutoCoupon, goRecipeToCart, goIngredientScanner, goMedicineTracker,
    goPetSupplies, goApplianceRepair, goSubscriptionAudit, goTaxRefund,
    goVehicleService, goDocumentExpiry, goMovingKit, goSchoolSupplies,
    goDiabeticScanner, goHalalChecker, goUnitPriceCalculator, goCrowdWisdom,
    goVideoVerification, goTemplates, goUIKits, goSnippets, goGuides,
    goCourses, goAITools, goAudits, goBundles, goSubscriptions,
    goDigitalProducts, goCertifications, goEnvSetup, goDatabaseSchemas,
    goCICD, goNotionTemplates, goShortTutorials, goResumeBuilder,
    goLegalDocuments, goFormBuilder, goScheduler, goEvents
  } = useShopRouter()

  const cartCount = getCartCount()
  const { compareList } = useShopStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null)
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const menuItems = [
    { icon: Sparkles, label: ' All 334+ Features', action: () => goFeatures(), badge: 'NEW' },
    { icon: Grid3X3, label: 'All Categories', action: () => goCategory() },
    { icon: Tag, label: 'Flash Deals', action: () => goDeals() },
    { icon: Calendar, label: 'Community Events', action: () => goEvents(), badge: 'NEW' },
    { icon: Crown, label: 'Admin Portal', action: () => window.open('https://grapsee.com/admin/shop', '_blank'), badge: 'ADMIN' },
    { icon: Crown, label: 'Premium Zone', action: () => goLuxury() },
    { icon: DollarSign, label: 'Price Drop Refund', action: () => goPriceDropRefund(), badge: 'SAVE' },
    { icon: Ticket, label: 'Auto Coupons', action: () => goAutoCoupon(), badge: 'SAVE' },
    { icon: ChefHat, label: 'Recipe to Cart', action: () => goRecipeToCart(), badge: 'NEW' },
    { icon: Scan, label: 'Ingredient Scanner', action: () => goIngredientScanner(), badge: 'SAFE' },
    { icon: Pill, label: 'Medicine Tracker', action: () => goMedicineTracker(), badge: 'HEALTH' },
    { icon: Cat, label: 'Pet Supplies', action: () => goPetSupplies() },
    { icon: Wrench, label: 'Appliance Repair', action: () => goApplianceRepair(), badge: 'HOME' },
    { icon: CreditCard, label: 'Subscription Audit', action: () => goSubscriptionAudit(), badge: 'SAVE' },
    { icon: Receipt, label: 'Tax Refund', action: () => goTaxRefund(), badge: 'SAVE' },
    { icon: Car, label: 'Vehicle Service', action: () => goVehicleService() },
    { icon: FileText, label: 'Document Tracker', action: () => goDocumentExpiry() },
    { icon: Truck, label: 'Moving Kit', action: () => goMovingKit() },
    { icon: GraduationCap, label: 'School Supplies', action: () => goSchoolSupplies() },
    { icon: Activity, label: 'Diabetic Scanner', action: () => goDiabeticScanner(), badge: 'HEALTH' },
    { icon: ScanBarcode, label: 'Halal Checker', action: () => goHalalChecker() },
    { icon: Calculator, label: 'Unit Price Calculator', action: () => goUnitPriceCalculator() },
    { icon: Users, label: 'Crowd Wisdom', action: () => goCrowdWisdom() },
    { icon: Video, label: 'Video Verification', action: () => goVideoVerification() },
    { icon: Gift, label: 'Rewards', action: () => goRewards() },
    { icon: Clock, label: 'Recently Viewed', action: () => goRecentlyViewed() },
    { icon: GitCompare, label: `Compare${compareList.length > 0 ? ` (${compareList.length})` : ''}`, action: () => goCompare() },
    { icon: Info, label: 'About', action: () => goAbout() },
    { icon: Gift, label: 'Gift Cards', action: () => goGiftCards() },
    { icon: Users, label: 'Referrals', action: () => goReferrals() },
    { icon: MapPin, label: 'Stores', action: () => goStores() },
    { icon: Bell, label: 'Alerts', action: () => goPriceAlerts() },
    { icon: Wallet, label: 'Wallet', action: () => goWallet() },
    { icon: Gavel, label: 'Auctions', action: () => goAuctions() },
    { icon: PartyPopper, label: 'Spin & Win', action: () => goSpinWin() },
    { icon: LayoutGrid, label: 'Collections', action: () => goCollections() },
    { icon: BookOpen, label: 'Blog', action: () => goBlog() },
    { icon: HelpCircle, label: 'Help Center', action: () => goHelp() },
    { icon: RotateCcw, label: 'Returns', action: () => goReturns() },
    { icon: MapPin, label: 'Track Order', action: () => goTrack() },
    { icon: Ticket, label: 'Vouchers', action: () => goVoucher() },
    { icon: Crown, label: 'VIP', action: () => goVip() },
    { icon: Radio, label: 'Live Shopping', action: () => goLive() },
    { icon: Star, label: 'Reviews', action: () => goReviews() },
    { icon: HelpCircle, label: 'FAQ', action: () => goFaq() },
    { icon: Layout, label: 'Templates', action: () => goTemplates(), badge: 'DIGITAL' },
    { icon: Palette, label: 'UI Kits', action: () => goUIKits(), badge: 'DESIGN' },
    { icon: Code, label: 'Code Snippets', action: () => goSnippets(), badge: 'DEV' },
    { icon: BookOpen, label: 'Guides', action: () => goGuides(), badge: 'LEARN' },
    { icon: Play, label: 'Courses', action: () => goCourses(), badge: 'VIDEO' },
    { icon: Wand2, label: 'AI Tools', action: () => goAITools(), badge: 'AI' },
    { icon: RefreshCw, label: 'Subscriptions', action: () => goSubscriptions(), badge: 'PRO' },
    { icon: Terminal, label: 'Dev Tools', action: () => goEnvSetup(), badge: 'DEV' },
    { icon: Database, label: 'Database Schemas', action: () => goDatabaseSchemas(), badge: 'DB' },
    { icon: Award, label: 'Certifications', action: () => goCertifications(), badge: 'CERT' },
    { icon: FileText, label: 'Resume Builder', action: () => goResumeBuilder(), badge: 'NEW' },
    { icon: Scale, label: 'Legal Docs', action: () => goLegalDocuments(), badge: 'NEW' },
    { icon: FormInput, label: 'Form Builder', action: () => goFormBuilder(), badge: 'NEW' },
    { icon: Calendar, label: 'Scheduler', action: () => goScheduler(), badge: 'NEW' },
  ]

  return (
    <>
      <DynamicPlacement zone="global-announcement" />
      <header className="sticky top-0 z-40 glass backdrop-blur-xl shadow-lg shadow-primary/5 transition-all duration-300">
        <div className="absolute bottom-0 left-0 right-0 h-[2px] liquid-glow opacity-80" />
        <div className="flex h-14 min-w-0 items-center justify-between gap-2 px-3 md:px-8">

          {/* Left: Menu + Logo */}
          <div className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMegaMenuOpen(true)}
              className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground hover:bg-primary/5 rounded-full transition-colors"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
            <button
              onClick={() => goHome()}
              className="flex items-center gap-1 whitespace-nowrap py-1 group"
            >
              <div className="flex flex-col items-start justify-center">
                <span className="text-base font-extrabold leading-none tracking-tight text-foreground flex items-center">
                  GS&nbsp;<span className="text-gradient-animated font-black">Shop</span>
                </span>
                <span className="text-[9px] font-medium leading-none tracking-[0.15em] text-muted-foreground uppercase mt-[3px] group-hover:text-primary transition-colors">
                  Digital Mall
                </span>
              </div>
              <motion.span suppressHydrationWarning={true}
                className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow self-start mt-1.5"
                animate={{ scale: [1, 1.3, 1], y: [0, -1, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </button>
          </div>

          {/* Right: Search + Notifications + Auth + Cart */}
          <div className="flex shrink-0 items-center gap-0.5">

            <Button
              variant="ghost"
              size="icon"
              onClick={() => goSearch()}
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
            >
              <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="sr-only">Search</span>
            </Button>

            <NotificationsCenter />

            {/* User Auth */}
            {status === 'authenticated' && session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 overflow-hidden transition-all active:scale-95">
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || ''}
                        className="h-8 w-8 object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold text-primary">
                        {session.user.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="w-44 sm:w-48"
                >
                  <div className="px-2 py-1.5 border-b border-border/50">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {session.user.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {session.user.email}
                    </p>
                  </div>
                  <DropdownMenuItem
                    onClick={() => goProfile()}
                    className="gap-2 cursor-pointer text-sm"
                  >
                    <User className="h-4 w-4 shrink-0" /> My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => goOrders()}
                    className="gap-2 cursor-pointer text-sm"
                  >
                    <Package className="h-4 w-4 shrink-0" /> My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => goSettings()}
                    className="gap-2 cursor-pointer text-sm"
                  >
                    <Settings className="h-4 w-4 shrink-0" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => window.open('https://grapsee.com/admin/shop', '_blank')}
                    className="gap-2 cursor-pointer text-sm text-violet-500 font-semibold"
                  >
                    <Crown className="h-4 w-4 shrink-0" /> Admin Portal
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="gap-2 cursor-pointer text-sm text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4 shrink-0" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => goProfile()}
                className="h-9 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <LogIn className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            )}

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCartOpen(true)}
              className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
            >
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
              {mounted && cartCount > 0 && (
                <Badge className="absolute -right-1 -top-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-primary p-0 text-[9px] sm:text-[10px] font-bold text-primary-foreground shadow-sm">
                  {cartCount > 99 ? '99+' : cartCount}
                </Badge>
              )}
              <span className="sr-only">Cart</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mega Menu */}
      <MegaMenu open={megaMenuOpen} onOpenChange={setMegaMenuOpen} />

      {/* Side Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              className="fixed left-0 top-0 z-50 flex h-full w-[85vw] max-w-xs flex-col bg-background border-r border-border/50 shadow-2xl"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Menu Header */}
              <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
                <div>
                  <span className="text-sm font-bold text-foreground">GS Shop</span>
                  <p className="text-[9px] text-muted-foreground">Your Digital Mall</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMenuOpen(false)}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Menu Items scrollable */}
              <div className="flex-1 overflow-y-auto overscroll-contain p-3">
                <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Browse
                </p>
                <div className="space-y-0.5">
                  {menuItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.label}
                        onClick={() => {
                          item.action()
                          setMenuOpen(false)
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-primary/5 active:scale-[0.98] active:bg-primary/10"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Promo Card */}
                <div className="mt-4 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-foreground">Premium Member</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-3">
                    Join our rewards program and save up to 20% on every order.
                  </p>
                  <Button
                    size="sm"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                    onClick={() => {
                      goRewards()
                      setMenuOpen(false)
                    }}
                  >
                    Join Now
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
