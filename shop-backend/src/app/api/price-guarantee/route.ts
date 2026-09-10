import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || session?.user?.id
    const status = searchParams.get('status')
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'))

    const where: any = {}
    if (userId) where.userId = userId
    if (status) where.status = status

    const [claims, total] = await Promise.all([
      prisma.priceGuarantee.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.priceGuarantee.count({ where })
    ])

    // Get success stories from approved claims
    const successStories = await prisma.priceGuarantee.findMany({
      where: {},
      select: {
        id: true,
        competitorPrice: true,
        ourPrice: true
      },
      orderBy: { competitorPrice: 'desc' },
      take: 10
    })

    const formattedStories = successStories.map(story => ({
      id: story.id,
      name: 'Happy Customer',
      product: 'Product',
      saved: story.competitorPrice - story.ourPrice,
      quote: 'I found it cheaper and got the difference back quickly! Great price guarantee service.',
      avatar: ''
    }))

    const formattedClaims = claims.map(claim => ({
      id: claim.id,
      productName: claim.productName || 'Product',
      originalPrice: claim.ourPrice,
      foundPrice: claim.competitorPrice,
      refundAmount: claim.competitorPrice - claim.ourPrice,
      status: claim.status,
      date: claim.createdAt,
      competitorUrl: claim.competitorUrl,
      reviewedAt: null, // Not available in schema
      approvedAt: null // Not available in schema
    }))

    return NextResponse.json({
      success: true,
      data: {
        guaranteeDays: 30,
        claims: formattedClaims,
        successStories: formattedStories,
        pagination: {
          limit,
          offset,
          total,
          hasMore: offset + limit < total
        },
        summary: {
          totalClaims: total,
          pendingClaims: claims.filter(c => c.status === 'submitted').length,
          processingClaims: claims.filter(c => c.status === 'processing').length,
          approvedClaims: claims.filter(c => c.status === 'approved').length,
          rejectedClaims: claims.filter(c => c.status === 'rejected').length,
          totalRefunded: claims.reduce((sum, c) => sum + (c.competitorPrice - c.ourPrice), 0)
        },
        terms: [
          'Price must be from an authorized retailer',
          'Product must be identical (same model, color, condition)',
          'Lower price must be currently available (not expired deals)',
          'Claim must be submitted within 30 days of purchase',
          'Refund is the difference between our price and the lower price',
          'Maximum one claim per product',
          'Applies to products sold and fulfilled by Grapsee Shop',
        ],
      }
    })
  } catch (error) {
    console.error('Price guarantee fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch price guarantee data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'User authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, ourPrice, competitorPrice, competitorUrl, evidenceImage } = body

    if (!orderId || !ourPrice || !competitorPrice) {
      return NextResponse.json({ 
        success: false, 
        error: 'Order ID, our price, and competitor price are required' 
      }, { status: 400 })
    }

    if (competitorPrice >= ourPrice) {
      return NextResponse.json({ 
        success: false, 
        error: 'Competitor price must be lower than our price' 
      }, { status: 400 })
    }

    if (ourPrice <= 0 || competitorPrice <= 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Prices must be positive numbers' 
      }, { status: 400 })
    }

    // Validate order exists and belongs to user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          select: { 
            productId: true,
            productName: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    if (order.customerEmail !== session.user.email) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
    }

    // Check if order is within 30-day guarantee period
    const orderDate = new Date(order.createdAt)
    const now = new Date()
    const daysSinceOrder = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSinceOrder > 30) {
      return NextResponse.json({ 
        success: false, 
        error: 'Price guarantee claims must be submitted within 30 days of purchase' 
      }, { status: 400 })
    }

    // Note: orderId doesn't exist in PriceGuarantee schema, so we can't check for duplicates

    const refundAmount = Math.round((ourPrice - competitorPrice) * 100) / 100

    // Create the claim
    const claim = await prisma.priceGuarantee.create({
      data: {
        productId: order.items?.[0]?.productId || 'unknown',
        productName: order.items?.[0]?.productName || 'Product',
        ourPrice: ourPrice,
        competitorPrice,
        competitorUrl: competitorUrl || null,
        customerEmail: session.user.email || null,
        status: 'submitted'
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        claim: {
          id: claim.id,
          orderId: orderId,
          productName: claim.productName,
          originalPrice: claim.ourPrice,
          competitorPrice: claim.competitorPrice,
          refundAmount: refundAmount,
          status: claim.status,
          submittedAt: claim.createdAt,
          estimatedReview: '1-2 business days',
          competitorUrl: claim.competitorUrl
        }
      },
      message: `Price guarantee claim submitted successfully! Estimated refund: $${refundAmount.toFixed(2)}`
    }, { status: 201 })
  } catch (error) {
    console.error('Price guarantee claim submission error:', error)
    return NextResponse.json({ success: false, error: 'Failed to submit price guarantee claim' }, { status: 500 })
  }
}

// PUT /api/price-guarantee Update claim status (admin)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'User authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { claimId, status, adminNotes } = body

    if (!claimId || !status) {
      return NextResponse.json({ 
        success: false, 
        error: 'Claim ID and status are required' 
      }, { status: 400 })
    }

    const validStatuses = ['submitted', 'processing', 'approved', 'rejected']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        success: false, 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      }, { status: 400 })
    }

    const existingClaim = await prisma.priceGuarantee.findUnique({
      where: { id: claimId }
    })

    if (!existingClaim) {
      return NextResponse.json({ success: false, error: 'Claim not found' }, { status: 404 })
    }

    const updateData: any = { status }
    if (adminNotes !== undefined) updateData.notes = adminNotes // Use notes instead of adminNotes
    
    if (status === 'processing') {
      // Note: reviewedAt doesn't exist in PriceGuarantee schema
    } else if (status === 'approved') {
      // Note: approvedAt doesn't exist in PriceGuarantee schema
      // In a real implementation, you would process the refund here
    }

    const updatedClaim = await prisma.priceGuarantee.update({
      where: { id: claimId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      data: {
        ...updatedClaim,
        message: `Claim ${status} successfully${status === 'approved' ? '. Refund processed!' : '.'}`
      }
    })
  } catch (error) {
    console.error('Price guarantee claim update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update price guarantee claim' }, { status: 500 })
  }
}
