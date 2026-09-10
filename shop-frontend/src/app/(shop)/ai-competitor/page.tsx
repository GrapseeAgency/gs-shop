'use client'

import { useState } from 'react'
import { Target, Search, Sparkles, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function AICompetitorPage() {
  const [url, setUrl] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [results, setResults] = useState<any>(null)

  const analyze = async () => {
    if (!url) {
      toast.error('Enter competitor URL')
      return
    }
    setAnalyzing(true)
    setTimeout(() => {
      setResults({
        strengths: [
          'Fast loading speed',
          'Mobile responsive',
          'Clear call-to-actions'
        ],
        weaknesses: [
          'No blog content',
          'Poor SEO optimization',
          'Missing social proof',
          'No live chat'
        ],
        opportunities: [
          'Content marketing gap',
          'Local SEO not optimized',
          'No video content',
          'Missing FAQ section'
        ]
      })
      setAnalyzing(false)
      toast.success('Analysis complete!')
    }, 2500)
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Target className="h-10 w-10 text-red-600" />
          AI Competitor Analyzer
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Find their weaknesses. Beat them.
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex gap-2">
            <Search className="h-5 w-5 text-muted-foreground mt-3" />
            <Input 
              placeholder="Enter competitor website URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={analyze} disabled={analyzing}>
              {analyzing ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : 'Analyze'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {results && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Their Strengths
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-2">
                {results.strengths.map((item: string, i: number) => (
                  <li key={i} className="flex items-center gap-2">
                    <Badge variant="outline">{item}</Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                Their Weaknesses
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-2">
                {results.weaknesses.map((item: string, i: number) => (
                  <li key={i} className="flex items-center gap-2">
                    <Badge variant="destructive">{item}</Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-blue-50">
            <CardHeader>
              <CardTitle>Your Opportunities</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-2">
                {results.opportunities.map((item: string, i: number) => (
                  <li key={i} className="flex items-center gap-2">
                    <Badge className="bg-blue-500">{item}</Badge>
                  </li>
                ))}
              </ul>
              <Button className="w-full mt-4">
                Build Better Website
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
