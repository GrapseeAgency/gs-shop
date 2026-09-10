import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Connect calendar and get event-based suggestions
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { events } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const suggestions = []
    const now = new Date()

    for (const event of events || []) {
      const eventDate = new Date(event.start)
      const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (event.summary?.toLowerCase().includes('wedding')) {
        if (daysUntil <= 14 && daysUntil > 0) {
          const outfits = await prisma.product.findMany({
            where: {
              OR: [
                { tags: { contains: 'wedding' } },
                { tags: { contains: 'formal' } },
              ]
            },
            take: 6
          })
          suggestions.push({ event: event.summary, type: 'wedding_outfit', daysUntil, products: outfits })
        }
      }

      if (event.summary?.toLowerCase().includes('birthday')) {
        if (daysUntil <= 14 && daysUntil > 0) {
          const gifts = await prisma.product.findMany({
            where: { tags: { contains: 'gift' } },
            take: 6
          })
          suggestions.push({ event: event.summary, type: 'birthday_gift', daysUntil, products: gifts })
        }
      }

      if (event.summary?.toLowerCase().includes('interview') ||
          event.summary?.toLowerCase().includes('meeting')) {
        if (daysUntil <= 3 && daysUntil > 0) {
          const professional = await prisma.product.findMany({
            where: {
              OR: [
                { tags: { contains: 'professional' } },
                { tags: { contains: 'business' } },
              ]
            },
            take: 4
          })
          suggestions.push({ event: event.summary, type: 'professional_prep', daysUntil, products: professional })
        }
      }
    }

    return NextResponse.json({
      eventsAnalyzed: (events || []).length,
      suggestions,
    })
  } catch (error) {
    console.error('Calendar integration error:', error)
    return NextResponse.json({ error: 'Failed to process calendar' }, { status: 500 })
  }
}

// GET - Get calendar suggestions
export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      connected: false,
      message: 'Calendar integration requires setup',
    })
  } catch (error) {
    console.error('Calendar fetch error:', error)
    return NextResponse.json({ connected: false })
  }
}
