'use client'

import { useState } from 'react'
import { 
  Sparkles, DollarSign, Clock, Shield, Heart, Brain, 
  Zap, Gift, MapPin, Users, Search, ChevronRight,
  Accessibility, Leaf, Shirt, Home, CreditCard, Plane,
  Car, Smartphone, Utensils, Paintbrush, Package, Layout,
  Palette, Code, BookOpen, Play, Wand2, RefreshCw, FileText,
  TrendingUp, BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

const featureCategories = [
  {
    icon: DollarSign,
    title: 'Money Savers',
    color: 'green',
    description: 'Save money on every purchase',
    features: [
      { name: 'Price Drop Refund', path: '/price-drop-refund', desc: 'Auto-detect price drops and claim refunds', new: true },
      { name: 'Auto Coupon', path: '/auto-coupon', desc: 'Best coupons auto-applied at checkout', new: true },
      { name: 'Price Lock', path: '/price-lock', desc: 'Lock price for 30 days with 100 deposit', new: true },
      { name: 'Bulk Buy', path: '/bulk-buy', desc: 'Get sellers to compete for your bulk order', new: true },
      { name: 'Product Liquidator', path: '/product-liquidator', desc: 'Sell old items on 5 platforms at once', new: true },
      { name: 'Subscription Audit', path: '/subscription-audit', desc: 'Find and cancel unused subscriptions', new: true },
      { name: 'Tax Refund', path: '/tax-refund', desc: 'Auto-find tax-deductible purchases', new: true },
      { name: 'Flashback Deals', path: '/flashback-deals', desc: 'Items you viewed now on sale', new: true },
      { name: 'Smart Reorder', path: '/smart-reorder', desc: 'Auto-reorder when supplies run low', new: true },
      { name: 'Discount Stacking', path: '/discount-stacking', desc: 'Optimal coupon + wallet + points combo', new: true },
    ]
  },
  {
    icon: Clock,
    title: 'Time Savers',
    color: 'blue',
    description: 'Save hours, not minutes',
    features: [
      { name: 'Recipe to Cart', path: '/recipe-to-cart', desc: 'Convert any recipe to shopping list', new: true },
      { name: 'Grocery List Import', path: '/grocery-list-import', desc: 'Photo of handwritten list  cart', new: true },
      { name: 'Prescription Scan', path: '/prescription-scan', desc: 'Upload prescription  medicines in cart', new: true },
      { name: 'SMS Order', path: '/sms-order', desc: 'Order via SMS - no internet needed', new: true },
      { name: 'USSD Menu', path: '/ussd-menu', desc: '*123*45# for feature phones', new: true },
      { name: 'WhatsApp Bulk', path: '/whatsapp-bulk', desc: 'Order via WhatsApp with catalog', new: true },
      { name: 'Clipboard Purchase', path: '/clipboard-purchase', desc: 'Copy product  instant buy option', new: true },
      { name: 'Shopping List Autocomplete', path: '/shopping-list-autocomplete', desc: 'Smart suggestions as you type', new: true },
      { name: 'Emergency Quick-Buy', path: '/emergency-quick-buy', desc: 'Essentials in 1-hour delivery', new: true },
      { name: 'One-Click Reorder', path: '/one-click-reorder', desc: 'Same as last time, but modified', new: true },
    ]
  },
  {
    icon: Shield,
    title: 'Trust Builders',
    color: 'indigo',
    description: 'Shop with confidence',
    features: [
      { name: 'Video Verification', path: '/video-verification', desc: '2-min video call with seller before buying', new: true },
      { name: 'Verified Photos', path: '/verified-photos', desc: 'Only real buyers can upload photos', new: true },
      { name: 'Ingredient Scanner', path: '/ingredient-scanner', desc: 'Decode every ingredient in plain language', new: true },
      { name: 'Safety Recall Alerts', path: '/safety-recall', desc: 'Instant alerts if product recalled', new: true },
      { name: 'Medicine Interaction', path: '/medicine-interaction', desc: 'Check for dangerous drug combinations', new: true },
      { name: 'Expiry Guarantee', path: '/expiry-guarantee', desc: 'Free replacement if <6 months expiry', new: true },
      { name: 'Crowd Wisdom', path: '/crowd-wisdom', desc: 'See what 10,000+ people chose', new: true },
      { name: 'Deal Authenticity', path: '/deal-authenticity', desc: 'Verify if sale price is genuine', new: true },
    ]
  },
  {
    icon: Heart,
    title: 'Lifestyle & Health',
    color: 'rose',
    description: 'Personalized for your life',
    features: [
      { name: 'Appliance Repair', path: '/appliance-repair', desc: 'Verified technicians in 2 taps', new: true },
      { name: 'Medicine Tracker', path: '/medicine-tracker', desc: 'Never use expired medicine', new: true },
      { name: 'Pet Supply Auto-Pilot', path: '/pet-supplies', desc: 'Auto-reorder pet food monthly', new: true },
      { name: 'School Supplies Kit', path: '/school-supplies', desc: 'Complete list by grade level', new: true },
      { name: 'Moving Kit', path: '/moving-kit', desc: 'Everything for your move', new: true },
      { name: 'Diabetic Scanner', path: '/diabetic-scanner', desc: 'Check sugar/GI of any food', new: true },
      { name: 'Halal Checker', path: '/halal-checker', desc: 'Instant halal status scan', new: true },
      { name: 'Allergy Checker', path: '/allergy-checker', desc: 'Cross-checks all products for allergens', new: true },
      { name: 'Child Growth Tracker', path: '/child-growth', desc: 'Auto-suggest clothing sizes', new: true },
    ]
  },
  {
    icon: Brain,
    title: 'Smart Tools',
    color: 'purple',
    description: 'AI-powered shopping helpers',
    features: [
      { name: 'Unit Price Calculator', path: '/unit-price-calculator', desc: 'Find best value per gram/liter', new: true },
      { name: 'EMI Calculator', path: '/emi-calculator', desc: 'Compare 5 banks side-by-side', new: true },
      { name: 'Resale Value Calculator', path: '/resale-value-calculator', desc: 'True cost of ownership', new: true },
      { name: 'Spec Compare', path: '/spec-compare', desc: 'Side-by-side with highlighted differences', new: true },
      { name: 'Alternative Finder', path: '/alternative-finder', desc: 'Same specs, lower price', new: true },
      { name: 'Use-Case Matcher', path: '/use-case-matcher', desc: 'Best product for your needs', new: true },
      { name: 'Currency Converter', path: '/currency-converter', desc: 'See prices in 7 currencies', new: true },
      { name: 'Tip Calculator', path: '/tip-calculator', desc: 'Split bills with friends', new: true },
    ]
  },
  {
    icon: Zap,
    title: 'Smart Reminders',
    color: 'amber',
    description: 'Never miss what matters',
    features: [
      { name: 'Subscription Expiry', path: '/subscription-expiry', desc: 'Cancel before auto-renewal', new: true },
      { name: 'Document Expiry', path: '/document-expiry', desc: 'Passport, license renewal alerts', new: true },
      { name: 'Vehicle Service', path: '/vehicle-service', desc: 'Service due reminders', new: true },
      { name: 'Seasonal Clothing', path: '/seasonal-clothing', desc: 'Rotate wardrobe on time', new: true },
      { name: 'Warranty Expiry', path: '/warranty-expiry', desc: 'Track warranty expiration', new: true },
    ]
  },
  {
    icon: Accessibility,
    title: 'Accessibility',
    color: 'pink',
    description: 'Shopping for everyone',
    features: [
      { name: 'Senior Mode', path: '/senior-mode', desc: 'Large fonts, voice assist, simple UI', new: true },
      { name: 'Visual Impaired', path: '/visual-impaired', desc: 'Screen reader & audio descriptions', new: true },
      { name: 'Student Budget', path: '/student-budget', desc: 'Budget tracking & essentials', new: true },
    ]
  },
  {
    icon: Leaf,
    title: 'Sustainability',
    color: 'green',
    description: 'Shop responsibly',
    features: [
      { name: 'Sustainable Finder', path: '/sustainable-finder', desc: 'Eco-friendly product alternatives', new: true },
      { name: 'Carbon Calculator', path: '/carbon-calculator', desc: 'Track carbon footprint', new: true },
    ]
  },
  {
    icon: Shirt,
    title: 'Fashion & Style',
    color: 'pink',
    description: 'Look your best',
    features: [
      { name: 'Style Quiz', path: '/style-quiz', desc: 'Discover your style', new: true },
      { name: 'Body Type', path: '/body-type', desc: 'Size recommendations', new: true },
      { name: 'Color Advisor', path: '/color-advisor', desc: 'Color matching guide', new: true },
      { name: 'Trend Forecaster', path: '/trend-forecaster', desc: 'Upcoming trends', new: true },
      { name: 'Size Predictor', path: '/size-predictor', desc: 'AI size predictions', new: true },
      { name: 'Wardrobe Planner', path: '/wardrobe-planner', desc: 'Mix and match outfits', new: true },
      { name: 'Event Stylist', path: '/event-stylist', desc: 'Outfit for any occasion', new: true },
    ]
  },
  {
    icon: Home,
    title: 'Home Services',
    color: 'orange',
    description: 'Help around the house',
    features: [
      { name: 'Assembly Finder', path: '/assembly-finder', desc: 'Furniture assembly help', new: true },
      { name: 'Ingredient Swap', path: '/ingredient-swap', desc: 'Cooking substitutes', new: true },
      { name: 'Project Planner', path: '/project-planner', desc: 'DIY project materials', new: true },
    ]
  },
  {
    icon: CreditCard,
    title: 'Payment & Finance',
    color: 'blue',
    description: 'Smart spending tools',
    features: [
      { name: 'Installment Compare', path: '/installment-compare', desc: 'Compare EMI options', new: true },
      { name: 'Fuel Cost Calculator', path: '/fuel-cost-calculator', desc: 'Driving vs delivery cost', new: true },
      { name: 'Insurance Claim', path: '/insurance-claim', desc: 'File product claims', new: true },
      { name: 'Resale Calculator', path: '/resale-calculator', desc: 'Product depreciation value', new: true },
    ]
  },
  {
    icon: Package,
    title: 'Gifting',
    color: 'red',
    description: 'Perfect presents',
    features: [
      { name: 'Gift Matcher', path: '/gift-matcher', desc: 'Find the right gift', new: true },
    ]
  },
  {
    icon: Utensils,
    title: 'Food & Cooking',
    color: 'orange',
    description: 'Kitchen helpers',
    features: [
      { name: 'Measurement Converter', path: '/measurement-converter', desc: 'Convert cups, grams, etc', new: true },
      { name: 'Tip Calculator', path: '/tip-calculator', desc: 'Split bills easily', new: true },
    ]
  },
  {
    icon: Smartphone,
    title: 'Ordering Methods',
    color: 'indigo',
    description: 'Order your way',
    features: [
      { name: 'SMS Order', path: '/sms-order', desc: 'No internet required', new: true },
      { name: 'USSD Menu', path: '/ussd-menu', desc: '*123*45# feature phone', new: true },
      { name: 'WhatsApp Bulk', path: '/whatsapp-bulk', desc: 'Order via WhatsApp', new: true },
      { name: 'Clipboard Purchase', path: '/clipboard-purchase', desc: 'Copy and buy instantly', new: true },
    ]
  },
  {
    icon: Plane,
    title: 'Travel & More',
    color: 'cyan',
    description: 'Travel essentials',
    features: [
      { name: 'Currency Converter', path: '/currency-converter', desc: 'Live exchange rates', new: true },
    ]
  },
  {
    icon: Layout,
    title: 'Templates & Starters',
    color: 'blue',
    description: 'Premium templates for developers',
    features: [
      { name: 'Next.js Landing Page', path: '/templates/nextjs-landing', desc: 'Landing page template store', new: true },
      { name: 'E-commerce Starter', path: '/templates', desc: 'E-commerce starter kits', new: true },
      { name: 'Portfolio Templates', path: '/templates', desc: 'Portfolio website templates', new: true },
      { name: 'Admin Dashboard', path: '/templates', desc: 'Dashboard admin templates', new: true },
      { name: 'SaaS Boilerplate', path: '/templates', desc: 'SaaS boilerplate with auth/billing', new: true },
    ]
  },
  {
    icon: Palette,
    title: 'UI Component Packs',
    color: 'purple',
    description: 'Ready-to-use components',
    features: [
      { name: 'Figma Components', path: '/ui-kits', desc: '50 premium Figma components', new: true },
      { name: 'Tailwind Library', path: '/ui-kits', desc: 'Tailwind CSS component library', new: true },
      { name: 'Icon Packs', path: '/ui-kits', desc: '500+ custom icons', new: true },
      { name: 'Animation Pack', path: '/ui-kits', desc: '100 Framer Motion presets', new: true },
    ]
  },
  {
    icon: Code,
    title: 'Code Snippets',
    color: 'green',
    description: 'Production-ready code',
    features: [
      { name: 'Auth in a Box', path: '/snippets', desc: 'Complete auth system ready to paste', new: true },
      { name: 'Payment Kit', path: '/snippets', desc: 'Stripe + SSLCommerz integration', new: true },
      { name: 'SEO Script', path: '/snippets', desc: 'SEO optimization script', new: true },
      { name: 'Database Schemas', path: '/database-schemas', desc: 'Prisma schemas for all projects', new: true },
      { name: 'CI/CD Templates', path: '/cicd', desc: 'GitHub Actions & GitLab CI', new: true },
    ]
  },
  {
    icon: BookOpen,
    title: 'Documentation',
    color: 'orange',
    description: 'Step-by-step guides',
    features: [
      { name: 'Deployment Guide', path: '/guides', desc: 'Next.js deployment guide', new: true },
      { name: 'DevOps Pipeline', path: '/guides', desc: 'DevOps setup guide', new: true },
      { name: 'UI/UX Principles', path: '/guides', desc: 'UI/UX guide for developers', new: true },
      { name: 'App Store Checklist', path: '/guides', desc: 'App Store approval guide', new: true },
    ]
  },
  {
    icon: FileText,
    title: 'Real Digital Products',
    color: 'indigo',
    description: 'Products people use daily worldwide',
    features: [
      { name: 'Resume Builder', path: '/resume-builder', desc: 'ATS-friendly resumes. 299-999', new: true },
      { name: 'Legal Documents', path: '/legal-documents', desc: 'NDAs, contracts, rental agreements', new: true },
      { name: 'Form Builder', path: '/form-builder', desc: 'Like Typeform. Free to start', new: true },
      { name: 'Appointment Scheduler', path: '/scheduler', desc: 'Like Calendly. 799/mo', new: true },
    ]
  },
  {
    icon: Zap,
    title: 'Service Delivery Engine',
    color: 'orange',
    description: 'Complete project management system',
    features: [
      { name: 'Service Configurator', path: '/service-configurator', desc: 'Build services with live pricing', new: true },
      { name: 'Project Dashboard', path: '/project-dashboard', desc: 'Real-time progress tracking', new: true },
      { name: 'Milestone Approval', path: '/milestones', desc: 'Client approval workflow', new: true },
      { name: 'Revision Tokens', path: '/revision-tokens', desc: 'Additional revision purchases', new: true },
      { name: 'Scope Change Detector', path: '/scope-change', desc: 'Auto-detect scope changes', new: true },
      { name: 'Deliverable Handoff', path: '/handoff-portal', desc: 'Organized file delivery', new: true },
      { name: 'Health Monitor', path: '/health-monitor', desc: 'Weekly performance reports', new: true },
    ]
  },
  {
    icon: Wand2,
    title: 'AI Sales Tools',
    color: 'purple',
    description: 'AI-powered selling automation',
    features: [
      { name: 'AI Project Scoper', path: '/ai-scoper', desc: 'Plain language to scope', new: true },
      { name: 'AI Competitor Analyzer', path: '/ai-competitor', desc: 'Competitor site analysis', new: true },
      { name: 'AI Design Preview', path: '/ai-preview', desc: '[] in 30 seconds', new: true },
      { name: 'AI Proposal Writer', path: '/ai-proposal', desc: 'Auto-generated proposals', new: true },
      { name: 'AI Chatbot', path: '/ai-chatbot', desc: 'Conversational requirements', new: true },
      { name: 'Smart Upsell Engine', path: '/smart-upsell', desc: 'Data-driven bundles', new: true },
      { name: 'Deadline Predictor', path: '/deadline-predictor', desc: 'Timeline estimation', new: true },
    ]
  },
  {
    icon: Shield,
    title: 'Trust & Verification',
    color: 'green',
    description: 'Build trust with clients',
    features: [
      { name: 'Quality Certificate', path: '/quality-certificate', desc: 'Auto quality reports', new: true },
      { name: 'Live Portfolio Proof', path: '/portfolio-proof', desc: 'Verified project showcase', new: true },
      { name: 'Guarantee Vault', path: '/guarantee-vault', desc: 'Escrow payment system', new: true },
      { name: 'Dispute Resolution', path: '/dispute-resolution', desc: 'Fair conflict resolution', new: true },
      { name: 'SLA Generator', path: '/sla-generator', desc: 'Auto-generated agreements', new: true },
    ]
  },
  {
    icon: TrendingUp,
    title: 'Revenue Multipliers',
    color: 'indigo',
    description: 'Make more money per client',
    features: [
      { name: 'Service Subscriptions', path: '/service-subscriptions', desc: 'Maintenance plans', new: true },
      { name: 'Referral System', path: '/referral-system', desc: 'Client referral program', new: true },
      { name: 'Loyalty Tiers', path: '/loyalty-tiers', desc: 'Repeat buyer rewards', new: true },
      { name: 'Corporate Credit', path: '/corporate-credit', desc: 'Net-30 payment terms', new: true },
    ]
  },
  {
    icon: Users,
    title: 'Client Acquisition',
    color: 'pink',
    description: 'Bring in new clients',
    features: [
      { name: 'Free Website Audit', path: '/free-audit', desc: 'Lead generation tool', new: true },
      { name: 'ROI Calculator', path: '/roi-calculator', desc: 'Investment return estimator', new: true },
      { name: 'Case Studies', path: '/case-studies', desc: 'Success stories', new: true },
      { name: 'Free [] Generator', path: '/free-[]', desc: 'AI [] tool', new: true },
    ]
  },
  {
    icon: Heart,
    title: 'Client Retention',
    color: 'rose',
    description: 'Keep clients forever',
    features: [
      { name: 'Command Center', path: '/command-center', desc: 'Unified dashboard', new: true },
      { name: 'QBR Reports', path: '/qbr-reports', desc: '90-day reviews', new: true },
      { name: 'Client Community', path: '/client-community', desc: 'Private forum', new: true },
    ]
  },
  {
    icon: BarChart3,
    title: 'Business Intelligence',
    color: 'cyan',
    description: 'Data-driven decisions',
    features: [
      { name: 'Profitability Dashboard', path: '/profitability', desc: 'Service profit analysis', new: true },
      { name: 'Client LTV', path: '/client-ltv', desc: 'Lifetime value tracking', new: true },
      { name: 'Demand Forecast', path: '/demand-forecast', desc: 'Seasonal prediction', new: true },
      { name: 'Churn Prediction', path: '/churn-prediction', desc: 'Risk analysis', new: true },
      { name: 'Pricing Test', path: '/pricing-test', desc: 'A/B pricing experiments', new: true },
    ]
  },
  {
    icon: Play,
    title: 'Video Courses',
    color: 'red',
    description: 'Learn from experts',
    features: [
      { name: 'E-commerce Course', path: '/courses', desc: 'Build e-commerce in 10 hours', new: true },
      { name: 'DevOps Course', path: '/courses', desc: 'DevOps zero to hero', new: true },
      { name: 'Figma Mastery', path: '/courses', desc: 'Figma for UI/UX', new: true },
      { name: 'Short Tutorials', path: '/short-tutorials', desc: 'Bite-sized tutorials', new: true },
    ]
  },
  {
    icon: Search,
    title: 'Audit Tools',
    color: 'indigo',
    description: 'Automated website scans',
    features: [
      { name: 'SEO Audit', path: '/audits', desc: 'Comprehensive SEO analysis', new: true },
      { name: 'Performance Audit', path: '/audits', desc: 'Lighthouse + custom checks', new: true },
      { name: 'Accessibility Audit', path: '/audits', desc: 'WCAG compliance check', new: true },
      { name: 'Security Scan', path: '/audits', desc: 'Vulnerability assessment', new: true },
      { name: 'Brand Audit', path: '/audits', desc: 'Brand consistency check', new: true },
    ]
  },
  {
    icon: Wand2,
    title: 'AI Generators',
    color: 'pink',
    description: 'AI-powered tools',
    features: [
      { name: 'AI Logo Generator', path: '/ai-tools', desc: 'Generate logo options', new: true },
      { name: 'Business Name AI', path: '/ai-tools', desc: 'AI business name suggestions', new: true },
      { name: 'Tagline Generator', path: '/ai-tools', desc: 'Catchy taglines', new: true },
      { name: 'Color Palette AI', path: '/ai-tools', desc: 'Beautiful color combinations', new: true },
      { name: 'Social Post AI', path: '/ai-tools', desc: 'AI social media posts', new: true },
    ]
  },
  {
    icon: Package,
    title: 'Bundles',
    color: 'amber',
    description: 'Service + product bundles',
    features: [
      { name: 'Website + SEO Bundle', path: '/bundles', desc: 'Website + SEO + Hosting', new: true },
      { name: 'App Store Bundle', path: '/bundles', desc: 'App + Store optimization', new: true },
      { name: 'DevOps Bundle', path: '/bundles', desc: 'DevOps + Monitoring', new: true },
      { name: 'UI/UX Bundle', path: '/bundles', desc: 'Design + Components + Docs', new: true },
    ]
  },
  {
    icon: RefreshCw,
    title: 'Subscriptions',
    color: 'teal',
    description: 'Recurring revenue services',
    features: [
      { name: 'Monthly Maintenance', path: '/subscriptions', desc: 'Bug fixes + updates', new: true },
      { name: 'Backup & Monitor', path: '/subscriptions', desc: 'Weekly backups + alerts', new: true },
      { name: 'Performance Reports', path: '/subscriptions', desc: 'Monthly performance analysis', new: true },
      { name: 'Priority Support', path: '/subscriptions', desc: '24hr response SLA', new: true },
    ]
  },
  {
    icon: Zap,
    title: 'Digital Products',
    color: 'yellow',
    description: 'Zero marginal cost',
    features: [
      { name: 'SaaS Boilerplate Premium', path: '/digital', desc: 'Complete SaaS starter', new: true },
      { name: 'Notion Templates', path: '/notion-templates', desc: 'Ready-to-use Notion workspaces', new: true },
      { name: 'Figma UI Kits', path: '/digital', desc: '500+ components', new: true },
      { name: 'Env Setup Scripts', path: '/env-setup', desc: 'One-click dev environment', new: true },
      { name: 'Certifications', path: '/certifications', desc: 'Certified Developer programs', new: true },
    ]
  },
]

export default function FeaturesPage() {
  const [search, setSearch] = useState('')

  const filteredCategories = featureCategories.map(cat => ({
    ...cat,
    features: cat.features.filter(f => 
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.desc.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.features.length > 0)

  const totalFeatures = featureCategories.reduce((sum, cat) => sum + cat.features.length, 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="secondary">
            <Sparkles className="h-3 w-3 mr-1" />
            334+ Features
          </Badge>
          <h1 className="text-4xl font-bold mb-4">
            Discover All Features
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Grapsee Shop has {totalFeatures}+ features to save you money, time, and stress.
            Every feature is free to use.
          </p>
          
          <div className="max-w-md mx-auto mt-6">
            <Input
              placeholder="Search features..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Money Saved', value: '2.4Cr+', icon: DollarSign },
            { label: 'Hours Saved', value: '50K+', icon: Clock },
            { label: 'Active Users', value: '100K+', icon: Users },
            { label: 'Features', value: '334+', icon: Zap },
          ].map((stat, i) => (
            <Card key={i} className="text-center">
              <CardContent className="p-4">
                <stat.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Categories */}
        <div className="space-y-8">
          {filteredCategories.map((category) => {
            const Icon = category.icon
            return (
              <Card key={category.title}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${category.color}-100`}>
                      <Icon className={`h-6 w-6 text-${category.color}-600`} />
                    </div>
                    <div>
                      <CardTitle>{category.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                    <Badge className="ml-auto">{category.features.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {category.features.map((feature) => (
                      <Link key={feature.path} href={feature.path}>
                        <div className="group p-4 rounded-lg border hover:border-primary hover:shadow-md transition-all cursor-pointer">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium group-hover:text-primary">{feature.name}</h4>
                            {feature.new && <Badge variant="secondary" className="text-xs">NEW</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{feature.desc}</p>
                          <div className="flex items-center text-sm text-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            Try it <ChevronRight className="h-4 w-4" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12 p-8 bg-primary text-primary-foreground rounded-lg">
          <h2 className="text-2xl font-bold mb-2">Can't find what you need?</h2>
          <p className="mb-4">We're adding new features every week based on your feedback</p>
          <Button variant="secondary" size="lg">
            <Search className="h-4 w-4 mr-2" />
            Search Products
          </Button>
        </div>
      </div>
    </div>
  )
}
