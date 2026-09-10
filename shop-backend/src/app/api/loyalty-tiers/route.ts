import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

const loyaltyTiers = [
  {
    id: 'tier-bronze',
    name: 'Bronze',
    icon: '',
    color: '#CD7F32',
    gradient: 'from-amber-700 to-amber-900',
    pointsThreshold: 0,
    maxPoints: 499,
    commissionBonus: 0,
    benefits: [
      '1x points on all purchases',
      'Access to basic deals',
      'Standard customer support',
      'Birthday bonus: 50 points',
      'Monthly newsletter',
    ],
    perks: [
      { name: 'Points Multiplier', value: '1x', description: 'Standard earning rate' },
      { name: 'Free Shipping', value: 'None', description: 'Standard shipping rates apply' },
      { name: 'Early Access', value: 'No', description: 'Access at regular launch times' },
      { name: 'Support Priority', value: 'Standard', description: 'Normal response times' },
    ],
    badgeStyle: {
      border: 'border-amber-700',
      bg: 'bg-amber-900/20',
      text: 'text-amber-400',
    },
    nextTierPoints: 500,
    nextTierName: 'Silver',
  },
  {
    id: 'tier-silver',
    name: 'Silver',
    icon: '',
    color: '#C0C0C0',
    gradient: 'from-gray-400 to-gray-600',
    pointsThreshold: 500,
    maxPoints: 2499,
    commissionBonus: 2,
    benefits: [
      '1.5x points on all purchases',
      'Access to Silver-only deals',
      'Priority customer support',
      'Birthday bonus: 100 points',
      'Early access to sales (24h)',
      'Free gift wrapping',
    ],
    perks: [
      { name: 'Points Multiplier', value: '1.5x', description: '50% bonus on point earning' },
      { name: 'Free Shipping', value: 'Orders 5000+', description: 'Free shipping on qualifying orders' },
      { name: 'Early Access', value: '24h early', description: 'Access deals 24 hours early' },
      { name: 'Support Priority', value: 'Priority', description: 'Faster response times' },
    ],
    badgeStyle: {
      border: 'border-gray-400',
      bg: 'bg-gray-600/20',
      text: 'text-gray-300',
    },
    nextTierPoints: 2500,
    nextTierName: 'Gold',
  },
  {
    id: 'tier-gold',
    name: 'Gold',
    icon: '',
    color: '#FFD700',
    gradient: 'from-yellow-500 to-amber-600',
    pointsThreshold: 2500,
    maxPoints: 9999,
    commissionBonus: 5,
    benefits: [
      '2x points on all purchases',
      'Access to Gold-only deals',
      'Dedicated support channel',
      'Birthday bonus: 250 points',
      'Early access to sales (48h)',
      'Free gift wrapping + custom message',
      'Quarterly surprise gift',
      'Exclusive webinar access',
    ],
    perks: [
      { name: 'Points Multiplier', value: '2x', description: 'Double points on every purchase' },
      { name: 'Free Shipping', value: 'All orders', description: 'Free shipping with no minimum' },
      { name: 'Early Access', value: '48h early', description: 'Access deals 48 hours early' },
      { name: 'Support Priority', value: 'Dedicated', description: 'Dedicated support channel' },
    ],
    badgeStyle: {
      border: 'border-yellow-500',
      bg: 'bg-yellow-600/20',
      text: 'text-yellow-400',
    },
    nextTierPoints: 10000,
    nextTierName: 'Platinum',
  },
  {
    id: 'tier-platinum',
    name: 'Platinum',
    icon: '',
    color: '#E5E4E2',
    gradient: 'from-slate-300 to-slate-500',
    pointsThreshold: 10000,
    maxPoints: 49999,
    commissionBonus: 8,
    benefits: [
      '3x points on all purchases',
      'Access to Platinum-only deals',
      'Personal account manager',
      'Birthday bonus: 500 points',
      'Early access to sales (72h)',
      'Free express shipping',
      'Monthly surprise gift',
      'VIP event invitations',
      'Price match guarantee',
      'Extended return window (60 days)',
    ],
    perks: [
      { name: 'Points Multiplier', value: '3x', description: 'Triple points on every purchase' },
      { name: 'Free Shipping', value: 'Express', description: 'Free express shipping on all orders' },
      { name: 'Early Access', value: '72h early', description: 'Access deals 72 hours early' },
      { name: 'Support Priority', value: 'Personal Manager', description: 'Dedicated account manager' },
    ],
    badgeStyle: {
      border: 'border-slate-300',
      bg: 'bg-slate-500/20',
      text: 'text-slate-200',
    },
    nextTierPoints: 50000,
    nextTierName: 'Diamond',
  },
  {
    id: 'tier-diamond',
    name: 'Diamond',
    icon: '',
    color: '#B9F2FF',
    gradient: 'from-cyan-300 to-blue-500',
    pointsThreshold: 50000,
    maxPoints: null,
    commissionBonus: 12,
    benefits: [
      '5x points on all purchases',
      'Access to all exclusive deals',
      'Executive concierge service',
      'Birthday bonus: 1000 points',
      'First access to new products',
      'Free same-day delivery',
      'Weekly exclusive offers',
      'Annual retreat invitation',
      'Full price protection',
      'Unlimited extended returns (90 days)',
      'Revenue sharing opportunities',
      'Custom product requests',
      'Co-branding options',
    ],
    perks: [
      { name: 'Points Multiplier', value: '5x', description: '5x points on every purchase' },
      { name: 'Free Shipping', value: 'Same-day', description: 'Free same-day delivery' },
      { name: 'Early Access', value: 'First access', description: 'First to access all new products' },
      { name: 'Support Priority', value: 'Concierge', description: '24/7 executive concierge' },
    ],
    badgeStyle: {
      border: 'border-cyan-300',
      bg: 'bg-cyan-500/20',
      text: 'text-cyan-300',
    },
    nextTierPoints: null,
    nextTierName: null,
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    let userTier = 'bronze'
    let userPoints = 0
    let userTierIndex = 0

    // Fetch user data if userId provided
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { loyaltyTier: true, rewardsPoints: true },
      })
      if (user) {
        userTier = user.loyaltyTier || 'bronze'
        userPoints = user.rewardsPoints || 0
        userTierIndex = loyaltyTiers.findIndex(
          (t) => t.name.toLowerCase() === userTier.toLowerCase()
        )
        if (userTierIndex === -1) userTierIndex = 0
      }
    }

    const currentTier = loyaltyTiers[userTierIndex]
    const nextTier = userTierIndex < loyaltyTiers.length - 1
      ? loyaltyTiers[userTierIndex + 1]
      : null

    // Calculate progress to next tier
    const progressToNext = nextTier
      ? Math.min(
          100,
          Math.round(
            ((userPoints - currentTier.pointsThreshold) /
              (nextTier.pointsThreshold - currentTier.pointsThreshold)) *
              100
          )
        )
      : 100

    // Points needed for next tier
    const pointsToNext = nextTier
      ? Math.max(0, nextTier.pointsThreshold - userPoints)
      : 0

    // Add user-specific data to tiers
    const tiersWithStatus = loyaltyTiers.map((tier, idx) => ({
      ...tier,
      isCurrentTier: idx === userTierIndex,
      isUnlocked: userPoints >= tier.pointsThreshold,
      progressPercent:
        userPoints >= tier.pointsThreshold
          ? 100
          : userPoints >= (loyaltyTiers[idx - 1]?.pointsThreshold || 0)
            ? Math.round(
                ((userPoints - tier.pointsThreshold) /
                  ((loyaltyTiers[idx + 1]?.pointsThreshold || tier.pointsThreshold + 1) -
                    tier.pointsThreshold)) *
                  100
              )
            : 0,
    }))

    return NextResponse.json({
      success: true,
      tiers: tiersWithStatus,
      currentUser: userId
        ? {
            tier: currentTier.name.toLowerCase(),
            tierIndex: userTierIndex,
            points: userPoints,
            progressToNext,
            pointsToNext,
            nextTier: nextTier?.name || null,
            nextTierThreshold: nextTier?.pointsThreshold || null,
            totalBenefits: currentTier.benefits.length,
            commissionBonus: currentTier.commissionBonus,
          }
        : null,
      pointsInfo: {
        earningRate: '1 point per 10 spent',
        bonusEvents: ['Double points weekends', 'Review bonus: 25 points', 'Referral bonus: 100 points'],
        redemptionOptions: [
          { points: 100, reward: '10 discount' },
          { points: 250, reward: '30 discount' },
          { points: 500, reward: '70 discount' },
          { points: 1000, reward: '150 discount' },
          { points: 2500, reward: 'Free product (up to 500)' },
        ],
      },
      meta: {
        title: ' Loyalty Tiers',
        subtitle: 'Earn points, unlock tiers, enjoy exclusive benefits',
        totalTiers: loyaltyTiers.length,
      },
    })
  } catch (error) {
    console.error('[LOYALTY-TIERS] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch loyalty tier information' },
      { status: 500 }
    )
  }
}
