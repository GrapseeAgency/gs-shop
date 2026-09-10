'use client'

import { useState } from 'react'
import { Target, CheckCircle, HelpCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function UseCaseMatcherPage() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])

  const questions = [
    { q: 'What do you need?', options: ['Work', 'Gaming', 'Study', 'Travel'] },
    { q: 'Budget range?', options: ['Under 10k', '10-30k', '30-50k', '50k+'] },
    { q: 'Brand preference?', options: ['Any', 'Premium', 'Value', 'Local'] },
  ]

  const recommendations: Record<string, string[]> = {
    'Work|10-30k|Any': ['Laptop A - Office ready', 'Laptop B - Budget friendly'],
    'Gaming|30-50k|Premium': ['Gaming Laptop X', 'Gaming PC Build Y'],
  }

  const answer = (option: string) => {
    const newAnswers = [...answers, option]
    setAnswers(newAnswers)
    if (step < questions.length - 1) {
      setStep(step + 1)
    } else {
      toast.success('Recommendations ready!')
    }
  }

  const key = answers.join('|')
  const results = recommendations[key] || ['Laptop General Purpose', 'Desktop Starter']

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Target className="h-8 w-8 text-purple-600" />
          Use Case Matcher
        </h1>
        <p className="text-muted-foreground">
          "For video calls"  webcam + ring light combo suggestions
        </p>
      </div>

      {step < questions.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              {questions[step].q}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {questions[step].options.map((opt) => (
                <Button key={opt} variant="outline" onClick={() => answer(opt)}>
                  {opt}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Recommended for You
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((item, i) => (
                <div key={i} className="p-3 bg-muted rounded-lg flex justify-between items-center">
                  <span className="font-medium">{item}</span>
                  <Button size="sm">View</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
