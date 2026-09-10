import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

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

// Helper to calculate tier based on points
function calculateTier(points: number): string {
  if (points >= 5000) return 'diamond'
  if (points >= 2500) return 'platinum'
  if (points >= 1000) return 'gold'
  if (points >= 500) return 'silver'
  return 'bronze'
}

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

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if claimed today from reward transactions
    const todayEnd = new Date(today)
    todayEnd.setHours(23, 59, 59, 999)

    const claimedToday = await prisma.rewardTransaction.findFirst({
      where: {
        userId,
        type: 'spin_win',
        createdAt: {
          gte: today,
          lte: todayEnd,
        },
      },
    })

    // Get reward history (last 10 spin wins)
    const rewardHistory = await prisma.rewardTransaction.findMany({
      where: {
        userId,
        type: 'spin_win',
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    // Map history to frontend format
    const mappedHistory = rewardHistory.map(tx => {
      let metadata: any = {}
      try {
        metadata = JSON.parse(tx.metadata || '{}')
      } catch { }
      return {
        id: tx.id,
        reward: metadata.rewardName || 'Mystery Reward',
        type: metadata.rewardType || 'points',
        value: metadata.rewardValue || tx.points,
        date: tx.createdAt.toISOString(),
      }
    })

    return NextResponse.json({
      success: true,
      canClaim: !claimedToday,
      nextClaimTime: claimedToday
        ? new Date(new Date().setHours(24, 0, 0, 0)).toISOString()
        : null,
      rewardHistory: mappedHistory,
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
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayEnd = new Date(today)
    todayEnd.setHours(23, 59, 59, 999)

    // Check if already claimed today
    const claimedToday = await prisma.rewardTransaction.findFirst({
      where: {
        userId,
        type: 'spin_win',
        createdAt: {
          gte: today,
          lte: todayEnd,
        },
      },
    })

    if (claimedToday) {
      return NextResponse.json({
        success: false,
        error: 'Already claimed today',
        nextClaimTime: new Date(new Date().setHours(24, 0, 0, 0)).toISOString(),
      }, { status: 400 })
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { rewardsPoints: true, loyaltyTier: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Weighted random selection
    let cumulative = 0
    let selectedReward = REWARD_TYPES[0]
    for (const reward of REWARD_TYPES) {
      cumulative += reward.probability
      if (Math.random() <= cumulative) {
        selectedReward = reward
        break
      }
    }

    let pointsAwarded = 0
    let couponCode: string | null = null
    let giftCardId: string | null = null

    // Process reward based on type
    if (selectedReward.type === 'points') {
      pointsAwarded = selectedReward.value

      // Create reward transaction
      await prisma.rewardTransaction.create({
        data: {
          userId,
          type: 'spin_win',
          points: pointsAwarded,
          description: `Mystery Reward: ${selectedReward.name}`,
          metadata: JSON.stringify({
            rewardType: selectedReward.type,
            rewardName: selectedReward.name,
            rewardValue: selectedReward.value,
            source: 'mystery_reward',
          }),
        },
      })

      // Update user points
      const newPoints = user.rewardsPoints + pointsAwarded
      const newTier = calculateTier(newPoints)
      const tierChanged = newTier !== user.loyaltyTier

      await prisma.user.update({
        where: { id: userId },
        data: {
          rewardsPoints: newPoints,
          loyaltyTier: newTier,
        },
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
              description: `Upgraded to ${newTier.charAt(0).toUpperCase() + newTier.slice(1)} tier from mystery reward! Bonus: ${bonus} points`,
              metadata: JSON.stringify({
                previousTier: user.loyaltyTier,
                newTier,
                source: 'mystery_reward',
              }),
            },
          })

          await prisma.user.update({
            where: { id: userId },
            data: { rewardsPoints: { increment: bonus } }
          })

          pointsAwarded += bonus
        }
      }
    } else if (selectedReward.type === 'coupon') {
      // Generate coupon code
      const codePrefix = 'MYSTERY'
      couponCode = `${codePrefix}${Date.now().toString(36)}`

      // Create coupon in database
      await prisma.coupon.create({
        data: {
          code: couponCode,
          discountType: 'percentage',
          discountValue: selectedReward.value,
          type: 'percentage',
          description: `Mystery Reward - ${selectedReward.name}`,
          isActive: true,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })

      // Create transaction record
      await prisma.rewardTransaction.create({
        data: {
          userId,
          type: 'spin_win',
          points: 0,
          description: `Mystery Reward: ${selectedReward.name}`,
          metadata: JSON.stringify({
            rewardType: selectedReward.type,
            rewardName: selectedReward.name,
            rewardValue: selectedReward.value,
            couponCode,
            source: 'mystery_reward',
          }),
        },
      })
    } else if (selectedReward.type === 'gift_card') {
      // Create gift card
      const codePrefix = 'GIFT'
      const giftCardCode = `${codePrefix}-${Date.now().toString(36)}`

      const giftCard = await prisma.giftCard.create({
        data: {
          code: giftCardCode,
          balance: selectedReward.value,
          userId,
          isActive: true,
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year expiry
        },
      })

      giftCardId = giftCard.id

      // Create transaction record
      await prisma.rewardTransaction.create({
        data: {
          userId,
          type: 'spin_win',
          points: 0,
          description: `Mystery Reward: ${selectedReward.name}`,
          metadata: JSON.stringify({
            rewardType: selectedReward.type,
            rewardName: selectedReward.name,
            rewardValue: selectedReward.value,
            giftCardId: giftCard.id,
            giftCardCode,
            source: 'mystery_reward',
          }),
        },
      })
    } else if (selectedReward.type === 'free_shipping') {
      // Generate free shipping coupon
      const codePrefix = 'FREESHIP'
      couponCode = `${codePrefix}${Date.now().toString(36)}`

      await prisma.coupon.create({
        data: {
          code: couponCode,
          discountType: 'fixed',
          discountValue: 0,
          type: 'fixed',
          description: `Mystery Reward - Free Shipping`,
          isActive: true,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })

      // Create transaction record
      await prisma.rewardTransaction.create({
        data: {
          userId,
          type: 'spin_win',
          points: 0,
          description: `Mystery Reward: ${selectedReward.name}`,
          metadata: JSON.stringify({
            rewardType: selectedReward.type,
            rewardName: selectedReward.name,
            rewardValue: selectedReward.value,
            couponCode,
            source: 'mystery_reward',
          }),
        },
      })
    }

    return NextResponse.json({
      success: true,
      reward: {
        ...selectedReward,
        id: null,
        date: new Date().toISOString(),
      },
      pointsAwarded,
      couponCode,
      giftCardId,
      tierUpgraded: selectedReward.type === 'points'
        ? calculateTier(user.rewardsPoints + pointsAwarded) !== user.loyaltyTier
        : false,
      message: `You won ${selectedReward.name}! `,
    })
  } catch (error) {
    console.error('[MYSTERY-REWARD] POST Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to reveal reward' }, { status: 500 })
  }
}
