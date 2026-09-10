import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Create custom bundle
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { items, discountPercent = 10, name } = await req.json()

    if (!items || items.length < 2) {
      return NextResponse.json({ error: 'At least 2 items required' }, { status: 400 })
    }

    // Calculate totals
    let totalPrice = 0
    let originalTotal = 0

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      })
      
      if (product) {
        originalTotal += product.price * item.quantity
      }
    }

    const discount = Math.round(originalTotal * (discountPercent / 100))
    totalPrice = originalTotal - discount

    // Mock bundle
    const bundle = {
      id: 'mock-' + Date.now(),
      userId: userId || null,
      name: name || `Custom Bundle ${Date.now()}`,
      items: JSON.stringify(items),
      originalPrice: originalTotal,
      discountAmount: discount,
      finalPrice: totalPrice,
      discountPercent
    }

    return NextResponse.json({
      success: true,
      bundle: {
        id: bundle.id,
        name: bundle.name,
        items,
        originalPrice: originalTotal,
        discount,
        finalPrice: totalPrice,
        discountPercent,
        savings: discount
      },
      message: `Bundle created! You save ${discount} (${discountPercent}% off)`,
      checkoutUrl: `/checkout?bundle=${bundle.id}`,
      shareUrl: `/bundle/${bundle.id}`
    })
  } catch (error) {
    console.error('Bundle creation error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// GET - Get bundle details
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const bundleId = searchParams.get('bundleId')

    if (!bundleId) {
      // Mock bundles
      return NextResponse.json({ bundles: [] })
    }

    // Mock bundle
    const bundle = { id: bundleId, name: 'Bundle', items: '[]', originalPrice: 0, discountAmount: 0, finalPrice: 0, discountPercent: 10 }

    if (!bundle) {
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 })
    }

    const items = JSON.parse(bundle.items)

    return NextResponse.json({
      bundle: {
        id: bundle.id,
        name: bundle.name,
        items: [],
        originalPrice: bundle.originalPrice,
        discount: bundle.discountAmount,
        finalPrice: bundle.finalPrice,
        discountPercent: bundle.discountPercent
      }
    })
  } catch (error) {
    console.error('Bundle fetch error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
