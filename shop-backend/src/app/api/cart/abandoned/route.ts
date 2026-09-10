import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Check for abandoned carts
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const abandonedCart = await prisma.abandonedCart.findFirst({
      where: { 
        userId,
        recovered: false,
        emailSent: false
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!abandonedCart) {
      return NextResponse.json({ hasAbandonedCart: false })
    }

    const cartData = JSON.parse(abandonedCart.cartData)
    const hoursAgo = Math.floor((Date.now() - new Date(abandonedCart.createdAt).getTime()) / (1000 * 60 * 60))

    return NextResponse.json({
      hasAbandonedCart: true,
      cartId: abandonedCart.id,
      items: cartData.items || [],
      total: cartData.total || 0,
      hoursAgo,
      canRecover: hoursAgo < 72 // Can recover within 72 hours
    })
  } catch (error) {
    console.error('Abandoned cart fetch error:', error)
    return NextResponse.json({ error: 'Failed to check abandoned cart' }, { status: 500 })
  }
}

// POST - Create abandoned cart record
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { cartData } = await req.json()

    // Check if user already has recent abandoned cart
    const existing = await prisma.abandonedCart.findFirst({
      where: { 
        userId,
        createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60) } // Within last hour
      }
    })

    if (existing) {
      // Update existing
      await prisma.abandonedCart.update({
        where: { id: existing.id },
        data: { 
          cartData: JSON.stringify(cartData),
          emailSent: false,
          remindedAt: null
        }
      })
      return NextResponse.json({ success: true, updated: true })
    }

    // Create new abandoned cart record
    await prisma.abandonedCart.create({
      data: {
        userId,
        cartData: JSON.stringify(cartData),
        emailSent: false,
        smsSent: false,
        recovered: false
      }
    })

    return NextResponse.json({ success: true, created: true })
  } catch (error) {
    console.error('Abandoned cart creation error:', error)
    return NextResponse.json({ error: 'Failed to save abandoned cart' }, { status: 500 })
  }
}

// PUT - Recover abandoned cart
export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { cartId } = await req.json()

    const abandonedCart = await prisma.abandonedCart.findFirst({
      where: { id: cartId, userId }
    })

    if (!abandonedCart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 })
    }

    // Mark as recovered
    await prisma.abandonedCart.update({
      where: { id: cartId },
      data: { recovered: true }
    })

    const cartData = JSON.parse(abandonedCart.cartData)

    return NextResponse.json({
      success: true,
      items: cartData.items || [],
      total: cartData.total || 0
    })
  } catch (error) {
    console.error('Cart recovery error:', error)
    return NextResponse.json({ error: 'Failed to recover cart' }, { status: 500 })
  }
}
