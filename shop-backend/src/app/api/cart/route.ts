import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// GET /api/cart Return saved cart
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || session?.user?.id

    if (!userId) {
      return NextResponse.json({
        data: [],
        total: 0,
        count: 0,
        message: 'Guest cart - items not saved'
      })
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            comparePrice: true,
            imageUrl: true,
            slug: true,
            isActive: true,
            category: { select: { id: true, name: true, slug: true } },
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Filter out inactive products
    const activeItems = cartItems.filter(item => item.product.isActive)

    const total = activeItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    const count = activeItems.reduce((sum, item) => sum + item.quantity, 0)

    return NextResponse.json({
      success: true,
      data: activeItems,
      total,
      count,
    })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

// POST /api/cart Save cart items
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { items, userId } = body

    const targetUserId = userId || session?.user?.id

    if (!targetUserId) {
      return NextResponse.json({
        success: false,
        error: 'User authentication required to save cart',
        message: 'Guest cart - items not saved'
      }, { status: 401 })
    }

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: 'Items array is required' },
        { status: 400 }
      )
    }

    // Clear existing cart items
    await prisma.cartItem.deleteMany({
      where: { userId: targetUserId }
    })

    // Validate products and create cart items
    const cartItemsToCreate = []
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { id: true, name: true, price: true, isActive: true }
      })

      if (product && product.isActive) {
        cartItemsToCreate.push({
          userId: targetUserId,
          productId: item.productId,
          quantity: Math.max(1, parseInt(item.quantity) || 1)
        })
      }
    }

    if (cartItemsToCreate.length > 0) {
      await prisma.cartItem.createMany({
        data: cartItemsToCreate
      })
    }

    // Get updated cart
    const updatedCart = await prisma.cartItem.findMany({
      where: { userId: targetUserId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            comparePrice: true,
            imageUrl: true,
            slug: true,
            category: { select: { id: true, name: true, slug: true } },
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const total = updatedCart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    const count = updatedCart.reduce((sum, item) => sum + item.quantity, 0)

    return NextResponse.json({
      success: true,
      data: updatedCart,
      total,
      count,
      message: 'Cart saved successfully'
    })
  } catch (error) {
    console.error('Error saving cart:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save cart' },
      { status: 500 }
    )
  }
}

// PUT /api/cart Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { productId, quantity, userId } = body

    const targetUserId = userId || session?.user?.id

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: 'User authentication required' },
        { status: 401 }
      )
    }

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID required' },
        { status: 400 }
      )
    }

    const newQuantity = Math.max(1, parseInt(quantity) || 1)

    // Update or create cart item
    // Find existing cart item
    const existingCartItem = await prisma.cartItem.findFirst({
      where: { userId: targetUserId, productId }
    })

    let cartItem
    if (existingCartItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
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
      })
    } else {
      // Get or create cart for user
      let cart = await prisma.cart.findFirst({ where: { userId: targetUserId } })
      if (!cart) {
        cart = await prisma.cart.create({ data: { userId: targetUserId } })
      }
      
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity: newQuantity
        },
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
      })
    }

    return NextResponse.json({
      success: true,
      data: cartItem,
      message: 'Cart item updated'
    })
  } catch (error) {
    console.error('Error updating cart:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update cart' },
      { status: 500 }
    )
  }
}

// DELETE /api/cart Clear saved cart or remove specific item
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const userId = searchParams.get('userId') || session?.user?.id

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'User authentication required',
        message: 'Cannot clear guest cart'
      }, { status: 401 })
    }

    if (!productId) {
      // Clear entire cart
      await prisma.cartItem.deleteMany({
        where: { userId }
      })

      return NextResponse.json({
        success: true,
        message: 'Cart cleared',
        total: 0,
        count: 0,
      })
    }

    // Remove specific item
    const deletedItem = await prisma.cartItem.deleteMany({
      where: {
        userId,
        productId,
      }
    })

    if (deletedItem.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Item not found in cart' },
        { status: 404 }
      )
    }

    // Get updated count
    const remainingCount = await prisma.cartItem.count({
      where: { userId }
    })

    return NextResponse.json({
      success: true,
      message: 'Item removed from cart',
      count: remainingCount,
    })
  } catch (error) {
    console.error('Error clearing cart:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to clear cart' },
      { status: 500 }
    )
  }
}
