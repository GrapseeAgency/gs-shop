import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Auto-fill and submit insurance claim
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, issue, damageType, photos } = await req.json()

    // Get purchase details - simplified query
    const order = await prisma.order.findFirst({
      where: {
        userId
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!order) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 })
    }

    // Check warranty status (simplified)
    const purchaseDate = new Date(order.createdAt)
    const warrantyEnd = new Date(purchaseDate.getTime() + 12 * 30 * 24 * 60 * 60 * 1000)
    const inWarranty = warrantyEnd > new Date()

    // Create claim
    const claim = await prisma.insuranceClaim.create({
      data: {
        userId,
        orderId: order.id,
        productId,
        issue,
        damageType,
        photos: JSON.stringify(photos),
        status: inWarranty ? 'approved_auto' : 'pending_review',
        purchaseDate,
        warrantyEnd,
        amount: order.total || 100,
        claimAmount: order.total || 100
      }
    })

    return NextResponse.json({
      success: true,
      claim: {
        id: claim.id,
        status: claim.status,
        amount: claim.amount,
        inWarranty
      },
      product: {
        name: 'Product',
        purchaseDate,
        warrantyEnd
      },
      message: inWarranty
        ? ' Claim auto-approved! Under warranty.'
        : ' Claim submitted for review. Response in 24-48 hours.',
      nextSteps: inWarranty
        ? [
            'Refund/replacement processing',
            'Pickup arranged within 2 days',
            'Refund in 3-5 business days'
          ]
        : [
            'Review in progress',
            'May require additional documentation',
            'Decision within 48 hours'
          ]
    })
  } catch (error) {
    console.error('Insurance claim error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
