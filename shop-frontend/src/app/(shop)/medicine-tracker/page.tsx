'use client'

import { useState, useEffect } from 'react'
import { Pill, Camera, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function MedicineTrackerPage() {
  const [medicines, setMedicines] = useState<any[]>([])
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    fetchMedicines()
  }, [])

  const fetchMedicines = async () => {
    try {
      const res = await fetch('/api/lifestyle/medicine-expiry')
      if (res.ok) {
        const data = await res.json()
        setMedicines(data.medicines || [])
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const scanMedicine = async () => {
    setScanning(true)
    
    setTimeout(async () => {
      try {
        const res = await fetch('/api/lifestyle/medicine-expiry', {
          method: 'POST',
          body: new FormData()
        })
        
        if (res.ok) {
          const data = await res.json()
          toast.success(`${data.medicine?.name} added to tracker!`)
          fetchMedicines()
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
          <Pill className="h-8 w-8 text-red-600" />
          Medicine Expiry Tracker
        </h1>
        <p className="text-muted-foreground">
          Scan and track expiry dates. Never use expired medicine.
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6 text-center">
          <div 
            className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 cursor-pointer transition-all ${
              scanning ? 'bg-red-100 animate-pulse' : 'bg-muted hover:bg-muted/80'
            }`}
            onClick={scanMedicine}
          >
            <Camera className={`h-10 w-10 ${scanning ? 'text-red-600' : 'text-muted-foreground'}`} />
          </div>
          <p className="font-medium">
            {scanning ? 'Scanning...' : 'Scan Medicine Strip'}
          </p>
          <p className="text-sm text-muted-foreground">
            Point camera at expiry date
          </p>
        </CardContent>
      </Card>

      {medicines.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Medicines ({medicines.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {medicines.map((med) => (
                <div 
                  key={med.id} 
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    med.daysUntilExpiry <= 30 ? 'bg-red-50 border border-red-200' : 'bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {med.daysUntilExpiry <= 30 ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    <div>
                      <p className="font-medium">{med.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Expires: {new Date(med.expiryDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={med.daysUntilExpiry <= 30 ? 'destructive' : 'default'}>
                    {med.daysUntilExpiry <= 0 ? 'EXPIRED' : 
                     med.daysUntilExpiry <= 30 ? `${med.daysUntilExpiry} days` : 'OK'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
