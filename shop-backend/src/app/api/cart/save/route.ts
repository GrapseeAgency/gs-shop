import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory storage for saved carts
const savedCarts = new Map<string, unknown[]>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, sessionId } = body

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Items must be an array' }, { status: 400 })
    }

    const id = sessionId || `cart-${Date.now()}`
    savedCarts.set(id, items)

    return NextResponse.json({
      success: true,
      sessionId: id,
      itemCount: items.length,
      savedAt: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({ error: 'Failed to save cart' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    const items = savedCarts.get(sessionId)

    if (!items) {
      return NextResponse.json({ items: [], found: false })
    }

    return NextResponse.json({
      items,
      found: true,
      savedAt: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({ error: 'Failed to restore cart' }, { status: 500 })
  }
}
