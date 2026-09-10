'use client'

import { useState } from 'react'
import { Wand2, Sparkles, FileText, Clock, DollarSign, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function AIScoperPage() {
  const [description, setDescription] = useState('')
  const [generating, setGenerating] = useState(false)
  const [scope, setScope] = useState<any>(null)

  const generateScope = async () => {
    if (!description) {
      toast.error('Please describe your project')
      return
    }
    setGenerating(true)
    setTimeout(() => {
      setScope({
        title: 'Project Scope Document',
        features: [
          'User authentication system',
          'Dashboard with analytics',
          'Payment integration',
          'Mobile-responsive design',
          'SEO optimization'
        ],
        timeline: '14-18 days',
        price: 14999,
        technologies: ['Next.js', 'React', 'Node.js', 'PostgreSQL', 'Stripe']
      })
      setGenerating(false)
      toast.success('Scope generated!')
    }, 2000)
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Wand2 className="h-10 w-10 text-purple-600" />
          AI Project Scoper
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Describe your idea, get a complete scope in 10 seconds
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Describe Your Project</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <Textarea
              placeholder="I need a food delivery app like UberEats but for home cooks..."
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Button 
              className="w-full" 
              size="lg"
              onClick={generateScope}
              disabled={generating}
            >
              {generating ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Scope
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {scope && (
          <Card className="bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Generated Scope
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="font-bold text-lg mb-2">Features Included</h3>
                <ul className="space-y-2">
                  {scope.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-muted-foreground">Timeline</span>
                  </div>
                  <p className="text-xl font-bold">{scope.timeline}</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-muted-foreground">Est. Price</span>
                  </div>
                  <p className="text-xl font-bold text-green-600">{scope.price}</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-2">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {scope.technologies.map((tech: string, i: number) => (
                    <Badge key={i} variant="secondary">{tech}</Badge>
                  ))}
                </div>
              </div>

              <Button className="w-full" size="lg">
                Start This Project
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
