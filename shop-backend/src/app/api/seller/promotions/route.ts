import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-options"
import { prisma } from '@/lib/prisma'

// GET - List seller promotions
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const seller = await prisma.seller.findFirst({
      where: { userId: session.user.id },
      include: {
        promotions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
    }

    return NextResponse.json({ promotions: seller.promotions })
  } catch (error) {
    console.error('Error fetching promotions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch promotions' },
      { status: 500 }
    )
  }
}

// POST - Create new promotion
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const seller = await prisma.seller.findFirst({
      where: { userId: session.user.id },
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      title,
      description,
      type,
      discount,
      productIds,
      startAt,
      endAt,
    } = body

    if (!title || !type || !discount || !startAt || !endAt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate products belong to seller
    if (productIds && productIds.length > 0) {
      const products = await prisma.product.findMany({
        where: {
          id: { in: productIds },
          sellerId: seller.id,
        },
        select: { id: true },
      })

      if (products.length !== productIds.length) {
        return NextResponse.json(
          { error: 'Some products do not belong to you' },
          { status: 400 }
        )
      }
    }

    const promotion = await prisma.sellerPromotion.create({
      data: {
        sellerId: seller.id,
        title,
        description: description || '',
        type, // flash, bundle, clearance
        discount: parseInt(discount),
        productIds: JSON.stringify(productIds || []),
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        isActive: true,
      },
    })

    // Apply discount to products
    if (productIds && productIds.length > 0) {
      await prisma.product.updateMany({
        where: {
          id: { in: productIds },
          sellerId: seller.id,
        },
        data: {
          discount: parseInt(discount),
          isOnSale: true,
        },
      })
    }

    return NextResponse.json({
      success: true,
      promotion,
      message: 'Promotion created successfully',
    })
  } catch (error) {
    console.error('Error creating promotion:', error)
    return NextResponse.json(
      { error: 'Failed to create promotion' },
      { status: 500 }
    )
  }
}

// PUT - Update promotion
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Promotion ID required' }, { status: 400 })
    }

    // Verify promotion belongs to seller
    const seller = await prisma.seller.findFirst({
      where: { userId: session.user.id },
      include: {
        promotions: {
          where: { id },
        },
      },
    })

    if (!seller || seller.promotions.length === 0) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 })
    }

    const promotion = await prisma.sellerPromotion.update({
      where: { id },
      data: {
        title: updateData.title,
        description: updateData.description,
        discount: updateData.discount ? parseInt(updateData.discount) : undefined,
        isActive: updateData.isActive,
        startAt: updateData.startAt ? new Date(updateData.startAt) : undefined,
        endAt: updateData.endAt ? new Date(updateData.endAt) : undefined,
      },
    })

    return NextResponse.json({
      success: true,
      promotion,
      message: 'Promotion updated successfully',
    })
  } catch (error) {
    console.error('Error updating promotion:', error)
    return NextResponse.json(
      { error: 'Failed to update promotion' },
      { status: 500 }
    )
  }
}

// DELETE - Delete promotion
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Promotion ID required' }, { status: 400 })
    }

    // Verify promotion belongs to seller
    const seller = await prisma.seller.findFirst({
      where: { userId: session.user.id },
      include: {
        promotions: {
          where: { id },
        },
      },
    })

    if (!seller || seller.promotions.length === 0) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 })
    }

    // Remove discounts from products
    const promotion = seller.promotions[0]
    const productIds = JSON.parse(promotion.productIds || '[]')
    
    if (productIds.length > 0) {
      await prisma.product.updateMany({
        where: {
          id: { in: productIds },
          sellerId: seller.id,
        },
        data: {
          discount: 0,
          isOnSale: false,
        },
      })
    }

    await prisma.sellerPromotion.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      message: 'Promotion deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting promotion:', error)
    return NextResponse.json(
      { error: 'Failed to delete promotion' },
      { status: 500 }
    )
  }
}
