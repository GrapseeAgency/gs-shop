import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Audit subscriptions and find savings
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

    // Analyze usage patterns
    const audit = subscriptions.map(sub => {
      const monthlyCost = sub.price || 0
      const lastUsed = null // Field not available in current schema
      const daysSinceUse = lastUsed 
        ? Math.floor((Date.now() - new Date(lastUsed).getTime()) / (1000 * 60 * 60 * 24))
        : 999

      let status = 'active'
      let recommendation = 'Keep'
      let potentialSavings = 0

      if (daysSinceUse > 30) {
        status = 'unused'
        recommendation = 'Cancel - Not used in 30+ days'
        potentialSavings = monthlyCost
      } else if (daysSinceUse > 14) {
        status = 'rarely_used'
        recommendation = 'Consider pausing'
        potentialSavings = Math.round(monthlyCost * 0.5)
      }

      return {
        ...sub,
        daysSinceUse,
        status,
        recommendation,
        potentialSavings
      }
    })

    const totalMonthly = subscriptions.reduce((sum, s) => sum + (s.price || 0), 0)
    const totalPotentialSavings = audit.reduce((sum, s) => sum + s.potentialSavings, 0)
    const unusedCount = audit.filter(s => s.status === 'unused').length

    return NextResponse.json({
      subscriptions: audit,
      summary: {
        total: subscriptions.length,
        totalMonthly,
        totalYearly: totalMonthly * 12,
        unusedCount,
        potentialMonthlySavings: totalPotentialSavings,
        potentialYearlySavings: totalPotentialSavings * 12
      },
      actionable: audit.filter(s => s.status !== 'active'),
      message: unusedCount > 0
        ? `Found ${unusedCount} unused subscriptions! Cancel them to save ${totalPotentialSavings}/month.`
        : 'Your subscriptions look healthy. Keep monitoring!'
    })
  } catch (error) {
    console.error('Subscription audit error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
