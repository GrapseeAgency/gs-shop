import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Predict price drops
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')
    const userId = req.headers.get('x-user-id')

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { priceHistory: { orderBy: { recordedAt: 'desc' }, take: 10 } }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Analyze price history
    const history = product.priceHistory
    let trend = 'stable'
    let dropProbability = 30

    if (history.length >= 3) {
      const recent = history.slice(0, 3)
      const isDecreasing = recent.every((p, i, arr) => 
        i === 0 || p.price <= arr[i-1].price
      )
      
      if (isDecreasing) {
        trend = 'decreasing'
        dropProbability = 70
      }

      // Check for seasonal patterns
      const seasonalDrops = history.filter(h => {
        const month = new Date(h.recordedAt).getMonth()
        return month === 10 || month === 11 // Nov-Dec sales
      })
      
      if (seasonalDrops.length > 0) {
        dropProbability += 15
      }
    }

    // Predict best time to buy
    const bestTime = predictBestTimeToBuy(product, history)

    // Get user's watchlist status
    let isWatching = false
    if (userId) {
      const watch = await prisma.priceAlert.findFirst({
        where: { userId, productId }
      })
      isWatching = !!watch
    }

    return NextResponse.json({
      product: {
        id: product.id,
        name: product.name,
        currentPrice: product.price
      },
      prediction: {
        trend,
        dropProbability,
        confidence: Math.min(95, dropProbability + 20),
        bestTimeToBuy: bestTime
      },
      isWatching,
      recommendation: dropProbability > 60
        ? ' Prices likely to drop. Consider waiting.'
        : dropProbability > 40
        ? ' Prices may drop. Set alert to be notified.'
        : ' Prices stable. Good time to buy.',
      similarProducts: await getSimilarProducts(product)
    })
  } catch (error) {
    console.error('Price predictor error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

function predictBestTimeToBuy(product: any, history: any[]) {
  const now = new Date()
  const currentMonth = now.getMonth()
  
  // Sale seasons
  const saleMonths = [10, 11, 0, 5] // Nov, Dec, Jan, Jun
  
  if (saleMonths.includes(currentMonth)) {
    return {
      when: 'Now!',
      reason: 'Sale season is here',
      savings: '15-30%'
    }
  }

  const nextSale = saleMonths.find(m => m > currentMonth) || saleMonths[0]
  const monthsUntil = nextSale > currentMonth 
    ? nextSale - currentMonth 
    : 12 - currentMonth + nextSale

  return {
    when: monthsUntil <= 2 ? 'Soon' : `${monthsUntil} months`,
    reason: 'Next major sale period',
    expectedDrop: '15-25%'
  }
}

async function getSimilarProducts(product: any) {
  return await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      price: { lt: product.price }
    },
    orderBy: { price: 'desc' },
    take: 3
  })
}
