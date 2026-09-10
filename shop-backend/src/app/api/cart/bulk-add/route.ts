import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { items } = await req.json() as { 
      items: Array<{
        productId: string
        quantity: number
        options?: Record<string, string>
        notes?: string
      }> 
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 })
    }

    // Get all products to validate
    const productIds = items.map(item => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true, name: true, imageUrl: true, isActive: true }
    })

    const productMap = new Map(products.map(p => [p.id, p]))

    const addedItems: any[] = []
    const failedItems: any[] = []

    for (const item of items) {
      const product = productMap.get(item.productId) as any
      
      if (!product) {
        failedItems.push({ productId: item.productId, reason: 'Product not found' })
        continue
      }

      if (!product.isActive) {
        failedItems.push({ productId: item.productId, reason: 'Product not available' })
        continue
      }

      // Check if item already in cart (would need CartItem model - using localStorage for now)
      addedItems.push({
        productId: item.productId,
        productName: product.name,
        price: product.price,
        quantity: item.quantity,
        imageUrl: product.imageUrl,
        options: item.options || {},
        notes: item.notes || ''
      })
    }

    return NextResponse.json({
      success: true,
      added: addedItems.length,
      failed: failedItems,
      items: addedItems
    })
  } catch (error) {
    console.error('Bulk add error:', error)
    return NextResponse.json({ error: 'Failed to add items to cart' }, { status: 500 })
  }
}
