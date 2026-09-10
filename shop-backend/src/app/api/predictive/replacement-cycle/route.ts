// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get replacement cycle tracking for user's products
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ replacements: [] })
    }

    // Get user's order history
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

    // Product replacement cycles (in months)
    const replacementCycles: Record<string, number> = {
      'running shoes': 10,
      'sneakers': 12,
      'laptop': 36,
      'phone': 24,
      'headphones': 18,
      'mattress': 60,
      'pillow': 18,
      'toothbrush': 3,
      'razor': 6,
      'water filter': 6,
      'air filter': 3,
      'software license': 12,
      'subscription': 12
    }

    const now = new Date()
    const replacements = []

    for (const order of orders) {
      for (const item of order.items) {
        const product = item.product
        if (!product) continue

        const productName = product.name?.toLowerCase() || ''
        
        // Find matching replacement cycle
        let cycleMonths = 0
        let matchedType = ''
        
        for (const [type, months] of Object.entries(replacementCycles)) {
          if (productName.includes(type)) {
            cycleMonths = months
            matchedType = type
            break
          }
        }

        if (cycleMonths === 0) continue

        const purchaseDate = new Date(order.createdAt)
        const expectedReplaceDate = new Date(purchaseDate)
        expectedReplaceDate.setMonth(expectedReplaceDate.getMonth() + cycleMonths)

        const daysUntil = Math.ceil((expectedReplaceDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        const monthsUsed = (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
        const progress = Math.min(100, (monthsUsed / cycleMonths) * 100)

        let status = 'good'
        let message = `${daysUntil} days until replacement recommended`
        
        if (daysUntil <= 30 && daysUntil > 0) {
          status = 'approaching'
          message = `Replace soon! Only ${daysUntil} days left`
        } else if (daysUntil <= 0) {
          status = 'overdue'
          message = `Overdue by ${Math.abs(daysUntil)} days - consider replacing now`
        } else if (daysUntil <= 60) {
          status = 'warning'
          message = `Replacement approaching in ${Math.ceil(daysUntil / 30)} months`
        }

        replacements.push({
          id: `${order.id}-${item.id}`,
          productName: product.name,
          productId: product.id,
          productImage: product.imageUrl,
          purchaseDate: order.createdAt,
          expectedReplaceDate,
          cycleMonths,
          daysUntil,
          monthsUsed: Math.floor(monthsUsed),
          progress,
          status,
          message,
          matchedType,
          upgradeSuggestions: status !== 'good' ? await getUpgradeSuggestions(product) : []
        })
      }
    }

    // Sort by urgency
    replacements.sort((a, b) => a.daysUntil - b.daysUntil)

    return NextResponse.json({
      replacements,
      summary: {
        total: replacements.length,
        approaching: replacements.filter(r => r.status === 'approaching').length,
        overdue: replacements.filter(r => r.status === 'overdue').length,
        good: replacements.filter(r => r.status === 'good').length
      }
    })
  } catch (error) {
    console.error('Replacement cycle error:', error)
    return NextResponse.json({ replacements: [] })
  }
}

async function getUpgradeSuggestions(currentProduct: any) {
  // Find newer/better versions
  const suggestions = await prisma.product.findMany({
    where: {
      categoryId: currentProduct.categoryId,
      id: { not: currentProduct.id },
      price: { gte: currentProduct.price }
    },
    orderBy: { createdAt: 'desc' },
    take: 3
  })

  return suggestions.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    priceDiff: p.price - currentProduct.price,
    imageUrl: p.imageUrl
  }))
}
