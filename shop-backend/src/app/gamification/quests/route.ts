import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const QUESTS = [
  {
    id: 'first_purchase',
    title: 'First Steps',
    description: 'Complete your first order',
    requirement: { type: 'orders', count: 1 },
    reward: { points: 50, coupon: 5 }
  },
  {
    id: 'weekend_warrior',
    title: 'Weekend Warrior',
    description: 'Make a purchase on Saturday or Sunday',
    requirement: { type: 'weekend_purchase', count: 1 },
    reward: { points: 25, coupon: 3 }
  },
  {
    id: 'budget_master',
    title: 'Budget Master',
    description: 'Buy 3 items under $50 each',
    requirement: { type: 'budget_items', count: 3, maxPrice: 50 },
    reward: { points: 75, coupon: 10 }
  },
  {
    id: 'category_explorer',
    title: 'Category Explorer',
    description: 'Buy from 3 different categories',
    requirement: { type: 'categories', count: 3 },
    reward: { points: 100, coupon: 15 }
  },
  {
    id: 'review_hero',
    title: 'Review Hero',
    description: 'Leave 5 product reviews',
    requirement: { type: 'reviews', count: 5 },
    reward: { points: 50, badge: 'reviewer' }
  },
  {
    id: 'wishlist_warrior',
    title: 'Wishlist Warrior',
    description: 'Save 10 items to wishlist',
    requirement: { type: 'wishlist', count: 10 },
    reward: { points: 30, coupon: 5 }
  },
  {
    id: 'social_shopper',
    title: 'Social Shopper',
    description: 'Share 3 products on social media',
    requirement: { type: 'shares', count: 3 },
    reward: { points: 40, coupon: 5 }
  },
  {
    id: 'loyal_customer',
    title: 'Loyal Customer',
    description: 'Make 5 orders in one month',
    requirement: { type: 'orders_month', count: 5 },
    reward: { points: 150, badge: 'loyal' }
  }
]

// GET - Get available quests and user progress
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ 
        quests: QUESTS.map(q => ({ ...q, status: 'locked' }))
      })
    }

    // Get user's quest progress
    const progress = await prisma.questProgress.findMany({
      where: { userId }
    })

    // Calculate quest statuses
    const questsWithStatus = QUESTS.map(quest => {
      const userProgress = progress.find(p => p.questId === quest.id)
      
      if (userProgress?.isCompleted) {
        return { ...quest, status: 'completed', completedAt: userProgress.completedAt }
      }

      return {
        ...quest,
        status: userProgress ? 'in_progress' : 'available',
        progress: userProgress?.progress || 0,
        percent: userProgress
          ? Math.min(100, Math.round((userProgress.progress / quest.requirement.count) * 100))
          : 0
      }
    })

    return NextResponse.json({
      quests: questsWithStatus,
      activeQuests: questsWithStatus.filter(q => q.status === 'in_progress'),
      completedToday: questsWithStatus.filter(q => 
        q.status === 'completed' && 
        new Date().toDateString() === new Date().toDateString()
      ).length
    })
  } catch (error) {
    console.error('Quests error:', error)
    return NextResponse.json({ error: 'Failed to load quests' }, { status: 500 })
  }
}

// POST - Update quest progress
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { questId, increment = 1 } = await req.json()

    const quest = QUESTS.find(q => q.id === questId)
    if (!quest) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
    }

    // Get or create progress
    let progress = await prisma.questProgress.findFirst({
      where: { userId, questId }
    })

    if (!progress) {
      progress = await prisma.questProgress.create({
        data: {
          userId,
          questId,
          progress: increment
        }
      })
    } else if (!progress.isCompleted) {
      progress = await prisma.questProgress.update({
        where: { id: progress.id },
        data: { progress: { increment } }
      })
    }

    // Check if completed
    const isCompleted = progress.progress >= quest.requirement.count
    
    if (isCompleted && !progress.isCompleted) {
      await prisma.questProgress.update({
        where: { id: progress.id },
        data: { isCompleted: true, completedAt: new Date() }
      })

      // Award rewards
      await awardQuestRewards(userId, quest)

      return NextResponse.json({
        success: true,
        completed: true,
        quest,
        reward: quest.reward,
        message: `Quest completed: ${quest.title}!`
      })
    }

    return NextResponse.json({
      success: true,
      completed: false,
      progress: progress.progress,
      target: quest.requirement.count,
      percent: Math.round((progress.progress / quest.requirement.count) * 100)
    })
  } catch (error) {
    console.error('Quest update error:', error)
    return NextResponse.json({ error: 'Failed to update quest' }, { status: 500 })
  }
}

async function awardQuestRewards(userId: string, quest: any) {
  // Award points
  if (quest.reward.points) {
    await prisma.user.update({
      where: { id: userId },
      data: { rewardsPoints: { increment: quest.reward.points } }
    })
  }

  // Award coupon
  if (quest.reward.coupon) {
    await prisma.coupon.create({
      data: {
        code: `QUEST-${quest.id.substring(0, 4).toUpperCase()}`,
        discount: quest.reward.coupon,
        discountValue: quest.reward.coupon,
        type: 'percentage',
        maxUses: 1,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    })
  }

  // Award badge
  if (quest.reward.badge) {
    await prisma.userAchievement.create({
      data: {
        userId,
        badgeId: quest.reward.badge,
        badgeName: quest.title,
        badgeIcon: '',
        description: quest.description
      }
    }).catch(() => {}) // Ignore if already has badge
  }
}
