import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/rewards?userId=xxx Get rewards info for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const email = searchParams.get('email')

    const where: Record<string, unknown> = {}
    if (userId) where.id = userId
    else if (email) where.email = email
    else {
      return NextResponse.json(
        { error: 'userId or email parameter is required' },
        { status: 400 }
      )
    }

    const user = await db.user.findFirst({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        rewardsPoints: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Calculate reward tiers
    const points = user.rewardsPoints
    let tier = 'Bronze'
    let tierMultiplier = 1
    if (points >= 5000) {
      tier = 'Platinum'
      tierMultiplier = 3
    } else if (points >= 2000) {
      tier = 'Gold'
      tierMultiplier = 2
    } else if (points >= 500) {
      tier = 'Silver'
      tierMultiplier = 1.5
    }

    return NextResponse.json({
      ...user,
      tier,
      tierMultiplier,
      nextTierPoints: points >= 5000 ? null : points >= 2000 ? 5000 : points >= 500 ? 2000 : 500,
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

    const user = await db.user.findUnique({ where: { id: userId } })
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

    const updatedUser = await db.user.update({
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
