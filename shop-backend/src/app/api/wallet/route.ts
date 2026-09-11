import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-options"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || session?.user?.id

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User authentication required' },
        { status: 401 }
      )
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 50 // Limit to recent transactions
        },
      },
    })

    if (!wallet) {
      // Create wallet if it doesn't exist
      const newWallet = await prisma.wallet.create({
        data: {
          userId,
          balance: 0,
          currency: 'BDT',
        },
        include: {
          transactions: true,
        },
      })
      
      return NextResponse.json({ 
        success: true,
        data: newWallet,
        message: 'New wallet created'
      })
    }

    // Calculate transaction statistics
    const totalTransactions = wallet.transactions.length
    const totalCredits = wallet.transactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0)
    const totalDebits = wallet.transactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0)

    const walletWithStats = {
      ...wallet,
      stats: {
        totalTransactions,
        totalCredits,
        totalDebits,
        netFlow: totalCredits - totalDebits
      }
    }

    return NextResponse.json({ 
      success: true,
      data: walletWithStats 
    })
  } catch (error) {
    console.error('[WALLET_GET]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wallet' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { userId, initialBalance = 0 } = body

    const targetUserId = userId || session?.user?.id

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: 'User authentication required' },
        { status: 401 }
      )
    }

    // Check if wallet already exists for this user
    const existing = await prisma.wallet.findUnique({
      where: { userId: targetUserId },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Wallet already exists for this user' },
        { status: 409 }
      )
    }

    const wallet = await prisma.wallet.create({
      data: {
        userId: targetUserId,
        balance: Math.max(0, initialBalance),
        currency: 'BDT',
      },
    })

    // If initial balance > 0, create a credit transaction
    if (initialBalance > 0) {
      await prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'credit',
          amount: initialBalance,
          description: 'Initial wallet funding'
        }
      })
    }

    return NextResponse.json({ 
      success: true,
      data: wallet,
      message: 'Wallet created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('[WALLET_POST]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create wallet' },
      { status: 500 }
    )
  }
}

// PUT /api/wallet - Update wallet balance
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { amount, type, description } = body

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'User authentication required' },
        { status: 401 }
      )
    }

    if (!amount || !type || !['credit', 'debit'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Valid amount and type (credit/debit) required' },
        { status: 400 }
      )
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id }
    })

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet not found' },
        { status: 404 }
      )
    }

    const newBalance = type === 'credit' 
      ? wallet.balance + amount 
      : Math.max(0, wallet.balance - amount)

    // Update wallet balance
    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: newBalance }
    })

    // Create transaction record
    const transaction = await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type,
        amount,
        description: description || `${type} transaction`
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        wallet: updatedWallet,
        transaction,
        newBalance
      },
      message: `Wallet ${type} of ${amount} processed successfully`
    })
  } catch (error) {
    console.error('[WALLET_PUT]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update wallet' },
      { status: 500 }
    )
  }
}
