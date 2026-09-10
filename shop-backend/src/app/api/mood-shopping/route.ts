import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const MOOD_PRODUCTS: Record<string, any[]> = {
  happy: [
    { category: 'celebration', tags: ['party', 'fun', 'colorful'] },
    { category: 'treats', tags: ['luxury', 'special', 'gift'] }
  ],
  sad: [
    { category: 'comfort', tags: ['cozy', 'relaxing', 'self-care'] },
    { category: 'wellness', tags: ['mental-health', 'comfort', 'care'] }
  ],
  stressed: [
    { category: 'relaxation', tags: ['calm', 'meditation', 'stress-relief'] },
    { category: 'organization', tags: ['planner', 'organize', 'simplify'] }
  ],
  excited: [
    { category: 'adventure', tags: ['new', 'trending', 'hot'] },
    { category: 'tech', tags: ['gadgets', 'innovation', 'latest'] }
  ],
  bored: [
    { category: 'hobbies', tags: ['crafts', 'games', 'activities'] },
    { category: 'learning', tags: ['courses', 'books', 'skills'] }
  ],
  romantic: [
    { category: 'gifts', tags: ['romantic', 'date-night', 'couples'] },
    { category: 'beauty', tags: ['elegant', 'sophisticated', 'date'] }
  ]
}

// POST - Get mood-based recommendations
export async function POST(req: NextRequest) {
  try {
    const { mood, intensity = 'medium', reason } = await req.json()

    if (!mood || !MOOD_PRODUCTS[mood]) {
      return NextResponse.json({ 
        error: 'Invalid mood',
        availableMoods: Object.keys(MOOD_PRODUCTS)
      }, { status: 400 })
    }

    const moodConfig = MOOD_PRODUCTS[mood]
    
    // Find products matching mood
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: moodConfig.map(config => ({
          AND: [
            { category: { name: { contains: config.category,  } } },
            { tags: { contains: config.tags[0] } }
          ]
        }))
      },
      take: 12
    })

    // Generate mood message
    const messages: Record<string, string> = {
      happy: 'Celebrate the good vibes! Here are products to match your joy',
      sad: 'Take care of yourself. These might help lift your spirits',
      stressed: 'Breathe. These products can help you find your calm',
      excited: 'Channel that energy! Check out these trending picks',
      bored: 'Time for something new! Discover these engaging products',
      romantic: 'Set the mood with these romantic finds'
    }

    return NextResponse.json({
      mood,
      message: messages[mood],
            products: products.map(p => ({
        ...p,
        moodMatch: calculateMoodMatch(p, moodConfig)
      })),
      playlists: getMoodPlaylists(mood),
      activities: getMoodActivities(mood)
    })
  } catch (error) {
    console.error('Mood shopping error:', error)
    return NextResponse.json({ error: 'Failed to get recommendations' }, { status: 500 })
  }
}

// GET - Get mood options
export async function GET(req: NextRequest) {
  return NextResponse.json({
    moods: [
      { id: 'happy', name: 'Happy', color: 'yellow' },
      { id: 'excited', name: 'Excited', color: 'orange' },
      { id: 'romantic', name: 'Romantic', color: 'pink' },
      { id: 'bored', name: 'Bored', color: 'gray' },
      { id: 'stressed', name: 'Stressed', color: 'blue' },
      { id: 'sad', name: 'Sad', color: 'indigo' }
    ],
    intensities: ['low', 'medium', 'high'],
    features: {
      musicIntegration: true,
      colorThemes: true,
      curatedPlaylists: true
    }
  })
}


function calculateMoodMatch(product: any, moodConfig: any[]) {
  let score = 50
  // Simple matching algorithm
  moodConfig.forEach(config => {
    if (product.category?.name?.toLowerCase().includes(config.category)) {
      score += 25
    }
    config.tags.forEach((tag: string) => {
      if (product.tags?.toLowerCase().includes(tag)) {
        score += 10
      }
    })
  })
  return Math.min(100, score)
}

function getMoodPlaylists(mood: string) {
  const playlists: Record<string, string[]> = {
    happy: ['Upbeat Pop', 'Feel-Good Classics', 'Party Hits'],
    sad: ['Acoustic Comfort', 'Soft Piano', 'Gentle Jazz'],
    stressed: ['Meditation', 'Nature Sounds', 'Lo-Fi Beats'],
    excited: ['High Energy', 'Workout Mix', 'Trending Now'],
    bored: ['Discover Weekly', 'New Releases', 'Hidden Gems'],
    romantic: ['Love Songs', 'Date Night Jazz', 'Slow R&B']
  }
  return playlists[mood] || ['Recommended for You']
}

function getMoodActivities(mood: string) {
  const activities: Record<string, string[]> = {
    happy: ['Plan a celebration', 'Try something new', 'Share with friends'],
    sad: ['Practice self-care', 'Take a warm bath', 'Read something uplifting'],
    stressed: ['Take deep breaths', 'Organize your space', 'Go for a walk'],
    excited: ['Start a new project', 'Try a new hobby', 'Plan an adventure'],
    bored: ['Learn something new', 'Start a creative project', 'Reorganize'],
    romantic: ['Plan a special dinner', 'Write a love note', 'Create a playlist']
  }
  return activities[mood] || ['Browse our collections']
}
