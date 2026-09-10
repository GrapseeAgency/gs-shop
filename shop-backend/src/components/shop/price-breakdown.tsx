'use client'

import { useMemo } from 'react'
import { Separator } from '@/components/ui/separator'
import { Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface PriceBreakdownProps {
  subtotal: number
  discount?: number
  couponCode?: string
  shipping?: number
  tax?: number
  taxRate?: number
  walletCredit?: number
  cashback?: number
  total: number
}

export function PriceBreakdown({
  subtotal,
  discount = 0,
  couponCode,
  shipping = 0,
  tax,
  taxRate = 0.05,
  walletCredit = 0,
  cashback = 0,
  total
}: PriceBreakdownProps) {
  const calculatedTax = tax ?? subtotal * taxRate
  const savings = discount + walletCredit + cashback

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <h3 className="font-semibold text-sm">Price Details</h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span className="flex items-center gap-1">
              Discount
              {couponCode && <span className="text-xs">({couponCode})</span>}
            </span>
            <span>-${discount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-muted-foreground flex items-center gap-1">
            Tax ({(taxRate * 100).toFixed(0)}%)
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Applicable taxes based on your region</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </span>
          <span>${calculatedTax.toFixed(2)}</span>
        </div>

        {shipping > 0 ? (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>${shipping.toFixed(2)}</span>
          </div>
        ) : (
          <div className="flex justify-between text-emerald-600">
            <span className="text-muted-foreground">Shipping</span>
            <span className="text-xs">FREE</span>
          </div>
        )}

        {walletCredit > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span>Wallet Credit</span>
            <span>-${walletCredit.toFixed(2)}</span>
          </div>
        )}

        {cashback > 0 && (
          <div className="flex justify-between text-amber-600">
            <span className="flex items-center gap-1">
              Cashback Applied
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Earn {cashback}% cashback on this order</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
            <span>-${cashback.toFixed(2)}</span>
          </div>
        )}
      </div>

      <Separator />

      <div className="flex justify-between font-semibold">
        <span>Total</span>
        <span className="text-lg">${total.toFixed(2)}</span>
      </div>

      {savings > 0 && (
        <p className="text-xs text-emerald-600 text-center">
          You saved ${savings.toFixed(2)} on this order!
        </p>
      )}

      {cashback > 0 && (
        <p className="text-xs text-amber-600 text-center">
          You will earn ${((subtotal - discount) * cashback / 100).toFixed(2)} cashback
        </p>
      )}
    </div>
  )
}
