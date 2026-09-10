import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Smart home trigger for auto-delivery
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { triggerType, deviceData } = await req.json()

    // Smart home processing mock

    const triggers = []

    // Trigger: Arrived home
    if (triggerType === 'arrived_home') {
      const autoOrders = await prisma.autoReorder.findMany({
        where: {
          userId,
          isActive: true
        }
      })

      if (autoOrders.length > 0) {
        triggers.push({
          type: 'auto_delivery',
          message: 'Welcome home! Your scheduled deliveries have been confirmed.',
          orders: autoOrders,
          eta: '30 minutes'
        })
      }
    }

    // Trigger: Low supply detected
    if (triggerType === 'low_supply') {
      const product = deviceData?.product
      if (product) {
        triggers.push({
          type: 'reorder_suggested',
          message: `Your ${product} is running low. Reorder now?`,
          product,
          oneClickReorder: true
        })
      }
    }

    // Trigger: Morning routine
    if (triggerType === 'morning_routine') {
      const morningProducts = await prisma.product.findMany({
        where: {
          tags: { contains: 'morning' }
        },
        take: 4
      })

      triggers.push({
        type: 'morning_suggestions',
        message: 'Good morning! Start your day right with these essentials.',
        products: morningProducts
      })
    }

    return NextResponse.json({
      connected: true,
      triggerProcessed: triggerType,
      triggers,
      automationEnabled: triggers.length > 0
    })
  } catch (error) {
    console.error('Smart home error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// GET - Get smart home status
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ connected: false })

    return NextResponse.json({
      connected: false,
      devices: [],
      automationRules: []
    })
  } catch (error) {
    console.error('Smart home status error:', error)
    return NextResponse.json({ connected: false })
  }
}
