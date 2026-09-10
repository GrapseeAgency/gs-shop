import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get shared cart
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const cartId = searchParams.get('cartId')

    if (!cartId) {
      return NextResponse.json({ error: 'Cart ID required' }, { status: 400 })
    }

    const cart = await prisma.sharedCart.findUnique({
      where: { id: cartId }
    })

    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 })
    }

    // Mock data for relations that don't exist in schema
    const mockItems = [] as any[]
    const mockOwner = { id: cart.ownerId, name: 'Owner' }
    const mockMembers = [] as any[]

    return NextResponse.json({
      cart: {
        id: cart.id,
        name: cart.name,
        owner: mockOwner,
        members: mockMembers,
        items: mockItems,
        total: 0,
        isActive: cart.isActive,
        inviteCode: cart.inviteCode
      }
    })
  } catch (error) {
    console.error('Shared cart error:', error)
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}

// POST - Create or join shared cart
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, cartId, name, inviteCode } = await req.json()

    if (action === 'create') {
      const cart = await prisma.sharedCart.create({
        data: {
          name: name || 'Shared Cart',
          ownerId: userId,
          inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
          isActive: true
        }
      })

      return NextResponse.json({
        success: true,
        cart: {
          id: cart.id,
          name: cart.name,
          inviteCode: cart.inviteCode,
          message: 'Shared cart created! Share the invite code with friends.'
        }
      })
    }

    if (action === 'join' && inviteCode) {
      const cart = await prisma.sharedCart.findFirst({
        where: { inviteCode }
      })

      if (!cart) {
        return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 })
      }

      // Check if already member
      const existing = await prisma.sharedCartMember.findFirst({
        where: {
          cartId: cart.id,
          userId
        }
      })

      if (!existing) {
        await prisma.sharedCartMember.create({
          data: {
            cartId: cart.id,
            userId
          }
        })
      }

      return NextResponse.json({
        success: true,
        cartId: cart.id,
        message: `Joined ${cart.name}!`
      })
    }

    if (action === 'add-item' && cartId) {
      const { productId, quantity } = await req.json()

      const item = await prisma.sharedCartItem.create({
        data: {
          cartId,
          productId,
          quantity,
          addedBy: userId
        }
      })

      return NextResponse.json({
        success: true,
        item,
        message: 'Item added to shared cart'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Shared cart action error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
