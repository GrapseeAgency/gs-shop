// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Smart reorder with modifications
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { modification } = await req.json()

    // Get last order
    const lastOrder = await prisma.order.findFirst({
      where: {
        customerEmail: userId,
        status: { not: 'cancelled' }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: true }
        }
      }
    })

    if (!lastOrder) {
      return NextResponse.json({ error: 'No previous order found' }, { status: 404 })
    }

    // Parse modification (e.g., "replace rice with basmati")
    const modifiedItems = lastOrder.items.map(item => {
      let modified = { ...item }
      
      // Simple modification parsing
      if (modification && item.product) {
        const modLower = modification.toLowerCase()
        const productName = item.product.name.toLowerCase()
        
        // Check if this item should be replaced
        if (modLower.includes('replace') && modLower.includes(productName)) {
          const replaceWith = modLower.split('with')[1]?.trim()
          if (replaceWith) {
            modified.productName = replaceWith // Would fetch actual product
            modified.modified = true
            modified.modificationReason = `Replaced with ${replaceWith}`
          }
        }
      }
      
      return modified
    })

    // Calculate new total
    const total = modifiedItems.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    )

    return NextResponse.json({
      success: true,
      originalOrder: lastOrder.id,
      items: modifiedItems,
      total,
      modifications: modification || 'None',
      message: modification
        ? `Reorder created with modification: "${modification}"`
        : 'Same as last order. Ready to checkout!',
      checkoutUrl: `/checkout?reorder=${lastOrder.id}&mod=${encodeURIComponent(modification || '')}`
    })
  } catch (error) {
    console.error('Smart reorder error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
