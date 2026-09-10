import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get subscription expiry reminders
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ reminders: [] })
    }

    const now = new Date()
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    // Get upcoming renewals
    const upcomingRenewals = await prisma.subscription.findMany({
      where: {
        userId,
        nextBillingDate: {
          gte: now,
          lte: sevenDaysFromNow
        }
      }
    })

    const reminders = upcomingRenewals.map(sub => {
      const daysUntil = Math.ceil((sub.nextBillingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      return {
        id: sub.id,
        serviceName: 'Subscription',
        amount: sub.price,
        nextBillingDate: sub.nextBillingDate,
        daysUntil,
        urgency: daysUntil <= 3 ? 'high' : daysUntil <= 7 ? 'medium' : 'low',
        isUnused: false,
        message: `Subscription renews in ${daysUntil} days: ${sub.price}`,
        cancelLink: `/subscriptions/${sub.id}/cancel`,
        canPause: true
      }
    })

    return NextResponse.json({
      reminders,
      totalUpcoming: reminders.length,
      totalAmount: reminders.reduce((sum, r) => sum + r.amount, 0),
      unusedCount: reminders.filter(r => r.isUnused).length,
      savingsPotential: reminders
        .filter(r => r.isUnused)
        .reduce((sum, r) => sum + r.amount, 0)
    })
  } catch (error) {
    console.error('Subscription reminder error:', error)
    return NextResponse.json({ reminders: [] })
  }
}
