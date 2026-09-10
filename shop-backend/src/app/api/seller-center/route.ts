import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// GET /api/seller-center List sellers or get specific seller
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const featured = searchParams.get('featured') === 'true'
    const verified = searchParams.get('verified') === 'true'

    if (slug) {
      // Return specific seller with full details
      const seller = await prisma.seller.findUnique({
        where: { slug },
        include: {
          products: {
            where: { isActive: true },
            take: 12,
            include: {
              category: { select: { name: true } },
            },
            orderBy: { rating: 'desc' },
          },
        },
      })

      if (!seller) {
        return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
      }

      // Get seller reviews
      const reviews = await prisma.review.findMany({
        where: {
          product: {
            sellerId: seller.id,
          },
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true } },
          product: { select: { name: true } },
        },
      })

      // Get seller analytics
      const analytics = await prisma.sellerAnalytics.findUnique({
        where: { sellerId: seller.id },
      })

      // Get follower count
      const followerCount = await prisma.sellerFollow.count({
        where: { sellerId: seller.id },
      })

      return NextResponse.json({
        success: true,
        data: {
          ...seller,
          products: seller.products.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            comparePrice: p.comparePrice,
            imageUrl: p.imageUrl,
            rating: p.rating,
            reviewCount: p.reviewCount,
            category: p.category?.name || 'General',
          })),
          reviews: reviews.map(r => ({
            id: r.id,
            author: 'Anonymous',
            rating: r.rating,
            comment: r.comment,
            date: r.createdAt.toISOString()
          })),
          analytics: analytics || null,
          followerCount,
        },
      })
    }

    // Build where clause for listing
    const where: any = {}
    if (featured) where.isFeatured = true
    if (verified) where.isVerified = true

    // Return all sellers (summary)
    const sellers = await prisma.seller.findMany({
      where,
      orderBy: [{ isFeatured: 'desc' }, { rating: 'desc' }],
      take: 50,
      select: {
        id: true,
        slug: true,
        name: true,
        logo: true,
        coverImage: true,
        description: true,
        rating: true,
        reviewCount: true,
        productCount: true,
        totalSales: true,
        responseTime: true,
        isVerified: true,
        isFeatured: true,
        verificationBadge: true,
        joinedAt: true,
        followerCount: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: sellers,
      total: sellers.length,
    })
  } catch (error) {
    console.error('[SELLER_CENTER_GET]', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch sellers' }, { status: 500 })
  }
}

// POST /api/seller-center Apply to become a seller
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      slug,
      description,
      logo,
      coverImage,
      socialLinks,
    } = body

    // Validate required fields
    if (!name || !slug || !description) {
      return NextResponse.json(
        { error: 'Name, slug, and description are required' },
        { status: 400 }
      )
    }

    // Check if slug is unique
    const existing = await prisma.seller.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: 'Seller slug already taken' }, { status: 409 })
    }

    // Create seller
    const seller = await prisma.seller.create({
      data: {
        name,
        email: `${slug}@grapsee.com`,
        slug,
        description: description || ''
      }
    })

    // Create seller analytics entry
    await prisma.sellerAnalytics.create({
      data: {
        sellerId: seller.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Seller application submitted! Verification in progress.',
      seller: {
        id: seller.id,
        name: seller.name,
        slug: seller.slug,
        status: 'pending_verification',
      },
    }, { status: 201 })
  } catch (error) {
    console.error('[SELLER_CENTER_POST]', error)
    return NextResponse.json({ error: 'Failed to create seller' }, { status: 500 })
  }
}

// PATCH /api/seller-center Update seller profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sellerId = searchParams.get('id')

    if (!sellerId) {
      return NextResponse.json({ error: 'Seller ID required' }, { status: 400 })
    }

    // Verify ownership (in production, check if user owns this seller)
    const body = await request.json()

    const updated = await prisma.seller.update({
      where: { id: sellerId },
      data: {
        ...body,
        // Don't allow changing slug or critical fields directly
        slug: undefined,
        id: undefined,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Seller profile updated',
      seller: updated,
    })
  } catch (error) {
    console.error('[SELLER_CENTER_PATCH]', error)
    return NextResponse.json({ error: 'Failed to update seller' }, { status: 500 })
  }
}
