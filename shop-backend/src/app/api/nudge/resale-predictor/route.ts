// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get resale value predictions
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true, reviews: true }
      })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Calculate resale value prediction
    const retentionRates: Record<string, number> = {
      'electronics': 0.7,
      'software': 0.4,
      'templates': 0.5,
      'courses': 0.6,
      'ebooks': 0.3,
      'digital': 0.4
    }

    const brandMultiplier = product.brand && ['Apple', 'Nike', 'Sony'].some(b => product.name?.includes(b)) ? 1.2 : 1
    const ratingBoost = product.rating ? (product.rating / 5) * 0.1 : 0
    const reviewBoost = product.reviewCount ? (product.reviewCount / 100) * 0.05 : 0
    const categoryRate = retentionRates[product.category?.name?.toLowerCase()] || 0.5
    const adjustedRate = categoryRate * brandMultiplier + ratingBoost + reviewBoost

    const currentPrice = product.price
    const predictions = []

    for (let year = 1; year <= 3; year++) {
      const value = currentPrice * Math.pow(adjustedRate, year)
      predictions.push({
        year,
        value: Math.round(value),
        percentage: Math.round((value / currentPrice) * 100)
      })
    }

    // Compare to similar products
    const similarProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: productId }
      },
      take: 5
    })

    const avgRetention = similarProducts.reduce((sum, p) => {
      const rate = retentionRates[p.category?.name?.toLowerCase()] || 0.5
      return sum + rate
    }, 0) / (similarProducts.length || 1)

    return NextResponse.json({
      product: {
        id: product.id,
        name: product.name,
        currentPrice
      },
      predictions,
      retentionRate: adjustedRate,
      comparison: {
        betterThanAverage: adjustedRate > avgRetention,
        averageRetention: avgRetention,
              },
      verdict: adjustedRate > 0.6 
        ? ' Excellent resale value! Good investment.'
        : adjustedRate > 0.4
        ? ' Decent resale value. Consider carefully.'
        : ' Lower resale value. Buy for utility, not resale.',
      tip: 'Higher quality products from reputable brands typically retain value better.'
    })
  } catch (error) {
    console.error('Resale predictor error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
