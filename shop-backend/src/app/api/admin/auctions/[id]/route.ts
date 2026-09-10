import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminApiKey } from '@/lib/admin-api-auth'

// GET - Fetch a single auction
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = await verifyAdminApiKey(req, 'read')
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const auction = await prisma.auction.findUnique({
      where: { id },
      include: {
        product: { select: { id: true, name: true, imageUrl: true } },
        seller: { select: { id: true, name: true } },
        bids: { orderBy: { amount: 'desc' }, take: 10 },
              }
    })
    if (!auction) return NextResponse.json({ error: 'Auction not found' }, { status: 404 })
    return NextResponse.json({ success: true, auction })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch auction' }, { status: 500 })
  }
}

// PUT - Update an auction
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = await verifyAdminApiKey(req, 'write')
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { startPrice, reservePrice, startTime, endTime, minBidIncrement, isActive, status } = body

    const updateFields: any = {}
    if (startPrice !== undefined) updateFields.startPrice = Number(startPrice)
    if (reservePrice !== undefined) updateFields.reservePrice = reservePrice ? Number(reservePrice) : null
    if (startTime !== undefined) updateFields.startTime = new Date(startTime)
    if (endTime !== undefined) updateFields.endTime = new Date(endTime)
    if (minBidIncrement !== undefined) updateFields.minBidIncrement = Number(minBidIncrement)
    if (isActive !== undefined) updateFields.isActive = Boolean(isActive)
    if (status !== undefined) {
      const validStatuses = ['upcoming', 'live', 'ended', 'cancelled']
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 })
      }
      updateFields.status = status
    }

    const auction = await prisma.auction.update({
      where: { id },
      data: updateFields
    })

    return NextResponse.json({ success: true, message: 'Auction updated', auction })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update auction' }, { status: 500 })
  }
}

// DELETE - Delete an auction (only if no bids exist)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = await verifyAdminApiKey(req, 'delete')
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const bidCount = await prisma.auctionBid.count({ where: { auctionId: id } })
    if (bidCount > 0) {
      await prisma.auctionBid.deleteMany({ where: { auctionId: id } })
    }
    await prisma.auction.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Auction deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete auction' }, { status: 500 })
  }
}
