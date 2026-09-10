'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Cookie, Shield, BarChart3, Target, Megaphone,
  Info, ChevronDown, ExternalLink, Clock, Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useShopRouter } from '@/hooks/use-shop-router'

interface CookieCategory {
  id: string
  name: string
  description: string
  icon: React.ElementType
  required: boolean
  enabled: boolean
  examples: string[]
}

const defaultCategories: CookieCategory[] = [
  {
    id: 'essential',
    name: 'Essential Cookies',
    description: 'These cookies are necessary for the website to function and cannot be switched off. They are usually only set in response to actions made by you such as setting your privacy preferences, logging in, or filling in forms.',
    icon: Shield,
    required: true,
    enabled: true,
    examples: ['Session authentication', 'Shopping cart data', 'CSRF protection', 'Privacy preferences'],
  },
  {
    id: 'analytics',
    name: 'Analytics Cookies',
    description: 'These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site.',
    icon: BarChart3,
    required: false,
    enabled: true,
    examples: ['Google Analytics', 'Page view tracking', 'User flow analysis', 'Performance metrics'],
  },
  {
    id: 'functional',
    name: 'Functional Cookies',
    description: 'These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.',
    icon: Target,
    required: false,
    enabled: true,
    examples: ['Language preferences', 'Theme settings', 'Recently viewed products', 'Wishlist memory'],
  },
  {
    id: 'marketing',
    name: 'Marketing Cookies',
    description: 'These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites.',
    icon: Megaphone,
    required: false,
    enabled: false,
    examples: ['Facebook Pixel', 'Google Ads remarketing', 'Email campaign tracking', 'Social media targeting'],
  },
]

export function CookiePolicyPage() {
  const { goBack } = useShopRouter()
  const [categories, setCategories] = useState<CookieCategory[]>(defaultCategories)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [lastUpdated] = useState('March 4, 2026')

  // Load saved preferences
  useEffect(() => {
    try {
      const saved = localStorage.getItem('grapsee-cookie-preferences')
      if (saved) {
        const parsed = JSON.parse(saved)
        setCategories((prev) => prev.map((cat) => {
          if (cat.required) return cat
          const savedCat = parsed.find((s: { id: string }) => s.id === cat.id)
          return savedCat ? { ...cat, enabled: savedCat.enabled } : cat
        }))
      }
    } catch {
      // ignore
    }
  }, [])

  const handleToggle = (id: string, enabled: boolean) => {
    setCategories((prev) => prev.map((cat) =>
      cat.id === id && !cat.required ? { ...cat, enabled } : cat
    ))
  }

  const handleSavePreferences = () => {
    const prefs = categories.map(({ id, enabled, required }) => ({ id, enabled: required || enabled }))
    localStorage.setItem('grapsee-cookie-preferences', JSON.stringify(prefs))
    localStorage.setItem('grapsee-cookie-consent', 'custom')
    window.dispatchEvent(new Event('cookie-preferences-changed'))
  }

  const handleAcceptAll = () => {
    setCategories((prev) => prev.map((cat) => ({ ...cat, enabled: true })))
    localStorage.setItem('grapsee-cookie-consent', 'accepted')
    window.dispatchEvent(new Event('cookie-preferences-changed'))
  }

  const handleRejectOptional = () => {
    setCategories((prev) => prev.map((cat) => ({ ...cat, enabled: cat.required })))
    localStorage.setItem('grapsee-cookie-consent', 'rejected')
    window.dispatchEvent(new Event('cookie-preferences-changed'))
  }

  return (
    <motion.div className="pb-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack} className="flex-shrink-0 text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Cookie className="h-5 w-5 text-primary" /> Cookie Policy
            </h1>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> Last updated: {lastUpdated}
            </p>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="mx-4 mt-3 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-4">
        <div className="flex items-start gap-3">
          <motion.div
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/20"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
          >
            <Cookie className="h-5 w-5 text-primary" />
          </motion.div>
          <div>
            <p className="text-sm font-bold text-foreground">How We Use Cookies</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
              We use cookies and similar technologies to enhance your browsing experience, serve personalized content,
              and analyze our traffic. You can choose which types of cookies to allow below.
            </p>
          </div>
        </div>
      </div>

      {/* Cookie Categories */}
      <div className="mx-4 mt-4">
        <h2 className="text-sm font-bold text-foreground mb-2">Cookie Categories</h2>
        <div className="space-y-2">
          {categories.map((category, index) => {
            const Icon = category.icon
            const isExpanded = expandedCategory === category.id

            return (
              <motion.div
                key={category.id}
                className="overflow-hidden rounded-xl border border-border/50 bg-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <button
                  className="flex w-full items-center gap-3 p-3"
                  onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                >
                  <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
                    category.enabled ? 'bg-primary/10' : 'bg-muted/50'
                  }`}>
                    <Icon className={`h-4 w-4 ${category.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{category.name}</p>
                      {category.required && (
                        <Badge className="bg-amber-500/10 text-amber-500 text-[8px] px-1.5">Required</Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                      {category.description.substring(0, 80)}...
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Switch
                      checked={category.enabled}
                      disabled={category.required}
                      onCheckedChange={(v) => handleToggle(category.id, v)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3">
                        <Separator className="mb-3" />
                        <p className="text-xs text-muted-foreground leading-relaxed">{category.description}</p>

                        <div className="mt-3">
                          <p className="text-[10px] font-medium text-foreground uppercase tracking-wider mb-1.5">Examples</p>
                          <div className="flex flex-wrap gap-1.5">
                            {category.examples.map((example) => (
                              <Badge key={example} variant="outline" className="text-[9px] px-1.5 py-0.5">
                                {example}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {category.required && (
                          <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-500/5 border border-amber-500/10 p-2">
                            <Info className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <p className="text-[10px] text-amber-600 dark:text-amber-400">
                              These cookies are essential for the website to function properly and cannot be disabled.
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Your Rights */}
      <div className="mx-4 mt-4">
        <h2 className="text-sm font-bold text-foreground mb-2">Your Rights</h2>
        <div className="rounded-xl border border-border/50 bg-card p-3 space-y-2">
          {[
            'You have the right to accept or reject non-essential cookies',
            'You can change your cookie preferences at any time',
            'You can request deletion of all stored cookie data',
            'Essential cookies cannot be disabled as they are required for site functionality',
          ].map((right, i) => (
            <div key={i} className="flex items-start gap-2">
              <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">{right}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mx-4 mt-4 space-y-2">
        <Button className="w-full gap-2" onClick={handleAcceptAll}>
          <Check className="h-4 w-4" /> Accept All Cookies
        </Button>
        <Button variant="outline" className="w-full gap-2" onClick={handleSavePreferences}>
          Save My Preferences
        </Button>
        <Button variant="outline" className="w-full gap-2 border-destructive/30 text-destructive hover:bg-destructive/10" onClick={handleRejectOptional}>
          Reject Non-Essential
        </Button>
      </div>

      {/* Contact */}
      <div className="mx-4 mt-4 rounded-2xl bg-muted/30 border border-border/30 p-4 text-center">
        <p className="text-xs text-muted-foreground">
          Questions about our cookie practices?{' '}
          <button className="text-primary underline" onClick={() => {}}>
            Contact our Privacy Team
          </button>
        </p>
      </div>
    </motion.div>
  )
}

