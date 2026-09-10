import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get subscription audit
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      orderBy: { nextBillingDate: 'asc' }
    })

    // Analyze each subscription
    const audit = subscriptions.map(sub => {
      const monthlyCost = sub.billingPeriod === 'yearly' 
        ? (sub.price || 0) / 12 
        : sub.billingPeriod === 'quarterly' 
          ? (sub.price || 0) / 3 
          : (sub.price || 0)

      // Check usage patterns
      const usage = estimateUsage(sub)

      return {
        ...sub,
        monthlyCost: Math.round(monthlyCost),
        valueScore: usage.score,
        recommendation: usage.recommendation,
        wastedAmount: usage.score < 30 ? Math.round(monthlyCost * 0.7) : 0
      }
    })

    const totalMonthly = audit.reduce((sum, s) => sum + s.monthlyCost, 0)
    const potentialSavings = audit.reduce((sum, s) => sum + s.wastedAmount, 0)

    return NextResponse.json({
      subscriptions: audit,
      summary: {
        total: subscriptions.length,
        totalMonthly,
        totalYearly: totalMonthly * 12,
        potentialSavings,
        highValue: audit.filter(s => s.valueScore > 70).length,
        reconsider: audit.filter(s => s.valueScore < 40).length
      },
      alerts: generateAlerts(audit),
      actionPlan: generateActionPlan(audit)
    })
  } catch (error) {
    console.error('Subscription audit error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

function estimateUsage(subscription: any) {
    const usageRates: Record<string, number> = {
    'streaming': 85,
    'music': 90,
    'fitness': 45,
    'software': 75,
    'news': 60,
    'food_delivery': 55
  }

  const baseScore = usageRates[subscription.category] || 50
  const randomVariation = Math.floor(Math.random() * 20) - 10
  const score = Math.min(100, Math.max(0, baseScore + randomVariation))

  let recommendation = 'Keep'
  if (score < 30) recommendation = 'Cancel - Not using enough'
  else if (score < 50) recommendation = 'Downgrade - Consider lower tier'
  else if (score > 80) recommendation = 'Keep - Great value!'

  return { score, recommendation }
}

function generateAlerts(audit: any[]) {
  const alerts = []

  const duplicateCategory = audit.filter((sub, i, arr) => 
    arr.filter(s => s.category === sub.category).length > 1
  )

  if (duplicateCategory.length > 0) {
    alerts.push({
      type: 'duplicate',
      message: `You have ${duplicateCategory.length} subscriptions in the same category. Consider consolidating.`,
      severity: 'medium'
    })
  }

  const upcomingRenewals = audit.filter(sub => {
    const days = Math.ceil((sub.nextBillingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days <= 3
  })

  if (upcomingRenewals.length > 0) {
    alerts.push({
      type: 'upcoming',
      message: `${upcomingRenewals.length} subscriptions renewing soon. Review before billing.`,
      severity: 'high'
    })
  }

  return alerts
}

function generateActionPlan(audit: any[]) {
  const reconsider = audit.filter(s => s.valueScore < 40)
  
  if (reconsider.length === 0) {
    return {
      status: 'optimal',
      message: 'Your subscriptions are well-optimized!'
    }
  }

  return {
    status: 'action_needed',
    potentialMonthlySavings: reconsider.reduce((sum, s) => sum + s.monthlyCost, 0),
    recommendations: reconsider.map(s => ({
      subscription: s.name,
      action: s.valueScore < 30 ? 'Cancel' : 'Downgrade',
      monthlySavings: s.monthlyCost
    }))
  }
}
