import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get payout history
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payouts = await prisma.sellerPayout.findMany({
      where: { sellerId: userId },
      orderBy: { requestedAt: 'desc' }
    })

    // Get seller balance
    const seller = await prisma.seller.findUnique({
      where: { id: userId },
      select: { payoutBalance: true, totalEarnings: true }
    })

    // Calculate pending and available
    const pending = payouts
      .filter(p => p.status === 'pending' || p.status === 'processing')
      .reduce((sum, p) => sum + p.amount, 0)

    return NextResponse.json({
      payouts,
      balance: {
        available: (seller?.payoutBalance || 0) - pending,
        pending,
        totalEarnings: seller?.totalEarnings || 0
      }
    })
  } catch (error) {
    console.error('Payout fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch payouts' }, { status: 500 })
  }
}

// POST - Request payout
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, method, accountInfo } = await req.json()

    if (!amount || amount < 50) {
      return NextResponse.json({ error: 'Minimum payout is $50' }, { status: 400 })
    }

    // Get seller
    const seller = await prisma.seller.findUnique({
      where: { id: userId }
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
    }

    // Check available balance
    const pendingPayouts = await prisma.sellerPayout.aggregate({
      where: {
        sellerId: userId,
        status: { in: ['pending', 'processing'] }
      },
      _sum: { amount: true }
    })

    const availableBalance = seller.payoutBalance - (pendingPayouts._sum.amount || 0)

    if (amount > availableBalance) {
      return NextResponse.json({ 
        error: 'Insufficient balance',
        available: availableBalance 
      }, { status: 400 })
    }

    // Create payout request
    const payout = await prisma.sellerPayout.create({
      data: {
        sellerId: userId,
        amount,
        method, // bank, paypal, crypto
        accountInfo,
        status: 'pending'
      }
    })

    return NextResponse.json({
      success: true,
      payout,
      message: `Payout request for $${amount} submitted`
    })
  } catch (error) {
    console.error('Payout request error:', error)
    return NextResponse.json({ error: 'Failed to request payout' }, { status: 500 })
  }
}
