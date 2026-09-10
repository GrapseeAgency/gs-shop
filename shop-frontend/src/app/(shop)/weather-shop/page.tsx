'use client'

import { useEffect, useState } from 'react'
import { Cloud, Sun, CloudRain, Snowflake, Umbrella } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ProductCard } from '@/components/shop/product-card'
import { Skeleton } from '@/components/ui/skeleton'

export default function WeatherShoppingPage() {
  const [weather, setWeather] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWeatherAndProducts()
  }, [])

  const fetchWeatherAndProducts = async () => {
    try {
      // Get user's location and weather
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })

      const { latitude, longitude } = position.coords
      
      // Fetch weather (would use real weather API)
      const weatherData = { condition: 'sunny', temp: 25 }

      setWeather(weatherData)

      // Get weather-based recommendations
      const res = await fetch(`/api/weather-shop?condition=${weatherData.condition}&temp=${weatherData.temp}`)
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products)
      }
    } catch (error) {
      console.error('Weather fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="h-16 w-16 text-amber-500" />
      case 'rainy': return <CloudRain className="h-16 w-16 text-blue-500" />
      case 'cloudy': return <Cloud className="h-16 w-16 text-gray-500" />
      case 'snowy': return <Snowflake className="h-16 w-16 text-cyan-500" />
      default: return <Sun className="h-16 w-16 text-amber-500" />
    }
  }

  const getWeatherMessage = (condition: string) => {
    const messages: Record<string, string> = {
      sunny: 'It is sunny out there! Check out these summer essentials.',
      rainy: 'Rainy day? Stay dry with these picks.',
      cloudy: 'Cloudy skies - perfect for indoor comfort items.',
      snowy: 'Brrr! It is cold. Warm up with these products.'
    }
    return messages[condition] || 'Check out today\'s recommendations!'
  }

  if (loading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-48 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <Card className="mb-8 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
        <CardContent className="p-8 text-center">
          {weather && (
            <>
              <div className="flex justify-center mb-4">
                {getWeatherIcon(weather.condition)}
              </div>
              <h1 className="text-3xl font-bold mb-2">
                {weather.temp}C {weather.condition.charAt(0).toUpperCase() + weather.condition.slice(1)}
              </h1>
              <p className="text-muted-foreground text-lg">
                {getWeatherMessage(weather.condition)}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Umbrella className="h-5 w-5" />
        Perfect for Today&apos;s Weather
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No weather-specific recommendations available right now.
        </p>
      )}
    </div>
  )
}
