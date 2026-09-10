import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id as string | undefined

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread') === 'true'
    const type = searchParams.get('type') || undefined
    const countOnly = searchParams.get('countOnly') === 'true'

    const where: Record<string, unknown> = {}
    if (userId) where.userId = userId
    if (unreadOnly) where.isRead = false
    if (type && type !== 'all') where.type = type

    if (countOnly) {
      const count = await prisma.notification.count({ where: { ...where, isRead: false } })
      return NextResponse.json({ count })
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ data: notifications })
  } catch (error) {
    console.error('[NOTIFICATIONS_GET]', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id as string | undefined

    const body = await request.json()
    const { id, markAll } = body

    if (markAll) {
      const where: Record<string, unknown> = { isRead: false }
      if (userId) where.userId = userId
      await prisma.notification.updateMany({ where, data: { isRead: true } })
      return NextResponse.json({ message: 'All notifications marked as read' })
    }

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Notification id is required' },
        { status: 400 }
      )
    }

    const existing = await prisma.notification.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }
    if (userId && (existing as any).userId && (existing as any).userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('[NOTIFICATIONS_PUT]', error)
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const callerId = (session?.user as any)?.id as string | undefined

    const body = await request.json()
    const { userId, type, title, message, link, metadata, priority = 'normal', category } = body

    if (!type || !title || !message) {
      return NextResponse.json({ error: 'type, title, and message are required' }, { status: 400 })
    }

    const targetUserId = userId ?? callerId ?? null

    const notification = await prisma.notification.create({
      data: {
        userId: targetUserId,
        type,
        title,
        message,
        link: link ?? null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        priority,
        category: category ?? null,
      },
    })

    return NextResponse.json({ data: notification })
  } catch (error) {
    console.error('[NOTIFICATIONS_POST]', error)
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id as string | undefined

    const body = await request.json()
    const { id, clearRead } = body

    // Delete individual notification
    if (id && typeof id === 'string') {
      const existing = await prisma.notification.findUnique({ where: { id } })
      if (!existing) {
        return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
      }
      if (userId && (existing as any).userId && (existing as any).userId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      await prisma.notification.delete({ where: { id } })
      return NextResponse.json({ data: { id }, message: 'Notification deleted' })
    }

    // Clear all read notifications (scoped to user)
    if (clearRead) {
      const where: Record<string, unknown> = { isRead: true }
      if (userId) where.userId = userId
      const result = await prisma.notification.deleteMany({ where
      })
      return NextResponse.json({
        data: { deletedCount: result.count },
        message: `Cleared ${result.count} read notification(s)`,
      })
    }

    return NextResponse.json(
      { error: 'Provide id or clearRead in body' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[NOTIFICATIONS_DELETE]', error)
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    )
  }
}
