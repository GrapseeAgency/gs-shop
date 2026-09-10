import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get escrow status for order
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    const escrow = await prisma.escrowTransaction.findUnique({
      where: { orderId }
    })

    const order = escrow ? await prisma.order.findUnique({
      where: { id: escrow.orderId },
      select: { id: true, total: true, status: true, createdAt: true }
    }) : null

    if (!escrow) {
      return NextResponse.json({ 
        exists: false,
        message: 'No escrow for this order'
      })
    }

    return NextResponse.json({
      exists: true,
      escrow: {
        id: escrow.id,
        amount: escrow.amount,
        status: escrow.status,
        createdAt: escrow.createdAt,
        releasedAt: escrow.releasedAt,
        refundedAt: escrow.refundedAt,
        order
      },
      isBuyer: escrow.buyerId === userId,
      isSeller: escrow.sellerId === userId,
      canRelease: escrow.status === 'held' && escrow.buyerId === userId,
      canDispute: escrow.status === 'held' && 
        new Date(escrow.createdAt).getTime() + (7 * 24 * 60 * 60 * 1000) > Date.now()
    })
  } catch (error) {
    console.error('Escrow fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch escrow' }, { status: 500 })
  }
}

// POST - Create escrow (auto-created on high-value orders)
export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json()

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Only create escrow for high-value orders (>$100)
    if (order.total < 100) {
      return NextResponse.json({ 
        escrowNotRequired: true,
        message: 'Escrow only for orders over $100'
      })
    }

    // Check if already exists
    const existing = await prisma.escrowTransaction.findUnique({
      where: { orderId }
    })

    if (existing) {
      return NextResponse.json({ 
        exists: true,
        escrow: existing
      })
    }

    // Get seller from first item's product
    const firstItem = order.items[0]
    const sellerId = firstItem?.product?.sellerId || 'unknown'

    const escrow = await prisma.escrowTransaction.create({
      data: {
        orderId,
        buyerId: order.customerEmail, // Would be userId in real app
        sellerId,
        amount: order.total,
        status: 'held',
        holdUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    })

    return NextResponse.json({
      success: true,
      escrow,
      message: `Payment of $${order.total} held in escrow until delivery confirmation`
    })
  } catch (error) {
    console.error('Escrow creation error:', error)
    return NextResponse.json({ error: 'Failed to create escrow' }, { status: 500 })
  }
}

// PUT - Release or dispute escrow
export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { escrowId, action, reason } = await req.json()

    const escrow = await prisma.escrowTransaction.findUnique({
      where: { id: escrowId }
    })

    if (!escrow) {
      return NextResponse.json({ error: 'Escrow not found' }, { status: 404 })
    }

    if (action === 'release') {
      // Only buyer can release
      if (escrow.buyerId !== userId) {
        return NextResponse.json({ error: 'Only buyer can release' }, { status: 403 })
      }

      await prisma.escrowTransaction.update({
        where: { id: escrowId },
        data: { 
          status: 'released',
          releasedAt: new Date()
        }
      })

      // Credit seller
      const sellerWallet = await prisma.wallet.findUnique({
        where: { userId: escrow.sellerId }
      })

      if (sellerWallet) {
        await prisma.wallet.update({
          where: { userId: escrow.sellerId },
          data: { balance: { increment: escrow.amount } }
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Payment released to seller. Thank you for confirming!'
      })
    }

    if (action === 'dispute') {
      await prisma.escrowTransaction.update({
        where: { id: escrowId },
        data: { 
          status: 'disputed',
          disputeReason: reason,
          disputedAt: new Date()
        }
      })

      // Create dispute case
      await prisma.disputeCase.create({
        data: {
          escrowId,
          orderId: escrow.orderId,
          buyerId: escrow.buyerId,
          sellerId: escrow.sellerId,
          reason,
          status: 'open'
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Dispute filed. Our team will review within 24 hours.'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Escrow action error:', error)
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 })
  }
}
