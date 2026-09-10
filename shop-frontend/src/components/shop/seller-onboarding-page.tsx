'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Store, Upload, ChevronRight, ChevronLeft,
  CheckCircle2, Building2, CreditCard, FileText, User,
  Globe, Phone, Mail, Lock, PartyPopper,
  AlertCircle, LogIn,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useShopRouter } from '@/hooks/use-shop-router'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type Step = 1 | 2 | 3 | 4

interface FormData {
  businessName: string
  businessEmail: string
  businessPhone: string
  storeName: string
  storeDescription: string
  bankName: string
  accountNumber: string
  routingNumber: string
  agreedToTerms: boolean
}

const stepConfig: Record<Step, { label: string; icon: React.ElementType }> = {
  1: { label: 'Business Info', icon: Building2 },
  2: { label: 'Store Setup', icon: Store },
  3: { label: 'Bank Details', icon: CreditCard },
  4: { label: 'Review', icon: FileText },
}

export function SellerOnboardingPage() {
  const { goBack } = useShopRouter()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [submitting, setSubmitting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [form, setForm] = useState<FormData>({
    businessName: '', businessEmail: '', businessPhone: '',
    storeName: '', storeDescription: '',
    bankName: '', accountNumber: '', routingNumber: '',
    agreedToTerms: false,
  })

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const isStepValid = (): boolean => {
    switch (currentStep) {
      case 1: return !!(form.businessName && form.businessEmail && form.businessPhone)
      case 2: return !!(form.storeName && form.storeDescription)
      case 3: return !!(form.bankName && form.accountNumber && form.routingNumber)
      case 4: return form.agreedToTerms
      default: return false
    }
  }

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error('Please log in to become a seller')
      router.push('/login?callbackUrl=/seller-onboarding')
    }
  }, [status, router])

  // Show loading while checking auth
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  // Show login required message if not authenticated
  if (status === 'unauthenticated') {
    return (
      <motion.div 
        className="min-h-screen bg-background flex flex-col items-center justify-center px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="max-w-md w-full text-center">
          {/* Alert Icon */}
          <motion.div 
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/10 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          >
            <AlertCircle className="h-10 w-10 text-amber-500" />
          </motion.div>

          {/* Title */}
          <h1 className="text-xl font-bold text-foreground mb-3">
            Login Required
          </h1>

          {/* Message */}
          <p className="text-sm text-muted-foreground mb-2">
            To become a seller on Grapsee, you need to be logged in with your account.
          </p>
          <p className="text-xs text-muted-foreground/70 mb-8">
            This helps us verify your identity and keep your seller account secure.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3">
            <Button 
              className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => router.push('/login?callbackUrl=/seller-onboarding')}
            >
              <LogIn className="h-4 w-4" />
              Log In to Continue
            </Button>
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={goBack}
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back to Shop
            </Button>
          </div>

          {/* Info Card */}
          <motion.div 
            className="mt-8 p-4 rounded-xl bg-muted/50 border border-border/50 text-left"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-[11px] text-muted-foreground font-medium mb-2">What you&apos;ll need:</p>
            <ul className="text-[11px] text-muted-foreground/80 space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                A valid Grapsee account
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                Business information & documents
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                Bank account for payouts
              </li>
            </ul>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/seller/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setCompleted(true)
        toast.success('Application submitted! ')
      } else {
        toast.error('Submission failed. Please try again.')
      }
    } catch {
      toast.error('Network error. Please try again.')
    }
    setSubmitting(false)
  }

  if (completed) {
    return (
      <motion.div className="min-h-screen bg-background flex flex-col items-center justify-center px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
          <CheckCircle2 className="h-20 w-20 text-emerald-500" />
        </motion.div>
        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
          <PartyPopper className="h-10 w-10 text-amber-500 mt-4" />
        </motion.div>
        <h2 className="text-xl font-bold text-foreground mt-4">Application Submitted!</h2>
        <p className="text-xs text-muted-foreground mt-1 text-center max-w-[260px]">Your seller application is under review. We&apos;ll notify you within 24-48 hours.</p>
        <Button className="mt-6 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={goBack}>
          Back to Shop
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div className="min-h-screen bg-background pb-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack} className="flex-shrink-0 text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" /> Become a Seller
            </h1>
          </div>
          <Badge className="bg-primary/10 text-primary border border-primary/30 text-[10px]">
            Step {currentStep}/4
          </Badge>
        </div>
        {/* Progress Bar */}
        <div className="mt-2 flex gap-1">
          {[1, 2, 3, 4].map(step => (
            <div key={step} className="flex-1 h-1.5 rounded-full overflow-hidden bg-muted/30">
              <motion.div
                className={`h-full rounded-full ${step <= currentStep ? 'bg-primary' : 'bg-transparent'}`}
                initial={{ width: 0 }}
                animate={{ width: step <= currentStep ? '100%' : '0%' }}
                transition={{ duration: 0.3 }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Step Icons Row */}
      <div className="mx-4 mt-3 flex items-center justify-between">
        {([1, 2, 3, 4] as Step[]).map(step => {
          const cfg = stepConfig[step]
          const StepIcon = cfg.icon
          const isActive = step === currentStep
          const isComplete = step < currentStep
          return (
            <div key={step} className="flex flex-col items-center gap-1">
              <motion.div className={`flex h-9 w-9 items-center justify-center rounded-full ${isComplete ? 'bg-emerald-500/20' : isActive ? 'bg-primary/20' : 'bg-muted/30'}`}
                animate={{ scale: isActive ? 1.1 : 1 }}>
                {isComplete ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <StepIcon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />}
              </motion.div>
              <span className={`text-[8px] ${isActive ? 'text-primary font-bold' : 'text-muted-foreground'}`}>{cfg.label}</span>
            </div>
          )
        })}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div key={currentStep} className="mx-4 mt-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
          {currentStep === 1 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground mb-1">Business Information</h3>
              <div>
                <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Business Name *</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Your Business Name" className="pl-9 h-10 text-sm bg-muted/30 border-border/30" value={form.businessName} onChange={e => updateField('businessName', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Business Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="email" placeholder="business@example.com" className="pl-9 h-10 text-sm bg-muted/30 border-border/30" value={form.businessEmail} onChange={e => updateField('businessEmail', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Business Phone *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="tel" placeholder="" className="pl-9 h-10 text-sm bg-muted/30 border-border/30" value={form.businessPhone} onChange={e => updateField('businessPhone', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground mb-1">Store Setup</h3>
              <div>
                <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Store Name *</label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Your Store Name" className="pl-9 h-10 text-sm bg-muted/30 border-border/30" value={form.storeName} onChange={e => updateField('storeName', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Store Logo</label>
                <div className="flex items-center gap-3 rounded-xl border border-dashed border-border/50 bg-muted/20 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted/50">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-foreground font-medium">Upload Logo</p>
                    <p className="text-[9px] text-muted-foreground">PNG, JPG up to 2MB</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Store Description *</label>
                <Textarea placeholder="Describe your store and what you sell..." className="min-h-[80px] text-sm bg-muted/30 border-border/30 resize-none" value={form.storeDescription} onChange={e => updateField('storeDescription', e.target.value)} />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground mb-1">Bank Details</h3>
              <div>
                <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Bank Name *</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Bank Name" className="pl-9 h-10 text-sm bg-muted/30 border-border/30" value={form.bankName} onChange={e => updateField('bankName', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Account Number *</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Account Number" className="pl-9 h-10 text-sm bg-muted/30 border-border/30" value={form.accountNumber} onChange={e => updateField('accountNumber', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Routing Number *</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Routing Number" className="pl-9 h-10 text-sm bg-muted/30 border-border/30" value={form.routingNumber} onChange={e => updateField('routingNumber', e.target.value)} />
                </div>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 flex items-start gap-2">
                <Lock className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground">Your banking information is encrypted and securely stored. We never share your financial details.</p>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground mb-1">Review & Submit</h3>
              <div className="rounded-xl border border-border/50 bg-card p-3 space-y-2">
                {[
                  { label: 'Business', value: form.businessName || '' },
                  { label: 'Email', value: form.businessEmail || '' },
                  { label: 'Phone', value: form.businessPhone || '' },
                  { label: 'Store', value: form.storeName || '' },
                  { label: 'Bank', value: form.bankName || '' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="text-foreground font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={form.agreedToTerms} onChange={e => updateField('agreedToTerms', e.target.checked)} className="mt-1 rounded border-border" />
                <span className="text-[10px] text-muted-foreground leading-relaxed">I agree to the Seller Terms & Conditions, including commission rates and platform policies.</span>
              </label>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="mx-4 mt-6 flex gap-3">
        {currentStep > 1 && (
          <Button variant="outline" className="flex-1 gap-1" onClick={() => setCurrentStep((currentStep - 1) as Step)}>
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
        )}
        {currentStep < 4 ? (
          <Button className="flex-1 gap-1 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={!isStepValid()} onClick={() => setCurrentStep((currentStep + 1) as Step)}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button className="flex-1 gap-1 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={!isStepValid() || submitting} onClick={handleSubmit}>
            {submitting ? 'Submitting...' : <><CheckCircle2 className="h-4 w-4" /> Submit Application</>}
          </Button>
        )}
      </div>
    </motion.div>
  )
}

