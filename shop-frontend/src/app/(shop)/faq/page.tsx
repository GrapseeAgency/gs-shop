'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Search, ChevronDown, ChevronUp, HelpCircle,
  Phone, MessageCircle, Package, Truck, RotateCcw, CreditCard,
  User, ShoppingBag, Star, BookOpen, ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useShopRouter } from '@/hooks/use-shop-router'

type Category = 'general' | 'orders' | 'shipping' | 'returns' | 'payment' | 'account' | 'products'

interface FAQ {
  question: string
  answer: string
  category: Category
  popular?: boolean
}

const FAQ_DATA: FAQ[] = [
  // General
  { question: 'What is Grapsee Shop?', answer: 'Grapsee Shop is a premium digital mall offering a curated selection of digital products and services. From SaaS dashboards to mobile apps, design templates to enterprise solutions  we bring the best digital products under one roof with secure payments and instant delivery.', category: 'general', popular: true },
  { question: 'How do I create an account?', answer: 'Creating an account is simple! Click the "Sign Up" button in the top right corner, enter your email address and create a password. You can also sign up using your Google or GitHub account for faster access. Once verified, you can start shopping immediately.', category: 'general' },
  { question: 'Is Grapsee Shop available internationally?', answer: 'Yes! Grapsee Shop serves customers worldwide. We support multiple currencies (BDT, USD, EUR) and languages. Digital products are delivered instantly regardless of your location. Physical merchandise shipping availability may vary by region.', category: 'general' },
  { question: 'How do I contact customer support?', answer: 'You can reach our support team through multiple channels: Live Chat (24/7), Email (support@grapsee.shop), Phone (+880-1-800-GRAPE), or through our Help Center. VIP members get priority support with dedicated agents.', category: 'general', popular: true },
  { question: 'What payment methods do you accept?', answer: 'We accept Credit/Debit Cards (Visa, Mastercard), Mobile Banking (bKash, Nagad, Rocket), Grapsee Wallet, Bank Transfer, and Cash on Delivery for select regions. All transactions are secured with SSL encryption.', category: 'general', popular: true },

  // Orders
  { question: 'How do I place an order?', answer: 'Browse our products, add items to your cart, and proceed to checkout. Select your preferred shipping and payment method, then confirm your order. You\'ll receive an email confirmation with your order details and tracking number within minutes.', category: 'orders', popular: true },
  { question: 'Can I modify my order after placing it?', answer: 'You can modify your order within 1 hour of placement. Go to My Orders, select the order, and click "Modify". After 1 hour, the order enters processing and modifications are no longer possible. You can still cancel within 2 hours for a full refund.', category: 'orders' },
  { question: 'How do I cancel an order?', answer: 'To cancel an order, go to My Orders, select the order you want to cancel, and click "Cancel Order". Cancellations are free within 2 hours of placing the order. After that, a processing fee may apply depending on the order status.', category: 'orders' },
  { question: 'What is the order processing time?', answer: 'Most digital products are delivered instantly. Physical items and custom solutions typically process within 1-3 business days. You\'ll receive email updates at each stage: Order Placed  Processing  Shipped  Delivered.', category: 'orders' },
  { question: 'How do I track my order?', answer: 'Once your order ships, you\'ll receive a tracking number via email. You can also track orders in real-time through the Track Order page in your account. Enter your tracking number to see live updates on your package location.', category: 'orders', popular: true },

  // Shipping
  { question: 'What are the shipping options?', answer: 'We offer three shipping tiers: Standard (5-7 business days, free on orders over $100), Express (2-3 business days, $9.99), and Same-Day Delivery (available in select cities, $14.99). VIP members get free shipping on all orders.', category: 'shipping', popular: true },
  { question: 'Do you offer international shipping?', answer: 'Yes, we ship to over 50 countries. International shipping typically takes 7-14 business days for Standard and 3-5 days for Express. Shipping costs vary by destination and package weight. Free international shipping on orders over $200.', category: 'shipping' },
  { question: 'What if my package is lost or damaged?', answer: 'If your package is lost or arrives damaged, contact us immediately. We\'ll investigate and provide a full refund or replacement within 48 hours. All packages are insured against loss and damage during transit.', category: 'shipping' },
  { question: 'Can I change my delivery address?', answer: 'You can update your delivery address before the order ships. Go to My Orders, select the order, and click "Change Address". Once shipped, address changes may not be possible, but our support team will try to help coordinate with the carrier.', category: 'shipping' },

  // Returns
  { question: 'What is your return policy?', answer: 'We offer a 30-day return policy for most products. Digital products (software, templates) can be returned within 7 days if not downloaded. Physical items must be in original packaging. VIP members enjoy an extended 60-day return window.', category: 'returns', popular: true },
  { question: 'How do I initiate a return?', answer: 'Go to My Orders, select the item you want to return, and click "Request Return". Choose your reason and upload photos if applicable. We\'ll review your request within 24 hours and provide return shipping instructions.', category: 'returns' },
  { question: 'How long do refunds take?', answer: 'Refunds are processed within 3-5 business days after we receive the returned item. The refund will be credited to your original payment method. Grapsee Wallet refunds are instant. Bank/card refunds may take 5-10 business days to appear.', category: 'returns' },
  { question: 'Can I exchange instead of return?', answer: 'Yes! You can exchange items for a different size, color, or version. Select "Exchange" instead of "Return" when submitting your request. Exchanges are typically processed faster than returns.', category: 'returns' },

  // Payment
  { question: 'Is my payment information secure?', answer: 'Absolutely. We use industry-standard SSL encryption and never store your full card details. All payments are processed through PCI-DSS compliant gateways. We also support two-factor authentication for added security.', category: 'payment', popular: true },
  { question: 'Can I use multiple payment methods?', answer: 'Yes! You can split your payment between Grapsee Wallet and another payment method. You can also use gift cards and coupon codes in combination with other payment methods. The remaining balance will be charged to your secondary method.', category: 'payment' },
  { question: 'Do you offer installment payments?', answer: 'Yes, we offer installment plans for orders over $500 through our banking partners. Choose "Pay in Installments" at checkout. Options include 3-month (0% interest) and 6-month (2% interest) plans. Subject to credit approval.', category: 'payment' },

  // Account
  { question: 'How do I reset my password?', answer: 'Click "Forgot Password" on the login page, enter your registered email, and we\'ll send you a reset link. The link expires in 24 hours. If you don\'t receive the email, check your spam folder or contact support.', category: 'account' },
  { question: 'How do I join the VIP program?', answer: 'Our VIP program is based on reward points. Earn points by shopping (10 pts/item), daily logins (5 pts), and referrals (100 pts). Reach tiers: Bronze (0+), Silver (500+), Gold (1000+), Platinum (2500+), Diamond (5000+). Higher tiers unlock more benefits!', category: 'account', popular: true },
  { question: 'How do I enable two-factor authentication?', answer: 'Go to Settings  Security  Enable 2FA. You can use an authenticator app (Google Authenticator, Authy) or SMS verification. We strongly recommend enabling 2FA to protect your account from unauthorized access.', category: 'account' },

  // Products
  { question: 'Are the digital products licensed?', answer: 'Yes, all digital products come with a commercial license. You can use them for personal and commercial projects. Some premium products include extended licenses for multi-user teams. Check individual product pages for specific license details.', category: 'products' },
  { question: 'Do you offer product customization?', answer: 'Many of our digital products support customization. Look for the "Customizable" badge on product pages. Premium and Enterprise tier customers can request custom modifications through our dedicated support team. Additional fees may apply.', category: 'products' },
  { question: 'How do I access my purchased products?', answer: 'After purchase, digital products are instantly available in your account under "My Purchases". You can download them anytime. You\'ll also receive a confirmation email with download links. Physical products will be shipped to your address.', category: 'products', popular: true },
]

