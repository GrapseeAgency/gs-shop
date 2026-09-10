// @ts-nocheck
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

    // Get purchase details
    const order = await prisma.order.findFirst({
      where: {
        customerEmail: userId,
        items: { some: { productId } }
      },
      include: {
        items: { include: { product: true } },
        insurance: true
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!order) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 })
    }

    const item = order.items.find(i => i.productId === productId)
    if (!item) {
      return NextResponse.json({ error: 'Product not in order' }, { status: 404 })
    }

    // Check warranty status
    const purchaseDate = new Date(order.createdAt)
    const warrantyMonths = item.product?.warrantyMonths || 12
    const warrantyEnd = new Date(purchaseDate.getTime() + warrantyMonths * 30 * 24 * 60 * 60 * 1000)
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
        claimAmount: item.price,
        createdAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      claim: {
        id: claim.id,
        status: claim.status,
        amount: claim.claimAmount,
        inWarranty
      },
      product: {
        name: item.product?.name,
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
