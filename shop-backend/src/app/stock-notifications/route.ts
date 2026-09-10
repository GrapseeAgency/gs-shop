import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const productId = searchParams.get('productId')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}
    if (email) where.email = email
    if (productId) where.productId = productId

    let notifications = await prisma.stockNotification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    if (notifications.length === 0 && !email && !productId) {
      notifications = [] as any
    }

    const result = notifications.map((n: any) => ({
      ...n,
      statusLabel: n.isNotified ? 'Notified' : 'Waiting',
    }))

    return NextResponse.json({ notifications: result, total: result.length })
  } catch (error) {
    console.error('Stock notification list error:', error)
    return NextResponse.json(
      { notifications: [], total: [].length },
      { status: 200 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, productName, email } = body

    if (!productId || !productName || !email) {
      return NextResponse.json(
        { error: 'productId, productName, and email are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if already subscribed
    const existing = await prisma.stockNotification.findFirst({
      where: { productId, email, isNotified: false },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'You are already subscribed to notifications for this product', existingId: existing.id },
        { status: 409 }
      )
    }

    const notification = await prisma.stockNotification.create({
      data: {
        productId,
        productName,
        email,
        isNotified: false,
      },
    })

    return NextResponse.json({
      success: true,
      notification: {
        ...notification,
        statusLabel: 'Waiting',
        message: 'You will be notified when this product is back in stock.',
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Stock notification create error:', error)
    return NextResponse.json(
      { error: 'Failed to create stock notification' },
      { status: 500 }
    )
  }
}