const CATEGORIES: { key: Category; label: string; icon: React.ElementType }[] = [
  { key: 'general', label: 'General', icon: BookOpen },
  { key: 'orders', label: 'Orders', icon: Package },
  { key: 'shipping', label: 'Shipping', icon: Truck },
  { key: 'returns', label: 'Returns', icon: RotateCcw },
  { key: 'payment', label: 'Payment', icon: CreditCard },
  { key: 'account', label: 'Account', icon: User },
  { key: 'products', label: 'Products', icon: ShoppingBag },
]

export default function FaqPage() {
  const { goBack, goHelp, goContact } = useShopRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<Category>('general')
  const [expandedQ, setExpandedQ] = useState<string | null>(null)

  const popularFaqs = FAQ_DATA.filter(f => f.popular)

  const filteredFaqs = useMemo(() => {
    let faqs = FAQ_DATA
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      faqs = faqs.filter(f =>
        f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)
      )
    } else {
      faqs = faqs.filter(f => f.category === activeCategory)
    }
    return faqs
  }, [searchQuery, activeCategory])

  return (
    <motion.div
      className="pb-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goBack} className="text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              FAQ
            </h1>
            <p className="text-[11px] text-muted-foreground">Find answers to common questions</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mx-4 mt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions..."
            className="pl-9 h-11 bg-card border-border/50"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mx-4 mt-3 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon
          const count = FAQ_DATA.filter(f => f.category === cat.key).length
          return (
            <button
              key={cat.key}
              onClick={() => { setActiveCategory(cat.key); setSearchQuery('') }}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.key && !searchQuery
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'bg-muted/50 text-muted-foreground border border-transparent hover:bg-muted'
              }`}
            >
              <Icon className="h-3 w-3" />
              {cat.label}
              <span className="text-[9px] opacity-60">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Popular Questions */}
      {!searchQuery && activeCategory === 'general' && (
        <div className="mx-4 mt-4">
          <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-400" />
            Popular Questions
          </h3>
          <div className="space-y-1.5">
            {popularFaqs.map((faq, i) => (
              <motion.button
                key={faq.question}
                className="w-full flex items-center gap-2 rounded-xl border border-border/50 bg-card p-3 text-left hover:bg-muted/30 active:scale-[0.99] transition-all"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => {
                  setActiveCategory(faq.category)
                  setExpandedQ(faq.question)
                }}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 flex-shrink-0">
                  <Star className="h-3 w-3 text-amber-400" />
                </div>
                <span className="text-xs text-foreground flex-1">{faq.question}</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <Separator className="mx-4 my-3" />

      {/* FAQ Accordion */}
      <div className="mx-4 space-y-2">
        {filteredFaqs.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <HelpCircle className="h-12 w-12 text-muted-foreground/20 mb-3" />
            <p className="text-sm font-medium text-foreground">No questions found</p>
            <p className="text-[11px] text-muted-foreground">Try a different search term or category</p>
          </div>
        ) : (
          filteredFaqs.map((faq, i) => {
            const isExpanded = expandedQ === faq.question
            return (
              <motion.div
                key={faq.question}
                className="rounded-xl border border-border/50 bg-card overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <button
                  className="w-full p-3 flex items-start gap-3 text-left"
                  onClick={() => setExpandedQ(isExpanded ? null : faq.question)}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0 mt-0.5">
                    <HelpCircle className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground pr-2">{faq.question}</p>
                  </div>
                  <div className="flex-shrink-0 mt-0.5">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      className="px-3 pb-3 border-t border-border/20"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-xs text-muted-foreground leading-relaxed pt-3 pl-10">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Still need help? CTA */}
      <div className="mx-4 mt-4">
        <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4">
          <h3 className="text-sm font-bold text-foreground mb-1">Still need help?</h3>
          <p className="text-[11px] text-muted-foreground mb-3">
            Our support team is available 24/7 to assist you
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="gap-2 h-auto py-3 flex-col"
              onClick={goHelp}
            >
              <HelpCircle className="h-5 w-5 text-primary" />
              <span className="text-[11px]">Help Center</span>
            </Button>
            <Button
              variant="outline"
              className="gap-2 h-auto py-3 flex-col"
              onClick={goContact}
            >
              <MessageCircle className="h-5 w-5 text-primary" />
              <span className="text-[11px]">Contact Us</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Contact Support Card */}
      <div className="mx-4 mt-3 rounded-2xl border border-border/50 bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
            <Phone className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Talk to a Human</p>
            <p className="text-[10px] text-muted-foreground">Average response time: &lt;5 minutes</p>
          </div>
          <Button size="sm" onClick={goContact} className="gap-1.5">
            <Phone className="h-3 w-3" />
            Call
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
