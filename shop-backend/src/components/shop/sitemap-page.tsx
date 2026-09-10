'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Map, Search, ShoppingBag, User, Heart, Package, CreditCard, HelpCircle, FileText, Shield, Star, Tag, Gift, Bell, Settings, Store, Camera, BookOpen, Truck, Award, Users, Sparkles, Moon, Megaphone, Calculator, Grid3X3 as Config } from 'lucide-react'
import { useShopRouter } from '@/hooks/use-shop-router'

interface SitemapEntry {
  name: string
  path: string
  icon: React.ElementType
  category: string
}

const sitemapEntries: SitemapEntry[] = [
  // Shopping
  { name: 'Home', path: '/', icon: ShoppingBag, category: 'Shopping' },
  { name: 'Categories', path: '/category', icon: Config, category: 'Shopping' },
  { name: 'Flash Sale', path: '/flash-sale', icon: Tag, category: 'Shopping' },
  { name: 'Deals', path: '/deals', icon: Tag, category: 'Shopping' },
  { name: 'Luxury Zone', path: '/luxury', icon: Star, category: 'Shopping' },
  { name: 'Brands', path: '/brands', icon: Award, category: 'Shopping' },
  { name: 'New Arrivals', path: '/search?filter=new', icon: Sparkles, category: 'Shopping' },
  { name: 'Collections', path: '/collections', icon: Package, category: 'Shopping' },
  { name: 'Product Videos', path: '/product-videos', icon: Camera, category: 'Shopping' },
  { name: 'Product Quiz', path: '/product-quiz', icon: HelpCircle, category: 'Shopping' },
  { name: 'Outfit Maker', path: '/outfit-maker', icon: Users, category: 'Shopping' },
  { name: 'Product Configurator', path: '/product-configurator', icon: Config, category: 'Shopping' },
  { name: 'Compare Products', path: '/compare', icon: Package, category: 'Shopping' },
  { name: 'Recently Viewed', path: '/recently-viewed', icon: ShoppingBag, category: 'Shopping' },
  // Deals & Savings
  { name: 'Coupons & Vouchers', path: '/voucher', icon: Tag, category: 'Deals & Savings' },
  { name: 'Spin & Win', path: '/spin-win', icon: Gift, category: 'Deals & Savings' },
  { name: 'Group Buy', path: '/group-buy', icon: Users, category: 'Deals & Savings' },
  { name: 'Price Drop Alerts', path: '/price-drop', icon: Bell, category: 'Deals & Savings' },
  { name: 'Price Match', path: '/price-match', icon: Shield, category: 'Deals & Savings' },
  { name: 'Price Guarantee', path: '/price-guarantee', icon: Shield, category: 'Deals & Savings' },
  { name: 'Price Alerts', path: '/price-alerts', icon: Bell, category: 'Deals & Savings' },
  { name: 'Deal Calendar', path: '/deal-calendar', icon: Tag, category: 'Deals & Savings' },
  { name: 'Mystery Box', path: '/mystery-box', icon: Gift, category: 'Deals & Savings' },
  { name: 'Mystery Reward', path: '/mystery-reward', icon: Gift, category: 'Deals & Savings' },
  { name: 'Bundles', path: '/bundles', icon: Package, category: 'Deals & Savings' },
  { name: 'Seasonal', path: '/seasonal', icon: Sparkles, category: 'Deals & Savings' },
  { name: 'Dark Store', path: '/dark-store', icon: Moon, category: 'Deals & Savings' },
  { name: 'Preorder', path: '/preorder', icon: Package, category: 'Deals & Savings' },
  // Services
  { name: 'Installments', path: '/installment', icon: CreditCard, category: 'Services' },
  { name: 'Trade-In', path: '/trade-in', icon: Package, category: 'Services' },
  { name: 'Try Before Buy', path: '/try-before-buy', icon: ShoppingBag, category: 'Services' },
  { name: 'Gift Wrapping', path: '/gift-wrapping', icon: Gift, category: 'Services' },
  { name: 'Warranty Center', path: '/warranty-center', icon: Shield, category: 'Services' },
  { name: 'Rental', path: '/rental', icon: Package, category: 'Services' },
  { name: 'Gift Cards', path: '/gift-cards', icon: Gift, category: 'Services' },
  { name: 'Gift Registry', path: '/gift-registry', icon: Gift, category: 'Services' },
  { name: 'Student Discount', path: '/student-discount', icon: Users, category: 'Services' },
  { name: 'Shipping Calculator', path: '/shipping-calculator', icon: Calculator, category: 'Services' },
  { name: 'Store Pickup', path: '/store-pickup', icon: Store, category: 'Services' },
  { name: 'Loyalty Calculator', path: '/loyalty-calculator', icon: Calculator, category: 'Services' },
  // Account & Orders
  { name: 'Profile', path: '/profile', icon: User, category: 'Account & Orders' },
  { name: 'My Orders', path: '/orders', icon: Package, category: 'Account & Orders' },
  { name: 'Track Order', path: '/track', icon: Truck, category: 'Account & Orders' },
  { name: 'Wishlist', path: '/wishlist', icon: Heart, category: 'Account & Orders' },
  { name: 'Wishboard', path: '/wishboard', icon: Heart, category: 'Account & Orders' },
  { name: 'Cart', path: '/cart', icon: ShoppingBag, category: 'Account & Orders' },
  { name: 'Checkout', path: '/checkout', icon: CreditCard, category: 'Account & Orders' },
  { name: 'Wallet', path: '/wallet', icon: CreditCard, category: 'Account & Orders' },
  { name: 'Rewards', path: '/rewards', icon: Star, category: 'Account & Orders' },
  { name: 'VIP Club', path: '/vip', icon: Award, category: 'Account & Orders' },
  { name: 'Loyalty Mall', path: '/loyalty-mall', icon: Star, category: 'Account & Orders' },
  { name: 'Returns', path: '/returns', icon: Package, category: 'Account & Orders' },
  { name: 'Notifications', path: '/notifications', icon: Bell, category: 'Account & Orders' },
  { name: 'Settings', path: '/settings', icon: Settings, category: 'Account & Orders' },
  { name: 'Stock Notifications', path: '/stock-notifications', icon: Bell, category: 'Account & Orders' },
  // Community
  { name: 'Community', path: '/community', icon: Users, category: 'Community' },
  { name: 'Customer Photos', path: '/customer-photos', icon: Camera, category: 'Community' },
  { name: 'Reviews', path: '/reviews', icon: Star, category: 'Community' },
  { name: 'Review Megaphone', path: '/review-megaphone', icon: Megaphone, category: 'Community' },
  { name: 'Blog', path: '/blog', icon: BookOpen, category: 'Community' },
  { name: 'Live Shopping', path: '/live', icon: Camera, category: 'Community' },
  { name: 'Charity Shop', path: '/charity-shop', icon: Heart, category: 'Community' },
  { name: 'Eco Shop', path: '/eco-shop', icon: Sparkles, category: 'Community' },
  { name: 'Affiliate Program', path: '/affiliate', icon: Users, category: 'Community' },
  { name: 'Referrals', path: '/referrals', icon: Users, category: 'Community' },
  { name: 'Seller Center', path: '/seller-center', icon: Store, category: 'Community' },
  { name: 'Seller Onboarding', path: '/seller-onboarding', icon: Store, category: 'Community' },
  // Help & Support
  { name: 'Help Center', path: '/help', icon: HelpCircle, category: 'Help & Support' },
  { name: 'FAQ', path: '/faq', icon: HelpCircle, category: 'Help & Support' },
  { name: 'Contact Us', path: '/contact', icon: Users, category: 'Help & Support' },
  { name: 'Store Locations', path: '/stores', icon: Map, category: 'Help & Support' },
  // Legal
  { name: 'About Us', path: '/about', icon: Users, category: 'Legal' },
  { name: 'Privacy Policy', path: '/privacy', icon: FileText, category: 'Legal' },
  { name: 'Terms of Service', path: '/terms', icon: FileText, category: 'Legal' },
  { name: 'Cookie Policy', path: '/cookies', icon: Shield, category: 'Legal' },
  { name: 'Accessibility', path: '/accessibility', icon: Users, category: 'Legal' },
  { name: 'Age Verification', path: '/verify-age', icon: Shield, category: 'Legal' },
  { name: 'Style Guide', path: '/style-guide', icon: BookOpen, category: 'Legal' },
]

