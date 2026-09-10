'use client'

import { useState } from 'react'
import { FileText, Sparkles, Download, Wand2, Clock, DollarSign, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function AIProposalPage() {
  const [generating, setGenerating] = useState(false)
  const [proposal, setProposal] = useState<any>(null)

  const generateProposal = async () => {
    setGenerating(true)
    setTimeout(() => {
      setProposal({
        client: 'Client Business Name',
        date: new Date().toLocaleDateString(),
        project: 'E-commerce Website Development',
        summary: 'A modern, responsive e-commerce platform with payment integration, inventory management, and customer dashboard.',
        deliverables: [
          'Custom website design',
          'Mobile-responsive layout',
          'Payment gateway integration',
          'Admin dashboard',
          'SEO optimization',
          '3 months support'
        ],
        timeline: '21 days',
        price: 24999,
        breakdown: [
          { item: 'Design & Prototyping', cost: 5000 },
          { item: 'Frontend Development', cost: 8000 },
          { item: 'Backend & Database', cost: 7000 },
          { item: 'Testing & Deployment', cost: 3000 },
          { item: 'Documentation', cost: 1999 }
        ]
      })
      setGenerating(false)
      toast.success('Proposal generated!')
    }, 2000)
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <FileText className="h-10 w-10 text-blue-600" />
          AI Proposal Writer
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Generate professional proposals in seconds
        </p>
      </div>

      {!proposal ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Wand2 className="h-16 w-16 mx-auto mb-4 text-blue-600" />
            <p className="text-muted-foreground mb-4">
              AI will generate a complete proposal based on your service configuration
            </p>
            <Button size="lg" onClick={generateProposal} disabled={generating}>
              {generating ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Proposal
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white shadow-lg">
          <CardContent className="p-8">
            <div className="border-b pb-4 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">Project Proposal</h2>
                  <p className="text-muted-foreground">For: {proposal.client}</p>
                </div>
                <p className="text-muted-foreground">{proposal.date}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg mb-2">{proposal.project}</h3>
                <p className="text-muted-foreground">{proposal.summary}</p>
              </div>

              <div>
                <h3 className="font-bold mb-2">Deliverables</h3>
                <ul className="space-y-1">
                  {proposal.deliverables.map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-muted p-4 rounded-lg">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-muted-foreground">Timeline</span>
                  </div>
                  <p className="text-xl font-bold">{proposal.timeline}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-muted-foreground">Total Investment</span>
                  </div>
                  <p className="text-xl font-bold text-green-600">{proposal.price.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-2">Cost Breakdown</h3>
                <table className="w-full">
                  <tbody>
                    {proposal.breakdown.map((item: any, i: number) => (
                      <tr key={i} className="border-b">
                        <td className="py-2">{item.item}</td>
                        <td className="py-2 text-right">{item.cost.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-4">
                <Button className="flex-1" size="lg">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" className="flex-1" size="lg">
                  Send to Client
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
