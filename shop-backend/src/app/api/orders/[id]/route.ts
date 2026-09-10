import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// Helper to calculate tier based on points
function calculateTier(points: number): string {
  if (points >= 5000) return 'diamond'
  if (points >= 2500) return 'platinum'
  if (points >= 1000) return 'gold'
  if (points >= 500) return 'silver'
  return 'bronze'
}

// Helper to award points for completed order
async function awardOrderPoints(order: any) {
  if (!order.userId || order.status !== 'completed') return

  // Check if points already awarded for this order
  const existingTransaction = await prisma.rewardTransaction.findFirst({
    where: {
      userId: order.userId,
      orderId: order.id,
      type: 'purchase',
    },
  })

  if (existingTransaction) return // Points already awarded

  // Calculate points: 1 point per 10 spent, minimum 10 points per item
  const itemCount = order.items?.length || 1
  const basePoints = Math.max(Math.floor(order.total / 10), itemCount * 10)

  // Get user's current tier for multiplier
  const user = await prisma.user.findUnique({
    where: { id: order.userId },
    select: { rewardsPoints: true, loyaltyTier: true }
  })

  if (!user) return

  // Apply tier multiplier
  const tierMultipliers: Record<string, number> = {
    bronze: 1,
    silver: 1.5,
    gold: 2,
    platinum: 2.5,
    diamond: 3,
  }
  const multiplier = tierMultipliers[user.loyaltyTier] || 1
  const pointsToAward = Math.floor(basePoints * multiplier)

  // Create reward transaction
  await prisma.rewardTransaction.create({
    data: {
      userId: order.userId,
      type: 'purchase',
      points: pointsToAward,
      description: `Earned ${pointsToAward} points from order #${order.id.slice(-6).toUpperCase()}`,
      orderId: order.id,
      metadata: JSON.stringify({
        orderTotal: order.total,
        itemCount,
        basePoints,
        tier: user.loyaltyTier,
        multiplier,
      }),
    },
  })

  // Update user's points
  const newPoints = user.rewardsPoints + pointsToAward
  const newTier = calculateTier(newPoints)

  await prisma.user.update({
    where: { id: order.userId },
    data: {
      rewardsPoints: newPoints,
      loyaltyTier: newTier,
    },
  })

  // If tier upgraded, create bonus transaction
  if (newTier !== user.loyaltyTier) {
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
          userId: order.userId,
          type: 'tier_upgrade',
          points: bonus,
          description: `Upgraded to ${newTier.charAt(0).toUpperCase() + newTier.slice(1)} tier! Bonus: ${bonus} points`,
          metadata: JSON.stringify({ previousTier: user.loyaltyTier, newTier }),
        },
      })

      // Update points with bonus
      await prisma.user.update({
        where: { id: order.userId },
        data: { rewardsPoints: { increment: bonus } },
      })
    }
  }

  return { pointsAwarded: pointsToAward, newTier: newTier !== user.loyaltyTier ? newTier : null }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: { 
        items: true,
        user: { select: { email: true, name: true } }
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

// PATCH /api/orders/[id] - Update order status (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, trackingNumber, trackingSteps } = body

    // Get current order
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Update order
    const updateData: any = {}
    if (status) updateData.status = status
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber
    if (trackingSteps) updateData.trackingSteps = JSON.stringify(trackingSteps)

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: { items: true },
    })

    // Award points if order is being marked as completed
    let rewardInfo = null
    if (status === 'completed' && order.status !== 'completed') {
      rewardInfo = await awardOrderPoints(updatedOrder)
    }

    return NextResponse.json({
      order: updatedOrder,
      rewardInfo,
    })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}
