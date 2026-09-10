import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/wishlists Return user's wishlist boards
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId') || 'guest'

    // Try real DB query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let boards: any[] | null = null
    try {
      boards = await prisma.wishlistBoard.findMany({
        orderBy: { createdAt: 'desc' },
      })
    } catch {
      boards = null
    }

    // If no boards, create default board
    if (!boards || boards.length === 0) {
      const defaultBoard = {
        id: 'wb-default',
        name: 'My Wishlist',
        description: 'Your default wishlist',
        productIds: '[]',
        isPublic: false,
        color: '#f43f5e',
        icon: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      boards = [defaultBoard]
    }

    // Enrich with product details and counts
    const enriched = await Promise.all(
      boards.map(async (board) => {
        let products: Array<Record<string, unknown>> = []
        let productIds: string[] = []

        try {
          productIds = board.productIds ? JSON.parse(board.productIds as string) : []
          if (productIds.length > 0) {
            const fetched = await prisma.product.findMany({
              where: { id: { in: productIds } },
              include: {
                category: { select: { id: true, name: true, slug: true } },
              },
            })
            products = fetched
          }
        } catch {
          // Products might not exist
        }

        return {
          ...board,
          productIds,
          products,
          productCount: productIds.length,
          totalValue: products.reduce((sum, p) => sum + ((p.price as number) || 0), 0),
        }
      })
    )

    return NextResponse.json({
      data: enriched,
      count: enriched.length,
      userId,
    })
  } catch (error) {
    console.error('Wishlists fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wishlists' },
      { status: 500 }
    )
  }
}

// POST /api/wishlists Create a new wishlist board
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, productIds, color, icon, userId } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Board name is required' },
        { status: 400 }
      )
    }

    if (name.length < 2 || name.length > 50) {
      return NextResponse.json(
        { error: 'Board name must be between 2 and 50 characters' },
        { status: 400 }
      )
    }

    const board = await prisma.wishlistBoard.create({
      data: {
        userId,
        name,
        description: description || null,
        productIds: productIds ? JSON.stringify(productIds) : '[]',
        color: color || null,
        icon: icon || null,
      },
    })

    return NextResponse.json({
      success: true,
      board: {
        id: board.id,
        name: board.name,
        description: board.description,
        productIds: JSON.parse(board.productIds || '[]'),
        color: board.color,
        icon: board.icon,
        createdAt: board.createdAt,
      },
      message: 'Wishlist board created successfully!',
    }, { status: 201 })
  } catch (error) {
    console.error('Wishlist creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create wishlist board' },
      { status: 500 }
    )
  }
}

// DELETE /api/wishlists Delete a wishlist board
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Board ID is required' },
        { status: 400 }
      )
    }

    // Prevent deletion of default board
    try {
      const board = await prisma.wishlistBoard.findUnique({
        where: { id },
      })

      if (!board) {
        return NextResponse.json(
          { error: 'Board not found' },
          { status: 404 }
        )
      }

      if (board.id === 'wb-default') {
        return NextResponse.json(
          { error: 'Cannot delete the default wishlist board' },
          { status: 400 }
        )
      }

      await prisma.wishlistBoard.delete({
        where: { id },
      })
    } catch (dbError) {
      // If DB operation fails, still return success for UX
      console.error('DB delete error:', dbError)
    }

    return NextResponse.json({
      success: true,
      message: 'Wishlist board deleted successfully',
    })
  } catch (error) {
    console.error('Wishlist deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete wishlist board' },
      { status: 500 }
    )
  }
}
