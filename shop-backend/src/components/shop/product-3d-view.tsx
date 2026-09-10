'use client'

import { useState } from 'react'
import { RotateCw, ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface Product3DViewProps {
  images: string[]
  productName: string
}

export function Product3DView({ images, productName }: Product3DViewProps) {
  const [currentImage, setCurrentImage] = useState(0)
  const [isRotating, setIsRotating] = useState(false)
  const [zoom, setZoom] = useState(1)

  const handleRotate = () => {
    setIsRotating(true)
    // Cycle through images to simulate 3D rotation
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length)
    }, 200)

    setTimeout(() => {
      clearInterval(interval)
      setIsRotating(false)
    }, 2000)
  }

  const handleZoom = (direction: 'in' | 'out') => {
    setZoom(prev => {
      if (direction === 'in') return Math.min(prev + 0.5, 3)
      return Math.max(prev - 0.5, 1)
    })
  }

  if (images.length === 0) return null

  return (
    <div className="relative">
      <div 
        className="relative aspect-square bg-muted rounded-lg overflow-hidden"
        style={{ 
          transform: `scale(${zoom})`,
          transition: 'transform 0.3s ease'
        }}
      >
        <Image
          src={images[currentImage]}
          alt={`${productName} - View ${currentImage + 1}`}
          fill
          className="object-cover"
        />
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => handleZoom('out')}
          disabled={zoom <= 1}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleRotate}
          disabled={isRotating || images.length < 2}
        >
          <RotateCw className={`h-4 w-4 ${isRotating ? 'animate-spin' : ''}`} />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => handleZoom('in')}
          disabled={zoom >= 3}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      {/* Image dots */}
      {images.length > 1 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`h-2 w-2 rounded-full transition-colors ${
                currentImage === index ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
