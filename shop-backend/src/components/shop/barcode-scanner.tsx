'use client'

import { useState, useRef } from 'react'
import { Camera, Scan, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'

export function BarcodeScanner() {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const startScan = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setScanning(true)

      // Simulate scan after 3 seconds
      setTimeout(() => {
        handleScan('123456789012')
      }, 3000)
    } catch (error) {
      toast.error('Camera access denied or not available')
    }
  }

  const stopScan = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
    }
    setScanning(false)
  }

  const handleScan = async (barcode: string) => {
    stopScan()
    
    try {
      const res = await fetch(`/api/products?barcode=${barcode}`)
      if (res.ok) {
        const data = await res.json()
        setResult(data)
        toast.success('Product found!')
      } else {
        toast.error('Product not found')
      }
    } catch (error) {
      toast.error('Scan failed')
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Scan className="h-4 w-4" />
          Barcode Scanner
        </h3>
        {scanning && (
          <Button variant="ghost" size="icon" onClick={stopScan}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {scanning ? (
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-32 border-2 border-emerald-500 rounded-lg">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-500 animate-pulse" />
            </div>
          </div>
          <p className="absolute bottom-2 left-0 right-0 text-center text-white text-xs">
            Position barcode in frame
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <Camera className="h-12 w-12 text-muted-foreground" />
          </div>
          <Button onClick={startScan} className="w-full gap-2">
            <Scan className="h-4 w-4" />
            Scan Barcode
          </Button>
        </div>
      )}

      {result && (
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="font-medium">{result.name}</p>
          <p className="text-sm text-muted-foreground">${result.price}</p>
          <Button size="sm" className="w-full mt-2">View Product</Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-4">
        Scan any product barcode to instantly check price comparison on Grapsee.
      </p>
    </Card>
  )
}
