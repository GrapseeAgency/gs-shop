'use client'

import { useState } from 'react'
import { Pill, Camera, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function PrescriptionScanPage() {
  const [scanning, setScanning] = useState(false)
  const [medicines, setMedicines] = useState<any[]>([])
  const [totals, setTotals] = useState<any>(null)

  const scanPrescription = async () => {
    setScanning(true)
    
    setTimeout(async () => {
      try {
        const res = await fetch('/api/time-savers/prescription-to-cart', {
          method: 'POST',
          body: new FormData()
        })
        
        if (res.ok) {
          const data = await res.json()
          setMedicines(data.medicines || [])
          setTotals(data.totals)
          toast.success(`Found ${data.medicines?.length} medicines!`)
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
          <Pill className="h-8 w-8 text-red-600" />
          Prescription to Cart
        </h1>
        <p className="text-muted-foreground">
          Upload prescription photo  AI reads medicines  Add to cart with generic alternatives
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <p className="text-sm text-yellow-800">
            <strong>Important:</strong> Always consult your doctor before switching to generic medicines.
          </p>
        </div>
      </div>

      {medicines.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div 
              className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-4 cursor-pointer transition-all ${
                scanning ? 'bg-red-100 animate-pulse' : 'bg-muted hover:bg-muted/80'
              }`}
              onClick={scanPrescription}
            >
              <Camera className={`h-12 w-12 ${scanning ? 'text-red-600' : 'text-muted-foreground'}`} />
            </div>
            
            <p className="text-lg font-medium mb-2">
              {scanning ? 'Scanning prescription...' : 'Upload Prescription'}
            </p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Take a clear photo of your doctor's prescription. We'll read the medicine names and find the best options.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medicines Found ({medicines.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {medicines.map((med, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-lg">{med.prescribed?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {med.prescribed?.dosage}  {med.prescribed?.quantity}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {med.branded && (
                        <div className="p-3 bg-muted rounded-lg">
                          <Badge variant="secondary" className="mb-1">Branded</Badge>
                          <p className="font-medium">{med.branded.price}</p>
                        </div>
                      )}
                      {med.generic && (
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <Badge className="mb-1 bg-green-500">Generic  Save {med.generic.savings}</Badge>
                          <p className="font-medium text-green-700">{med.generic.price}</p>
                          <p className="text-xs text-green-600">Same active ingredients</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {totals && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Branded Total</p>
                      <p className="text-lg">{totals.branded}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-green-600 font-medium">Generic Total</p>
                      <p className="text-2xl font-bold text-green-700">{totals.generic}</p>
                    </div>
                  </div>
                  <p className="text-center text-green-600 font-medium mt-2">
                    You save {totals.savings} ({totals.savingsPercent}%)
                  </p>
                </div>
              )}

              <Button className="w-full mt-4" size="lg">
                <CheckCircle className="h-4 w-4 mr-2" />
                Add Generic Alternatives to Cart
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
