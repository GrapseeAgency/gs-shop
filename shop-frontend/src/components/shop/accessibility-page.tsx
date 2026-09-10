'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Eye, Type, Contrast, Volume2, VolumeX, Monitor,
  Smartphone, Accessibility, Shield, Info, Moon, Sun, Settings,
  ChevronsUpDown, Maximize2, Minimize2, Keyboard,
  Hand, MousePointerClick, Globe, Heart,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { useShopStore, useHydration } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { toast } from 'sonner'

type FontSize = 'small' | 'medium' | 'large' | 'x-large'

interface AccessibilitySettings {
  fontSize: FontSize
  highContrast: boolean
  reducedMotion: boolean
  screenReaderOptimized: boolean
  largeTouchTargets: boolean
  keyboardNavigation: boolean
  dyslexiaFont: boolean
  focusIndicators: boolean
}

const fontSizes: Record<FontSize, { label: string; size: string; demo: string }> = {
  small: { label: 'Small', size: '14px', demo: 'Aa' },
  medium: { label: 'Medium', size: '16px', demo: 'Aa' },
  large: { label: 'Large', size: '18px', demo: 'Aa' },
  'x-large': { label: 'Extra Large', size: '20px', demo: 'Aa' },
}

function SettingRow({ icon: Icon, title, description, children }: {
  icon: React.ElementType
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 mt-0.5">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{description}</p>
      </div>
      <div className="flex-shrink-0 mt-1">
        {children}
      </div>
    </div>
  )
}

