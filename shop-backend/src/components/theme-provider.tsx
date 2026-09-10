'use client'

import { useEffect } from 'react'
import { useShopStore, useHydration } from '@/lib/store'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const hydrated = useHydration()
  const theme = useShopStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
    }
  }, [theme])

  // Prevent flash: apply dark class before hydration
  useEffect(() => {
    if (!hydrated) {
      document.documentElement.classList.add('dark')
    }
  }, [hydrated])

  return <>{children}</>
}
