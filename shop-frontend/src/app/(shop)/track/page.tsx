'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Search, Package, CheckCircle2, Truck, MapPin, Clock,
  Navigation, Phone, ExternalLink, Copy, CheckCheck, HelpCircle,
  ChevronRight, Plane, Shield, Star, XCircle, Loader2,
  Globe, CalendarDays, Weight, Ruler, Box, FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useShopRouter } from '@/hooks/use-shop-router'
import { toast } from 'sonner'

interface TrackingStep {
  status: string
  description: string
  location: string
  timestamp: string | null
  completed: boolean
}

interface TrackingResult {
  trackingNumber: string
  orderId: string | null
  status: string
  steps: TrackingStep[]
  carrier?: {
    name: string
    logo: string
    phone: string
    trackingUrl?: string
  }
  estimatedDelivery?: string
  deliveryAddress?: string
  packageDetails?: {
    weight: string
    dimensions: string
    items: number
  }
}

const EXAMPLE_TRACKING_NUMBERS = [
  'GRPS-2025-ABCD1234',
  'GRPS-2025-EFGH5678',
  'GRPS-2025-IJKL9012',
]

const TIMELINE_ICONS: Record<string, React.ElementType> = {
  'Order Placed': FileText,
  'Processing': Package,
  'Shipped': Truck,
  'In Transit': Plane,
  'Out for Delivery': Truck,
  'Delivered': CheckCircle2,
}

