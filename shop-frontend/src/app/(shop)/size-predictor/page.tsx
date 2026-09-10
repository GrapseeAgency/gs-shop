'use client'

import { useState } from 'react'
import { Ruler, Calculator, Shirt, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function SizePredictorPage() {
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [predicted, setPredicted] = useState(false)

  const predict = () => {
    if (height && weight) {
      setPredicted(true)
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Ruler className="h-8 w-8 text-blue-600" />
          Size Predictor
        </h1>
        <p className="text-muted-foreground">
          AI size predictions based on your measurements
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Your Measurements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Height (cm)</label>
              <Input 
                type="number"
                placeholder="175"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Weight (kg)</label>
              <Input 
                type="number"
                placeholder="70"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
          </div>
          <Button className="w-full" onClick={predict}>Predict My Size</Button>
        </CardContent>
      </Card>

      {predicted && (
        <Card className="bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shirt className="h-5 w-5" />
              Your Predicted Sizes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {['Top: M', 'Bottom: 32', 'Shoes: 9'].map((size) => (
                <div key={size} className="bg-white p-4 rounded-lg text-center">
                  <CheckCircle className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-medium">{size}</p>
                  <Badge className="mt-1 bg-blue-500">95% Accuracy</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
