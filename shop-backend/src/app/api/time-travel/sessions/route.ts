import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/time-travel/sessions - Get time travel sessions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const timeEra = searchParams.get('timeEra');
    const isActive = searchParams.get('isActive');

    const sessions = await prisma.timeTravelSession.findMany({
      where: {
        ...(userId && { userId }),
        ...(timeEra && { timeEra }),
        ...(isActive !== undefined && { isActive: isActive === 'true' }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error('Error fetching time travel sessions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch time travel sessions' },
      { status: 500 }
    );
  }
}

// POST /api/time-travel/sessions - Initiate time travel session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      destination,
      purpose,
      duration = '1-hour',
      quantumStabilization = true,
      alternateTimeline = false,
    } = body;

    if (!userId || !destination || !purpose) {
      return NextResponse.json(
        { success: false, error: 'User ID, destination, and purpose required' },
        { status: 400 }
      );
    }

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check for existing active session
    const existingSession = await prisma.timeTravelSession.findFirst({
      where: {
        userId,
        isActive: true,
      },
    });

    if (existingSession) {
      return NextResponse.json({
        success: false,
        error: 'Active time travel session already exists',
        data: existingSession,
      });
    }

    // Create time travel session with real schema fields
    const session = await prisma.timeTravelSession.create({
      data: {
        userId,
        timeEra: destination,
        timelineData: {
          purpose,
          duration,
          quantumStabilization,
          alternateTimeline,
        },
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: session,
      message: 'Time travel session initiated successfully',
    });
  } catch (error) {
    console.error('Error initiating time travel session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initiate time travel session' },
      { status: 500 }
    );
  }
}

// PUT /api/time-travel/sessions - Update time travel session
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      accessedDeals,
      futureProducts,
      isActive,
    } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Get current session
    const session = await prisma.timeTravelSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Time travel session not found' },
        { status: 404 }
      );
    }

    // Update session
    const updateData: any = {
      ...(accessedDeals && { accessedDeals }),
      ...(futureProducts && { futureProducts }),
      ...(isActive !== undefined && { isActive }),
      ...(isActive === false && { endTime: new Date() }),
    };

    const updatedSession = await prisma.timeTravelSession.update({
      where: { id: sessionId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updatedSession,
    });
  } catch (error) {
    console.error('Error updating time travel session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update time travel session' },
      { status: 500 }
    );
  }
}

// DELETE /api/time-travel/sessions - End time travel session
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    const session = await prisma.timeTravelSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Time travel session not found' },
        { status: 404 }
      );
    }

    await prisma.timeTravelSession.update({
      where: { id: sessionId },
      data: {
        isActive: false,
        endTime: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Time travel session ended successfully',
    });
  } catch (error) {
    console.error('Error ending time travel session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to end time travel session' },
      { status: 500 }
    );
  }
}
