import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-options"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    const { searchParams } = new URL(request.url)
    const minDrop = Math.min(100, Math.max(0, parseInt(searchParams.get('minDrop') || '0')))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'))
    const category = searchParams.get('category')

    // Find active watched products for the user
    const userAlerts = userId
      ? await prisma.priceAlert.findMany({ where: { userId, isActive: true } })
      : []
    const watchedProductIds = new Set(userAlerts.map((a) => a.productId))

    const where: any = { 
      isActive: true, 
      comparePrice: { not: null, gt: 0 }
    }
    
    if (category) {
      where.categoryId = { contains: category } // Use categoryId instead of category relation
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        // Note: category and priceHistory relations don't exist in schema
        orderBy: { price: 'asc' },
        take: limit,
        skip: offset
      }),
      prisma.product.count({ where
      })
    ])

    const priceDropProducts = products
      .filter((p) => p.comparePrice && p.comparePrice > p.price)
      .map((p) => {
        const dropPercent = Math.round(((p.comparePrice! - p.price) / p.comparePrice!) * 100)
        
        // Note: priceHistory doesn't exist, so we use a default trend
        let trend = 'stable' // Default trend since priceHistory doesn't exist

        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          imageUrl: p.imageUrl,
          price: p.price,
          previousPrice: p.comparePrice!,
          dropPercent,
          category: 'General', // Default category since category relation doesn't exist
          watched: watchedProductIds.has(p.id),
          trend,
          savings: p.comparePrice! - p.price,
          lastUpdated: p.updatedAt
        }
      })
      .filter((p) => p.dropPercent >= minDrop)

    return NextResponse.json({
      success: true,
      data: {
        products: priceDropProducts,
        pagination: {
          limit,
          offset,
          total,
          hasMore: offset + limit < total
        },
        filters: [
          { label: 'All Drops', value: 0 },
          { label: '10%+', value: 10 },
          { label: '20%+', value: 20 },
          { label: '30%+', value: 30 },
          { label: '50%+', value: 50 },
        ],
        summary: {
          totalDrops: priceDropProducts.length,
          averageDrop: priceDropProducts.length > 0 
            ? Math.round(priceDropProducts.reduce((sum, p) => sum + p.dropPercent, 0) / priceDropProducts.length)
            : 0,
          totalSavings: priceDropProducts.reduce((sum, p) => sum + p.savings, 0),
          watchedCount: priceDropProducts.filter(p => p.watched).length
        }
      }
    })
  } catch (error) {
    console.error('Price drop fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch price drop products' },
      { status: 500 }
    )
  }
}

// POST /api/price-drop Toggle price watch alert in database
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Authentication required to watch prices' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, targetPrice, alertType = 'drop' } = body

    if (!productId) {
      return NextResponse.json({ success: false, error: 'productId is required' }, { status: 400 })
    }

    // Validate product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { name: true, price: true, comparePrice: true, isActive: true }
    })

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }

    if (!product.isActive) {
      return NextResponse.json({ success: false, error: 'Product is no longer available' }, { status: 400 })
    }

    // Validate target price if provided
    if (targetPrice !== undefined) {
      if (targetPrice < 0) {
        return NextResponse.json({ success: false, error: 'Target price cannot be negative' }, { status: 400 })
      }
      if (targetPrice >= product.price) {
        return NextResponse.json({ success: false, error: 'Target price must be lower than current price' }, { status: 400 })
      }
    }

    // Check if alert already exists
    const existing = await prisma.priceAlert.findFirst({
      where: { userId, productId, isActive: true },
    })

    if (existing) {
      // Toggle off deactivate alert
      await prisma.priceAlert.update({
        where: { id: existing.id },
        data: { isActive: false }, // deactivatedAt doesn't exist in schema
      })
      
      return NextResponse.json({
        success: true,
        data: { watched: false },
        message: 'Price alert removed successfully.'
      })
    } else {
      // Toggle on create alert
      const alertData: any = {
        userId,
        productId,
        productName: product.name,
        currentPrice: product.price,
        isActive: true,
        alertType
      }

      // Set target price based on type or provided value
      if (targetPrice !== undefined) {
        alertData.targetPrice = targetPrice
      } else if (alertType === 'drop') {
        // Default: alert if price drops 10% from current price
        alertData.targetPrice = product.price * 0.9
      } else if (alertType === 'compare' && product.comparePrice) {
        // Alert if price drops to compare price or lower
        alertData.targetPrice = product.comparePrice
      }

      await prisma.priceAlert.create({
        data: alertData,
      })

      const dropPercentage = Math.round(((product.price - alertData.targetPrice) / product.price) * 100)
      
      return NextResponse.json({
        success: true,
        data: { 
          watched: true,
          targetPrice: alertData.targetPrice,
          dropPercentage
        },
        message: `You'll be notified when ${product.name} drops to $${alertData.targetPrice.toFixed(2)} or lower!`
      })
    }
  } catch (error) {
    console.error('Price alert toggle error:', error)
    return NextResponse.json({ success: false, error: 'Failed to toggle price alert' }, { status: 500 })
  }
}

// GET /api/price-drop/alerts Get user's price alerts
async function GET_ALERTS(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') === 'true'
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'))

    const where: any = { userId }
    if (activeOnly) where.isActive = true

    const [alerts, total] = await Promise.all([
      prisma.priceAlert.findMany({
        where,
        // Note: product relation doesn't exist in PriceAlert schema
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.priceAlert.count({ where
      })
    ])

    const formattedAlerts = alerts.map(alert => ({
      id: alert.id,
      productId: alert.productId,
      productName: alert.productName,
      product: null, // Not available since product relation doesn't exist
      targetPrice: alert.targetPrice,
      currentPrice: alert.currentPrice,
      isActive: alert.isActive,
      alertType: alert.type || 'price_drop', // Use type since alertType doesn't exist
      createdAt: alert.createdAt,
      triggeredAt: alert.isTriggered ? alert.updatedAt : null, // Use isTriggered and updatedAt since triggeredAt doesn't exist
      deactivatedAt: null, // Not available in schema
      savings: alert.currentPrice - alert.targetPrice,
      dropPercentage: Math.round(((alert.currentPrice - alert.targetPrice) / alert.currentPrice) * 100)
    }))

    return NextResponse.json({
      success: true,
      data: {
        alerts: formattedAlerts,
        pagination: {
          limit,
          offset,
          total,
          hasMore: offset + limit < total
        },
        summary: {
          totalAlerts: total,
          activeAlerts: alerts.filter(a => a.isActive).length,
          triggeredAlerts: alerts.filter(a => a.isTriggered).length, // Use isTriggered since triggeredAt doesn't exist
          totalPotentialSavings: alerts.reduce((sum, a) => sum + (a.currentPrice - a.targetPrice), 0)
        }
      }
    })
  } catch (error) {
    console.error('Price alerts fetch error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch price alerts' }, { status: 500 })
  }
}
