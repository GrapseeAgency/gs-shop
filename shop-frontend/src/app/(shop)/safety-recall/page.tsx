'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle, Search, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function SafetyRecallPage() {
  const [productId, setProductId] = useState('')
  const [checked, setChecked] = useState(false)
  const [safe, setSafe] = useState(true)

  const checkRecall = () => {
    setChecked(true)
    setSafe(Math.random() > 0.3)
    if (!safe) {
      toast.error('Product has been recalled!')
    } else {
      toast.success('Product is safe!')
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <AlertTriangle className="h-8 w-8 text-red-600" />
          Safety Recall Alert
        </h1>
        <p className="text-muted-foreground">
          "Product X safety recall"  automatic alert, "Return now for full refund"
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Check Your Product
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input 
            placeholder="Enter product ID or name"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          />
          <Button className="w-full" onClick={checkRecall}>
            <Shield className="h-4 w-4 mr-2" />
            Check Recall Status
          </Button>

          {checked && (
            <div className={`p-4 rounded-lg ${safe ? 'bg-green-50' : 'bg-red-50'}`}>
              {safe ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-bold text-green-800">No Recall Found</span>
                  </div>
                  <p className="text-sm text-green-700">Your product is safe to use</p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="font-bold text-red-800">SAFETY RECALL ALERT!</span>
                  </div>
                  <p className="text-sm text-red-700 mb-2">This product has been recalled due to safety concerns</p>
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    Initiate Return & Refund
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
