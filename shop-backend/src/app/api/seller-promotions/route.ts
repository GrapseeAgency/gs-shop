import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get seller promotions
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const sellerId = searchParams.get('sellerId') || userId
    const status = searchParams.get('status') || 'active'

    const where: any = { sellerId }
    
    if (status === 'active') {
      where.isActive = true
      where.endAt = { gte: new Date() }
    } else if (status === 'ended') {
      where.endAt = { lt: new Date() }
    }

    const promotions = await prisma.sellerPromotion.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ promotions })
  } catch (error) {
    console.error('Seller promotions fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch promotions' }, { status: 500 })
  }
}

// POST - Create promotion
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      title,
      description,
      type,
      discount,
      productIds,
      startAt,
      endAt
    } = await req.json()

    if (!title || !type || !discount || !productIds || !startAt || !endAt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const promotion = await prisma.sellerPromotion.create({
      data: {
        sellerId: userId,
        title,
        description,
        type, // flash, bundle, clearance
        discount,
        productIds: JSON.stringify(productIds),
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        isActive: true
      }
    })

    return NextResponse.json({ success: true, promotion })
  } catch (error) {
    console.error('Promotion creation error:', error)
    return NextResponse.json({ error: 'Failed to create promotion' }, { status: 500 })
  }
}

// PUT - Update promotion
export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { promotionId, ...updateData } = await req.json()

    // Verify ownership
    const existing = await prisma.sellerPromotion.findFirst({
      where: { id: promotionId, sellerId: userId }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 })
    }

    const promotion = await prisma.sellerPromotion.update({
      where: { id: promotionId },
      data: {
        ...updateData,
        productIds: updateData.productIds ? JSON.stringify(updateData.productIds) : undefined
      }
    })

    return NextResponse.json({ success: true, promotion })
  } catch (error) {
    console.error('Promotion update error:', error)
    return NextResponse.json({ error: 'Failed to update promotion' }, { status: 500 })
  }
}

// DELETE - End promotion
export async function DELETE(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const promotionId = searchParams.get('id')

    if (!promotionId) {
      return NextResponse.json({ error: 'Promotion ID required' }, { status: 400 })
    }

    // Verify ownership and deactivate
    await prisma.sellerPromotion.updateMany({
      where: { id: promotionId, sellerId: userId },
      data: { isActive: false }
    })

    return NextResponse.json({ success: true, message: 'Promotion ended' })
  } catch (error) {
    console.error('Promotion deletion error:', error)
    return NextResponse.json({ error: 'Failed to end promotion' }, { status: 500 })
  }
}
