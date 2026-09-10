import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const priceAlerts = await db.priceAlert.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: priceAlerts })
  } catch (error) {
    console.error('[PRICE_ALERTS_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch price alerts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, productName, targetPrice, currentPrice, email } = body

    if (!productId || typeof productId !== 'string') {
      return NextResponse.json(
        { error: 'productId is required' },
        { status: 400 }
      )
    }

    if (!productName || typeof productName !== 'string' || !productName.trim()) {
      return NextResponse.json(
        { error: 'productName is required' },
        { status: 400 }
      )
    }

    if (!targetPrice || typeof targetPrice !== 'number' || targetPrice <= 0) {
      return NextResponse.json(
        { error: 'A valid positive targetPrice is required' },
        { status: 400 }
      )
    }

    if (!currentPrice || typeof currentPrice !== 'number' || currentPrice <= 0) {
      return NextResponse.json(
        { error: 'A valid positive currentPrice is required' },
        { status: 400 }
      )
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { error: 'email is required' },
        { status: 400 }
      )
    }

    // Check if alert already exists for this product + email combination
    const existing = await db.priceAlert.findFirst({
      where: {
        productId,
        email: email.trim(),
        isActive: true,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'An active price alert already exists for this product and email' },
        { status: 409 }
      )
    }

    // Check if the current price is already at or below target
    const isTriggered = currentPrice <= targetPrice

    const priceAlert = await db.priceAlert.create({
      data: {
        productId,
        productName: productName.trim(),
        targetPrice,
        currentPrice,
        email: email.trim(),
        isTriggered,
      },
    })

    return NextResponse.json({ data: priceAlert }, { status: 201 })
  } catch (error) {
    console.error('[PRICE_ALERTS_POST]', error)
    return NextResponse.json(
      { error: 'Failed to create price alert' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Price alert id is required' },
        { status: 400 }
      )
    }

    const existing = await db.priceAlert.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Price alert not found' },
        { status: 404 }
      )
    }

    await db.priceAlert.delete({ where: { id } })

    return NextResponse.json({
      data: { id },
      message: 'Price alert deleted successfully',
    })
  } catch (error) {
    console.error('[PRICE_ALERTS_DELETE]', error)
    return NextResponse.json(
      { error: 'Failed to delete price alert' },
      { status: 500 }
    )
  }
}
