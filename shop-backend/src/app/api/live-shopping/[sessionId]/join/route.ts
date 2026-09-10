import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { liveShoppingService } from '@/lib/live-shopping';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if session exists and is live
    const session = await prisma.liveShoppingSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Live shopping session not found' },
        { status: 404 }
      );
    }

    if (session.status !== 'live') {
      return NextResponse.json(
        { success: false, error: 'Session is not currently live' },
        { status: 400 }
      );
    }

    // Join session using live shopping service
    const joinResult = await liveShoppingService.joinSession(sessionId, userId);

    if (!joinResult) {
      return NextResponse.json(
        { success: false, error: 'Failed to join session' },
        { status: 500 }
      );
    }

    // Update viewer count
    await prisma.liveShoppingSession.update({
      where: { id: sessionId },
      data: {
        viewers: session.viewers + 1
      }
    });

    // Create join interaction record
    await prisma.liveShoppingInteraction.create({
      data: {
        sessionId,
        userId,
        type: 'join',
        content: 'User joined the live session',
        data: {
          joinedAt: new Date(),
          viewerCount: session.viewers + 1
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        userId,
        joined: true,
        viewerCount: session.viewers + 1,
        joinedAt: new Date(),
        message: 'Successfully joined live shopping session'
      }
    });

  } catch (error) {
    console.error('Error joining live shopping session:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if session exists
    const session = await prisma.liveShoppingSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Live shopping session not found' },
        { status: 404 }
      );
    }

    // Leave session using live shopping service
    const leaveResult = await liveShoppingService.leaveSession(sessionId, userId);

    // Update viewer count
    const newViewerCount = Math.max(0, session.viewers - 1);
    await prisma.liveShoppingSession.update({
      where: { id: sessionId },
      data: {
        viewers: newViewerCount
      }
    });

    // Create leave interaction record
    await prisma.liveShoppingInteraction.create({
      data: {
        sessionId,
        userId,
        type: 'leave',
        content: 'User left the live session',
        data: {
          leftAt: new Date(),
          viewerCount: newViewerCount
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        userId,
        left: true,
        viewerCount: newViewerCount,
        leftAt: new Date(),
        message: 'Successfully left live shopping session'
      }
    });

  } catch (error) {
    console.error('Error leaving live shopping session:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
