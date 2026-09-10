'use client'

import { motion } from 'framer-motion'
import { Check, Circle, Clock, Package, Truck, ShoppingBag, AlertCircle } from 'lucide-react'

export interface TimelineStep {
  status: string
  date?: string
  description?: string
  isActive: boolean
  isCompleted: boolean
}

interface OrderTimelineProps {
  steps: TimelineStep[]
  className?: string
}

const statusIcons: Record<string, React.ElementType> = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: Check,
  cancelled: AlertCircle,
  placed: ShoppingBag,
  confirmed: Check,
  out_for_delivery: Truck,
}

function getStatusIcon(step: TimelineStep): React.ElementType {
  const statusKey = step.status.toLowerCase().replace(/\s+/g, '_')
  return statusIcons[statusKey] || (step.isCompleted ? Check : step.isActive ? Circle : Circle)
}

function formatTimelineDate(dateStr?: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function OrderTimeline({ steps, className = '' }: OrderTimelineProps) {
  const activeIndex = steps.findIndex((s) => s.isActive)

  return (
    <div className={`relative ${className}`}>
      {steps.map((step, index) => {
        const Icon = getStatusIcon(step)
        const isLast = index === steps.length - 1
        const isCompleted = step.isCompleted
        const isActive = step.isActive

        return (
          <motion.div
            key={`${step.status}-${index}`}
            className="relative flex gap-3"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            {/* Timeline line + dot */}
            <div className="relative flex flex-col items-center">
              {/* Dot */}
              <motion.div
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
                  isCompleted
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : isActive
                    ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                    : 'border-muted-foreground/30 bg-background text-muted-foreground/50'
                }`}
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
              >
                <Icon className="h-3.5 w-3.5" />
              </motion.div>

              {/* Progress line */}
              {!isLast && (
                <div className="relative my-1 h-full w-0.5 min-h-[24px]">
                  {/* Background line */}
                  <div className="absolute inset-0 bg-muted-foreground/15 rounded-full" />
                  {/* Animated progress line */}
                  <motion.div
                    className="absolute inset-x-0 top-0 rounded-full bg-emerald-500"
                    initial={{ height: 0 }}
                    animate={{
                      height: isCompleted ? '100%' : isActive ? '50%' : '0%',
                    }}
                    transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
                  />
                </div>
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 pb-4 ${isLast ? 'pb-0' : ''}`}>
              <div className="flex items-center gap-2">
                <h4
                  className={`text-sm font-semibold ${
                    isCompleted
                      ? 'text-emerald-400'
                      : isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {step.status}
                </h4>
                {isActive && (
                  <motion.span
                    className="flex h-2 w-2 rounded-full bg-primary"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </div>
              {step.description && (
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              )}
              {step.date && (
                <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                  {formatTimelineDate(step.date)}
                </p>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// Default steps for demo/fallback
export const defaultOrderSteps: TimelineStep[] = [
  { status: 'Order Placed', date: new Date(Date.now() - 86400000 * 3).toISOString(), description: 'Your order has been placed successfully', isActive: false, isCompleted: true },
  { status: 'Processing', date: new Date(Date.now() - 86400000 * 2).toISOString(), description: 'Your order is being prepared', isActive: false, isCompleted: true },
  { status: 'Shipped', date: new Date(Date.now() - 86400000).toISOString(), description: 'Package is on the way', isActive: true, isCompleted: false },
  { status: 'Out for Delivery', description: 'Will arrive today', isActive: false, isCompleted: false },
  { status: 'Delivered', description: 'Package delivered', isActive: false, isCompleted: false },
]

