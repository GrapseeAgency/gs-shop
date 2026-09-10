'use client'

import { useState } from 'react'
import { Ruler, ArrowRight, RotateCcw, Scale } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function MeasurementConverterPage() {
  const [value, setValue] = useState('')
  const [from, setFrom] = useState('inch')
  const [result, setResult] = useState('')

  const conversions: Record<string, Record<string, number>> = {
    inch: { cm: 2.54, mm: 25.4 },
    cm: { inch: 0.3937, mm: 10 },
    kg: { lb: 2.20462, g: 1000 },
    lb: { kg: 0.453592, g: 453.592 },
  }

  const convert = () => {
    const val = parseFloat(value)
    if (!val) return
    const conv = conversions[from]
    if (conv) {
      const target = from === 'inch' || from === 'cm' ? 'cm' : 'kg'
      setResult((val * (conv[target] || 1)).toFixed(2))
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Ruler className="h-8 w-8 text-purple-600" />
          Measurement Converter
        </h1>
        <p className="text-muted-foreground">
          Product dimensions: 12" x 8"  "That's 30cm x 20cm" converter
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Convert Units
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Value</label>
              <Input 
                type="number"
                placeholder="Enter value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">From</label>
              <div className="flex gap-2 mt-1">
                {['inch', 'cm', 'kg', 'lb'].map((unit) => (
                  <Button 
                    key={unit}
                    size="sm"
                    variant={from === unit ? 'default' : 'outline'}
                    onClick={() => setFrom(unit)}
                  >
                    {unit}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <Button className="w-full" onClick={convert}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Convert
          </Button>

          {result && (
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Result</p>
              <p className="text-3xl font-bold">{result} {from === 'inch' || from === 'cm' ? 'cm' : 'kg'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
