import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get warranty tracking for user
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ warranties: [] })
    }

    // Get user's orders with products that have warranties
    const orders = await prisma.order.findMany({
      where: {
        customerEmail: userId,
        status: { not: 'cancelled' }
      },
      include: {
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const warranties = []
    const now = new Date()

    for (const order of orders) {
      for (const item of order.items) {
        const product = item.product
        if (!product) continue

        // Calculate warranty period (default 1 year)
        const warrantyMonths = product.warrantyMonths || 12
        const purchaseDate = new Date(order.createdAt)
        const warrantyEnd = new Date(purchaseDate)
        warrantyEnd.setMonth(warrantyEnd.getMonth() + warrantyMonths)

        const daysLeft = Math.ceil((warrantyEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        const totalDays = warrantyMonths * 30
        const progress = Math.max(0, Math.min(100, (daysLeft / totalDays) * 100))

        warranties.push({
          id: `${order.id}-${item.productId}`,
          productId: item.productId,
          productName: product.name,
          purchaseDate: order.createdAt,
          warrantyEnd: warrantyEnd,
          daysLeft: Math.max(0, daysLeft),
          progress: progress,
          status: daysLeft > 0 ? 'active' : 'expired',
          orderId: order.id,
          warrantyMonths: warrantyMonths,
          imageUrl: product.imageUrl
        })
      }
    }

    // Sort by days left (expiring soon first)
    warranties.sort((a, b) => a.daysLeft - b.daysLeft)

    return NextResponse.json({
      warranties,
      summary: {
        total: warranties.length,
        active: warranties.filter(w => w.status === 'active').length,
        expiringSoon: warranties.filter(w => w.daysLeft <= 30 && w.daysLeft > 0).length,
        expired: warranties.filter(w => w.status === 'expired').length
      }
    })
  } catch (error) {
    console.error('Warranty tracker error:', error)
    return NextResponse.json({ warranties: [] })
  }
}

// POST - Extend warranty
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { warrantyId, extensionMonths } = await req.json()

    // Warranty extension mock
    const extension = {
      id: 'mock-' + Date.now(),
      userId,
      warrantyId,
      extensionMonths,
      price: extensionMonths * 99
    }

    return NextResponse.json({
      success: true,
      message: `Warranty extended by ${extensionMonths} months`,
      newEndDate: new Date(Date.now() + extensionMonths * 30 * 24 * 60 * 60 * 1000)
    })
  } catch (error) {
    console.error('Warranty extension error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
