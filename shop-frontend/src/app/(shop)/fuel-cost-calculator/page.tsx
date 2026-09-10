'use client'

import { useState } from 'react'
import { Fuel, Calculator, MapPin, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function FuelCostCalculatorPage() {
  const [distance, setDistance] = useState('')
  const [vehicle, setVehicle] = useState('bike')
  const [cost, setCost] = useState<number | null>(null)

  const calculate = () => {
    const dist = parseFloat(distance) || 0
    const rates: Record<string, number> = { bike: 2.5, car: 8, bus: 1.5 }
    setCost(Math.round(dist * rates[vehicle]))
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Fuel className="h-8 w-8 text-orange-600" />
          Fuel Cost Calculator
        </h1>
        <p className="text-muted-foreground">
          Add location  show fuel cost for driving there vs delivery fee
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculate Travel Cost
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Distance (km)
            </label>
            <Input 
              type="number"
              placeholder="Enter distance in kilometers"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Vehicle Type</label>
            <div className="flex gap-2 mt-1">
              {['bike', 'car', 'bus'].map((v) => (
                <Button 
                  key={v} 
                  variant={vehicle === v ? 'default' : 'outline'}
                  onClick={() => setVehicle(v)}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <Button className="w-full" onClick={calculate}>
            <Calculator className="h-4 w-4 mr-2" />
            Calculate Cost
          </Button>

          {cost !== null && (
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <Fuel className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <p className="text-sm text-muted-foreground">Estimated Fuel Cost</p>
              <p className="text-3xl font-bold text-orange-700">{cost}</p>
              <p className="text-xs text-muted-foreground mt-2">
                vs Delivery fee: 50 (Save {Math.max(0, cost - 50)} with delivery!)
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
