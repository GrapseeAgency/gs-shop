'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, Shield, BarChart3, Megaphone, Settings, ChevronUp, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'

interface CookiePreferences {
  essential: boolean
  analytics: boolean
  marketing: boolean
  functional: boolean
}

const DEFAULT_PREFS: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false,
  functional: false,
}

const COOKIE_CATEGORIES: {
  key: keyof CookiePreferences
  label: string
  description: string
  icon: React.ReactNode
  disabled?: boolean
}[] = [
  {
    key: 'essential',
    label: 'Essential',
    description: 'Required for the site to function properly. Cannot be disabled.',
    icon: <Shield className="h-4 w-4" />,
    disabled: true,
  },
  {
    key: 'analytics',
    label: 'Analytics',
    description: 'Help us understand how visitors interact with our site.',
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    key: 'marketing',
    label: 'Marketing',
    description: 'Used to track visitors across websites for advertising purposes.',
    icon: <Megaphone className="h-4 w-4" />,
  },
  {
    key: 'functional',
    label: 'Functional',
    description: 'Enable enhanced functionality and personalization.',
    icon: <Settings className="h-4 w-4" />,
  },
]

export function CookieConsent() {
  const { cookieConsent, setCookieConsent } = useShopStore()
  const { goCookies } = useShopRouter()

  // Show banner if user hasn't consented yet
  const [visible, setVisible] = useState(!cookieConsent)
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [prefs, setPrefs] = useState<CookiePreferences>({ ...DEFAULT_PREFS })

  // Don't render if already consented
  if (!visible || cookieConsent) return null

  const handleAcceptAll = () => {
    setCookieConsent(true)
    setVisible(false)
  }

  const handleSavePreferences = () => {
    // At least essential must be true; consent is given when user saves
    setCookieConsent(true)
    setVisible(false)
  }

  const togglePref = (key: keyof CookiePreferences) => {
    if (key === 'essential') return
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-x-0 bottom-16 z-50 px-3 pb-2 sm:px-4"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="rounded-2xl border border-border bg-card shadow-xl">
          {/* Header */}
          <div className="flex items-start gap-3 p-4 pb-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Cookie className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground">We value your privacy</h3>
              <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.{' '}
                <button
                  onClick={goCookies}
                  className="inline-flex items-center gap-0.5 text-primary hover:underline"
                >
                  Cookie Policy
                  <ExternalLink className="h-2.5 w-2.5" />
                </button>
              </p>
            </div>
          </div>

          {/* Customize Panel */}
          <AnimatePresence>
            {customizeOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="space-y-3 border-t border-border px-4 py-3">
                  {COOKIE_CATEGORIES.map((cat) => (
                    <div key={cat.key} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        {cat.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-foreground">{cat.label}</span>
                          <Switch
                            checked={prefs[cat.key]}
                            onCheckedChange={() => togglePref(cat.key)}
                            disabled={cat.disabled}
                            className="scale-90"
                          />
                        </div>
                        <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
                          {cat.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 p-4 pt-2">
            {/* Toggle Customize */}
            <button
              onClick={() => setCustomizeOpen((prev) => !prev)}
              className="flex items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Settings className="h-3 w-3" />
              {customizeOpen ? 'Hide options' : 'Customize preferences'}
              <motion.div
                animate={{ rotate: customizeOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronUp className="h-3 w-3" />
              </motion.div>
            </button>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs"
                onClick={handleSavePreferences}
              >
                Save Preferences
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-primary text-xs text-primary-foreground"
                onClick={handleAcceptAll}
              >
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

