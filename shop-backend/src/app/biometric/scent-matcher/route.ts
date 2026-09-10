import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Match scents based on preferences
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { preferences, occasion, mood } = await req.json()

    // Scent profiles
    const scentProfiles: Record<string, string[]> = {
      fresh: ['citrus', 'aquatic', 'green'],
      warm: ['vanilla', 'amber', 'spice'],
      floral: ['rose', 'jasmine', 'lavender'],
      woody: ['sandalwood', 'cedar', 'oud'],
      oriental: ['musk', 'incense', 'exotic']
    }

    const matchingTags = scentProfiles[preferences] || scentProfiles.fresh

    // Find matching fragrances
    const fragrances = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { tags: { contains: 'fragrance' } },
          { tags: { contains: 'perfume' } },
          { tags: { contains: 'cologne' } }
        ],
        AND: matchingTags.map(tag => ({
          OR: [
            { tags: { contains: tag } },
            { description: { contains: tag } }
          ]
        }))
      },
      take: 10
    })

    // Score matches
    const scored = fragrances.map(f => {
      let score = 0
      const desc = (f.description || '').toLowerCase()
      
      matchingTags.forEach(tag => {
        if (desc.includes(tag)) score += 10
        if (f.tags?.includes(tag)) score += 15
      })

      if (occasion && desc.includes(occasion)) score += 20
      if (mood && desc.includes(mood)) score += 15

      return { ...f, matchScore: score }
    }).sort((a, b) => b.matchScore - a.matchScore)

    // Save profile
    if (userId) {
      await prisma.userBiometricProfile.upsert({
        where: { userId },
        update: {
          scentPreferences: JSON.stringify({ preferences, occasion, mood }),
          updatedAt: new Date()
        },
        create: {
          userId,
          scentPreferences: JSON.stringify({ preferences, occasion, mood })
        }
      }).catch(() => {})
    }

    return NextResponse.json({
      preferences: { style: preferences, occasion, mood },
      matches: scored.slice(0, 6),
      topMatch: scored[0],
      alternatives: scored.slice(1, 4),
      tip: `For ${occasion || 'daily wear'}, ${preferences} scents work best with your profile.`
    })
  } catch (error) {
    console.error('Scent matcher error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
