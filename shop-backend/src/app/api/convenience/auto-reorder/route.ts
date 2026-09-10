// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get user's auto-reorder subscriptions
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      include: {
        product: {
          select: { id: true, name: true, imageUrl: true, price: true }
        }
      },
      orderBy: { nextOrderDate: 'asc' }
    })

    return NextResponse.json({
      subscriptions,
      upcoming: subscriptions.filter(s => {
        const days = Math.ceil((new Date(s.nextOrderDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        return days <= 7
      })
    })
  } catch (error) {
    console.error('Auto-reorder error:', error)
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
  }
}

// POST - Create auto-reorder
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, frequency, quantity, startDate } = await req.json()

    // Validate product
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Calculate next order date
    const nextDate = new Date(startDate || Date.now())
    const days = parseInt(frequency) // days
    nextDate.setDate(nextDate.getDate() + days)

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        productId,
        frequency: days,
        frequencyUnit: 'days',
        quantity: quantity || 1,
        nextOrderDate: nextDate,
        status: 'active'
      }
    })

    return NextResponse.json({
      success: true,
      subscription,
      message: `Auto-reorder set up! Next delivery: ${nextDate.toLocaleDateString()}`
    })
  } catch (error) {
    console.error('Auto-reorder creation error:', error)
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
  }
}

// PUT - Update or pause subscription
export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { subscriptionId, action, frequency, quantity } = await req.json()

    if (action === 'pause') {
      await prisma.subscription.update({
        where: { id: subscriptionId, userId },
        data: { status: 'paused' }
      })
      return NextResponse.json({ success: true, message: 'Subscription paused' })
    }

    if (action === 'resume') {
      await prisma.subscription.update({
        where: { id: subscriptionId, userId },
        data: { status: 'active' }
      })
      return NextResponse.json({ success: true, message: 'Subscription resumed' })
    }

    if (action === 'update') {
      const update: any = {}
      if (frequency) {
        update.frequency = parseInt(frequency)
        // Recalculate next date
        const sub = await prisma.subscription.findUnique({
          where: { id: subscriptionId }
        })
        if (sub) {
          const nextDate = new Date()
          nextDate.setDate(nextDate.getDate() + parseInt(frequency))
          update.nextOrderDate = nextDate
        }
      }
      if (quantity) update.quantity = quantity

      await prisma.subscription.update({
        where: { id: subscriptionId, userId },
        data: update
      })
      return NextResponse.json({ success: true, message: 'Subscription updated' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Subscription update error:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

// DELETE - Cancel subscription
export async function DELETE(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const subscriptionId = searchParams.get('id')

    if (!subscriptionId) {
      return NextResponse.json({ error: 'Subscription ID required' }, { status: 400 })
    }

    await prisma.subscription.update({
      where: { id: subscriptionId, userId },
      data: { status: 'cancelled' }
    })

    return NextResponse.json({ success: true, message: 'Subscription cancelled' })
  } catch (error) {
    console.error('Subscription cancellation error:', error)
    return NextResponse.json({ error: 'Failed to cancel' }, { status: 500 })
  }
}
