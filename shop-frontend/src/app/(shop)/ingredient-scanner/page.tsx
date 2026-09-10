'use client'

import { useState } from 'react'
import { Camera, Scan, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function IngredientScannerPage() {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<any>(null)

  const scanProduct = async () => {
    setScanning(true)
    
    // Simulate scan delay
    setTimeout(async () => {
      try {
        const res = await fetch('/api/trust/ingredient-scanner', {
          method: 'POST',
          body: new FormData() // []
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
    }, 2000)
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Scan className="h-8 w-8 text-blue-600" />
          Ingredient Scanner
        </h1>
        <p className="text-muted-foreground">
          Scan food/cosmetic products to decode every ingredient
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-8 text-center">
          <div 
            className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-4 cursor-pointer transition-all ${
              scanning ? 'bg-blue-100 animate-pulse' : 'bg-muted hover:bg-muted/80'
            }`}
            onClick={scanProduct}
          >
            <Camera className={`h-12 w-12 ${scanning ? 'text-blue-600' : 'text-muted-foreground'}`} />
          </div>
          
          <p className="text-lg font-medium mb-2">
            {scanning ? 'Scanning...' : 'Tap to Scan Product'}
          </p>
          <p className="text-sm text-muted-foreground">
            Point camera at ingredient list
          </p>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.safetyScore > 70 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              )}
              Scan Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{result.summary?.good || 0}</p>
                <p className="text-sm text-green-700">Good Ingredients</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{result.summary?.neutral || 0}</p>
                <p className="text-sm text-yellow-700">Neutral</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{result.summary?.bad || 0}</p>
                <p className="text-sm text-red-700">Concerning</p>
              </div>
            </div>

            <div className="space-y-2">
              {result.ingredients?.map((ing: any, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                  <span className="text-2xl">{ing.icon}</span>
                  <div>
                    <p className="font-medium">{ing.name}</p>
                    <p className="text-sm text-muted-foreground">{ing.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 font-medium">{result.verdict}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
