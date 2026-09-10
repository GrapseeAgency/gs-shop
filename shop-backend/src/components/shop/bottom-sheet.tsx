'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  snapPoints?: number[] // Percentages of screen height
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  snapPoints = [50, 85]
}: BottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [translateY, setTranslateY] = useState(0)

  const sheetHeight = snapPoints[currentSnap]

  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true)
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    setStartY(clientY)
  }

  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    const diff = clientY - startY
    if (diff > 0) {
      setTranslateY(diff)
    }
  }

  const handleDragEnd = () => {
    if (!isDragging) return
    setIsDragging(false)

    // Determine snap point based on drag distance
    const threshold = window.innerHeight * 0.2
    if (translateY > threshold) {
      if (currentSnap === 0) {
        onClose()
      } else {
        setCurrentSnap(currentSnap - 1)
      }
    } else if (translateY < -threshold && currentSnap < snapPoints.length - 1) {
      setCurrentSnap(currentSnap + 1)
    }
    setTranslateY(0)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={cn(
          'fixed left-0 right-0 bottom-0 z-50 bg-background rounded-t-2xl shadow-2xl',
          'animate-in slide-in-from-bottom duration-300',
          isDragging && 'transition-none'
        )}
        style={{
          height: `${sheetHeight}%`,
          transform: `translateY(${translateY}px)`
        }}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <h3 className="font-semibold">{title}</h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto h-full p-4 pb-20">
          {children}
        </div>
      </div>
    </>
  )
}
