import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from "@/lib/auth-options"

const COOLDOWN_MINUTES = 60 // 1 hour cooldown between spins

// GET - List available prizes
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    // Get prizes from database
    const prizes = await db.spinPrize.findMany({
      where: { isActive: true },
      orderBy: { probability: 'desc' },
    })

    // Check user's last spin time for rate limiting info
    let canSpin = true
    let nextSpinAt: string | null = null

    if (userId) {
      const lastSpin = await db.userSpinRecord.findFirst({
        where: { userId },
        orderBy: { spunAt: 'desc' }
      })

      if (lastSpin) {
        const cooldownEnd = new Date(lastSpin.spunAt.getTime() + COOLDOWN_MINUTES * 60 * 1000)
        const now = new Date()
        canSpin = now >= cooldownEnd
        if (!canSpin) {
          nextSpinAt = cooldownEnd.toISOString()
        }
      }
    }

    return NextResponse.json({
      data: prizes,
      rateLimit: {
        cooldownMinutes: COOLDOWN_MINUTES,
        canSpin,
        nextSpinAt,
      }
    })
  } catch (error) {
    console.error('Error fetching prizes:', error)
    return NextResponse.json({ error: 'Failed to fetch prizes' }, { status: 500 })
  }
}

// POST - Spin the wheel
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required to spin the wheel' },
        { status: 401 }
      )
    }

    // Check rate limit - get last spin time
    const lastSpin = await db.userSpinRecord.findFirst({
      where: { userId },
      orderBy: { spunAt: 'desc' }
    })

    if (lastSpin) {
      const cooldownEnd = new Date(lastSpin.spunAt.getTime() + COOLDOWN_MINUTES * 60 * 1000)
      const now = new Date()

      if (now < cooldownEnd) {
        const remainingSeconds = Math.ceil((cooldownEnd.getTime() - now.getTime()) / 1000)
        return NextResponse.json({
          error: 'Rate limit exceeded',
          message: `Please wait ${Math.ceil(remainingSeconds / 60)} minutes before spinning again`,
          nextSpinAt: cooldownEnd.toISOString(),
          remainingSeconds,
        }, { status: 429 })
      }
    }

    // Get active prizes from database
    const prizes = await db.spinPrize.findMany({ where: { isActive: true } })

    if (prizes.length === 0) {
      return NextResponse.json({ error: 'No prizes available' }, { status: 503 })
    }

    // Weighted random selection
    const totalWeight = prizes.reduce((sum, p) => sum + p.probability, 0)
    let random = Math.random() * totalWeight
    let selectedPrize = prizes[0]
    for (const prize of prizes) {
      random -= prize.probability
      if (random <= 0) { selectedPrize = prize; break }
    }

    // Record the spin
    await db.userSpinRecord.create({
      data: {
        userId,
        spinPrizeId: selectedPrize.id,
        won: selectedPrize.type !== 'none',
      }
    })

    // If user won points, add to their account
    if (selectedPrize.type === 'points' && selectedPrize.value > 0) {
      await db.user.update({
        where: { id: userId },
        data: { rewardsPoints: { increment: selectedPrize.value } }
      })
    }

    // If user won a discount coupon, create it
    if (selectedPrize.type === 'discount' && selectedPrize.value > 0) {
      await db.coupon.create({
        data: {
          code: `SPIN-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
          type: 'percentage',
          discountValue: selectedPrize.value,
          maxUses: 1,
          usedCount: 0,
          minOrder: 0,
          description: `Spin & Win ${selectedPrize.value}% Off`,
          isActive: true,
        }
      })
    }

    const nextSpinAt = new Date(Date.now() + COOLDOWN_MINUTES * 60 * 1000).toISOString()

    return NextResponse.json({
      success: true,
      prize: {
        id: selectedPrize.id,
        name: selectedPrize.name,
        type: selectedPrize.type,
        value: selectedPrize.value,
        icon: selectedPrize.icon,
        color: selectedPrize.color,
      },
      message: selectedPrize.type === 'none' ? 'Better luck next time!' : `You won ${selectedPrize.name}!`,
      nextSpinAt,
      cooldownMinutes: COOLDOWN_MINUTES,
    })
  } catch (error) {
    console.error('Error spinning prize wheel:', error)
    return NextResponse.json({ error: 'Failed to spin' }, { status: 500 })
  }
}
