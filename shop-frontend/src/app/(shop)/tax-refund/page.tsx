'use client'

import { useState, useEffect } from 'react'
import { Receipt, FileText, Download, IndianRupee } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function TaxRefundPage() {
  const [deductions, setDeductions] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeductions()
  }, [])

  const fetchDeductions = async () => {
    try {
      const res = await fetch('/api/money-savers/tax-refund')
      if (res.ok) {
        const data = await res.json()
        setDeductions(data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = () => {
    toast.success('Tax report downloading...')
  }

  if (loading) {
    return (
      <div className="container max-w-4xl py-8 text-center">
        <div className="animate-pulse h-8 bg-muted rounded w-1/3 mx-auto" />
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Receipt className="h-8 w-8 text-green-600" />
          Tax Refund Finder
        </h1>
        <p className="text-muted-foreground">
          Auto-identify tax-deductible purchases and generate reports
        </p>
      </div>

      {deductions?.totalDeductions > 0 ? (
        <div className="space-y-6">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6 text-center">
              <IndianRupee className="h-12 w-12 mx-auto mb-2 text-green-600" />
              <p className="text-4xl font-bold text-green-700">
                {deductions.totalDeductions}
              </p>
              <p className="text-green-600">in tax-deductible purchases</p>
              <p className="text-lg font-medium text-green-800 mt-2">
                Estimated Refund: {deductions.estimatedRefund}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(deductions.categories || {}).map(([category, data]: [string, any]) => (
              data.amount > 0 && (
                <Card key={category}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium capitalize">{category.replace('_', ' ')}</p>
                        <p className="text-sm text-muted-foreground">
                          {data.items?.length || 0} items
                        </p>
                      </div>
                      <Badge variant="secondary">{data.amount}</Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            ))}
          </div>

          <Button className="w-full" size="lg" onClick={downloadReport}>
            <Download className="h-4 w-4 mr-2" />
            Download Tax Report
          </Button>
        </div>
      ) : (
        <Card className="p-8 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            No tax-deductible purchases found this year
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Medical, education, and home office expenses are tracked automatically
          </p>
        </Card>
      )}
    </div>
  )
}
