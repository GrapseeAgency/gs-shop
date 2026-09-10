// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get closet organization suggestions
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ suggestions: [] })
    }

    // Get user's clothing purchases
    const orders = await prisma.order.findMany({
      where: {
        customerEmail: userId,
        status: { not: 'cancelled' }
      },
      include: {
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const clothingItems = []
    for (const order of orders) {
      for (const item of order.items) {
        const product = item.product
        if (!product) continue
        
        // Check if clothing item
        const isClothing = product.category?.name?.toLowerCase().match(/clothing|fashion|apparel|wear/)
        if (isClothing) {
          clothingItems.push({
            id: item.id,
            name: product.name,
            color: product.color || 'unknown',
            category: product.category?.name,
            season: detectSeason(product.tags || '')
          })
        }
      }
    }

    // Generate organization suggestions
    const suggestions = generateOrganizationSuggestions(clothingItems)

    return NextResponse.json({
      totalItems: clothingItems.length,
      categories: groupByCategory(clothingItems),
      colorDistribution: groupByColor(clothingItems),
      suggestions,
      missingEssentials: findMissingEssentials(clothingItems)
    })
  } catch (error) {
    console.error('Closet organizer error:', error)
    return NextResponse.json({ suggestions: [] })
  }
}

function detectSeason(tags: string): string {
  const tag = tags.toLowerCase()
  if (tag.includes('winter') || tag.includes('coat') || tag.includes('sweater')) return 'winter'
  if (tag.includes('summer') || tag.includes('short') || tag.includes('tank')) return 'summer'
  if (tag.includes('spring') || tag.includes('light')) return 'spring'
  if (tag.includes('fall') || tag.includes('autumn')) return 'fall'
  return 'all-season'
}

function groupByCategory(items: any[]) {
  return items.reduce((acc, item) => {
    const cat = item.category || 'Other'
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

function groupByColor(items: any[]) {
  return items.reduce((acc, item) => {
    const color = item.color || 'unknown'
    acc[color] = (acc[color] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

function generateOrganizationSuggestions(items: any[]) {
  const suggestions = []

  // Color-based suggestion
  const colors = groupByColor(items)
  const dominantColor = Object.entries(colors as any).sort((a: any, b: any) => b[1] - a[1])[0]
  
  if (dominantColor && (dominantColor[1] as any) > items.length * 0.4) {
    suggestions.push({
      type: 'color_organization',
      message: `Organize by color - you have many ${dominantColor[0]} items`,
      priority: 'medium'
    })
  }

  // Seasonal rotation
  const seasons = items.reduce((acc, item) => {
    acc[item.season] = (acc[item.season] || 0) + 1
    return acc
  }, {} as any)

  if (seasons.winter > 0 && seasons.summer > 0) {
    suggestions.push({
      type: 'seasonal_rotation',
      message: 'Consider seasonal rotation - store off-season items',
      priority: 'high'
    })
  }

  return suggestions
}

function findMissingEssentials(items: any[]) {
  const essentials = ['white shirt', 'jeans', 'black pants', 'neutral sweater']
  const missing = []

  for (const essential of essentials) {
    const hasItem = items.some(item => 
      item.name.toLowerCase().includes(essential)
    )
    if (!hasItem) {
      missing.push(essential)
    }
  }

  return missing
}
