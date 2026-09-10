'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useShopStore, type ViewType } from '@/lib/store'

const viewToPath: Record<ViewType, string> = {
  'home': '/',
  'category': '/category',
  'product': '/product',
  'search': '/search',
  'checkout': '/checkout',
  'order-success': '/order-success',
  'wishlist': '/wishlist',
  'profile': '/profile',
  'orders': '/orders',
  'contact': '/contact',
  'settings': '/settings',
  'deals': '/deals',
  'luxury': '/luxury',
  'brands': '/brands',
  'rewards': '/rewards',
  'cart': '/cart',
  'about': '/about',
  'privacy': '/privacy',
  'terms': '/terms',
  'recently-viewed': '/recently-viewed',
  'compare': '/compare',
  'gift-cards': '/gift-cards',
  'referrals': '/referrals',
  'notifications': '/notifications',
  'stores': '/stores',
  'price-alerts': '/price-alerts',
  'wallet': '/wallet',
  'auctions': '/auctions',
  'spin-win': '/spin-win',
  'collections': '/collections',
  'blog': '/blog',
  'help': '/help',
  'returns': '/returns',
  'track': '/track',
  'voucher': '/voucher',
  'vip': '/vip',
  'faq': '/faq',
  'live': '/live',
  'reviews': '/reviews',
  'flash-sale': '/flash-sale',
  'bundles': '/bundles',
  'seasonal': '/seasonal',
  'community': '/community',
  'affiliate': '/affiliate',
  'wishboard': '/wishboard',
  'style-guide': '/style-guide',
  'accessibility': '/accessibility',
  'cookies': '/cookies',
  'sitemap': '/sitemap',
  'verify-age': '/verify-age',
  'product-videos': '/product-videos',
  'group-buy': '/group-buy',
  'trade-in': '/trade-in',
  'installment': '/installment',
  'seller-center': '/seller-center',
  'digital-downloads': '/digital-downloads',
  'product-quiz': '/product-quiz',
  'loyalty-calculator': '/loyalty-calculator',
  'shipping-calculator': '/shipping-calculator',
  'store-pickup': '/store-pickup',
  'outfit-maker': '/outfit-maker',
  'email-subscribe': '/email-subscribe',
  'seller-profile': '/seller-profile',
  'order-tracking': '/order-tracking',
  'mystery-box': '/mystery-box',
  'preorder': '/preorder',
  'gift-registry': '/gift-registry',
  'eco-shop': '/eco-shop',
  'price-match': '/price-match',
  'deal-calendar': '/deal-calendar',
  'stock-notifications': '/stock-notifications',
  'product-configurator': '/product-configurator',
  'customer-photos': '/customer-photos',
  'seller-onboarding': '/seller-onboarding',
  'try-before-buy': '/try-before-buy',
  'price-drop': '/price-drop',
  'loyalty-mall': '/loyalty-mall',
  'gift-wrapping': '/gift-wrapping',
  'warranty-center': '/warranty-center',
  'charity-shop': '/charity-shop',
  'rental': '/rental',
  'student-discount': '/student-discount',
  'price-guarantee': '/price-guarantee',
  'review-megaphone': '/review-megaphone',
  'mystery-reward': '/mystery-reward',
  'dark-store': '/dark-store',
}

