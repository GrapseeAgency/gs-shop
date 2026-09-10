'use client'

import { useState } from 'react'
import { Scale, MessageSquare, Upload, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export default function DisputeResolutionPage() {
  const [step, setStep] = useState(1)
  const [description, setDescription] = useState('')

  const submitDispute = () => {
    setStep(2)
    toast.success('Dispute filed. Team will respond within 24 hours.')
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Scale className="h-10 w-10 text-blue-600" />
          Dispute Resolution
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Fair resolution within 48 hours
        </p>
      </div>

      {step === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle>File a Dispute</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Project</label>
              <select className="w-full p-2 border rounded-lg">
                <option>E-commerce Website</option>
                <option>Mobile App</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Issue Type</label>
              <select className="w-full p-2 border rounded-lg">
                <option>Quality not as expected</option>
                <option>Timeline delay</option>
                <option>Missing deliverables</option>
                <option>Communication issues</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Describe the Issue</label>
              <Textarea
                rows={4}
                placeholder="Explain what went wrong..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Attach Evidence</label>
              <Button variant="outline" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload Screenshots/Documents
              </Button>
            </div>
            <Button className="w-full" size="lg" onClick={submitDispute}>
              Submit Dispute
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-blue-50">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-blue-600" />
            <h2 className="text-2xl font-bold mb-2">Dispute Filed Successfully</h2>
            <p className="text-muted-foreground mb-4">
              Case #DSP-2024-001 has been created. Our team will review and respond within 24 hours.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                View Messages
              </Button>
              <Button>Go to Dashboard</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">24h</p>
            <p className="text-sm text-muted-foreground">Initial Response</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600">48h</p>
            <p className="text-sm text-muted-foreground">Resolution Target</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-purple-600">94%</p>
            <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
