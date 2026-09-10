import { NextRequest, NextResponse } from 'next/server'

// POST - Connect calendar and get event-based suggestions
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { events } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Calendar integration mock

    // Analyze events for shopping opportunities
    const suggestions = []
    const now = new Date()

    for (const event of events) {
      const eventDate = new Date(event.start)
      const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      // Wedding detection
      if (event.summary?.toLowerCase().includes('wedding') || 
          event.description?.toLowerCase().includes('wedding')) {
        if (daysUntil <= 14 && daysUntil > 0) {
          suggestions.push({
            event: event.summary,
            type: 'wedding_outfit',
            daysUntil,
            urgency: daysUntil <= 7 ? 'high' : 'medium',
            message: `Wedding in ${daysUntil} days! Find your perfect outfit.`,
            products: []
          })
        }
      }

      // Birthday detection
      if (event.summary?.toLowerCase().includes('birthday') ||
          event.description?.toLowerCase().includes('birthday')) {
        if (daysUntil <= 14 && daysUntil > 0) {
          suggestions.push({
            event: event.summary,
            type: 'birthday_gift',
            daysUntil,
            urgency: daysUntil <= 3 ? 'high' : 'medium',
            message: `Birthday in ${daysUntil} days! Don't forget a gift.`,
            products: [],
            autoOrderEligible: daysUntil === 14
          })
        }
      }

      // Meeting/Interview detection
      if (event.summary?.toLowerCase().includes('interview') ||
          event.summary?.toLowerCase().includes('meeting') ||
          event.summary?.toLowerCase().includes('presentation')) {
        if (daysUntil <= 3 && daysUntil > 0) {
          suggestions.push({
            event: event.summary,
            type: 'professional_prep',
            daysUntil,
            urgency: 'high',
            message: `${event.summary} in ${daysUntil} days. Look your best!`,
            products: []
          })
        }
      }

      // Vacation/Travel detection
      if (event.summary?.toLowerCase().includes('vacation') ||
          event.summary?.toLowerCase().includes('trip') ||
          event.summary?.toLowerCase().includes('travel')) {
        if (daysUntil <= 7 && daysUntil > 0) {
          suggestions.push({
            event: event.summary,
            type: 'travel_prep',
            daysUntil,
            urgency: 'medium',
            message: `Trip in ${daysUntil} days! Need travel essentials?`,
            checklist: ['luggage', 'travel adapters', 'toiletries', 'travel pillow']
          })
        }
      }
    }

    return NextResponse.json({
      connected: true,
      eventsAnalyzed: events.length,
      suggestions,
      syncTime: new Date()
    })
  } catch (error) {
    console.error('Calendar integration error:', error)
    return NextResponse.json({ error: 'Failed to process calendar' }, { status: 500 })
  }
}

// GET - Get calendar suggestions
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ connected: false })

    return NextResponse.json({
      connected: false,
      lastSync: null
    })
  } catch (error) {
    console.error('Calendar fetch error:', error)
    return NextResponse.json({ connected: false })
  }
}
