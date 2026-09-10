import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// GET /api/trade-in
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const userId = searchParams.get('userId')

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        price: { gte: 500 }, // Minimum price for trade-in eligibility
        ...(search ? { name: { contains: search } } : {}),
      },
      take: 20,
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { price: 'desc' },
    })

    const tradeInProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      category: product.category,
      originalPrice: product.price,
      tradeInValues: {
        excellent: Math.round(product.price * 0.6 * 100) / 100,
        good: Math.round(product.price * 0.45 * 100) / 100,
        fair: Math.round(product.price * 0.3 * 100) / 100,
        poor: Math.round(product.price * 0.15 * 100) / 100,
      },
    }))

    // Get user's trade-in history if userId provided
    let userTrades = []
    if (userId) {
      userTrades = await prisma.tradeIn.findMany({
        where: { customerEmail: userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      })
    }

    return NextResponse.json({
      success: true,
      data: tradeInProducts,
      total: tradeInProducts.length,
      userTrades,
      conditions: {
        excellent: { label: 'Like New', description: 'Perfect condition, all accessories included', multiplier: 0.6 },
        good: { label: 'Good', description: 'Minor wear, fully functional', multiplier: 0.45 },
        fair: { label: 'Fair', description: 'Visible wear but works well', multiplier: 0.3 },
        poor: { label: 'Poor', description: 'Significant wear, functional issues', multiplier: 0.15 },
      },
    })
  } catch (error) {
    console.error('Error fetching trade-in products:', error)
    return NextResponse.json({ error: 'Failed to fetch trade-in products' }, { status: 500 })
  }
}

// POST /api/trade-in Submit a trade-in request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id
    const userEmail = (session?.user as any)?.email

    const body = await request.json()
    const { productId, condition, customerName, customerEmail, notes } = body

    if (!productId || !condition) {
      return NextResponse.json({ error: 'Product ID and condition are required' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    })

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

    // Create trade-in record in database
    const tradeIn = await prisma.tradeIn.create({
      data: {
        productName: product.name,
        condition,
        originalPrice: product.price,
        estimatedValue: tradeInValue,
        category: product.category?.name || null,
        customerName: customerName || (session?.user as any)?.name || 'Guest',
        customerEmail: null, // Note: customerEmail doesn't exist in TradeIn schema
        status: 'pending',
        notes: notes || null,
      },
    })

    // Award points for trade-in request
    if (userId) {
      await prisma.rewardTransaction.create({
        data: {
          userId,
          type: 'trade_in_request',
          points: 10,
          description: `Trade-in request submitted for ${product.name}`,
          metadata: JSON.stringify({ tradeInId: tradeIn.id, productId, estimatedValue: tradeInValue }),
        },
      })

      await prisma.user.update({
        where: { id: userId },
        data: { rewardsPoints: { increment: 10 } },
      })
    }

    return NextResponse.json({
      success: true,
      tradeIn: {
        id: tradeIn.id,
        productId: product.id,
        productName: product.name,
        condition,
        tradeInValue,
        originalPrice: product.price,
        creditApplied: tradeInValue,
        status: tradeIn.status,
        createdAt: tradeIn.createdAt,
      },
      quote: {
        tradeInId: tradeIn.id,
        productId: product.id,
        productName: product.name,
        condition,
        tradeInValue,
        originalPrice: product.price,
        creditApplied: tradeInValue,
        expiresAt: new Date(Date.now() + 7 * 24 * 3600000).toISOString(),
      },
      pointsAwarded: userId ? 10 : 0,
      message: 'Trade-in request submitted successfully! Our team will review your item.',
      nextSteps: [
        'Ship your item to our inspection center (free shipping label provided)',
        'Our experts will inspect within 2-3 business days',
        'Credit will be applied to your account upon approval',
        'Credit valid for 90 days on any purchase',
      ],
    })
  } catch (error) {
    console.error('Error creating trade-in:', error)
    return NextResponse.json({ error: 'Failed to create trade-in' }, { status: 500 })
  }
}
