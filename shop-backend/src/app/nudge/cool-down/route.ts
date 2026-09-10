import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Trigger cool-down timer for high-value purchase
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { productId, price, action } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const COOL_DOWN_THRESHOLD = 5000 // 5000

    if (price < COOL_DOWN_THRESHOLD) {
      return NextResponse.json({
        coolDownRequired: false,
        message: 'No cool-down needed for this amount'
      })
    }

    if (action === 'start') {
      // Create cool-down timer
      const timer = await prisma.coolDownTimer.create({
        data: {
          userId,
          productId,
          price,
          duration: 30, // 30 minutes
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
          status: 'active'
        }
      })

      return NextResponse.json({
        coolDownRequired: true,
        timerId: timer.id,
        duration: 30,
        minutes: 30,
        seconds: 0,
        message: `This purchase is over ${COOL_DOWN_THRESHOLD}. Take 30 minutes to think it over.`,
        reason: 'high_value_impulse_prevention',
        canBypass: false,
        savingsTip: 'Many people save money by waiting. You might find a better deal!'
      })
    }

    if (action === 'check') {
      // Check if timer expired
      const timer = await prisma.coolDownTimer.findFirst({
        where: {
          userId,
          productId,
          status: 'active'
        }
      })

      if (!timer) {
        return NextResponse.json({
          coolDownComplete: true,
          canPurchase: true
        })
      }

      const now = new Date()
      const expiresAt = new Date(timer.expiresAt)
      const remainingMs = expiresAt.getTime() - now.getTime()

      if (remainingMs <= 0) {
        // Timer expired
        await prisma.coolDownTimer.update({
          where: { id: timer.id },
          data: { status: 'expired' }
        })

        return NextResponse.json({
          coolDownComplete: true,
          canPurchase: true,
          message: 'Cool-down complete. Ready to purchase?'
        })
      }

      const minutes = Math.floor(remainingMs / 60000)
      const seconds = Math.floor((remainingMs % 60000) / 1000)

      return NextResponse.json({
        coolDownComplete: false,
        canPurchase: false,
        remaining: { minutes, seconds },
        message: `${minutes}:${seconds.toString().padStart(2, '0')} remaining`,
        savingsStats: 'Users who wait 30 minutes save an average of 12% on purchases over 5000'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Cool-down error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
