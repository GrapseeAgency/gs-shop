import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get check-in status
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user preferences for streak data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        rewardsPoints: true,
        dailyCheckInDate: true,
        currentStreak: true,
        longestStreak: true,
        totalCheckIns: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if already checked in today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const lastCheckIn = user.dailyCheckInDate ? new Date(user.dailyCheckInDate) : null
    const hasCheckedInToday = lastCheckIn && lastCheckIn >= today

    // Get recent check-ins for calendar
    const recentCheckIns = await prisma.dailyCheckIn.findMany({
      where: { userId },
      orderBy: { checkedInAt: 'desc' },
      take: 30
    })

    // Calculate rewards
    const basePoints = 10
    const streakBonus = Math.min(user.currentStreak * 2, 50) // Max 50 bonus
    const todayReward = basePoints + streakBonus

    // Calculate next milestone
    const streakMilestones = [7, 14, 30, 60, 100]
    const nextMilestone = streakMilestones.find(m => m > user.currentStreak) || 100
    const daysToMilestone = nextMilestone - user.currentStreak

    return NextResponse.json({
      hasCheckedInToday,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      totalCheckIns: user.totalCheckIns,
      todayReward,
      basePoints,
      streakBonus,
      nextMilestone,
      daysToMilestone,
      recentCheckIns,
      rewardsPoints: user.rewardsPoints
    })
  } catch (error) {
    console.error('Daily check-in fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch check-in status' }, { status: 500 })
  }
}

// POST - Check in
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if already checked in today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const lastCheckIn = user.dailyCheckInDate ? new Date(user.dailyCheckInDate) : null
    if (lastCheckIn && lastCheckIn >= today) {
      return NextResponse.json({ 
        error: 'Already checked in today',
        alreadyCheckedIn: true 
      }, { status: 400 })
    }

    // Calculate streak
    let newStreak = 1
    if (lastCheckIn) {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      // Check if checked in yesterday (maintain streak)
      if (lastCheckIn.toDateString() === yesterday.toDateString()) {
        newStreak = user.currentStreak + 1
      }
    }

    // Calculate rewards
    const basePoints = 10
    const streakBonus = Math.min(newStreak * 2, 50)
    const totalPoints = basePoints + streakBonus

    // Milestone bonus
    let milestoneBonus = 0
    const milestones = [7, 14, 30, 60, 100]
    if (milestones.includes(newStreak)) {
      milestoneBonus = newStreak * 5
    }

    const finalPoints = totalPoints + milestoneBonus

    // Create check-in record
    await prisma.dailyCheckIn.create({
      data: {
        userId,
        streakDay: newStreak,
        pointsEarned: totalPoints,
        bonusEarned: streakBonus + milestoneBonus
      }
    })

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        dailyCheckInDate: new Date(),
        currentStreak: newStreak,
        longestStreak: Math.max(user.longestStreak, newStreak),
        totalCheckIns: { increment: 1 },
        rewardsPoints: { increment: finalPoints }
      }
    })

    return NextResponse.json({
      success: true,
      streak: newStreak,
      pointsEarned: finalPoints,
      basePoints,
      streakBonus,
      milestoneBonus,
      totalPoints: updatedUser.rewardsPoints,
      isMilestone: milestones.includes(newStreak),
      message: milestoneBonus > 0 
        ? ` ${newStreak} day streak! +${finalPoints} points!` 
        : `+${finalPoints} points! Keep your streak going!`
    })
  } catch (error) {
    console.error('Daily check-in error:', error)
    return NextResponse.json({ error: 'Failed to check in' }, { status: 500 })
  }
}
