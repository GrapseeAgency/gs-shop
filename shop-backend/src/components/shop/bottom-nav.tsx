'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Compass, ShoppingCart, Heart, User, Bell } from 'lucide-react'
import { useShopStore } from '@/lib/store'

interface NavItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
  matchPrefixes?: string[]
  isCenter?: boolean
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Home', href: '/', matchPrefixes: ['/product', '/search', '/order-success'] },
  { icon: Compass, label: 'Explore', href: '/category', matchPrefixes: ['/category'] },
  { icon: ShoppingCart, label: 'Cart', href: '/cart', isCenter: true },
  { icon: Heart, label: 'Wishlist', href: '/wishlist' },
  { icon: User, label: 'Profile', href: '/profile', matchPrefixes: ['/settings'] },
]

export function BottomNav() {
  const pathname = usePathname()
  const { getCartCount, getWishlistCount } = useShopStore()
  const cartCount = getCartCount()
  const wishlistCount = getWishlistCount()

  // Notification dot for profile (simulated: true if cart or wishlist has items)
  const hasNotifications = cartCount > 0 || wishlistCount > 0

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/95 backdrop-blur-xl">
      {/* Safe area padding for iPhone */}
      <div className="pb-[env(safe-area-inset-bottom)]">
        <div className="flex h-16 items-end justify-around px-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const isMatch = item.matchPrefixes?.some(prefix => pathname.startsWith(prefix)) ?? false
            const active = item.href === '/' ? (isActive || isMatch) : isActive
            const Icon = item.icon

            return (
              <Link
                key={item.label}
                href={item.href}
                className="relative flex flex-col items-center justify-center gap-0.5 rounded-xl transition-colors active:scale-95 min-w-[48px] min-h-[44px]"
              >
                {/* Active indicator line */}
                <AnimatePresence>
                  {active && (
                    <motion.div
                      className="absolute -top-1 left-1/2 h-[3px] w-6 -translate-x-1/2 rounded-full bg-primary"
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 24, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    />
                  )}
                </AnimatePresence>

                {/* Icon wrapper elevated for cart */}
                <div className="relative">
                  {item.isCenter ? (
                    /* Elevated cart button with glow */
                    <motion.div
                      className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30"
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    >
                      <Icon className="h-5 w-5 text-primary-foreground" />
                      {/* Glow ring */}
                      <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-30" />
                    </motion.div>
                  ) : (
                    <Icon
                      className={`h-5 w-5 transition-colors ${
                        active ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    />
                  )}

                  {/* Cart badge */}
                  {item.label === 'Cart' && cartCount > 0 && (
                    <span className="absolute -right-2 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground px-0.5">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}

                  {/* Wishlist badge */}
                  {item.label === 'Wishlist' && wishlistCount > 0 && (
                    <span className="absolute -right-2 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white px-0.5">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  )}

                  {/* Profile notification dot */}
                  {item.label === 'Profile' && hasNotifications && !active && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                    </span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-[9px] font-medium transition-colors ${
                    active ? 'text-primary' : 'text-muted-foreground'
                  } ${item.isCenter ? '-mt-0.5' : ''}`}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
