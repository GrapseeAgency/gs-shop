import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-options"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const customerEmail = searchParams.get('email')
    const userId = searchParams.get('userId') || session?.user?.id
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'))

    // Build where clause
    const whereClause: any = {}
    if (status) whereClause.status = status
    if (customerEmail) whereClause.customerEmail = customerEmail
    if (userId) whereClause.userId = userId

    const [matches, total] = await Promise.all([
      prisma.priceMatch.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.priceMatch.count({ where: whereClause })
    ])

    const result = matches.map((match) => {
      const savings = match.ourPrice - match.competitorPrice
      const savingsPercent = Math.round((savings / match.ourPrice) * 100)
      const matchedPrice = match.status === 'approved' ? match.competitorPrice * 0.95 : null // 5% below if approved

      return {
        ...match,
        savings,
        savingsPercent,
        matchedPrice,
        finalPrice: match.status === 'approved' ? matchedPrice : match.ourPrice,
        statusLabel: match.status.charAt(0).toUpperCase() + match.status.slice(1),
        canAppeal: match.status === 'rejected' && !match.appealedAt
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
    console.error('Price match list error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch price match requests' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { productId, competitorPrice, competitorUrl, customerEmail, userId } = body

    const targetUserId = userId || session?.user?.id

    if (!productId || !competitorPrice) {
      return NextResponse.json(
        { success: false, error: 'Product ID and competitor price are required' },
        { status: 400 }
      )
    }

    // Validate competitor price is positive
    if (competitorPrice <= 0) {
      return NextResponse.json(
        { success: false, error: 'Competitor price must be greater than 0' },
        { status: 400 }
      )
    }

    // Verify product exists and get current price
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, price: true, isActive: true }
    })

    if (!product || !product.isActive) {
      return NextResponse.json(
        { success: false, error: 'Product not found or not available' },
        { status: 404 }
      )
    }

    const ourPrice = product.price

    if (competitorPrice >= ourPrice) {
      return NextResponse.json(
        { success: false, error: 'Competitor price must be lower than our price to request a price match' },
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

    // Check if a pending request already exists for this product + user/email
    const whereClause: any = { productId, status: 'pending' }
    if (targetUserId) whereClause.userId = targetUserId
    if (customerEmail) whereClause.customerEmail = customerEmail

    const existing = await prisma.priceMatch.findFirst({
      where: whereClause,
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'You already have a pending price match request for this product', existingId: existing.id },
        { status: 409 }
      )
    }

    const savings = ourPrice - competitorPrice
    const savingsPercent = Math.round((savings / ourPrice) * 100)
    const estimatedMatchedPrice = competitorPrice * 0.95 // We'll beat it by 5%

    const priceMatch = await prisma.priceMatch.create({
      data: {
        productId,
        productName: 'Unknown Product',
        userId: targetUserId || null,
        customerEmail: customerEmail || 'guest@example.com',
        ourPrice,
        competitorPrice,
        competitorUrl: competitorUrl || null
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...priceMatch,
        productName: product.name,
        savings,
        savingsPercent,
        estimatedMatchedPrice,
        finalPrice: ourPrice, // Current price until approved
        statusLabel: 'Pending',
        message: 'Price match request submitted. We\'ll review and respond within 24 hours.',
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Price match create error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create price match request' },
      { status: 500 }
    )
  }
}

// PUT /api/price-match - Update price match status (admin function)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { priceMatchId, status, adminNotes } = body

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'User authentication required' },
        { status: 401 }
      )
    }

    if (!priceMatchId || !status) {
      return NextResponse.json(
        { success: false, error: 'Price match ID and status are required' },
        { status: 400 }
      )
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be pending, approved, or rejected' },
        { status: 400 }
      )
    }

    const priceMatch = await prisma.priceMatch.findUnique({
      where: { id: priceMatchId }
    })

    if (!priceMatch) {
      return NextResponse.json(
        { success: false, error: 'Price match request not found' },
        { status: 404 }
      )
    }

    const updateData: any = { status }
    if (adminNotes) updateData.adminNotes = adminNotes
    if (status === 'approved') {
      updateData.approvedAt = new Date()
      updateData.matchedPrice = priceMatch.competitorPrice * 0.95
    } else if (status === 'rejected') {
      updateData.rejectedAt = new Date()
    }

    const updatedPriceMatch = await prisma.priceMatch.update({
      where: { id: priceMatchId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      data: {
        ...updatedPriceMatch,
        productName: priceMatch.productName,
        statusLabel: status.charAt(0).toUpperCase() + status.slice(1)
      },
      message: `Price match request ${status} successfully`
    })
  } catch (error) {
    console.error('Price match update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update price match request' },
      { status: 500 }
    )
  }
}
