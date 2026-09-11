import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from "@/lib/auth-options"

// GET /api/orders List orders for authenticated user
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from session
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to view your orders.' },
        { status: 401 }
      )
    }

    // Get orders for the authenticated user using userId
    const orders = await db.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
      },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// POST /api/orders Create a new order
export async function POST(request: Request) {
  try {
    // Get authenticated user from session
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    const body = await request.json()
    const {
      customerName,
      customerEmail,
      customerPhone,
      paymentMethod,
      couponCode,
      discount,
      discountAmount,
      shippingCost,
      notes,
      shippingAddress,
      items,
    } = body

    const resolvedDiscount = discount ?? discountAmount ?? 0

    if (!customerName || !customerEmail || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: customerName, customerEmail, and items are required' },
        { status: 400 }
      )
    }

    const subtotal = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    )
    const total = subtotal - (resolvedDiscount || 0) + (shippingCost || 0)

    const order = await db.order.create({
      data: {
        userId, // Link order to authenticated user (can be null for guest orders)
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        paymentMethod: paymentMethod || null,
        couponCode: couponCode || null,
        discount: resolvedDiscount,
        notes: notes || null,
        shippingAddress: shippingAddress || null,
        total,
        status: 'pending',
        items: {
          create: items.map(
            (item: { productId: string; productName: string; price: number; quantity: number; imageUrl?: string }) => ({
              productId: item.productId,
              productName: item.productName,
              price: item.price,
              quantity: item.quantity,
              imageUrl: item.imageUrl || null,
            })
          ),
        },
      },
      include: { items: true },
    })

    // If coupon was used, increment usage count
    if (couponCode) {
      await db.coupon.updateMany({
        where: { code: couponCode },
        data: { usedCount: { increment: 1 } },
      })
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
