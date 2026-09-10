import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Track wishlist value fluctuations
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ totalValue: 0, fluctuation: 0 })
    }

    // Get wishlist items
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId }
    })

    // Fetch products separately
    const productIds = wishlistItems.map(w => w.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    })
    const productMap = new Map(products.map(p => [p.id, p]))

    let totalValue = 0
    let originalValue = 0
    const itemDetails = []

    for (const item of wishlistItems) {
      const product = productMap.get(item.productId)
      if (!product) continue

      const currentPrice = product.price
      const priceHistory = await prisma.priceHistory.findFirst({
        where: { productId: product.id },
        orderBy: { recordedAt: 'desc' },
        skip: 1
      })

      const previousPrice = priceHistory?.price || currentPrice
      const fluctuation = currentPrice - previousPrice

      totalValue += currentPrice
      originalValue += previousPrice

      itemDetails.push({
        productId: product.id,
        name: product.name,
        currentPrice,
        previousPrice,
        fluctuation,
        percentChange: ((fluctuation / previousPrice) * 100).toFixed(1),
        trend: fluctuation < 0 ? 'dropped' : fluctuation > 0 ? 'increased' : 'stable'
      })
    }

    const totalFluctuation = totalValue - originalValue
    const percentChange = originalValue > 0 ? ((totalFluctuation / originalValue) * 100).toFixed(1) : 0

    // Find best day to buy
    const predictions = await prisma.pricePrediction.findMany({
      where: {
        productId: { in: wishlistItems.map(i => i.productId) }
      }
    })

    const bestDay = predictions.length > 0 
      ? predictions.reduce((best, p) => p.predictedPrice < best.predictedPrice ? p : best)
      : null

    return NextResponse.json({
      totalValue,
      originalValue,
      fluctuation: totalFluctuation,
      percentChange,
      trend: totalFluctuation < 0 ? 'savings' : totalFluctuation > 0 ? 'increase' : 'stable',
      items: itemDetails,
      bestDayToBuy: bestDay ? {
        date: bestDay.predictedDate,
        expectedSavings: originalValue - bestDay.predictedPrice
      } : null,
      recommendation: totalFluctuation < 0 
        ? 'Your wishlist value dropped! Good time to buy.'
        : totalFluctuation > 0
        ? ' Prices increased. Consider waiting for drops.'
        : ' Prices are stable.'
    })
  } catch (error) {
    console.error('Wishlist value error:', error)
    return NextResponse.json({ totalValue: 0, fluctuation: 0 })
  }
}
