import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DIETARY_RESTRICTIONS = [
  { id: 'vegetarian', name: 'Vegetarian', icon: '' },
  { id: 'vegan', name: 'Vegan', icon: '' },
  { id: 'keto', name: 'Keto', icon: '' },
  { id: 'halal', name: 'Halal', icon: '' },
  { id: 'kosher', name: 'Kosher', icon: '' },
  { id: 'gluten-free', name: 'Gluten Free', icon: '' },
  { id: 'dairy-free', name: 'Dairy Free', icon: '' },
  { id: 'nut-free', name: 'Nut Free', icon: '' }
]

// GET - Get user's dietary profile
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ restrictions: [], safeProducts: [] })
    }

    const profile = await prisma.userBiometricProfile.findUnique({
      where: { userId }
    })

    const restrictions = profile?.dietaryRestrictions 
      ? JSON.parse(profile.dietaryRestrictions)
      : []

    return NextResponse.json({
      restrictions,
      availableOptions: DIETARY_RESTRICTIONS,
      filteringActive: restrictions.length > 0,
      safeProductsCount: 0 // Would be calculated based on restrictions
    })
  } catch (error) {
    console.error('Dietary profile error:', error)
    return NextResponse.json({ restrictions: [] })
  }
}

// POST - Update dietary restrictions
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { restrictions } = await req.json()

    await prisma.userBiometricProfile.upsert({
      where: { userId },
      update: {
        dietaryRestrictions: JSON.stringify(restrictions),
        updatedAt: new Date()
      },
      create: {
        userId,
        dietaryRestrictions: JSON.stringify(restrictions)
      }
    })

    // Get safe products (exclude restricted items)
    const unsafeTags = restrictions.flatMap((r: string) => {
      const tagMap: Record<string, string[]> = {
        'vegetarian': ['meat', 'fish', 'chicken'],
        'vegan': ['meat', 'dairy', 'egg', 'honey'],
        'keto': ['sugar', 'grain', 'carb'],
        'halal': ['pork', 'alcohol'],
        'kosher': ['pork', 'shellfish'],
        'gluten-free': ['gluten', 'wheat'],
        'dairy-free': ['dairy', 'milk', 'cheese'],
        'nut-free': ['nut', 'peanut', 'almond']
      }
      return tagMap[r] || []
    })

    return NextResponse.json({
      success: true,
      restrictions,
      message: `Dietary profile updated. ${restrictions.length} restrictions active.`,
      filtering: {
        unsafeTags,
        autoFilterEnabled: true,
        warningOnRestricted: true
      }
    })
  } catch (error) {
    console.error('Dietary update error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
