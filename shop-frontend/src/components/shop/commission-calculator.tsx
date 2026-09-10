'use client'

import { useState } from 'react'
import { Calculator, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface CommissionCalculatorProps {
  defaultRate?: number
}

export function CommissionCalculator({ defaultRate = 10 }: CommissionCalculatorProps) {
  const [saleAmount, setSaleAmount] = useState(1000)
  const [commissionRate, setCommissionRate] = useState(defaultRate)

  const platformFee = (saleAmount * commissionRate) / 100
  const sellerEarnings = saleAmount - platformFee
  const effectiveRate = commissionRate

  // Tier calculations
  const tiers = [
    { name: 'Starter', rate: 15, minSales: 0 },
    { name: 'Silver', rate: 12, minSales: 5000 },
    { name: 'Gold', rate: 10, minSales: 20000 },
    { name: 'Platinum', rate: 8, minSales: 100000 }
  ]

  const currentTier = tiers.slice().reverse().find(t => saleAmount >= t.minSales) || tiers[0]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="h-5 w-5" />
          Commission Calculator
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-xs">
                  Calculate your earnings after platform fees. Lower commission rates unlock at higher sales volumes.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sale Amount */}
        <div className="space-y-2">
          <Label>Sale Amount</Label>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">$</span>
            <Input
              type="number"
              value={saleAmount}
              onChange={(e) => setSaleAmount(Number(e.target.value))}
              min={0}
              step={100}
            />
          </div>
          <Slider
            value={[saleAmount]}
            max={50000}
            min={0}
            step={100}
            onValueChange={(v) => setSaleAmount(v[0])}
          />
        </div>

        {/* Commission Rate */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            Platform Commission
            <span className="text-xs text-muted-foreground">({currentTier.name} tier)</span>
          </Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[commissionRate]}
              max={20}
              min={5}
              step={1}
              onValueChange={(v) => setCommissionRate(v[0])}
              className="flex-1"
            />
            <span className="text-lg font-semibold w-16">{commissionRate}%</span>
          </div>
        </div>

        <Separator />

        {/* Results */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Sale Amount</span>
            <span className="font-medium">${saleAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-red-500">
            <span className="flex items-center gap-1">
              Platform Fee ({commissionRate}%)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Includes payment processing and platform services</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
            <span className="font-medium">-${platformFee.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center text-emerald-600">
            <span className="font-semibold">Your Earnings</span>
            <span className="text-xl font-bold">${sellerEarnings.toFixed(2)}</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Effective rate: {((platformFee / saleAmount) * 100).toFixed(1)}% | You keep {((sellerEarnings / saleAmount) * 100).toFixed(1)}%
          </p>
        </div>

        {/* Commission Tiers */}
        <div className="rounded-lg bg-muted p-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Commission Tiers</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`p-2 rounded ${
                  currentTier.name === tier.name
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                    : 'bg-background'
                }`}
              >
                <p className="font-medium">{tier.name}</p>
                <p className="text-muted-foreground">{tier.rate}% fee</p>
                <p className="text-[10px] text-muted-foreground">
                  ${tier.minSales.toLocaleString()}+ sales
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

