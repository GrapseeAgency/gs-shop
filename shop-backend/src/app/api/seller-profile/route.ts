import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-options"

// GET /api/seller-profile Return seller profile with products and reviews
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const searchParams = request.nextUrl.searchParams
    const slug = searchParams.get('slug')
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'))

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Seller slug is required' },
        { status: 400 }
      )
    }

    // Find seller in database
    const seller = await prisma.seller.findUnique({
      where: { slug }
    })

    if (!seller) {
      return NextResponse.json(
        { success: false, error: 'Seller not found' },
        { status: 404 }
      )
    }

    // Fetch seller's products
    const [products, totalProducts] = await Promise.all([
      prisma.product.findMany({
        where: { 
          sellerId: seller.id,
          isActive: true 
        },
        select: {
          id: true,
          name: true,
          price: true,
          imageUrl: true,
          rating: true,
          reviewCount: true,
          discount: true,
          stock: true,
          createdAt: true
        },
        orderBy: { rating: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.product.count({
        where: { 
          sellerId: seller.id,
          isActive: true 
        }
      })
    ])

    // Fetch seller's reviews
    const reviews = await prisma.review.findMany({
      where: { 
        author: seller.name
      },
      select: {
        id: true,
        author: true,
        rating: true,
        comment: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Calculate seller metrics
    const avgRating = reviews.length > 0
      ? Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length * 10) / 10
      : seller.rating || 0

    const totalRevenue = products.reduce((sum, p) => sum + (p.price * (p.reviewCount || 0)), 0)
    const avgOrderValue = seller.totalSales > 0 ? Math.round(totalRevenue / seller.totalSales) : 0

    const monthlyRevenue = seller.monthlyRevenue || []

    return NextResponse.json({
      success: true,
      data: {
        seller: {
          id: seller.id,
          slug: seller.slug,
          name: seller.name,
          logo: seller.logo,
          coverImage: seller.coverImage,
          description: seller.description,
          joinedAt: seller.joinedAt,
          isVerified: seller.isVerified,
          isFeatured: seller.isFeatured
        },
        stats: {
          totalSales: seller.totalSales || 0,
          revenue: seller.totalEarnings || 0,
          rating: avgRating,
          productCount: totalProducts,
          reviewCount: reviews.length,
          avgOrderValue,
          responseTime: seller.responseTime
        },
        products: products.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          imageUrl: p.imageUrl,
          rating: p.rating,
          reviewCount: p.reviewCount,
          discount: p.discount,
          createdAt: p.createdAt
        })),
        reviews: reviews.map(r => ({
          id: r.id,
          author: r.author,
          rating: r.rating,
          comment: r.comment,
          date: r.createdAt,
          productName: 'Unknown Product'
        })),
        monthlyRevenue,
        pagination: {
          limit,
          offset,
          total: totalProducts,
          hasMore: offset + limit < totalProducts
        }
      }
    })
  } catch (error) {
    console.error('Seller profile fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch seller profile' },
      { status: 500 }
    )
  }
}

// POST /api/seller-profile Create or update seller profile
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'User authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, description, logo, coverImage, slug } = body

    if (!name) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 })
    }

    // Check if seller already exists
    const existingSeller = await prisma.seller.findFirst({
      where: { 
        slug: slug || name.toLowerCase().replace(/\s+/g, '-')
      }
    })

    if (existingSeller) {
      return NextResponse.json({ success: false, error: 'Seller with this email or slug already exists' }, { status: 409 })
    }

    const seller = await prisma.seller.create({
      data: {
        name,
        email: email || `${slug || name.toLowerCase().replace(/\s+/g, '-')}@grapsee.com`,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-')
      }
    })

    return NextResponse.json({
      success: true,
      data: seller,
      message: 'Seller profile created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Seller profile creation error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create seller profile' }, { status: 500 })
  }
}

// PUT /api/seller-profile Update seller profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'User authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { sellerId, name, description, logo, coverImage, slug } = body

    if (!sellerId) {
      return NextResponse.json({ success: false, error: 'Seller ID is required' }, { status: 400 })
    }

    // Check if seller exists and user has permission
    const existingSeller = await prisma.seller.findUnique({
      where: { id: sellerId }
    })

    if (!existingSeller) {
      return NextResponse.json({ success: false, error: 'Seller not found' }, { status: 404 })
    }


    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (logo !== undefined) updateData.logo = logo
    if (coverImage !== undefined) updateData.coverImage = coverImage
    if (slug !== undefined) updateData.slug = slug

    const updatedSeller = await prisma.seller.update({
      where: { id: sellerId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      data: updatedSeller,
      message: 'Seller profile updated successfully'
    })
  } catch (error) {
    console.error('Seller profile update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update seller profile' }, { status: 500 })
  }
}
