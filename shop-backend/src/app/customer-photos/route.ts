import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const featured = searchParams.get('featured')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    if (productId) where.productId = productId
    if (featured === 'true') where.isFeatured = true

    let photos = await prisma.customerPhoto.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    // Enrich with product details
    const enriched = await Promise.all(
      photos.map(async (photo) => {
        const product = await prisma.product.findUnique({
          where: { id: photo.productId },
          select: { name: true, price: true, imageUrl: true },
        })
        return { ...photo, product }
      })
    )

    let result = enriched.length > 0 ? enriched : [] as any

    // Get total count
    const totalCount = await prisma.customerPhoto.count({ where
      })

    return NextResponse.json({
      photos: result,
      total: totalCount || result.length,
      hasMore: result.length === limit,
    })
  } catch (error) {
    console.error('Customer photos list error:', error)
    return NextResponse.json(
      { photos: [], total: [].length, hasMore: false },
      { status: 200 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, userId, userName, imageUrl, caption } = body

    if (!productId || !userName || !imageUrl) {
      return NextResponse.json(
        { error: 'productId, userName, and imageUrl are required' },
        { status: 400 }
      )
    }

    const photo = await prisma.customerPhoto.create({
      data: {
        productId,
        userId: userId || null,
        userName,
        imageUrl,
        caption: caption || null,
        likes: 0,
        isFeatured: false,
      },
    })

    return NextResponse.json({
      success: true,
      photo: {
        ...photo,
        product: null, // Will need a separate fetch for full product details
        message: 'Photo uploaded successfully! It will appear after review.',
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Customer photo create error:', error)
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    )
  }
}
