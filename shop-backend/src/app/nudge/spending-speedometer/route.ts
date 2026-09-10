import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get spending speedometer data
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ 
        currentSpeed: 0,
        budgetLimit: 0,
        percentage: 0 
      })
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Get budget setting
    const budget = await prisma.userBudgetSetting.findUnique({
      where: { userId }
    })

    const monthlyCap = budget?.monthlyCap || 15000 // Default 15,000

    // Get current spending
    const orders = await prisma.order.findMany({
      where: {
        customerEmail: userId,
        createdAt: { gte: startOfMonth },
        status: { not: 'cancelled' }
      }
    })

    const currentSpend = orders.reduce((sum, o) => sum + o.total, 0)
    const percentage = Math.min(100, (currentSpend / monthlyCap) * 100)

    // Determine speed level
    let speedLevel = 'normal'
    let color = 'green'
    let message = 'On track'

    const daysPassed = now.getDate()
    const daysInMonth = endOfMonth.getDate()
    const expectedSpend = (monthlyCap / daysInMonth) * daysPassed

    if (currentSpend > expectedSpend * 1.5) {
      speedLevel = 'overspeed'
      color = 'red'
      message = 'Spending too fast!'
    } else if (currentSpend > expectedSpend * 1.2) {
      speedLevel = 'warning'
      color = 'amber'
      message = 'Above average pace'
    } else if (currentSpend < expectedSpend * 0.5) {
      speedLevel = 'underspeed'
      color = 'blue'
      message = 'Great savings!'
    }

    return NextResponse.json({
      currentSpeed: currentSpend,
      budgetLimit: monthlyCap,
      percentage,
      speedLevel,
      color,
      message,
      expectedSpend: Math.round(expectedSpend),
      remaining: monthlyCap - currentSpend,
      daysLeft: daysInMonth - daysPassed,
      dailyBudget: Math.round((monthlyCap - currentSpend) / (daysInMonth - daysPassed)),
      canSpend: currentSpend < monthlyCap
    })
  } catch (error) {
    console.error('Speedometer error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
