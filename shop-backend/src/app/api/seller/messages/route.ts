import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth-options"
import { prisma } from '@/lib/prisma'

// GET - List seller conversations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread') === 'true'

    // Find seller
    const seller = await prisma.seller.findFirst({
      where: { userId: session.user.id },
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
    }

    // Get messages grouped by user
    const messages = await prisma.sellerMessage.findMany({
      where: {
        sellerId: seller.id,
        ...(unreadOnly && { isRead: false })
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get unread count per conversation
    const conversations = await Promise.all(
      messages.map(async (msg) => {
        const unreadCount = await prisma.sellerMessage.count({
          where: {
            sellerId: seller.id,
            userId: msg.userId,
            isRead: false,
            isFromSeller: false,
          },
        })

        return {
          id: msg.id,
          userId: msg.userId,
          subject: msg.subject,
          lastMessage: msg.content.slice(0, 100) + (msg.content.length > 100 ? '...' : ''),
          lastMessageAt: msg.createdAt,
          unreadCount,
          hasReplies: false
        }
      })
    )

    // Get total unread count
    const totalUnread = await prisma.sellerMessage.count({
      where: {
        sellerId: seller.id,
        isRead: false,
        isFromSeller: false,
      },
    })

    return NextResponse.json({
      conversations,
      totalUnread,
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

// POST - Send message or reply
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const seller = await prisma.seller.findFirst({
      where: { userId: session.user.id },
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
    }

    const body = await request.json()
    const { userId, subject, content, parentId, attachments } = body

    if (!userId || !content) {
      return NextResponse.json(
        { error: 'User ID and content are required' },
        { status: 400 }
      )
    }

    // If replying to a message, mark parent as read
    if (parentId) {
      await prisma.sellerMessage.updateMany({
        where: {
          id: parentId,
          sellerId: seller.id,
        },
        data: { isRead: true,
      },
      })
    }

    // Create message
    const message = await prisma.sellerMessage.create({
      data: {
        sellerId: seller.id,
        userId,
        subject: subject || 'Re: Previous Message',
        content,
        isFromSeller: true
      }
    })

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId,
        type: 'message',
        title: 'New Message from Seller',
        message: `${seller.name} sent you a message: ${content.slice(0, 50)}...`,
        linkUrl: `/messages?seller=${seller.id}`,
      },
    })

    return NextResponse.json({
      success: true,
      message,
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

// PUT - Mark messages as read
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const seller = await prisma.seller.findFirst({
      where: { userId: session.user.id },
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
    }

    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Mark all messages from this user as read
    await prisma.sellerMessage.updateMany({
      where: {
        sellerId: seller.id,
        userId,
        isRead: false,
        isFromSeller: false,
      },
      data: {
        isRead: true,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking messages as read:', error)
    return NextResponse.json(
      { error: 'Failed to update messages' },
      { status: 500 }
    )
  }
}
