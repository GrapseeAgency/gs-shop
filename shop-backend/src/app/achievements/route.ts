import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

const ACHIEVEMENTS = [
  {
    id: 'first_purchase',
    name: 'First Steps',
    description: 'Complete your first order',
    icon: '',
    points: 50,
    category: 'orders',
    requirement: { type: 'orders', count: 1 }
  },
  {
    id: 'shopaholic',
    name: 'Shopaholic',
    description: 'Place 10 orders',
    icon: '',
    points: 200,
    category: 'orders',
    requirement: { type: 'orders', count: 10 }
  },
  {
    id: 'big_spender',
    name: 'Big Spender',
    description: 'Spend over $1,000',
    icon: '',
    points: 300,
    category: 'orders',
    requirement: { type: 'spend', amount: 1000 }
  },
  {
    id: 'first_review',
    name: 'Voice Heard',
    description: 'Write your first review',
    icon: '',
    points: 50,
    category: 'reviews',
    requirement: { type: 'reviews', count: 1 }
  },
  {
    id: 'reviewer',
    name: 'Top Reviewer',
    description: 'Write 10 reviews',
    icon: '',
    points: 200,
    category: 'reviews',
    requirement: { type: 'reviews', count: 10 }
  },
  {
    id: 'wishlist_warrior',
    name: 'Wishlist Warrior',
    description: 'Save 20 items to wishlist',
    icon: '',
    points: 100,
    category: 'wishlist',
    requirement: { type: 'wishlist', count: 20 }
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: '7-day check-in streak',
    icon: '',
    points: 100,
    category: 'streak',
    requirement: { type: 'streak', days: 7 }
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: '30-day check-in streak',
    icon: '',
    points: 500,
    category: 'streak',
    requirement: { type: 'streak', days: 30 }
  },
  {
    id: 'referral_1',
    name: 'Friend Inviter',
    description: 'Refer your first friend',
    icon: '',
    points: 100,
    category: 'referral',
    requirement: { type: 'referrals', count: 1 }
  },
  {
    id: 'referral_5',
    name: 'Community Builder',
    description: 'Refer 5 friends',
    icon: '',
    points: 500,
    category: 'referral',
    requirement: { type: 'referrals', count: 5 }
  },
  {
    id: 'spin_winner',
    name: 'Lucky Spin',
    description: 'Win on Spin the Wheel',
    icon: '',
    points: 50,
    category: 'games',
    requirement: { type: 'spin_win', count: 1 }
  },
  {
    id: 'cart_saver',
    name: 'Smart Saver',
    description: 'Use Save for Later 5 times',
    icon: '',
    points: 75,
    category: 'cart',
    requirement: { type: 'save_later', count: 5 }
  },
  {
    id: 'price_watcher',
    name: 'Price Watcher',
    description: 'Set 3 price alerts',
    icon: '',
    points: 100,
    category: 'alerts',
    requirement: { type: 'price_alerts', count: 3 }
  },
  {
    id: 'loyalty_bronze',
    name: 'Bronze Member',
    description: 'Reach Bronze tier',
    icon: '',
    points: 100,
    category: 'loyalty',
    requirement: { type: 'tier', tier: 'bronze' }
  },
  {
    id: 'loyalty_gold',
    name: 'Gold Member',
    description: 'Reach Gold tier',
    icon: '',
    points: 500,
    category: 'loyalty',
    requirement: { type: 'tier', tier: 'gold' }
  },
  {
    id: 'loyalty_diamond',
    name: 'Diamond Elite',
    description: 'Reach Diamond tier',
    icon: '',
    points: 2000,
    category: 'loyalty',
    requirement: { type: 'tier', tier: 'diamond' }
  }
]

// GET - Get user achievements
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get unlocked achievements
    const unlocked = await prisma.userAchievement.findMany({
      where: { userId },
      orderBy: { unlockedAt: 'desc' }
    })

    const unlockedIds = new Set(unlocked.map(a => a.badgeId))

    // Calculate progress for locked achievements
    const achievementsWithProgress = await Promise.all(ACHIEVEMENTS.map(async achievement => {
      const isUnlocked = unlockedIds.has(achievement.id)
      const unlockedData = unlocked.find(a => a.badgeId === achievement.id)

      return {
        ...achievement,
        unlocked: isUnlocked,
        unlockedAt: unlockedData?.unlockedAt || null,
        progress: isUnlocked ? 100 : await calculateProgress(userId, achievement)
      }
    }))

    // Stats
    const totalPoints = unlocked.reduce((sum, a) => sum + (ACHIEVEMENTS.find(ach => ach.id === a.badgeId)?.points || 0), 0)

    return NextResponse.json({
      achievements: achievementsWithProgress,
      stats: {
        total: ACHIEVEMENTS.length,
        unlocked: unlocked.length,
        locked: ACHIEVEMENTS.length - unlocked.length,
        totalPoints,
        nextAchievement: achievementsWithProgress.find(a => !a.unlocked && a.progress > 50)
      }
    })
  } catch (error) {
    console.error('Achievements fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 })
  }
}

