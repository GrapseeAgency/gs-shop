'use client'

import { useState } from 'react'
import { Search, Globe, Gauge, Shield, Smartphone, Palette, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function FreeAuditPage() {
  const [url, setUrl] = useState('')
  const [scanning, setScanning] = useState(false)
  const [results, setResults] = useState<any>(null)

  const runAudit = async () => {
    if (!url) {
      toast.error('Please enter a URL')
      return
    }
    setScanning(true)
    setTimeout(() => {
      setResults({
        overall: 67,
        categories: [
          { name: 'Speed', score: 72, icon: Gauge },
          { name: 'SEO', score: 85, icon: Search },
          { name: 'Mobile', score: 90, icon: Smartphone },
          { name: 'Security', score: 45, icon: Shield },
          { name: 'Design', score: 60, icon: Palette }
        ],
        issues: [
          'Missing meta descriptions',
          'Images not optimized',
          'No SSL certificate',
          'Slow server response'
        ]
      })
      setScanning(false)
      toast.success('Audit complete!')
    }, 3000)
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Search className="h-10 w-10 text-blue-600" />
          Free Website Audit
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Get a 5-point analysis in seconds
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex gap-2">
            <Globe className="h-5 w-5 text-muted-foreground mt-3" />
            <Input 
              placeholder="Enter your website URL (e.g., https://example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={runAudit} disabled={scanning}>
              {scanning ? 'Scanning...' : (
                <>
                  Audit Now
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {results && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-8 text-center">
              <p className="text-lg text-muted-foreground mb-2">Overall Score</p>
              <p className="text-6xl font-bold text-blue-600">{results.overall}/100</p>
              <Badge className="mt-4" variant={results.overall >= 80 ? 'default' : results.overall >= 60 ? 'secondary' : 'destructive'}>
                {results.overall >= 80 ? 'Excellent' : results.overall >= 60 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.categories.map((category: any, index: number) => {
              const Icon = category.icon
              return (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <Progress value={category.score} className="mb-2" />
                    <p className="text-2xl font-bold">{category.score}/100</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Issues Found</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-2">
                {results.issues.map((issue: string, index: number) => (
                  <li key={index} className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                    <Badge variant="destructive">Fix</Badge>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full mt-4" size="lg">
                Get These Fixed - Starting 4,999
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
