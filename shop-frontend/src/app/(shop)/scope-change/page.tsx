'use client'

import { useState } from 'react'
import { AlertTriangle, Plus, X, DollarSign, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function ScopeChangePage() {
  const [requestedChange, setRequestedChange] = useState('')
  const [analysis, setAnalysis] = useState<any>(null)

  const analyzeChange = () => {
    setAnalysis({
      isOutOfScope: true,
      estimatedHours: 8,
      cost: 3999,
      impact: 'Adds 2 days to timeline',
      reason: 'Not included in original requirements document'
    })
  }

  const approveChange = () => {
    toast.success('Scope change approved! New timeline and cost updated.')
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <AlertTriangle className="h-10 w-10 text-orange-600" />
          Scope Change Detector
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Auto-detect and price scope changes fairly
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Request Change</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <textarea
              className="w-full p-3 border rounded-lg"
              rows={4}
              placeholder="Describe the change you want..."
              value={requestedChange}
              onChange={(e) => setRequestedChange(e.target.value)}
            />
            <Button className="w-full" onClick={analyzeChange}>
              <Plus className="h-4 w-4 mr-2" />
              Analyze Change
            </Button>
          </CardContent>
        </Card>

        {analysis && (
          <Card className={analysis.isOutOfScope ? 'bg-orange-50' : 'bg-green-50'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {analysis.isOutOfScope ? (
                  <><AlertTriangle className="h-5 w-5 text-orange-600" /> Out of Scope</>
                ) : (
                  <><CheckCircle className="h-5 w-5 text-green-600" /> In Scope</>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <p className="text-muted-foreground">{analysis.reason}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Additional Cost</p>
                  <p className="text-2xl font-bold text-green-600">{analysis.cost}</p>
                </div>
                <div className="bg-white p-3 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Timeline Impact</p>
                  <p className="text-xl font-bold">{analysis.impact}</p>
                </div>
              </div>

              {analysis.isOutOfScope && (
                <Button className="w-full" onClick={approveChange}>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Approve Change (+{analysis.cost})
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
