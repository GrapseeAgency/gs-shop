import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-options"
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: orderId } = await params
    const body = await request.json()
    const { trackingNumber, carrier } = body

    // Find seller
    const seller = await prisma.seller.findFirst({
      where: { userId: session.user.id },
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
    }

    // Get seller's product IDs
    const sellerProducts = await prisma.product.findMany({
      where: { sellerId: seller.id },
      select: { id: true },
    })
    const sellerProductIds = sellerProducts.map(p => p.id)

    // Find order
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        items: {
          some: {
            productId: { in: sellerProductIds },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'shipped',
        trackingNumber,
      },
    })

    // Create notification for customer
    await prisma.notification.create({
      data: {
        userId: order.userId,
        type: 'order',
        title: 'Order Shipped',
        message: `Your order #${orderId.slice(-8)} has been shipped${trackingNumber ? ` via ${carrier}. Tracking: ${trackingNumber}` : ''}.`,
        linkUrl: `/orders/${orderId}`,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Order marked as shipped',
    })
  } catch (error) {
    console.error('Error fulfilling order:', error)
    return NextResponse.json(
      { error: 'Failed to fulfill order' },
      { status: 500 }
    )
  }
}
