'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Shield, CheckCircle, Bug, Code2, FileSearch, Zap, Clock, Award, ChevronRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface QualityPlan {
  id: string
  name: string
  description: string
  price: number
  features: string[]
  coverageDays: number
  revisions: number
  popular?: boolean
}

const qualityPlans: QualityPlan[] = [
  {
    id: 'basic',
    name: 'Basic Coverage',
    description: 'Essential code quality protection',
    price: 0,
    coverageDays: 30,
    revisions: 2,
    features: [
      'Bug fixes for critical issues',
      'Code review for security flaws',
      '2 free revisions',
      '30-day coverage period',
      'Email support'
    ]
  },
  {
    id: 'pro',
    name: 'Pro Assurance',
    description: 'Comprehensive quality guarantee',
    price: 2999,
    coverageDays: 90,
    revisions: 5,
    popular: true,
    features: [
      'All Basic features plus:',
      'Performance optimization',
      'Code refactoring suggestions',
      '5 free revisions',
      '90-day coverage period',
      'Priority support (24hr response)',
      'Monthly health check'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise Shield',
    description: 'Maximum protection for critical systems',
    price: 7999,
    coverageDays: 180,
    revisions: 10,
    features: [
      'All Pro features plus:',
      'Dedicated QA engineer',
      'Automated testing setup',
      '10 free revisions',
      '180-day coverage period',
      '1-hour critical response',
      'Weekly health reports',
      'Architecture consultation'
    ]
  }
]

const qualityMetrics = [
  { icon: Bug, label: 'Bug Detection', value: '99.9%', color: 'text-red-500' },
  { icon: Code2, label: 'Code Coverage', value: '95%+', color: 'text-blue-500' },
  { icon: FileSearch, label: 'Security Audits', value: '100%', color: 'text-green-500' },
  { icon: Zap, label: 'Performance', value: 'A+ Grade', color: 'text-yellow-500' }
]

export default function CodeQualityPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSelectPlan = async (planId: string) => {
    if (!session) {
      toast.error('Please sign in to select a plan')
      return
    }

    setSelectedPlan(planId)
    setLoading(true)

    try {
      const res = await fetch('/api/code-quality/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Quality plan activated!', {
          description: `You're now covered under the ${data.planName} plan`
        })
      } else {
        toast.error(data.error || 'Failed to activate plan')
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
            <Shield className="h-6 w-6 text-blue-500" />
            <h1 className="text-lg font-bold">Code Quality Guarantee</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Hero Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full">
            <CheckCircle className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-600">Industry-Leading Standards</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Every project we deliver comes with comprehensive quality assurance. 
            We stand behind our code with guaranteed fixes and ongoing support.
          </p>
        </div>

        {/* Quality Metrics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Our Quality Standards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {qualityMetrics.map((metric) => (
                <div key={metric.label} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                  <div>
                    <p className="text-xs text-muted-foreground">{metric.label}</p>
                    <p className="text-sm font-bold">{metric.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* What's Covered */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">What's Covered</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {[
                'Runtime errors and crashes',
                'Security vulnerabilities',
                'Performance regressions',
                'Compatibility issues',
                'API contract violations',
                'Database query optimization'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Protection Plans */}
        <div>
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Quality Protection Plans
          </h2>
          <div className="space-y-3">
            {qualityPlans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`cursor-pointer transition-all ${
                  plan.popular ? 'border-blue-500 ring-1 ring-blue-500' : ''
                } ${selectedPlan === plan.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => handleSelectPlan(plan.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{plan.name}</CardTitle>
                    {plan.popular && (
                      <Badge className="bg-blue-500">Popular</Badge>
                    )}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">
                      {plan.price === 0 ? 'FREE' : `${plan.price.toLocaleString()}`}
                    </span>
                    <span className="text-sm text-muted-foreground">/{plan.coverageDays} days</span>
                  </div>
                  <ul className="space-y-1 text-sm">
                    {plan.features.slice(0, 3).map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {feature}
                      </li>
                    ))}
                    {plan.features.length > 3 && (
                      <li className="text-xs text-muted-foreground pl-5">
                        +{plan.features.length - 3} more features
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

        <Separator />

        {/* Trust Indicators */}
        <div className="text-center space-y-2">
          <p className="text-sm font-medium">Trusted by 10,000+ developers</p>
          <p className="text-xs text-muted-foreground">
            Every project includes our Basic Coverage at no extra cost
          </p>
        </div>
      </div>
    </div>
  )
}
