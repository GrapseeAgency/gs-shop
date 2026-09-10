import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const COMMON_ALLERGENS = [
  { id: 'gluten', name: 'Gluten', icon: '', tags: ['gluten', 'wheat', 'barley', 'rye'] },
  { id: 'nuts', name: 'Nuts', icon: '', tags: ['nut', 'peanut', 'almond', 'cashew', 'walnut'] },
  { id: 'dairy', name: 'Dairy', icon: '', tags: ['dairy', 'milk', 'cheese', 'butter', 'cream'] },
  { id: 'eggs', name: 'Eggs', icon: '', tags: ['egg', 'albumin'] },
  { id: 'soy', name: 'Soy', icon: '', tags: ['soy', 'tofu', 'edamame'] },
  { id: 'shellfish', name: 'Shellfish', icon: '', tags: ['shellfish', 'shrimp', 'crab', 'lobster'] },
  { id: 'fish', name: 'Fish', icon: '', tags: ['fish', 'salmon', 'tuna', 'cod'] },
  { id: 'latex', name: 'Latex', icon: '', tags: ['latex', 'rubber'] },
  { id: 'fragrance', name: 'Fragrance', icon: '', tags: ['fragrance', 'perfume', 'scent'] }
]

// GET - Get user's allergy settings
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ 
        allergies: [],
        available: COMMON_ALLERGENS 
      })
    }

    const profile = await prisma.userBiometricProfile.findUnique({
      where: { userId }
    })

    const allergies = profile?.allergies ? JSON.parse(profile.allergies) : []

    return NextResponse.json({
      allergies,
      available: COMMON_ALLERGENS,
      filteringActive: allergies.length > 0,
      hiddenProducts: 0 // Would calculate based on active allergies
    })
  } catch (error) {
    console.error('Allergy filter error:', error)
    return NextResponse.json({ allergies: [] })
  }
}

// POST - Update allergy settings
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { allergies, strictMode } = await req.json()

    await prisma.userBiometricProfile.upsert({
      where: { userId },
      update: {
        allergies: JSON.stringify(allergies),
        strictAllergyMode: strictMode,
        updatedAt: new Date()
      },
      create: {
        userId,
        allergies: JSON.stringify(allergies),
        strictAllergyMode: strictMode
      }
    })

    // Calculate affected tags
    const unsafeTags = allergies.flatMap((allergyId: string) => {
      const allergen = COMMON_ALLERGENS.find(a => a.id === allergyId)
      return allergen?.tags || []
    })

    return NextResponse.json({
      success: true,
      allergies,
      strictMode,
      message: `${allergies.length} allergies configured. ${unsafeTags.length} tags will be filtered.`,
      unsafeTags,
      warning: strictMode 
        ? 'Strict mode ON: Products with MAY CONTAIN warnings will also be hidden'
        : 'Standard mode: Only direct allergens hidden'
    })
  } catch (error) {
    console.error('Allergy update error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
