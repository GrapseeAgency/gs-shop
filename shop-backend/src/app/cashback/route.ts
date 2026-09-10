import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get user's cashback earnings
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'all'

    const where: any = { userId }
    if (status !== 'all') {
      where.status = status
    }

    const [cashbackList, wallet] = await Promise.all([
      prisma.cashback.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 50
      }),
      prisma.wallet.findUnique({
        where: { userId },
        select: { cashbackBalance: true }
      })
    ])

    // Calculate totals
    const totalEarned = cashbackList
      .filter(c => c.status !== 'cancelled')
      .reduce((sum, c) => sum + c.amount, 0)
    
    const totalAvailable = cashbackList
      .filter(c => c.status === 'credited')
      .reduce((sum, c) => sum + c.amount, 0)

    const totalUsed = cashbackList
      .filter(c => c.status === 'used')
      .reduce((sum, c) => sum + c.amount, 0)

    return NextResponse.json({
      cashback: cashbackList,
      summary: {
        totalEarned,
        totalAvailable,
        totalUsed,
        currentBalance: wallet?.cashbackBalance || 0
      }
    })
  } catch (error) {
    console.error('Cashback fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch cashback' }, { status: 500 })
  }
}

// POST - Create cashback from order
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId, amount, percentage = 5 } = await req.json()

    // Calculate cashback amount
    const cashbackAmount = (amount * percentage) / 100

    // Create cashback record
    const cashback = await prisma.cashback.create({
      data: {
        userId,
        orderId,
        amount: cashbackAmount,
        percentage,
        status: 'pending',
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days expiry
      }
    })

    return NextResponse.json({
      success: true,
      cashback,
      message: `${percentage}% cashback (${cashbackAmount.toFixed(2)}) will be credited after delivery`
    })
  } catch (error) {
    console.error('Cashback creation error:', error)
    return NextResponse.json({ error: 'Failed to create cashback' }, { status: 500 })
  }
}

// PUT - Credit cashback after order delivery
export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { cashbackId } = await req.json()

    const cashback = await prisma.cashback.findFirst({
      where: { id: cashbackId, userId }
    })

    if (!cashback) {
      return NextResponse.json({ error: 'Cashback not found' }, { status: 404 })
    }

    if (cashback.status !== 'pending') {
      return NextResponse.json({ error: 'Cashback already processed' }, { status: 400 })
    }

    // Get or create wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId }
    })

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId,
          balance: 0,
          cashbackBalance: 0
        }
      })
    }

    // Update cashback status
    await prisma.cashback.update({
      where: { id: cashbackId },
      data: { 
        status: 'credited',
        creditedAt: new Date()
      }
    })

    // Add to wallet cashback balance
    await prisma.wallet.update({
      where: { userId },
      data: { 
        cashbackBalance: { increment: cashback.amount },
        balance: { increment: cashback.amount }
      }
    })

    // Create transaction record
    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'credit',
        amount: cashback.amount,
        description: `Cashback credited for order ${cashback.orderId}`,
        referenceId: cashbackId
      }
    })

    return NextResponse.json({
      success: true,
      amount: cashback.amount,
      message: `Cashback ${cashback.amount.toFixed(2)} credited to your wallet`
    })
  } catch (error) {
    console.error('Cashback credit error:', error)
    return NextResponse.json({ error: 'Failed to credit cashback' }, { status: 500 })
  }
}
