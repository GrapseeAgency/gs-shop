import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-options"

// GET - Get user's cashback earnings
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId') || session?.user?.id
    const status = searchParams.get('status') || 'all'
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'))

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User authentication required' 
      }, { status: 401 })
    }

    const where: any = { userId }
    if (status !== 'all') {
      where.status = status
    }

    const [cashbackList, wallet, total] = await Promise.all([
      prisma.cashback.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.wallet.findUnique({
        where: { userId },
        select: { balance: true }
      }),
      prisma.cashback.count({ where })
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
      success: true,
      data: cashbackList,
      summary: {
        totalEarned,
        totalAvailable,
        totalUsed,
        currentBalance: wallet?.balance || 0
      },
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error('Cashback fetch error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch cashback' 
    }, { status: 500 })
  }
}

// POST - Create cashback from order
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()
    const { userId, orderId, amount, percentage = 5 } = body

    const targetUserId = userId || session?.user?.id

    if (!targetUserId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User authentication required' 
      }, { status: 401 })
    }

    if (!orderId || !amount) {
      return NextResponse.json({ 
        success: false, 
        error: 'Order ID and amount are required' 
      }, { status: 400 })
    }

    // Verify order exists and belongs to user
    const order = await prisma.order.findFirst({
      where: { 
        id: orderId,
        customerEmail: targetUserId 
      }
    })

    if (!order) {
      return NextResponse.json({ 
        success: false, 
        error: 'Order not found or access denied' 
      }, { status: 404 })
    }

    // Check if cashback already exists for this order
    const existingCashback = await prisma.cashback.findFirst({
      where: { orderId }
    })

    if (existingCashback) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cashback already created for this order' 
      }, { status: 409 })
    }

    // Calculate cashback amount
    const cashbackAmount = (amount * percentage) / 100

    // Create cashback record
    const cashback = await prisma.cashback.create({
      data: {
        userId: targetUserId,
        orderId,
        amount: cashbackAmount,
        percentage,
        status: 'pending',
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days expiry
      }
    })

    return NextResponse.json({
      success: true,
      data: cashback,
      message: `${percentage}% cashback (${cashbackAmount.toFixed(2)}) will be credited after delivery`
    })
  } catch (error) {
    console.error('Cashback creation error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create cashback' 
    }, { status: 500 })
  }
}

// PUT - Credit cashback after order delivery
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()
    const { userId, cashbackId } = body

    const targetUserId = userId || session?.user?.id

    if (!targetUserId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User authentication required' 
      }, { status: 401 })
    }

    if (!cashbackId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cashback ID required' 
      }, { status: 400 })
    }

    const cashback = await prisma.cashback.findFirst({
      where: { id: cashbackId, userId: targetUserId }
    })

    if (!cashback) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cashback not found' 
      }, { status: 404 })
    }

    if (cashback.status !== 'pending') {
      return NextResponse.json({ 
        success: false, 
        error: 'Cashback already processed' 
      }, { status: 400 })
    }

    // Get or create wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId: targetUserId }
    })

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: targetUserId,
          balance: 0,
          currency: 'BDT'
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

    // Add to wallet balance
    await prisma.wallet.update({
      where: { userId: targetUserId },
      data: { 
        balance: { increment: cashback.amount }
      }
    })

    // Create transaction record
    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'credit',
        amount: cashback.amount,
        description: `Cashback credited for order ${cashback.orderId}`
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        amount: cashback.amount,
        newBalance: wallet.balance + cashback.amount
      },
      message: `Cashback ${cashback.amount.toFixed(2)} credited to your wallet`
    })
  } catch (error) {
    console.error('Cashback credit error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to credit cashback' 
    }, { status: 500 })
  }
}
