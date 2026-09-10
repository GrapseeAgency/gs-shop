'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Check } from 'lucide-react'
import { useState } from 'react'
import { useI18n, type Locale } from '@/lib/i18n'

const LOCALES: { code: Locale; label: string; native: string; flag: string }[] = [
  { code: 'en', label: 'English', native: 'English', flag: '' },
  { code: 'bn', label: 'Bengali', native: '', flag: '' },
]

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useI18n()
  const [open, setOpen] = useState(false)

  const current = LOCALES.find((l) => l.code === locale) || LOCALES[0]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-xl border border-border/50 bg-card px-2.5 py-1.5 text-xs font-medium text-foreground transition-all hover:bg-muted active:scale-95 ${
          compact ? 'px-2 py-1' : ''
        }`}
        aria-label="Switch language"
      >
        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
        <span>{current.flag}</span>
        {!compact && <span>{current.native}</span>}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="absolute right-0 top-full z-50 mt-1.5 min-w-[140px] overflow-hidden rounded-xl border border-border bg-card shadow-lg shadow-black/10"
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              {LOCALES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { setLocale(l.code); setOpen(false) }}
                  className={`flex w-full items-center gap-2 px-3 py-2.5 text-xs transition-colors hover:bg-muted ${
                    locale === l.code ? 'text-primary font-medium' : 'text-foreground'
                  }`}
                >
                  <span className="text-base">{l.flag}</span>
                  <span className="flex-1 text-left">{l.native}</span>
                  {locale === l.code && <Check className="h-3.5 w-3.5 text-primary" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
