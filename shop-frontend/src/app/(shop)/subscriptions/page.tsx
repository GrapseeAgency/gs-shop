'use client'

import { useState } from 'react'
import { RefreshCw, Shield, Clock, FileText, Headphones, CheckCircle, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

export default function SubscriptionsPage() {
  const [billing, setBilling] = useState('monthly')

  const plans = [
    { 
      id: 1, 
      name: 'Monthly Maintenance', 
      monthly: 2999, 
      yearly: 2499,
      description: 'Bug fixes, updates, hosting monitoring',
      features: ['24/7 monitoring', 'Bug fixes', 'Security updates', 'Monthly report']
    },
    { 
      id: 2, 
      name: 'Backup & Monitoring', 
      monthly: 999, 
      yearly: 799,
      description: 'Weekly backups + uptime monitoring',
      features: ['Daily backups', 'Uptime alerts', 'Restore service', 'SSL monitoring']
    },
    { 
      id: 3, 
      name: 'Performance Reports', 
      monthly: 1499, 
      yearly: 1199,
      description: 'Automated monthly performance analysis',
      features: ['Lighthouse scores', 'SEO report', 'Speed analysis', 'Recommendations']
    },
    { 
      id: 4, 
      name: 'Priority Support', 
      monthly: 4999, 
      yearly: 3999,
      description: '24hr response SLA with dedicated support',
      features: ['24hr SLA', 'Dedicated agent', 'Phone support', 'Emergency fixes']
    },
  ]

  const subscribe = (plan: any) => {
    toast.success(`${plan.name} subscription added!`)
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <RefreshCw className="h-10 w-10 text-green-600" />
          Subscription Plans
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Recurring revenue for your business. Set and forget.
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-4 bg-muted p-2 rounded-lg">
          <span className={billing === 'monthly' ? 'font-bold' : 'text-muted-foreground'}>Monthly</span>
          <Switch checked={billing === 'yearly'} onCheckedChange={() => setBilling(billing === 'monthly' ? 'yearly' : 'monthly')} />
          <span className={billing === 'yearly' ? 'font-bold' : 'text-muted-foreground'}>Yearly</span>
          <Badge className="bg-green-500">Save 20%</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="group hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-muted-foreground mb-4">{plan.description}</p>
              <div className="mb-4">
                <p className="text-4xl font-bold text-green-600">
                  {billing === 'monthly' ? plan.monthly : plan.yearly}
                  <span className="text-lg text-muted-foreground font-normal">/{billing === 'monthly' ? 'mo' : 'yr'}</span>
                </p>
                {billing === 'yearly' && (
                  <p className="text-sm text-muted-foreground">{plan.monthly - plan.yearly} savings</p>
                )}
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="w-full" size="lg" onClick={() => subscribe(plan)}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Subscribe Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
