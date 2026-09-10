import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Create price lock deposit
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, depositAmount = 100, lockDays = 30 } = await req.json()

    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const lockedPrice = product.price
    const expiryDate = new Date(Date.now() + lockDays * 24 * 60 * 60 * 1000)

    // Create price lock
    const priceLock = await prisma.priceLock.create({
      data: {
        userId,
        productId,
        lockedPrice,
        depositAmount,
        expiresAt: expiryDate,
        isUsed: false
      }
    })

    return NextResponse.json({
      success: true,
      priceLock: {
        id: priceLock.id,
        lockedPrice,
        depositAmount,
        expiryDate,
        daysRemaining: lockDays
      },
      product: {
        id: product.id,
        name: product.name,
        imageUrl: product.imageUrl
      },
      terms: [
        `Price locked at ${lockedPrice} for ${lockDays} days`,
        `Deposit ${depositAmount} (refundable if not purchased)`,
        `Complete purchase anytime before ${expiryDate.toLocaleDateString()}`,
        `If market price increases, you still pay locked price`
      ],
      message: `Price locked! Pay ${depositAmount} now, complete purchase later at ${lockedPrice}.`,
      checkoutUrl: `/checkout?priceLock=${priceLock.id}`
    })
  } catch (error) {
    console.error('Price lock error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// POST - Release or forfeit deposit
export async function PATCH(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { lockId, action } = await req.json()

    const priceLock = await prisma.priceLock.findUnique({
      where: { id: lockId }
    })

    if (!priceLock || priceLock.userId !== userId) {
      return NextResponse.json({ error: 'Lock not found' }, { status: 404 })
    }

    if (action === 'release') {
      // User decided not to buy - refund deposit
      await prisma.priceLock.update({
        where: { id: lockId },
        data: { status: 'released', releasedAt: new Date() }
      })

      return NextResponse.json({
        success: true,
        refundAmount: priceLock.depositAmount,
        message: `Deposit of ${priceLock.depositAmount} will be refunded within 3-5 business days.`
      })
    }

    if (action === 'purchase') {
      // Convert to order
      await prisma.priceLock.update({
        where: { id: lockId },
        data: { status: 'converted', convertedAt: new Date() }
      })

      return NextResponse.json({
        success: true,
        finalPrice: priceLock.lockedPrice,
        message: 'Price lock converted to order! Complete payment to finalize.'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Price lock action error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
