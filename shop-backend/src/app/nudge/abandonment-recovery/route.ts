import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Handle cart abandonment recovery
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { cartId, action } = await req.json()

    if (action === 'record_abandonment') {
      await prisma.cartAbandonment.create({
        data: {
          userId: userId || 'anonymous',
          cartId,
          abandonedAt: new Date(),
          status: 'abandoned'
        }
      }).catch(() => {})

      return NextResponse.json({ recorded: true })
    }

    if (action === 'recover' && userId) {
      // Find abandoned cart
      const abandonment = await prisma.cartAbandonment.findFirst({
        where: {
          userId,
          status: 'abandoned'
        },
        orderBy: { abandonedAt: 'desc' }
      })

      if (!abandonment) {
        return NextResponse.json({ recovered: false, reason: 'no_abandoned_cart' })
      }

      // Get cart items
      const cart = await prisma.cart.findUnique({
        where: { id: abandonment.cartId },
        include: {
          items: {
            include: { product: true }
          }
        }
      })

      if (!cart || cart.items.length === 0) {
        return NextResponse.json({ recovered: false, reason: 'cart_empty' })
      }

      // Calculate incentive
      const daysSince = Math.floor((Date.now() - abandonment.abandonedAt.getTime()) / (1000 * 60 * 60 * 24))
      let incentive = null

      if (daysSince > 3) {
        incentive = {
          type: 'discount',
          value: 10,
          code: `COMEBACK${Math.floor(Math.random() * 1000)}`,
          message: 'We saved your cart! Here\'s 10% off to complete your order.'
        }
      }

      // Update abandonment status
      await prisma.cartAbandonment.update({
        where: { id: abandonment.id },
        data: { status: 'recovered' }
      })

      return NextResponse.json({
        recovered: true,
        cart: {
          items: cart.items,
          total: cart.items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)
        },
        incentive,
        urgency: daysSince > 7 ? 'Stock may be limited' : null
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Abandonment recovery error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// GET - Check for recoverable carts
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ hasRecoverable: false })
    }

    const abandonment = await prisma.cartAbandonment.findFirst({
      where: {
        userId,
        status: 'abandoned',
        abandonedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      orderBy: { abandonedAt: 'desc' }
    })

    return NextResponse.json({
      hasRecoverable: !!abandonment,
      abandonedAt: abandonment?.abandonedAt,
      daysAgo: abandonment ? Math.floor((Date.now() - abandonment.abandonedAt.getTime()) / (1000 * 60 * 60 * 24)) : 0
    })
  } catch (error) {
    console.error('Recovery check error:', error)
    return NextResponse.json({ hasRecoverable: false })
  }
}
