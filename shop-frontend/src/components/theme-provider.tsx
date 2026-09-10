'use client'

import { useEffect } from 'react'
import { useShopStore } from '@/lib/store'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useShopStore((s) => s.theme)

  // Apply theme class to <html> whenever it changes
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
  }, [theme])

  // One-time cleanup: strip any stale 'dark' theme that may be sitting in
  // localStorage from a previous session theme no longer persists
  useEffect(() => {
    try {
      const raw = localStorage.getItem('grapsee-shop-cart')
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed?.state?.theme) {
        delete parsed.state.theme
        localStorage.setItem('grapsee-shop-cart', JSON.stringify(parsed))
      }
    } catch { /* ignore */ }
  }, [])

  return <>{children}</>
}
