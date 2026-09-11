'use client'

import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { ArrowUp, ExternalLink } from 'lucide-react'

/* Link Definitions */
const footerLinks = {
  SHOP: [
    { label: 'All Products',  href: 'https://grapsee.com/shop' },
    { label: 'Featured',      href: 'https://grapsee.com/shop/featured' },
    { label: 'New Arrivals',  href: 'https://grapsee.com/shop/new-arrivals' },
    { label: 'Best Deals',    href: 'https://grapsee.com/shop/deals' },
  ],
  SERVICES: [
    { label: 'Web Development', href: 'https://grapsee.com/services' },
    { label: 'Mobile Apps',     href: 'https://grapsee.com/services' },
    { label: 'DevOps',          href: 'https://grapsee.com/services' },
    { label: 'UI/UX Design',    href: 'https://grapsee.com/services' },
  ],
  SUPPORT: [
    { label: 'Help Center',       href: 'https://grapsee.com/shop/help' },
    { label: 'Contact Us',        href: 'https://grapsee.com/shop/contact' },
    { label: 'Privacy Policy',    href: 'https://grapsee.com/shop/privacy-policy' },
    { label: 'Terms of Service',  href: 'https://grapsee.com/shop/terms-of-service' },
  ],
  'OUR PRODUCTS': [
    { label: 'Anuxeve',         href: 'https://grapsee.com/products/anuxeve' },
    { label: 'GS Shop',         href: 'https://grapsee.com/shop' },
    { label: 'Multi GS Agent',  href: 'https://grapsee.com/products/multi-gs-agent' },
    { label: 'TaskBar-Reborn',  href: 'https://grapsee.com/products/taskbar-reborn' },
    { label: 'GS Console',      href: 'https://grapsee.com/products/gs-console' },
  ],
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

export function MallFooter() {
  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer className="relative border-t border-primary/10 overflow-hidden relative z-10">
      {/* Ambient liquid backdrop */}
      <div className="absolute inset-0 -z-10 liquid-scene opacity-25" />
      <div className="absolute inset-0 -z-10 liquid-aurora opacity-10" />
      <div className="absolute -left-12 -top-12 h-32 w-32 rounded-full liquid-blob opacity-20 pointer-events-none -z-10" />
      <div className="absolute right-10 bottom-0 h-24 w-24 rounded-full liquid-blob-accent opacity-15 pointer-events-none -z-10" />

      {/* Back-to-Top pill */}
      <div className="flex justify-center -mt-4 relative z-10">
        <motion.button
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.92 }}
          onClick={scrollToTop}
          aria-label="Back to top"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/25 bg-card/85 backdrop-blur-md text-primary shadow-md transition-all duration-300 hover:text-primary hover:border-primary/45 active:scale-95 shadow-primary/5 btn-liquid"
        >
          <ArrowUp className="h-4 w-4" />
        </motion.button>
      </div>

      <div className="px-4 pb-8 pt-6 max-w-7xl mx-auto">
        {/* Logo & tagline */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mb-7"
        >
          <a
            href="https://grapsee.com"
            className="mb-2 inline-flex items-center gap-2 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md group-hover:shadow-primary/30 transition-all relative overflow-hidden">
              <div className="absolute inset-0 liquid-aurora opacity-30" />
              <span className="relative z-10 text-sm font-black text-primary-foreground tracking-tight">
                G
              </span>
            </div>
            <span className="text-lg font-extrabold text-foreground">
              Grapsee{' '}
              <span className="text-gradient-green font-black">
                Shop
              </span>
            </span>
          </a>
          <p className="text-xs leading-relaxed text-muted-foreground/90 max-w-[280px]">
            Your premium digital shopping mall  -  websites, apps, DevOps &amp; design
            solutions crafted by world-class engineers.
          </p>
        </motion.div>

        {/* Links Grid 2 cols on small, 4 cols on wider */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-7 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4"
        >
          {Object.entries(footerLinks).map(([section, links]) => (
            <motion.div key={section} variants={itemVariants}>
              <h4 className="mb-3 text-[10px] font-extrabold uppercase tracking-widest text-primary">
                {section}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="group inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground/80 transition-colors hover:text-primary"
                    >
                      {link.label}
                      <ExternalLink className="h-2.5 w-2.5 opacity-0 -translate-x-1 transition-all group-hover:opacity-60 group-hover:translate-x-0" />
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Divider */}
        <div
          className="mb-4 h-px w-full"
          style={{
            background:
              'linear-gradient(90deg, transparent, oklch(0.637 0.176 162 / 20%), transparent)',
          }}
        />

        {/* Bottom bar */}
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-[10px] text-muted-foreground/60">
            (c) {new Date().getFullYear()}{' '}
            <a
              href="https://grapsee.com"
              className="hover:text-primary transition-colors font-semibold"
            >
              Grapsee
            </a>
            . All rights reserved.
          </p>
          <p className="text-[9px] text-muted-foreground/40 font-medium">
            Powered by{' '}
            <a
              href="https://captainpiracy.shop"
              className="hover:text-primary transition-colors"
            >
              captainpiracy.shop
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

