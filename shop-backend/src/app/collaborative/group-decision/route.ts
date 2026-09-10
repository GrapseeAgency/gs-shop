import { NextRequest, NextResponse } from 'next/server'

// POST - Create or vote on group decision
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, options, pollId, vote } = await req.json()

    if (action === 'create') {
      const poll = {
        id: 'mock-' + Date.now(),
        creatorId: userId,
        options: JSON.stringify(options),
        status: 'active',
        createdAt: new Date()
      }

      return NextResponse.json({
        success: true,
        poll: {
          id: poll.id,
          options,
          shareUrl: `/poll/${poll.id}`,
          message: 'Poll created! Share with friends to decide together.'
        }
      })
    }

    if (action === 'vote' && pollId) {
      // Mock vote recording
      return NextResponse.json({
        success: true,
        voted: true,
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
  // Mock poll results
  return {
    pollId,
    options: [],
    totalVotes: 0,
    winner: null,
    voters: []
  }
}
