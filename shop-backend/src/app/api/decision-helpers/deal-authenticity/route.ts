// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Check deal authenticity with price history
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { priceHistory: { orderBy: { recordedAt: 'desc' } } }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const history = product.priceHistory
    const currentPrice = product.price
    const discountPercent = product.compareAtPrice 
      ? Math.round(((product.compareAtPrice - currentPrice) / product.compareAtPrice) * 100)
      : 0

    // Check if this is a real discount
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    const recentPrices = history.filter(h => new Date(h.recordedAt) >= ninetyDaysAgo)
    
    let isRealDeal = false
    let priceAnalysis = ''

    if (recentPrices.length > 0) {
      const avgPrice = recentPrices.reduce((sum, h) => sum + h.price, 0) / recentPrices.length
      const lowestPrice = Math.min(...recentPrices.map(h => h.price))
      
      if (currentPrice <= lowestPrice) {
        isRealDeal = true
        priceAnalysis = 'This is the lowest price in 90 days!'
      } else if (currentPrice <= avgPrice * 0.9) {
        isRealDeal = true
        priceAnalysis = 'Price is below 90-day average - genuine discount'
      } else {
        isRealDeal = false
        priceAnalysis = 'Price has been lower before - not the best deal'
      }
    }

    return NextResponse.json({
      product: {
        id: product.id,
        name: product.name,
        currentPrice,
        claimedDiscount: discountPercent
      },
      priceHistory: recentPrices.slice(0, 30),
      dealCheck: {
        isRealDeal,
        analysis: priceAnalysis,
        lowestPrice90Days: recentPrices.length > 0 ? Math.min(...recentPrices.map(h => h.price)) : currentPrice,
        averagePrice90Days: recentPrices.length > 0 
          ? Math.round(recentPrices.reduce((sum, h) => sum + h.price, 0) / recentPrices.length)
          : currentPrice
      },
      verdict: isRealDeal
        ? ' AUTHENTIC DEAL - This is a genuine discount'
        : ' INFLATED PRICE - Wait for a better deal',
      recommendation: isRealDeal
        ? 'Buy now! This is the best price in the last 90 days.'
        : 'Price has been lower before. Set a price alert and wait.'
    })
  } catch (error) {
    console.error('Deal authenticity error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
