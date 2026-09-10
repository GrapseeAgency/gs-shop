import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Send message from user to Grapsee Support
export async function POST(req: NextRequest) {
  try {
    const { userId, message, customerEmail, customerName, productId, productName } = await req.json()
    
    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Determine user info
    let user = null
    let sessionId = null
    let isPaidCustomer = false
    let orderCount = 0

    if (userId && userId !== 'guest') {
      user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          _count: {
            select: { orders: true }
          }
        }
      })
      if (user) {
        isPaidCustomer = user._count.orders > 0
        orderCount = user._count.orders
      }
    }

    // Find or create chat session
    if (userId && userId !== 'guest') {
      // Try to find existing active session for this user
      const existingSession = await prisma.chatSession.findFirst({
        where: {
          userId,
          status: 'active'
        },
        orderBy: { createdAt: 'desc' }
      })

      if (existingSession) {
        sessionId = existingSession.id
      } else {
        // Create new session
        const newSession = await prisma.chatSession.create({
          data: {
            userId,
            customerEmail: user?.email || customerEmail,
            customerName: user?.name || customerName,
            productName: productName || 'General Inquiry',
            type: isPaidCustomer ? 'paid' : 'general',
            status: 'active',
            priority: isPaidCustomer ? 'high' : 'normal',
            unreadCount: 0
          }
        })
        sessionId = newSession.id
      }
    } else {
      // Guest user - find or create session by email
      const existingSession = await prisma.chatSession.findFirst({
        where: {
          customerEmail,
          status: 'active',
          userId: null
        },
        orderBy: { createdAt: 'desc' }
      })

      if (existingSession) {
        sessionId = existingSession.id
      } else {
        // Create new guest session
        const newSession = await prisma.chatSession.create({
          data: {
            customerEmail,
            customerName,
            productName: productName || 'General Inquiry',
            type: 'general',
            status: 'active',
            priority: 'normal',
            unreadCount: 0
          }
        })
        sessionId = newSession.id
      }
    }

    // Create message linked to session
    const chatMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        userId: userId === 'guest' ? null : userId,
        message: message.trim(),
        sender: 'USER',
        timestamp: new Date(),
        read: false
      }
    })

    // Update session lastMessageAt and increment unreadCount
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        lastMessageAt: new Date(),
        unreadCount: { increment: 1 },
        updatedAt: new Date()
      }
    })
    
    return NextResponse.json({
      success: true,
      messageId: chatMessage.id,
      sessionId,
      message: 'Message sent to Grapsee Support'
    })
    
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
