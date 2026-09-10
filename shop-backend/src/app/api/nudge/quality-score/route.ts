// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get quality score prediction for product
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        seller: true,
      }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Calculate quality score (0-100)
    let score = 50 // Base score

    // Rating factor (max 20 points)
    score += (product.rating || 3) * 4

    // Review count factor (max 10 points)
    score += Math.min(product.reviewCount / 10, 10)

    // Seller reputation (max 15 points)
    if (product.seller?.isVerified) score += 10
    if (product.seller?.rating && product.seller.rating > 4) score += 5

    // Price factor - reasonable pricing (max 10 points)
    const avgPriceInCategory = await prisma.product.aggregate({
      where: { categoryId: product.categoryId },
      _avg: { price: true }
    })
    const priceDiff = Math.abs(product.price - (avgPriceInCategory._avg.price || product.price))
    const priceVariance = priceDiff / (avgPriceInCategory._avg.price || 1)
    if (priceVariance < 0.2) score += 10 // Reasonably priced
    else if (priceVariance < 0.5) score += 5

    // Warranty factor (max 10 points)
    if (product.warrantyMonths && product.warrantyMonths > 0) {
      score += Math.min(product.warrantyMonths / 6, 10)
    }

    // Return policy (max 10 points)
    if (product.returnDays && product.returnDays >= 14) score += 10
    else if (product.returnDays && product.returnDays >= 7) score += 5

    // Material/quality indicators (max 15 points)
    const qualityKeywords = ['premium', 'quality', 'durable', 'genuine', 'authentic']
    const hasQualityKeywords = qualityKeywords.some(kw => 
      product.description?.toLowerCase().includes(kw) ||
      product.tags?.toLowerCase().includes(kw)
    )
    if (hasQualityKeywords) score += 10
    if (product.brand) score += 5

    score = Math.min(100, Math.round(score))

    // Predict lifespan based on score
    let predictedLifespan = '1-2 years'
    let quality = 'average'
    if (score >= 85) {
      predictedLifespan = '5+ years'
      quality = 'premium'
    } else if (score >= 70) {
      predictedLifespan = '3-5 years'
      quality = 'good'
    } else if (score >= 55) {
      predictedLifespan = '2-3 years'
      quality = 'average'
    } else {
      predictedLifespan = '1-2 years'
      quality = 'basic'
    }

    return NextResponse.json({
      product: {
        id: product.id,
        name: product.name
      },
      qualityScore: score,
      quality,
      predictedLifespan,
      breakdown: {
        ratingScore: Math.min(20, (product.rating || 3) * 4),
        reviewScore: Math.min(10, product.reviewCount / 10),
        sellerScore: (product.seller?.isVerified ? 10 : 0) + (product.seller?.rating > 4 ? 5 : 0),
        valueScore: priceVariance < 0.2 ? 10 : priceVariance < 0.5 ? 5 : 0,
        warrantyScore: Math.min(10, (product.warrantyMonths || 0) / 6),
        policyScore: (product.returnDays || 0) >= 14 ? 10 : (product.returnDays || 0) >= 7 ? 5 : 0
      },
      verdict: score >= 80 
        ? ' Excellent quality! Worth the investment.'
        : score >= 65
        ? ' Good quality product. Fair value.'
        : score >= 50
        ? ' Average quality. Consider carefully.'
        : ' Lower quality. Check reviews.',
      tip: 'Higher scores indicate better materials, warranty, and seller reputation.'
    })
  } catch (error) {
    console.error('Quality score error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
