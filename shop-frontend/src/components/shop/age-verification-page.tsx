'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Shield, Calendar, Upload, Camera, FileText,
  CheckCircle2, XCircle, Clock, ChevronRight, Sparkles,
  AlertTriangle, UserCheck, BadgeCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useShopRouter } from '@/hooks/use-shop-router'

type VerificationStep = 'verify' | 'confirm' | 'done'
type VerificationMethod = 'id-upload' | 'selfie' | 'declaration'
type VerificationStatus = 'pending' | 'verified' | 'rejected'

interface ConfettiParticle {
  id: number
  x: number
  y: number
  color: string
  rotation: number
  scale: number
}

export function AgeVerificationPage() {
  const { goBack, goHome } = useShopRouter()
  const [step, setStep] = useState<VerificationStep>('verify')
  const [method, setMethod] = useState<VerificationMethod | null>(null)
  const [status, setStatus] = useState<VerificationStatus>('pending')
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [age, setAge] = useState<number | null>(null)
  const [confettiParticles, setConfettiParticles] = useState<ConfettiParticle[]>([])
  const [existingStatus, setExistingStatus] = useState<VerificationStatus | null>(null)

  // Check existing verification status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/verify-age')
        if (res.ok) {
          const data = await res.json()
          if (data.status === 'verified') {
            setExistingStatus('verified')
            setStep('done')
            setStatus('verified')
          } else if (data.status === 'rejected') {
            setExistingStatus('rejected')
          }
        }
      } catch {
        // silent
      }
    }
    checkStatus()
  }, [])

  const triggerConfetti = useCallback(() => {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
    const particles: ConfettiParticle[] = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 320 - 160,
      y: -(Math.random() * 400 + 100),
      color: colors[i % colors.length],
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.8,
    }))
    setConfettiParticles(particles)
    setTimeout(() => setConfettiParticles([]), 3500)
  }, [])

  const calculateAge = () => {
    if (!day || !month || !year) return null
    const dob = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    const today = new Date()
    let calculatedAge = today.getFullYear() - dob.getFullYear()
    const monthDiff = today.getMonth() - dob.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      calculatedAge--
    }
    return calculatedAge
  }

  const handleVerify = async () => {
    if (!method) {
      setError('Please select a verification method')
      return
    }
    if (!day || !month || !year) {
      setError('Please enter your date of birth')
      return
    }

    const calculatedAge = calculateAge()
    setAge(calculatedAge)

    setLoading(true)
    setError('')

    try {
      const dob = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      const res = await fetch('/api/verify-age', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateOfBirth: dob,
          method,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.status === 'verified') {
          setStatus('verified')
          setStep('confirm')
        } else {
          setStatus('rejected')
          setStep('confirm')
        }
      }
    } catch {
      setError('Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = () => {
    setStep('done')
    if (status === 'verified') {
      triggerConfetti()
      setTimeout(() => goHome(), 4000)
    }
  }

  const stepItems = [
    { key: 'verify' as const, label: 'Verify', icon: Shield },
    { key: 'confirm' as const, label: 'Confirm', icon: BadgeCheck },
    { key: 'done' as const, label: 'Done', icon: CheckCircle2 },
  ]

  const currentStepIndex = stepItems.findIndex(s => s.key === step)

  const methods: { key: VerificationMethod; label: string; desc: string; icon: typeof Upload }[] = [
    { key: 'id-upload', label: 'ID Upload', desc: 'Upload a government ID', icon: Upload },
    { key: 'selfie', label: 'Selfie Verification', desc: 'Take a live selfie', icon: Camera },
    { key: 'declaration', label: 'Declaration', desc: 'Self-declare your age', icon: FileText },
  ]

  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' },
  ]
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i)

  return (
    <motion.div className="min-h-screen bg-background pb-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
      {/* Confetti */}
      {confettiParticles.length > 0 && (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
          {confettiParticles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute left-1/2 top-1/2 h-3 w-3 rounded-sm"
              style={{ backgroundColor: p.color }}
              initial={{ x: 0, y: 0, rotate: 0, scale: 0 }}
              animate={{
                x: p.x,
                y: p.y + 600,
                rotate: p.rotation + 720,
                scale: p.scale,
                opacity: [1, 1, 0],
              }}
              transition={{ duration: 2.5, ease: 'easeOut' }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack} className="flex-shrink-0 text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-500" /> Age Verification
            </h1>
          </div>
          <Badge variant="outline" className={`text-[10px] ${
            status === 'verified' ? 'border-emerald-500/30 text-emerald-500' :
            status === 'rejected' ? 'border-red-500/30 text-red-500' :
            'border-amber-500/30 text-amber-500'
          }`}>
            {status === 'verified' ? 'Verified' : status === 'rejected' ? 'Rejected' : 'Pending'}
          </Badge>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          {stepItems.map((s, i) => (
            <div key={s.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <motion.div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${
                    i < currentStepIndex ? 'bg-emerald-500 border-emerald-500 text-white' :
                    i === currentStepIndex ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' :
                    'bg-muted border-border text-muted-foreground'
                  }`}
                  animate={{ scale: i === currentStepIndex ? [1, 1.1, 1] : 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {i < currentStepIndex ? <CheckCircle2 className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                </motion.div>
                <span className={`text-[10px] mt-1 ${
                  i <= currentStepIndex ? 'text-emerald-500 font-medium' : 'text-muted-foreground'
                }`}>{s.label}</span>
              </div>
              {i < stepItems.length - 1 && (
                <div className={`h-0.5 w-8 -mt-4 ${
                  i < currentStepIndex ? 'bg-emerald-500' : 'bg-border'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="px-4">
        <AnimatePresence mode="wait">
          {/* Step 1: Verify */}
          {step === 'verify' && (
            <motion.div key="verify" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              {/* Info Banner */}
              <div className="mb-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
                    <UserCheck className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Why verify your age?</p>
                    <p className="text-xs text-muted-foreground mt-0.5">We need to confirm you are 18+ for certain products and services. Your data is encrypted and secure.</p>
                  </div>
                </div>
              </div>

              {/* Date of Birth */}
              <div className="mb-4">
                <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Date of Birth
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="">Day</option>
                    {days.map(d => <option key={d} value={d.toString()}>{d}</option>)}
                  </select>
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="">Month</option>
                    {months.map(m => <option key={m.value} value={m.value.toString()}>{m.label.slice(0, 3)}</option>)}
                  </select>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="">Year</option>
                    {years.map(y => <option key={y} value={y.toString()}>{y}</option>)}
                  </select>
                </div>
                {age !== null && day && month && year && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-xs mt-1.5 ${age >= 18 ? 'text-emerald-500' : 'text-red-500'}`}>
                    You are {age} years old {age >= 18 ? '' : ''}
                  </motion.p>
                )}
              </div>

              {/* Verification Method */}
              <div className="mb-4">
                <label className="text-sm font-medium text-foreground mb-2 block">Verification Method</label>
                <div className="space-y-2">
                  {methods.map((m) => (
                    <motion.button
                      key={m.key}
                      onClick={() => { setMethod(m.key); setError('') }}
                      className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                        method === m.key
                          ? 'border-emerald-500 bg-emerald-500/5'
                          : 'border-border bg-card hover:border-emerald-500/30'
                      }`}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        method === m.key ? 'bg-emerald-500/20' : 'bg-muted/50'
                      }`}>
                        <m.icon className={`h-5 w-5 ${method === m.key ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${method === m.key ? 'text-emerald-500' : 'text-foreground'}`}>{m.label}</p>
                        <p className="text-[11px] text-muted-foreground">{m.desc}</p>
                      </div>
                      {method === m.key && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-3 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3">
                  <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <p className="text-xs text-red-500">{error}</p>
                </motion.div>
              )}

              {/* Submit */}
              <Button
                onClick={handleVerify}
                disabled={loading || !method || !day || !month || !year}
                className="w-full gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                {loading ? (
                  <motion.div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }} />
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    Verify My Age
                  </>
                )}
              </Button>

              {/* Privacy Note */}
              <p className="text-[10px] text-muted-foreground text-center mt-3 px-4">
                By verifying, you agree that your information is processed securely and will not be shared with third parties.
              </p>
            </motion.div>
          )}

          {/* Step 2: Confirm */}
          {step === 'confirm' && (
            <motion.div key="confirm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <div className="flex flex-col items-center py-6">
                <motion.div
                  className={`flex h-20 w-20 items-center justify-center rounded-full ${
                    status === 'verified' ? 'bg-emerald-500/10' : 'bg-red-500/10'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.6 }}
                >
                  {status === 'verified' ? (
                    <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                  ) : (
                    <XCircle className="h-10 w-10 text-red-500" />
                  )}
                </motion.div>

                <motion.h2
                  className="mt-4 text-xl font-bold text-foreground"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {status === 'verified' ? 'Age Verified!' : 'Verification Failed'}
                </motion.h2>

                <motion.p
                  className="mt-1 text-sm text-muted-foreground text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {status === 'verified'
                    ? `You are ${age} years old. Your age has been successfully verified.`
                    : 'You must be at least 18 years old to access age-restricted content.'}
                </motion.p>

                <motion.div
                  className="mt-4 w-full rounded-xl border border-border bg-card p-4 space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date of Birth</span>
                    <span className="text-foreground font-medium">{day}/{month}/{year}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Method</span>
                    <span className="text-foreground font-medium capitalize">{method?.replace('-', ' ')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Age</span>
                    <span className={`font-medium ${age && age >= 18 ? 'text-emerald-500' : 'text-red-500'}`}>{age} years</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge className={status === 'verified' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}>
                      {status === 'verified' ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                      {status === 'verified' ? 'Verified' : 'Rejected'}
                    </Badge>
                  </div>
                </motion.div>

                <Button
                  onClick={handleConfirm}
                  className={`mt-4 w-full gap-2 ${status === 'verified' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-primary hover:bg-primary/90'}`}
                >
                  {status === 'verified' ? 'Continue' : 'Try Again'}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Done */}
          {step === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <div className="flex flex-col items-center py-10">
                <motion.div
                  className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', duration: 0.8 }}
                >
                  <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                    <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                  </motion.div>
                </motion.div>

                <motion.h2 className="mt-5 text-2xl font-bold text-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                  All Set! 
                </motion.h2>
                <motion.p className="mt-2 text-sm text-muted-foreground text-center max-w-[280px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                  Your age has been verified. You now have full access to all products and services on Grapsee Shop.
                </motion.p>

                <motion.div className="mt-6 w-full space-y-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                  {[
                    { icon: Shield, text: 'Age-restricted products unlocked' },
                    { icon: Clock, text: 'Verification valid for 1 year' },
                    { icon: BadgeCheck, text: 'Verified badge on your profile' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                    >
                      <item.icon className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm text-foreground">{item.text}</span>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
                  <p className="mt-6 text-xs text-muted-foreground">Redirecting to home...</p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

