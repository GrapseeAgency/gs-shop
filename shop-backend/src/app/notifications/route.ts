import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread') === 'true'

    const where = unreadOnly ? { isRead: false } : {}

    const notifications = await db.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
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
    const body = await request.json()
    const { id, markAll } = body

    if (markAll) {
      await db.notification.updateMany({
        where: { isRead: false },
        data: { isRead: true },
      })
      return NextResponse.json({ message: 'All notifications marked as read' })
    }

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Notification id is required' },
        { status: 400 }
      )
    }

    const existing = await db.notification.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    const updated = await db.notification.update({
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

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, clearRead } = body

    // Delete individual notification
    if (id && typeof id === 'string') {
      const existing = await db.notification.findUnique({ where: { id } })
      if (!existing) {
        return NextResponse.json(
          { error: 'Notification not found' },
          { status: 404 }
        )
      }
      await db.notification.delete({ where: { id } })
      return NextResponse.json({
        data: { id },
        message: 'Notification deleted',
      })
    }

    // Clear all read notifications
    if (clearRead) {
      const result = await db.notification.deleteMany({
        where: { isRead: true },
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
