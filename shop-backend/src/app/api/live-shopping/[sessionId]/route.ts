import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { grapseeAI } from '@/lib/grapsee-ai';
import { holographicSystem } from '@/lib/holographic-system';
import { neuralInterface } from '@/lib/neural-interface';
import { quantumComputing } from '@/lib/quantum-computing';

// GET /api/live-shopping/[sessionId] - Get specific live shopping session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await prisma.liveShoppingSession.findUnique({
      where: { id: (await params).sessionId },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        interactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            timestamp: 'desc',
          },
          take: 50,
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    // Get real-time neural insights if session is live
    let neuralInsights = null;
    if (session.status === 'live') {
      neuralInsights = neuralInterface.getNeuralInsights(session.hostId);
    }

    // Get quantum predictions if enabled
    let quantumPredictions = null;
    if (session.quantumFeatures) {
      // This would fetch quantum predictions for the session
      quantumPredictions = await quantumComputing.getQuantumMetrics();
    }

    return NextResponse.json({
      success: true,
      data: {
        ...session,
        neuralInsights,
        quantumPredictions,
      },
    });
  } catch (error) {
    console.error('Error fetching live shopping session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

// PUT /api/live-shopping/[sessionId] - Update live shopping session
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      status,
      viewers,
      emotionalData,
      neuralBiddings,
    } = body;

    const session = await prisma.liveShoppingSession.update({
      where: { id: (await params).sessionId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(status && { status }),
        ...(viewers !== undefined && { viewers }),
        ...(emotionalData && { emotionalData }),
        ...(neuralBiddings && { neuralBiddings }),
        updatedAt: new Date(),
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // If session is going live, initialize real-time features
    if (status === 'live' && body.previousStatus !== 'live') {
      // Start neural monitoring for host
      await neuralInterface.establishNeuralConnection(session.hostId, 'eeg');
      
      // Generate holographic models for products if enabled
      if (session.holographicUrl) {
        await holographicSystem.generateHolographicModel(session.id);
      }
    }

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('Error updating live shopping session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update session' },
      { status: 500 }
    );
  }
}

// DELETE /api/live-shopping/[sessionId] - Delete live shopping session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await prisma.liveShoppingSession.findUnique({
      where: { id: (await params).sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    // Only allow deletion of upcoming sessions
    if (session.status !== 'upcoming') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete active or ended sessions' },
        { status: 400 }
      );
    }

    await prisma.liveShoppingSession.delete({
      where: { id: (await params).sessionId },
    });

    return NextResponse.json({
      success: true,
      message: 'Session deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting live shopping session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}
