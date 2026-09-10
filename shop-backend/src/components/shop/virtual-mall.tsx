'use client'

import { useEffect, useState } from 'react'
import { MapPin, Store, Navigation, Star } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface VirtualMallProps {
  onStoreSelect?: (storeId: string) => void
}

export function VirtualMall({ onStoreSelect }: VirtualMallProps) {
  const [stores, setStores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [position, setPosition] = useState({ x: 500, z: 300 })

  useEffect(() => {
    fetchMallLayout()
  }, [])

  const fetchMallLayout = async () => {
    try {
      const res = await fetch('/api/virtual-mall')
      if (res.ok) {
        const data = await res.json()
        setStores(data.layout?.stores || [])
      }
    } catch (error) {
      console.error('Error fetching mall:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMove = (direction: string) => {
    setPosition(prev => {
      switch (direction) {
        case 'up': return { ...prev, z: prev.z - 50 }
        case 'down': return { ...prev, z: prev.z + 50 }
        case 'left': return { ...prev, x: prev.x - 50 }
        case 'right': return { ...prev, x: prev.x + 50 }
        default: return prev
      }
    })
  }

  if (loading) {
    return (
      <div className="h-96 bg-muted rounded-lg animate-pulse flex items-center justify-center">
        <p className="text-muted-foreground">Loading virtual mall...</p>
      </div>
    )
  }

  return (
    <div className="relative h-[600px] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 rounded-lg overflow-hidden">
      {/* Isometric Grid */}
      <div 
        className="absolute inset-0 transition-transform duration-500"
        style={{
          transform: `translate(${-position.x + 500}px, ${-position.z + 300}px)`,
          perspective: '1000px'
        }}
      >
        {/* Floor Grid */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(30deg, #000 12%, transparent 12.5%, transparent 87%, #000 87.5%, #000),
              linear-gradient(150deg, #000 12%, transparent 12.5%, transparent 87%, #000 87.5%, #000),
              linear-gradient(30deg, #000 12%, transparent 12.5%, transparent 87%, #000 87.5%, #000),
              linear-gradient(150deg, #000 12%, transparent 12.5%, transparent 87%, #000 87.5%, #000)
            `,
            backgroundSize: '100px 100px'
          }}
        />

        {/* Stores */}
        {stores.map((store, index) => (
          <div
            key={store.id}
            className="absolute transition-all hover:scale-105 cursor-pointer"
            style={{
              left: store.position.x,
              top: store.position.z,
              transform: `rotateX(60deg) rotateZ(-45deg) ${store.position.rotation ? `rotateY(${store.position.rotation}deg)` : ''}`
            }}
            onClick={() => onStoreSelect?.(store.id)}
          >
            <Card className="w-48 h-32 bg-white dark:bg-slate-800 shadow-lg flex flex-col items-center justify-center p-4">
              <Store className="h-8 w-8 text-emerald-500 mb-2" />
              <p className="font-semibold text-sm text-center line-clamp-2">{store.name}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-amber-500 flex items-center gap-0.5"><Star className="h-3 w-3 fill-amber-500" /> {store.rating}</span>
                <span className="text-xs text-muted-foreground">({store.productCount})</span>
              </div>
            </Card>
          </div>
        ))}

        {/* Avatar */}
        <div
          className="absolute w-8 h-8 bg-primary rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-10"
          style={{
            left: position.x,
            top: position.z,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <MapPin className="h-5 w-5 text-white" />
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur p-3 rounded-lg shadow-lg">
        <div className="grid grid-cols-3 gap-1">
          <div />
          <Button size="sm" variant="outline" onClick={() => handleMove('up')}></Button>
          <div />
          <Button size="sm" variant="outline" onClick={() => handleMove('left')}></Button>
          <Button size="sm" variant="outline" onClick={() => handleMove('down')}></Button>
          <Button size="sm" variant="outline" onClick={() => handleMove('right')}></Button>
        </div>
      </div>

      {/* Info */}
      <div className="absolute top-4 right-4 bg-background/90 backdrop-blur p-3 rounded-lg shadow-lg max-w-xs">
        <h3 className="font-semibold flex items-center gap-2">
          <Navigation className="h-4 w-4" />
          Virtual Mall
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Walk around and click stores to enter. Use arrow keys or buttons to move.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Position: ({Math.round(position.x)}, {Math.round(position.z)})
        </p>
      </div>
    </div>
  )
}
