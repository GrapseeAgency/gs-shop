'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface ParallaxHeroProps {
  imageUrl: string
  title: string
  subtitle?: string
}

export function ParallaxHero({ imageUrl, title, subtitle }: ParallaxHeroProps) {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="relative h-[60vh] overflow-hidden">
      <div
        className="absolute inset-0 w-full h-[120%]"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
          transition: 'transform 0.1s linear'
        }}
      >
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-8">
        <div className="container mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-2">{title}</h1>
          {subtitle && (
            <p className="text-xl text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  )
}
