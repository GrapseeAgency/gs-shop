import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Enable/disable focus shopping mode
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { enable, duration = 30, goal } = await req.json()

    if (enable) {
      // Enable focus mode
      await prisma.focusMode.upsert({
        where: { userId },
        update: {
          enabled: true,
          startedAt: new Date(),
          endsAt: new Date(Date.now() + duration * 60 * 1000),
          goal,
          distractionsBlocked: 0
        },
        create: {
          userId,
          enabled: true,
          startedAt: new Date(),
          endsAt: new Date(Date.now() + duration * 60 * 1000),
          goal
        }
      })

      return NextResponse.json({
        enabled: true,
        duration,
        goal,
        message: `Focus mode enabled for ${duration} minutes. Distractions will be minimized.`,
        features: {
          notifications: 'silenced',
          recommendations: 'limited_to_goal',
          checkout: 'streamlined',
          socialProof: 'hidden'
        }
      })
    } else {
      // Disable focus mode
      await prisma.focusMode.update({
        where: { userId },
        data: { enabled: false }
      }).catch(() => {})

      return NextResponse.json({
        enabled: false,
        message: 'Focus mode disabled. Welcome back!'
      })
    }
  } catch (error) {
    console.error('Focus mode error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// GET - Check focus mode status
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ enabled: false })
    }

    const focusMode = await prisma.focusMode.findUnique({
      where: { userId }
    })

    if (!focusMode || !focusMode.enabled || !focusMode.endsAt) {
      return NextResponse.json({ enabled: false })
    }

    const now = new Date()
    const remaining = Math.max(0, Math.ceil((focusMode.endsAt.getTime() - now.getTime()) / 60000))

    return NextResponse.json({
      enabled: true,
      goal: focusMode.goal,
      remainingMinutes: remaining,
      distractionsBlocked: focusMode.distractionsBlocked,
      progress: focusMode.goal ? await getGoalProgress(userId, focusMode.goal) : null
    })
  } catch (error) {
    console.error('Focus status error:', error)
    return NextResponse.json({ enabled: false })
  }
}

async function getGoalProgress(userId: string, goal: string) {
  // Check if goal-related items are in cart or purchased
  const cart = await prisma.cartItem.findMany({
    where: {
      cart: { userId },
      product: {
        OR: [
          { name: { contains: goal } },
          { tags: { contains: goal.toLowerCase() } }
        ]
      }
    },
    include: { product: true }
  })

  return {
    itemsFound: cart.length,
    goalRelatedProducts: cart.map(item => item.product)
  }
}
