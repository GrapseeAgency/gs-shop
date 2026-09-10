'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Zap, Clock, ArrowRight, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { type Product } from '@/lib/store'
import { useShopRouter } from '@/hooks/use-shop-router'
import { formatPrice } from '@/components/shop/product-card'

// Countdown timer hook
function useCountdown(targetDate: Date) {
  const calculateTimeLeft = useCallback(() => {
    const difference = targetDate.getTime() - new Date().getTime()
    if (difference <= 0) return { hours: 0, minutes: 0, seconds: 0 }
    return {
      hours: Math.floor(difference / (1000 * 60 * 60)),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    }
  }, [targetDate])

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)
    return () => clearInterval(timer)
  }, [calculateTimeLeft])

  return timeLeft
}

function CountdownDigit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/20 backdrop-blur-sm">
        <span className="text-sm font-bold text-destructive">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="mt-0.5 text-[9px] text-muted-foreground">{label}</span>
    </div>
  )
}

interface FlashDealsProps {
  products: Product[]
}

export function FlashDeals({ products }: FlashDealsProps) {
  const { goProduct, goDeals } = useShopRouter()

  // Filter products with comparePrice (discounts)
  const dealProducts = products.filter((p) => p.comparePrice && p.comparePrice > p.price)

  // Set countdown to end of today
  const endTime = new Date()
  endTime.setHours(23, 59, 59, 999)
  const timeLeft = useCountdown(endTime)

  if (dealProducts.length === 0) return null

  return (
    <section className="py-4">
      {/* Header */}
      <div className="mb-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-destructive/20">
              <Flame className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Flash Deals</h2>
              <p className="text-[10px] text-muted-foreground">Ends today!</p>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-1">
            <Clock className="mr-1 h-3.5 w-3.5 text-destructive" />
            <CountdownDigit value={timeLeft.hours} label="HRS" />
            <span className="text-sm font-bold text-destructive">:</span>
            <CountdownDigit value={timeLeft.minutes} label="MIN" />
            <span className="text-sm font-bold text-destructive">:</span>
            <CountdownDigit value={timeLeft.seconds} label="SEC" />
          </div>
        </div>
      </div>

      {/* Horizontal scrollable deal cards */}
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {dealProducts.map((product, index) => {
          const discount = Math.round((1 - product.price / product.comparePrice!) * 100)
          return (
            <motion.button
              key={product.id}
              className="group relative flex w-[160px] flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-border/50 bg-card transition-all hover:border-destructive/30 hover:shadow-lg active:scale-[0.97]"
              onClick={() => goProduct(product.id)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Deal Badge */}
              <Badge className="absolute left-2 top-2 z-10 bg-destructive text-white shadow-sm">
                <Zap className="mr-0.5 h-3 w-3" />-{discount}%
              </Badge>

              {/* Image */}
              <div className="flex h-28 items-center justify-center bg-gradient-to-br from-destructive/10 to-orange-500/5">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-3xl opacity-30"></span>
                )}
              </div>

              {/* Info */}
              <div className="p-2.5">
                <h3 className="mb-1 text-xs font-semibold text-foreground line-clamp-1">
                  {product.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-destructive">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-[10px] text-muted-foreground line-through">
                    {formatPrice(product.comparePrice!)}
                  </span>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* See All Deals */}
      <div className="mt-2 px-4">
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
          onClick={() => goDeals()}
        >
          View All Deals
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </section>
  )
}
