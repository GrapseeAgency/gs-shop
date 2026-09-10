'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, ChevronRight, Sparkles, X } from 'lucide-react'
import { useSession } from 'next-auth/react'

const CATEGORIES = [
  { slug: 'websites',        label: 'Websites',         emoji: '' },
  { slug: 'mobile-apps',     label: 'Mobile Apps',      emoji: '' },
  { slug: 'ui-ux-design',    label: 'UI/UX Design',     emoji: '' },
  { slug: 'devops',          label: 'DevOps & Cloud',   emoji: '' },
  { slug: 'digital-downloads', label: 'Digital Files',  emoji: '' },
  { slug: 'courses',         label: 'Courses',          emoji: '' },
  { slug: 'templates',       label: 'Templates',        emoji: '' },
  { slug: 'branding',        label: 'Branding',         emoji: '' },
  { slug: 'plugins',         label: 'Plugins & Tools',  emoji: '' },
  { slug: 'ai-tools',        label: 'AI Tools',         emoji: '' },
  { slug: 'ebooks',          label: 'E-books',          emoji: '' },
  { slug: 'software',        label: 'Software',         emoji: '' },
]

const SHOP_STYLES = [
  { id: 'deal_hunter',   label: 'Deal Hunter',    emoji: '', desc: 'I want the best prices & flash deals' },
  { id: 'quality_first', label: 'Quality First',  emoji: '', desc: 'I prioritize quality over price' },
  { id: 'new_arrivals',  label: 'New Arrivals',   emoji: '', desc: 'I love discovering new products first' },
]

interface Props {
  userName?: string
  onComplete: () => void
}

export function InterestOnboarding({ userName, onComplete }: Props) {
  const [step, setStep] = useState<0 | 1 | 2>(0)
  const [selected, setSelected] = useState<string[]>([])
  const [shopStyle, setShopStyle] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Step 0 auto-advances after 2s
  useEffect(() => {
    if (step === 0) {
      const t = setTimeout(() => setStep(1), 2200)
      return () => clearTimeout(t)
    }
  }, [step])

  const toggleCategory = (slug: string) => {
    setSelected(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    )
  }

  const handleSkip = async () => {
    await save([], null, true)
    onComplete()
  }

  const save = async (interests: string[], style: string | null, complete: boolean) => {
    setSaving(true)
    try {
      await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests, shopStyle: style, onboardingComplete: complete }),
      })
    } catch { /* silent */ } finally {
      setSaving(false)
    }
  }

  const handleDone = async () => {
    await save(selected, shopStyle, true)
    onComplete()
  }

  const handleNextFromStep1 = () => {
    if (selected.length === 0) {
      handleSkip()
      return
    }
    setStep(2)
  }

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm px-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-lg rounded-t-3xl bg-background border-t border-border/30 shadow-2xl overflow-hidden"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      >
        <AnimatePresence mode="wait">

          {/* Step 0: Welcome splash */}
          {step === 0 && (
            <motion.div
              key="step0"
              className="flex flex-col items-center justify-center py-14 px-6 text-center"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
            >
              <motion.div
                className="mb-4 text-6xl"
                animate={{ rotate: [0, -10, 10, -6, 6, 0] }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                
              </motion.div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Welcome{userName ? `, ${userName.split(' ')[0]}` : ''}!
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[260px]">
                You're in. Let us make your experience feel like home.
              </p>
              <div className="mt-6 flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="h-1.5 w-6 rounded-full bg-primary/30"
                    animate={{ backgroundColor: i === 0 ? 'hsl(var(--primary))' : undefined }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/*  Step 1: Category picker  */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
            >
              {/* Header */}
              <div className="flex items-start justify-between px-5 pt-5 pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wide">Personalize</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">What are you into?</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Tap anything that catches your eye  we'll personalize your feed
                  </p>
                </div>
                <button
                  className="rounded-full p-1.5 text-muted-foreground hover:bg-muted/50"
                  onClick={handleSkip}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Category grid */}
              <div className="grid grid-cols-3 gap-2 px-4 pb-2 max-h-[42vh] overflow-y-auto">
                {CATEGORIES.map(cat => {
                  const active = selected.includes(cat.slug)
                  return (
                    <motion.button
                      key={cat.slug}
                      onClick={() => toggleCategory(cat.slug)}
                      whileTap={{ scale: 0.93 }}
                      className={`relative flex flex-col items-center gap-1.5 rounded-2xl border py-3 px-2 transition-all text-center ${
                        active
                          ? 'border-primary bg-primary/10 shadow-sm shadow-primary/20'
                          : 'border-border/40 bg-card hover:border-primary/40 hover:bg-primary/5'
                      }`}
                    >
                      <span className="text-2xl">{cat.emoji}</span>
                      <span className={`text-[11px] font-medium leading-tight ${active ? 'text-primary' : 'text-foreground'}`}>
                        {cat.label}
                      </span>
                      {active && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary"
                        >
                          <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                        </motion.div>
                      )}
                    </motion.button>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-4 border-t border-border/20">
                <button
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  onClick={handleSkip}
                >
                  Skip for now
                </button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleNextFromStep1}
                  className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25"
                >
                  {selected.length === 0 ? 'Skip' : `Continue (${selected.length})`}
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              </div>

              {/* Step dots */}
              <div className="flex justify-center gap-1.5 pb-4">
                {[0, 1, 2].map(i => (
                  <div key={i} className={`h-1.5 rounded-full transition-all ${i === 1 ? 'w-6 bg-primary' : 'w-2 bg-muted'}`} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Shop style picker */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
            >
              <div className="px-5 pt-5 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">Almost there</span>
                </div>
                <h3 className="text-lg font-bold text-foreground">How do you shop?</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  This helps us send you the right kind of notifications
                </p>
              </div>

              <div className="space-y-2.5 px-4 pb-3">
                {SHOP_STYLES.map(style => {
                  const active = shopStyle === style.id
                  return (
                    <motion.button
                      key={style.id}
                      onClick={() => setShopStyle(active ? null : style.id)}
                      whileTap={{ scale: 0.97 }}
                      className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-all ${
                        active
                          ? 'border-primary bg-primary/10 shadow-sm shadow-primary/20'
                          : 'border-border/40 bg-card hover:border-primary/40'
                      }`}
                    >
                      <span className="text-3xl">{style.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${active ? 'text-primary' : 'text-foreground'}`}>
                          {style.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{style.desc}</p>
                      </div>
                      {active && <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />}
                    </motion.button>
                  )
                })}
              </div>

              <div className="flex items-center justify-between px-5 py-4 border-t border-border/20">
                <button
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setStep(1)}
                >
                   Back
                </button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleDone}
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Done! Let\'s go '}
                </motion.button>
              </div>

              <div className="flex justify-center gap-1.5 pb-4">
                {[0, 1, 2].map(i => (
                  <div key={i} className={`h-1.5 rounded-full transition-all ${i === 2 ? 'w-6 bg-primary' : 'w-2 bg-muted'}`} />
                ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

