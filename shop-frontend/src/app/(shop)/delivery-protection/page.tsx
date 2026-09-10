'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { CheckCircle, Shield, Clock, FileCheck, AlertTriangle, RefreshCw, ArrowLeft, ChevronRight, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ProtectionPlan {
  id: string
  name: string
  description: string
  price: number
  coverage: string[]
  milestones: number
  refundPercent: number
  popular?: boolean
}

const protectionPlans: ProtectionPlan[] = [
  {
    id: 'standard',
    name: 'Standard Protection',
    description: 'Essential milestone protection',
    price: 0,
    refundPercent: 50,
    milestones: 3,
    coverage: [
      '50% refund if milestones missed',
      '3 project milestones tracked',
      'Automatic deadline monitoring',
      'Basic dispute resolution',
      'Email support'
    ]
  },
  {
    id: 'pro',
    name: 'Pro Protection',
    description: 'Comprehensive delivery assurance',
    price: 4999,
    refundPercent: 75,
    milestones: 5,
    popular: true,
    coverage: [
      '75% refund if milestones missed',
      '5 project milestones tracked',
      'Priority deadline monitoring',
      'Advanced dispute resolution',
      'Priority support (12hr response)',
      'Code escrow service',
      'Weekly progress reports'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise Shield',
    description: 'Maximum protection for mission-critical projects',
    price: 14999,
    refundPercent: 100,
    milestones: 7,
    coverage: [
      '100% refund if milestones missed',
      '7 project milestones tracked',
      'Real-time deadline monitoring',
      'Dedicated dispute manager',
      '1-hour critical response',
      'Source code escrow',
      'Daily progress reports',
      'Legal support included'
    ]
  }
]

const milestoneStages = [
  { name: 'Requirements', icon: FileCheck, description: 'Project scope defined' },
  { name: 'Design', icon: Shield, description: 'UI/UX approved' },
  { name: 'Development', icon: Clock, description: 'Core features built' },
  { name: 'Testing', icon: CheckCircle, description: 'QA completed' },
  { name: 'Deployment', icon: Lock, description: 'Live production' }
]

export default function DeliveryProtectionPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSelectPlan = async (planId: string) => {
    if (!session) {
      toast.error('Please sign in to select protection')
      return
    }

    setSelectedPlan(planId)
    setLoading(true)

    try {
      const res = await fetch('/api/delivery-protection/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Delivery protection activated!', {
          description: `Your projects are now covered under ${data.planName}`
        })
      } else {
        toast.error(data.error || 'Failed to activate protection')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-green-500" />
            <h1 className="text-lg font-bold">Delivery Protection</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Hero Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-600">Milestone-Based Protection</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Your project delivery is protected by milestone-based guarantees. 
            If deadlines are missed, you get automatic refunds - no questions asked.
          </p>
        </div>

        {/* How It Works */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { step: 1, title: 'Set Milestones', desc: 'Define clear deliverables for your project' },
                { step: 2, title: 'Track Progress', desc: 'Monitor each milestone in real-time' },
                { step: 3, title: 'Auto Protection', desc: 'If a milestone is missed, refund triggers' },
                { step: 4, title: 'Get Refunded', desc: 'Up to 100% refund based on your plan' }
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Milestone Stages */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Protected Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              {milestoneStages.map((stage, i) => (
                <div key={stage.name} className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                  <stage.icon className="h-5 w-5 text-primary shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{i + 1}. {stage.name}</p>
                      <Badge variant="outline" className="text-xs">Protected</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{stage.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Protection Plans */}
        <div>
          <h2 className="text-base font-semibold mb-3">Choose Your Protection</h2>
          <div className="space-y-3">
            {protectionPlans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`cursor-pointer transition-all ${
                  plan.popular ? 'border-green-500 ring-1 ring-green-500' : ''
                } ${selectedPlan === plan.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => handleSelectPlan(plan.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{plan.name}</CardTitle>
                    {plan.popular && (
                      <Badge className="bg-green-500">Recommended</Badge>
                    )}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">
                      {plan.price === 0 ? 'FREE' : `${plan.price.toLocaleString()}`}
                    </span>
                    <span className="text-sm text-muted-foreground">/project</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <RefreshCw className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-green-600">{plan.refundPercent}% Refund</span>
                    <span className="text-muted-foreground">if milestones missed</span>
                  </div>

                  <ul className="space-y-1 text-sm">
                    {plan.coverage.slice(0, 3).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle className="h-3 w-3 text-green-500 mt-1 shrink-0" />
                        {feature}
                      </li>
                    ))}
                    {plan.coverage.length > 3 && (
                      <li className="text-xs text-muted-foreground pl-5">
                        +{plan.coverage.length - 3} more benefits
                      </li>
                    )}
                  </ul>

                  <Button 
                    className="w-full" 
                    variant={plan.popular ? 'default' : 'outline'}
                    disabled={loading && selectedPlan === plan.id}
                  >
                    {loading && selectedPlan === plan.id ? 'Activating...' : 'Select Plan'}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <Card className="bg-gradient-to-br from-green-500/5 to-emerald-500/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Important Note</p>
                <p className="text-xs text-muted-foreground">
                  Standard Protection is automatically included with every project at no extra cost. 
                  Upgrade to Pro or Enterprise for enhanced protection and faster support.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Stats */}
        <div className="text-center space-y-2">
          <p className="text-sm font-medium">Protection Stats</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-green-600">99.2%</p>
              <p className="text-xs text-muted-foreground">On-time delivery</p>
            </div>
            <div>
              <p className="text-lg font-bold text-blue-600">2.4M</p>
              <p className="text-xs text-muted-foreground">Protected value</p>
            </div>
            <div>
              <p className="text-lg font-bold text-purple-600">4hrs</p>
              <p className="text-xs text-muted-foreground">Avg response time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