const pathToView: Record<string, ViewType> = {
  '/': 'home',
  '/category': 'category',
  '/product': 'product',
  '/search': 'search',
  '/checkout': 'checkout',
  '/order-success': 'order-success',
  '/wishlist': 'wishlist',
  '/profile': 'profile',
  '/orders': 'orders',
  '/contact': 'contact',
  '/settings': 'settings',
  '/deals': 'deals',
  '/luxury': 'luxury',
  '/brands': 'brands',
  '/rewards': 'rewards',
  '/cart': 'cart',
  '/about': 'about',
  '/privacy': 'privacy',
  '/terms': 'terms',
  '/recently-viewed': 'recently-viewed',
  '/compare': 'compare',
  '/gift-cards': 'gift-cards',
  '/referrals': 'referrals',
  '/notifications': 'notifications',
  '/stores': 'stores',
  '/price-alerts': 'price-alerts',
  '/wallet': 'wallet',
  '/auctions': 'auctions',
  '/spin-win': 'spin-win',
  '/collections': 'collections',
  '/blog': 'blog',
  '/help': 'help',
  '/returns': 'returns',
  '/track': 'track',
  '/voucher': 'voucher',
  '/vip': 'vip',
  '/faq': 'faq',
  '/live': 'live',
  '/reviews': 'reviews',
  '/flash-sale': 'flash-sale',
  '/bundles': 'bundles',
  '/seasonal': 'seasonal',
  '/community': 'community',
  '/affiliate': 'affiliate',
  '/wishboard': 'wishboard',
  '/style-guide': 'style-guide',
  '/accessibility': 'accessibility',
  '/cookies': 'cookies',
  '/sitemap': 'sitemap',
  '/verify-age': 'verify-age',
  '/product-videos': 'product-videos',
  '/group-buy': 'group-buy',
  '/trade-in': 'trade-in',
  '/installment': 'installment',
  '/seller-center': 'seller-center',
  '/digital-downloads': 'digital-downloads',
  '/product-quiz': 'product-quiz',
  '/loyalty-calculator': 'loyalty-calculator',
  '/shipping-calculator': 'shipping-calculator',
  '/store-pickup': 'store-pickup',
  '/outfit-maker': 'outfit-maker',
  '/email-subscribe': 'email-subscribe',
  '/seller-profile': 'seller-profile',
  '/order-tracking': 'order-tracking',
  '/mystery-box': 'mystery-box',
  '/preorder': 'preorder',
  '/gift-registry': 'gift-registry',
  '/eco-shop': 'eco-shop',
  '/price-match': 'price-match',
  '/deal-calendar': 'deal-calendar',
  '/stock-notifications': 'stock-notifications',
  '/product-configurator': 'product-configurator',
  '/customer-photos': 'customer-photos',
  '/seller-onboarding': 'seller-onboarding',
  '/try-before-buy': 'try-before-buy',
  '/price-drop': 'price-drop',
  '/loyalty-mall': 'loyalty-mall',
  '/gift-wrapping': 'gift-wrapping',
  '/warranty-center': 'warranty-center',
  '/charity-shop': 'charity-shop',
  '/rental': 'rental',
  '/student-discount': 'student-discount',
  '/price-guarantee': 'price-guarantee',
  '/review-megaphone': 'review-megaphone',
  '/mystery-reward': 'mystery-reward',
  '/dark-store': 'dark-store',
}

function getBasePath(pathname: string): string {
  // Handle dynamic routes like /category/[slug] -> /category
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length <= 1) return pathname
  // Check if it's a known dynamic route
  if (parts[0] === 'category') return '/category'
  if (parts[0] === 'product') return '/product'
  if (parts[0] === 'orders') return '/orders'
  if (parts[0] === 'invoice') return '/orders'
  if (parts[0] === 'collections') return '/collections'
  if (parts[0] === 'blog') return '/blog'
  return '/' + parts[0]
}

/**
 * NavigationSync bridges Zustand store view state with Next.js URL routing.
 * 
 * 1. When components call setView() (old approach), it syncs the URL
 * 2. When URL changes (browser nav, Link clicks), it syncs the store view
 * 
 * This allows gradual migration from store-based to URL-based navigation.
 */
export function NavigationSync() {
  const router = useRouter()
  const pathname = usePathname()
  const view = useShopStore((s) => s.view)
  const lastNavSource = useRef<'store' | 'url'>('url')
  const lastSyncedView = useRef<ViewType>(view)
  const lastSyncedPath = useRef<string>(pathname)

  // Sync store view changes -> URL
  useEffect(() => {
    if (lastNavSource.current === 'url') {
      // This view change was triggered by a URL change, don't navigate again
      if (view === lastSyncedView.current) return
    }

    const targetPath = viewToPath[view]
    if (targetPath && pathname !== targetPath && !pathname.startsWith(targetPath + '/')) {
      lastNavSource.current = 'store'
      lastSyncedView.current = view
      lastSyncedPath.current = targetPath
      router.push(targetPath)
    }
  }, [view, pathname, router])

  // Sync URL changes -> store view
  useEffect(() => {
    const basePath = getBasePath(pathname)
    const targetView = pathToView[basePath]
    
    if (targetView && targetView !== lastSyncedView.current) {
      lastNavSource.current = 'url'
      lastSyncedView.current = targetView
      lastSyncedPath.current = pathname
      useShopStore.getState().setView(targetView)
    }
  }, [pathname])

  return null
}

