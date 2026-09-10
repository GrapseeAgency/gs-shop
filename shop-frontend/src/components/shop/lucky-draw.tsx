'use client'

import { useState } from 'react'
import { Gift, Sparkles, Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

interface LuckyDrawProps {
  entries: number
  onDraw: () => Promise<{ prize: string; value: number }>
}

export function LuckyDraw({ entries, onDraw }: LuckyDrawProps) {
  const [drawing, setDrawing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [showConfetti, setShowConfetti] = useState(false)

  const handleDraw = async () => {
    if (entries <= 0) {
      toast.error('No entries left! Make purchases to earn more.')
      return
    }

    setDrawing(true)
    setResult(null)

    // Animation delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    try {
      const data = await onDraw()
      setResult(data)
      setShowConfetti(true)
      toast.success(`You won: ${data.prize}!`)
      
      setTimeout(() => setShowConfetti(false), 3000)
    } catch (error) {
      toast.error('Draw failed. Try again!')
    } finally {
      setDrawing(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mb-4">
            <Gift className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold">Weekly Lucky Draw</h3>
          <p className="text-sm text-muted-foreground">
            Every $50 spent = 1 entry ticket
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6">
          <Ticket className="h-5 w-5 text-amber-500" />
          <span className="text-2xl font-bold">{entries}</span>
          <span className="text-muted-foreground">entries</span>
        </div>

        <Button 
          size="lg"
          className="w-full gap-2"
          onClick={handleDraw}
          disabled={drawing || entries <= 0}
        >
          {drawing ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Drawing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Draw Now
            </>
          )}
        </Button>

        {/* Result Display */}
        {result && (
          <div className="mt-6 p-4 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-1">You won:</p>
            <p className="text-xl font-bold text-amber-700">{result.prize}</p>
            <p className="text-sm text-amber-600">Value: ${result.value}</p>
          </div>
        )}

        {/* Prize Pool */}
        <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 bg-muted rounded">
            <p className="font-semibold">Grand Prize</p>
            <p className="text-muted-foreground">$500 Gift Card</p>
          </div>
          <div className="p-2 bg-muted rounded">
            <p className="font-semibold">2nd Prize</p>
            <p className="text-muted-foreground">$100 Coupon</p>
          </div>
          <div className="p-2 bg-muted rounded">
            <p className="font-semibold">3rd Prize</p>
            <p className="text-muted-foreground">50% Off</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

