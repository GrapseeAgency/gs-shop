import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/admin/price-alerts/check Check all price alerts against current product prices
// This should be called periodically (e.g., via cron job or admin action)
export async function POST(request: NextRequest) {
  try {
    // Verify admin authorization (in production, use proper auth middleware)
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.includes('Bearer')) {
      // For development, allow without strict auth
      console.log('[PRICE_CHECK] Running without strict auth (dev mode)')
    }

    // Get all active price alerts
    const activeAlerts = await prisma.priceAlert.findMany({
      where: {
        isActive: true,
        isTriggered: false,
      },
    })

    if (activeAlerts.length === 0) {
      return NextResponse.json({
        checked: 0,
        triggered: 0,
        message: 'No active price alerts to check',
      })
    }

    // Get current product prices
    const productIds = [...new Set(activeAlerts.map(a => a.productId))]
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
        price: true,
        name: true,
      },
    })

    const productMap = new Map(products.map(p => [p.id, p]))

    // Check each alert
    const triggeredAlerts = []
    const notifications = []

    for (const alert of activeAlerts) {
      const product = productMap.get(alert.productId)
      if (!product) continue

      const currentPrice = product.price

      // Update current price in alert
      await prisma.priceAlert.update({
        where: { id: alert.id },
        data: { currentPrice },
      })

      // Check if price dropped to or below target
      if (currentPrice <= alert.targetPrice && !alert.isTriggered) {
        // Mark as triggered
        const updatedAlert = await prisma.priceAlert.update({
          where: { id: alert.id },
          data: {
            isTriggered: true,
            notifiedAt: new Date(),
          },
        })

        triggeredAlerts.push(updatedAlert)

        // Create notification for user
        const notification = await prisma.notification.create({
          data: {
            type: 'deal',
            title: 'Price Drop Alert! ',
            message: `${product.name} has dropped to ${formatPrice(currentPrice)} (your target was ${formatPrice(alert.targetPrice)})`,
            userId: null, // Could link to user if email matches
            link: `/product/${product.id}`,
            priority: 'high',
            category: 'commerce',
            metadata: JSON.stringify({
              productId: product.id,
              productName: product.name,
              oldPrice: alert.currentPrice,
              newPrice: currentPrice,
              targetPrice: alert.targetPrice,
              savings: alert.currentPrice - currentPrice,
              email: alert.email,
            }),
          },
        })

        notifications.push(notification)

        // In production, send email here
        console.log(`[PRICE_ALERT_TRIGGERED] ${alert.email}: ${product.name} dropped to ${currentPrice}`)
      }
    }

    return NextResponse.json({
      checked: activeAlerts.length,
      triggered: triggeredAlerts.length,
      alerts: triggeredAlerts,
      notifications: notifications.length,
      message: `Checked ${activeAlerts.length} alerts, ${triggeredAlerts.length} triggered`,
    })
  } catch (error) {
    console.error('[PRICE_CHECK_ERROR]', error)
    return NextResponse.json(
      { error: 'Failed to check price alerts' },
      { status: 500 }
    )
  }
}

// GET /api/admin/price-alerts/check Get price alert statistics
export async function GET() {
  try {
    const [total, triggered, active] = await Promise.all([
      prisma.priceAlert.count(),
      prisma.priceAlert.count({ where: { isTriggered: true } }),
      prisma.priceAlert.count({ where: { isActive: true, isTriggered: false } }),
    ])

    return NextResponse.json({
      stats: { total, triggered, active },
    })
  } catch (error) {
    console.error('[PRICE_STATS_ERROR]', error)
    return NextResponse.json(
      { error: 'Failed to get price alert stats' },
      { status: 500 }
    )
  }
}

function formatPrice(price: number): string {
  return `${price.toLocaleString()}`
}
