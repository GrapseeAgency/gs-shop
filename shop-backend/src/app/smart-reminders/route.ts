import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get smart reminders for user
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ reminders: [] })
    }

    // Get user's orders
    const orders = await prisma.order.findMany({
      where: {
        // user link
      },
      include: {
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    const reminders = []

    // Check for reorder reminders based on product cycles
    for (const order of orders) {
      for (const item of order.items) {
        const daysSinceOrder = Math.floor(
          (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        )

        // Product-specific cycles - fetch category separately
        const category = item.product?.categoryId ? await prisma.category.findUnique({
          where: { id: item.product.categoryId }
        }) : null
        const cycleDays = getProductCycle(category?.name)
        
        if (cycleDays && daysSinceOrder >= cycleDays - 3) {
          reminders.push({
            type: 'reorder',
            priority: daysSinceOrder >= cycleDays ? 'high' : 'medium',
            product: item.product,
            orderId: order.id,
            daysSinceOrder,
            message: `You bought ${item.product?.name} ${daysSinceOrder} days ago. Time to restock?`,
            action: 'reorder',
            actionLabel: 'Reorder Now'
          })
        }
      }
    }

    // Check for abandoned carts
    const abandonedCart = await prisma.abandonedCart.findFirst({
      where: {
        userId,
        createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }
    })

    if (abandonedCart) {
      reminders.push({
        type: 'abandoned_cart',
        priority: 'high',
        message: 'You left items in your cart. Complete your order before they sell out!',
        action: 'view_cart',
        actionLabel: 'View Cart'
      })
    }

    // Wishlist price drops - fetch products separately
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId }
    })
    const productIds = wishlistItems.map(w => w.productId)
    const wishlistProducts = await prisma.product.findMany({
      where: { id: { in: productIds } }
    })
    const productMap = new Map(wishlistProducts.map(p => [p.id, p]))

    for (const item of wishlistItems) {
      const product = productMap.get(item.productId)
      if (!product) continue

      const priceHistory = await prisma.priceHistory.findFirst({
        where: { productId: item.productId },
        orderBy: { recordedAt: 'desc' }
      })

      if (priceHistory && priceHistory.price < product.price) {
        const drop = product.price - priceHistory.price
        reminders.push({
          type: 'price_drop',
          priority: 'high',
          product: product,
          message: `${product.name} dropped by $${drop.toFixed(2)}!`,
          action: 'buy_now',
          actionLabel: 'Buy Now'
        })
      }
    }

    // Sort by priority
    reminders.sort((a, b) => {
      const priority = { high: 0, medium: 1, low: 2 }
      return priority[a.priority] - priority[b.priority]
    })

    return NextResponse.json({
      reminders: reminders.slice(0, 10),
      totalCount: reminders.length,
      highPriority: reminders.filter(r => r.priority === 'high').length
    })
  } catch (error) {
    console.error('Smart reminders error:', error)
    return NextResponse.json({ reminders: [] })
  }
}

// POST - Mark reminder as done/dismissed
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reminderType, action, productId } = await req.json()

    // Log the action (reminderAction model doesn't exist, skip for now)
    // TODO: Create reminderAction model or use different logging approach

    // Handle specific actions
    if (action === 'reorder' && productId) {
      // Add to cart or create quick order
      return NextResponse.json({
        success: true,
        redirect: `/product/${productId}?reorder=true`,
        message: 'Taking you to quick reorder'
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Reminder dismissed'
    })
  } catch (error) {
    console.error('Reminder action error:', error)
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 })
  }
}

function getProductCycle(category?: string) {
  const cycles: Record<string, number> = {
    'Skincare': 30,
    'Makeup': 90,
    'Hair Care': 60,
    'Vitamins': 30,
    'Food': 14,
    'Coffee': 30,
    'Tea': 30,
    'Paper Products': 30,
    'Cleaning': 60,
    'Pet Food': 30
  }
  return cycles[category || ''] || null
}
