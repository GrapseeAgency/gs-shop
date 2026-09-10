import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    // Try DB first
    try {
      const where: Record<string, unknown> = {}
      if (type) where.type = type
      const collections = await db.collection.findMany({
        where,
        orderBy: [{ isFeatured: 'desc' }, { order: 'asc' }],
        take: 20,
      })

      if (collections.length > 0) {
        const enriched = await Promise.all(
          collections.map(async (collection) => {
            let products: unknown[] = []
            if (collection.productIds) {
              try {
                const productIds: string[] = JSON.parse(collection.productIds)
                if (productIds.length > 0) {
                  products = await db.product.findMany({
                    where: { id: { in: productIds } },
                    select: { id: true, name: true, slug: true, price: true, comparePrice: true, imageUrl: true },
                    take: 10,
                  })
                }
              } catch { /* ignore */ }
            }
            return { ...collection, products, productCount: products.length || 0 }
          })
        )
        return NextResponse.json({ data: enriched, total: collections.length })
      }
    } catch { /* fall through */ }

    return NextResponse.json({ data: [], total: 0 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 })
  }
}