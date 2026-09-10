// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Connect Spotify and get mood-based recommendations
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { currentlyPlaying, recentTracks, mood } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Save music profile
    await prisma.musicProfile.upsert({
      where: { userId },
      update: {
        currentlyPlaying: JSON.stringify(currentlyPlaying),
        recentTracks: JSON.stringify(recentTracks),
        mood,
        lastSync: new Date()
      },
      create: {
        userId,
        currentlyPlaying: JSON.stringify(currentlyPlaying),
        recentTracks: JSON.stringify(recentTracks),
        mood
      }
    }).catch(() => {})

    // Mood-based product mapping
    const moodProducts: Record<string, { tags: string[]; message: string }> = {
      sad: {
        tags: ['comfort', 'cozy', 'self-care', 'warm', 'soft'],
        message: 'Feeling the vibes? Here are some comfort picks.'
      },
      happy: {
        tags: ['celebration', 'party', 'colorful', 'fun', 'energetic'],
        message: 'Good mood detected! Treat yourself to something fun.'
      },
      energetic: {
        tags: ['workout', 'fitness', 'active', 'sport', 'energy'],
        message: 'High energy! Perfect time for active lifestyle products.'
      },
      relaxed: {
        tags: ['meditation', 'calm', 'wellness', 'spa', 'peaceful'],
        message: 'In a chill mood? Enhance your relaxation.'
      },
      focused: {
        tags: ['productivity', 'office', 'desk', 'concentration', 'minimal'],
        message: 'Deep focus mode? Productivity essentials await.'
      },
      romantic: {
        tags: ['romantic', 'date', 'elegant', 'sophisticated', 'luxury'],
        message: 'Romantic vibes detected. Set the mood.'
      }
    }

    const moodConfig = moodProducts[mood] || moodProducts.relaxed

    // Get matching products
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: moodConfig.tags.map(tag => ({
          OR: [
            { tags: { contains: tag } },
            { name: { contains: tag,  } }
          ]
        }))
      },
      take: 8
    })

    // Create themed playlist suggestion
    const playlists: Record<string, string[]> = {
      sad: ['Comfort Food Recipes', 'Cozy Night In', 'Self-Care Sunday'],
      happy: ['Party Essentials', 'Color Your Life', 'Celebrate Good Times'],
      energetic: ['Pre-Workout Fuel', 'Gym Motivation', 'Active Lifestyle'],
      relaxed: ['Spa Day at Home', 'Meditation Space', 'Slow Living'],
      focused: ['Deep Work Setup', 'Productivity Hacks', 'Minimal Desk'],
      romantic: ['Date Night', 'Self-Love Rituals', 'Evening Elegance']
    }

    return NextResponse.json({
      connected: true,
      detectedMood: mood,
      message: moodConfig.message,
      products,
      suggestedPlaylists: playlists[mood] || [],
      nowPlaying: currentlyPlaying?.name || 'No song playing'
    })
  } catch (error) {
    console.error('Spotify integration error:', error)
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 })
  }
}

// GET - Get music-based recommendations
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ connected: false })

    const profile = await prisma.musicProfile.findUnique({
      where: { userId }
    })

    return NextResponse.json({
      connected: !!profile,
      mood: profile?.mood || null,
      lastSync: profile?.lastSync
    })
  } catch (error) {
    console.error('Music profile error:', error)
    return NextResponse.json({ connected: false })
  }
}
