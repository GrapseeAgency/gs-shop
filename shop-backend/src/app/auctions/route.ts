import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Try to get from DB first
    try {
      const where: Record<string, unknown> = {}
      if (status && ['live', 'upcoming', 'ended'].includes(status)) {
        where.status = status
      }

      const auctions = await db.auction.findMany({
        where,
        include: {
          product: { select: { id: true, name: true, slug: true, imageUrl: true, price: true } },
          _count: { select: { bids: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      })

      if (auctions.length > 0) {
        return NextResponse.json({ data: auctions, total: auctions.length })
      }
    } catch { /* fall through to [] data */ }

    return NextResponse.json({ data: [], total: 0 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch auctions' }, { status: 500 })
  }
}