import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Webhook for Grapsee.com to send replies back to shop users
export async function POST(req: NextRequest) {
  try {
    // Verify webhook signature
    const apiKey = req.headers.get('x-api-key')
    if (apiKey !== process.env.GRAPSEE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { sessionId, message, agentName, agentId } = await req.json()
    
    if (!sessionId || !message) {
      return NextResponse.json({ error: 'sessionId and message required' }, { status: 400 })
    }
    
    // Verify session exists
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId }
    })
    
    if (!session) {
      return NextResponse.json({ error: 'Chat session not found' }, { status: 404 })
    }
    
    // Store the reply
    const reply = await prisma.chatMessage.create({
      data: {
        sessionId,
        message,
        sender: 'AGENT',
        agentName: agentName || 'Grapsee Support',
        agentId: agentId || 'admin',
        timestamp: new Date(),
        read: true // Agent messages are marked as read
      }
    })
    
    // Update session lastMessageAt
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        lastMessageAt: new Date(),
        updatedAt: new Date()
      }
    })
    
    // Send push notification to customer using custom notification service
    try {
      const { sendPushNotification } = await import('@/lib/push-notification')
      await sendPushNotification({
        userId: session.userId,
        customerEmail: session.customerEmail,
        title: 'New message from Grapsee Support',
        body: message,
        data: {
          sessionId,
          type: 'chat_reply'
        }
      })
      console.log('Push notification sent to customer:', session.customerEmail || session.userId)
    } catch (pushError) {
      console.error('Failed to send push notification (non-critical):', pushError)
      // Don't fail the request if push notification fails
    }
    
    return NextResponse.json({
      success: true,
      messageId: reply.id,
      message: 'Reply delivered to user'
    })
    
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 })
  }
}

// Get chat history for a session
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('sessionId')
  const userId = searchParams.get('userId')
  const customerEmail = searchParams.get('customerEmail')
  
  if (!sessionId && !userId && !customerEmail) {
    return NextResponse.json({ error: 'sessionId, userId, or customerEmail required' }, { status: 400 })
  }
  
  try {
    let session = null
    
    if (sessionId) {
      session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: {
          messages: {
            orderBy: { timestamp: 'asc' }
          }
        }
      })
    } else if (userId) {
      session = await prisma.chatSession.findFirst({
        where: {
          userId,
          status: 'active'
        },
        orderBy: { createdAt: 'desc' },
        include: {
          messages: {
            orderBy: { timestamp: 'asc' }
          }
        }
      })
    } else if (customerEmail) {
      session = await prisma.chatSession.findFirst({
        where: {
          customerEmail,
          status: 'active',
          userId: null
        },
        orderBy: { createdAt: 'desc' },
        include: {
          messages: {
            orderBy: { timestamp: 'asc' }
          }
        }
      })
    }
    
    if (!session) {
      return NextResponse.json({ success: true, messages: [], notifications: [] })
    }
    
    // Transform messages to match frontend format
    const messages = session.messages.map((msg) => ({
      id: msg.id,
      senderId: msg.sender === 'AGENT' ? 'admin' : (msg.userId || 'customer'),
      content: msg.message,
      type: 'text' as const,
      timestamp: msg.timestamp.toISOString(),
      isRead: msg.read
    }))

    // Fetch unread notifications for this user
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          session.userId ? { userId: session.userId } : {},
          session.customerEmail ? { 
            // For guest users, check if notification metadata contains their email
            metadata: {
              contains: session.customerEmail
            }
          } : {}
        ],
        isRead: false
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    const notificationData = notifications.map(notif => ({
      id: notif.id,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      priority: notif.priority,
      createdAt: notif.createdAt,
      metadata: notif.metadata ? JSON.parse(notif.metadata) : null
    }))
    
    return NextResponse.json({
      success: true,
      sessionId: session.id,
      messages,
      notifications: notificationData
    })
    
  } catch (error) {
    console.error('Webhook GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}
