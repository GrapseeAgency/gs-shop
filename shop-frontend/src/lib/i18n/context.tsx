'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { translations, type Locale, type TranslationKeys } from './translations'

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: TranslationKeys
}

const I18nContext = createContext<I18nContextValue | null>(null)

const STORAGE_KEY = 'grapsee-locale'

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Locale | null
      if (stored && (stored === 'en' || stored === 'bn')) {
        setLocaleState(stored)
      }
    } catch {
      // localStorage unavailable
    }
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    try {
      localStorage.setItem(STORAGE_KEY, newLocale)
    } catch {
      // ignore
    }
  }, [])

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: translations[locale] as TranslationKeys }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}

export function useT() {
  return useI18n().t
}
