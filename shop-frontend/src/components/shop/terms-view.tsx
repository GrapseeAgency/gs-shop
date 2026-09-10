'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  FileText,
  Scale,
  AlertTriangle,
  RefreshCw,
  CreditCard,
  UserCheck,
  ChevronDown,
  Truck,
  Shield,
  Globe,
  Lock,
  Gavel,
  Mail,
  Clock,
  AlertCircle,
  Package,
  DollarSign,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useShopRouter } from '@/hooks/use-shop-router'

interface TermsSection {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  content: string[]
}

const sections: TermsSection[] = [
  {
    id: 'acceptance',
    title: 'Acceptance of Terms',
    icon: FileText,
    content: [
      'By accessing and using Grapsee Shop (captainpiracy.shop), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you must not access or use our services.',
      'These Terms constitute a legally binding agreement between you ("User", "you", or "your") and Grapsee Technologies Inc. ("Company", "we", "us", or "our"), governing your use of our website, mobile applications, and all related services (collectively, the "Services").',
      'We reserve the right to modify these Terms at any time. Changes become effective upon posting. Your continued use of the Services after modifications constitutes acceptance of the revised Terms.',
      'By using our Services, you represent that you are at least 16 years of age and have the legal capacity to enter into these Terms. If you are using the Services on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.',
    ],
  },
  {
    id: 'account-terms',
    title: 'Account Terms',
    icon: UserCheck,
    content: [
      'To access certain features of our Services, you must create an account. When creating an account, you agree to:',
      ' Provide accurate, current, and complete information during registration and keep your account details updated.',
      ' Maintain the security and confidentiality of your login credentials. You are solely responsible for all activities that occur under your account.',
      ' Notify us immediately of any unauthorized use of your account or any other breach of security at security@grapsee.shop.',
      ' Not create multiple accounts for the purpose of abusing promotions, rewards, or other benefits.',
      ' Not use another person\'s account without their explicit permission.',
      'We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or have been inactive for more than 24 consecutive months.',
      'Account deletion requests can be submitted through your account settings or by contacting support. Upon deletion, all associated data will be permanently removed within 30 days, subject to legal retention requirements.',
    ],
  },
  {
    id: 'products-pricing',
    title: 'Products & Pricing',
    icon: Package,
    content: [
      'All products listed on Grapsee Shop are digital services including but not limited to: websites, mobile applications, DevOps solutions, UI/UX design services, and enterprise software.',
      ' Pricing: All prices are displayed in your selected currency (BDT, USD, or EUR) and include applicable taxes unless stated otherwise. Prices are subject to change without prior notice, though such changes will not affect orders already placed.',
      ' Product Descriptions: We make every effort to ensure product descriptions, features, and specifications are accurate. However, we do not warrant that descriptions are entirely error-free.',
      ' Service Tiers: Products may be offered in multiple tiers (Basic, Standard, Premium) with varying features, deliverables, and pricing. The specific terms of each tier are outlined on the product page.',
      ' Availability: Product availability is subject to change. We reserve the right to discontinue any product or service without prior notice.',
      ' Promotional Pricing: Discounted prices and promotional offers are valid for the specified period only. We reserve the right to modify or cancel promotions at any time.',
    ],
  },
  {
    id: 'orders-payment',
    title: 'Orders & Payment',
    icon: CreditCard,
    content: [
      'By placing an order on Grapsee Shop, you agree to the following terms:',
      ' Order Acceptance: Your order constitutes an offer to purchase. We reserve the right to accept or decline any order. An order is confirmed only when you receive an official order confirmation email.',
      ' Payment Methods: We accept Cash on Delivery (COD), Bank Transfer, Online Payment (credit/debit cards), Mobile Banking, and Wallet payments. Payment must be received before digital services are delivered, except for COD orders.',
      ' Payment Security: All online payments are processed through PCI-DSS Level 1 certified payment gateways. We do not store your complete credit card information on our servers.',
      ' Order Cancellation: You may cancel an order within 24 hours of placement at no charge. Cancellations after 24 hours may be subject to a processing fee of up to 10% of the order value if work has commenced.',
      ' Coupon & Discount Codes: Promotional codes must be applied at checkout and cannot be applied retroactively. Each code may only be used once per customer unless stated otherwise. We reserve the right to invalidate codes that are used fraudulently.',
      ' Price Errors: In the event of a pricing error, we reserve the right to cancel the order and notify you of the cancellation. We will offer you the option to re-order at the correct price.',
    ],
  },
  {
    id: 'shipping-delivery',
    title: 'Shipping & Delivery',
    icon: Truck,
    content: [
      'As a digital services marketplace, delivery of our products differs from traditional e-commerce:',
      ' Digital Delivery: Most services are delivered electronically via email, secure download links, or direct deployment to your specified servers/platforms.',
      ' Delivery Timeframes: Estimated delivery times are listed on each product page and vary by service tier. Standard delivery is 5-7 business days, Express is 2-3 business days, and Same-Day is available for select services.',
      ' Delivery Confirmation: You will receive email notifications at each stage of the delivery process: order confirmed, work commenced, review ready, and final delivery.',
      ' Physical Deliveries: For services that include physical components (branded merchandise, printed materials, hardware), shipping costs and timeframes will be calculated at checkout based on your location.',
      ' Delivery Delays: While we strive to meet all delivery estimates, delays may occur due to scope changes, technical complexity, or factors beyond our control. We will communicate any delays promptly.',
      ' Acceptance: Upon delivery, you have 7 business days to review and accept the deliverables. Failure to respond within this period constitutes acceptance.',
    ],
  },
  {
    id: 'returns-refunds',
    title: 'Returns & Refunds',
    icon: RefreshCw,
    content: [
      'We offer a comprehensive return and refund policy to ensure your satisfaction:',
      ' 30-Day Money-Back Guarantee: All products come with a 30-day money-back guarantee from the date of delivery. If you are not satisfied, you may request a full refund within this period.',
      ' Eligibility: To be eligible for a refund, the delivered service must not have been substantially modified, deployed to production, or used commercially. The product must be in its original delivered state.',
      ' Partial Refunds: Services that have been partially delivered or where work has commenced may be eligible for a partial refund, calculated based on the percentage of work completed.',
      ' Refund Process: Refund requests must be submitted through your order detail page or by contacting support@grapsee.shop. Include your order ID and reason for the request.',
      ' Processing Time: Approved refunds are processed within 5-10 business days. The refund will be issued to the original payment method. Bank processing times may vary.',
      ' Non-Refundable Items: Custom services that have been explicitly approved and accepted by the customer, and gift card purchases, are non-refundable.',
      ' Exchange: Instead of a refund, you may request an exchange for a different product or service of equal or lesser value, subject to availability.',
    ],
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual Property',
    icon: Lock,
    content: [
      'All content and materials on Grapsee Shop are protected by intellectual property laws:',
      ' Ownership: All content on our platform  including text, graphics, logos, icons, images, audio, software, and their compilation  is the property of Grapsee Technologies Inc. or its content suppliers and is protected by international copyright laws.',
      ' Product IP: Upon full payment and delivery, the intellectual property rights of the purchased digital service are transferred to the customer as specified in the product\'s license agreement. Unless otherwise stated, customers receive a perpetual, non-exclusive license to use the delivered product.',
      ' Trademarks: "Grapsee", "Grapsee Shop", "Grapsee Technologies", and associated logos are trademarks of Grapsee Technologies Inc. You may not use these marks without our prior written consent.',
      ' User Content: By submitting content (reviews, feedback, photos) to our platform, you grant us a non-exclusive, royalty-free, perpetual, and worldwide license to use, reproduce, and distribute that content in connection with our Services.',
      ' DMCA: We respect intellectual property rights. If you believe any content on our platform infringes your copyright, please file a DMCA notice at legal@grapsee.shop.',
    ],
  },
  {
    id: 'limitation-liability',
    title: 'Limitation of Liability',
    icon: AlertTriangle,
    content: [
      'To the maximum extent permitted by applicable law:',
      ' Grapsee Technologies Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, use, goodwill, or other intangible losses, resulting from (a) your access to or use of or inability to access or use the Services; (b) any conduct or content of any third party on the Services; (c) any content obtained from the Services; or (d) unauthorized access, use, or alteration of your transmissions or content.',
      ' In no event shall our total liability exceed the amount paid by you to us in the twelve (12) months preceding the claim, or $1,000 USD, whichever is greater.',
      ' We do not guarantee that the Services will be uninterrupted, timely, secure, or error-free. We are not responsible for any damage to your computer system or loss of data that results from your use of the Services.',
      ' We are not liable for the actions or omissions of third-party service providers, including payment processors and shipping carriers.',
      ' Some jurisdictions do not allow the exclusion or limitation of certain warranties or liabilities, so the above limitations may not apply to you. In such cases, our liability is limited to the fullest extent permitted by law.',
    ],
  },
  {
    id: 'governing-law',
    title: 'Governing Law',
    icon: Gavel,
    content: [
      'These Terms shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions.',
      'Any disputes arising from these Terms or your use of the Services shall be resolved through the following process:',
      ' Step 1: Informal Resolution  Contact our support team at support@grapsee.shop. We will attempt to resolve the dispute within 30 business days.',
      ' Step 2: Mediation  If the dispute is not resolved informally, both parties agree to attempt mediation before pursuing litigation. Mediation will be conducted by a mutually agreed-upon mediator.',
      ' Step 3: Arbitration  Any disputes not resolved through mediation shall be submitted to binding arbitration under the rules of the American Arbitration Association (AAA). The arbitration shall be conducted in San Francisco, California.',
      'For users located in the European Union, you may also bring proceedings in the courts of your country of residence, and the mandatory consumer protection laws of your country of residence will apply.',
    ],
  },
  {
    id: 'changes',
    title: 'Changes to Terms',
    icon: Globe,
    content: [
      'We reserve the right to modify or replace these Terms at any time at our sole discretion.',
      ' If a revision is material, we will provide at least 30 days\' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.',
      ' We will notify you of significant changes by: (a) posting a notice on our website homepage, (b) sending an email to the address associated with your account, and (c) updating the "Effective Date" at the top of this page.',
      ' Your continued use of the Services after the effective date of any changes constitutes acceptance of the revised Terms.',
      ' If you do not agree with the revised Terms, you must stop using the Services and may request a refund for any pending orders in accordance with our refund policy.',
      ' It is your responsibility to review these Terms periodically. We recommend bookmarking this page for easy reference.',
    ],
  },
  {
    id: 'contact',
    title: 'Contact Information',
    icon: Mail,
    content: [
      'For questions, concerns, or disputes regarding these Terms of Service, please contact us:',
      ' Legal Department: legal@grapsee.shop',
      ' Customer Support: support@grapsee.shop',
      ' Phone: +1 (415) 555-0199 (MonFri, 9AM6PM PST)',
      ' Mailing Address: Grapsee Technologies Inc., Legal Department, 123 Digital Avenue, Suite 400, San Francisco, CA 94107, United States',
      ' DMCA Notices: legal@grapsee.shop',
      'We aim to respond to all inquiries within 2 business days. Urgent legal matters will be prioritized.',
    ],
  },
]

