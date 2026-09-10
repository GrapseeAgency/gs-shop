import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

/**
 * POST /api/notifications/trigger
 * Admin endpoint to fire notifications to one or many users.
 * Body:
 * { userId?, userIds?, type, title, message, link?, metadata?, priority?, category? }
 * - userId: single target
 * - userIds: array of targets
 * - neither: broadcast (userId = null)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as any
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      userId,
      userIds,
      type,
      title,
      message,
      link,
      metadata,
      priority = 'normal',
      category,
    } = body

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'type, title, and message are required' },
        { status: 400 }
      )
    }

    const metadataStr = metadata ? JSON.stringify(metadata) : null

    const base = { type, title, message, link: link ?? null, metadata: metadataStr, priority, category: category ?? null }

    let count = 0
    if (userId) {
      await prisma.notification.create({ data: { ...base, userId } })
      count = 1
    } else if (Array.isArray(userIds) && userIds.length > 0) {
      await prisma.notification.createMany({
        data: userIds.map((uid: string) => ({ ...base, userId: uid })),
      })
      count = userIds.length
    } else {
      // Broadcast no userId
      await prisma.notification.create({ data: { ...base, userId: null } })
      count = 1
    }

    return NextResponse.json({ success: true, created: count })
  } catch (error) {
    console.error('[NOTIFY_TRIGGER]', error)
    return NextResponse.json({ error: 'Failed to trigger notification' }, { status: 500 })
  }
}
