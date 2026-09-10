import { NextRequest, NextResponse } from 'next/server'

interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  imageUrl: string | null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { savedItems, currentItems } = body as {
      savedItems: CartItem[]
      currentItems: CartItem[]
    }

    if (!Array.isArray(savedItems) || !Array.isArray(currentItems)) {
      return NextResponse.json({ error: 'Both savedItems and currentItems must be arrays' }, { status: 400 })
    }

    // Merge: deduplicate by productId, keep current item if duplicate (with summed quantity)
    const mergedMap = new Map<string, CartItem>()

    // Add saved items first
    for (const item of savedItems) {
      mergedMap.set(item.productId, { ...item, id: `${item.productId}-merged-${Date.now()}` })
    }

    // Merge current items - if productId exists, add quantities
    for (const item of currentItems) {
      const existing = mergedMap.get(item.productId)
      if (existing) {
        mergedMap.set(item.productId, {
          ...existing,
          quantity: existing.quantity + item.quantity,
        })
      } else {
        mergedMap.set(item.productId, { ...item })
      }
    }

    const mergedItems = Array.from(mergedMap.values())

    return NextResponse.json({
      items: mergedItems,
      totalItems: mergedItems.reduce((sum, item) => sum + item.quantity, 0),
      duplicatesMerged: savedItems.filter((s) => currentItems.some((c) => c.productId === s.productId)).length,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to merge carts' }, { status: 500 })
  }
}
