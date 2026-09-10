import { NextRequest, NextResponse } from 'next/server';

// POST /api/trend-council/voting/[sessionId]/vote - Vote on session
export async function POST(request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params;
    const body = await request.json();
    const { userId, vote, candidateId } = body;

    if (!userId || !vote) {
      return NextResponse.json(
        { success: false, error: 'User ID and vote required' },
        { status: 400 }
      );
    }

    const voteRecord = {
      sessionId,
      userId,
      vote,
      candidateId: candidateId || null,
      timestamp: new Date(),
    };

    return NextResponse.json({
      success: true,
      data: {
        vote: voteRecord,
      },
      message: 'Vote recorded successfully'
    });
  } catch (error) {
    console.error('Error voting on session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to vote on session' },
      { status: 500 }
    );
  }
}
