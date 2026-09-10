'use client'

import { useState } from 'react'
import { Sun, CloudRain, Snowflake, Wind, ShoppingBag, Thermometer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function SeasonalClothingPage() {
  const [season, setSeason] = useState('summer')

  const recommendations: Record<string, any[]> = {
    summer: [
      { name: 'Cotton T-Shirts', type: 'Top', temp: '25-35C' },
      { name: 'Shorts', type: 'Bottom', temp: '25-35C' },
      { name: 'Sunglasses', type: 'Accessory', temp: 'All day' },
    ],
    monsoon: [
      { name: 'Rain Jacket', type: 'Outerwear', temp: '20-30C' },
      { name: 'Waterproof Shoes', type: 'Footwear', temp: 'All day' },
      { name: 'Umbrella', type: 'Accessory', temp: 'All day' },
    ],
    winter: [
      { name: 'Wool Sweaters', type: 'Top', temp: '5-20C' },
      { name: 'Jackets', type: 'Outerwear', temp: '5-20C' },
      { name: 'Warm Socks', type: 'Footwear', temp: '5-20C' },
    ],
  }

  const icons: Record<string, any> = {
    summer: Sun,
    monsoon: CloudRain,
    winter: Snowflake,
  }

  const Icon = icons[season]

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Thermometer className="h-8 w-8 text-blue-600" />
          Seasonal Clothing
        </h1>
        <p className="text-muted-foreground">
          Weather: "40C today"  wardrobe: "Switch to linen, order cooling towels"
        </p>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {Object.keys(recommendations).map((s) => (
          <Button 
            key={s}
            variant={season === s ? 'default' : 'outline'}
            onClick={() => setSeason(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {season.charAt(0).toUpperCase() + season.slice(1)} Essentials
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations[season].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">{item.type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{item.temp}</Badge>
                  <Button size="sm">
                    <ShoppingBag className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
