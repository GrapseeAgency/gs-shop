import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from "@/lib/auth-options"

/**
 * POST /api/notifications/new-product
 * Call this when a new product is published to notify matched users.
 * Body: { productId, categorySlug, productName, price?, imageUrl? }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as any
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { productId, categorySlug, productName, price, imageUrl } = body

    if (!productId || !categorySlug || !productName) {
      return NextResponse.json(
        { error: 'productId, categorySlug, and productName are required' },
        { status: 400 }
      )
    }

    // Find all users whose interests include this categorySlug
    const allPrefs = await prisma.userPreference.findMany({
      where: { interests: { not: null } },
      select: { userId: true, interests: true },
    })

    const matchedUserIds: string[] = []
    for (const pref of allPrefs) {
      if (!pref.interests) continue
      try {
        const interests: string[] = JSON.parse(pref.interests)
        if (interests.includes(categorySlug)) {
          matchedUserIds.push(pref.userId)
        }
      } catch { /* skip invalid JSON */ }
    }

    // Fallback: if no matched users, send to all users (early stage with no interests yet)
    const targetUserIds = matchedUserIds.length > 0 ? matchedUserIds : null

    const metadata = JSON.stringify({
      productId,
      productName,
      price: price ?? null,
      imageUrl: imageUrl ?? null,
      categorySlug,
    })

    const notificationsData = targetUserIds
      ? targetUserIds.map(userId => ({
          userId,
          type: 'new_arrival',
          title: `New: ${productName}`,
          message: `A new product in your interests is now available  ${productName}${price ? ` for $${price}` : ''}.`,
          link: `/product/${productId}`,
          metadata,
          priority: 'normal',
          category: 'commerce',
        }))
      : [{
          userId: null as unknown as string,
          type: 'new_arrival',
          title: `New Arrival: ${productName}`,
          message: `Check out our latest product  ${productName}${price ? ` starting at $${price}` : ''}.`,
          link: `/product/${productId}`,
          metadata,
          priority: 'normal',
          category: 'commerce',
        }]

    await prisma.notification.createMany({ data: notificationsData })

    return NextResponse.json({
      success: true,
      notified: notificationsData.length,
      matched: matchedUserIds.length,
    })
  } catch (error) {
    console.error('[NOTIFY_NEW_PRODUCT]', error)
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 })
  }
}
