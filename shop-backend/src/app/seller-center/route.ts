import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (slug) {
      const seller = await prisma.seller.findUnique({
        where: { slug },
      })

      if (!seller) {
        return NextResponse.json(
          { error: 'Seller not found' },
          { status: 404 }
        )
      }

      const products = await prisma.product.findMany({
        where: { isActive: true },
                take: 6,
        include: {
          category: { select: { name: true } },
        },
      })

      return NextResponse.json({
        data: {
          id: seller.id,
          slug: seller.slug,
          name: seller.name,
          logo: seller.avatar,
          coverImage: seller.coverImage,
          description: seller.bio,
          rating: seller.rating,
          reviewCount: 0,
          totalProducts: seller.productCount,
          totalSales: seller.totalSales,
          responseTime: '',
          isVerified: true,
          joinedDate: seller.joinedAt,
          location: '',
          specialties: [],
          products: products.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            comparePrice: p.comparePrice,
            imageUrl: p.imageUrl,
            rating: p.rating,
            reviewCount: p.reviewCount,
            category: p.category?.name || 'General',
          })),
          reviews: [],
        },
      })
    }

    const sellers = await prisma.seller.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        avatar: true,
        coverImage: true,
        bio: true,
        rating: true,
        totalSales: true,
        productCount: true,
        joinedAt: true,
      },
    })

    const summary = sellers.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      logo: s.avatar,
      coverImage: s.coverImage,
      description: s.bio,
      rating: s.rating,
      reviewCount: 0,
      totalProducts: s.productCount,
      totalSales: s.totalSales,
      responseTime: '',
      isVerified: true,
      joinedDate: s.joinedAt,
      location: '',
      specialties: [],
    }))

    return NextResponse.json({
      data: summary,
      total: summary.length,
    })
  } catch (error) {
    console.error('[SELLER_CENTER_GET]', error)
    return NextResponse.json({ data: [], total: 0 })
  }
}
