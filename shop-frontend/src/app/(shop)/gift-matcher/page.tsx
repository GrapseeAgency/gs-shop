'use client'

import { useState } from 'react'
import { Gift, Heart, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function GiftMatcherPage() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])

  const questions = [
    { q: 'Who are you buying for?', options: ['Partner', 'Parent', 'Friend', 'Child', 'Colleague'] },
    { q: 'What\'s the occasion?', options: ['Birthday', 'Anniversary', 'Wedding', 'Festival', 'Just Because'] },
    { q: 'Budget range?', options: ['Under 500', '500-2000', '2000-5000', '5000+'] },
  ]

  const answer = (option: string) => {
    const newAnswers = [...answers, option]
    setAnswers(newAnswers)
    if (step < questions.length - 1) {
      setStep(step + 1)
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Gift className="h-8 w-8 text-red-600" />
          Gift Matcher
        </h1>
        <p className="text-muted-foreground">
          Find the perfect gift in 3 simple questions
        </p>
      </div>

      {step < questions.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Question {step + 1} of {questions.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-medium text-lg">{questions[step].q}</p>
            <div className="space-y-2">
              {questions[step].options.map((opt) => (
                <Button 
                  key={opt} 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => answer(opt)}
                >
                  {opt}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-8 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-red-600" />
            <h3 className="text-2xl font-bold text-red-800">Gift Ideas Ready!</h3>
            <p className="text-red-700 mt-2">
              For your {answers[0]}'s {answers[1]} (Budget: {answers[2]})
            </p>
            <div className="mt-4 space-y-2">
              {['Personalized Photo Frame', 'Luxury Perfume', 'Designer Watch'].map((gift) => (
                <div key={gift} className="bg-white p-3 rounded-lg flex justify-between items-center">
                  <span>{gift}</span>
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
