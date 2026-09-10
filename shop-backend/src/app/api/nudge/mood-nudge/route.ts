import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Get mood-based nudges
export async function POST(req: NextRequest) {
  try {
    const { mood } = await req.json()
    const userId = req.headers.get('x-user-id')

    const moodRecommendations: Record<string, any> = {
      stressed: {
        message: 'Take a breath. Here are some calming essentials.',
        tags: ['relaxation', 'wellness', 'self-care', 'meditation'],
        tip: 'Consider a warm bath and herbal tea tonight.'
      },
      tired: {
        message: 'You deserve rest. Sleep essentials for better recovery.',
        tags: ['sleep', 'comfort', 'pillow', 'blanket'],
        tip: 'Power nap for 20 minutes can boost productivity.'
      },
      excited: {
        message: 'Great energy! Channel it into something productive.',
        tags: ['hobby', 'creative', 'sport', 'outdoor'],
        tip: 'Perfect time to start that new project!'
      },
      bored: {
        message: 'New hobby time? Discover something exciting.',
        tags: ['hobby', 'diy', 'creative', 'game'],
        tip: 'Learning something new boosts happiness.'
      },
      happy: {
        message: 'Share the joy! Gift ideas for loved ones.',
        tags: ['gift', 'share', 'party', 'celebration'],
        tip: 'Happiness multiplies when shared!'
      }
    }

    const config = moodRecommendations[mood] || moodRecommendations.bored

    // Get products
    const products = await prisma.product.findMany({
      where: {
        OR: config.tags.map((tag: string) => ({
          OR: [
            { tags: { contains: tag } },
            { description: { contains: tag } }
          ]
        }))
      },
      take: 6
    })

    return NextResponse.json({
      mood,
      message: config.message,
      tip: config.tip,
      products,
      action: mood === 'stressed' ? 'pause' : mood === 'tired' ? 'rest' : 'explore'
    })
  } catch (error) {
    console.error('Mood nudge error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// GET - Get nudge based on time of day
export async function GET(req: NextRequest) {
  try {
    const hour = new Date().getHours()
    let nudge: any = {}

    if (hour >= 6 && hour < 12) {
      nudge = {
        type: 'morning',
        message: 'Good morning! Start your day with essentials.',
        tags: ['breakfast', 'coffee', 'morning', 'fresh']
      }
    } else if (hour >= 12 && hour < 17) {
      nudge = {
        type: 'afternoon',
        message: 'Afternoon energy boost needed?',
        tags: ['snack', 'energy', 'productivity', 'focus']
      }
    } else if (hour >= 17 && hour < 22) {
      nudge = {
        type: 'evening',
        message: 'Wind down with comfort essentials.',
        tags: ['dinner', 'relax', 'home', 'comfort']
      }
    } else {
      nudge = {
        type: 'night',
        message: 'Late night browsing? Sleep essentials await.',
        tags: ['sleep', 'night', 'rest', 'cozy']
      }
    }

    const products = await prisma.product.findMany({
      where: {
        OR: nudge.tags.map((tag: string) => ({
          tags: { contains: tag }
        }))
      },
      take: 4
    })

    return NextResponse.json({
      ...nudge,
      products
    })
  } catch (error) {
    console.error('Time nudge error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
