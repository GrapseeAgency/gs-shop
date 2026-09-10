import { NextRequest, NextResponse } from 'next/server'

const REWARD_TYPES = [
  { type: 'points', name: '50 Points', value: 50, probability: 30, icon: '', color: '#EAB308' },
  { type: 'coupon', name: '10% Off Coupon', value: 10, probability: 20, icon: '', color: '#3B82F6' },
  { type: 'free_shipping', name: 'Free Shipping', value: 0, probability: 18, icon: '', color: '#10B981' },
  { type: 'points', name: '100 Points', value: 100, probability: 15, icon: '', color: '#F59E0B' },
  { type: 'gift_card', name: '$5 Gift Card', value: 5, probability: 10, icon: '', color: '#EC4899' },
  { type: 'points', name: '200 Points', value: 200, probability: 5, icon: '', color: '#8B5CF6' },
  { type: 'coupon', name: '25% Off Coupon', value: 25, probability: 1.5, icon: '', color: '#EF4444' },
  { type: 'jackpot', name: 'JACKPOT $50!', value: 50, probability: 0.5, icon: '', color: '#FFD700' },
]

// In-memory daily claim tracker
const dailyClaims = new Map<string, string[]>()
const rewardHistory: Array<{ id: string; reward: string; type: string; date: string }> = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'guest'

    const today = new Date().toISOString().split('T')[0]
    const claimedToday = dailyClaims.get(userId)?.includes(today) || false
    const userHistory = rewardHistory.slice(-10)

    return NextResponse.json({
      success: true,
      canClaim: !claimedToday,
      nextClaimTime: claimedToday ? new Date(new Date().setHours(24, 0, 0, 0)).toISOString() : null,
      rewardHistory: userHistory,
      possibleRewards: REWARD_TYPES,
      dailyLimit: 1,
    })
  } catch (error) {
    console.error('[MYSTERY-REWARD] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to load reward data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = body.userId || 'guest'

    const today = new Date().toISOString().split('T')[0]
    const userClaims = dailyClaims.get(userId) || []

    if (userClaims.includes(today)) {
      return NextResponse.json({
        success: false,
        error: 'Already claimed today',
        nextClaimTime: new Date(new Date().setHours(24, 0, 0, 0)).toISOString(),
      }, { status: 400 })
    }

    // Weighted random selection
    const rand = Math.random() * 100
    let cumulative = 0
    let selectedReward = REWARD_TYPES[0]
    for (const reward of REWARD_TYPES) {
      cumulative += reward.probability
      if (rand <= cumulative) {
        selectedReward = reward
        break
      }
    }

    // Mark as claimed
    userClaims.push(today)
    dailyClaims.set(userId, userClaims)

    const rewardRecord = {
      id: `reward-${Date.now()}`,
      reward: selectedReward.name,
      type: selectedReward.type,
      value: selectedReward.value,
      date: today,
    }
    rewardHistory.push(rewardRecord)

    return NextResponse.json({
      success: true,
      reward: {
        ...selectedReward,
        ...rewardRecord,
      },
      message: `You won ${selectedReward.name}! `,
    })
  } catch (error) {
    console.error('[MYSTERY-REWARD] POST Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to reveal reward' }, { status: 500 })
  }
}
