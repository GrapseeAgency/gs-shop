import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth/next'
import { authOptions } from "@/lib/auth-options"

// GET /api/cart Return user's cart from database
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get or create cart for user
    let cart = await db.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
                isActive: true,
              }
            }
          }
        }
      }
    })

    if (!cart) {
      cart = await db.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  imageUrl: true,
                  isActive: true,
                }
              }
            }
          }
        }
      })
    }

    // Format items for response
    const items = cart.items.map(item => ({
      productId: item.productId,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      imageUrl: item.product.imageUrl,
      options: item.options ? JSON.parse(item.options) : null,
    })).filter(item => item.productId) // Only include valid items

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const count = items.reduce((sum, item) => sum + item.quantity, 0)

    return NextResponse.json({
      data: items,
      total,
      count,
      cartId: cart.id,
    })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

// POST /api/cart Save cart items to database
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { items } = body

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      )
    }

    // Get or create cart
    let cart = await db.cart.findUnique({
      where: { userId }
    })

    if (!cart) {
      cart = await db.cart.create({
        data: { userId }
      })
    }

    // Delete existing items
    await db.cartItem.deleteMany({
      where: { cartId: cart.id }
    })

    // Create new items
    const validItems = items.filter(item => item.productId)
    for (const item of validItems) {
      await db.cartItem.create({
        data: {
          cartId: cart.id,
          productId: item.productId,
          quantity: item.quantity || 1,
          options: item.options ? JSON.stringify(item.options) : null,
        }
      })
    }

    // Fetch updated cart with items
    const updatedCart = await db.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
              }
            }
          }
        }
      }
    })

    const responseItems = updatedCart?.items.map(item => ({
      productId: item.productId,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      imageUrl: item.product.imageUrl,
    })) || []

    const total = responseItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const count = responseItems.reduce((sum, item) => sum + item.quantity, 0)

    return NextResponse.json({
      success: true,
      data: responseItems,
      total,
      count,
      cartId: cart.id,
    })
  } catch (error) {
    console.error('Error saving cart:', error)
    return NextResponse.json(
      { error: 'Failed to save cart' },
      { status: 500 }
    )
  }
}

// DELETE /api/cart Clear user's cart
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const cart = await db.cart.findUnique({
      where: { userId }
    })

    if (cart) {
      await db.cartItem.deleteMany({
        where: { cartId: cart.id }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Cart cleared',
      total: 0,
      count: 0,
    })
  } catch (error) {
    console.error('Error clearing cart:', error)
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    )
  }
}
