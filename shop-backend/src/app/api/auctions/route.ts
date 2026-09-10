import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'))

    // Build where clause
    const where: any = {
      isActive: true,
    }

    if (status && ['live', 'upcoming', 'ended'].includes(status)) {
      where.status = status
    }

    // Get current time for status filtering
    const now = new Date()
    
    // If no status specified, filter for active auctions
    if (!status) {
      where.OR = [
        {
          status: 'live',
          endTime: { gt: now }
        },
        {
          status: 'upcoming',
          startTime: { gt: now }
        }
      ]
    }

    const auctions = await prisma.auction.findMany({
      where,
      include: {
        product: { 
          select: {  
            id: true, 
            name: true, 
            slug: true, 
            imageUrl: true, 
            price: true,
          }
        },
        seller: {
          select: { id: true, name: true, avatar: true, isVerified: true }
        },
        winner: {
          select: { id: true, name: true, avatar: true }
        },
      },
      orderBy: [
        { status: 'asc' }, // live first, then upcoming, then ended
        { startTime: 'asc' },
        { endTime: 'asc' }
      ],
      take: limit,
      skip: offset,
    })

    const total = await prisma.auction.count({ where
      })

    return NextResponse.json({ 
      success: true,
      data: auctions, 
      total,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < total,
      }
    })
  } catch (error) {
    console.error('Error fetching auctions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch auctions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      productId,
      sellerId,
      startPrice,
      reservePrice,
      startTime,
      endTime,
      minBidIncrement = 100,
      description,
    } = body

    if (!productId || !sellerId || !startPrice || !endTime) {
      return NextResponse.json(
        { success: false, error: 'Product ID, seller ID, start price, and end time required' },
        { status: 400 }
      )
    }

    // Verify product exists and belongs to seller
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, sellerId: true, price: true, isActive: true }
    })

    if (!product || !product.isActive) {
      return NextResponse.json(
        { success: false, error: 'Product not found or not active' },
        { status: 404 }
      )
    }

    if (product.sellerId !== sellerId) {
      return NextResponse.json(
        { success: false, error: 'Only product seller can create auction' },
        { status: 403 }
      )
    }

    // Verify seller exists
    const seller = await prisma.user.findUnique({
      where: { id: sellerId },
      select: { id: true, name: true, role: true }
    })

    if (!seller || seller.role !== 'seller') {
      return NextResponse.json(
        { success: false, error: 'Invalid seller' },
        { status: 403 }
      )
    }

    // Create auction
    const auction = await prisma.auction.create({
      data: {
        productId,
        sellerId,
        startPrice: parseFloat(startPrice),
        reservePrice: reservePrice ? parseFloat(reservePrice) : null,
        currentPrice: parseFloat(startPrice),
        currentBid: parseFloat(startPrice),
        startTime: startTime ? new Date(startTime) : new Date(),
        endTime: new Date(endTime),
        minBidIncrement: parseFloat(minBidIncrement),
        description,
        status: 'upcoming',
        isActive: true,
      },
      include: {
        product: { 
          select: {  
            id: true, 
            name: true, 
            slug: true, 
            imageUrl: true, 
            price: true,
          }
        },
        seller: {
          select: { id: true, name: true, avatar: true, isVerified: true }
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: auction,
      message: 'Auction created successfully',
    })
  } catch (error) {
    console.error('Error creating auction:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create auction' },
      { status: 500 }
    )
  }
}
