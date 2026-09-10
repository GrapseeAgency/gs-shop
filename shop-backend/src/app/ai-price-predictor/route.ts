import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Predict price changes for a product
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    // Get price history
    const priceHistory = await prisma.priceHistory.findMany({
      where: { productId },
      orderBy: { recordedAt: 'asc' },
      take: 90
    })

    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        price: true,
        categoryId: true,
        isOnSale: true
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Simple prediction algorithm
    const prediction = calculatePricePrediction(priceHistory, product)

    // Get similar product trends
    const similarProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: productId }
      },
      take: 5
    })

    return NextResponse.json({
      product: {
        id: product.id,
        name: product.name,
        currentPrice: product.price
      },
      prediction: {
        trend: prediction.trend,
        predictedDrop: prediction.predictedDrop,
        confidence: prediction.confidence,
        bestTimeToBuy: prediction.bestTimeToBuy,
        estimatedDropDate: prediction.estimatedDropDate,
        recommendedAction: prediction.recommendedAction
      },
      priceHistory: priceHistory.map(h => ({
        date: h.recordedAt,
        price: h.price
      })),
      marketTrend: await calculateMarketTrend(product.categoryId, productId)
    })
  } catch (error) {
    console.error('Price predictor error:', error)
    return NextResponse.json({ error: 'Prediction failed' }, { status: 500 })
  }
}

// POST - Track price alert subscription
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, targetPrice } = await req.json()

    await prisma.priceAlert.create({
      data: {
        userId,
        productId,
        targetPrice,
        type: 'target'
      }
    })

    return NextResponse.json({
      success: true,
      message: `We'll notify you when price drops to $${targetPrice}`
    })
  } catch (error) {
    console.error('Price alert error:', error)
    return NextResponse.json({ error: 'Failed to set alert' }, { status: 500 })
  }
}

function calculatePricePrediction(history: any[], product: any) {
  if (history.length < 7) {
    return {
      trend: 'stable',
      predictedDrop: 0,
      confidence: 0.3,
      bestTimeToBuy: 'now',
      estimatedDropDate: null,
      recommendedAction: 'buy_now'
    }
  }

  // Calculate trend
  const recent = history.slice(-7)
  const old = history.slice(0, 7)
  
  const recentAvg = recent.reduce((sum, h) => sum + h.price, 0) / recent.length
  const oldAvg = old.reduce((sum, h) => sum + h.price, 0) / old.length
  
  const trend = recentAvg < oldAvg ? 'dropping' : recentAvg > oldAvg ? 'rising' : 'stable'
  
  // Predict based on trend
  const volatility = history.length > 14 ? 0.7 : 0.4
  
  if (trend === 'dropping') {
    return {
      trend,
      predictedDrop: Math.round((oldAvg - recentAvg) / oldAvg * 100 * 2), // Project 2 weeks
      confidence: 0.75,
      bestTimeToBuy: 'wait_1_week',
      estimatedDropDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      recommendedAction: 'wait'
    }
  }

  if (trend === 'rising') {
    return {
      trend,
      predictedDrop: 0,
      confidence: 0.8,
      bestTimeToBuy: 'now',
      estimatedDropDate: null,
      recommendedAction: 'buy_now'
    }
  }

  return {
    trend,
    predictedDrop: 0,
    confidence: 0.5,
    bestTimeToBuy: 'now',
    estimatedDropDate: null,
    recommendedAction: 'buy_or_wait'
  }
}

// Calculate market trend based on real price history data from similar products
async function calculateMarketTrend(categoryId: string, excludeProductId: string) {
  const now = new Date()
  const month = now.getMonth()

  // Get price history for similar products in the same category (last 30 days)
  const similarProductsHistory = await prisma.priceHistory.findMany({
    where: {
      product: {
        categoryId: categoryId,
        id: { not: excludeProductId }
      },
      recordedAt: {
        gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      }
    },
    orderBy: { recordedAt: 'asc' },
    take: 100
  })

  // Calculate trend based on actual price movements
  let risingCount = 0
  let droppingCount = 0
  let stableCount = 0

  for (let i = 1; i < similarProductsHistory.length; i++) {
    const prev = similarProductsHistory[i - 1].price
    const curr = similarProductsHistory[i].price
    const change = ((curr - prev) / prev) * 100

    if (change > 2) risingCount++
    else if (change < -2) droppingCount++
    else stableCount++
  }

  const total = risingCount + droppingCount + stableCount
  let trend = 'stable'
  if (total > 0) {
    if (risingCount > droppingCount && risingCount > stableCount) trend = 'up'
    else if (droppingCount > risingCount && droppingCount > stableCount) trend = 'down'
  }

  // Get category name for seasonal factor
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { name: true }
  })

  const categoryName = category?.name?.toLowerCase() || ''

  // Calculate seasonal factor based on current month and category
  let seasonalFactor = 'normal'

  // Holiday season (Nov-Dec) - high demand for most categories
  if (month === 10 || month === 11) {
    seasonalFactor = 'high_demand'
  }
  // New Year sales (Jan)
  else if (month === 0) {
    seasonalFactor = 'post_holiday_sales'
  }
  // Spring season (Mar-Apr) - fashion, home & garden
  else if ((month === 2 || month === 3) &&
    (categoryName.includes('fashion') || categoryName.includes('home') || categoryName.includes('garden'))) {
    seasonalFactor = 'spring_season'
  }
  // Summer season (Jun-Aug) - electronics, travel
  else if ((month >= 5 && month <= 7) &&
    (categoryName.includes('electronics') || categoryName.includes('travel'))) {
    seasonalFactor = 'summer_demand'
  }
  // Back to school (Aug-Sep)
  else if ((month === 7 || month === 8) &&
    (categoryName.includes('electronics') || categoryName.includes('stationery'))) {
    seasonalFactor = 'back_to_school'
  }

  return {
    similarProductsTrending: trend,
    seasonalFactor,
    dataPoints: total
  }
}
