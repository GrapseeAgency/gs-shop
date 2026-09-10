'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

interface RatingStarsProps {
  rating: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  interactive?: boolean
  onRate?: (rating: number) => void
  onChange?: (rating: number) => void
  color?: string
  className?: string
}

const SIZE_MAP = {
  sm: { star: 'w-3.5 h-3.5', text: 'text-xs', gap: 'gap-0.5' },
  md: { star: 'w-5 h-5', text: 'text-sm', gap: 'gap-1' },
  lg: { star: 'w-7 h-7', text: 'text-lg', gap: 'gap-1.5' },
}

export function RatingStars({
  rating,
  size = 'md',
  showValue = false,
  interactive = false,
  onRate,
  onChange,
  color,
  className = '',
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0)
  const [selectedRating, setSelectedRating] = useState(interactive ? 0 : rating)
  const sizeConfig = SIZE_MAP[size]

  const displayRating = interactive ? (hoverRating || selectedRating) : rating

  const handleClick = useCallback((starIndex: number) => {
    if (!interactive) return
    setSelectedRating(starIndex)
    onRate?.(starIndex)
    onChange?.(starIndex)
  }, [interactive, onRate, onChange])

  const getColor = () => {
    if (color) return color
    return 'text-amber-400'
  }

  const getFillColor = () => {
    if (color) return color
    return 'fill-amber-400'
  }

  const renderStar = (starIndex: number) => {
    const filled = displayRating >= starIndex
    const halfFilled = !filled && displayRating >= starIndex - 0.5

    return (
      <motion.button
        key={starIndex}
        type="button"
        disabled={!interactive}
        onClick={() => handleClick(starIndex)}
        onMouseEnter={() => interactive && setHoverRating(starIndex)}
        onMouseLeave={() => interactive && setHoverRating(0)}
        whileHover={interactive ? { scale: 1.2 } : {}}
        whileTap={interactive ? { scale: 0.9 } : {}}
        className={`relative ${interactive ? 'cursor-pointer' : 'cursor-default'} ${sizeConfig.star}`}
      >
        {/* Empty star (background) */}
        <Star
          className={`${sizeConfig.star} text-muted-foreground/30`}
        />

        {/* Filled or half-filled star (foreground) */}
        {(filled || halfFilled) && (
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: filled ? '100%' : '50%' }}
          >
            <Star
              className={`${sizeConfig.star} ${getFillColor()} ${getColor()} fill-current`}
            />
          </div>
        )}
      </motion.button>
    )
  }

  return (
    <div className={`inline-flex items-center ${sizeConfig.gap} ${className}`}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((starIndex) => (
          <div key={starIndex} className="relative">
            {renderStar(starIndex)}
          </div>
        ))}
      </div>
      {showValue && (
        <span className={`${sizeConfig.text} font-semibold text-foreground ml-1`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
