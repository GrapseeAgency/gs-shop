import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ count: 0 })
    }

    const userId = session.user.id

    // Count unread notifications for the user
    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    })

    return NextResponse.json({
      count: unreadCount
    })

  } catch (error) {
    console.error('[NOTIFICATIONS_UNREAD]', error)
    return NextResponse.json(
      { error: 'Failed to fetch unread count' },
      { status: 500 }
    )
  }
}
