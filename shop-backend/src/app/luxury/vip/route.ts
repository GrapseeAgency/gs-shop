import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get VIP status and benefits
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ 
        isVIP: false,
        tier: 'none',
        benefits: []
      })
    }

    // Get user's VIP status
    const vipStatus = await prisma.vIPMembership.findUnique({
      where: { userId }
    })

    // Get user's total spending for tier calculation
    const orders = await prisma.order.findMany({
      where: {
        // customer link would be here
      }
    })
    const totalSpent = orders.reduce((sum, o) => sum + o.total, 0)

    // Determine tier
    let tier = 'none'
    if (totalSpent >= 5000) tier = 'platinum'
    else if (totalSpent >= 2000) tier = 'gold'
    else if (totalSpent >= 500) tier = 'silver'

    const benefits = getBenefitsForTier(tier)

    // Get exclusive products for this tier
    const exclusiveProducts = tier !== 'none' 
      ? await prisma.product.findMany({
          where: { 
            isVIPOnly: true
          },
          take: 8
        })
      : []

    return NextResponse.json({
      isVIP: tier !== 'none',
      tier,
      totalSpent,
      benefits,
      exclusiveProducts,
      nextTier: getNextTier(tier),
      spendToNext: getSpendToNext(tier, totalSpent)
    })
  } catch (error) {
    console.error('VIP status error:', error)
    return NextResponse.json({ error: 'Failed to fetch VIP status' }, { status: 500 })
  }
}

// POST - Access VIP lounge or request concierge
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'VIP access required' }, { status: 403 })
    }

    const { type, message } = await req.json()

    if (type === 'concierge') {
      // Create concierge request
      const request = await prisma.conciergeRequest.create({
        data: {
          userId,
          type: 'concierge',
          details: message,
          message,
          status: 'pending',
          priority: 'normal'
        }
      })

      return NextResponse.json({
        success: true,
        requestId: request.id,
        message: 'Concierge request submitted. You will be contacted shortly.'
      })
    }

    if (type === 'personal_shopper') {
      const request = await prisma.personalShopper.create({
        data: {
          userId,
          aiPersonality: JSON.stringify({ message })
        }
      })

      return NextResponse.json({
        success: true,
        requestId: request.id,
        message: 'Personal shopper assigned. Expect recommendations within 24 hours.'
      })
    }

    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 })
  } catch (error) {
    console.error('VIP request error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}

function getBenefitsForTier(tier: string) {
  const benefits: Record<string, string[]> = {
    'none': [],
    'silver': [
      'Early access to sales',
      'Free standard shipping',
      'Birthday reward'
    ],
    'gold': [
      'Early access to sales',
      'Free express shipping',
      'Birthday reward',
      'Priority customer support',
      'Exclusive product previews'
    ],
    'platinum': [
      'Early access to sales (24h ahead)',
      'Free express shipping + white glove delivery',
      'Premium birthday reward',
      'Instant priority support',
      'Exclusive product access',
      'Personal shopper service',
      'Concierge service',
      'Private shopping events'
    ]
  }
  return benefits[tier] || []
}

function getTierNumber(tier: string) {
  return { none: 0, silver: 1, gold: 2, platinum: 3 }[tier] || 0
}

function getNextTier(tier: string) {
  const next = { none: 'silver', silver: 'gold', gold: 'platinum', platinum: null }
  return next[tier as keyof typeof next]
}

function getSpendToNext(tier: string, currentSpent: number) {
  const thresholds = { none: 500, silver: 2000, gold: 5000, platinum: Infinity }
  const nextThreshold = thresholds[getNextTier(tier) as keyof typeof thresholds] || Infinity
  return Math.max(0, nextThreshold - currentSpent)
}
