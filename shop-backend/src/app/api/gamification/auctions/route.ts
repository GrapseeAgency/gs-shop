// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get active auctions
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'active'

    let where: any = {}
    
    if (status === 'active') {
      where = {
        endsAt: { gt: new Date() },
        status: 'active'
      }
    } else if (status === 'ending') {
      where = {
        endsAt: { 
          gt: new Date(),
          lt: new Date(Date.now() + 5 * 60 * 1000) // Ending in 5 min
        },
        status: 'active'
      }
    } else if (status === 'completed') {
      where = { status: 'completed' }
    }

    const auctions = await prisma.auction.findMany({
      where,
      include: {
        product: {
          select: { id: true, name: true, imageUrl: true, price: true }
        },
        bids: {
          orderBy: { amount: 'desc' },
          take: 5,
          include: {
            user: { select: { name: true, avatar: true } }
          }
        },
              },
      orderBy: status === 'ending' 
        ? { endsAt: 'asc' } 
        : { createdAt: 'desc' }
    })

    // Add time remaining
    const auctionsWithTime = auctions.map(a => ({
      ...a,
      timeRemaining: Math.max(0, new Date(a.endsAt!).getTime() - Date.now()),
      isHot: a.bidCount > 10,
      currentBid: a.currentBid || a.startPrice
    }))

    return NextResponse.json({ auctions: auctionsWithTime })
  } catch (error) {
    console.error('Auctions error:', error)
    return NextResponse.json({ error: 'Failed to fetch auctions' }, { status: 500 })
  }
}

// POST - Place bid
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { auctionId, amount } = await req.json()

    // Get auction
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
      include: {
        bids: { orderBy: { amount: 'desc' }, take: 1 }
      }
    })

    if (!auction || auction.status !== 'active') {
      return NextResponse.json({ error: 'Auction not found or ended' }, { status: 404 })
    }

    if (new Date(auction.endsAt) < new Date()) {
      return NextResponse.json({ error: 'Auction has ended' }, { status: 400 })
    }

    const currentBid = auction.bids[0]?.amount || auction.startPrice
    const minBid = currentBid + auction.minIncrement

    if (amount < minBid) {
      return NextResponse.json({ 
        error: `Bid must be at least $${minBid}`,
        minBid
      }, { status: 400 })
    }

    // Check user wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId }
    })

    if (!wallet || wallet.balance < amount) {
      return NextResponse.json({ 
        error: 'Insufficient wallet balance',
        required: amount,
        current: wallet?.balance || 0
      }, { status: 400 })
    }

    // Create bid
    const bid = await prisma.auctionBid.create({
      data: {
        auctionId,
        userId,
        amount,
        isAuto: false
      }
    })

    // Update auction current price
    await prisma.auction.update({
      where: { id: auctionId },
      data: { currentPrice: amount }
    })

    // Extend auction if bid in last minute
    const timeLeft = new Date(auction.endsAt).getTime() - Date.now()
    if (timeLeft < 60 * 1000) {
      await prisma.auction.update({
        where: { id: auctionId },
        data: { 
          endsAt: new Date(Date.now() + 2 * 60 * 1000) // Add 2 minutes
        }
      })
    }

    return NextResponse.json({
      success: true,
      bid,
      isWinning: true,
      message: 'Bid placed successfully!'
    })
  } catch (error) {
    console.error('Bid error:', error)
    return NextResponse.json({ error: 'Failed to place bid' }, { status: 500 })
  }
}

// PUT - Set auto-bid (proxy bidding)
export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { auctionId, maxAmount } = await req.json()

    await prisma.autoBid.create({
      data: {
        userId,
        auctionId,
        maxAmount,
        active: true
      }
    })

    return NextResponse.json({
      success: true,
      message: `Auto-bid set up to $${maxAmount}`
    })
  } catch (error) {
    console.error('Auto-bid error:', error)
    return NextResponse.json({ error: 'Failed to set auto-bid' }, { status: 500 })
  }
}
