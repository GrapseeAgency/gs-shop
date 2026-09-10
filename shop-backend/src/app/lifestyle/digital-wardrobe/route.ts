import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get digital wardrobe
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ items: [], combinations: [] })
    }

    // Get clothing purchases
    const orders = await prisma.order.findMany({
      where: {
        customerEmail: userId,
        status: { not: 'cancelled' }
      },
      include: {
        items: {
          include: {
            product: {
              include: { category: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Extract clothing items
    const wardrobeItems = []
    for (const order of orders) {
      for (const item of order.items) {
        const product = item.product
        if (!product) continue

        const isClothing = product.category?.name?.toLowerCase().match(/clothing|fashion|apparel|wear/)
        if (isClothing) {
          wardrobeItems.push({
            id: item.id,
            productId: product.id,
            name: product.name,
            imageUrl: product.imageUrl,
            color: product.color || 'unknown',
            size: product.size || 'unknown',
            category: product.category?.name,
            purchasedAt: order.createdAt,
            price: product.price
          })
        }
      }
    }

    // Generate outfit combinations
    const combinations = generateOutfitCombinations(wardrobeItems)

    return NextResponse.json({
      items: wardrobeItems,
      totalItems: wardrobeItems.length,
      categories: groupByCategory(wardrobeItems),
      combinations: combinations.slice(0, 10),
      styleInsights: generateStyleInsights(wardrobeItems)
    })
  } catch (error) {
    console.error('Digital wardrobe error:', error)
    return NextResponse.json({ items: [], combinations: [] })
  }
}

// POST - Save outfit combination
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { items, name } = await req.json()

    const outfit = await prisma.savedOutfit.create({
      data: {
        userId,
        name: name || `Outfit ${Date.now()}`,
        items: JSON.stringify(items),
        totalPrice: 0
      }
    })

    return NextResponse.json({
      success: true,
      outfit,
      message: 'Outfit saved to your digital wardrobe!'
    })
  } catch (error) {
    console.error('Save outfit error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

function groupByCategory(items: any[]) {
  const groups: Record<string, any[]> = {}
  items.forEach(item => {
    const cat = item.category || 'Other'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(item)
  })
  return groups
}

function generateOutfitCombinations(items: any[]) {
  const tops = items.filter(i => i.category?.toLowerCase().includes('top') || i.category?.toLowerCase().includes('shirt'))
  const bottoms = items.filter(i => i.category?.toLowerCase().includes('bottom') || i.category?.toLowerCase().includes('pant'))
  
  const combinations = []
  for (const top of tops.slice(0, 5)) {
    for (const bottom of bottoms.slice(0, 5)) {
      combinations.push({
        id: `${top.id}-${bottom.id}`,
        top,
        bottom,
        matchScore: calculateMatchScore(top, bottom)
      })
    }
  }
  
  return combinations.sort((a, b) => b.matchScore - a.matchScore)
}

function calculateMatchScore(top: any, bottom: any) {
  let score = 50 // Base score
  if (top.color === bottom.color) score += 20
  if (top.purchasedAt && bottom.purchasedAt && 
      Math.abs(new Date(top.purchasedAt).getTime() - new Date(bottom.purchasedAt).getTime()) < 30 * 24 * 60 * 60 * 1000) {
    score += 15 // Bought around same time
  }
  return Math.min(100, score)
}

function generateStyleInsights(items: any[]) {
  const colors = items.map(i => i.color).filter(Boolean)
  const uniqueColors = [...new Set(colors)]
  
  return {
    favoriteColors: uniqueColors.slice(0, 3),
    totalSpent: items.reduce((sum, i) => sum + (i.price || 0), 0),
    wardrobeDiversity: uniqueColors.length > 5 ? 'diverse' : uniqueColors.length > 3 ? 'moderate' : 'focused',
    suggestion: uniqueColors.length < 3 ? 'Consider adding more color variety!' : 'Great color diversity!'
  }
}
