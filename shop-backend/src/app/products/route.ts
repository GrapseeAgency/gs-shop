import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const trending = searchParams.get('trending')
    const isNew = searchParams.get('new')
    const deals = searchParams.get('deals')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'order'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))

    const where: Record<string, unknown> = { isActive: true }

    if (category) {
      where.category = { slug: category }
    }

    if (featured === 'true') {
      where.isFeatured = true
    }

    if (trending === 'true') {
      where.isTrending = true
    }

    if (isNew === 'true') {
      where.isNew = true
    }

    if (deals === 'true') {
      where.isFlashDeal = true
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
      ]
    }

    // Determine sort order
    let orderBy: Record<string, string> = { order: 'asc' }
    if (sort === 'price-asc') orderBy = { price: 'asc' }
    else if (sort === 'price-desc') orderBy = { price: 'desc' }
    else if (sort === 'rating') orderBy = { rating: 'desc' }
    else if (sort === 'newest') orderBy = { createdAt: 'desc' }
    else if (sort === 'popular') orderBy = { reviewCount: 'desc' }

    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: {
            select: { id: true, name: true, slug: true, icon: true, color: true },
          },
        },
      }),
      db.product.count({ where
      }),
    ])

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
