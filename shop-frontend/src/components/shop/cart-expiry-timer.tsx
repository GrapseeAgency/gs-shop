'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { toast } from 'sonner'

interface CartExpiryTimerProps {
  expiryMinutes?: number
  onExpire?: () => void
}

export function CartExpiryTimer({ expiryMinutes = 30, onExpire }: CartExpiryTimerProps) {
  const [timeLeft, setTimeLeft] = useState(expiryMinutes * 60)
  const [isWarning, setIsWarning] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer)
          onExpire?.()
          return 0
        }
        
        // Show warning at 5 minutes
        if (prev === 300) {
          setIsWarning(true)
          toast.warning('Your cart expires in 5 minutes!', {
            duration: 10000
          })
        }
        
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [expiryMinutes, onExpire])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  const formatTime = () => {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (timeLeft <= 0) {
    return (
      <div className="flex items-center gap-2 text-red-500 text-sm">
        <Clock className="h-4 w-4" />
        <span>Cart expired</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${
      isWarning ? 'text-amber-500 animate-pulse' : 'text-muted-foreground'
    }`}>
      <Clock className="h-4 w-4" />
      <span>Cart expires in: {formatTime()}</span>
    </div>
  )
}

