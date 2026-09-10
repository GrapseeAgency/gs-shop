'use client'

import { useState } from 'react'
import { Baby, TrendingUp, Calendar, Ruler } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function ChildGrowthPage() {
  const [age, setAge] = useState('')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')

  const ageMonths = parseInt(age) || 0
  const recommendations = [
    { age: '0-6 months', items: ['Diapers', 'Baby wipes', 'Feeding bottles'] },
    { age: '6-12 months', items: ['Solid foods', 'Baby toys', 'Crawling mats'] },
    { age: '1-2 years', items: ['Walker', 'Building blocks', 'Story books'] },
  ]

  const currentRec = recommendations.find(r => r.age.includes(String(Math.floor(ageMonths / 12)))) || recommendations[0]

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Baby className="h-8 w-8 text-pink-600" />
          Child Growth Tracker
        </h1>
        <p className="text-muted-foreground">
          Age: 6 months  products: "Next size diapers + teething toys"
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Child Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Age (months)</label>
            <Input 
              type="number"
              placeholder="6"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Height (cm)
              </label>
              <Input type="number" placeholder="65" value={height} onChange={(e) => setHeight(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Weight (kg)</label>
              <Input type="number" placeholder="7" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {age && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recommended for {currentRec?.age}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {currentRec?.items.map((item) => (
                <Badge key={item} className="text-lg py-2 px-4">{item}</Badge>
              ))}
            </div>
            <Button className="w-full mt-4">Shop Recommendations</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