const TIMELINE_COLORS: Record<string, string> = {
  'Order Placed': 'text-emerald-500',
  'Processing': 'text-amber-500',
  'Shipped': 'text-blue-500',
  'In Transit': 'text-blue-500',
  'Out for Delivery': 'text-orange-500',
  'Delivered': 'text-emerald-500',
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return 'Pending'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'TBD'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

function getProgressPercentage(steps: TrackingStep[]): number {
  const completedCount = steps.filter(s => s.completed).length
  if (completedCount === 0) return 0
  return Math.round((completedCount / steps.length) * 100)
}

function TrackPageContent() {
  const searchParams = useSearchParams()
  const queryTracking = searchParams.get('q') || ''
  const { goBack, goHelp, goContact } = useShopRouter()

  const [trackingInput, setTrackingInput] = useState(queryTracking)
  const [result, setResult] = useState<TrackingResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const trackShipment = useCallback(async (trackingNumber: string) => {
    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/shipping/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber: trackingNumber.trim() }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to track shipment')
      }
      const data = await res.json()
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (queryTracking) {
      trackShipment(queryTracking)
    }
  }, [queryTracking, trackShipment])

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const handleExampleClick = (num: string) => {
    setTrackingInput(num)
    trackShipment(num)
  }

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
            <h1 className="text-lg font-bold text-foreground">Track Shipment</h1>
            <p className="text-[11px] text-muted-foreground">Enter tracking number to see delivery status</p>
          </div>
          <Navigation className="h-5 w-5 text-primary" />
        </div>
      </div>

      {/* Search Form */}
      <div className="mx-4 mt-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && trackShipment(trackingInput)}
              placeholder="Enter tracking number..."
              className="pl-9 h-11 bg-card border-border/50"
            />
          </div>
          <Button
            onClick={() => trackShipment(trackingInput)}
            disabled={loading || !trackingInput.trim()}
            className="h-11 px-5 gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Track
          </Button>
        </div>

        {/* Example Tracking Numbers */}
        {!result && !loading && !error && (
          <motion.div
            className="mt-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-[11px] text-muted-foreground mb-2">Try an example:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_TRACKING_NUMBERS.map((num) => (
                <button
                  key={num}
                  onClick={() => handleExampleClick(num)}
                  className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-[11px] font-mono text-primary hover:bg-primary/10 active:scale-95 transition-all"
                >
                  {num}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="mx-4 mt-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-500">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="mx-4 mt-4 rounded-2xl border border-border/50 bg-card p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-3 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Locating your package...</p>
            </div>
            <div className="mt-4 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                    <div className="h-2 w-32 rounded bg-muted animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Progress Bar */}
            <div className="mx-4 mt-4">
              <div className="rounded-2xl border border-border/50 bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    <span className="text-sm font-bold text-foreground">Delivery Progress</span>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    {getProgressPercentage(result.steps)}%
                  </Badge>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${getProgressPercentage(result.steps)}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                  <span>Order Placed</span>
                  <span>Delivered</span>
                </div>
              </div>
            </div>

            {/* Tracking Number + Carrier Info */}
            <div className="mx-4 mt-3 rounded-2xl border border-border/50 bg-card p-4">
              {/* Tracking Number */}
              <div className="rounded-xl bg-primary/5 p-3 mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-muted-foreground">Tracking Number</span>
                  <button
                    className="flex items-center gap-1 text-[10px] text-primary hover:underline"
                    onClick={() => handleCopy(result.trackingNumber)}
                  >
                    {copied ? <CheckCheck className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-sm font-mono font-bold text-foreground">{result.trackingNumber}</p>
              </div>

              {/* Carrier Info */}
              {result.carrier && (
                <div className="flex items-center justify-between rounded-xl border border-border/30 p-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{result.carrier.logo}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{result.carrier.name}</p>
                      <p className="text-[10px] text-muted-foreground">Carrier</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {result.carrier.trackingUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 h-7 text-xs"
                        onClick={() => {
                          window.open(result.carrier!.trackingUrl, '_blank')
                        }}
                      >
                        <ExternalLink className="h-3 w-3" />
                        Track
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 h-7 text-xs"
                      onClick={() => {
                        window.open(`tel:${result.carrier!.phone}`)
                        toast.info(`Call ${result.carrier!.name}: ${result.carrier!.phone}`)
                      }}
                    >
                      <Phone className="h-3 w-3" />
                      Call
                    </Button>
                  </div>
                </div>
              )}

              {/* Estimated Delivery */}
              <div className="flex items-center justify-between rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-3 mb-3">
                <div>
                  <p className="text-[10px] text-muted-foreground">Estimated Delivery</p>
                  <p className="text-sm font-bold text-foreground">
                    {result.estimatedDelivery ? formatDate(result.estimatedDelivery) : formatDate(new Date(Date.now() + 2 * 86400000).toISOString())}
                  </p>
                </div>
                <CalendarDays className="h-5 w-5 text-emerald-400" />
              </div>

              {/* Delivery Address */}
              {result.deliveryAddress && (
                <div className="flex items-start gap-2 rounded-xl border border-border/30 p-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Delivery Address</p>
                    <p className="text-xs text-foreground">{result.deliveryAddress}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Package Details */}
            {result.packageDetails && (
              <div className="mx-4 mt-3 rounded-2xl border border-border/50 bg-card p-4">
                <h3 className="mb-3 text-sm font-bold text-foreground flex items-center gap-2">
                  <Box className="h-4 w-4 text-primary" />
                  Package Details
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col items-center gap-1.5 rounded-xl bg-primary/5 p-2.5 text-center">
                    <Weight className="h-4 w-4 text-primary" />
                    <p className="text-[10px] text-muted-foreground">Weight</p>
                    <p className="text-xs font-bold text-foreground">{result.packageDetails.weight}</p>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 rounded-xl bg-primary/5 p-2.5 text-center">
                    <Ruler className="h-4 w-4 text-primary" />
                    <p className="text-[10px] text-muted-foreground">Size</p>
                    <p className="text-xs font-bold text-foreground">{result.packageDetails.dimensions}</p>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 rounded-xl bg-primary/5 p-2.5 text-center">
                    <Package className="h-4 w-4 text-primary" />
                    <p className="text-[10px] text-muted-foreground">Items</p>
                    <p className="text-xs font-bold text-foreground">{result.packageDetails.items}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Visual Timeline */}
            <div className="mx-4 mt-3 rounded-2xl border border-border/50 bg-card p-4">
              <h3 className="mb-4 text-sm font-bold text-foreground">Shipment Timeline</h3>
              <div className="relative">
                {result.steps.map((step, i) => {
                  const Icon = TIMELINE_ICONS[step.status] || Package
                  const isLast = i === result.steps.length - 1
                  const isCurrent = step.completed && (i === result.steps.length - 1 || !result.steps[i + 1]?.completed)

                  return (
                    <motion.div
                      key={step.status}
                      className="relative flex items-start gap-3 pb-5 last:pb-0"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      {/* Connector Line */}
                      {!isLast && (
                        <div className="absolute left-[15px] top-9 h-[calc(100%-20px)] w-0.5">
                          <div className="h-full w-full bg-border">
                            {step.completed && (
                              <motion.div
                                className="w-full bg-primary"
                                initial={{ height: 0 }}
                                animate={{ height: '100%' }}
                                transition={{ duration: 0.5, delay: i * 0.15 }}
                              />
                            )}
                          </div>
                        </div>
                      )}

                      {/* Icon Circle */}
                      <motion.div
                        className={`relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                          isCurrent
                            ? 'border-primary bg-primary text-primary-foreground ring-4 ring-primary/20'
                            : step.completed
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background text-muted-foreground'
                        }`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: i * 0.1 }}
                      >
                        <Icon className={`h-4 w-4 ${!step.completed ? TIMELINE_COLORS[step.status] || '' : ''}`} />
                        {isCurrent && (
                          <motion.div
                            className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background"
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                          />
                        )}
                      </motion.div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-medium ${
                            isCurrent ? 'text-primary' : step.completed ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {step.status}
                          </p>
                          {isCurrent && (
                            <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] px-1.5 py-0">
                              Current
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{step.description}</p>
                        <div className="flex items-center gap-3 mt-1">
                          {step.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground/50" />
                              <span className="text-[10px] text-muted-foreground/70">{step.location}</span>
                            </div>
                          )}
                          {step.timestamp && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground/50" />
                              <span className="text-[10px] text-muted-foreground/70">{formatDateTime(step.timestamp)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Check indicator */}
                      {step.completed && !isCurrent && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-1" />
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mx-4 mt-3 grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="gap-2 h-auto py-3 flex-col"
                onClick={goHelp}
              >
                <HelpCircle className="h-5 w-5 text-primary" />
                <span className="text-[11px]">Need Help?</span>
              </Button>
              <Button
                variant="outline"
                className="gap-2 h-auto py-3 flex-col"
                onClick={goContact}
              >
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-[11px]">Contact Support</span>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="mx-4 mt-3 rounded-2xl border border-border/50 bg-card p-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <Shield className="h-5 w-5 text-emerald-500" />
                  <span className="text-[10px] text-muted-foreground">Secure Delivery</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <Package className="h-5 w-5 text-blue-500" />
                  <span className="text-[10px] text-muted-foreground">Insured Package</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <Star className="h-5 w-5 text-amber-500" />
                  <span className="text-[10px] text-muted-foreground">Top Rated Carrier</span>
                </div>
              </div>
            </div>

            {/* Need Help CTA */}
            <div className="mx-4 mt-3 mb-4">
              <button
                onClick={goHelp}
                className="w-full rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4 flex items-center gap-3 hover:bg-primary/10 transition-colors active:scale-[0.98]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <HelpCircle className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-foreground">Need Help?</p>
                  <p className="text-[11px] text-muted-foreground">Visit our Help Center for delivery issues</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!result && !loading && !error && !queryTracking && (
        <motion.div
          className="mx-4 mt-6 flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/5 mb-4">
            <Navigation className="h-10 w-10 text-primary/30" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-1">Track Your Package</h2>
          <p className="text-sm text-muted-foreground max-w-[260px] mb-6">
            Enter your tracking number to see real-time delivery updates and estimated arrival time.
          </p>

          <div className="w-full rounded-2xl border border-border/50 bg-card p-4">
            <h3 className="text-sm font-bold text-foreground mb-3">How It Works</h3>
            <div className="space-y-3">
              {[
                { icon: Search, label: 'Enter Tracking Number', desc: 'Find it in your order confirmation email' },
                { icon: MapPin, label: 'View Live Location', desc: 'See where your package is right now' },
                { icon: CheckCircle2, label: 'Get Delivery Updates', desc: 'Real-time notifications on your delivery' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={goHelp}
              className="rounded-xl border border-border/50 bg-card p-3 flex items-center gap-2 hover:bg-muted/50 active:scale-[0.98] transition-all"
            >
              <HelpCircle className="h-4 w-4 text-primary" />
              <span className="text-xs text-foreground">Help Center</span>
            </button>
            <button
              onClick={goContact}
              className="rounded-xl border border-border/50 bg-card p-3 flex items-center gap-2 hover:bg-muted/50 active:scale-[0.98] transition-all"
            >
              <Phone className="h-4 w-4 text-primary" />
              <span className="text-xs text-foreground">Contact Us</span>
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    }>
      <TrackPageContent />
    </Suspense>
  )
}
