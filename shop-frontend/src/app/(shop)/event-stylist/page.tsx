'use client'

import { useState } from 'react'
import { Calendar, Sparkles, PartyPopper, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function EventStylistPage() {
  const [event, setEvent] = useState('')

  const events: Record<string, any> = {
    'wedding': {
      outfit: 'Traditional Kurta + Nehru Jacket',
      accessories: ['Pocket Square', 'Ethnic Watch', 'Kolhapuris'],
      colors: ['Navy', 'Maroon', 'Cream'],
    },
    'office-party': {
      outfit: 'Blazer + Chinos + Shirt',
      accessories: ['Tie', 'Leather Belt', 'Formal Shoes'],
      colors: ['Charcoal', 'Burgundy', 'White'],
    },
    'casual-brunch': {
      outfit: 'Polo + Denim + Sneakers',
      accessories: ['Sunglasses', 'Watch', 'Canvas Bag'],
      colors: ['Pastel Blue', 'White', 'Khaki'],
    },
  }

  const selected = events[event]

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <PartyPopper className="h-8 w-8 text-pink-600" />
          Event Stylist
        </h1>
        <p className="text-muted-foreground">
          Outfit recommendations for any occasion
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select Occasion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {Object.keys(events).map((e) => (
              <Button
                key={e}
                variant={event === e ? 'default' : 'outline'}
                className="h-auto py-4"
                onClick={() => setEvent(e)}
              >
                {e.replace('-', ' ').toUpperCase()}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selected && (
        <Card className="bg-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Perfect Outfit for {event.replace('-', ' ').toUpperCase()}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Recommended Outfit</p>
              <p className="text-xl font-bold">{selected.outfit}</p>
            </div>

            <div>
              <p className="font-medium mb-2">Accessories</p>
              <div className="flex flex-wrap gap-2">
                {selected.accessories.map((acc: string) => (
                  <Badge key={acc} className="bg-pink-500">
                    <Heart className="h-3 w-3 mr-1" />
                    {acc}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="font-medium mb-2">Color Palette</p>
              <div className="flex gap-2">
                {selected.colors.map((color: string) => (
                  <Badge key={color} variant="outline" className="px-4 py-2">
                    {color}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
