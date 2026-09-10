import { NextRequest, NextResponse } from 'next/server';

// POST /api/bio-hacking/sessions/[sessionId]/pause - Pause session
export async function POST(request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params;

    // Pause session structure
    const pausedSession = {
      id: sessionId,
      status: 'paused',
      pausedAt: new Date()
    };

    return NextResponse.json({
      success: true,
      data: pausedSession,
      message: 'Session paused successfully'
    });
  } catch (error) {
    console.error('Error pausing session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to pause session' },
      { status: 500 }
    );
  }
}
