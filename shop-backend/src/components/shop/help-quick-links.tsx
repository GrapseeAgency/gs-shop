'use client'

import { motion } from 'framer-motion'
import { Truck, RotateCcw, Package, HeadphonesIcon, HelpCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useShopRouter } from '@/hooks/use-shop-router'

interface QuickLink {
  icon: React.ElementType
  label: string
  description: string
  color: string
  gradientFrom: string
  gradientTo: string
  action: 'goOrders' | 'goReturns' | 'goHelp' | 'goContact'
}

const quickLinks: QuickLink[] = [
  {
    icon: Package,
    label: 'Track Order',
    description: 'Check your order status & delivery updates in real-time',
    color: 'text-sky-600 dark:text-sky-400',
    gradientFrom: 'from-sky-500/15',
    gradientTo: 'to-blue-500/10',
    action: 'goOrders',
  },
  {
    icon: RotateCcw,
    label: 'Returns & Refunds',
    description: 'Start a return request or check refund status',
    color: 'text-orange-600 dark:text-orange-400',
    gradientFrom: 'from-orange-500/15',
    gradientTo: 'to-amber-500/10',
    action: 'goReturns',
  },
  {
    icon: Truck,
    label: 'Shipping Info',
    description: 'Delivery times, fees, and shipping methods',
    color: 'text-emerald-600 dark:text-emerald-400',
    gradientFrom: 'from-emerald-500/15',
    gradientTo: 'to-teal-500/10',
    action: 'goHelp',
  },
  {
    icon: HeadphonesIcon,
    label: 'Contact Support',
    description: 'Chat with us or submit a support ticket',
    color: 'text-violet-600 dark:text-violet-400',
    gradientFrom: 'from-violet-500/15',
    gradientTo: 'to-purple-500/10',
    action: 'goContact',
  },
]

export function HelpQuickLinks() {
  const { goOrders, goReturns, goHelp, goContact } = useShopRouter()

  const actionMap: Record<string, () => void> = {
    goOrders,
    goReturns,
    goHelp,
    goContact,
  }

  return (
    <section className="px-4 py-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <HelpCircle className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Need Help?</h2>
            <p className="text-[10px] text-muted-foreground">Quick access to support</p>
          </div>
        </div>
      </div>

      {/* 2x2 Grid of quick link cards */}
      <div className="grid grid-cols-2 gap-3">
        {quickLinks.map((link, i) => {
          const Icon = link.icon
          return (
            <motion.button
              key={link.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3, type: 'spring', stiffness: 300 }}
              onClick={() => actionMap[link.action]?.()}
              className="group relative flex flex-col items-center gap-2.5 overflow-hidden rounded-xl border border-border/50 bg-card p-4 text-center shadow-sm transition-all hover:shadow-lg hover:border-primary/20 active:scale-[0.96]"
            >
              {/* Gradient background on hover/active */}
              <div className={`absolute inset-0 bg-gradient-to-br ${link.gradientFrom} ${link.gradientTo} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              <div className="relative z-10 flex flex-col items-center gap-2.5">
                {/* Icon container with gradient */}
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${link.gradientFrom} ${link.gradientTo} transition-transform group-hover:scale-110 group-active:scale-95`}>
                  <Icon className={`h-5 w-5 ${link.color}`} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                    {link.label}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground leading-tight line-clamp-2">
                    {link.description}
                  </p>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* View Help Center button */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-3"
      >
        <Button
          variant="outline"
          className="w-full gap-2 text-xs active:scale-[0.98] transition-transform"
          onClick={() => goHelp()}
        >
          <HelpCircle className="h-3.5 w-3.5" />
          View Help Center
          <ArrowRight className="h-3 w-3 ml-auto" />
        </Button>
      </motion.div>
    </section>
  )
}
