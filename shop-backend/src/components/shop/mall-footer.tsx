'use client'

import { motion } from 'framer-motion'
import { Mail, MapPin, Phone, Globe, Heart, ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useShopRouter } from '@/hooks/use-shop-router'

const footerLinks = {
  shop: [
    { label: 'All Products', route: 'goCategory' as const },
    { label: 'Featured', route: 'goCategory' as const },
    { label: 'New Arrivals', route: 'goCategory' as const },
    { label: 'Best Deals', route: 'goDeals' as const },
  ],
  services: [
    { label: 'Web Development', route: 'goCategory' as const, slug: 'websites' },
    { label: 'Mobile Apps', route: 'goCategory' as const, slug: 'mobile-apps' },
    { label: 'DevOps', route: 'goCategory' as const, slug: 'devops' },
    { label: 'UI/UX Design', route: 'goCategory' as const, slug: 'uiux-design' },
  ],
  support: [
    { label: 'Help Center', route: 'goContact' as const },
    { label: 'Contact Us', route: 'goContact' as const },
    { label: 'Privacy Policy', route: 'goPrivacy' as const },
    { label: 'Terms of Service', route: 'goTerms' as const },
  ],
}

export function MallFooter() {
  const router = useShopRouter()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFooterLink = (link: (typeof footerLinks)['shop'][number] | (typeof footerLinks)['services'][number] | (typeof footerLinks)['support'][number]) => {
    const method = router[link.route] as (...args: any[]) => void
    if (link.route === 'goCategory' && 'slug' in link && link.slug) {
      method(undefined, link.slug)
    } else {
      method()
    }
  }

  return (
    <footer className="border-t border-border/50 bg-card">
      {/* Back to Top */}
      <div className="flex justify-center -mt-4">
        <button
          onClick={scrollToTop}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border/50 bg-card text-muted-foreground shadow-sm transition-colors hover:text-primary active:scale-90"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </div>

      <div className="px-4 pb-6 pt-6">
        {/* Logo & Description */}
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">G</span>
            </div>
            <span className="text-lg font-bold text-foreground">
              Grapsee <span className="text-primary">Shop</span>
            </span>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground max-w-[280px]">
            Your premium digital shopping mall. Websites, apps, DevOps & design solutions crafted by world-class engineers.
          </p>
        </div>

        {/* Links Grid */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-foreground">
                {section}
              </h4>
              <ul className="space-y-1.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => handleFooterLink(link)}
                      className="text-[11px] text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="mb-6 rounded-xl border border-border/50 bg-background/50 p-3">
          <h4 className="mb-2 text-xs font-bold text-foreground">Get in Touch</h4>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Mail className="h-3 w-3 text-primary" />
              hello@grapsee.shop
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Phone className="h-3 w-3 text-primary" />
              +1 (555) 000-0000
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Globe className="h-3 w-3 text-primary" />
              captainpiracy.shop
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-4 flex items-center justify-center gap-2">
          {['', '', '', ''].map((emoji, i) => (
            <div
              key={i}
              className="flex h-8 w-12 items-center justify-center rounded-md border border-border/50 bg-background/50 text-sm"
            >
              {emoji}
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-[10px] text-muted-foreground">
            Made with <Heart className="inline h-2.5 w-2.5 text-red-500" /> by Grapsee Team
          </p>
          <p className="text-[10px] text-muted-foreground">
            &copy; {new Date().getFullYear()} Grapsee Shop. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
