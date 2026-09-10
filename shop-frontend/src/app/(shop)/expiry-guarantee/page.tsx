'use client'

import { Shield, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function ExpiryGuaranteePage() {
  const claimReplacement = () => {
    toast.success('Claim submitted! Replacement on the way.')
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Shield className="h-8 w-8 text-green-600" />
          Expiry Guarantee
        </h1>
        <p className="text-muted-foreground">
          Free replacement if product has less than 6 months expiry
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Your Protection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Products with &lt;6 months expiry: Free replacement</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <span>Products with &lt;3 months expiry: Full refund + replacement</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Purchases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {['Vitamin D Supplement', 'Protein Powder', 'Face Cream'].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{item}</p>
                  <p className="text-sm text-muted-foreground">Expires: {12 - i * 2} months</p>
                </div>
                <Badge className="bg-green-500">Protected</Badge>
              </div>
            ))}
          </div>
          <Button className="w-full mt-4" onClick={claimReplacement}>
            <Shield className="h-4 w-4 mr-2" />
            File a Claim
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
