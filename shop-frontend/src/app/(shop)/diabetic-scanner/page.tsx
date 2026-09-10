'use client'

import { useState } from 'react'
import { Scan, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function DiabeticScannerPage() {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<any>(null)

  const scanFood = async () => {
    setScanning(true)
    
    setTimeout(async () => {
      try {
        const res = await fetch('/api/biometric/diabetic-scanner', {
          method: 'POST',
          body: new FormData()
        })
        
        if (res.ok) {
          const data = await res.json()
          setResult(data)
        }
      } catch (error) {
        toast.error('Scan failed')
      } finally {
        setScanning(false)
      }
    }, 1500)
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Scan className="h-8 w-8 text-green-600" />
          Diabetic-Friendly Scanner
        </h1>
        <p className="text-muted-foreground">
          Scan food to check sugar content and glycemic index
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-8 text-center">
          <div 
            className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-4 cursor-pointer transition-all ${
              scanning ? 'bg-green-100 animate-pulse' : 'bg-muted hover:bg-muted/80'
            }`}
            onClick={scanFood}
          >
            <Scan className={`h-12 w-12 ${scanning ? 'text-green-600' : 'text-muted-foreground'}`} />
          </div>
          
          <p className="text-lg font-medium mb-2">
            {scanning ? 'Analyzing food...' : 'Tap to Scan Food'}
          </p>
          <p className="text-sm text-muted-foreground">
            Point camera at food label or packaging
          </p>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="p-8 text-center">
            <Badge 
              className={`text-lg px-4 py-2 ${
                result.diabeticRating?.color === 'green' ? 'bg-green-500' :
                result.diabeticRating?.color === 'red' ? 'bg-red-500' : 'bg-yellow-500'
              }`}
            >
              {result.diabeticRating?.icon} {result.diabeticRating?.rating?.toUpperCase()}
            </Badge>

            <p className="text-xl font-medium mt-4">{result.food?.name}</p>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{result.food?.sugarContent}g</p>
                <p className="text-sm text-muted-foreground">Sugar per 100g</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{result.food?.glycemicIndex}</p>
                <p className="text-sm text-muted-foreground">Glycemic Index</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{result.food?.carbs}g</p>
                <p className="text-sm text-muted-foreground">Carbs per 100g</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 font-medium">{result.diabeticRating?.message}</p>
              <p className="text-blue-600 mt-2">{result.recommendation}</p>
            </div>

            {result.alternatives && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Diabetic-Friendly Alternatives:</p>
                {result.alternatives.map((alt: any, i: number) => (
                  <div key={i} className="p-2 bg-green-50 rounded-lg mt-2 text-left">
                    <p className="font-medium text-green-800">{alt.name}</p>
                    <p className="text-sm text-green-600">{alt.benefit}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
