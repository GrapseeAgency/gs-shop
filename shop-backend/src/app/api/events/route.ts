import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { EventType, EventStatus } from '@prisma/client';

// Helper to calculate time left
function calculateTimeLeft(endTime: Date) {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

// Helper to determine event status based on time
function calculateEventStatus(event: any): EventStatus {
  const now = new Date();
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);

  // Note: isActive doesn't exist in Event schema
  // if (!event.isActive) return 'HIDDEN';
  return 'ACTIVE'; // Simplified status calculation
  if (now < start) return 'UPCOMING';
  if (now > end) {
    // 1 hour grace period
    const gracePeriod = new Date(end.getTime() + 60 * 60 * 1000);
    return now > gracePeriod ? 'HIDDEN' : 'ENDED';
  }
  return 'ACTIVE';
}

// Format event for frontend consumption
function formatEvent(event: any) {
  const status = calculateEventStatus(event);
  const timeLeft = status === 'ACTIVE' ? calculateTimeLeft(event.endTime) : null;

  return {
    id: event.id,
    type: event.type,
    title: event.title,
    subtitle: event.subtitle,
    description: event.description,
    status,
    timeLeft,
    startTime: event.startTime,
    endTime: event.endTime,
    gradient: {
      from: event.gradientFrom,
      via: event.gradientVia,
      to: event.gradientTo,
    },
    badge: {
      text: event.badgeText,
      color: event.badgeColor,
    },
    cta: {
      text: event.ctaText,
      link: event.ctaLink,
    },
    discountText: event.discountText,
    illustrationType: event.type.toLowerCase().replace('_', '-'),
    product: event.product,
    // Auction specific data
    auctionData: event.type === 'AUCTION' ? {
      currentBid: event.currentBid,
      bidCount: event.bidCount,
      minBidIncrement: event.minBidIncrement,
      startPrice: event.startPrice,
    } : null,
    priority: event.priority,
    // isActive: event.isActive, // Note: isActive doesn't exist in Event schema
  };
}

// GET - Public endpoint to fetch active events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const types = searchParams.get('types')?.split(',') as EventType[] | undefined;
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get single event by ID
    if (id) {
      const event = await prisma.event.findUnique({
        where: { id },
        include: { product: { select: { id: true, name: true, slug: true, imageUrl: true } } },
      });

      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: formatEvent(event),
      });
    }

    // Build filter for active/upcoming events only (public view)
    const where: any = {
      // Note: isActive doesn't exist in Event schema
      // Only show events that haven't passed their grace period
      endTime: {
        gte: new Date(Date.now() - 60 * 60 * 1000), // 1 hour grace
      },
    };

    if (types && types.length > 0) {
      where.type = { in: types };
    }

    const events = await prisma.event.findMany({
      where,
      include: { product: { select: { id: true, name: true, slug: true, imageUrl: true } } },
      orderBy: [{ priority: 'desc' }, { startTime: 'desc' }],
      take: limit,
    });

    // Format and filter out hidden events
    const formattedEvents = events
      .map(formatEvent)
      .filter(e => e.status !== 'HIDDEN');

    return NextResponse.json({
      success: true,
      data: formattedEvents,
      count: formattedEvents.length,
    });

  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

// POST - Not allowed on public endpoint (use /api/admin/events instead)
export async function POST() {
  return NextResponse.json(
    { error: 'Use POST /api/admin/events to create events' },
    { status: 405 }
  );
}

// PUT - Not allowed on public endpoint (use PUT /api/admin/events instead)
export async function PUT() {
  return NextResponse.json(
    { error: 'Use PUT /api/admin/events/:id to update events' },
    { status: 405 }
  );
}

// DELETE - Not allowed on public endpoint (use DELETE /api/admin/events/:id instead)
export async function DELETE() {
  return NextResponse.json(
    { error: 'Use DELETE /api/admin/events/:id to delete events' },
    { status: 405 }
  );
}
