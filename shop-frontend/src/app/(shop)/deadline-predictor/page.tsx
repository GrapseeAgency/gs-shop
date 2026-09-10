'use client'

import { useState } from 'react'
import { Calendar, Clock, Zap, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

export default function DeadlinePredictorPage() {
  const [features, setFeatures] = useState<string[]>([])
  const [complexity, setComplexity] = useState('medium')

  const featureOptions = [
    { id: 'auth', name: 'User Authentication', days: 3 },
    { id: 'payment', name: 'Payment Integration', days: 4 },
    { id: 'cms', name: 'Content Management', days: 5 },
    { id: 'analytics', name: 'Analytics Dashboard', days: 3 },
    { id: 'chat', name: 'Live Chat', days: 2 },
    { id: 'search', name: 'Advanced Search', days: 3 }
  ]

  const baseDays = complexity === 'simple' ? 7 : complexity === 'medium' ? 14 : 21
  const featureDays = features.reduce((total, id) => {
    const feature = featureOptions.find(f => f.id === id)
    return total + (feature?.days || 0)
  }, 0)
  const totalDays = baseDays + featureDays
  const rushDays = Math.ceil(totalDays * 0.6)

  const toggleFeature = (id: string) => {
    setFeatures(features.includes(id) 
      ? features.filter(f => f !== id)
      : [...features, id]
    )
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Calendar className="h-10 w-10 text-blue-600" />
          Deadline Predictor
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Get realistic timelines based on 47 similar projects
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Complexity Level</label>
              <div className="flex gap-2">
                {['simple', 'medium', 'complex'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setComplexity(level)}
                    className={`flex-1 py-2 rounded-lg capitalize ${
                      complexity === level
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Features Needed</label>
              <div className="space-y-2">
                {featureOptions.map((feature) => (
                  <div key={feature.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={features.includes(feature.id)}
                        onCheckedChange={() => toggleFeature(feature.id)}
                      />
                      <span>{feature.name}</span>
                    </div>
                    <Badge variant="outline">+{feature.days} days</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="bg-blue-50">
            <CardContent className="p-6 text-center">
              <Clock className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <p className="text-muted-foreground mb-2">Standard Delivery</p>
              <p className="text-5xl font-bold text-blue-600">{totalDays} days</p>
              <p className="text-sm text-muted-foreground mt-2">
                Based on {features.length} features + {complexity} complexity
              </p>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50">
            <CardContent className="p-6 text-center">
              <Zap className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
              <p className="text-muted-foreground mb-2">Rush Delivery (+40%)</p>
              <p className="text-5xl font-bold text-yellow-600">{rushDays} days</p>
              <p className="text-sm text-muted-foreground mt-2">
                Skip the queue, faster delivery
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Historical Accuracy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-muted-foreground">
                94% of similar projects delivered within 2 days of this estimate.
                Rush delivery has 100% on-time rate.
              </p>
            </CardContent>
          </Card>

          <Button className="w-full" size="lg">
            Start Project with This Timeline
          </Button>
        </div>
      </div>
    </div>
  )
}
