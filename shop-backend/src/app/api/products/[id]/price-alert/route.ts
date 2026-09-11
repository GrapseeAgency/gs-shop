import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from "@/lib/auth-options"

// POST /api/products/[id]/price-alert Create price alert for specific product
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params
    const body = await request.json()
    const { targetPrice, email } = body

    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, price: true },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Use authenticated user's email if available
    const session = await getServerSession(authOptions)
    const userEmail = email || (session?.user as any)?.email

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!targetPrice || targetPrice <= 0) {
      return NextResponse.json(
        { error: 'Valid target price is required' },
        { status: 400 }
      )
    }

    // Check if alert already exists
    const existing = await prisma.priceAlert.findFirst({
      where: {
        productId,
        email: userEmail,
        isActive: true,
      },
    })

    if (existing) {
      // Update existing alert with new target price
      const updated = await prisma.priceAlert.update({
        where: { id: existing.id },
        data: {
          targetPrice,
          currentPrice: product.price,
          isTriggered: product.price <= targetPrice,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Price alert updated',
        data: updated,
      })
    }

    // Create new alert
    const isTriggered = product.price <= targetPrice
    const priceAlert = await prisma.priceAlert.create({
      data: {
        productId,
        productName: product.name,
        targetPrice,
        currentPrice: product.price,
        email: userEmail,
        isTriggered,
      },
    })

    return NextResponse.json({
      success: true,
      message: isTriggered
        ? 'Price alert created! The current price is already at or below your target.'
        : 'Price alert created! We\'ll notify you when the price drops.',
      data: priceAlert,
    }, { status: 201 })
  } catch (error) {
    console.error('[PRODUCT_PRICE_ALERT_ERROR]', error)
    return NextResponse.json(
      { error: 'Failed to create price alert' },
      { status: 500 }
    )
  }
}

// GET /api/products/[id]/price-alert Check if user has price alert for this product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    // Use authenticated user's email if available
    const session = await getServerSession(authOptions)
    const userEmail = email || (session?.user as any)?.email

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const alert = await prisma.priceAlert.findFirst({
      where: {
        productId,
        email: userEmail,
        isActive: true,
      },
    })

    return NextResponse.json({
      hasAlert: !!alert,
      alert: alert || null,
    })
  } catch (error) {
    console.error('[PRODUCT_PRICE_ALERT_GET_ERROR]', error)
    return NextResponse.json(
      { error: 'Failed to check price alert' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[id]/price-alert Remove price alert for this product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    // Use authenticated user's email if available
    const session = await getServerSession(authOptions)
    const userEmail = email || (session?.user as any)?.email

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const alert = await prisma.priceAlert.findFirst({
      where: {
        productId,
        email: userEmail,
        isActive: true,
      },
    })

    if (!alert) {
      return NextResponse.json(
        { error: 'No active alert found' },
        { status: 404 }
      )
    }

    await prisma.priceAlert.delete({
      where: { id: alert.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Price alert removed',
    })
  } catch (error) {
    console.error('[PRODUCT_PRICE_ALERT_DELETE_ERROR]', error)
    return NextResponse.json(
      { error: 'Failed to remove price alert' },
      { status: 500 }
    )
  }
}
