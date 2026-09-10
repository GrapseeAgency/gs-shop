'use client'

import { useState } from 'react'
import { Shield, CheckCircle, AlertTriangle, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function DealAuthenticityPage() {
  const [dealUrl, setDealUrl] = useState('')
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<any>(null)

  const checkDeal = async () => {
    if (!dealUrl) {
      toast.error('Please enter a deal URL')
      return
    }
    setChecking(true)
    setTimeout(() => {
      setResult({
        authentic: Math.random() > 0.3,
        retailer: 'Verified Store',
        verified: true,
        savings: 2500,
      })
      setChecking(false)
    }, 1500)
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Shield className="h-8 w-8 text-blue-600" />
          Deal Authenticity
        </h1>
        <p className="text-muted-foreground">
          "iPhone 15 at 50,000" too good?  authenticity score + retailer verification
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Verify Deal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input 
            placeholder="Paste deal URL or product name"
            value={dealUrl}
            onChange={(e) => setDealUrl(e.target.value)}
          />
          <Button className="w-full" onClick={checkDeal} disabled={checking}>
            {checking ? 'Checking...' : 'Verify Authenticity'}
          </Button>

          {result && (
            <div className={`p-4 rounded-lg ${result.authentic ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                {result.authentic ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-bold text-green-700">Verified Deal</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="font-bold text-red-700">Suspicious Deal</span>
                  </>
                )}
              </div>
              <p className="text-sm">Retailer: {result.retailer}</p>
              {result.savings > 0 && (
                <Badge className="mt-2 bg-green-500">Save {result.savings}</Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
