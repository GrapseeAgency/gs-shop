'use client'

import { useEffect, useState } from 'react'
import { Camera, RotateCw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ARViewerProps {
  productId: string
  onClose?: () => void
}

export function ARViewer({ productId, onClose }: ARViewerProps) {
  const [arSupported, setArSupported] = useState(false)
  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState<any>(null)

  useEffect(() => {
    checkARSupport()
    fetchProduct()
  }, [productId])

  const checkARSupport = () => {
    // Check if device supports WebXR
    if ('xr' in navigator) {
      // @ts-ignore
      navigator.xr?.isSessionSupported('immersive-ar').then((supported: boolean) => {
        setArSupported(supported)
      }).catch(() => {
        setArSupported(false)
      })
    }
    setArSupported(false) // Fallback for demo
  }

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/ar-preview?productId=${productId}`)
      if (res.ok) {
        const data = await res.json()
        setProduct(data.product)
      }
    } catch (error) {
      console.error('Error fetching AR data:', error)
    } finally {
      setLoading(false)
    }
  }

  const startARSession = async () => {
    // Track AR session
    await fetch('/api/ar-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        sessionDuration: 0,
        placedSuccessfully: false
      })
    })
  }

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
        <p className="text-sm text-muted-foreground mt-2">Loading AR...</p>
      </Card>
    )
  }

  return (
    <Card className="relative overflow-hidden">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="aspect-square bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center relative">
        {/* Simulated AR View */}
        <div className="absolute inset-0 opacity-50">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        {/* Product Preview */}
        <div className="relative z-10 text-center">
          {product?.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-48 h-48 object-contain opacity-80"
              style={{ transform: 'rotateY(15deg)' }}
            />
          ) : (
            <div className="w-48 h-48 bg-white/10 rounded-lg flex items-center justify-center">
              <Camera className="h-16 w-16 text-white/30" />
            </div>
          )}
          
          <div className="mt-4 bg-black/50 backdrop-blur px-4 py-2 rounded-lg">
            <p className="text-white text-sm">{product?.name || 'Product Preview'}</p>
            <p className="text-white/60 text-xs">
              {product?.placementType === 'surface' ? 'Place on a flat surface' : 'Hang on wall'}
            </p>
          </div>
        </div>

        {/* AR Overlay UI */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-2">
          <Button 
            variant="secondary" 
            size="sm" 
            className="gap-2"
            onClick={startARSession}
          >
            <Camera className="h-4 w-4" />
            {arSupported ? 'Start AR' : 'AR Preview (Simulated)'}
          </Button>
          <Button variant="outline" size="icon">
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold">AR Preview</h3>
        <p className="text-sm text-muted-foreground">
          {arSupported 
            ? 'Point your camera at a flat surface to see the product in your space.'
            : 'Your device doesn\'t support AR. Viewing simulated preview.'
          }
        </p>
        {product?.dimensions && (
          <p className="text-xs text-muted-foreground mt-2">
            Dimensions: {product.dimensions}
          </p>
        )}
      </div>
    </Card>
  )
}
