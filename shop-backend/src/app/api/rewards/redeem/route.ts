import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Helper to calculate tier based on points
function calculateTier(points: number): string {
  if (points >= 5000) return 'diamond'
  if (points >= 2500) return 'platinum'
  if (points >= 1000) return 'gold'
  if (points >= 500) return 'silver'
  return 'bronze'
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { points } = body

    if (!points || typeof points !== 'number') {
      return NextResponse.json({ error: 'Points amount is required' }, { status: 400 })
    }

    if (points < 500) {
      return NextResponse.json(
        { error: 'Minimum 500 points required for redemption' },
        { status: 400 }
      )
    }

    if (points % 500 !== 0) {
      return NextResponse.json(
        { error: 'Points must be redeemed in increments of 500' },
        { status: 400 }
      )
    }

    // Retrieve user and check points balance in DB
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.rewardsPoints < points) {
      return NextResponse.json({ error: `Insufficient points balance. You have ${user.rewardsPoints} points.` }, { status: 400 })
    }

    // Deduct points persistently
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { rewardsPoints: { decrement: points } },
    })

    // Generate discount code (100 BDT off per 500 points)
    const discountAmount = (points / 500) * 100
    const codePrefix = 'GRAPSEE'
    const discountCode = `${codePrefix}${Date.now().toString(36)}`

    // Create transaction record for redemption
    await prisma.rewardTransaction.create({
      data: {
        userId,
        type: 'redemption',
        points: -points,
        description: `Redeemed ${points} points for ${discountAmount} discount code`,
        metadata: JSON.stringify({
          discountCode,
          discountAmount,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      },
    })

    // Check for tier downgrade
    const newTier = calculateTier(updatedUser.rewardsPoints)
    const oldTier = calculateTier(user.rewardsPoints)
    if (newTier !== oldTier && newTier !== user.loyaltyTier) {
      await prisma.user.update({
        where: { id: userId },
        data: { loyaltyTier: newTier }
      })
    }

    // Create coupon in database for tracking
    await prisma.coupon.create({
      data: {
        code: discountCode,
        discountType: 'fixed',
        discountValue: discountAmount,
        type: 'fixed',
        description: `Reward redemption - ${points} points`,
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }
    })

    return NextResponse.json({
      success: true,
      discountCode,
      pointsRedeemed: points,
      discountAmount,
      currentPoints: updatedUser.rewardsPoints,
      currentTier: newTier,
      message: `Successfully redeemed ${points} points for ${discountAmount} discount!`,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
  } catch (error) {
    console.error('Error redeeming points:', error)
    return NextResponse.json({ error: 'Failed to redeem points' }, { status: 500 })
  }
}
