'use client'

import { useState } from 'react'
import { FileText, Clock, Shield, Zap, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function SLAGeneratorPage() {
  const [service] = useState('website')
  const [sla, setSla] = useState<any>(null)

  const generateSLA = () => {
    setSla({
      service: 'Website Development',
      responseTime: '24 hours',
      revisionPolicy: '3 rounds included',
      deliveryTimeline: '14-21 days',
      supportPeriod: '30 days post-delivery',
      uptimeGuarantee: '99.5%',
      penalty: '10% discount per week delayed',
      clauses: [
        'Client must provide all content within 3 days of request',
        'Revisions must be requested within 7 days of milestone delivery',
        'Scope changes require written approval and may adjust timeline',
        'Payment milestones tied to deliverable approval',
        'Intellectual property transfers upon final payment'
      ]
    })
    toast.success('SLA generated!')
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <FileText className="h-10 w-10 text-blue-600" />
          SLA Generator
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Auto-generated service level agreements
        </p>
      </div>

      {!sla ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-blue-600" />
            <p className="text-muted-foreground mb-6">
              Generate a professional SLA based on your service type
            </p>
            <div className="max-w-md mx-auto mb-6">
              <label className="text-sm font-medium mb-2 block">Service Type</label>
              <select className="w-full p-2 border rounded-lg mb-4">
                <option value="website">Website Development</option>
                <option value="webapp">Web Application</option>
                <option value="mobile">Mobile App</option>
                <option value="ecommerce">E-commerce</option>
              </select>
            </div>
            <Button size="lg" onClick={generateSLA}>
              <FileText className="h-4 w-4 mr-2" />
              Generate SLA
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white shadow-lg">
          <CardContent className="p-8">
            <div className="border-b pb-4 mb-6">
              <h2 className="text-2xl font-bold">Service Level Agreement</h2>
              <p className="text-muted-foreground">{sla.service}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-muted-foreground">Response Time</span>
                </div>
                <p className="font-bold">{sla.responseTime}</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-muted-foreground">Uptime</span>
                </div>
                <p className="font-bold">{sla.uptimeGuarantee}</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-muted-foreground">Delivery</span>
                </div>
                <p className="font-bold">{sla.deliveryTimeline}</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-muted-foreground">Revisions</span>
                </div>
                <p className="font-bold">{sla.revisionPolicy}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold mb-3">Terms & Conditions</h3>
              <ul className="space-y-2">
                {sla.clauses.map((clause: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Badge variant="outline" className="flex-shrink-0 mt-0.5">{i + 1}</Badge>
                    <span>{clause}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-4">
              <Button className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" className="flex-1">
                Send to Client
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
