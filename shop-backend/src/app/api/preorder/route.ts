import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-options"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const userId = searchParams.get('userId') || session?.user?.id
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'))

    // Build where clause
    const whereClause: any = {}
    if (status) whereClause.status = status

    const [preorders, total] = await Promise.all([
      prisma.preorder.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.preorder.count({ where: whereClause })
    ])

    const result = preorders.map((preorder) => {
      const bonusIncluded = typeof preorder.bonusIncluded === 'string'
        ? JSON.parse(preorder.bonusIncluded)
        : preorder.bonusIncluded || []

      const availability = preorder.maxPreorders ? preorder.maxPreorders - preorder.preorderedCount : null
      const depositPercent = Math.round((preorder.depositAmount / preorder.fullPrice) * 100)
      const daysUntilRelease = Math.max(0, Math.ceil(
        (new Date(preorder.estimatedDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ))

      return {
        ...preorder,
        bonusIncluded,
        availability,
        depositPercent,
        daysUntilRelease,
        isAlmostSoldOut: availability !== null && availability <= 10,
        statusLabel: preorder.status.charAt(0).toUpperCase() + preorder.status.slice(1),
        canPreorder: preorder.status === 'open' && (availability === null || availability > 0)
      }
    })

    return NextResponse.json({ 
      success: true,
      data: result,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error('Preorder list error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch preorders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { productId, customerEmail, quantity = 1, userId } = body

    const targetUserId = userId || session?.user?.id

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }

    if (quantity <= 0 || quantity > 10) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be between 1 and 10' },
        { status: 400 }
      )
    }

    // Validate email if provided (required for guest users)
    if (!targetUserId && !customerEmail) {
      return NextResponse.json(
        { success: false, error: 'Email is required for guest users' },
        { status: 400 }
      )
    }

    if (customerEmail) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(customerEmail)) {
        return NextResponse.json(
          { success: false, error: 'Invalid email format' },
          { status: 400 }
        )
      }
    }

    // Find the preorder
    const preorder = await prisma.preorder.findFirst({
      where: { productId, status: 'open' }
    })

    if (!preorder) {
      return NextResponse.json(
        { success: false, error: 'No open preorder found for this product' },
        { status: 404 }
      )
    }

    // Verify product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, isActive: true }
    })

    if (!product || !product.isActive) {
      return NextResponse.json(
        { success: false, error: 'Product is not available for preorder' },
        { status: 400 }
      )
    }

    if (preorder.maxPreorders && preorder.preorderedCount + quantity > preorder.maxPreorders) {
      const available = preorder.maxPreorders - preorder.preorderedCount
      return NextResponse.json(
        { success: false, error: `Only ${available} preorders remaining` },
        { status: 400 }
      )
    }

    // Check if user already preordered this product
    const whereClause: any = { productId, status: 'confirmed' }
    if (targetUserId) whereClause.userId = targetUserId
    if (customerEmail) whereClause.customerEmail = customerEmail

    const existingPreorder = await prisma.preorder.findFirst({
      where: whereClause
    })

    if (existingPreorder) {
      return NextResponse.json(
        { success: false, error: 'You have already preordered this product' },
        { status: 409 }
      )
    }

    // Create user preorder record
    const userPreorder = await prisma.preorder.create({
      data: {
        productId,
        customerEmail: customerEmail || null,
        productName: preorder.productName,
        depositAmount: preorder.depositAmount * quantity,
        fullPrice: preorder.fullPrice * quantity,
        estimatedDate: preorder.estimatedDate,
        bonusIncluded: preorder.bonusIncluded,
        maxPreorders: preorder.maxPreorders,
        status: 'confirmed',
        preorderedCount: quantity
      }
    })

    // Update main preorder count
    await prisma.preorder.update({
      where: { id: preorder.id },
      data: { preorderedCount: preorder.preorderedCount + quantity }
    })

    const bonusIncluded = typeof preorder.bonusIncluded === 'string'
      ? JSON.parse(preorder.bonusIncluded)
      : preorder.bonusIncluded || []

    return NextResponse.json({
      success: true,
      data: {
        id: userPreorder.id,
        productId: userPreorder.productId,
        productName: userPreorder.productName,
        quantity: quantity,
        depositAmount: userPreorder.depositAmount,
        fullPrice: userPreorder.fullPrice,
        estimatedDate: userPreorder.estimatedDate,
        bonusIncluded,
        status: userPreorder.status,
        statusLabel: 'Confirmed',
        message: 'Preorder placed successfully! You will be notified when the product is available.',
        remainingSlots: preorder.maxPreorders ? preorder.maxPreorders - preorder.preorderedCount - quantity : null
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Preorder create error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create preorder' },
      { status: 500 }
    )
  }
}

// PUT /api/preorder - Update preorder status (admin function)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { preorderId, status, newEstimatedDate } = body

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'User authentication required' },
        { status: 401 }
      )
    }

    if (!preorderId || !status) {
      return NextResponse.json(
        { success: false, error: 'Preorder ID and status are required' },
        { status: 400 }
      )
    }

    if (!['open', 'confirmed', 'shipped', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be open, confirmed, shipped, or cancelled' },
        { status: 400 }
      )
    }

    const updateData: any = { status }
    if (newEstimatedDate) updateData.estimatedDate = new Date(newEstimatedDate)
    if (status === 'shipped') updateData.shippedAt = new Date()
    if (status === 'cancelled') updateData.cancelledAt = new Date()

    const updatedPreorder = await prisma.preorder.update({
      where: { id: preorderId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      data: {
        ...updatedPreorder,
        productName: updatedPreorder.productName,
        statusLabel: status.charAt(0).toUpperCase() + status.slice(1)
      },
      message: `Preorder status updated to ${status} successfully`
    })
  } catch (error) {
    console.error('Preorder update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update preorder' },
      { status: 500 }
    )
  }
}
