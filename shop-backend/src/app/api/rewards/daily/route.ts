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

const tierBonuses: Record<string, number> = {
  bronze: 0,
  silver: 50,
  gold: 100,
  platinum: 200,
  diamond: 500
}

// POST /api/rewards/daily Claim daily login bonus (5 points)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required to claim daily bonus' },
        { status: 401 }
      )
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        rewardsPoints: true,
        loyaltyTier: true,
        dailyCheckInDate: true,
        currentStreak: true,
        totalCheckIns: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if already claimed today
    const lastCheckIn = user.dailyCheckInDate
    if (lastCheckIn) {
      const lastCheckInDate = new Date(lastCheckIn)
      lastCheckInDate.setHours(0, 0, 0, 0)
      if (lastCheckInDate.getTime() === today.getTime()) {
        return NextResponse.json({
          success: false,
          message: 'Already claimed today\'s bonus',
          points: 0,
          totalPoints: user.rewardsPoints,
          streak: user.currentStreak,
          alreadyClaimed: true,
        })
      }
    }

    // Calculate streak
    let newStreak = 1
    if (lastCheckIn) {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const lastCheckInDate = new Date(lastCheckIn)
      lastCheckInDate.setHours(0, 0, 0, 0)

      if (lastCheckInDate.getTime() === yesterday.getTime()) {
        // Consecutive day
        newStreak = (user.currentStreak || 0) + 1
      }
    }

    // Cap streak bonus (max 5 bonus points from streak)
    const streakBonus = Math.min(newStreak - 1, 5)
    const points = 5 + streakBonus

    // Calculate new points and tier
    const newPoints = user.rewardsPoints + points
    const newTier = calculateTier(newPoints)
    const tierChanged = newTier !== user.loyaltyTier

    // Update user in database
    await prisma.user.update({
      where: { id: userId },
      data: {
        rewardsPoints: newPoints,
        loyaltyTier: newTier,
        dailyCheckInDate: new Date(),
        currentStreak: newStreak,
        totalCheckIns: { increment: 1 },
        longestStreak: {
          set: newStreak > (user.currentStreak || 0) ? newStreak : undefined
        },
      }
    })

    // Create reward transaction
    await prisma.rewardTransaction.create({
      data: {
        userId,
        type: 'daily_login',
        points,
        description: streakBonus > 0
          ? `Daily login bonus +${points} points (${newStreak} day streak!)`
          : `Daily login bonus +${points} points`,
        metadata: JSON.stringify({
          streak: newStreak,
          streakBonus,
          basePoints: 5,
        }),
      }
    })

    // If tier upgraded, create bonus transaction
    if (tierChanged) {
      const tierBonuses: Record<string, number> = {
        silver: 50,
        gold: 100,
        platinum: 200,
        diamond: 500,
      }
      const bonus = tierBonuses[newTier] || 0
      if (bonus > 0) {
        await prisma.rewardTransaction.create({
          data: {
            userId,
            type: 'tier_upgrade',
            points: bonus,
            description: `Upgraded to ${newTier.charAt(0).toUpperCase() + newTier.slice(1)} tier! Bonus: ${bonus} points`,
            metadata: JSON.stringify({
              previousTier: user.loyaltyTier,
              newTier,
              source: 'daily_checkin',
            }),
          }
        })

        // Update points with bonus
        await prisma.user.update({
          where: { id: userId },
          data: { rewardsPoints: { increment: bonus } }
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: streakBonus > 0
        ? `Daily bonus claimed! +${points} points (${newStreak} day streak!)`
        : `Daily bonus claimed! +${points} points`,
      points,
      totalPoints: newPoints + (tierChanged ? (tierBonuses[newTier] || 0) : 0),
      streak: newStreak,
      tierUpgraded: tierChanged ? newTier : null,
    })
  } catch (error) {
    console.error('Error claiming daily bonus:', error)
    return NextResponse.json(
      { error: 'Failed to claim daily bonus' },
      { status: 500 }
    )
  }
}

// GET /api/rewards/daily Check daily status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        rewardsPoints: true,
        dailyCheckInDate: true,
        currentStreak: true,
        totalCheckIns: true,
        longestStreak: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let alreadyClaimed = false
    if (user.dailyCheckInDate) {
      const lastCheckInDate = new Date(user.dailyCheckInDate)
      lastCheckInDate.setHours(0, 0, 0, 0)
      alreadyClaimed = lastCheckInDate.getTime() === today.getTime()
    }

    return NextResponse.json({
      alreadyClaimed,
      streak: user.currentStreak || 0,
      totalCheckIns: user.totalCheckIns || 0,
      longestStreak: user.longestStreak || 0,
      totalPoints: user.rewardsPoints || 0,
    })
  } catch (error) {
    console.error('Error checking daily status:', error)
    return NextResponse.json(
      { error: 'Failed to check daily status' },
      { status: 500 }
    )
  }
}
