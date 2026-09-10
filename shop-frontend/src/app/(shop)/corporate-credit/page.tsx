'use client'

import { useState } from 'react'
import { Building2, CreditCard, Clock, FileText, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function CorporateCreditPage() {
  const [formData, setFormData] = useState({
    company: '',
    email: '',
    revenue: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const apply = () => {
    if (!formData.company || !formData.email) {
      toast.error('Please fill in all fields')
      return
    }
    setSubmitted(true)
    toast.success('Application submitted!')
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Building2 className="h-10 w-10 text-blue-600" />
          Corporate Credit Account
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Buy now, pay at month end. Net-30 terms.
        </p>
      </div>

      {!submitted ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Apply for Credit</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Company Name</label>
                <Input 
                  placeholder="Your company name"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Business Email</label>
                <Input 
                  type="email"
                  placeholder="accounts@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Annual Revenue ()</label>
                <Input 
                  placeholder="e.g., 1000000"
                  value={formData.revenue}
                  onChange={(e) => setFormData({...formData, revenue: e.target.value})}
                />
              </div>
              <Button className="w-full" size="lg" onClick={apply}>
                <FileText className="h-4 w-4 mr-2" />
                Submit Application
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="bg-blue-50">
              <CardContent className="p-6">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Net-30 Payment Terms
                </h3>
                <p className="text-sm text-muted-foreground">
                  Purchase services today, pay within 30 days. No interest, no fees.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-green-50">
              <CardContent className="p-6">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Higher Credit Limits
                </h3>
                <p className="text-sm text-muted-foreground">
                  Approved businesses get credit limits up to 5,00,000 based on revenue.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-purple-50">
              <CardContent className="p-6">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Streamlined Billing
                </h3>
                <p className="text-sm text-muted-foreground">
                  Consolidated monthly invoices. Easier accounting and cash flow management.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="bg-green-50">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
            <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
            <p className="text-muted-foreground mb-4">
              We'll review your application and respond within 2 business days.
            </p>
            <Badge>Reference: CORP-2024-001</Badge>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
