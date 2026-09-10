'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Image as ImageIcon,
} from 'lucide-react'

interface ProductImageGalleryProps {
  images: string[]
  alt?: string
  className?: string
}

export function ProductImageGallery({ images, alt = 'Product image', className = '' }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  const validImages = images.length > 0 ? images : ['']
  const currentImage = validImages[activeIndex]

  const goToPrev = useCallback(() => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : validImages.length - 1))
    setIsZoomed(false)
  }, [validImages.length])

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev < validImages.length - 1 ? prev + 1 : 0))
    setIsZoomed(false)
  }, [validImages.length])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToNext()
      else goToPrev()
    }
  }

  const handlePinchZoom = () => {
    setIsZoomed(!isZoomed)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
  }

  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index)
    setIsZoomed(false)
  }

  return (
    <>
      {/* Main Gallery */}
      <div className={`space-y-2 ${className}`}>
        {/* Main Image */}
        <div className="relative rounded-xl overflow-hidden bg-muted/30">
          <div
            className="relative aspect-square cursor-zoom-in"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseMove={handleMouseMove}
            onClick={handlePinchZoom}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full"
              >
                {currentImage ? (
                  <motion.img
                    src={currentImage}
                    alt={`${alt} ${activeIndex + 1}`}
                    className="w-full h-full object-cover"
                    animate={isZoomed ? {
                      scale: 2.5,
                      x: `${(zoomPosition.x - 50) * -1}%`,
                      y: `${(zoomPosition.y - 50) * -1}%`,
                    } : { scale: 1, x: 0, y: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-muted-foreground/20" />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            {validImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); goToPrev() }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-background/80 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); goToNext() }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-background/80 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Image Counter Badge */}
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-background/60 backdrop-blur-sm text-xs text-foreground font-medium">
              {activeIndex + 1} / {validImages.length}
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={(e) => { e.stopPropagation(); setIsFullscreen(true) }}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-background/80 transition"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {/* Zoom Indicator */}
            {isZoomed && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded-full bg-background/60 backdrop-blur-sm text-[10px] text-foreground">
                <ZoomIn className="w-3 h-3 inline mr-1" />
                Pinch or click to zoom out
              </div>
            )}

            {/* Dot Indicators */}
            {validImages.length > 1 && !isZoomed && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {validImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); handleThumbnailClick(idx) }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === activeIndex ? 'bg-foreground w-5' : 'bg-foreground/30'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail Strip */}
        {validImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {validImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => handleThumbnailClick(idx)}
                className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                  idx === activeIndex
                    ? 'border-foreground'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                {img ? (
                  <img src={img} alt={`${alt} thumb ${idx + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-muted/50 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-muted-foreground/30" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center z-10"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div
              className="relative w-full h-full flex items-center justify-center"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full h-full flex items-center justify-center p-4"
                >
                  {currentImage ? (
                    <img
                      src={currentImage}
                      alt={`${alt} ${activeIndex + 1}`}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <ImageIcon className="w-24 h-24 text-white/20" />
                  )}
                </motion.div>
              </AnimatePresence>

              {validImages.length > 1 && (
                <>
                  <button
                    onClick={goToPrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>
                </>
              )}
            </div>

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/10 text-white text-sm font-medium">
              {activeIndex + 1} / {validImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
