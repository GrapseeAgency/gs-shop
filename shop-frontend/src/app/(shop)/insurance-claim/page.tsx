'use client'

import { useState } from 'react'
import { FileText, Shield, CheckCircle, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function InsuranceClaimPage() {
  const [step, setStep] = useState(1)
  const [claimId, setClaimId] = useState('')

  const fileClaim = () => {
    toast.success('Claim filed!')
    setStep(2)
    setClaimId('CLM' + Math.random().toString(36).substr(2, 9).toUpperCase())
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Shield className="h-8 w-8 text-green-600" />
          Insurance Claim
        </h1>
        <p className="text-muted-foreground">
          Broken screen  warranty: "File claim"  upload photo  replacement sent
        </p>
      </div>

      {step === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              File a Claim
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Order ID</label>
              <Input placeholder="Enter your order number" />
            </div>
            <div>
              <label className="text-sm font-medium">Issue Description</label>
              <Input placeholder="Describe the problem" />
            </div>
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Photos
              </label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center mt-1">
                <p className="text-muted-foreground">Drag & drop photos here</p>
              </div>
            </div>
            <Button className="w-full" size="lg" onClick={fileClaim}>
              <Shield className="h-4 w-4 mr-2" />
              File Insurance Claim
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
            <h3 className="text-2xl font-bold text-green-800">Claim Filed Successfully!</h3>
            <p className="text-green-700 mt-2">Claim ID: <strong>{claimId}</strong></p>
            <p className="text-muted-foreground mt-4">
              Replacement will be sent within 3-5 business days
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
