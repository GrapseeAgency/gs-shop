import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Analyze browsing patterns for life events
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ detected: null })
    }

    // Get recent browsing history
    const recentSearches = await prisma.searchQuery.findMany({
      where: { 
        userId,
        createdAt: { gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    const recentViews = await prisma.productView.findMany({
      where: {
        userId,
        viewedAt: { gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      },
      include: { product: true },
      take: 50
    })

    // Life event detection patterns
    const patterns: Record<string, { keywords: string[]; confidence: number; message: string; collection: string }> = {
      newBaby: {
        keywords: ['baby', 'diaper', 'stroller', 'crib', 'maternity', 'prenatal', 'newborn'],
        confidence: 0,
        message: "Congratulations on your new arrival! We've curated everything you'll need.",
        collection: 'new_parent_essentials'
      },
      moving: {
        keywords: ['furniture', 'mattress', 'moving', 'boxes', 'storage', 'organizer'],
        confidence: 0,
        message: "Moving soon? Here's everything to make your new space feel like home.",
        collection: 'moving_essentials'
      },
      wedding: {
        keywords: ['wedding', 'bride', 'groom', 'honeymoon', 'registry', 'bridal'],
        confidence: 0,
        message: "Planning your big day? Let us help with your wedding essentials.",
        collection: 'wedding_collection'
      },
      newJob: {
        keywords: ['professional', 'office', 'work', 'laptop', 'briefcase', 'business'],
        confidence: 0,
        message: "New career milestone? Upgrade your professional toolkit.",
        collection: 'professional_upgrade'
      },
      fitnessJourney: {
        keywords: ['gym', 'protein', 'workout', 'fitness', 'weights', 'yoga'],
        confidence: 0,
        message: "Starting your fitness journey? We've got the gear you need.",
        collection: 'fitness_starter'
      },
      studentLife: {
        keywords: ['student', 'dorm', 'textbook', 'study', 'backpack', 'college'],
        confidence: 0,
        message: "Back to school? Get everything you need for student success.",
        collection: 'student_essentials'
      }
    }

    // Calculate confidence scores
    const allText = [
      ...recentSearches.map(s => s.query),
      ...recentViews.map(v => v.productId)
    ].join(' ').toLowerCase()

    Object.keys(patterns).forEach(event => {
      const pattern = patterns[event]
      pattern.keywords.forEach(keyword => {
        const count = (allText.match(new RegExp(keyword, 'g')) || []).length
        pattern.confidence += count * 0.15
      })
      pattern.confidence = Math.min(pattern.confidence, 1)
    })

    // Find highest confidence event
    let detectedEvent: string | null = null
    let highestConfidence = 0

    Object.entries(patterns).forEach(([event, data]) => {
      if (data.confidence > highestConfidence && data.confidence >= 0.4) {
        highestConfidence = data.confidence
        detectedEvent = event
      }
    })

    if (detectedEvent) {
      const event = patterns[detectedEvent]
      
      // Get curated collection
      const products = await prisma.product.findMany({
        where: {
          tags: { contains: event.collection }
        },
        take: 12
      })

      return NextResponse.json({
        detected: true,
        event: detectedEvent,
        confidence: event.confidence,
        message: event.message,
        collection: event.collection,
        products,
        suggestedActions: [
          'Create registry',
          'Set budget alerts',
          'Schedule deliveries'
        ]
      })
    }

    return NextResponse.json({ detected: false })
  } catch (error) {
    console.error('Life event detection error:', error)
    return NextResponse.json({ detected: false })
  }
}

// GET - Get user's life event history
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ events: [] })

    const events = await prisma.lifeEvent.findMany({
      where: { userId },
      orderBy: { detectedAt: 'desc' },
      take: 10
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Life event history error:', error)
    return NextResponse.json({ events: [] })
  }
}
