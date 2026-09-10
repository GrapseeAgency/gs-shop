'use client'

import { useState, useRef } from 'react'
import { Heart, Share2, ShoppingBag, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from './product-card'

interface VideoItem {
  id: string
  videoUrl: string
  product: any
  likes: number
  description: string
}

export function TikTokFeed({ videos }: { videos: VideoItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [liked, setLiked] = useState<Set<string>>(new Set())
  const [muted, setMuted] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    if (!containerRef.current) return
    const scrollTop = containerRef.current.scrollTop
    const height = containerRef.current.clientHeight
    const newIndex = Math.round(scrollTop / height)
    setCurrentIndex(newIndex)
  }

  const toggleLike = (id: string) => {
    setLiked(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="h-[600px] overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      style={{ scrollSnapType: 'y mandatory' }}
    >
      {videos.map((video, index) => (
        <div 
          key={video.id}
          className="h-full snap-start relative bg-black flex items-center justify-center"
        >
          {/* Video Player */}
          <video
            src={video.videoUrl}
            className="h-full w-full object-cover"
            loop
            muted={muted}
            autoPlay={index === currentIndex}
            playsInline
          />

          {/* Overlay Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-white font-semibold mb-2">{video.description}</p>
            <div className="flex items-center gap-2">
              <ProductCard product={video.product} />
            </div>
          </div>

          {/* Side Actions */}
          <div className="absolute right-4 bottom-20 flex flex-col gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-glass-deep/20"
              onClick={() => toggleLike(video.id)}
            >
              <Heart 
                className={`h-6 w-6 ${liked.has(video.id) ? 'fill-red-500 text-red-500' : ''}`} 
              />
            </Button>
            <span className="text-white text-xs text-center">
              {video.likes + (liked.has(video.id) ? 1 : 0)}
            </span>

            <Button variant="ghost" size="icon" className="text-white hover:bg-glass-deep/20">
              <Share2 className="h-6 w-6" />
            </Button>

            <Button variant="ghost" size="icon" className="text-white hover:bg-glass-deep/20">
              <ShoppingBag className="h-6 w-6" />
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-glass-deep/20"
              onClick={() => setMuted(!muted)}
            >
              {muted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
            </Button>
          </div>

          {/* Progress Indicator */}
          <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs">
            {index + 1} / {videos.length}
          </div>
        </div>
      ))}
    </div>
  )
}

