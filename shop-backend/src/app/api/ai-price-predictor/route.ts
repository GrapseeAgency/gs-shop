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
      marketTrend: {
        seasonalFactor: getSeasonalFactor(product.categoryId)
      }
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

function getSeasonalFactor(categoryId: string) {
  const month = new Date().getMonth()
  // Simplified seasonal logic
  const factors: Record<string, string> = {
    'electronics': month === 10 || month === 11 ? 'high_demand' : 'normal',
    'fashion': month === 2 || month === 8 ? 'seasonal_change' : 'normal',
    'home': month === 3 || month === 4 ? 'spring_cleaning' : 'normal'
  }
  return factors[categoryId] || 'normal'
}
