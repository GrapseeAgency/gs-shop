import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminApiKey } from '@/lib/admin-api-auth';

// GET - Get all bids for an auction
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await verifyAdminApiKey(req, 'read');
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Verify auction exists
    const auction = await prisma.auction.findUnique({
      where: { id },
      select: { id: true, startPrice: true, currentBid: true, status: true }
    });

    if (!auction) {
      return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
    }

    // Get bids
    const [bids, total] = await Promise.all([
      prisma.auctionBid.findMany({
        where: { auctionId: id },
        orderBy: { amount: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.auctionBid.count({ where: { auctionId: id } }),
    ]);

    // Format bids for display
    const formattedBids = bids.map((bid, index) => ({
      id: bid.id,
      amount: bid.amount,
      rank: index + 1 + offset, // Bid ranking
      isWinning: index === 0, // First bid is winning
      bidderName: bid.bidderName,
      bidderEmail: bid.bidderEmail,
      createdAt: bid.createdAt,
    }));

    // Calculate statistics
    const stats = {
      totalBids: total,
      uniqueBidders: new Set(bids.map(b => b.userId)).size,
      highestBid: bids[0]?.amount || auction.currentBid,
      lowestBid: bids[bids.length - 1]?.amount || auction.startPrice,
      averageBid: bids.length > 0 
        ? bids.reduce((sum, b) => sum + b.amount, 0) / bids.length 
        : 0,
    };

    return NextResponse.json({
      success: true,
      auction: {
        id: auction.id,
        startPrice: auction.startPrice,
        currentBid: auction.currentBid,
        status: auction.status,
      },
      bids: formattedBids,
      stats,
      pagination: {
        total,
        limit,
        offset,
        hasMore: total > offset + limit,
      },
    });
  } catch (error) {
    console.error('Fetch auction bids error:', error);
    return NextResponse.json({ error: 'Failed to fetch bids' }, { status: 500 });
  }
}

// POST - Admin can add a bid (for testing or proxy bidding)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await verifyAdminApiKey(req, 'write');
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { userId, amount, isProxy = false } = body;

    if (!userId || !amount) {
      return NextResponse.json({ error: 'userId and amount required' }, { status: 400 });
    }

    // Get auction info
    const auction = await prisma.auction.findUnique({
      where: { id },
      include: {
        bids: {
          orderBy: { amount: 'desc' },
          take: 1,
        }
      }
    });

    if (!auction) {
      return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
    }

    if (auction.status !== 'live' && auction.status !== 'upcoming') {
      return NextResponse.json({ error: 'Auction is not active' }, { status: 400 });
    }

    // Validate bid amount
    const minBid = auction.bids[0]?.amount 
      ? auction.bids[0].amount + auction.minBidIncrement
      : auction.startPrice;

    if (amount < minBid) {
      return NextResponse.json({ 
        error: `Bid must be at least ${minBid}`,
        minBid 
      }, { status: 400 });
    }

    // Create bid
    const bid = await prisma.auctionBid.create({
      data: {
        auction: {
          connect: { id }
        },
        userId,
        amount: Number(amount),
        bidderName: 'Anonymous Bidder',
        bidderEmail: 'anonymous@example.com',
      },
    });

    // Update auction current bid
    await prisma.auction.update({
      where: { id },
      data: {
        currentBid: amount,
        currentPrice: amount,
        status: 'live',
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Bid placed successfully',
      bid: {
        id: bid.id,
        amount: bid.amount,
        bidderName: bid.bidderName,
        bidderEmail: bid.bidderEmail,
        createdAt: bid.createdAt,
        isWinning: true,
      }
    });
  } catch (error) {
    console.error('Create bid error:', error);
    return NextResponse.json({ error: 'Failed to place bid' }, { status: 500 });
  }
}
