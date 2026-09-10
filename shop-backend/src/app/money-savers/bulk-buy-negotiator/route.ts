import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Create bulk buy request for price negotiation
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, quantity, targetPrice } = await req.json()

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { seller: true }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Get all sellers offering similar products
    const competingSellers = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: productId },
        isActive: true
      },
      include: { seller: true },
      take: 10
    })

    const uniqueSellers = [...new Map(competingSellers.map(p => [p.sellerId, p.seller])).values()]

    // Mock bulk request
    const bulkRequest = {
      id: 'mock-' + Date.now(),
      userId,
      productId,
      quantity,
      targetPrice,
      status: 'pending',
      createdAt: new Date()
    }

    // Notify sellers
    const sellerNotifications = uniqueSellers.map(seller => ({
      sellerId: seller.id,
      requestId: bulkRequest.id,
      message: `${quantity} buyers want ${product.name}. Best price wins!`,
      currentPrice: product.price,
      requestedPrice: targetPrice
    }))

    return NextResponse.json({
      success: true,
      request: bulkRequest,
      product: {
        id: product.id,
        name: product.name,
        currentPrice: product.price
      },
      competingSellers: uniqueSellers.length,
      sellerNotifications,
      message: `Bulk request sent to ${uniqueSellers.length} sellers! They'll compete for your order.`,
      estimatedSavings: Math.round((product.price - targetPrice) * quantity),
      eta: 'Responses within 24 hours'
    })
  } catch (error) {
    console.error('Bulk buy error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// GET - Get responses for bulk buy request
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const requestId = searchParams.get('requestId')

    if (!requestId) {
      return NextResponse.json({ error: 'Request ID required' }, { status: 400 })
    }

    // Mock responses
    const responses: any[] = []

    return NextResponse.json({
      responses,
      totalResponses: 0,
      bestOffer: null,
      recommendation: 'Waiting for seller responses...'
    })
  } catch (error) {
    console.error('Bulk responses error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
