'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Shield,
  Lock,
  Eye,
  Database,
  Mail,
  Globe,
  ChevronDown,
  Cookie,
  Users,
  Baby,
  FileText,
  Clock,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useShopRouter } from '@/hooks/use-shop-router'

interface PrivacySection {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  content: string[]
}

const sections: PrivacySection[] = [
  {
    id: 'information-we-collect',
    title: 'Information We Collect',
    icon: Database,
    content: [
      'We collect information you provide directly to us when you create an account, place an order, subscribe to our newsletter, contact customer support, or otherwise communicate with us. This includes:',
      ' Personal Identification: Your name, email address, phone number, and profile photo when you create an account.',
      ' Payment Information: Credit/debit card details, mobile banking information, and billing address when you make a purchase. Payment card data is processed by our PCI-compliant payment providers and never stored on our servers in plaintext.',
      ' Order Data: Products purchased, delivery addresses, order history, and any special instructions you provide.',
      ' Communications: Messages you send to our support team, chat logs, and feedback submissions.',
      ' Auto-Collected Data: Device information (browser type, OS version), IP address, approximate location (city/country level), pages visited, products viewed, search queries, click patterns, and session duration.',
      ' Cookies & Local Storage: Session tokens, preferences, shopping cart data, and analytics identifiers stored on your device.',
    ],
  },
  {
    id: 'how-we-use',
    title: 'How We Use Your Information',
    icon: Eye,
    content: [
      'We use the information we collect to provide, maintain, and improve our services, and to communicate with you. Specifically, we use your data to:',
      ' Process and fulfill your orders, including shipping, returns, and refunds.',
      ' Send order confirmations, shipping updates, and delivery notifications via email and SMS.',
      ' Personalize your shopping experience with product recommendations, curated collections, and tailored deals based on your browsing and purchase history.',
      ' Send promotional offers, flash deal alerts, and rewards program updates  only with your explicit consent. You can opt out at any time from your notification settings.',
      ' Detect and prevent fraud, unauthorized transactions, and abuse of our platform.',
      ' Analyze usage patterns to improve our website performance, UI/UX design, and service quality.',
      ' Provide customer support and respond to your inquiries, complaints, and feedback.',
      ' Comply with legal obligations and enforce our Terms of Service.',
    ],
  },
  {
    id: 'data-storage-security',
    title: 'Data Storage & Security',
    icon: Lock,
    content: [
      'We implement industry-leading security measures to protect your personal information:',
      ' Encryption: All data in transit is secured using TLS 1.3 encryption. Sensitive data at rest is encrypted using AES-256 encryption standards.',
      ' Access Controls: Role-based access control (RBAC) limits employee access to personal data on a need-to-know basis. All access is logged and audited.',
      ' Infrastructure: Our services are hosted on SOC 2 Type II certified cloud infrastructure with multi-region redundancy and automated backups.',
      ' Payment Security: All payment transactions are processed through PCI-DSS Level 1 certified payment providers. We never store complete credit card numbers on our servers.',
      ' Regular Audits: We conduct quarterly security assessments and annual penetration tests by independent third-party firms.',
      ' Data Retention: We retain your personal data only for as long as necessary to fulfill the purposes outlined in this policy, typically up to 3 years after your last interaction with our platform, unless a longer retention period is required by law.',
      ' Breach Notification: In the event of a data breach that poses a risk to your rights, we will notify you and the relevant supervisory authority within 72 hours as required by applicable data protection laws.',
    ],
  },
  {
    id: 'cookies',
    title: 'Cookies & Tracking Technologies',
    icon: Cookie,
    content: [
      'We use cookies and similar tracking technologies to enhance your browsing experience:',
      ' Essential Cookies: Required for the website to function properly  session management, shopping cart, authentication, and security features. These cannot be disabled.',
      ' Analytics Cookies: Help us understand how visitors interact with our website (pages visited, time spent, bounce rate). We use anonymized data and do not track you across other websites.',
      ' Functional Cookies: Remember your preferences such as language, currency, theme (dark/light mode), and recently viewed products.',
      ' Marketing Cookies: Used to deliver personalized advertisements and track the effectiveness of our marketing campaigns. These are only set with your explicit consent.',
      'You can manage your cookie preferences at any time through the cookie consent banner or your browser settings. Disabling certain cookies may affect the functionality of our website.',
      'We also use web beacons and pixel tags in our emails to track open rates and improve our communications.',
    ],
  },
  {
    id: 'third-party-sharing',
    title: 'Third-Party Sharing',
    icon: Globe,
    content: [
      'We do not sell, rent, or trade your personal data to third parties. We may share your information only in the following circumstances:',
      ' Service Providers: We share data with trusted partners who help us operate our platform  payment processors, shipping carriers, email service providers, and cloud hosting. All partners are contractually bound to protect your data.',
      ' Legal Requirements: We may disclose your data if required by law, regulation, legal process, or governmental request.',
      ' Business Transfers: In the event of a merger, acquisition, or sale of assets, your data may be transferred to the acquiring entity under the same privacy protections.',
      ' With Your Consent: We will share your data with third parties only when you have given us explicit consent to do so.',
      ' Aggregated Data: We may share anonymized, aggregated data that cannot be used to identify you for industry analysis, marketing, or other purposes.',
      'Our third-party partners include: Stripe (payments), AWS (hosting), SendGrid (email), Google Analytics (analytics), and local shipping carriers.',
    ],
  },
  {
    id: 'your-rights',
    title: 'Your Rights',
    icon: Shield,
    content: [
      'Depending on your location, you may have the following rights regarding your personal data:',
      ' Right to Access: You can request a copy of all personal data we hold about you. We will provide this within 30 days in a machine-readable format.',
      ' Right to Rectification: You can request correction of any inaccurate or incomplete personal data.',
      ' Right to Erasure: You can request deletion of your personal data, subject to legal retention requirements. Upon deletion, your account and all associated data will be permanently removed.',
      ' Right to Portability: You can request to receive your data in a structured, commonly used, and machine-readable format (JSON or CSV).',
      ' Right to Object: You can object to our processing of your data for direct marketing purposes at any time.',
      ' Right to Restrict Processing: You can request that we limit how we use your data in certain circumstances.',
      ' Right to Withdraw Consent: Where processing is based on consent, you can withdraw your consent at any time without affecting the lawfulness of prior processing.',
      'To exercise any of these rights, please contact our Data Protection Officer at privacy@grapsee.shop. We will respond to all legitimate requests within 30 days.',
    ],
  },
  {
    id: 'childrens-privacy',
    title: "Children's Privacy",
    icon: Baby,
    content: [
      'Our services are not directed to individuals under the age of 16. We do not knowingly collect personal information from children under 16.',
      'If we become aware that we have collected personal data from a child under 16 without verification of parental consent, we will take steps to delete that information as quickly as possible.',
      'Parents or guardians who believe their child has provided personal information to us should contact us immediately at privacy@grapsee.shop, and we will take appropriate action.',
      'We encourage parents and guardians to monitor their children\'s online activities and to help us protect their privacy by instructing them never to provide personal information on our website without permission.',
    ],
  },
  {
    id: 'changes',
    title: 'Changes to This Policy',
    icon: FileText,
    content: [
      'We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors.',
      'When we make material changes, we will notify you by:',
      ' Posting a prominent notice on our website homepage.',
      ' Sending an email notification to the address associated with your account.',
      ' Updating the "Last Updated" date at the top of this policy.',
      'For significant changes that affect your rights, we will provide at least 30 days\' notice before the changes take effect. Your continued use of our services after the effective date constitutes acceptance of the updated policy.',
      'We encourage you to review this page periodically to stay informed about how we protect your information.',
    ],
  },
  {
    id: 'contact',
    title: 'Contact Us',
    icon: Mail,
    content: [
      'If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:',
      ' Data Protection Officer: privacy@grapsee.shop',
      ' General Inquiries: support@grapsee.shop',
      ' Phone: +1 (415) 555-0199 (MonFri, 9AM6PM PST)',
      ' Mailing Address: Grapsee Technologies Inc., 123 Digital Avenue, Suite 400, San Francisco, CA 94107, United States',
      ' For EU residents: Our EU representative can be reached at eu-rep@grapsee.shop',
      'We aim to respond to all privacy-related inquiries within 5 business days. If you are not satisfied with our response, you have the right to lodge a complaint with your local data protection authority.',
    ],
  },
]

export function PrivacyView() {
  const { goBack } = useShopRouter()
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['information-we-collect']))

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
          <h1 className="text-lg font-bold text-foreground">Privacy Policy</h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Last updated: February 15, 2025
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
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Your Privacy Matters</h3>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          At Grapsee, we are committed to protecting your privacy and ensuring the security of your personal information. This policy explains in detail how we collect, use, store, and protect your data when you use our digital services marketplace.
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
                            {paragraph.startsWith('') ? paragraph : paragraph}
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

      {/* Regulatory Notice */}
      <motion.div
        className="mt-5 rounded-2xl bg-muted/30 border border-border/30 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-foreground mb-1">Regulatory Compliance</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              This privacy policy is designed to comply with the General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and other applicable data protection laws. We regularly review our practices to ensure ongoing compliance.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

