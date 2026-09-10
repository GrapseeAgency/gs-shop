'use client'

import { useState } from 'react'
import { Palette, ArrowRight, CheckCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function StyleQuizPage() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])

  const questions = [
    { q: 'What colors do you prefer?', options: ['Bright & Bold', 'Neutral & Earthy', 'Pastels', 'Monochrome'] },
    { q: 'Your fashion vibe?', options: ['Classic', 'Trendy', 'Minimalist', 'Bohemian'] },
    { q: 'Where do you shop most?', options: ['Online', 'Malls', 'Thrift', 'Boutiques'] },
  ]

  const answer = (option: string) => {
    const newAnswers = [...answers, option]
    setAnswers(newAnswers)
    if (step < questions.length - 1) {
      setStep(step + 1)
    } else {
      // Done
    }
  }

  const style = step === questions.length ? `${answers[1]} ${answers[0]}` : ''

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Palette className="h-8 w-8 text-pink-600" />
          Style Quiz
        </h1>
        <p className="text-muted-foreground">
          Discover your personal style in 3 simple questions
        </p>
      </div>

      {step < questions.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Question {step + 1} of {questions.length}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-medium">{questions[step].q}</p>
            <div className="grid grid-cols-2 gap-3">
              {questions[step].options.map((opt) => (
                <Button 
                  key={opt} 
                  variant="outline" 
                  className="h-auto py-4"
                  onClick={() => answer(opt)}
                >
                  {opt}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-pink-50 border-pink-200">
          <CardContent className="p-8 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-pink-600" />
            <h3 className="text-2xl font-bold text-pink-800">Your Style: {style}</h3>
            <p className="text-pink-700 mt-2">We've curated products just for you!</p>
            <Button className="mt-4">
              <CheckCircle className="h-4 w-4 mr-2" />
              See Recommendations
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
