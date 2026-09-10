import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/luxury-zone
 * Returns admin-marked luxury products that haven't expired
 * Silent if no active luxury products exist
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const now = new Date()
    
    // Fetch active luxury products that haven't expired
    const luxuryProducts = await prisma.product.findMany({
      where: {
        isLuxury: true,
        isActive: true,
        OR: [
          { luxuryExpiresAt: null },
          { luxuryExpiresAt: { gt: now } }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        comparePrice: true,
        discount: true,
        imageUrl: true,
        thumbnailType: true,
        shortDescription: true,
        badge: true,
        badgeColor: true,
        rating: true,
        reviewCount: true,
        isLuxury: true,
        luxuryExpiresAt: true,
        createdAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    })
    
    // If no luxury products, return empty (silent)
    if (luxuryProducts.length === 0) {
      return NextResponse.json({
        success: true,
        products: [],
        meta: {
          count: 0,
          expiresAt: null,
          message: 'No luxury products available'
        }
      })
    }
    
    // Calculate time remaining for each product
    const formattedProducts = luxuryProducts.map(product => {
      const expiresAt = product.luxuryExpiresAt
      let hoursRemaining = null
      
      if (expiresAt) {
        hoursRemaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)))
      }
      
      return {
        ...product,
        hoursRemaining,
        expiresAt: expiresAt?.toISOString() || null
      }
    })
    
    return NextResponse.json({
      success: true,
      products: formattedProducts,
      meta: {
        count: formattedProducts.length,
        expiresSoonest: Math.min(...formattedProducts.filter(p => p.hoursRemaining !== null).map(p => p.hoursRemaining || Infinity)),
        permanentCount: formattedProducts.filter(p => p.luxuryExpiresAt === null).length
      }
    })
    
  } catch (error) {
    console.error('Luxury zone error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch luxury products'
    }, { status: 500 })
  }
}
