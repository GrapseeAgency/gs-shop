'use client'

import { motion } from 'framer-motion'
import { Map, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useShopRouter } from '@/hooks/use-shop-router'

const sections = [
  { title: 'Shop', links: [{ label: 'Home', href: '/' }, { label: 'All Categories', href: '/category' }, { label: 'Flash Deals', href: '/deals' }, { label: 'New Arrivals', href: '/new' }, { label: 'Luxury Zone', href: '/luxury' }] },
  { title: 'Account', links: [{ label: 'Profile', href: '/profile' }, { label: 'My Orders', href: '/orders' }, { label: 'Wishlist', href: '/wishlist' }, { label: 'Wallet', href: '/wallet' }, { label: 'Settings', href: '/settings' }] },
  { title: 'Features', links: [{ label: 'Rewards', href: '/rewards' }, { label: 'Gift Cards', href: '/gift-cards' }, { label: 'Auctions', href: '/auctions' }, { label: 'Spin & Win', href: '/spin-win' }, { label: 'Referrals', href: '/referrals' }] },
  { title: 'Help', links: [{ label: 'Help Center', href: '/help' }, { label: 'Contact', href: '/contact' }, { label: 'Returns', href: '/returns' }, { label: 'Track Order', href: '/track' }, { label: 'FAQ', href: '/faq' }] },
  { title: 'Company', links: [{ label: 'About', href: '/about' }, { label: 'Blog', href: '/blog' }, { label: 'Stores', href: '/stores' }, { label: 'Privacy Policy', href: '/privacy' }, { label: 'Terms', href: '/terms' }] },
]

export function SitemapPage() {
  const { goBack } = useShopRouter()
  return (
    <motion.div className="px-4 py-6 pb-20" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={goBack}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="text-lg font-bold text-foreground flex items-center gap-2"><Map className="h-5 w-5 text-primary" />Sitemap</h1>
      </div>
      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{section.title}</h2>
            <div className="grid grid-cols-2 gap-1.5">
              {section.links.map((link) => (
                <a key={link.href} href={link.href} className="text-sm text-foreground hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-primary/5 border border-border/30">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

