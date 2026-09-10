import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const collection = await prisma.collection.findUnique({ where: { id } })
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 })
    }

    let products: unknown[] = []
    if (collection.productIds) {
      try {
        const productIds: string[] = JSON.parse(collection.productIds)
        if (productIds.length > 0) {
          products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true, slug: true, description: true, price: true, comparePrice: true, imageUrl: true, category: { select: { name: true, slug: true } } },
          })
        }
      } catch { /* ignore */ }
    }

    return NextResponse.json({ ...collection, products, productCount: products.length })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch collection' }, { status: 500 })
  }
}
