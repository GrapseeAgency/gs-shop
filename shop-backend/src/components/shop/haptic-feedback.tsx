'use client'

export function useHapticFeedback() {
  const trigger = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'texture' = 'light') => {
    if (typeof navigator === 'undefined') return

    // Check if vibration API is supported
    if ('vibrate' in navigator) {
      const patterns: Record<string, number | number[]> = {
        light: 10,
        medium: 20,
        heavy: 30,
        success: [10, 50, 10],
        error: [30, 50, 30],
        // Phase 2: Texture simulation patterns
        texture: [5, 10, 5, 10, 5], // Rough texture feel
        smooth: [15], // Smooth texture
        soft: [20, 30, 20], // Soft/bouncy feel
        rigid: [50], // Hard/rigid feel
        ripple: [10, 20, 10, 20, 10] // Water/ripple effect
      }

      navigator.vibrate(patterns[type] || 10)
    }
  }

  // Phase 2: Advanced texture simulation for product feel
  const simulateTexture = (textureType: 'smooth' | 'rough' | 'soft' | 'rigid' | 'fabric') => {
    const texturePatterns: Record<string, number[]> = {
      smooth: [10, 5, 10],
      rough: [5, 5, 5, 5, 5, 5],
      soft: [30, 50, 30],
      rigid: [40],
      fabric: [8, 12, 8, 12, 8]
    }

    if ('vibrate' in navigator) {
      navigator.vibrate(texturePatterns[textureType] || [10])
    }
  }

  // Phase 2: Haptic feedback for product interactions
  const productFeedback = (action: 'hover' | 'select' | 'addToCart' | 'purchase') => {
    const actionPatterns: Record<string, number | number[]> = {
      hover: 5,
      select: [10, 20],
      addToCart: [15, 30, 15],
      purchase: [20, 50, 20, 50, 20] // Celebratory pattern
    }

    if ('vibrate' in navigator) {
      navigator.vibrate(actionPatterns[action] || 10)
    }
  }

  return { trigger, simulateTexture, productFeedback }
}

export function HapticButton({ 
  children, 
  onClick, 
  feedback = 'light',
  ...props 
}: {
  children: React.ReactNode
  onClick?: () => void
  feedback?: 'light' | 'medium' | 'heavy' | 'success' | 'error'
  [key: string]: any
}) {
  const { trigger } = useHapticFeedback()

  const handleClick = () => {
    trigger(feedback)
    onClick?.()
  }

  return (
    <button onClick={handleClick} {...props}>
      {children}
    </button>
  )
}
