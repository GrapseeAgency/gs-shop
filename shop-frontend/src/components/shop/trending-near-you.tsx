'use client'

import { useEffect, useState } from 'react'
import { MapPin, TrendingUp } from 'lucide-react'
import { ProductCard } from './product-card'
import { Button } from '@/components/ui/button'

export function TrendingNearYou() {
  const [products, setProducts] = useState<any[]>([])
  const [location, setLocation] = useState<string>('your area')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrending()
  }, [])

  const fetchTrending = async () => {
    try {
      // Get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const res = await fetch(`/api/trending-near?lat=${position.coords.latitude}&lng=${position.coords.longitude}`)
            if (res.ok) {
              const data = await res.json()
              setProducts(data.products)
              setLocation(data.location || 'your area')
            }
          },
          () => {
            // Fallback without location
            fetchFallbackTrending()
          }
        )
      } else {
        fetchFallbackTrending()
      }
    } catch (error) {
      fetchFallbackTrending()
    } finally {
      setLoading(false)
    }
  }

  const fetchFallbackTrending = async () => {
    // Fetch trending products without location
    const res = await fetch('/api/products?trending=true&limit=4')
    if (res.ok) {
      const data = await res.json()
      setProducts(data.data || [])
    }
  }

  if (loading) {
    return (
      <section className="py-8">
        <div className="h-8 bg-muted rounded w-1/3 mb-4 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </section>
    )
  }

  if (products.length === 0) return null

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-500" />
            Trending Near {location}
          </h2>
          <p className="text-sm text-muted-foreground">
            Popular in your region right now
          </p>
        </div>
        <Button variant="ghost" size="sm" className="gap-1">
          <TrendingUp className="h-4 w-4" />
          View All
        </Button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

