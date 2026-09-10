import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Loyalty tier thresholds
const LOYALTY_TIERS = [
  { name: 'Bronze', minPoints: 0, maxPoints: 999, color: '#CD7F32', discount: 0, freeShipping: false },
  { name: 'Silver', minPoints: 1000, maxPoints: 4999, color: '#C0C0C0', discount: 5, freeShipping: false },
  { name: 'Gold', minPoints: 5000, maxPoints: 14999, color: '#FFD700', discount: 10, freeShipping: true },
  { name: 'Platinum', minPoints: 15000, maxPoints: 49999, color: '#E5E4E2', discount: 15, freeShipping: true },
  { name: 'Diamond', minPoints: 50000, maxPoints: Infinity, color: '#B9F2FF', discount: 20, freeShipping: true },
]

// Available rewards by tier
const REWARDS_BY_TIER: Record<string, Array<{ id: string; name: string; pointsCost: number; description: string }>> = {
  Bronze: [
    { id: 'rw-1', name: '50 BDT Off Coupon', pointsCost: 200, description: 'Get 50 BDT off on your next order' },
    { id: 'rw-2', name: 'Free Sticker Pack', pointsCost: 100, description: 'Exclusive Grapsee sticker pack' },
  ],
  Silver: [
    { id: 'rw-3', name: '100 BDT Off Coupon', pointsCost: 400, description: 'Get 100 BDT off on your next order' },
    { id: 'rw-4', name: 'Free Shipping', pointsCost: 300, description: 'Free shipping on one order' },
    { id: 'rw-5', name: 'Early Access', pointsCost: 500, description: '24-hour early access to new products' },
  ],
  Gold: [
    { id: 'rw-6', name: '250 BDT Off Coupon', pointsCost: 800, description: 'Get 250 BDT off on your next order' },
    { id: 'rw-7', name: 'Birthday Bonus', pointsCost: 600, description: 'Double points on your birthday month' },
    { id: 'rw-8', name: 'Priority Support', pointsCost: 500, description: 'Priority customer support access' },
    { id: 'rw-9', name: 'Free Gift Wrapping', pointsCost: 300, description: 'Free premium gift wrapping' },
  ],
  Platinum: [
    { id: 'rw-10', name: '500 BDT Off Coupon', pointsCost: 1500, description: 'Get 500 BDT off on your next order' },
    { id: 'rw-11', name: 'VIP Sale Access', pointsCost: 1000, description: 'Exclusive VIP sale entry' },
    { id: 'rw-12', name: 'Personal Shopper', pointsCost: 2000, description: '1 hour with a personal shopper' },
  ],
  Diamond: [
    { id: 'rw-13', name: '1000 BDT Off Coupon', pointsCost: 3000, description: 'Get 1000 BDT off on your next order' },
    { id: 'rw-14', name: 'Annual Free Product', pointsCost: 5000, description: 'Choose one free product under 2000 BDT' },
    { id: 'rw-15', name: 'Lifetime Free Shipping', pointsCost: 8000, description: 'Free shipping forever' },
    { id: 'rw-16', name: 'Exclusive Events', pointsCost: 4000, description: 'Invitation to exclusive launch events' },
  ],
}

// POST /api/loyalty-calculator Calculate loyalty points and tier
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { purchaseAmount, userId, currentPoints } = body

    if (!purchaseAmount || purchaseAmount <= 0) {
      return NextResponse.json(
        { error: 'Valid purchase amount is required' },
        { status: 400 }
      )
    }

    // Calculate points earned (1 BDT = 1 point)
    const basePoints = Math.floor(purchaseAmount)

    // Try to get user's current points from DB
    let userPoints = currentPoints || 0
    let userTier = 'Bronze'
    let userName = ''

    if (userId) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { rewardsPoints: true, loyaltyTier: true, name: true },
        })
        if (user) {
          userPoints = user.rewardsPoints
          userTier = user.loyaltyTier
          userName = user.name
        }
      } catch {
        // User might not exist
      }
    }

    // Determine current tier from points
    const totalPointsAfterPurchase = userPoints + basePoints
    const currentTierInfo = LOYALTY_TIERS.find(
      t => totalPointsAfterPurchase >= t.minPoints && totalPointsAfterPurchase <= t.maxPoints
    ) || LOYALTY_TIERS[0]

    const nextTierIndex = LOYALTY_TIERS.indexOf(currentTierInfo) + 1
    const nextTier = nextTierIndex < LOYALTY_TIERS.length ? LOYALTY_TIERS[nextTierIndex] : null

    // Calculate bonus points based on tier
    const tierBonusMultiplier: Record<string, number> = {
      Bronze: 1.0,
      Silver: 1.1,
      Gold: 1.2,
      Platinum: 1.3,
      Diamond: 1.5,
    }

    const bonusMultiplier = tierBonusMultiplier[userTier] || 1.0
    const bonusPoints = Math.floor(basePoints * (bonusMultiplier - 1))
    const totalPointsEarned = basePoints + bonusPoints

    // Get available rewards for current tier
    const tierOrder = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond']
    const currentTierIndex = tierOrder.indexOf(currentTierInfo.name)
    const availableRewards = tierOrder.slice(0, currentTierIndex + 1).flatMap(
      tier => REWARDS_BY_TIER[tier] || []
    ).filter(r => r.pointsCost <= totalPointsAfterPurchase)

    // Calculate tier progress
    const currentTierMin = currentTierInfo.minPoints
    const currentTierMax = currentTierInfo.maxPoints === Infinity
      ? currentTierMin + 50000
      : currentTierInfo.maxPoints
    const progressInTier = totalPointsAfterPurchase - currentTierMin
    const tierRange = currentTierMax - currentTierMin
    const tierProgressPercent = Math.min(100, Math.round((progressInTier / tierRange) * 100))

    return NextResponse.json({
      purchaseAmount,
      pointsEarned: totalPointsEarned,
      basePoints,
      bonusPoints,
      bonusReason: bonusMultiplier > 1 ? `${userTier} tier ${Math.round((bonusMultiplier - 1) * 100)}% bonus` : null,
      currentTier: {
        name: currentTierInfo.name,
        color: currentTierInfo.color,
        discount: currentTierInfo.discount,
        freeShipping: currentTierInfo.freeShipping,
      },
      currentPoints: userPoints,
      totalPointsAfterPurchase,
      nextTier: nextTier ? {
        name: nextTier.name,
        minPoints: nextTier.minPoints,
        pointsToNextTier: nextTier.minPoints - totalPointsAfterPurchase,
        purchasesNeeded: Math.ceil((nextTier.minPoints - totalPointsAfterPurchase) / (purchaseAmount * bonusMultiplier)),
      } : null,
      tierProgressPercent,
      availableRewards,
      rewardsCount: availableRewards.length,
      userName: userName || null,
    })
  } catch (error) {
    console.error('Loyalty calculator error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate loyalty points' },
      { status: 500 }
    )
  }
}
