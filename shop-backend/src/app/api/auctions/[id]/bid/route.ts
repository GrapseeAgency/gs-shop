import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/auctions/[id]/bid Place a bid
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { bidderName, bidderEmail, amount } = body

    if (!bidderName || !bidderEmail || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: bidderName, bidderEmail, amount' },
        { status: 400 }
      )
    }

    const bidAmount = parseFloat(amount)

    // Fetch auction with current state
    const auction = await prisma.auction.findUnique({
      where: { id },
      include: { bids: { orderBy: { amount: 'desc' }, take: 1 } },
    })

    if (!auction) {
      return NextResponse.json(
        { error: 'Auction not found' },
        { status: 404 }
      )
    }

    // Validate auction is live
    if (auction.status !== 'live') {
      return NextResponse.json(
        { error: 'Auction is not currently live' },
        { status: 400 }
      )
    }

    // Validate auction hasn't ended
    if (auction.endTime && new Date() >= new Date(auction.endTime)) {
      return NextResponse.json(
        { error: 'Auction has ended' },
        { status: 400 }
      )
    }

    // Validate bid amount > currentBid + minBidIncrement
    const minRequired = auction.currentBid + auction.minBidIncrement
    if (bidAmount < minRequired) {
      return NextResponse.json(
        { error: `Bid must be at least ${minRequired} (current bid: ${auction.currentBid} + min increment: ${auction.minBidIncrement})` },
        { status: 400 }
      )
    }

    // Mark previous winning bids as not winning
    await prisma.auctionBid.updateMany({
      where: { auctionId: id, isWinning: true },
      data: { isWinning: false },
    })

    // Create the new bid
    const bid = await prisma.auctionBid.create({
      data: {
        auctionId: id,
        bidderName,
        bidderEmail,
        amount: bidAmount,
        isWinning: true,
      },
    })

    // Update auction currentBid and bidCount
    await prisma.auction.update({
      where: { id },
      data: {
        currentBid: bidAmount,
        bidCount: { increment: 1 },
        winnerName: bidderName,
      },
    })

    return NextResponse.json(bid, { status: 201 })
  } catch (error) {
    console.error('Error placing bid:', error)
    return NextResponse.json(
      { error: 'Failed to place bid' },
      { status: 500 }
    )
  }
}