const categoryOrder = ['Shopping', 'Deals & Savings', 'Services', 'Account & Orders', 'Community', 'Help & Support', 'Legal']

export function SitemapPage() {
  const router = useShopRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return sitemapEntries
    const q = searchQuery.toLowerCase()
    return sitemapEntries.filter(e => e.name.toLowerCase().includes(q) || e.category.toLowerCase().includes(q))
  }, [searchQuery])

  const grouped = useMemo(() => {
    const groups: Record<string, SitemapEntry[]> = {}
    categoryOrder.forEach(cat => { groups[cat] = [] })
    filteredEntries.forEach(e => {
      if (!groups[e.category]) groups[e.category] = []
      groups[e.category].push(e)
    })
    return groups
  }, [filteredEntries])

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Map className="h-5 w-5 text-primary" />
          Sitemap
        </h1>
        <p className="text-sm text-muted-foreground mt-1">All pages on Grapsee Shop</p>
      </div>

      {/* Search */}
      <div className="px-4 py-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-card border border-border pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-2">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{filteredEntries.length} pages</span>
          <span></span>
          <span>{categoryOrder.length} categories</span>
        </div>
      </div>

      {/* Grouped Pages */}
      <div className="px-4 py-2 space-y-5">
        {categoryOrder.map(category => {
          const entries = grouped[category]
          if (!entries || entries.length === 0) return null
          return (
            <motion.div key={category} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                <div className="h-1 w-4 rounded-full bg-primary" />
                {category}
                <span className="text-[10px] text-muted-foreground font-normal">({entries.length})</span>
              </h2>
              <div className="space-y-1">
                {entries.map(entry => (
                  <button
                    key={entry.path}
                    onClick={() => router.goHome()}
                    className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all hover:bg-card active:scale-[0.99]"
                  >
                    <entry.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm text-foreground">{entry.name}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground">{entry.path}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
