import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-options"
import { prisma } from '@/lib/prisma'

// GET - Get payout balance and history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Find seller
    const seller = await prisma.seller.findFirst({
      where: { userId: session.user.id }
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
    }

    // Calculate pending revenue (from completed orders not yet paid out)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Get seller's product IDs
    const sellerProducts = await prisma.product.findMany({
      where: { sellerId: seller.id },
      select: { id: true },
    })
    const sellerProductIds = sellerProducts.map(p => p.id)

    const recentOrders = await prisma.order.findMany({
      where: {
        status: { in: ['completed', 'delivered'] },
        createdAt: { gte: thirtyDaysAgo },
        items: {
          some: {
            productId: { in: sellerProductIds },
          },
        },
      },
      include: {
        items: {
          where: {
            productId: { in: sellerProductIds },
          },
          select: {
            price: true,
            quantity: true,
          },
        },
      },
    })

    // Calculate available balance
    let pendingRevenue = 0
    recentOrders.forEach(order => {
      order.items.forEach(item => {
        pendingRevenue += item.price * item.quantity
      })
    })

    // Subtract commission
    const commissionRate = seller.commissionRate || 10
    const availableBalance = seller.payoutBalance || 0
    const pendingBalance = pendingRevenue * (1 - commissionRate / 100)

    return NextResponse.json({
      balance: {
        available: availableBalance,
        pending: pendingBalance,
        totalEarnings: seller.totalEarnings || 0,
        commissionRate,
        minPayoutAmount: seller.minPayoutAmount || 50,
        autoPayoutEnabled: seller.autoPayoutEnabled || false,
      },
      payouts: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0
      },
    })
  } catch (error) {
    console.error('Error fetching payouts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payouts' },
      { status: 500 }
    )
  }
}

// POST - Request a payout
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const seller = await prisma.seller.findFirst({
      where: { userId: session.user.id },
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
    }

    const body = await request.json()
    const { amount, method = 'bank_transfer' } = body

    // Validate amount
    const payoutAmount = parseFloat(amount)
    if (!payoutAmount || payoutAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid payout amount' },
        { status: 400 }
      )
    }

    // Check minimum payout
    const minAmount = seller.minPayoutAmount || 50
    if (payoutAmount < minAmount) {
      return NextResponse.json(
        { error: `Minimum payout amount is ${minAmount}` },
        { status: 400 }
      )
    }

    // Check available balance
    const availableBalance = seller.payoutBalance || 0
    if (payoutAmount > availableBalance) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      )
    }

    // Calculate commission and fees
    const commissionRate = seller.commissionRate || 10
    const commissionDeducted = payoutAmount * (commissionRate / 100)
    const fees = 0 // Platform fee (could be added)
    const netAmount = payoutAmount - commissionDeducted - fees

    // Create payout record
    const payout = await prisma.sellerPayout.create({
      data: {
        sellerId: seller.id,
        amount: netAmount,
        method,
        status: 'pending',
      },
    })

    // Deduct from seller balance
    await prisma.seller.update({
      where: { id: seller.id },
      data: {
        payoutBalance: { decrement: payoutAmount },
      },
    })

    return NextResponse.json({
      success: true,
      payout,
      message: 'Payout requested successfully',
    })
  } catch (error) {
    console.error('Error creating payout:', error)
    return NextResponse.json(
      { error: 'Failed to create payout' },
      { status: 500 }
    )
  }
}

// PUT - Update payout settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const seller = await prisma.seller.findFirst({
      where: { userId: session.user.id },
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      minPayoutAmount,
      autoPayoutEnabled,
      bankAccountName,
      bankAccountNumber,
      bankRoutingNumber,
      paypalEmail,
    } = body

    // Update seller payout settings
    const updatedSeller = await prisma.seller.update({
      where: { id: seller.id },
      data: {
        minPayoutAmount: minPayoutAmount !== undefined ? parseFloat(minPayoutAmount) : undefined,
        autoPayoutEnabled: autoPayoutEnabled !== undefined ? autoPayoutEnabled : undefined,
        bankAccountName: bankAccountName !== undefined ? bankAccountName : undefined,
        bankAccountNumber: bankAccountNumber !== undefined ? bankAccountNumber : undefined,
        bankRoutingNumber: bankRoutingNumber !== undefined ? bankRoutingNumber : undefined,
        paypalEmail: paypalEmail !== undefined ? paypalEmail : undefined,
      },
    })

    return NextResponse.json({
      success: true,
      settings: {
        minPayoutAmount: updatedSeller.minPayoutAmount,
        autoPayoutEnabled: updatedSeller.autoPayoutEnabled,
        hasBankAccount: !!updatedSeller.bankAccountNumber,
        hasPaypal: !!updatedSeller.paypalEmail,
      },
      message: 'Payout settings updated successfully',
    })
  } catch (error) {
    console.error('Error updating payout settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