export function TermsView() {
  const { goBack, goContact } = useShopRouter()
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['acceptance']))

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setOpenSections((prev) => new Set(prev).add(id))
    }
  }

  return (
    <motion.div
      className="px-4 py-2 pb-8"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => goBack()} className="flex-shrink-0 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-lg font-bold text-foreground">Terms of Service</h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Effective: February 1, 2025
          </p>
        </div>
      </div>

      {/* Intro Banner */}
      <motion.div
        className="mb-5 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-4"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Scale className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Legal Agreement</h3>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Please read these Terms of Service carefully before using Grapsee Shop. By accessing or using our platform, you agree to be bound by these terms and conditions. These terms apply to all visitors, users, and customers.
        </p>
      </motion.div>

      {/* Table of Contents */}
      <motion.div
        className="mb-5 rounded-2xl border border-border/50 bg-card p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Table of Contents</h3>
        <div className="space-y-1">
          {sections.map((section, index) => {
            const Icon = section.icon
            return (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="flex w-full items-center gap-2 rounded-lg p-2 text-left transition-colors hover:bg-muted/30 active:scale-[0.99]"
              >
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
                  {index + 1}
                </span>
                <Icon className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">{section.title}</span>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Accordion Sections */}
      <div className="space-y-2">
        {sections.map((section, index) => {
          const Icon = section.icon
          const isOpen = openSections.has(section.id)
          return (
            <motion.div
              key={section.id}
              id={section.id}
              className="rounded-2xl border border-border/50 bg-card overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * index }}
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="flex w-full items-center gap-3 p-4 text-left hover:bg-muted/10 transition-colors"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
                </div>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </motion.div>
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4">
                      <Separator className="mb-3" />
                      <div className="space-y-2">
                        {section.content.map((paragraph, pIndex) => (
                          <p
                            key={pIndex}
                            className={`text-xs leading-relaxed ${
                              paragraph.startsWith('') ? 'text-foreground pl-2' : 'text-muted-foreground'
                            }`}
                          >
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* Legal Notice */}
      <motion.div
        className="mt-5 rounded-2xl bg-muted/30 border border-border/30 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-foreground mb-1">Legal Notice</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              These Terms of Service constitute the entire agreement between you and Grapsee Technologies Inc. regarding the use of our Services. If any provision of these Terms is held to be unenforceable, the remaining provisions will remain in full force and effect.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Contact CTA */}
      <div className="mt-4 rounded-xl bg-gradient-to-r from-primary/10 to-transparent p-4 text-center">
        <p className="text-sm font-semibold text-foreground mb-1">Questions about our terms?</p>
        <p className="text-xs text-muted-foreground mb-3">Our legal team is here to help</p>
        <Button size="sm" variant="outline" className="text-xs border-primary/30 text-primary hover:bg-primary/10" onClick={() => goContact()}>
          <Mail className="mr-1.5 h-3.5 w-3.5" />
          Contact Us
        </Button>
      </div>
    </motion.div>
  )
}

