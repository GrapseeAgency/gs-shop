import { NextRequest, NextResponse } from 'next/server'

interface SharedWishlistItem {
  productId: string
  name: string
  price: number
  imageUrl: string | null
}

interface SharedWishlist {
  token: string
  name: string
  items: SharedWishlistItem[]
  createdAt: string
}

// Simple in-memory storage for shared wishlists
const sharedWishlists = new Map<string, SharedWishlist>()

function generateToken(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, name } = body as {
      items: SharedWishlistItem[]
      name: string
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items must be a non-empty array' }, { status: 400 })
    }

    const token = generateToken()
    const wishlist: SharedWishlist = {
      token,
      name: name || 'My Wishlist',
      items,
      createdAt: new Date().toISOString(),
    }

    sharedWishlists.set(token, wishlist)

    return NextResponse.json({
      success: true,
      token,
      shareUrl: `/wishlist/shared/${token}`,
      itemCount: items.length,
      name: wishlist.name,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to share wishlist' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    const wishlist = sharedWishlists.get(token)

    if (!wishlist) {
      return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 })
    }

    return NextResponse.json(wishlist)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 })
  }
}
