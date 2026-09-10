import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/auctions/[id] Get single auction with bids
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const auction = await prisma.auction.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            imageUrl: true,
            images: true,
            price: true,
            description: true,
          },
        },
        bids: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    })

    if (!auction) {
      return NextResponse.json(
        { error: 'Auction not found' },
        { status: 404 }
      )
    }

    // Calculate time remaining
    const now = new Date()
    const endTime = auction.endTime ? new Date(auction.endTime) : new Date('2099-12-31')
    const timeRemaining = Math.max(0, endTime.getTime() - now.getTime())

    // Auto-update status if needed
    let status = auction.status
    if (status === 'upcoming' && now >= new Date(auction.startTime)) {
      status = 'live'
      await prisma.auction.update({ where: { id }, data: { status: 'live' } })
    } else if (status === 'live' && now >= endTime) {
      status = 'ended'
      // Determine winner (highest bid)
      const highestBid = auction.bids.length > 0
        ? auction.bids.reduce((max, bid) => bid.amount > max.amount ? bid : max, auction.bids[0])
        : null
      await prisma.auction.update({
        where: { id },
        data: {
          status: 'ended',
          winnerId: highestBid?.id || null,
          winnerName: highestBid?.bidderName || null,
        },
      })
    }

    return NextResponse.json({
      ...auction,
      status,
      timeRemaining,
      isExpired: timeRemaining <= 0,
    })
  } catch (error) {
    console.error('Error fetching auction:', error)
    return NextResponse.json(
      { error: 'Failed to fetch auction' },
      { status: 500 }
    )
  }
}
