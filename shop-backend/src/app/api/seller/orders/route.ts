import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

// GET - List seller orders
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // Find seller
    const seller = await prisma.seller.findFirst({
      where: { userId: session.user.id },
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
    }

    // Get seller's product IDs
    const sellerProducts = await prisma.product.findMany({
      where: { sellerId: seller.id },
      select: { id: true, name: true, imageUrl: true },
    })
    const sellerProductIds = sellerProducts.map(p => p.id)
    const productNameMap = Object.fromEntries(sellerProducts.map(p => [p.id, p.name]))
    const productImageMap = Object.fromEntries(sellerProducts.map(p => [p.id, p.imageUrl]))

    // Build where clause for orders containing seller's products
    const where: any = {
      items: {
        some: {
          productId: { in: sellerProductIds },
        },
      },
    }

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { id: { contains: search } },
      ]
    }

    // Get orders
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          items: true,
        },
      }),
      prisma.order.count({ where
      }),
    ])

    // Calculate order totals for seller items only
    const formattedOrders = orders.map(order => {
      const sellerItems = order.items.filter(i => sellerProductIds.includes(i.productId))
      const sellerTotal = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      
      return {
        id: order.id,
        customer: {
          id: order.user?.id,
          name: order.user?.name || 'Guest',
          email: order.user?.email,
          avatar: order.user?.avatar,
        },
        items: sellerItems.map(item => ({
          id: item.id,
          productId: item.productId,
          name: productNameMap[item.productId] || item.productName,
          imageUrl: productImageMap[item.productId],
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
        total: sellerTotal,
        status: order.status,
        shippingAddress: order.shippingAddress,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      }
    })

    return NextResponse.json({
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching seller orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
