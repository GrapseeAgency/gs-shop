import { NextRequest, NextResponse } from 'next/server'

// In-memory wishlist storage (since we don't have user auth)
const wishlistStore = new Map<string, Array<{
  productId: string
  name: string
  price: number
  comparePrice: number | null
  imageUrl: string | null
  addedAt: string
}>>()

const DEFAULT_USER = 'guest'

// GET /api/wishlist Return wishlist items with product details
export async function GET() {
  try {
    const items = wishlistStore.get(DEFAULT_USER) || []
    return NextResponse.json({
      data: items,
      total: items.length,
    })
  } catch (error) {
    console.error('Error fetching wishlist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wishlist' },
      { status: 500 }
    )
  }
}

// POST /api/wishlist Add item to wishlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, name, price, comparePrice, imageUrl } = body

    if (!productId || !name || price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, name, price' },
        { status: 400 }
      )
    }

    const items = wishlistStore.get(DEFAULT_USER) || []

    // Check if already in wishlist
    if (items.some(item => item.productId === productId)) {
      return NextResponse.json(
        { error: 'Product already in wishlist' },
        { status: 409 }
      )
    }

    const newItem = {
      productId,
      name,
      price,
      comparePrice: comparePrice || null,
      imageUrl: imageUrl || null,
      addedAt: new Date().toISOString(),
    }

    items.push(newItem)
    wishlistStore.set(DEFAULT_USER, items)

    return NextResponse.json({
      success: true,
      data: newItem,
      total: items.length,
    }, { status: 201 })
  } catch (error) {
    console.error('Error adding to wishlist:', error)
    return NextResponse.json(
      { error: 'Failed to add to wishlist' },
      { status: 500 }
    )
  }
}

// DELETE /api/wishlist Remove item from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      // If no productId, clear entire wishlist
      wishlistStore.set(DEFAULT_USER, [])
      return NextResponse.json({
        success: true,
        message: 'Wishlist cleared',
        total: 0,
      })
    }

    const items = wishlistStore.get(DEFAULT_USER) || []
    const filtered = items.filter(item => item.productId !== productId)
    wishlistStore.set(DEFAULT_USER, filtered)

    return NextResponse.json({
      success: true,
      message: 'Item removed from wishlist',
      total: filtered.length,
    })
  } catch (error) {
    console.error('Error removing from wishlist:', error)
    return NextResponse.json(
      { error: 'Failed to remove from wishlist' },
      { status: 500 }
    )
  }
}
