import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Analyze spending patterns and predict monthly spend
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ 
        currentMonthSpend: 0,
        projectedSpend: 0,
        daysLeft: 30
      })
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const daysLeft = endOfMonth.getDate() - now.getDate()

    // Get current month spending
    const currentMonthOrders = await prisma.order.findMany({
      where: {
        customerEmail: userId,
        createdAt: { gte: startOfMonth },
        status: { not: 'cancelled' }
      }
    })

    const currentMonthSpend = currentMonthOrders.reduce((sum, o) => sum + o.total, 0)

    // Get last 3 months for pattern analysis
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1)
    const historicalOrders = await prisma.order.findMany({
      where: {
        customerEmail: userId,
        createdAt: { gte: threeMonthsAgo, lt: startOfMonth },
        status: { not: 'cancelled' }
      }
    })

    // Calculate average monthly spend
    const monthlySpends: number[] = []
    for (let i = 0; i < 3; i++) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i - 1, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i, 0)
      const monthSpend = historicalOrders
        .filter(o => o.createdAt >= monthStart && o.createdAt <= monthEnd)
        .reduce((sum, o) => sum + o.total, 0)
      monthlySpends.push(monthSpend)
    }

    const avgMonthlySpend = monthlySpends.reduce((a, b) => a + b, 0) / monthlySpends.length || currentMonthSpend

    // Current spending pace
    const daysPassed = now.getDate()
    const dailyRate = currentMonthSpend / daysPassed
    const projectedSpend = currentMonthSpend + (dailyRate * daysLeft)

    // Trend analysis
    const trend = projectedSpend > avgMonthlySpend * 1.2 ? 'high' 
      : projectedSpend < avgMonthlySpend * 0.8 ? 'low' 
      : 'normal'

    // Generate insights
    const insights = []
    if (projectedSpend > avgMonthlySpend * 1.3) {
      insights.push(`At this pace, you'll spend ${Math.round(projectedSpend)} this month - ${Math.round((projectedSpend / avgMonthlySpend - 1) * 100)}% above your average`)
    }
    if (currentMonthOrders.length > 15) {
      insights.push(`You've made ${currentMonthOrders.length} purchases this month. Consider batching orders to save on fees.`)
    }

    return NextResponse.json({
      currentMonthSpend,
      projectedSpend: Math.round(projectedSpend),
      averageMonthlySpend: Math.round(avgMonthlySpend),
      daysLeft,
      trend,
      insights,
      suggestedBudget: Math.round(avgMonthlySpend * 1.1),
      overBudget: projectedSpend > avgMonthlySpend * 1.2
    })
  } catch (error) {
    console.error('Budget oracle error:', error)
    return NextResponse.json({ error: 'Failed to analyze' }, { status: 500 })
  }
}

// POST - Set spending cap
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { monthlyCap } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.userBudgetSetting.upsert({
      where: { userId },
      update: { monthlyCap, updatedAt: new Date() },
      create: { userId, monthlyCap }
    })

    return NextResponse.json({
      success: true,
      monthlyCap,
      message: `Monthly spending cap set to ${monthlyCap}`
    })
  } catch (error) {
    console.error('Budget cap error:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
