import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Check product for allergens
export async function POST(req: NextRequest) {
  try {
    const { productId } = await req.json()
    const userId = req.headers.get('x-user-id')

    // Get user's allergies
    let userAllergies: string[] = []
    if (userId) {
      const profile = await prisma.healthProfile.findUnique({
        where: { userId }
      })
      if (profile?.allergies) {
        userAllergies = JSON.parse(profile.allergies)
      }
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check tags/description for allergens
    const searchText = (product.tags + ' ' + product.description + ' ' + product.name).toLowerCase()
    const alerts: string[] = []

    for (const allergy of userAllergies) {
      if (searchText.includes(allergy.toLowerCase())) {
        alerts.push(` May contain ${allergy}`)
      }
    }

    // Common allergen check
    const commonAllergens = [
      { name: 'nuts', icon: '' },
      { name: 'gluten', icon: '' },
      { name: 'dairy', icon: '' },
      { name: 'soy', icon: '' },
      { name: 'shellfish', icon: '' }
    ]

    const detectedCommon = commonAllergens.filter(a => 
      searchText.includes(a.name)
    )

    return NextResponse.json({
      product: {
        id: product.id,
        name: product.name
      },
      userAllergies,
      alerts,
      isSafe: alerts.length === 0,
      commonAllergens: detectedCommon,
      ingredients: product.ingredients,
      message: alerts.length > 0
        ? ` WARNING: This product contains ${alerts.length} of your allergens!`
        : ' Safe! No allergens detected.',
      alternatives: alerts.length > 0 ? [] : null // Would fetch alternatives
    })
  } catch (error) {
    console.error('Allergy check error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// POST - Set user allergies
export async function PATCH(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { allergies } = await req.json()

    await prisma.healthProfile.upsert({
      where: { userId },
      update: {
        allergies: JSON.stringify(allergies),
        updatedAt: new Date()
      },
      create: {
        userId,
        allergies: JSON.stringify(allergies)
      }
    })

    return NextResponse.json({
      success: true,
      allergies,
      message: `Allergies saved: ${allergies.join(', ')}. We'll warn you for these ingredients.`
    })
  } catch (error) {
    console.error('Allergy save error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
