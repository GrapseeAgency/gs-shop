'use client'

import { useState } from 'react'
import { User, Ruler, Shirt, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function BodyTypePage() {
  const [bodyType, setBodyType] = useState('')

  const types = [
    { name: 'Hourglass', desc: 'Balanced shoulders and hips, defined waist' },
    { name: 'Pear', desc: 'Hips wider than shoulders' },
    { name: 'Apple', desc: 'Fuller midsection, slim legs' },
    { name: 'Rectangle', desc: 'Straight silhouette, minimal waist' },
    { name: 'Inverted Triangle', desc: 'Shoulders wider than hips' },
  ]

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <User className="h-8 w-8 text-purple-600" />
          Body Type Guide
        </h1>
        <p className="text-muted-foreground">
          Get size recommendations based on your body type
        </p>
      </div>

      <div className="grid gap-4">
        {types.map((type) => (
          <Card 
            key={type.name} 
            className={bodyType === type.name ? 'border-purple-500' : ''}
            onClick={() => setBodyType(type.name)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Ruler className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-bold">{type.name}</p>
                    <p className="text-sm text-muted-foreground">{type.desc}</p>
                  </div>
                </div>
                {bodyType === type.name && (
                  <Badge className="bg-purple-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Selected
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {bodyType && (
        <Card className="mt-6 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shirt className="h-5 w-5" />
              Recommended Sizes for {bodyType}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {['Top: M', 'Bottom: L', 'Dress: M'].map((size) => (
                <div key={size} className="bg-white p-3 rounded-lg text-center">
                  <p className="font-medium">{size}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
