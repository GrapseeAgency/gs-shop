import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/product-ratings Return rating summary for a product
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Try to fetch ratings from ProductRating table
    let aspectRatings: Array<Record<string, unknown>> = []
    let ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    let totalRatings = 0
    let averageRating = 0

    try {
      // Get all ratings for this product
      const ratings = await prisma.productRating.findMany({
        where: { productId },
      })

      totalRatings = ratings.length

      if (totalRatings > 0) {
        // Calculate average
        const sum = ratings.reduce((acc, r) => acc + r.rating, 0)
        averageRating = Math.round((sum / totalRatings) * 10) / 10

        // Calculate distribution
        for (let i = 1; i <= 5; i++) {
          ratingDistribution[i] = ratings.filter(r => r.rating === i).length
        }

        // Calculate aspect averages
        const aspectGroups: Record<string, number[]> = {}
        for (const rating of ratings) {
          if (rating.aspect) {
            if (!aspectGroups[rating.aspect]) {
              aspectGroups[rating.aspect] = []
            }
            aspectGroups[rating.aspect].push(rating.rating)
          }
        }

        aspectRatings = Object.entries(aspectGroups).map(([aspect, values]) => ({
          aspect,
          averageRating: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10,
          count: values.length,
        }))
      }
    } catch {
      // Table might not exist yet, fall back to Review model
    }

    // If no ProductRating data, try Review model
    if (totalRatings === 0) {
      try {
        const reviews = await prisma.review.findMany({
      where: { productId },
        })

        totalRatings = reviews.length
        if (totalRatings > 0) {
          const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
          averageRating = Math.round((sum / totalRatings) * 10) / 10

          for (let i = 1; i <= 5; i++) {
            ratingDistribution[i] = reviews.filter(r => r.rating === i).length
          }

          // Default aspect ratings based on overall rating
          const defaultAspects = ['quality', 'value', 'design', 'durability']
          aspectRatings = defaultAspects.map(aspect => ({
            aspect,
            count: totalRatings,
          }))
        }
      } catch {
        // No review data either
      }
    }

    // Calculate percentages for distribution
    const distributionPercent = Object.fromEntries(
      Object.entries(ratingDistribution).map(([star, count]) => [
        star,
        totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0,
      ])
    )

    // Rating summary
    const summary = {
      productId,
      averageRating,
      totalRatings,
      ratingDistribution,
      distributionPercent,
      aspectRatings,
      ratingTrend: totalRatings > 10 ? 'stable' : totalRatings > 0 ? 'growing' : 'new',
      recommendation: averageRating >= 4
        ? 'highly_recommended'
        : averageRating >= 3
          ? 'recommended'
          : averageRating > 0
            ? 'mixed'
            : 'no_data',
    }

    return NextResponse.json({ data: summary })
  } catch (error) {
    console.error('Product ratings fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product ratings' },
      { status: 500 }
    )
  }
}

// POST /api/product-ratings Create a product rating
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, rating, aspect, author } = body

    // Validate required fields
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Validate aspect if provided
    const validAspects = ['quality', 'value', 'design', 'durability', 'packaging']
    if (aspect && !validAspects.includes(aspect)) {
      return NextResponse.json(
        { error: `Invalid aspect. Must be one of: ${validAspects.join(', ')}` },
        { status: 400 }
      )
    }

    // Verify product exists
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      })
      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }
    } catch {
      // Product lookup failed, still create the rating
    }

    // Create the rating
    const productRating = await prisma.productRating.create({
      data: {
        productId,
        rating,
        aspect: aspect || null,
      },
    })

    // Update product's overall rating
    try {
      const allRatings = await prisma.productRating.findMany({
        where: { productId, aspect: null },
      })

      if (allRatings.length > 0) {
        const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
        await prisma.product.update({
          where: { id: productId },
          data: {
            rating: Math.round(avgRating * 10) / 10,
            reviewCount: allRatings.length,
          },
        })
      }
    } catch {
      // Product update failed
    }

    return NextResponse.json({
      success: true,
      rating: {
        id: productRating.id,
        productId: productRating.productId,
        rating: productRating.rating,
        aspect: productRating.aspect,
        createdAt: productRating.createdAt,
      },
      message: aspect
        ? `Rated ${aspect}: ${rating}/5`
        : `Rated ${rating}/5`,
    }, { status: 201 })
  } catch (error) {
    console.error('Product rating creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create product rating' },
      { status: 500 }
    )
  }
}
