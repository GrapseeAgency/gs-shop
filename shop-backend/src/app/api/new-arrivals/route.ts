import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/new-arrivals
 * Returns products created in the last 3 days
 * Auto-expires after 3 days (won't show in results)
 * Silent if no new products exist
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Calculate 3 days ago
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    
    // Fetch products created in last 3 days
    const newArrivals = await prisma.product.findMany({
      where: {
        createdAt: {
          gte: threeDaysAgo
        },
        isActive: true
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
        isNew: true,
        isFeatured: true,
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
    
    // If no new arrivals, return empty (silent)
    if (newArrivals.length === 0) {
      return NextResponse.json({
        success: true,
        products: [],
        meta: {
          count: 0,
          timeWindow: '3 days',
          expiresIn: null,
          message: 'No new arrivals'
        }
      })
    }
    
    // Calculate time remaining for each product
    const now = new Date()
    const formattedProducts = newArrivals.map(product => {
      const createdAt = new Date(product.createdAt)
      const expiresAt = new Date(createdAt)
      expiresAt.setDate(expiresAt.getDate() + 3)
      
      const hoursRemaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)))
      
      return {
        ...product,
        hoursRemaining,
        expiresAt: expiresAt.toISOString()
      }
    })
    
    return NextResponse.json({
      success: true,
      products: formattedProducts,
      meta: {
        count: formattedProducts.length,
        timeWindow: '3 days',
        oldestExpiry: Math.min(...formattedProducts.map(p => p.hoursRemaining)),
        newestAdded: formattedProducts[0]?.createdAt
      }
    })
    
  } catch (error) {
    console.error('New arrivals error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch new arrivals'
    }, { status: 500 })
  }
}
