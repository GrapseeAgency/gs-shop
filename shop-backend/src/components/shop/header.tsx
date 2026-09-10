'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ShoppingCart, Menu, X, Grid3X3, Tag, Gift, Crown, Info, Clock, GitCompare, Users, MapPin, Bell, Wallet, Gavel, PartyPopper, LayoutGrid, BookOpen, HelpCircle, RotateCcw, Ticket, Radio, Star, LogIn, LogOut, User, Settings, Package, Sparkles, DollarSign, ChefHat, Scan, Pill, Cat, Wrench, CreditCard, Receipt, Car, FileText, Truck, GraduationCap, Activity, ScanBarcode, Calculator, Video, Layout, Palette, Code, Play, Wand2, RefreshCw, Terminal, Database, Award, Scale, FormInput, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { NotificationsCenter } from '@/components/shop/notifications-center'
import { MegaMenu } from '@/components/shop/mega-menu'
import { useSession, signOut } from 'next-auth/react'
import { LanguageSwitcher } from '@/components/shop/language-switcher'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export function Header() {
  const { setCartOpen, getCartCount } = useShopStore()
  const { goCategory, goDeals, goRewards, goAbout, goHome, goSearch, goLuxury, goRecentlyViewed, goCompare, goGiftCards, goReferrals, goStores, goPriceAlerts, goWallet, goAuctions, goSpinWin, goCollections, goBlog, goHelp, goReturns, goTrack, goVoucher, goVip, goFaq, goLive, goReviews, goProfile, goOrders, goSettings, goFeatures, goPriceDropRefund, goAutoCoupon, goRecipeToCart, goIngredientScanner, goMedicineTracker, goPetSupplies, goApplianceRepair, goSubscriptionAudit, goTaxRefund, goVehicleService, goDocumentExpiry, goMovingKit, goSchoolSupplies, goDiabeticScanner, goHalalChecker, goUnitPriceCalculator, goCrowdWisdom, goVideoVerification, goTemplates, goUIKits, goSnippets, goGuides, goCourses, goAITools, goAudits, goBundles, goSubscriptions, goDigitalProducts, goCertifications, goEnvSetup, goDatabaseSchemas, goCICD, goNotionTemplates, goShortTutorials, goResumeBuilder, goLegalDocuments, goFormBuilder, goScheduler } = useShopRouter()
  const cartCount = getCartCount()
  const { compareList } = useShopStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const { data: session, status } = useSession()

  const menuItems = [
    { icon: Sparkles, label: ' All 334+ Features', action: () => goFeatures(), badge: 'NEW' },
    { icon: Grid3X3, label: 'All Categories', action: () => goCategory() },
    { icon: Tag, label: 'Flash Deals', action: () => goDeals() },
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
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-4">
          {/* Left: Menu + Logo */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMegaMenuOpen(true)}
              className="text-muted-foreground hover:text-foreground -ml-2"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
            <button
              onClick={() => goHome()}
              className="flex items-center gap-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-md shadow-primary/25">
                <span className="text-sm font-bold text-primary-foreground">G</span>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-foreground leading-none">
                  Grapsee <span className="text-primary">Shop</span>
                </span>
                <span className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">
                  Digital Mall
                </span>
              </div>
            </button>
          </div>

          {/* Right: Search + Notifications + Auth + Cart */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => goSearch()}
              className="text-muted-foreground hover:text-foreground"
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>

            <LanguageSwitcher compact />

            <NotificationsCenter />

            {/* User Auth */}
            {status === 'authenticated' && session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 border border-primary/20 overflow-hidden transition-all active:scale-95">
                    {session.user.image ? (
                      <img src={session.user.image} alt={session.user.name || ''} className="h-8 w-8 object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-primary">
                        {session.user.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-3 py-2 border-b border-border/50">
                    <p className="text-sm font-semibold text-foreground truncate">{session.user.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{session.user.email}</p>
                  </div>
                  <DropdownMenuItem onClick={() => goProfile()} className="gap-2 cursor-pointer">
                    <User className="h-4 w-4" /> My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => goOrders()} className="gap-2 cursor-pointer">
                    <Package className="h-4 w-4" /> My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => goSettings()} className="gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => goProfile()}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCartOpen(true)}
              className="relative text-muted-foreground hover:text-foreground"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary p-0 text-[10px] font-bold text-primary-foreground shadow-sm">
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

      {/* Side Menu Overlay (legacy - kept for backward compat) */}
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
              className="fixed left-0 top-0 z-50 h-full w-72 bg-background border-r border-border/50 shadow-2xl"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Menu Header */}
              <div className="flex items-center justify-between border-b border-border/50 px-4 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-md shadow-primary/25">
                    <span className="text-base font-bold text-primary-foreground">G</span>
                  </div>
                  <div>
                    <span className="text-sm font-bold text-foreground">Grapsee Shop</span>
                    <p className="text-[9px] text-muted-foreground">Your Digital Mall</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMenuOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Menu Items */}
              <div className="p-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Browse
                </p>
                <div className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.label}
                        onClick={() => {
                          item.action()
                          setMenuOpen(false)
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-primary/5 active:scale-[0.98]"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        {item.label}
                      </button>
                    )
                  })}
                </div>

                {/* Promo Card */}
                <div className="mt-6 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-4">
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
