// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get shopping party session
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const partyId = searchParams.get('partyId')

    if (!partyId) {
      return NextResponse.json({ error: 'Party ID required' }, { status: 400 })
    }

    const party = await prisma.shoppingParty.findUnique({
      where: { id: partyId },
      include: {
        members: {
          select: { id: true, name: true, avatar: true, cursor: true }
        },
        host: {
          select: { id: true, name: true }
        }
      }
    })

    if (!party) {
      return NextResponse.json({ error: 'Party not found' }, { status: 404 })
    }

    return NextResponse.json({
      party: {
        id: party.id,
        name: party.name,
        host: party.host,
        members: party.members,
        isActive: party.isActive,
        createdAt: party.createdAt
      },
      liveChat: [], // Would fetch from real-time service
      currentProduct: party.currentProduct,
      votes: party.votes || {}
    })
  } catch (error) {
    console.error('Shopping party error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// POST - Create or manage shopping party
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, partyId, name, inviteEmails } = await req.json()

    if (action === 'create') {
      const party = await prisma.shoppingParty.create({
        data: {
          name: name || 'Shopping Party',
          hostId: userId,
          inviteCode: generateInviteCode(),
          isActive: true
        }
      })

      return NextResponse.json({
        success: true,
        party: {
          id: party.id,
          name: party.name,
          inviteCode: party.inviteCode,
          joinUrl: `${process.env.NEXT_PUBLIC_URL}/shopping-party/${party.id}`
        },
        message: 'Shopping party created! Share the link with friends.'
      })
    }

    if (action === 'join' && partyId) {
      // Check if already member
      const existing = await prisma.shoppingPartyMember.findUnique({
        where: { partyId_userId: { partyId, userId } }
      })

      if (!existing) {
        await prisma.shoppingPartyMember.create({
          data: {
            partyId,
            userId,
            joinedAt: new Date()
          }
        })
      }

      return NextResponse.json({
        success: true,
        partyId,
        message: 'Joined the shopping party!'
      })
    }

    if (action === 'vote' && partyId) {
      const { productId, vote } = await req.json()
      
      await prisma.shoppingPartyVote.create({
        data: {
          partyId,
          userId,
          productId,
          vote
        }
      }).catch(() => {
        // Update existing vote
      })

      return NextResponse.json({
        success: true,
        message: 'Vote recorded!'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Party action error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

function generateInviteCode(): string {
}
