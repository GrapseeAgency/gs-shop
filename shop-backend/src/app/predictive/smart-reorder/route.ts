import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get smart reorder suggestions
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ suggestions: [] })
    }

    // Get user's purchase history
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

    const suggestions = []
    const now = new Date()

    // Check for consumable products that might need reordering
    for (const order of orders.slice(0, 5)) {
      for (const item of order.items) {
        const product = item.product
        if (!product) continue

        // Check if it's a consumable/reorderable item
        const isConsumable = isConsumableProduct(product)
        if (!isConsumable) continue

        const purchaseDate = new Date(order.createdAt)
        const daysSince = Math.floor((now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24))
        
        // Estimate depletion time based on product type
        const depletionDays = getDepletionTime(product)
        
        if (daysSince >= depletionDays * 0.8) {
          // Time to reorder (80% depleted)
          suggestions.push({
            productId: product.id,
            productName: product.name,
            productImage: product.imageUrl,
            lastPurchased: order.createdAt,
            daysSince,
            estimatedDaysLeft: Math.max(0, depletionDays - daysSince),
            urgency: daysSince >= depletionDays ? 'high' : 'medium',
            oneClickReorder: true
          })
        }
      }
    }

    // Remove duplicates
    const unique = suggestions.filter((s, i, arr) => 
      arr.findIndex(t => t.productId === s.productId) === i
    )

    return NextResponse.json({
      suggestions: unique.slice(0, 5),
      autoReorderEnabled: unique.length > 0,
      message: unique.length > 0 
        ? `You may need to reorder ${unique.length} item(s) soon`
        : 'All stocked up! No reorder needed.'
    })
  } catch (error) {
    console.error('Smart reorder error:', error)
    return NextResponse.json({ suggestions: [] })
  }
}

// POST - Enable auto-reorder
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, threshold, frequency } = await req.json()

    const nextOrderDate = new Date()
    nextOrderDate.setDate(nextOrderDate.getDate() + (frequency === 'weekly' ? 7 : 30))

    await prisma.autoReorder.upsert({
      where: {
        productId
      },
      update: {
        threshold,
        frequency,
        status: 'active',
        nextOrder: nextOrderDate
      },
      create: {
        userId,
        productId,
        threshold,
        frequency,
        status: 'active',
        nextOrder: nextOrderDate
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Auto-reorder enabled! We\'ll remind you when it\'s time.',
      schedule: `Reorder every ${frequency} days when stock is low`
    })
  } catch (error) {
    console.error('Auto-reorder error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

function isConsumableProduct(product: any): boolean {
  const consumableKeywords = ['shampoo', 'soap', 'cream', 'lotion', 'supplement', 
    'vitamin', 'protein', 'coffee', 'tea', 'snack', 'food', 'beverage',
    'detergent', 'cleaner', 'paper', 'battery', 'cartridge']
  
  const name = product.name?.toLowerCase() || ''
  return consumableKeywords.some(k => name.includes(k))
}

function getDepletionTime(product: any): number {
  const name = product.name?.toLowerCase() || ''
  
  if (name.includes('shampoo') || name.includes('soap')) return 30
  if (name.includes('cream') || name.includes('lotion')) return 45
  if (name.includes('vitamin') || name.includes('supplement')) return 30
  if (name.includes('protein')) return 20
  if (name.includes('coffee') || name.includes('tea')) return 14
  if (name.includes('snack')) return 7
  if (name.includes('detergent') || name.includes('cleaner')) return 60
  if (name.includes('paper')) return 21
  if (name.includes('battery')) return 90
  
  return 30 // Default
}
