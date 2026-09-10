'use client'

import { useState } from 'react'
import { Leaf, Calculator, Truck, Package, BadgeCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function CarbonCalculatorPage() {
  const [distance, setDistance] = useState('')
  const [weight, setWeight] = useState('')

  const dist = parseFloat(distance) || 0
  const w = parseFloat(weight) || 0
  const carbon = Math.round(dist * w * 0.0001 * 100) / 100 // kg CO2

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Leaf className="h-8 w-8 text-green-600" />
          Carbon Calculator
        </h1>
        <p className="text-muted-foreground">
          Track carbon footprint of your deliveries
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculate Carbon Footprint
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-muted-foreground" />
            <Input 
              type="number"
              placeholder="Distance (km)"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            <Input 
              type="number"
              placeholder="Package weight (kg)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>

          {(distance || weight) && (
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <Leaf className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm text-muted-foreground">Carbon Footprint</p>
              <p className="text-4xl font-bold text-green-700">{carbon} kg</p>
              <p className="text-sm text-muted-foreground mt-2">CO equivalent</p>
              <Badge className="mt-2 bg-green-500">
                <BadgeCheck className="h-3 w-3 mr-1" />
                Carbon Neutral Option Available
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
