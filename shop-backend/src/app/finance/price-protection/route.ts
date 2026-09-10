import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Submit price protection claim
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId, competitorUrl, competitorPrice, proofImage } = await req.json()

    // Verify order is within 7 days
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const daysSinceOrder = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    if (daysSinceOrder > 7) {
      return NextResponse.json({ 
        error: 'Price protection expired',
        message: 'Claims must be submitted within 7 days of purchase'
      }, { status: 400 })
    }

    // Calculate refund amount
    const ourPrice = order.total
    const refundAmount = Math.max(0, ourPrice - competitorPrice)

    if (refundAmount <= 0) {
      return NextResponse.json({ 
        error: 'Competitor price is not lower',
        ourPrice,
        competitorPrice
      }, { status: 400 })
    }

    // Create claim
    const claim = await prisma.priceProtectionClaim.create({
      data: {
        userId,
        orderId,
        productId: orderId,
        oldPrice: ourPrice,
        newPrice: competitorPrice,
        refundAmount,
        status: 'pending'
      }
    })

    return NextResponse.json({
      success: true,
      claimId: claim.id,
      refundAmount,
      message: `Price protection claim submitted! Potential refund: $${refundAmount.toFixed(2)}`,
      timeline: 'Review typically takes 2-3 business days'
    })
  } catch (error) {
    console.error('Price protection error:', error)
    return NextResponse.json({ error: 'Failed to submit claim' }, { status: 500 })
  }
}

// GET - Get user's price protection claims
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const claims = await prisma.priceProtectionClaim.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    const stats = {
      totalClaims: claims.length,
      approved: claims.filter(c => c.status === 'approved').length,
      pending: claims.filter(c => c.status === 'pending').length,
      totalRefunded: claims
        .filter(c => c.status === 'approved')
        .reduce((sum, c) => sum + c.refundAmount, 0)
    }

    return NextResponse.json({ claims, stats })
  } catch (error) {
    console.error('Price protection fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch claims' }, { status: 500 })
  }
}

// PUT - Admin: Approve or reject claim
export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    
    // Check admin
    const user = await prisma.user.findUnique({
      where: { id: userId || '' },
      select: { role: true }
    })

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { claimId, status, notes } = await req.json()

    const claim = await prisma.priceProtectionClaim.update({
      where: { id: claimId },
      data: { status, adminNotes: notes, reviewedAt: new Date() }
    })

    // If approved, credit wallet
    if (status === 'approved') {
      const wallet = await prisma.wallet.findUnique({
        where: { userId: claim.userId }
      })

      if (wallet) {
        await prisma.wallet.update({
          where: { userId: claim.userId },
          data: { balance: { increment: claim.refundAmount } }
        })

        await prisma.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: 'credit',
            amount: claim.refundAmount,
            description: `Price protection refund for order #${claim.orderId.slice(-6)}`
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      claim,
      message: `Claim ${status}`
    })
  } catch (error) {
    console.error('Price protection review error:', error)
    return NextResponse.json({ error: 'Failed to update claim' }, { status: 500 })
  }
}
