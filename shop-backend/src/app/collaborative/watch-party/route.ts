import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get watch party status
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const partyId = searchParams.get('partyId')

    if (!partyId) {
      return NextResponse.json({ error: 'Party ID required' }, { status: 400 })
    }

    const party = await prisma.watchParty.findUnique({
      where: { id: partyId }
    })

    if (!party) {
      return NextResponse.json({ error: 'Party not found' }, { status: 404 })
    }

    return NextResponse.json({
      party: {
        id: party.id,
        title: party.title,
        isActive: party.isActive,
        startedAt: party.startedAt,
        memberCount: 0
      },
      synced: true,
      chat: [], // Would fetch from real-time
      reactions: ['', '', '', '']
    })
  } catch (error) {
    console.error('Watch party error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// POST - Create or join watch party
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    const { action, productId, partyId } = await req.json()

    if (action === 'create' && userId) {
      const party = await prisma.watchParty.create({
        data: {
          hostId: userId,
          title: 'Watch Party',
          videoUrl: 'https://example.com/video',
          productId,
          isActive: true,
          startedAt: new Date(),
          inviteCode: generateInviteCode()
        }
      })

      return NextResponse.json({
        success: true,
        party: {
          id: party.id,
          inviteCode: party.inviteCode,
          joinUrl: `${process.env.NEXT_PUBLIC_URL}/watch-party/${party.id}`
        },
        message: 'Watch party created! Share the link with friends.'
      })
    }

    if (action === 'join' && userId && partyId) {
      await prisma.watchPartyMember.create({
        data: {
          partyId,
          userId,
          joinedAt: new Date()
        }
      }).catch(() => {})

      return NextResponse.json({
        success: true,
        message: 'Joined the watch party!'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Watch party action error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}
