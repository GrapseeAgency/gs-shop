'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useShopRouter } from '@/hooks/use-shop-router'

interface FAQ {
  question: string
  answer: string
}

const faqs: FAQ[] = [
  {
    question: 'How long does delivery take?',
    answer: 'Delivery times vary by product. Most digital services are delivered within 5-14 business days. Enterprise packages may take 3-4 weeks. You\'ll receive a detailed timeline after purchase.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept Cash on Delivery, Bank Transfer, and Online Payments (credit/debit cards). All online payments are processed securely through our encrypted payment gateway.',
  },
  {
    question: 'Can I request a refund?',
    answer: 'Yes! We offer a 30-day money-back guarantee on all products. If you\'re not satisfied with the delivered service, contact our support team for a full refund.',
  },
  {
    question: 'Do you offer ongoing support?',
    answer: 'All purchases include 30 days of free support. Premium members get 24/7 priority support and extended warranty coverage for up to 12 months.',
  },
  {
    question: 'Can I customize a package?',
    answer: 'Absolutely! Use our Bundle & Save feature to combine any 3+ services and save 30%. Or contact us for a fully custom enterprise solution tailored to your needs.',
  },
  {
    question: 'Is there a loyalty program?',
    answer: 'Yes! Join Grapsee Rewards to earn points on every purchase. Points can be redeemed for discounts, priority delivery, and exclusive member-only deals.',
  },
]

function FAQItem({ faq, index }: { faq: FAQ; index: number }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      className="rounded-xl border border-primary/15 bg-card/65 backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-primary/30 shadow-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <button
        className="flex w-full items-center justify-between gap-3 p-3.5 text-left transition-colors hover:bg-primary/5"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm font-bold text-foreground pr-2">{faq.question}</span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-primary transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-3.5 pb-3.5 pt-1 border-t border-primary/5">
              <p className="text-xs leading-relaxed text-muted-foreground/90 font-medium">
                {faq.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function FAQSection() {
  const { goContact } = useShopRouter()

  return (
    <section className="px-4 py-4 relative z-10">
      {/* Header */}
      <div className="mb-3.5 flex items-center gap-2">
        <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 overflow-hidden shadow-sm">
          <div className="absolute inset-0 liquid-aurora opacity-40 animate-aurora" />
          <HelpCircle className="relative z-10 h-4 w-4 text-primary animate-swell" />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-gradient-green">Help Center</h2>
          <p className="text-[10px] font-semibold text-muted-foreground/80">Frequently asked questions</p>
        </div>
      </div>

      {/* FAQ Items */}
      <div className="space-y-2.5">
        {faqs.map((faq, index) => (
          <FAQItem key={index} faq={faq} index={index} />
        ))}
      </div>

      {/* Contact CTA */}
      <div className="mt-4.5 rounded-2xl glass p-4 text-center border border-primary/10 relative overflow-hidden shadow-sm">
        <div className="absolute inset-0 liquid-aurora opacity-5 -z-10" />
        <p className="text-xs font-semibold text-muted-foreground mb-2.5">Still have questions?</p>
        <Button
          size="sm"
          variant="outline"
          className="gap-2 text-primary border-primary/30 bg-background/30 hover:bg-primary/10 rounded-full btn-liquid font-bold"
          onClick={() => goContact()}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Contact Support
        </Button>
      </div>
    </section>
  )
}

