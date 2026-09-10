// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const REWARDS = [
  { type: 'points', value: 10, probability: 30, label: '10 Points' },
  { type: 'points', value: 25, probability: 20, label: '25 Points' },
  { type: 'points', value: 50, probability: 15, label: '50 Points' },
  { type: 'points', value: 100, probability: 5, label: '100 Points' },
  { type: 'coupon', value: 5, probability: 15, label: '5% Off' },
  { type: 'coupon', value: 10, probability: 10, label: '10% Off' },
  { type: 'coupon', value: 20, probability: 3, label: '20% Off' },
  { type: 'free_shipping', value: 1, probability: 1, label: 'Free Shipping' },
  { type: 'jackpot', value: 500, probability: 1, label: '500 Points!' }
]

// GET - Get available scratch card
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get('orderId')

    // Check for existing unscratched card
    const existing = await prisma.scratchCard.findFirst({
      where: {
        userId,
        isScratched: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (existing) {
      return NextResponse.json({
        hasCard: true,
        cardId: existing.id,
        expiresAt: existing.expiresAt,
        orderId: existing.orderId
      })
    }

    // Create new card if orderId provided
    if (orderId) {
      // Check if card already created for this order
      const orderCard = await prisma.scratchCard.findFirst({
        where: { userId, orderId }
      })

      if (orderCard) {
        return NextResponse.json({
          hasCard: !orderCard.isScratched && new Date(orderCard.expiresAt) > new Date(),
          cardId: orderCard.id,
          isScratched: orderCard.isScratched,
          expiresAt: orderCard.expiresAt
        })
      }

      // Generate random reward
      const reward = selectRandomReward()
      
      const card = await prisma.scratchCard.create({
        data: {
          userId,
          orderId,
          rewardType: reward.type,
          rewardValue: reward.value,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }
      })

      return NextResponse.json({
        hasCard: true,
        cardId: card.id,
        expiresAt: card.expiresAt,
        orderId
      })
    }

    return NextResponse.json({ hasCard: false })
  } catch (error) {
    console.error('Scratch card fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch scratch card' }, { status: 500 })
  }
}

// POST - Scratch the card
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { cardId } = await req.json()

    const card = await prisma.scratchCard.findFirst({
      where: { id: cardId, userId }
    })

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    if (card.isScratched) {
      return NextResponse.json({ error: 'Already scratched' }, { status: 400 })
    }

    if (new Date(card.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Card expired' }, { status: 400 })
    }

    // Mark as scratched
    await prisma.scratchCard.update({
      where: { id: cardId },
      data: {
        isScratched: true,
        scratchedAt: new Date()
      }
    })

    // Process reward
    let reward = {
      type: card.rewardType,
      value: card.rewardValue
    }

    let couponCode = null

    if (card.rewardType === 'points') {
      await prisma.user.update({
        where: { id: userId },
        data: { rewardsPoints: { increment: card.rewardValue } }
      })
    } else if (card.rewardType === 'coupon') {
      
      await prisma.coupon.create({
        data: {
          code: couponCode,
          discount: card.rewardValue,
          type: 'percentage',
          maxUses: 1,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      })
    } else if (card.rewardType === 'free_shipping') {
      
      await prisma.coupon.create({
        data: {
          code: couponCode,
          discount: 100,
          type: 'fixed',
          maxUses: 1,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      })
    }

    return NextResponse.json({
      success: true,
      reward,
      couponCode,
      message: getRewardMessage(reward)
    })
  } catch (error) {
    console.error('Scratch card error:', error)
    return NextResponse.json({ error: 'Failed to scratch card' }, { status: 500 })
  }
}

// Helper to select random reward based on probability
function selectRandomReward() {
  const totalProbability = REWARDS.reduce((sum, r) => sum + r.probability, 0)
  
  for (const reward of REWARDS) {
    random -= reward.probability
    if (random <= 0) {
      return reward
    }
  }
  
  return REWARDS[0]
}

function getRewardMessage(reward: { type: string; value: number }) {
  const messages: Record<string, string> = {
    points: `You won ${reward.value} points!`,
    coupon: ` ${reward.value}% off coupon unlocked!`,
    free_shipping: ' Free shipping coupon unlocked!',
    jackpot: ' JACKPOT! 500 points!'
  }
  return messages[reward.type] || 'You won a reward!'
}
