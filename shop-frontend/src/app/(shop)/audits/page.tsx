'use client'

import { useState } from 'react'
import { Search, FileText, CheckCircle, AlertTriangle, Shield, Zap, Eye, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function AuditsPage() {
  const [url, setUrl] = useState('')
  const [scanning, setScanning] = useState(false)
  const [results, setResults] = useState<any>(null)

  const audits = [
    { id: 1, name: 'SEO Audit', price: 999, description: 'Comprehensive SEO analysis with PDF report', icon: Search },
    { id: 2, name: 'Performance Audit', price: 1499, description: 'Lighthouse scores + custom performance checks', icon: Zap },
    { id: 3, name: 'Accessibility Audit', price: 999, description: 'WCAG compliance check with recommendations', icon: Eye },
    { id: 4, name: 'Security Scan', price: 2499, description: 'Vulnerability assessment + security report', icon: Shield },
    { id: 5, name: 'Brand Consistency', price: 799, description: 'Check brand consistency across your site', icon: FileText },
  ]

  const runAudit = async () => {
    if (!url) {
      toast.error('Please enter a URL')
      return
    }
    setScanning(true)
    setTimeout(() => {
      setResults({
        score: Math.floor(Math.random() * 40) + 60,
        issues: Math.floor(Math.random() * 10) + 1,
        passed: Math.floor(Math.random() * 20) + 10,
      })
      setScanning(false)
      toast.success('Audit complete!')
    }, 2000)
  }

  const buyAudit = (audit: any) => {
    toast.success(`${audit.name} added to cart!`)
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Search className="h-10 w-10 text-blue-600" />
          Website Audits
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Automated scans with professional PDF reports
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex gap-2">
            <Input 
              placeholder="Enter website URL (e.g., https://example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button onClick={runAudit} disabled={scanning}>
              {scanning ? 'Scanning...' : 'Run Free Scan'}
            </Button>
          </div>

          {results && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{results.score}</p>
                  <p className="text-sm text-muted-foreground">Score</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-600">{results.issues}</p>
                  <p className="text-sm text-muted-foreground">Issues</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{results.passed}</p>
                  <p className="text-sm text-muted-foreground">Passed</p>
                </div>
                <Button className="ml-auto">
                  <FileText className="h-4 w-4 mr-1" />
                  Get Full Report
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {audits.map((audit) => {
          const Icon = audit.icon
          return (
            <Card key={audit.id} className="group hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">{audit.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{audit.description}</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-green-600">{audit.price}</p>
                  <Button onClick={() => buyAudit(audit)}>
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Buy
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
