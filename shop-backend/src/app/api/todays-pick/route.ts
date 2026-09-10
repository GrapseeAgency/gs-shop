import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/todays-pick
 * Returns 2 random products selected for today (lottery style)
 * Changes daily at midnight
 */
export async function GET(request: NextRequest) {
  try {
    // Get today's date (start of day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Check if we already have picks for today
    const todaysPicks = await prisma.todaysPick.findMany({
      where: {
        date: {
          gte: today
        },
        isActive: true
      },
      take: 2,
      include: {
        product: {
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
        }
      }
    })
    
    // If we have picks for today, return them
    if (todaysPicks.length > 0) {
      return NextResponse.json({
        success: true,
        picks: todaysPicks.map((pick, index) => ({
          ...pick.product,
          pickRank: index + 1,
          pickedAt: pick.createdAt
        })),
        meta: {
          count: todaysPicks.length,
          date: today.toISOString().split('T')[0],
          nextPick: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()
        }
      })
    }
    
    // If no picks for today, generate random picks
    // Get all active products
    const activeProducts = await prisma.product.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true
      }
    })
    
    if (activeProducts.length < 2) {
      return NextResponse.json({
        success: true,
        picks: [],
        meta: {
          count: 0,
          date: today.toISOString().split('T')[0],
          message: 'Not enough products for daily pick'
        }
      })
    }
    
    // Select 2 random products
    const shuffled = activeProducts.sort(() => 0.5 - Math.random())
    const selectedIds = shuffled.slice(0, 2).map(p => p.id)
    
    // Create TodaysPick records
    await prisma.todaysPick.createMany({
      data: selectedIds.map(productId => ({
        productId,
        date: today,
        isActive: true
      }))
    })
    
    // Fetch the selected products with details
    const selectedProducts = await prisma.product.findMany({
      where: {
        id: { in: selectedIds }
      },
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
    
    return NextResponse.json({
      success: true,
      picks: selectedProducts.map((product, index) => ({
        ...product,
        pickRank: index + 1,
        pickedAt: today.toISOString()
      })),
      meta: {
        count: selectedProducts.length,
        date: today.toISOString().split('T')[0],
        nextPick: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()
      }
    })
    
  } catch (error) {
    console.error("Today's pick error:", error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch daily picks'
    }, { status: 500 })
  }
}
