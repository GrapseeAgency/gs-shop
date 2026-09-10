import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/reviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const all = searchParams.get('all') === 'true'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))

    const skip = (page - 1) * limit

    // If "all" param or no productId, return all reviews
    if (all || !productId) {
      const where = productId ? { productId } : {}

      const [data, total] = await Promise.all([
        prisma.review.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        }),
        prisma.review.count({ where }),
      ])

      // Flatten product info into review objects
      const reviews = data.map((r) => ({
        ...r,
        productName: r.product?.name || null,
        productImage: r.product?.imageUrl || null,
      }))

      return NextResponse.json({
        data: reviews,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      })
    }

    // Original: Get reviews for a specific product
    const [data, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { productId } }),
    ])

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// POST /api/reviews
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { productId, author, rating, comment } = body

    if (!productId || !author || !rating || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, author, rating, and comment are required' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Verify product exists
    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const review = await prisma.review.create({
      data: {
        productId,
        author,
        rating: parseInt(String(rating)),
        comment,
        // Note: avatar doesn't exist in Review schema
        isVerified: false,
      },
    })

    // Update product rating and review count
    const reviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    })
    const avgRating = reviews.length
    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length,
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
