import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EventStatus } from '@prisma/client'
import { verifyAdminApiKey } from '@/lib/admin-api-auth'

// GET - Single event
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdminApiKey(req, 'read')
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const event = await prisma.event.findUnique({
      where: { id },
      include: { product: { select: { id: true, name: true, slug: true, imageUrl: true } } }
    })
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    return NextResponse.json({ success: true, data: event })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
  }
}

// PUT - Update event by ID (path param)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdminApiKey(req, 'write')
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const body = await req.json()
    const updateData: any = {}

    const fields = [
      'type', 'title', 'subtitle', 'description', 'gradientFrom', 'gradientVia', 'gradientTo',
      'badgeText', 'badgeColor', 'ctaText', 'ctaLink', 'discountText', 'productId',
      'startPrice', 'currentBid', 'minBidIncrement', 'bidCount', 'priority', 'isActive'
    ]
    fields.forEach((f) => { if (body[f] !== undefined) updateData[f] = body[f] })

    if (body.startTime !== undefined) updateData.startTime = new Date(body.startTime)
    if (body.endTime !== undefined) updateData.endTime = new Date(body.endTime)
    if (body.status !== undefined) updateData.status = body.status

    // Recalculate status if time changed
    if (body.startTime || body.endTime) {
      const existing = await prisma.event.findUnique({ where: { id } })
      if (existing) {
        const now = new Date()
        const start = body.startTime ? new Date(body.startTime) : existing.startTime
        const end = body.endTime ? new Date(body.endTime) : existing.endTime
        if (now >= start && now <= end) updateData.status = 'ACTIVE'
        else if (now > end) updateData.status = 'ENDED'
        else updateData.status = 'UPCOMING'
      }
    }

    const updated = await prisma.event.update({
      where: { id },
      data: updateData,
      include: { product: { select: { id: true, name: true, slug: true, imageUrl: true } } }
    })

    return NextResponse.json({ success: true, message: 'Event updated', data: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}

// DELETE - Delete event by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdminApiKey(req, 'write')
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    await prisma.event.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Event deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}
