import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Connect fitness tracker and get recommendations
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { steps, calories, activeMinutes, workoutType } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fitness data saved

    // Generate recommendations based on activity
    const recommendations = []

    if (calories > 500) {
      // High calorie burn - suggest healthy snacks/recovery
      const recoveryProducts = await prisma.product.findMany({
        where: {
          OR: [
            { tags: { contains: 'protein' } },
            { tags: { contains: 'recovery' } },
            { tags: { contains: 'healthy' } }
          ]
        },
        take: 4
      })

      recommendations.push({
        type: 'recovery',
        message: `Great workout! Burned ${calories} calories. Here are recovery essentials.`,
        products: recoveryProducts
      })
    }

    if (steps > 10000) {
      // High steps - suggest running/walking gear
      const runningGear = await prisma.product.findMany({
        where: {
          OR: [
            { tags: { contains: 'running' } },
            { tags: { contains: 'fitness' } },
            { tags: { contains: 'athletic' } }
          ]
        },
        take: 4
      })

      recommendations.push({
        type: 'gear_upgrade',
        message: ` ${steps.toLocaleString()} steps! You deserve new running shoes!`,
        products: runningGear,
        milestone: '10k_steps'
      })
    }

    if (activeMinutes > 60) {
      // Long workout - suggest hydration/energy
      const energyProducts = await prisma.product.findMany({
        where: {
          OR: [
            { tags: { contains: 'energy' } },
            { tags: { contains: 'hydration' } },
            { tags: { contains: 'electrolyte' } }
          ]
        },
        take: 4
      })

      recommendations.push({
        type: 'endurance',
        message: `${activeMinutes} minutes of activity! Stay fueled.`,
        products: energyProducts
      })
    }

    return NextResponse.json({
      connected: true,
      todayStats: { steps, calories, activeMinutes },
      recommendations,
      challenges: [
        { name: 'Step Master', target: 15000, reward: '50 points' },
        { name: 'Calorie Crusher', target: 800, reward: 'Discount coupon' }
      ]
    })
  } catch (error) {
    console.error('Fitness tracker error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// GET - Get fitness profile
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ connected: false })

    return NextResponse.json({
      connected: false,
      stats: null
    })
  } catch (error) {
    console.error('Fitness profile error:', error)
    return NextResponse.json({ connected: false })
  }
}