// Helper function to calculate real progress based on actual user data
async function calculateProgress(userId: string, achievement: typeof ACHIEVEMENTS[0]): Promise<number> {
  const req = achievement.requirement

  try {
    switch (req.type) {
      case 'orders': {
        const orderCount = await prisma.order.count({
          where: { userId, status: { not: 'cancelled' } }
        })
        const target = req.count ?? 1
        return Math.min(100, Math.round((orderCount / target) * 100))
      }

      case 'spend': {
        const orders = await prisma.order.findMany({
          where: { userId, status: { not: 'cancelled' } },
          select: { total: true }
        })
        const totalSpend = orders.reduce((sum, o) => sum + o.total, 0)
        const target = req.amount ?? 1000
        return Math.min(100, Math.round((totalSpend / target) * 100))
      }

      case 'reviews': {
        const reviewCount = await prisma.review.count({
          where: { userId }
        })
        const target = req.count ?? 1
        return Math.min(100, Math.round((reviewCount / target) * 100))
      }

      case 'wishlist': {
        // Count wishlist boards for the user (productIds stored as JSON array in each board)
        const wishlistBoards = await prisma.wishlistBoard.findMany({
          where: { userId }
        })
        // Count total products across all wishlist boards
        const wishlistCount = wishlistBoards.reduce((total, board) => {
          try {
            const products = JSON.parse(board.productIds || '[]') as string[]
            return total + products.length
          } catch {
            return total
          }
        }, 0)
        const target = req.count ?? 20
        return Math.min(100, Math.round((wishlistCount / target) * 100))
      }

      case 'streak': {
        // Check-in streak - get from user streak data
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { currentStreak: true }
        })
        const currentStreak = user?.currentStreak || 0
        const target = req.days ?? 7
        return Math.min(100, Math.round((currentStreak / target) * 100))
      }

      case 'referrals': {
        // Look up the user's referral code, then count completed referrals by that code
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { referralCode: true }
        })
        const referralCount = user?.referralCode
          ? await prisma.referral.count({
              where: { referrerCode: user.referralCode, status: 'completed' }
            })
          : 0
        const target = req.count ?? 1
        return Math.min(100, Math.round((referralCount / target) * 100))
      }

      case 'spin_win': {
        // Check if user has any spin prize wins from UserSpinRecord
        const winCount = await prisma.userSpinRecord.count({
          where: {
            userId,
            won: true
          }
        })
        return winCount > 0 ? 100 : 0
      }

      case 'tier': {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { loyaltyTier: true }
        })
        const currentTier = user?.loyaltyTier || 'bronze'
        const targetTier = req.tier || 'bronze'

        const tierLevels: Record<string, number> = {
          bronze: 1,
          silver: 2,
          gold: 3,
          platinum: 4,
          diamond: 5
        }

        const currentLevel = tierLevels[currentTier] || 1
        const targetLevel = tierLevels[targetTier] || 1

        return currentLevel >= targetLevel ? 100 : Math.round((currentLevel / targetLevel) * 100)
      }

      default:
        return 0
    }
  } catch (error) {
    console.error('Error calculating progress for achievement:', achievement.id, error)
    return 0
  }
}

// POST - Check and unlock achievements
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { eventType, data } = await req.json()

    // Get already unlocked
    const unlocked = await prisma.userAchievement.findMany({
      where: { userId },
      select: { badgeId: true }
    })
    const unlockedIds = new Set(unlocked.map(a => a.badgeId))

    // Check for new unlocks
    const newUnlocks: Array<(typeof ACHIEVEMENTS)[number] & { unlockedAt: Date }> = []
    let totalPoints = 0

    for (const achievement of ACHIEVEMENTS) {
      if (unlockedIds.has(achievement.id)) continue

      // Check if criteria met
      const shouldUnlock = checkAchievementCriteria(achievement, eventType, data)

      if (shouldUnlock) {
        const created = await prisma.userAchievement.create({
          data: {
            userId,
            badgeId: achievement.id,
            badgeName: achievement.name,
            badgeIcon: achievement.icon,
            description: achievement.description
          }
        })
        newUnlocks.push({ ...achievement, unlockedAt: created.unlockedAt })
        totalPoints += achievement.points
      }
    }

    // Award points
    if (totalPoints > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { rewardsPoints: { increment: totalPoints } }
      })
    }

    return NextResponse.json({
      newUnlocks,
      pointsEarned: totalPoints,
      message: newUnlocks.length > 0 
        ? `Unlocked ${newUnlocks.length} achievement${newUnlocks.length > 1 ? 's' : ''}! +${totalPoints} points!`
        : 'No new achievements'
    })
  } catch (error) {
    console.error('Achievement check error:', error)
    return NextResponse.json({ error: 'Failed to check achievements' }, { status: 500 })
  }
}

function checkAchievementCriteria(achievement: typeof ACHIEVEMENTS[0], eventType: string, data: any): boolean {
  const req = achievement.requirement

  switch (req.type) {
    case 'orders':
      return eventType === 'order_complete' && data.orderCount >= (req.count ?? 0)
    case 'reviews':
      return eventType === 'review_posted' && data.reviewCount >= (req.count ?? 0)
    case 'wishlist':
      return eventType === 'wishlist_add' && data.wishlistCount >= (req.count ?? 0)
    case 'streak':
      return eventType === 'checkin' && data.streak >= (req.days ?? 0)
    case 'referrals':
      return eventType === 'referral_complete' && data.referralCount >= (req.count ?? 0)
    case 'spin_win':
      return eventType === 'spin_win'
    case 'spend':
      return eventType === 'order_complete' && data.totalSpend >= (req.amount ?? 0)
    case 'tier':
      return eventType === 'tier_up' && data.tier === req.tier
    default:
      return false
  }
}
