import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const featured = searchParams.get('featured') === 'true'
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'))

    // Build where clause
    const where: any = {
      isActive: true,
    }

    if (type && ['seasonal', 'curated', 'staff_pick', 'trending', 'brand'].includes(type)) {
      where.type = type
    }

    if (featured) {
      where.isFeatured = true
    }

    const collections = await prisma.collection.findMany({
      where,
      orderBy: [
        { isFeatured: 'desc' },
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      skip: offset,
    })

    // Enrich collections with products
    const enrichedCollections = await Promise.all(
      collections.map(async (collection) => {
        let products: any[] = []
        let productCount = 0

        if (collection.productIds) {
          try {
            const productIds: string[] = JSON.parse(collection.productIds)
            if (productIds.length > 0) {
              // Get total count first
              productCount = await prisma.product.count({
                where: { 
                  id: { in: productIds },
                  isActive: true
                }
              })

              // Get actual products (limited for performance)
              products = await prisma.product.findMany({
                where: { 
                  id: { in: productIds },
                  isActive: true
                },
                select: {  
                  id: true, 
                  name: true, 
                  slug: true, 
                  price: true, 
                  comparePrice: true, 
                  imageUrl: true,
                  rating: true,
                  reviewCount: true,
                  isFeatured: true,
                  isNew: true,
                  discount: true,
                  category: { }
                },
                orderBy: [
                  { isFeatured: 'desc' },
                  { rating: 'desc' },
                  { createdAt: 'desc' }
                ],
                take: 8, // Limit products per collection for performance
              })

              // Add discount percentage
              products = products.map(product => ({
                ...product,
                discountPercentage: product.comparePrice && product.comparePrice > product.price
                  ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
                  : 0
              }))
            }
          } catch (error) {
            console.error('Error parsing product IDs for collection:', collection.id, error)
          }
        }

        return {
          ...collection,
          products,
          productCount,
        }
      })
    )

    const total = await prisma.collection.count({ where
      })

    return NextResponse.json({ 
      success: true,
      data: enrichedCollections, 
      total,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < total,
      }
    })
  } catch (error) {
    console.error('Error fetching collections:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch collections' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      imageUrl,
      type,
      productIds,
      isFeatured = false,
      order = 0,
    } = body

    if (!title || !description || !type) {
      return NextResponse.json(
        { success: false, error: 'Title, description, and type required' },
        { status: 400 }
      )
    }

    // Validate type
    const validTypes = ['seasonal', 'curated', 'staff_pick', 'trending', 'brand']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid collection type' },
        { status: 400 }
      )
    }

    // Verify products exist if provided
    if (productIds && Array.isArray(productIds) && productIds.length > 0) {
      const productCount = await prisma.product.count({
        where: { 
          id: { in: productIds },
          isActive: true
        }
      })

      if (productCount === 0) {
        return NextResponse.json(
          { success: false, error: 'No valid products found' },
          { status: 400 }
        )
      }
    }

    const collection = await prisma.collection.create({
      data: {
        title,
        description,
        imageUrl,
        type,
        productIds: productIds ? JSON.stringify(productIds) : null,
        isFeatured,
        order,
        isActive: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: collection,
      message: 'Collection created successfully',
    })
  } catch (error) {
    console.error('Error creating collection:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create collection' },
      { status: 500 }
    )
  }
}
