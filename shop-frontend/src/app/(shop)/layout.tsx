'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { Header } from '@/components/shop/header'
import { CartSheet } from '@/components/shop/cart-sheet'
import { BottomNav } from '@/components/shop/bottom-nav'
import { NavigationSync } from '@/components/shop/navigation-sync'
import { PWAInstallPrompt } from '@/components/shop/pwa-install-prompt'
import { InterestOnboarding } from '@/components/shop/interest-onboarding'
import { PushInit } from '@/components/push-init'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  // Check onboarding status once session is ready
  useEffect(() => {
    if (status !== 'authenticated' || !session?.user) return
    const key = `grapsee-onboarded-${(session.user as any).id}`
    if (localStorage.getItem(key)) return
    fetch('/api/user/preferences')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && !data.onboardingComplete) {
          setShowOnboarding(true)
        } else {
          localStorage.setItem(key, '1')
        }
      })
      .catch(() => {})
  }, [status, session])

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    const userId = (session?.user as any)?.id
    if (userId) localStorage.setItem(`grapsee-onboarded-${userId}`, '1')
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Global Ambient Liquid Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-15%] left-[-10%] w-[70vw] h-[70vw] md:w-[50vw] md:h-[50vw] liquid-blob opacity-60 dark:opacity-40" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] md:w-[40vw] md:h-[40vw] liquid-blob-slow opacity-50 dark:opacity-30" />
        <div className="absolute top-[35%] right-[10%] w-[35vw] h-[35vw] liquid-blob-accent opacity-35 dark:opacity-20" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <PushInit />
        <NavigationSync />
        <Header />
        <main className="flex-1 pb-20">{children}</main>
        <CartSheet />
        <BottomNav />
        <PWAInstallPrompt />
        <AnimatePresence>
          {showOnboarding && (
            <InterestOnboarding
              userName={session?.user?.name ?? undefined}
              onComplete={handleOnboardingComplete}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
