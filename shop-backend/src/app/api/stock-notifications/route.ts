import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const productId = searchParams.get('productId')
    const isNotified = searchParams.get('isNotified')
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'))

    // Build where clause
    const whereClause: any = {}
    if (email) whereClause.email = email
    if (productId) whereClause.productId = productId
    if (isNotified !== null && isNotified !== undefined) {
      whereClause.isNotified = isNotified === 'true'
    }

    const [notifications, total] = await Promise.all([
      prisma.stockNotification.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.stockNotification.count({ where: whereClause })
    ])

    const result = notifications.map((notification) => ({
      ...notification,
      statusLabel: notification.isNotified ? 'Notified' : 'Waiting',
      productAvailable: null // Cannot determine without stock field in Product model
    }))

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
    console.error('Stock notification list error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock notifications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { productId, email } = body

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, isActive: true }
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Validate email is required
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if already subscribed
    const whereClause: any = { productId, isNotified: false }
    if (email) whereClause.email = email

    const existing = await prisma.stockNotification.findFirst({
      where: whereClause,
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'You are already subscribed to notifications for this product', existingId: existing.id },
        { status: 409 }
      )
    }

    const notification = await prisma.stockNotification.create({
      data: {
        productId,
        productName: product.name,
        email: email || '',
        isNotified: false,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...notification,
        productName: product.name,
        statusLabel: 'Waiting',
        message: 'You will be notified when this product is back in stock.',
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Stock notification create error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create stock notification' },
      { status: 500 }
    )
  }
}

// PUT /api/stock-notifications - Update notification status
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { notificationId, isNotified } = body

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'User authentication required' },
        { status: 401 }
      )
    }

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: 'Notification ID is required' },
        { status: 400 }
      )
    }

    const notification = await prisma.stockNotification.findUnique({
      where: { id: notificationId },
    })

    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      )
    }

    const updatedNotification = await prisma.stockNotification.update({
      where: { id: notificationId },
      data: { 
        isNotified: isNotified !== undefined ? isNotified : true,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...updatedNotification,
        productName: notification.productName,
        statusLabel: updatedNotification.isNotified ? 'Notified' : 'Waiting'
      }
    })
  } catch (error) {
    console.error('Stock notification update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update stock notification' },
      { status: 500 }
    )
  }
}

// DELETE /api/stock-notifications - Delete notification
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const notificationId = searchParams.get('notificationId')

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: 'Notification ID is required' },
        { status: 400 }
      )
    }

    const notification = await prisma.stockNotification.findUnique({
      where: { id: notificationId }
    })

    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Notification not found or access denied' },
        { status: 404 }
      )
    }

    await prisma.stockNotification.delete({
      where: { id: notificationId }
    })

    return NextResponse.json({
      success: true,
      message: 'Stock notification deleted successfully'
    })
  } catch (error) {
    console.error('Stock notification delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete stock notification' },
      { status: 500 }
    )
  }
}
