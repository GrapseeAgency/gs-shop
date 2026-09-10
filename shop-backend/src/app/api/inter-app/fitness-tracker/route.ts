import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Connect fitness tracker and get recommendations
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { steps, calories, activeMinutes } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const recommendations = []

    if (calories > 500) {
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
      recommendations.push({ type: 'recovery', products: recoveryProducts })
    }

    if (steps > 10000) {
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
      recommendations.push({ type: 'gear_upgrade', products: runningGear })
    }

    if (activeMinutes > 60) {
      const energyProducts = await prisma.product.findMany({
        where: {
          OR: [
            { tags: { contains: 'energy' } },
            { tags: { contains: 'hydration' } },
          ]
        },
        take: 4
      })
      recommendations.push({ type: 'endurance', products: energyProducts })
    }

    return NextResponse.json({
      todayStats: { steps, calories, activeMinutes },
      recommendations,
    })
  } catch (error) {
    console.error('Fitness tracker error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// GET - Get fitness profile
export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      connected: false,
      message: 'Fitness tracker integration requires setup',
    })
  } catch (error) {
    console.error('Fitness profile error:', error)
    return NextResponse.json({ connected: false })
  }
}
