import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/reviews?productId=xxx&all=true&limit=20&page=1 Get reviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const all = searchParams.get('all') === 'true'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))

    const skip = (page - 1) * limit

    // If "all" param or no productId, return all reviews with product info
    if (all || !productId) {
      const where = productId ? { productId } : {}

      const [data, total] = await Promise.all([
        db.review.findMany({
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
        db.review.count({ where
      }),
      ])

      // Flatten product info into review objects
      const reviews = data.map(r => ({
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
      db.review.findMany({
        where: { productId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.review.count({ where: { productId } }),
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

// POST /api/reviews Create a new review
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { productId, author, rating, comment, avatar } = body

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
    const product = await db.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const review = await db.review.create({
      data: {
        productId,
        author,
        rating: parseInt(String(rating)),
        comment,
        avatar: avatar || null,
        isVerified: false,
      },
    })

    // Update product rating and review count
    const reviews = await db.review.findMany({
      where: { productId },
      select: { rating: true },
    })
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

    await db.product.update({
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
