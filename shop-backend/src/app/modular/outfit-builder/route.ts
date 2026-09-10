import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get outfit builder data
export async function GET(req: NextRequest) {
  try {
    // Get clothing categories
    const categories = []
    
    const productsByCategory: Record<string, any[]> = {}
    
    for (const category of categories) {
      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          tags: { contains: category }
        },
        take: 20
      })
      productsByCategory[category] = products
    }

    return NextResponse.json({
      categories: productsByCategory,
      mannequinStyles: ['casual', 'formal', 'sporty', 'business'],
      totalCombinations: Object.values(productsByCategory).reduce(
        (acc, cat) => acc * (cat.length || 1), 1
      )
    })
  } catch (error) {
    console.error('Outfit builder error:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

// POST - Save outfit combination
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { outfit, totalPrice, name } = await req.json()

    const savedOutfit = {
      id: 'mock-' + Date.now(),
      userId,
      name: name || `Outfit ${Date.now()}`,
      items: JSON.stringify(outfit),
      totalPrice
    }

    return NextResponse.json({
      success: true,
      outfit: savedOutfit,
      message: 'Outfit saved!',
      checkoutUrl: `/checkout?outfit=${savedOutfit.id}`
    })
  } catch (error) {
    console.error('Outfit save error:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