export function AccessibilityPage() {
  const hydrated = useHydration()
  const { goBack, theme, toggleTheme } = useShopStore()
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 'medium',
    highContrast: false,
    reducedMotion: false,
    screenReaderOptimized: false,
    largeTouchTargets: false,
    keyboardNavigation: true,
    dyslexiaFont: false,
    focusIndicators: true,
  })

  const [previewText, setPreviewText] = useState('The quick brown fox jumps over the lazy dog.')

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('grapsee-accessibility')
      if (saved) {
        const parsed = JSON.parse(saved)
        setSettings((prev) => ({ ...prev, ...parsed }))
      }
    } catch {
      // ignore
    }
  }, [])

  // Save to localStorage on change
  const updateSetting = useCallback(<K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value }
      try {
        localStorage.setItem('grapsee-accessibility', JSON.stringify(updated))
      } catch {
        // ignore
      }
      return updated
    })
    toast.success(`${key} updated`)
  }, [])

  const currentFontSize = fontSizes[settings.fontSize]

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
              <Accessibility className="h-5 w-5 text-primary" /> Accessibility
            </h1>
            <p className="text-[11px] text-muted-foreground">Customize your experience</p>
          </div>
        </div>
      </div>

      {/* Accessibility Commitment */}
      <div className="mx-4 mt-3 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-4">
        <div className="flex items-start gap-3">
          <motion.div
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/20"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <Heart className="h-5 w-5 text-primary" />
          </motion.div>
          <div>
            <p className="text-sm font-bold text-foreground">Our Commitment</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
              Grapsee Shop is committed to making our platform accessible to everyone.
              We follow WCAG 2.1 guidelines and continuously improve our accessibility features.
            </p>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="mx-4 mt-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-foreground">Preview</h2>
          <Badge variant="outline" className="text-[9px] px-1.5">{settings.fontSize}</Badge>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-4" style={{
          fontSize: currentFontSize.size,
          fontWeight: settings.highContrast ? 600 : 400,
        }}>
          <p className="text-foreground">{previewText}</p>
          <p className="text-muted-foreground mt-2" style={{ fontSize: `calc(${currentFontSize.size} * 0.875)` }}>
            Secondary text appears like this. Adjust settings above to see how content looks.
          </p>
        </div>
      </div>

      {/* Visual Settings */}
      <div className="mx-4 mt-4">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2 mb-1">
          <Eye className="h-4 w-4 text-primary" /> Visual
        </h2>
        <p className="text-[10px] text-muted-foreground mb-2">Adjust how content is displayed</p>

        <div className="rounded-xl border border-border/50 bg-card p-3">
          {/* Font Size */}
          <SettingRow
            icon={Type}
            title="Font Size"
            description="Adjust the base text size throughout the app"
          >
            <div className="flex items-center gap-1">
              {(['small', 'medium', 'large', 'x-large'] as FontSize[]).map((size) => (
                <motion.button
                  key={size}
                  onClick={() => updateSetting('fontSize', size)}
                  className={`flex h-8 items-center justify-center rounded-lg px-2 text-xs font-medium transition-colors ${
                    settings.fontSize === size
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                  }`}
                  whileTap={{ scale: 0.9 }}
                >
                  {fontSizes[size].demo}
                </motion.button>
              ))}
            </div>
          </SettingRow>

          <Separator className="my-1" />

          {/* Theme Toggle */}
          <SettingRow
            icon={hydrated && theme === 'dark' ? Moon : Sun}
            title="Dark Mode"
            description="Switch between light and dark themes"
          >
            <Switch
              checked={hydrated ? theme === 'dark' : true}
              onCheckedChange={() => {
                toggleTheme()
                toast.success(`Switched to ${theme === 'dark' ? 'light' : 'dark'} mode`)
              }}
            />
          </SettingRow>

          <Separator className="my-1" />

          {/* High Contrast */}
          <SettingRow
            icon={Contrast}
            title="High Contrast"
            description="Increase contrast for better readability"
          >
            <Switch
              checked={settings.highContrast}
              onCheckedChange={(v) => updateSetting('highContrast', v)}
            />
          </SettingRow>

          <Separator className="my-1" />

          {/* Dyslexia Font */}
          <SettingRow
            icon={Type}
            title="Dyslexia-Friendly Font"
            description="Use a font designed for readers with dyslexia"
          >
            <Switch
              checked={settings.dyslexiaFont}
              onCheckedChange={(v) => updateSetting('dyslexiaFont', v)}
            />
          </SettingRow>

          <Separator className="my-1" />

          {/* Focus Indicators */}
          <SettingRow
            icon={MousePointerClick}
            title="Focus Indicators"
            description="Show visible focus rings on interactive elements"
          >
            <Switch
              checked={settings.focusIndicators}
              onCheckedChange={(v) => updateSetting('focusIndicators', v)}
            />
          </SettingRow>
        </div>
      </div>

      {/* Motion & Interaction */}
      <div className="mx-4 mt-4">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2 mb-1">
          <Hand className="h-4 w-4 text-primary" /> Motion & Interaction
        </h2>
        <p className="text-[10px] text-muted-foreground mb-2">Control animations and touch behavior</p>

        <div className="rounded-xl border border-border/50 bg-card p-3">
          {/* Reduced Motion */}
          <SettingRow
            icon={VolumeX}
            title="Reduced Motion"
            description="Minimize animations and transitions"
          >
            <Switch
              checked={settings.reducedMotion}
              onCheckedChange={(v) => updateSetting('reducedMotion', v)}
            />
          </SettingRow>

          <Separator className="my-1" />

          {/* Large Touch Targets */}
          <SettingRow
            icon={Smartphone}
            title="Large Touch Targets"
            description="Increase button and tap target sizes for easier interaction"
          >
            <Switch
              checked={settings.largeTouchTargets}
              onCheckedChange={(v) => updateSetting('largeTouchTargets', v)}
            />
          </SettingRow>

          <Separator className="my-1" />

          {/* Keyboard Navigation */}
          <SettingRow
            icon={Keyboard}
            title="Keyboard Navigation"
            description="Enable enhanced keyboard shortcuts and navigation"
          >
            <Switch
              checked={settings.keyboardNavigation}
              onCheckedChange={(v) => updateSetting('keyboardNavigation', v)}
            />
          </SettingRow>
        </div>
      </div>

      {/* Screen Reader */}
      <div className="mx-4 mt-4">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2 mb-1">
          <Volume2 className="h-4 w-4 text-primary" /> Screen Reader
        </h2>
        <p className="text-[10px] text-muted-foreground mb-2">Optimize for assistive technology</p>

        <div className="rounded-xl border border-border/50 bg-card p-3">
          <SettingRow
            icon={Monitor}
            title="Screen Reader Optimized"
            description="Improve layout and labels for screen reader compatibility"
          >
            <Switch
              checked={settings.screenReaderOptimized}
              onCheckedChange={(v) => updateSetting('screenReaderOptimized', v)}
            />
          </SettingRow>
        </div>
      </div>

      {/* Compatibility Info */}
      <div className="mx-4 mt-4">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2 mb-2">
          <Info className="h-4 w-4 text-primary" /> Compatibility
        </h2>
        <div className="rounded-xl border border-border/50 bg-card p-3">
          <div className="space-y-2">
            {[
              { name: 'VoiceOver (iOS/macOS)', supported: true },
              { name: 'TalkBack (Android)', supported: true },
              { name: 'NVDA (Windows)', supported: true },
              { name: 'JAWS (Windows)', supported: true },
              { name: 'Dragon NaturallySpeaking', supported: false },
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="text-xs text-foreground">{item.name}</span>
                <Badge className={`text-[9px] px-1.5 ${
                  item.supported ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                }`}>
                  {item.supported ? 'Supported' : 'Partial'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Standards Badge */}
      <div className="mx-4 mt-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 p-4 text-center">
        <Shield className="mx-auto h-6 w-6 text-emerald-500 mb-2" />
        <p className="text-sm font-semibold text-foreground mb-1">WCAG 2.1 Compliant</p>
        <p className="text-xs text-muted-foreground">We follow international accessibility standards to ensure everyone can use our platform</p>
        <Button variant="outline" className="mt-3 gap-2 text-xs border-emerald-500/30 text-emerald-500" onClick={() => toast.info('Accessibility statement coming soon!')}>
          <Globe className="h-3.5 w-3.5" /> Read Accessibility Statement
        </Button>
      </div>

      {/* Reset Button */}
      <div className="mx-4 mt-4">
        <Button
          variant="outline"
          className="w-full gap-2 text-xs"
          onClick={() => {
            const defaults: AccessibilitySettings = {
              fontSize: 'medium',
              highContrast: false,
              reducedMotion: false,
              screenReaderOptimized: false,
              largeTouchTargets: false,
              keyboardNavigation: true,
              dyslexiaFont: false,
              focusIndicators: true,
            }
            setSettings(defaults)
            localStorage.setItem('grapsee-accessibility', JSON.stringify(defaults))
            toast.success('Settings reset to defaults')
          }}
        >
          <Settings className="h-3.5 w-3.5" /> Reset to Defaults
        </Button>
      </div>
    </motion.div>
  )
}

