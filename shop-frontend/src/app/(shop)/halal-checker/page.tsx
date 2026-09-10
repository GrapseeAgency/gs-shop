'use client'

import { useState } from 'react'
import { ScanBarcode, CheckCircle, XCircle, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function HalalCheckerPage() {
  const [barcode, setBarcode] = useState('')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<any>(null)

  const checkProduct = async () => {
    if (!barcode) {
      toast.error('Enter barcode')
      return
    }

    setScanning(true)
    
    try {
      const res = await fetch('/api/lifestyle/halal-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode })
      })
      
      if (res.ok) {
        const data = await res.json()
        setResult(data)
      }
    } catch (error) {
      toast.error('Check failed')
    } finally {
      setScanning(false)
    }
  }

  const getIcon = () => {
    if (!result) return <HelpCircle className="h-16 w-16 text-muted-foreground" />
    if (result.status === 'halal') return <CheckCircle className="h-16 w-16 text-green-500" />
    if (result.status === 'haram') return <XCircle className="h-16 w-16 text-red-500" />
    return <HelpCircle className="h-16 w-16 text-yellow-500" />
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <ScanBarcode className="h-8 w-8 text-green-600" />
          Halal Product Checker
        </h1>
        <p className="text-muted-foreground">
          Scan barcode for instant halal status verification
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex gap-2">
            <Input 
              placeholder="Enter product barcode"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={checkProduct}
              disabled={scanning}
            >
              {scanning ? 'Checking...' : 'Check'}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Or use camera to scan barcode
          </p>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mb-4">
              {getIcon()}
            </div>
            
            <Badge 
              className={`text-lg px-4 py-2 ${
                result.status === 'halal' ? 'bg-green-500' :
                result.status === 'haram' ? 'bg-red-500' : 'bg-yellow-500'
              }`}
            >
              {result.status?.toUpperCase()}
            </Badge>

            <p className="text-xl font-medium mt-4">{result.reason}</p>

            {result.alternatives && (
              <div className="mt-6">
                <p className="text-sm text-muted-foreground mb-2">Halal Alternatives:</p>
                {result.alternatives.map((alt: any, i: number) => (
                  <div key={i} className="p-2 bg-green-50 rounded-lg mt-2">
                    <p className="font-medium text-green-800">{alt.name}</p>
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
