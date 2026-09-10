import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Smart fridge integration for auto-reorder
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { fridgeItems, lowStockItems } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fridge data processing mock

    const reorderSuggestions = []

    for (const item of lowStockItems) {
      // Find matching products
      const products = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: item.name } },
            { tags: { contains: item.name.toLowerCase() } }
          ]
        },
        take: 3
      })

      if (products.length > 0) {
        reorderSuggestions.push({
          item: item.name,
          currentLevel: item.currentLevel,
          threshold: item.threshold,
          products,
          urgency: item.currentLevel < item.threshold * 0.3 ? 'high' : 'medium'
        })
      }
    }

    return NextResponse.json({
      connected: true,
      synced: true,
      itemsTracked: fridgeItems.length,
      lowStock: lowStockItems.length,
      reorderSuggestions,
      autoReorderEnabled: reorderSuggestions.length > 0,
      message: reorderSuggestions.length > 0
        ? `Detected ${lowStockItems.length} items running low. Auto-reorder suggestions ready.`
        : 'All items well stocked!'
    })
  } catch (error) {
    console.error('Smart fridge error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// GET - Get fridge status
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ connected: false })

    return NextResponse.json({
      connected: false,
      items: [],
      lastSync: null
    })
  } catch (error) {
    console.error('Fridge status error:', error)
    return NextResponse.json({ connected: false })
  }
}
