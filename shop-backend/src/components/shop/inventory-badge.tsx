'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Package, AlertTriangle, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface InventoryBadgeProps {
  stock: number
  threshold?: number
  productId?: string
  className?: string
  showFetch?: boolean
  restockDate?: string | null
  maxStock?: number
}

type StockLevel = 'in_stock' | 'low' | 'critical' | 'out_of_stock'

interface StockState {
  level: StockLevel
  label: string
  color: string
  dot: string
  dotColor: string
  pulse: boolean
  icon: React.ElementType
  barColor: string
}

export function InventoryBadge({
  stock: initialStock,
  threshold = 10,
  productId,
  className = '',
  showFetch = false,
  restockDate = null,
  maxStock = 50,
}: InventoryBadgeProps) {
  const [stock, setStock] = useState(initialStock)

  useEffect(() => {
    if (showFetch && productId) {
      fetch(`/api/inventory/${productId}`)
        .then((res) => res.json())
        .then((data) => {
          if (typeof data.stock === 'number') setStock(data.stock)
        })
        .catch(() => {
          // Use initial stock
        })
    }
  }, [productId, showFetch])

  const getState = (): StockState => {
    if (stock === 0) {
      return {
        level: 'out_of_stock',
        label: 'Out of Stock',
        color: 'bg-muted/60 text-muted-foreground border-border',
        dot: 'bg-muted-foreground',
        dotColor: '#6b7280',
        pulse: false,
        icon: XCircle,
        barColor: 'bg-muted-foreground',
      }
    }
    if (stock <= 5) {
      return {
        level: 'critical',
        label: 'Almost gone!',
        color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
        dot: 'bg-red-500',
        dotColor: '#ef4444',
        pulse: true,
        icon: AlertTriangle,
        barColor: 'bg-red-500',
      }
    }
    if (stock <= 20) {
      return {
        level: 'low',
        label: `Only ${stock} left`,
        color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        dot: 'bg-amber-500',
        dotColor: '#f59e0b',
        pulse: true,
        icon: Clock,
        barColor: 'bg-amber-500',
      }
    }
    return {
      level: 'in_stock',
      label: 'In Stock',
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      dot: 'bg-emerald-500',
      dotColor: '#10b981',
      pulse: false,
      icon: CheckCircle2,
      barColor: 'bg-emerald-500',
    }
  }

  const state = getState()
  const Icon = state.icon
  const stockPercent = Math.min((stock / maxStock) * 100, 100)

  return (
    <div className={`space-y-1.5 ${className}`}>
      <Badge
        variant="secondary"
        className={`gap-1.5 px-2 py-0.5 text-[10px] font-medium border ${state.color}`}
      >
        <span className="relative flex h-1.5 w-1.5">
          {state.pulse && (
            <motion.span
              className="absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: state.dotColor }}
              animate={
                state.level === 'critical'
                  ? { scale: [1, 3, 1], opacity: [0.75, 0, 0.75] }
                  : { scale: [1, 2.5], opacity: [0.75, 0] }
              }
              transition={
                state.level === 'critical'
                  ? { duration: 1, repeat: Infinity, ease: 'easeOut' }
                  : { duration: 1.5, repeat: Infinity, ease: 'easeOut' }
              }
            />
          )}
          <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${state.dot}`} />
        </span>
        <Icon className="h-2.5 w-2.5" />
        {state.label}
      </Badge>

      {/* Stock progress bar */}
      {stock > 0 && (
        <div className="h-1 w-full max-w-[120px] overflow-hidden rounded-full bg-muted">
          <motion.div
            className={`h-full rounded-full ${state.barColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${stockPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          />
        </div>
      )}

      {/* Restock date for out of stock items */}
      {stock === 0 && restockDate && (
        <p className="text-[9px] text-muted-foreground flex items-center gap-1">
          <Package className="h-2.5 w-2.5" />
          Restock expected: {restockDate}
        </p>
      )}
    </div>
  )
}
