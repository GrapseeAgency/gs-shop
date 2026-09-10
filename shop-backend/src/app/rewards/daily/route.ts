import { NextResponse } from 'next/server'

// In-memory storage for daily claims
const claimedToday = new Set<string>()
let totalPoints = 0
let streak = 0
let lastClaimDate: string | null = null

const DEFAULT_USER = 'guest'

// POST /api/rewards/daily Claim daily login bonus (5 points)
export async function POST() {
  try {
    const today = new Date().toISOString().split('T')[0]

    // Check if already claimed today
    if (claimedToday.has(DEFAULT_USER)) {
      return NextResponse.json({
        success: false,
        message: 'Already claimed today\'s bonus',
        points: 0,
        totalPoints,
        streak,
      })
    }

    // Check streak
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    if (lastClaimDate === yesterday) {
      streak += 1
    } else if (lastClaimDate !== today) {
      streak = 1
    }

    // Cap streak bonus
    const streakBonus = Math.min(streak - 1, 5) // Max 5 bonus points from streak
    const points = 5 + streakBonus

    claimedToday.add(DEFAULT_USER)
    totalPoints += points
    lastClaimDate = today

    // Reset claimed set at end of day concept (for demo, we just keep it)
    // In production, this would be managed with proper date checks

    return NextResponse.json({
      success: true,
      message: `Daily bonus claimed! +${points} points${streakBonus > 0 ? ` (includes ${streakBonus} streak bonus)` : ''}`,
      points,
      totalPoints,
      streak,
    })
  } catch (error) {
    console.error('Error claiming daily bonus:', error)
    return NextResponse.json(
      { error: 'Failed to claim daily bonus' },
      { status: 500 }
    )
  }
}
