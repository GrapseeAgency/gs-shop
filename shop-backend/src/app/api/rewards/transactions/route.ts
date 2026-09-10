import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// Map internal types to frontend types
const TYPE_MAPPING: Record<string, string> = {
  purchase: 'purchase_earn',
  daily_login: 'daily_login',
  referral: 'referral_bonus',
  redemption: 'redemption',
  tier_upgrade: 'tier_upgrade',
  review: 'purchase_earn',
  spin_win: 'purchase_earn',
  manual: 'purchase_earn',
}

interface Transaction {
  id: string
  type: 'purchase_earn' | 'referral_bonus' | 'redemption' | 'tier_upgrade' | 'daily_login'
  points: number
  description: string
  date: string
}

// GET /api/rewards/transactions - Get real transaction history from database
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const sessionUserId = (session?.user as any)?.id

    const { searchParams } = new URL(request.url)
    const queryUserId = searchParams.get('userId')
    const email = searchParams.get('email')

    const targetUserId = sessionUserId || queryUserId

    // Find user
    let userId = targetUserId
    if (!userId && email) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true }
      })
      if (user) userId = user.id
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required or userId/email parameter is required' },
        { status: 401 }
      )
    }

    // Fetch real transactions from database
    const transactions = await prisma.rewardTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to last 100 transactions
    })

    // Map to frontend format
    const mappedTransactions: Transaction[] = transactions.map(tx => ({
      id: tx.id,
      type: (TYPE_MAPPING[tx.type] || 'purchase_earn') as Transaction['type'],
      points: tx.points,
      description: tx.description,
      date: tx.createdAt.toISOString(),
    }))

    // Calculate summary
    const totalEarned = mappedTransactions
      .filter(t => t.points > 0)
      .reduce((sum, t) => sum + t.points, 0)
    const totalRedeemed = Math.abs(
      mappedTransactions
        .filter(t => t.points < 0)
        .reduce((sum, t) => sum + t.points, 0)
    )

    // Get current points from user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { rewardsPoints: true }
    })

    return NextResponse.json({
      data: mappedTransactions,
      summary: {
        totalEarned,
        totalRedeemed,
        currentBalance: user?.rewardsPoints || 0,
      },
    })
  } catch (error) {
    console.error('Error fetching reward transactions:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}

// POST /api/rewards/transactions - Create a new transaction (internal use)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { type, points, description, orderId, metadata } = body

    if (!type || typeof points !== 'number' || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: type, points, description' },
        { status: 400 }
      )
    }

    // Create transaction
    const transaction = await prisma.rewardTransaction.create({
      data: {
        userId,
        type,
        points,
        description,
        orderId: orderId || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      }
    })

    // Update user's points
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        rewardsPoints: { increment: points }
      },
      select: { rewardsPoints: true, loyaltyTier: true }
    })

    // Check for tier upgrade
    const newTier = calculateTier(updatedUser.rewardsPoints)
    if (newTier !== updatedUser.loyaltyTier) {
      await prisma.user.update({
        where: { id: userId },
        data: { loyaltyTier: newTier }
      })

      // Create tier upgrade transaction
      await prisma.rewardTransaction.create({
        data: {
          userId,
          type: 'tier_upgrade',
          points: getTierUpgradeBonus(newTier),
          description: `Upgraded to ${newTier.charAt(0).toUpperCase() + newTier.slice(1)} tier!`,
        }
      })
    }

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        type: TYPE_MAPPING[transaction.type] || 'purchase_earn',
        points: transaction.points,
        description: transaction.description,
        date: transaction.createdAt.toISOString(),
      },
      currentPoints: updatedUser.rewardsPoints,
      currentTier: newTier,
    })
  } catch (error) {
    console.error('Error creating reward transaction:', error)
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}

// Helper functions
function calculateTier(points: number): string {
  if (points >= 5000) return 'diamond'
  if (points >= 2500) return 'platinum'
  if (points >= 1000) return 'gold'
  if (points >= 500) return 'silver'
  return 'bronze'
}

function getTierUpgradeBonus(tier: string): number {
  const bonuses: Record<string, number> = {
    bronze: 0,
    silver: 50,
    gold: 100,
    platinum: 200,
    diamond: 500,
  }
  return bonuses[tier] || 0
}
