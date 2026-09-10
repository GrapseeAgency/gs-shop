'use client'

import { useState } from 'react'
import { Palette, CheckCircle, Shirt, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function ColorAdvisorPage() {
  const [skinTone, setSkinTone] = useState('')

  const tones = [
    { name: 'Fair', undertone: 'Cool/Warm' },
    { name: 'Medium', undertone: 'Neutral' },
    { name: 'Olive', undertone: 'Warm' },
    { name: 'Dark', undertone: 'Cool/Warm' },
  ]

  const colors: Record<string, string[]> = {
    'Fair': ['Pastel pink', 'Light blue', 'Mint green', 'Soft yellow'],
    'Medium': ['Coral', 'Teal', 'Lavender', 'Peach'],
    'Olive': ['Emerald', 'Rust', 'Cream', 'Burgundy'],
    'Dark': ['Bright white', 'Royal blue', 'Orange', 'Hot pink'],
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Palette className="h-8 w-8 text-pink-600" />
          Color Advisor
        </h1>
        <p className="text-muted-foreground">
          Color matching guide for your skin tone
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Your Skin Tone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {tones.map((tone) => (
              <Button
                key={tone.name}
                variant={skinTone === tone.name ? 'default' : 'outline'}
                className="h-auto py-4"
                onClick={() => setSkinTone(tone.name)}
              >
                <div className="text-left">
                  <p className="font-bold">{tone.name}</p>
                  <p className="text-xs opacity-70">{tone.undertone}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {skinTone && (
        <Card className="bg-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Best Colors for {skinTone} Skin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {colors[skinTone]?.map((color) => (
                <Badge key={color} className="text-lg py-3 px-4 bg-pink-500">
                  <Shirt className="h-4 w-4 mr-2" />
                  {color}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
