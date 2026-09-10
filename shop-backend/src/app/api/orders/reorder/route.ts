import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = await req.json()

    // Get the original order
    const order = await prisma.order.findFirst({
      where: { id: orderId },
      include: { items: true }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Get current product details to verify availability and pricing
    const productIds = order.items.map(item => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { 
        id: true, 
        name: true, 
        price: true, 
        imageUrl: true, 
        isActive: true,
        slug: true
      }
    })

    const productMap = new Map(products.map(p => [p.id, p]))

    const cartItems = []
    const failedItems = []

    for (const item of order.items) {
      const product = productMap.get(item.productId) as any
      
      if (!product) {
        failedItems.push({ 
          productId: item.productId, 
          productName: item.productName,
          reason: 'Product no longer available' 
        })
        continue
      }

      if (!product.isActive) {
        failedItems.push({ 
          productId: item.productId,
          productName: product.name,
          reason: 'Product currently unavailable' 
        })
        continue
      }

      cartItems.push({
        productId: item.productId,
        productName: product.name,
        price: product.price,
        quantity: item.quantity,
        imageUrl: product.imageUrl,
        slug: product.slug
      })
    }

    return NextResponse.json({
      success: true,
      items: cartItems,
      failed: failedItems,
      originalOrderId: orderId,
      message: `${cartItems.length} items ready to add to cart`
    })
  } catch (error) {
    console.error('Reorder error:', error)
    return NextResponse.json({ error: 'Failed to process reorder' }, { status: 500 })
  }
}
