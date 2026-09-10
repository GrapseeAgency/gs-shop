'use client'

import { useState } from 'react'
import { RefreshCw, Shield, Wrench, Headphones, Zap, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function ServiceSubscriptionsPage() {
  const [tiers] = useState([
    {
      name: 'Basic Care',
      price: 999,
      period: 'month',
      features: [
        'Security updates',
        'Bug fixes',
        'Email support',
        'Monthly backups'
      ],
      popular: false
    },
    {
      name: 'Pro Support',
      price: 1999,
      period: 'month',
      features: [
        'Everything in Basic',
        'Priority support',
        'Weekly backups',
        'Performance monitoring',
        'Content updates (5/mo)'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 4999,
      period: 'month',
      features: [
        'Everything in Pro',
        '24/7 phone support',
        'Daily backups',
        'Unlimited changes',
        'Dedicated account manager',
        'Quarterly reviews'
      ],
      popular: false
    }
  ])

  const subscribe = (tier: string) => {
    toast.success(`Subscribed to ${tier} plan!`)
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <RefreshCw className="h-10 w-10 text-blue-600" />
          Service Subscriptions
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Keep your project running smoothly
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <Card key={tier.name} className={tier.popular ? 'border-blue-500 border-2 relative' : ''}>
            {tier.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500">
                Most Popular
              </Badge>
            )}
            <CardHeader>
              <CardTitle className="text-center">{tier.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <p className="text-4xl font-bold">{tier.price}</p>
                <p className="text-muted-foreground">/ {tier.period}</p>
              </div>

              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className="w-full" 
                variant={tier.popular ? 'default' : 'outline'}
                onClick={() => subscribe(tier.name)}
              >
                Subscribe
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold">Annual Subscription</h3>
                <p className="text-sm text-muted-foreground">Save 20% with yearly billing</p>
              </div>
            </div>
            <Button>View Annual Plans</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
