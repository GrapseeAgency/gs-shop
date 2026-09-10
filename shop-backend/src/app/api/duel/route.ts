// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get active duels
export async function GET(req: NextRequest) {
  try {
    const duels = await prisma.productDuel.findMany({
      where: {
        status: 'active',
        endsAt: { gt: new Date() }
      },
      include: {
        productA: { select: { id: true, name: true, imageUrl: true, price: true } },
        productB: { select: { id: true, name: true, imageUrl: true, price: true } },
              },
      take: 5
    })

    // Get vote counts
    const duelsWithVotes = await Promise.all(
      duels.map(async (duel) => {
        const votesA = await prisma.duelVote.count({
          where: { duelId: duel.id, choice: 'A' }
        })
        const votesB = await prisma.duelVote.count({
          where: { duelId: duel.id, choice: 'B' }
        })
        const total = votesA + votesB

        return {
          ...duel,
          votes: {
            A: votesA,
            B: votesB,
            percentA: total > 0 ? Math.round((votesA / total) * 100) : 50,
            percentB: total > 0 ? Math.round((votesB / total) * 100) : 50
          }
        }
      })
    )

    return NextResponse.json({ duels: duelsWithVotes })
  } catch (error) {
    console.error('Duel fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch duels' }, { status: 500 })
  }
}

// POST - Vote in duel
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { duelId, choice } = await req.json()

    // Check if already voted
    const existing = await prisma.duelVote.findUnique({
      where: {
        duelId_userId: { duelId, userId }
      }
    })

    if (existing) {
      return NextResponse.json({ error: 'Already voted' }, { status: 400 })
    }

    // Create vote
    await prisma.duelVote.create({
      data: {
        duelId,
        userId,
        choice
      }
    })

    // Get updated counts
    const votesA = await prisma.duelVote.count({
      where: { duelId, choice: 'A' }
    })
    const votesB = await prisma.duelVote.count({
      where: { duelId, choice: 'B' }
    })
    const total = votesA + votesB

    // Check if duel should end
    const duel = await prisma.productDuel.findUnique({
      where: { id: duelId }
    })

    if (duel && new Date(duel.endsAt) < new Date()) {
      // Determine winner
      const winner = votesA > votesB ? 'A' : votesB > votesA ? 'B' : 'tie'
      
      await prisma.productDuel.update({
        where: { id: duelId },
        data: {
          status: 'completed',
          winner: winner === 'tie' ? null : winner,
          finalVotesA: votesA,
          finalVotesB: votesB
        }
      })

      // Award discount to winning voters
      if (winner !== 'tie') {
        const winningVotes = winner === 'A' ? votesA : votesB
        const discount = winningVotes > 50 ? 20 : 10
        
        // Create coupon code
        await prisma.coupon.create({
          data: {
            code: `DUEL-${duelId.substring(0, 6).toUpperCase()}`,
            discount,
            type: 'percentage',
            maxUses: winningVotes,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      votes: {
        A: votesA,
        B: votesB,
        percentA: total > 0 ? Math.round((votesA / total) * 100) : 50,
        percentB: total > 0 ? Math.round((votesB / total) * 100) : 50
      },
      message: 'Vote recorded!'
    })
  } catch (error) {
    console.error('Duel vote error:', error)
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 })
  }
}

// PUT - Create new duel (admin or auto-generated)
export async function PUT(req: NextRequest) {
  try {
    const { productAId, productBId, duration = 24 } = await req.json()

    const duel = await prisma.productDuel.create({
      data: {
        productAId,
        productBId,
        status: 'active',
        endsAt: new Date(Date.now() + duration * 60 * 60 * 1000)
      }
    })

    return NextResponse.json({
      success: true,
      duel,
      message: 'Duel created!'
    })
  } catch (error) {
    console.error('Duel creation error:', error)
    return NextResponse.json({ error: 'Failed to create duel' }, { status: 500 })
  }
}
