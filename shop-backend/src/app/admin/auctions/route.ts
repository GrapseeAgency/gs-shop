import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminApiKey } from '@/lib/admin-api-auth'

// GET - List all auctions
export async function GET(req: NextRequest) {
  const admin = await verifyAdminApiKey(req, 'read')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const auctions = await prisma.auction.findMany({
      include: {
        product: {
          select: { id: true, name: true, imageUrl: true }
        },
        seller: {
          select: { id: true, name: true }
        },
        _count: {
          select: { bids: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, count: auctions.length, auctions })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch auctions' }, { status: 500 })
  }
}

// POST - Create new auction
export async function POST(req: NextRequest) {
  const admin = await verifyAdminApiKey(req, 'write')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { productId, sellerId, startPrice, reservePrice, startTime, endTime, minBidIncrement, isActive } = body

    if (!productId || !sellerId || startPrice === undefined || !endTime) {
      return NextResponse.json({ error: 'productId, sellerId, startPrice, and endTime are required' }, { status: 400 })
    }

    const auction = await prisma.auction.create({
      data: {
        productId,
        sellerId,
        startPrice: Number(startPrice),
        reservePrice: reservePrice ? Number(reservePrice) : null,
        currentPrice: Number(startPrice),
        currentBid: Number(startPrice),
        startTime: startTime ? new Date(startTime) : new Date(),
        endTime: new Date(endTime),
        minBidIncrement: minBidIncrement ? Number(minBidIncrement) : 1,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        status: 'pending'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Auction created successfully',
      auction
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create auction' }, { status: 500 })
  }
}
