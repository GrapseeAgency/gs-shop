'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Gift, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ScratchCardProps {
  orderId?: string
  onComplete?: (reward: any) => void
}

export function ScratchCardComponent({ orderId, onComplete }: ScratchCardProps) {
  const [cardData, setCardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [scratching, setScratching] = useState(false)
  const [scratched, setScratched] = useState(false)
  const [reward, setReward] = useState<any>(null)

  useEffect(() => {
    checkForCard()
  }, [orderId])

  const checkForCard = async () => {
    try {
      const url = orderId 
        ? `/api/scratch-cards?orderId=${orderId}` 
        : '/api/scratch-cards'
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setCardData(data)
      }
    } catch (error) {
      console.error('Error checking scratch card:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleScratch = async () => {
    if (!cardData?.hasCard || !cardData?.cardId) return

    setScratching(true)

    // Simulate scratching animation
    await new Promise(resolve => setTimeout(resolve, 1500))

    try {
      const res = await fetch('/api/scratch-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: cardData.cardId })
      })

      if (res.ok) {
        const data = await res.json()
        setReward(data)
        setScratched(true)
        toast.success(data.message)
        onComplete?.(data)
      } else {
        toast.error('Failed to scratch card')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setScratching(false)
    }
  }

  if (loading) {
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (!cardData?.hasCard) {
    return null
  }

  if (scratched && reward) {
    return (
      <Card className="w-full max-w-sm border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-yellow-500/10">
        <CardContent className="p-6 text-center space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-yellow-500">
            <Gift className="h-8 w-8 text-white" />
          </div>
          <div>
            <p className="text-lg font-bold">{reward.message}</p>
            {reward.couponCode && (
              <p className="text-2xl font-mono font-bold text-emerald-600 mt-2">
                {reward.couponCode}
              </p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Reward added to your account!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-sm overflow-hidden">
      <div className="relative">
        {/* Scratch Surface */}
        <div 
          className="bg-gradient-to-br from-slate-400 to-slate-600 p-6 text-center cursor-pointer select-none"
          onClick={!scratching ? handleScratch : undefined}
        >
          {scratching ? (
            <div className="py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-white" />
              <p className="text-white mt-2">Scratching...</p>
            </div>
          ) : (
            <div className="py-8 space-y-4">
              <Sparkles className="h-12 w-12 mx-auto text-white" />
              <p className="text-white font-bold text-lg">SCRATCH TO WIN!</p>
              <p className="text-white/80 text-sm">Click to reveal your surprise</p>
            </div>
          )}
        </div>

        {/* Decorative Corners */}
        <div className="absolute top-2 left-2 h-8 w-8 border-l-2 border-t-2 border-white/30" />
        <div className="absolute top-2 right-2 h-8 w-8 border-r-2 border-t-2 border-white/30" />
        <div className="absolute bottom-2 left-2 h-8 w-8 border-l-2 border-b-2 border-white/30" />
        <div className="absolute bottom-2 right-2 h-8 w-8 border-r-2 border-b-2 border-white/30" />
      </div>

      <CardContent className="p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Scratch card expires in {Math.ceil((new Date(cardData.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60))} hours
        </p>
      </CardContent>
    </Card>
  )
}
