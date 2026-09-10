import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// In-memory activity storage for social proof events
interface SocialProofEvent {
  id: string
  type: 'purchase' | 'review' | 'signup' | 'wishlist' | 'cart'
  title: string
  description: string
  userName: string
  productName?: string
  productId?: string
  location?: string
  avatar?: string
  timestamp: string
}

// User activity storage (existing)
interface Activity {
  id: string
  type: 'product_view' | 'search' | 'add_to_cart' | 'wishlist_add' | 'purchase'
  title: string
  description: string
  productName?: string
  productId?: string
  searchQuery?: string
  timestamp: string
  metadata?: Record<string, unknown>
}

// GET /api/activity Return recent activity & social proof
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mode = searchParams.get('mode') // 'activity' (default) or 'social-proof'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const type = searchParams.get('type')

    // Social proof mode: recent orders, reviews, signups for live social proof
    if (mode === 'social-proof') {
      let socialProofData: SocialProofEvent[] = []

      try {
        // Try to fetch real data from database
        const [recentOrders, recentReviews, recentUsers] = await Promise.all([
          prisma.order.findMany({
            where: { status: { not: 'cancelled' } },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
              id: true,
              customerName: true,
              total: true,
              createdAt: true,
              items: { take: 1, select: { productName: true, productId: true } },
            },
          }),
          prisma.review.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
              id: true,
              author: true,
              rating: true,
              comment: true,
              productId: true,
              createdAt: true,
              product: { select: { name: true } },
            },
          }),
          prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
              id: true,
              name: true,
              createdAt: true,
            },
          }),
        ])

        // Convert orders to social proof events
        recentOrders.forEach((order, i) => {
          const firstName = order.customerName.split(' ')[0]
          const lastName = order.customerName.split(' ').slice(1).map(n => n[0] + '.').join(' ')
          socialProofData.push({
            id: `sp-order-${order.id}`,
            type: 'purchase',
            title: 'Just purchased',
            description: `purchased ${order.items[0]?.productName || 'items'} for $${order.total.toLocaleString()}`,
            userName: `${firstName} ${lastName}`.trim() || firstName,
            productName: order.items[0]?.productName,
            productId: order.items[0]?.productId,
            location: [][i % [].length],
            timestamp: order.createdAt.toISOString(),
          })
        })

        // Convert reviews to social proof events
        recentReviews.forEach((review) => {
          const firstName = review.author.split(' ')[0]
          const lastName = review.author.split(' ').slice(1).map(n => n[0] + '.').join(' ')
          socialProofData.push({
            id: `sp-review-${review.id}`,
            type: 'review',
            title: `Left a ${review.rating}-star review`,
            description: `reviewed ${review.product.name}  "${review.comment.substring(0, 30)}..."`,
            userName: `${firstName} ${lastName}`.trim() || firstName,
            productName: review.product.name,
            productId: review.productId,
            timestamp: review.createdAt.toISOString(),
          })
        })

        // Convert signups to social proof events
        recentUsers.forEach((user, i) => {
          const firstName = user.name.split(' ')[0]
          const lastName = user.name.split(' ').slice(1).map(n => n[0] + '.').join(' ')
          socialProofData.push({
            id: `sp-signup-${user.id}`,
            type: 'signup',
            title: 'Just joined Grapsee',
            description: 'signed up for a new account',
            userName: `${firstName} ${lastName}`.trim() || firstName,
            location: [][i % [].length],
            timestamp: user.createdAt.toISOString(),
          })
        })
      } catch {
        // Fallback to [] data if database is empty or models don't exist
      }

      // If no real data, use [] data
      if (socialProofData.length === 0) {
        socialProofData = []
      }

      // Sort by timestamp (newest first)
      socialProofData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      // Filter by type if specified
      if (type && ['purchase', 'review', 'signup', 'wishlist', 'cart'].includes(type)) {
        socialProofData = socialProofData.filter(e => e.type === type)
      }

      const total = socialProofData.length
      const skip = (page - 1) * limit
      const data = socialProofData.slice(skip, skip + limit)

      return NextResponse.json({
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      })
    }

    // Default mode: user activity log
    let filtered = []
    if (type && ['product_view', 'search', 'add_to_cart', 'wishlist_add', 'purchase'].includes(type)) {
      filtered = filtered.filter(a => a.type === type)
    }

    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const skip = (page - 1) * limit
    const data = filtered.slice(skip, skip + limit)

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages,
    })
  } catch (error) {
    console.error('Error fetching activity:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    )
  }
}
