import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Check for safety recalls on purchased products
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ recalls: [] })
    }

    // Get user's purchase history
    const orders = await prisma.order.findMany({
      where: {
        customerEmail: userId,
        status: { not: 'cancelled' }
      },
      include: {
        items: { include: { product: true } }
      }
    })

    const purchasedProductIds = orders.flatMap(o => 
      o.items.map(i => i.productId)
    )

    // Check for recalls
    const recalls = await prisma.productRecall.findMany({
      where: {
        productId: { in: purchasedProductIds },
        isActive: true
      },
      orderBy: { issuedAt: 'desc' }
    })

    // Fetch products separately
    const productIds = recalls.map(r => r.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true }
    })
    const productMap = new Map(products.map(p => [p.id, p]))

    return NextResponse.json({
      recalls: recalls.map(r => {
        const product = productMap.get(r.productId)
        return {
          id: r.id,
          product: {
            id: r.productId,
            name: product?.name || 'Unknown Product'
          },
          reason: r.reason,
          severity: r.severity,
          action: r.action,
          issuedAt: r.issuedAt,
          refundEligible: r.refundEligible,
          replacementEligible: r.replacementEligible,
          message: r.severity === 'critical'
            ? ` CRITICAL: Stop using ${product?.name || 'this product'} immediately!`
            : ` Safety recall issued for ${product?.name || 'this product'}. ${r.action}`
        }
      }),
      totalRecalls: recalls.length,
      criticalRecalls: recalls.filter(r => r.severity === 'critical').length,
      actionsNeeded: recalls.length,
      autoRefundInitiated: recalls.filter(r => r.refundEligible).length
    })
  } catch (error) {
    console.error('Safety recall error:', error)
    return NextResponse.json({ recalls: [] })
  }
}

// POST - Report a recall notice seen
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { recallId, action } = await req.json()

    await prisma.recallResponse.create({
      data: {
        userId: userId || 'anonymous',
        recallId,
        response: action // 'returned', 'disposed', 'ignored'
      }
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: action === 'returned'
        ? 'Return initiated. Refund will be processed.'
        : 'Thank you for confirming. Stay safe!'
    })
  } catch (error) {
    console.error('Recall response error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
