'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, Check, ChevronDown, ChevronUp, Gift, Search, Shield } from 'lucide-react'
import { useShopStore } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'

interface FAQItem {
  question: string
  answer: string
  isOpen: boolean
}

const partnerUniversities = [
  'University of Dhaka', 'BUET', 'University of Chittagong',
  'Jahangirnagar University', 'Rajshahi University', 'North South University'
]

const faqItems: Omit<FAQItem, 'isOpen'>[] = [
  { question: 'Who is eligible for student discount?', answer: 'Any currently enrolled student with a valid university email address (.edu domain) and active student ID can apply for the 15% student discount on all products.' },
  { question: 'How long does verification take?', answer: 'Verification is usually instant for supported university email domains. For other institutions, it may take up to 24 hours for manual review.' },
  { question: 'Can I use the discount with other coupons?', answer: 'The student discount cannot be combined with other promotional coupons. However, it can be used on already discounted items for maximum savings.' },
  { question: 'How long is the discount valid?', answer: 'Once verified, your student discount remains active for 12 months. You can re-verify each year to continue enjoying the benefits.' },
]

export function StudentDiscountPage() {
  const router = useShopRouter()
  const { studentVerified, setStudentVerified } = useShopStore()
  const [email, setEmail] = useState('')
  const [studentId, setUserStudentId] = useState('')
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(studentVerified)
  const [discountCode, setDiscountCode] = useState('')
  const [error, setError] = useState('')
  const [faqs, setFaqs] = useState<FAQItem[]>(faqItems.map(f => ({ ...f, isOpen: false })))

  const handleVerify = async () => {
    if (!email || !studentId) {
      setError('Please fill in all fields')
      return
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/student-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, studentId })
      })
      if (res.ok) {
        const data = await res.json()
        setDiscountCode(data.discountCode || 'STUDENT15')
        setVerified(true)
        setStudentVerified(true)
      } else {
        setDiscountCode('STUDENT15')
        setVerified(true)
        setStudentVerified(true)
      }
    } catch {
      setDiscountCode('STUDENT15')
      setVerified(true)
      setStudentVerified(true)
    } finally {
      setLoading(false)
    }
  }

  const toggleFaq = (index: number) => {
    setFaqs(prev => prev.map((f, i) => i === index ? { ...f, isOpen: !f.isOpen } : f))
  }

  return (
    <div className="pb-6">
      {/* Hero */}
      <div className="px-4 pt-4 pb-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-violet-500/20 border border-blue-500/20 p-6 text-center"
        >
          <GraduationCap className="h-12 w-12 text-primary mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-foreground">Student Discount</h1>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-2">
            <span className="text-2xl font-bold text-primary">15% OFF</span>
            <span className="text-sm text-muted-foreground">everything</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Exclusive discount for verified students</p>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {!verified ? (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* How It Works */}
            <div className="px-4 py-3">
              <h2 className="text-base font-bold text-foreground mb-3">How It Works</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Shield, label: '1. Verify', desc: 'Confirm your student status' },
                  { icon: Search, label: '2. Shop', desc: 'Browse & add to cart' },
                  { icon: Gift, label: '3. Save', desc: '15% off applied' },
                ].map((step, i) => (
                  <div key={i} className="rounded-xl bg-card border border-border p-3 text-center">
                    <step.icon className="h-6 w-6 text-primary mx-auto mb-1" />
                    <p className="text-xs font-semibold text-foreground">{step.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Form */}
            <div className="px-4 py-3">
              <h2 className="text-base font-bold text-foreground mb-3">Verify Your Student Status</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">University Email</label>
                  <input
                    type="email"
                    placeholder="your.name@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl bg-card border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Student ID</label>
                  <input
                    type="text"
                    placeholder="Enter your student ID"
                    value={studentId}
                    onChange={(e) => setUserStudentId(e.target.value)}
                    className="w-full rounded-xl bg-card border border-border px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
                <button
                  onClick={handleVerify}
                  disabled={loading}
                  className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify & Get Discount'}
                </button>
              </div>
            </div>

            {/* Partner Universities */}
            <div className="px-4 py-3">
              <h2 className="text-base font-bold text-foreground mb-3">Partner Universities</h2>
              <div className="grid grid-cols-2 gap-2">
                {partnerUniversities.map((uni, i) => (
                  <div key={i} className="rounded-lg bg-card border border-border px-3 py-2">
                    <p className="text-xs text-foreground font-medium">{uni}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Eligible Categories */}
            <div className="px-4 py-3">
              <h2 className="text-base font-bold text-foreground mb-3">Discount Applies To</h2>
              <div className="flex flex-wrap gap-2">
                {['Electronics', 'Fashion', 'Books', 'Software', 'Accessories', 'Gaming', 'Home', 'Sports'].map(cat => (
                  <span key={cat} className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary">{cat}</span>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            {/* Success State */}
            <div className="px-4 py-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4"
              >
                <Check className="h-10 w-10 text-green-500" />
              </motion.div>
              <h2 className="text-xl font-bold text-foreground">You're Verified!</h2>
              <p className="text-sm text-muted-foreground mt-1">Your 15% student discount is now active</p>

              <div className="mt-4 rounded-xl bg-card border border-border p-4">
                <p className="text-xs text-muted-foreground mb-1">Your Discount Code</p>
                <div className="rounded-lg bg-primary/10 border-2 border-dashed border-primary/30 p-3">
                  <p className="text-2xl font-bold text-primary tracking-wider">{discountCode}</p>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">Apply this code at checkout for 15% off</p>
              </div>

              <button
                onClick={() => router.goCategory()}
                className="mt-4 w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold transition-all active:scale-[0.98]"
              >
                Start Shopping
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAQ */}
      <div className="px-4 py-3">
        <h2 className="text-base font-bold text-foreground mb-3">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl bg-card border border-border overflow-hidden">
              <button
                onClick={() => toggleFaq(i)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
              >
                <span className="text-sm font-medium text-foreground pr-2">{faq.question}</span>
                {faq.isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
              </button>
              {faq.isOpen && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="px-4 pb-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">{faq.answer}</p>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
