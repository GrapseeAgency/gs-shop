'use client'

import { useState } from 'react'
import { Crown, Star, Zap, Gift, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

export default function LoyaltyTiersPage() {
  const [currentTier] = useState({
    name: 'Silver',
    purchases: 2,
    nextTier: 3,
    progress: 66
  })

  const tiers = [
    {
      name: 'Bronze',
      purchases: 1,
      discount: 0,
      benefits: ['Standard pricing', 'Email support']
    },
    {
      name: 'Silver',
      purchases: 3,
      discount: 5,
      benefits: ['5% off all services', 'Priority support', 'Quarterly discounts']
    },
    {
      name: 'Gold',
      purchases: 5,
      discount: 10,
      benefits: ['10% off all services', 'Free maintenance month', 'Early access to features']
    },
    {
      name: 'Platinum',
      purchases: 10,
      discount: 15,
      benefits: ['15% off all services', 'Dedicated account manager', 'Custom solutions']
    }
  ]

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Crown className="h-10 w-10 text-yellow-600" />
          Client Loyalty Program
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          More purchases = More perks
        </p>
      </div>

      <Card className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Your Status</p>
                <h2 className="text-3xl font-bold">{currentTier.name} Member</h2>
                <p className="text-muted-foreground">
                  {currentTier.purchases} of {currentTier.nextTier} purchases for next tier
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-yellow-500 mb-2">Current</Badge>
              <p className="text-2xl font-bold text-green-600">{currentTier.progress}%</p>
            </div>
          </div>
          <Progress value={currentTier.progress} className="mt-4" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiers.map((tier, index) => (
          <Card key={tier.name} className={tier.name === currentTier.name ? 'border-yellow-500 border-2' : ''}>
            <CardHeader className="text-center">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                index === 0 ? 'bg-orange-100' : index === 1 ? 'bg-gray-100' : index === 2 ? 'bg-yellow-100' : 'bg-purple-100'
              }`}>
                {index === 0 ? <Star className="h-6 w-6 text-orange-600" /> :
                 index === 1 ? <Star className="h-6 w-6 text-gray-600" /> :
                 index === 2 ? <Zap className="h-6 w-6 text-yellow-600" /> :
                 <Crown className="h-6 w-6 text-purple-600" />}
              </div>
              <CardTitle>{tier.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{tier.purchases}+ purchases</p>
            </CardHeader>
            <CardContent className="p-6">
              {tier.discount > 0 && (
                <Badge className="mb-4 w-full justify-center" variant="secondary">
                  {tier.discount}% Off Everything
                </Badge>
              )}
              <ul className="space-y-2 text-sm">
                {tier.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
