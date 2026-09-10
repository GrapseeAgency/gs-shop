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
    
    const { roomId, message, agentName, agentId } = await req.json()
    
    // Store the reply
    const reply = await prisma.chatMessage.create({
      data: {
        roomId,
        message,
        sender: 'AGENT',
        agentName: agentName || 'Grapsee Support',
        agentId,
        timestamp: new Date(),
        read: false
      }
    })
    
    // Send real-time notification to user (via WebSocket or SSE)
    // This would typically use a WebSocket server or Server-Sent Events
    
    return NextResponse.json({
      success: true,
      messageId: reply.id,
      message: 'Reply delivered to user'
    })
    
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 })
  }
}

// Get chat history for a room
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const roomId = searchParams.get('roomId')
  
  if (!roomId) {
    return NextResponse.json({ error: 'Room ID required' }, { status: 400 })
  }
  
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { roomId },
      orderBy: { timestamp: 'asc' }
    })
    
    return NextResponse.json({
      success: true,
      roomId,
      messages
    })
    
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}
