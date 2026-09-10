import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const customerEmail = searchParams.get('email')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}
    if (status) where.status = status
    if (customerEmail) where.customerEmail = customerEmail

    let matches = await prisma.priceMatch.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    if (matches.length === 0) {
      matches = [] as any
    }

    const result = matches.map((m: any) => ({
      ...m,
      savings: m.ourPrice - m.competitorPrice,
      savingsPercent: Math.round(((m.ourPrice - m.competitorPrice) / m.ourPrice) * 100),
      matchedPrice: m.status === 'approved' ? m.competitorPrice * 0.95 : null, // 5% below if approved
    }))

    return NextResponse.json({ priceMatches: result, total: result.length })
  } catch (error) {
    console.error('Price match list error:', error)
    return NextResponse.json(
      { priceMatches: [], total: [].length },
      { status: 200 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, productName, ourPrice, competitorPrice, competitorUrl, customerEmail } = body

    if (!productId || !productName || !ourPrice || !competitorPrice || !customerEmail) {
      return NextResponse.json(
        { error: 'productId, productName, ourPrice, competitorPrice, and customerEmail are required' },
        { status: 400 }
      )
    }

    if (competitorPrice >= ourPrice) {
      return NextResponse.json(
        { error: 'Competitor price must be lower than our price to request a price match' },
        { status: 400 }
      )
    }

    const savings = ourPrice - competitorPrice
    const savingsPercent = Math.round((savings / ourPrice) * 100)

    // Check if a pending request already exists for this product + email
    const existing = await prisma.priceMatch.findFirst({
      where: {
        productId,
        customerEmail,
        status: 'pending',
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'You already have a pending price match request for this product', existingId: existing.id },
        { status: 409 }
      )
    }

    const priceMatch = await prisma.priceMatch.create({
      data: {
        productId,
        productName,
        ourPrice,
        competitorPrice,
        competitorUrl: competitorUrl || null,
        customerEmail,
        status: 'pending',
      },
    })

    return NextResponse.json({
      success: true,
      priceMatch: {
        ...priceMatch,
        savings,
        savingsPercent,
        estimatedMatchedPrice: competitorPrice * 0.95, // We'll beat it by 5%
        message: 'Price match request submitted. We\'ll review and respond within 24 hours.',
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Price match create error:', error)
    return NextResponse.json(
      { error: 'Failed to create price match request' },
      { status: 500 }
    )
  }
}
