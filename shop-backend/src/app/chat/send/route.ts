import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Send message from user to Grapsee Support
export async function POST(req: NextRequest) {
  try {
    const { userId, message, roomId } = await req.json()
    
    // Create message in database
    const chatMessage = await prisma.chatMessage.create({
      data: {
        userId,
        roomId,
        message,
        sender: 'USER',
        timestamp: new Date(),
        read: false
      }
    })
    
    // Send notification to Grapsee.com admin panel via webhook
    const webhookUrl = process.env.GRAPSEE_WEBHOOK_URL || 'https://grapsee.com/api/webhooks/chat'
    
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-API-Key': process.env.GRAPSEE_WEBHOOK_SECRET || ''
      },
      body: JSON.stringify({
        type: 'NEW_MESSAGE',
        shop: 'grapsee-shop',
        messageId: chatMessage.id,
        userId,
        roomId,
        message,
        timestamp: chatMessage.timestamp,
        user: await prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, email: true }
        })
      })
    }).catch(err => console.error('Webhook error:', err))
    
    return NextResponse.json({
      success: true,
      messageId: chatMessage.id,
      message: 'Message sent to Grapsee Support'
    })
    
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
