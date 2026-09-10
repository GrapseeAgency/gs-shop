import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get active group shopping sessions
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    
    // Get sessions user is part of
    const sessions = await prisma.groupShoppingSession.findMany({
      where: {
        OR: [
          { hostId: userId || '' },
          { participants: { contains: userId || '' } }
        ],
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Get active participants count
    const sessionsWithParticipants = sessions.map(s => ({
      ...s,
      participantCount: (s.participants?.split(',').length || 1) + 1, // +1 for host
      isHost: s.hostId === userId,
      timeRemaining: Math.max(0, new Date(s.expiresAt).getTime() - Date.now())
    }))

    return NextResponse.json({
      sessions: sessionsWithParticipants,
      inviteCode: req.nextUrl.searchParams.get('code') || null
    })
  } catch (error) {
    console.error('Group shopping error:', error)
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }
}

// POST - Create or join session
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, code, productId } = await req.json()

    if (action === 'create') {
      // Create new session
      const session = await prisma.groupShoppingSession.create({
        data: {
          hostId: userId,
          inviteCode: generateRoomCode(),
          expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        }
      })

      return NextResponse.json({
        success: true,
        session,
        shareLink: `/group-shop/${session.code}`,
        message: 'Session created! Share the code with friends.'
      })
    }

    if (action === 'join' && code) {
      // Join existing session
      const session = await prisma.groupShoppingSession.findFirst({
        where: { inviteCode: code.toUpperCase() }
      })

      if (!session) {
        return NextResponse.json({ error: 'Invalid session code' }, { status: 404 })
      }

      if (new Date(session.expiresAt) < new Date()) {
        return NextResponse.json({ error: 'Session expired' }, { status: 400 })
      }

      // Add participant
      const currentParticipants = session.participants ? session.participants.split(',') : []
      if (!currentParticipants.includes(userId)) {
        currentParticipants.push(userId)
        await prisma.groupShoppingSession.update({
          where: { id: session.id },
          data: { participants: currentParticipants.join(',') }
        })
      }

      return NextResponse.json({
        success: true,
        session: {
          ...session,
          participantCount: currentParticipants.length + 1
        },
        message: 'Joined session!'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Group shopping action error:', error)
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 })
  }
}

// PUT - Update session (cursor position, product focus)
export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId, cursorX, cursorY, currentProductId, message } = await req.json()

    const update: any = {}
    if (currentProductId) update.currentProductId = currentProductId

    await prisma.groupShoppingSession.update({
      where: { id: sessionId },
      data: update
    })

    // Store cursor position in a separate table or cache
    if (cursorX !== undefined && cursorY !== undefined) {
      // Would use Redis or similar for real-time cursor tracking
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Session update error:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase()
}
