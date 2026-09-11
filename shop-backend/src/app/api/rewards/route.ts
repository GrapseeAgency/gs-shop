import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from "@/lib/auth-options"

// GET /api/rewards?userId=xxx Get rewards info for a user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const sessionUserId = (session?.user as any)?.id

    const { searchParams } = new URL(request.url)
    const queryUserId = searchParams.get('userId')
    const email = searchParams.get('email')

    const targetUserId = sessionUserId || queryUserId

    const where: Record<string, unknown> = {}
    if (targetUserId) where.id = targetUserId
    else if (email) where.email = email
    else {
      return NextResponse.json(
        { error: 'Authentication required or userId/email parameter is required' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findFirst({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        rewardsPoints: true,
        loyaltyTier: true,
      },
    })

    // Return default guest rewards if user not found (prevents 404 console errors)
    if (!user) {
      return NextResponse.json({
        rewardsPoints: 0,
        loyaltyTier: 'bronze',
        nextTierPoints: 500,
        tierMultiplier: 1,
        isGuest: true,
      })
    }

    // Calculate reward tiers and ensure tier is up-to-date
    const points = user.rewardsPoints
    const dbTier = user.loyaltyTier || 'bronze'

    // Determine correct tier based on points
    let correctTier = dbTier
    let tierMultiplier = 1
    let nextTierPoints: number | null = 500

    if (points >= 5000) {
      correctTier = 'diamond'
      tierMultiplier = 3
      nextTierPoints = null
    } else if (points >= 2500) {
      correctTier = 'platinum'
      tierMultiplier = 2.5
      nextTierPoints = 5000
    } else if (points >= 1000) {
      correctTier = 'gold'
      tierMultiplier = 2
      nextTierPoints = 2500
    } else if (points >= 500) {
      correctTier = 'silver'
      tierMultiplier = 1.5
      nextTierPoints = 1000
    } else {
      correctTier = 'bronze'
      tierMultiplier = 1
      nextTierPoints = 500
    }

    // Update tier in database if it changed
    if (correctTier !== dbTier) {
      await prisma.user.update({
        where: { id: user.id },
        data: { loyaltyTier: correctTier }
      })
    }

    // Format tier name for display
    const tierDisplayName = correctTier.charAt(0).toUpperCase() + correctTier.slice(1)

    return NextResponse.json({
      ...user,
      tier: tierDisplayName,
      loyaltyTier: correctTier,
      tierMultiplier,
      nextTierPoints,
    })
  } catch (error) {
    console.error('Error fetching rewards:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rewards info' },
      { status: 500 }
    )
  }
}

// POST /api/rewards Earn or redeem points
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, action, points } = body

    if (!userId || !action || !points) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, action (earn/redeem), and points' },
        { status: 400 }
      )
    }

    if (!['earn', 'redeem'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be "earn" or "redeem"' },
        { status: 400 }
      )
    }

    if (points <= 0) {
      return NextResponse.json(
        { error: 'Points must be a positive number' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (action === 'redeem' && user.rewardsPoints < points) {
      return NextResponse.json(
        { error: 'Insufficient points' },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        rewardsPoints: action === 'earn'
          ? { increment: points }
          : { decrement: points },
      },
      select: {
        id: true,
        name: true,
        email: true,
        rewardsPoints: true,
      },
    })

    return NextResponse.json({
      success: true,
      action,
      pointsChanged: points,
      currentPoints: updatedUser.rewardsPoints,
      message: action === 'earn'
        ? `Earned ${points} points!`
        : `Redeemed ${points} points.`,
    })
  } catch (error) {
    console.error('Error updating rewards:', error)
    return NextResponse.json(
      { error: 'Failed to update rewards' },
      { status: 500 }
    )
  }
}
