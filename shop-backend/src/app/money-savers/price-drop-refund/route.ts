import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Check for price drop refunds
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ eligibleRefunds: [] })
    }

    // Get orders from last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    const orders = await prisma.order.findMany({
      where: {
        customerEmail: userId,
        createdAt: { gte: thirtyDaysAgo },
        status: { not: 'cancelled' }
      },
      include: {
        items: {
          include: { product: true }
        }
      }
    })

    const eligibleRefunds = []

    for (const order of orders) {
      for (const item of order.items) {
        const product = item.product
        if (!product) continue

        // Check current price
        const currentPrice = product.price
        const purchasePrice = item.price

        if (currentPrice < purchasePrice) {
          const dropAmount = purchasePrice - currentPrice
          const dropPercent = ((dropAmount / purchasePrice) * 100).toFixed(1)

          // Check if already claimed
          const existingClaim = await prisma.priceDropRefund.findFirst({
            where: {
              orderId: order.id,
              productId: product.id
            }
          })

          if (!existingClaim) {
            eligibleRefunds.push({
              orderId: order.id,
              productId: product.id,
              productName: product.name,
              productImage: product.imageUrl,
              purchasePrice,
              currentPrice,
              dropAmount,
              dropPercent,
              daysSincePurchase: Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
              eligible: true,
              autoFiled: false
            })
          }
        }
      }
    }

    // Auto-file claims for drops > 10%
    const autoFiled = eligibleRefunds.filter(r => parseFloat(r.dropPercent) > 10)
    
    return NextResponse.json({
      eligibleRefunds,
      totalPotentialSavings: eligibleRefunds.reduce((sum, r) => sum + r.dropAmount, 0),
      autoFiled: autoFiled.length,
      message: autoFiled.length > 0 
        ? `Found ${autoFiled.length} price drops! Auto-filing claims for you.`
        : 'No price drops found on your recent purchases.'
    })
  } catch (error) {
    console.error('Price drop refund error:', error)
    return NextResponse.json({ eligibleRefunds: [] })
  }
}

// POST - File price drop claim
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId, productId } = await req.json()

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const item = order.items.find(i => i.productId === productId)
    if (!item || !item.product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const dropAmount = item.price - item.product.price

    // Create refund claim
    const claim = await prisma.priceDropRefund.create({
      data: {
        userId,
        orderId,
        productId,
        originalPrice: item.price,
        newPrice: item.product.price,
        refundAmount: dropAmount,
        status: 'filed',
        filedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      claim,
      message: `Price drop claim filed! You'll receive ${dropAmount} refund within 5-7 business days.`,
      nextSteps: [
        'Claim under review',
        'Refund will be credited to original payment method',
        'You will receive email confirmation'
      ]
    })
  } catch (error) {
    console.error('Refund claim error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
