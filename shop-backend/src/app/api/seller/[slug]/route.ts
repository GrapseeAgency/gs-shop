import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Find seller by slug
    const seller = await prisma.seller.findUnique({
      where: { slug },
      include: {
        settings: true,
        products: {
          where: { isActive: true },
          orderBy: { order: 'desc' },
          take: 12,
          include: {
            seller: { select: { id: true, name: true, slug: true } }
          }
        },
        sellerReviews: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            user: {
              select: { id: true, name: true, avatar: true }
            }
          }
        }
      }
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
    }

    // Only show verified/onboarded sellers
    if (!seller.isOnboarded && seller.onboardingStatus !== 'approved') {
      return NextResponse.json(
        { error: 'Seller not available' },
        { status: 404 }
      )
    }

    // Calculate review stats
    const totalReviews = seller.sellerReviews?.length || 0
    const averageRating = totalReviews > 0
      ? seller.sellerReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0

    // Format response
    const publicProfile = {
      id: seller.id,
      slug: seller.slug,
      name: seller.name,
      description: seller.description || seller.settings?.storeDescription || '',
      logo: seller.logo,
      coverImage: seller.coverImage,
      isVerified: seller.isVerified,
      verificationBadge: seller.verificationBadge,
      joinedAt: seller.joinedAt,
      
      // Stats
      stats: {
        totalProducts: seller.productCount,
        totalSales: seller.totalSales,
        rating: averageRating,
        reviewCount: totalReviews,
        responseTime: seller.responseTime
      },

      // Policies
      policies: {
        return: 'Returns accepted within 7 days',
        shipping: seller.settings?.shippingPolicy || `Ships within ${seller.settings?.defaultShippingDays || 3} business days`,
        freeShippingThreshold: seller.settings?.freeShippingThreshold,
      },

      // Products
      products: seller.products.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        comparePrice: p.comparePrice,
        imageUrl: p.imageUrl,
        rating: p.rating,
        reviewCount: p.reviewCount,
        isFeatured: p.isFeatured,
      })),

      // Recent reviews
      reviews: seller.sellerReviews.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        user: {
          name: r.user?.name || 'Anonymous',
          avatar: r.user?.avatar,
        },
      })),

      // Social links
      socialLinks: seller.socialLinks ? JSON.parse(seller.socialLinks) : null,
    }

    // Increment view count
    await prisma.seller.update({
      where: { id: seller.id },
      data: { viewCount: { increment: 1 } },
    })

    return NextResponse.json({ seller: publicProfile })
  } catch (error) {
    console.error('Error fetching seller profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch seller profile' },
      { status: 500 }
    )
  }
}
