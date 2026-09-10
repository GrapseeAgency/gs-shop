import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Enable student budget enforcer
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { enable, monthlyBudget, categoryLimits } = await req.json()

    if (enable) {
      await prisma.userBudget.create({
        data: {
          userId,
          monthlyBudget,
          categoryLimits: JSON.stringify(categoryLimits || {
            food: monthlyBudget * 0.4,
            entertainment: monthlyBudget * 0.15,
            transport: monthlyBudget * 0.15,
            shopping: monthlyBudget * 0.2,
            savings: monthlyBudget * 0.1
          }),
          strictMode: true,
          alertsEnabled: true
        }
      })

      return NextResponse.json({
        enabled: true,
        monthlyBudget,
        categories: categoryLimits,
        features: {
          spendingAlerts: 'Warns when approaching limit',
          purchaseBlocking: 'Blocks purchases over remaining budget',
          alternatives: 'Suggests cheaper options automatically',
          weeklyReports: 'Track spending vs budget'
        },
        message: 'Student budget mode ON! Stay within your limits.'
      })
    } else {
      await prisma.userBudget.updateMany({
        where: { userId },
        data: { strictMode: false }
      }).catch(() => {})

      return NextResponse.json({
        enabled: false,
        message: 'Budget mode disabled. Spend responsibly!'
      })
    }
  } catch (error) {
    console.error('Student budget error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// GET - Check budget status
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ budget: null })
    }

    const budget = await prisma.userBudget.findUnique({
      where: { userId }
    })

    const spent = await prisma.order.groupBy({
      by: ['status'],
      where: {
        customerEmail: userId,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      },
      _sum: { total: true }
    })

    const totalSpent = spent[0]?._sum?.total || 0

    return NextResponse.json({
      budget: budget ? {
        monthly: budget.monthlyBudget,
        spent: totalSpent,
        remaining: budget.monthlyBudget - totalSpent,
        percentUsed: Math.round((totalSpent / budget.monthlyBudget) * 100)
      } : null,
      alerts: (budget && totalSpent > budget.monthlyBudget * 0.8)
        ? [' You have used 80% of your monthly budget!']
        : []
    })
  } catch (error) {
    console.error('Budget status error:', error)
    return NextResponse.json({ budget: null })
  }
}
