// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get user's subscriptions
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ subscriptions: [], upcoming: 0 })
    }

    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      orderBy: { nextBillingDate: 'asc' }
    })

    const now = new Date()
    const upcoming7Days = subscriptions.filter(s => {
      const daysUntil = Math.ceil((s.nextBillingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntil <= 7 && daysUntil >= 0
    })

    const totalMonthly = subscriptions
      .filter(s => s.frequency === 'monthly')
      .reduce((sum, s) => sum + s.amount, 0)
    
    const totalYearly = subscriptions
      .filter(s => s.frequency === 'yearly')
      .reduce((sum, s) => sum + s.amount, 0)

    return NextResponse.json({
      subscriptions,
      total: subscriptions.length,
      upcoming7Days,
      monthlySpend: totalMonthly,
      yearlySpend: totalYearly + (totalMonthly * 12),
      nextBilling: subscriptions[0]?.nextBillingDate || null,
      recommendations: getSubscriptionRecommendations(subscriptions)
    })
  } catch (error) {
    console.error('Subscription error:', error)
    return NextResponse.json({ subscriptions: [] })
  }
}

// POST - Add or manage subscription
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, subscriptionId, subscription } = await req.json()

    if (action === 'add') {
      const newSub = await prisma.subscription.create({
        data: {
          userId,
          name: subscription.name,
          amount: subscription.amount,
          frequency: subscription.frequency,
          nextBillingDate: new Date(subscription.nextBillingDate),
          category: subscription.category,
          status: 'active'
        }
      })

      return NextResponse.json({
        success: true,
        subscription: newSub,
        message: `Added ${subscription.name} to subscription tracker`
      })
    }

    if (action === 'cancel' && subscriptionId) {
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: { status: 'cancelled' }
      })

      return NextResponse.json({
        success: true,
        message: 'Subscription cancelled'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Subscription action error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

function getSubscriptionRecommendations(subs: any[]) {
  const categories = subs.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const recommendations = []

  if (categories['streaming'] >= 3) {
    recommendations.push({
      type: 'consolidate',
      message: 'You have 3+ streaming services. Consider consolidating to save money.'
    })
  }

  if (subs.length > 10) {
    recommendations.push({
      type: 'review',
      message: `You have ${subs.length} active subscriptions. Time for a subscription audit?`
    })
  }

  return recommendations
}
