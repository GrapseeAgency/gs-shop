'use client'

import { useState } from 'react'
import { Wallet, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface SplitPaymentProps {
  totalAmount: number
  walletBalance: number
  onSplitChange: (walletAmount: number, cardAmount: number) => void
}

export function SplitPayment({ 
  totalAmount, 
  walletBalance,
  onSplitChange 
}: SplitPaymentProps) {
  const [walletAmount, setWalletAmount] = useState(Math.min(walletBalance, totalAmount * 0.5))
  const cardAmount = totalAmount - walletAmount

  const handleSliderChange = (value: number[]) => {
    const newWalletAmount = value[0]
    setWalletAmount(newWalletAmount)
    onSplitChange(newWalletAmount, totalAmount - newWalletAmount)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0
    const clamped = Math.max(0, Math.min(value, walletBalance, totalAmount))
    setWalletAmount(clamped)
    onSplitChange(clamped, totalAmount - clamped)
  }

  const percentage = Math.round((walletAmount / totalAmount) * 100)

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <Wallet className="h-4 w-4" />
        Split Payment
      </h3>

      <div className="space-y-4">
        {/* Wallet Balance Display */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Available Balance</span>
          <span className="font-medium">${walletBalance.toFixed(2)}</span>
        </div>

        {/* Slider */}
        <div className="space-y-2">
          <Slider
            value={[walletAmount]}
            max={Math.min(walletBalance, totalAmount)}
            step={1}
            onValueChange={handleSliderChange}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>$0</span>
            <span>{percentage}% wallet</span>
            <span>${Math.min(walletBalance, totalAmount).toFixed(0)}</span>
          </div>
        </div>

        {/* Manual Input */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-xs">
              <Wallet className="h-3 w-3" />
              From Wallet
            </Label>
            <Input
              type="number"
              value={walletAmount.toFixed(2)}
              onChange={handleInputChange}
              min={0}
              max={Math.min(walletBalance, totalAmount)}
              step={0.01}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-xs">
              <CreditCard className="h-3 w-3" />
              From Card
            </Label>
            <Input
              type="number"
              value={cardAmount.toFixed(2)}
              readOnly
              className="bg-muted"
            />
          </div>
        </div>

        {/* Visual Breakdown */}
        <div className="relative h-4 rounded-full overflow-hidden bg-muted">
          <div 
            className="absolute left-0 top-0 h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
          <div 
            className="absolute right-0 top-0 h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${100 - percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-emerald-600">Wallet {percentage}%</span>
          <span className="text-blue-600">Card {100 - percentage}%</span>
        </div>

        {/* Quick Select Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleSliderChange([Math.min(walletBalance, totalAmount * 0.25)])}
          >
            25%
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleSliderChange([Math.min(walletBalance, totalAmount * 0.5)])}
          >
            50%
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleSliderChange([Math.min(walletBalance, totalAmount * 0.75)])}
          >
            75%
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleSliderChange([Math.min(walletBalance, totalAmount)])}
          >
            Max
          </Button>
        </div>
      </div>
    </div>
  )
}
