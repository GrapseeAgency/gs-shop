// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Create or vote on group decision
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, pollId, options, vote } = await req.json()

    if (action === 'create') {
      const poll = await prisma.groupDecision.create({
        data: {
          creatorId: userId,
          options: JSON.stringify(options),
          status: 'active',
          createdAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        poll: {
          id: poll.id,
          options,
          shareUrl: `${process.env.NEXT_PUBLIC_URL}/poll/${poll.id}`,
          message: 'Poll created! Share with friends to decide together.'
        }
      })
    }

    if (action === 'vote' && pollId) {
      // Check if already voted
      const existing = await prisma.groupVote.findUnique({
        where: {
          pollId_userId: { pollId, userId }
        }
      })

      if (existing) {
        await prisma.groupVote.update({
          where: { id: existing.id },
          data: { option: vote, votedAt: new Date() }
        })
      } else {
        await prisma.groupVote.create({
          data: {
            pollId,
            userId,
            option: vote,
            votedAt: new Date()
          }
        })
      }

      // Get updated results
      const results = await getPollResults(pollId)

      return NextResponse.json({
        success: true,
        voted: true,
        results,
        message: 'Vote recorded!'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Group decision error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// GET - Get poll results
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const pollId = searchParams.get('pollId')

    if (!pollId) {
      return NextResponse.json({ error: 'Poll ID required' }, { status: 400 })
    }

    const results = await getPollResults(pollId)

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Poll results error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

async function getPollResults(pollId: string) {
  const poll = await prisma.groupDecision.findUnique({
    where: { id: pollId }
  })

  if (!poll) return null

  const votes = await prisma.groupVote.findMany({
    where: { pollId },
    include: {
      user: { select: { name: true, avatar: true } }
    }
  })

  const options = JSON.parse(poll.options || '[]')
  const voteCount: Record<string, number> = {}
  
  votes.forEach(v => {
    voteCount[v.option] = (voteCount[v.option] || 0) + 1
  })

  const results = options.map((opt: string) => ({
    option: opt,
    votes: voteCount[opt] || 0,
    percentage: votes.length > 0 ? ((voteCount[opt] || 0) / votes.length) * 100 : 0
  }))

  results.sort((a: any, b: any) => b.votes - a.votes)

  return {
    pollId,
    options: results,
    totalVotes: votes.length,
    winner: results[0]?.votes > 0 ? results[0].option : null,
    voters: votes.map(v => ({ name: v.user?.name, avatar: v.user?.avatar }))
  }
}
