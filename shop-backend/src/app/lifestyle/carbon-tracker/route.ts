import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get carbon footprint tracking
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ footprint: 0, offset: 0 })
    }

    const orders = await prisma.order.findMany({
      where: {
        customerEmail: userId,
        status: { not: 'cancelled' }
      },
      include: {
        items: {
          include: { product: true }
        },
        delivery: true
      }
    })

    let totalFootprint = 0
    let totalOffset = 0
    const categoryBreakdown: Record<string, number> = {}

    for (const order of orders) {
      // Product manufacturing footprint
      for (const item of order.items) {
        const product = item.product
        if (!product) continue

        // Estimate based on category
        const footprint = estimateProductFootprint(product, item.quantity)
        totalFootprint += footprint

        const cat = product.tags?.toLowerCase().includes('electronics') ? 'Electronics' : 'Other'
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + footprint
      }

      // Delivery footprint
      if (order.delivery) {
        const deliveryFootprint = estimateDeliveryFootprint(order.delivery)
        totalFootprint += deliveryFootprint
        categoryBreakdown['Shipping'] = (categoryBreakdown['Shipping'] || 0) + deliveryFootprint
      }

      // Check for carbon offset purchases
      const hasOffset = order.items.some(item => 
        item.product?.tags?.includes('carbon-offset')
      )
      if (hasOffset) {
        totalOffset += 10 // kg CO2 per offset
      }
    }

    const netFootprint = totalFootprint - totalOffset

    return NextResponse.json({
      totalFootprint: Math.round(totalFootprint),
      totalOffset: Math.round(totalOffset),
      netFootprint: Math.round(netFootprint),
      ordersCounted: orders.length,
      categoryBreakdown,
      comparison: {
        averageUser: 150, // kg CO2 per month
        yourAverage: Math.round(totalFootprint / Math.max(1, orders.length)),
        percentile: totalFootprint < 100 ? 'low' : totalFootprint < 300 ? 'average' : 'high'
      },
      recommendations: generateCarbonRecommendations(netFootprint, categoryBreakdown)
    })
  } catch (error) {
    console.error('Carbon tracker error:', error)
    return NextResponse.json({ footprint: 0 })
  }
}

function estimateProductFootprint(product: any, quantity: number): number {
  const categoryMultipliers: Record<string, number> = {
    'Electronics': 50,
    'Clothing': 10,
    'Furniture': 30,
    'Books': 2,
    'Food': 5,
    'Beauty': 3
  }

  const multiplier = categoryMultipliers[product.category?.name || ''] || 15
  return multiplier * quantity
}

function estimateDeliveryFootprint(delivery: any): number {
  // Based on distance - [] calculation
  const distance = Math.random() * 50 + 10 // km
  return distance * 0.1 // kg CO2 per km
}

function generateCarbonRecommendations(footprint: number, breakdown: Record<string, number>) {
  const recommendations = []

  // Find highest category
  const highest = Object.entries(breakdown)
    .sort((a, b) => b[1] - a[1])[0]

  if (highest && highest[0] === 'Electronics') {
    recommendations.push({
      type: 'eco_alternative',
      message: 'Consider refurbished electronics to reduce footprint',
      priority: 'high'
    })
  }

  if (footprint > 200) {
    recommendations.push({
      type: 'offset',
      message: 'Your footprint is above average. Consider carbon offsets.',
      priority: 'medium'
    })
  }

  recommendations.push({
    type: 'tip',
    message: 'Choose local sellers to reduce shipping emissions',
    priority: 'low'
  })

  return recommendations
}
