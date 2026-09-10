import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { holographicSystem } from '@/lib/holographic-system';
import { grapseeAI } from '@/lib/grapsee-ai';

// GET /api/ar/sessions - Get AR sessions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const productId = searchParams.get('productId');
    const isActive = searchParams.get('isActive');

    const sessions = await prisma.aRSession.findMany({
      where: {
        ...(userId && { userId }),
        ...(productId && { productId }),
        ...(isActive !== undefined && { isActive: isActive === 'true' }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
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
    console.error('Error fetching AR sessions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch AR sessions' },
      { status: 500 }
    );
  }
}

// POST /api/ar/sessions - Start AR session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      productId,
      environment = 'real-world',
      trackingMode = 'markerless',
    } = body;

    if (!userId || !productId) {
      return NextResponse.json(
        { success: false, error: 'User ID and Product ID required' },
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

    // Check if user already has active AR session for this product
    const existingSession = await prisma.aRSession.findFirst({
      where: {
        userId,
        productId,
        isActive: true,
      },
    });

    if (existingSession) {
      return NextResponse.json({
        success: false,
        error: 'Active AR session already exists for this product',
        data: existingSession,
      });
    }

    // Start AR session using holographic system
    const arSession = await holographicSystem.startARSession(
      userId,
      productId,
      environment
    );

    // Store in database
    const session = await prisma.aRSession.create({
      data: {
        userId,
        productId,
        environment,
        trackingMode,
        isActive: true,
        startTime: new Date(),
        interactions: [],
        analyticsData: {
          sessionId: arSession.id,
          environment,
          trackingMode,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: session,
      message: 'AR session started successfully',
    });
  } catch (error) {
    console.error('Error starting AR session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to start AR session' },
      { status: 500 }
    );
  }
}

// PUT /api/ar/sessions - Handle AR interaction
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      interaction,
      analyticsData,
    } = body;

    if (!sessionId || !interaction) {
      return NextResponse.json(
        { success: false, error: 'Session ID and interaction required' },
        { status: 400 }
      );
    }

    // Get existing session
    const session = await prisma.aRSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'AR session not found' },
        { status: 404 }
      );
    }

    if (!session.isActive) {
      return NextResponse.json(
        { success: false, error: 'AR session is not active' },
        { status: 400 }
      );
    }

    // Handle interaction using holographic system
    await holographicSystem.handleARInteraction(sessionId, interaction);

    // Update session with new interaction
    const updatedInteractions = [
      ...(session.interactions as any || []),
      {
        ...interaction,
        timestamp: new Date(),
      },
    ];

    const updatedSession = await prisma.aRSession.update({
      where: { id: sessionId },
      data: {
        interactions: updatedInteractions,
        ...(analyticsData && { analyticsData }),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedSession,
    });
  } catch (error) {
    console.error('Error handling AR interaction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to handle AR interaction' },
      { status: 500 }
    );
  }
}

// DELETE /api/ar/sessions - End AR session
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');
    const productId = searchParams.get('productId');

    let whereClause: any = {};
    
    if (sessionId) {
      whereClause.id = sessionId;
    } else if (userId && productId) {
      whereClause = {
        userId,
        productId,
        isActive: true,
      };
    } else {
      return NextResponse.json(
        { success: false, error: 'Session ID or both User ID and Product ID required' },
        { status: 400 }
      );
    }

    // Get session before ending it
    const session = await prisma.aRSession.findFirst({
      where: whereClause,
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'AR session not found' },
        { status: 404 }
      );
    }

    // End AR session using holographic system
    holographicSystem.endARSession(session.id);

    // Update database
    const endedSession = await prisma.aRSession.update({
      where: { id: session.id },
      data: {
        isActive: false,
        endTime: new Date(),
      },
    });

    // Get session analytics
    const analytics = holographicSystem.getARSessionAnalytics(session.id);

    return NextResponse.json({
      success: true,
      data: {
        session: endedSession,
        analytics,
      },
      message: 'AR session ended successfully',
    });
  } catch (error) {
    console.error('Error ending AR session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to end AR session' },
      { status: 500 }
    );
  }
}
