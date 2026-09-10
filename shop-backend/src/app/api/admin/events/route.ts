import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EventType, EventStatus } from '@prisma/client'
import { verifyAdminApiKey } from '@/lib/admin-api-auth'

// GET - List all events with filters (for Grapsee Admin Panel)
export async function GET(req: NextRequest) {
  const admin = await verifyAdminApiKey(req, 'read')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const type = searchParams.get('type') as EventType | null
    const status = searchParams.get('status') as EventStatus | null
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get single event by ID
    if (id) {
      const event = await prisma.event.findUnique({
        where: { id },
        include: { product: { select: { id: true, name: true, slug: true, imageUrl: true } } }
      })
      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true, data: event })
    }

    // Build filter conditions
    const where: any = {}
    if (type) where.type = type
    if (status) where.status = status

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: { product: { select: { id: true, name: true, slug: true, imageUrl: true } } },
        orderBy: [{ priority: 'desc' }, { startTime: 'desc' }],
        take: limit,
        skip: offset
      }),
      prisma.event.count({ where
      })
    ])

    return NextResponse.json({
      success: true,
      data: events,
      pagination: { total, limit, offset, hasMore: offset + events.length < total }
    })

  } catch (error) {
    console.error('Fetch events error:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

// POST - Create a new event (Mega Sale, Auction, Community, Blog, etc.)
export async function POST(req: NextRequest) {
  const admin = await verifyAdminApiKey(req, 'write')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const {
      type, title, subtitle, description,
      startTime, endTime,
      gradientFrom, gradientVia, gradientTo,
      badgeText, badgeColor,
      ctaText, ctaLink, discountText,
      productId,
      startPrice, currentBid, minBidIncrement,
      priority, isActive
    } = body

    // Validation
    if (!type || !title || !startTime || !endTime) {
      return NextResponse.json({
        error: 'Required fields: type, title, startTime, endTime'
      }, { status: 400 })
    }

    if (!Object.values(EventType).includes(type)) {
      return NextResponse.json({
        error: `Invalid type. Must be one of: ${Object.values(EventType).join(', ')}`
      }, { status: 400 })
    }

    // Calculate initial status based on time
    const now = new Date()
    const start = new Date(startTime)
    const end = new Date(endTime)
    let status: EventStatus = 'UPCOMING'
    if (now >= start && now <= end) status = 'ACTIVE'
    else if (now > end) status = 'ENDED'

    const event = await prisma.event.create({
      data: {
        type,
        title,
        subtitle,
        description,
        startTime: start,
        endTime: end,
        status,
        gradientFrom: gradientFrom || '#f97316',
        gradientVia,
        gradientTo: gradientTo || '#dc2626',
        badgeText,
        badgeColor: badgeColor || '#fbbf24',
        ctaText: ctaText || 'Shop Now',
        ctaLink,
        discountText,
        productId,
        startPrice,
        currentBid,
        minBidIncrement: minBidIncrement || 100,
        priority: priority || 0,
        isActive: isActive !== false
      },
      include: { product: { select: { id: true, name: true, slug: true, imageUrl: true } } }
    })

    return NextResponse.json({
      success: true,
      message: 'Event created successfully',
      data: event
    }, { status: 201 })

  } catch (error) {
    console.error('Create event error:', error)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}

// PUT - Update an existing event
export async function PUT(req: NextRequest) {
  const admin = await verifyAdminApiKey(req, 'write')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const {
      id, type, title, subtitle, description,
      startTime, endTime, status,
      gradientFrom, gradientVia, gradientTo,
      badgeText, badgeColor,
      ctaText, ctaLink, discountText,
      productId,
      startPrice, currentBid, minBidIncrement, bidCount,
      priority, isActive
    } = body

    if (!id) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
    }

    // Build update object dynamically
    const updateData: any = {}

    if (type !== undefined) updateData.type = type
    if (title !== undefined) updateData.title = title
    if (subtitle !== undefined) updateData.subtitle = subtitle
    if (description !== undefined) updateData.description = description
    if (startTime !== undefined) updateData.startTime = new Date(startTime)
    if (endTime !== undefined) updateData.endTime = new Date(endTime)
    if (status !== undefined) updateData.status = status
    if (gradientFrom !== undefined) updateData.gradientFrom = gradientFrom
    if (gradientVia !== undefined) updateData.gradientVia = gradientVia
    if (gradientTo !== undefined) updateData.gradientTo = gradientTo
    if (badgeText !== undefined) updateData.badgeText = badgeText
    if (badgeColor !== undefined) updateData.badgeColor = badgeColor
    if (ctaText !== undefined) updateData.ctaText = ctaText
    if (ctaLink !== undefined) updateData.ctaLink = ctaLink
    if (discountText !== undefined) updateData.discountText = discountText
    if (productId !== undefined) updateData.productId = productId
    if (startPrice !== undefined) updateData.startPrice = startPrice
    if (currentBid !== undefined) updateData.currentBid = currentBid
    if (minBidIncrement !== undefined) updateData.minBidIncrement = minBidIncrement
    if (bidCount !== undefined) updateData.bidCount = bidCount
    if (priority !== undefined) updateData.priority = priority
    if (isActive !== undefined) updateData.isActive = isActive

    // Recalculate status if time fields changed
    if (startTime || endTime) {
      const event = await prisma.event.findUnique({ where: { id } })
      if (event) {
        const now = new Date()
        const start = startTime ? new Date(startTime) : event.startTime
        const end = endTime ? new Date(endTime) : event.endTime
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

    return NextResponse.json({
      success: true,
      message: 'Event updated successfully',
      data: updated
    })

  } catch (error) {
    console.error('Update event error:', error)
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}

// DELETE - Delete an event (or use PATCH /:id/toggle to hide)
export async function DELETE(req: NextRequest) {
  const admin = await verifyAdminApiKey(req, 'write')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
    }

    await prisma.event.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    })

  } catch (error) {
    console.error('Delete event error:', error)
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}

// PATCH - Toggle event active status or update status
export async function PATCH(req: NextRequest) {
  const admin = await verifyAdminApiKey(req, 'write')
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const action = searchParams.get('action') // 'toggle', 'activate', 'hide', 'end'

    if (!id) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
    }

    const event = await prisma.event.findUnique({ where: { id } })
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    let updateData: any = {}

    switch (action) {
      case 'toggle':
        updateData = { isActive: !event.isActive }
        break
      case 'activate':
        updateData = { status: 'ACTIVE', isActive: true }
        break
      case 'hide':
        updateData = { status: 'HIDDEN', isActive: false }
        break
      case 'end':
        updateData = { status: 'ENDED', endTime: new Date() }
        break
      default:
        // Apply any fields from body
        const body = await req.json().catch(() => ({}))
        updateData = body
    }

    const updated = await prisma.event.update({
      where: { id },
      data: updateData,
      include: { product: { select: { id: true, name: true, slug: true, imageUrl: true } } }
    })

    return NextResponse.json({
      success: true,
      message: `Event ${action || 'updated'} successfully`,
      data: updated
    })

  } catch (error) {
    console.error('Patch event error:', error)
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}
