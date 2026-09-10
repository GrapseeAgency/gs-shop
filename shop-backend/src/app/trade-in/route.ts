import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/trade-in
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(search ? { name: { contains: search } } : {}),
      },
      take: 20,
      include: { category: true },
      orderBy: { price: 'desc' },
    })

    const tradeInProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      category: product.category?.name || 'General',
      originalPrice: product.price,
      tradeInValues: {
        excellent: Math.round(product.price * 0.6 * 100) / 100,
        good: Math.round(product.price * 0.45 * 100) / 100,
        fair: Math.round(product.price * 0.3 * 100) / 100,
        poor: Math.round(product.price * 0.15 * 100) / 100,
      },
    }))

    return NextResponse.json({
      data: tradeInProducts,
      total: tradeInProducts.length,
    })
  } catch (error) {
    console.error('Error fetching trade-in products:', error)
    return NextResponse.json({ error: 'Failed to fetch trade-in products' }, { status: 500 })
  }
}

// POST /api/trade-in Submit a trade-in request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, condition, userId = 'guest' } = body

    if (!productId || !condition) {
      return NextResponse.json({ error: 'Product ID and condition are required' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const multipliers: Record<string, number> = {
      excellent: 0.6,
      good: 0.45,
      fair: 0.3,
      poor: 0.15,
    }

    const multiplier = multipliers[condition] || 0.3
    const tradeInValue = Math.round(product.price * multiplier * 100) / 100

    return NextResponse.json({
      success: true,
      quote: {
        productId: product.id,
        productName: product.name,
        condition,
        tradeInValue,
        originalPrice: product.price,
        creditApplied: tradeInValue,
        quoteId: `TI-${Date.now()}`,
        expiresAt: new Date(Date.now() + 7 * 24 * 3600000).toISOString(),
      },
    })
  } catch (error) {
    console.error('Error creating trade-in:', error)
    return NextResponse.json({ error: 'Failed to create trade-in' }, { status: 500 })
  }
}
