import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { grapseeAI } from '@/lib/grapsee-ai';
import { holographicSystem } from '@/lib/holographic-system';
import { neuralInterface } from '@/lib/neural-interface';
import { quantumComputing } from '@/lib/quantum-computing';

// GET /api/live-shopping - Get all live shopping sessions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const hostId = searchParams.get('hostId');

    const sessions = await prisma.liveShoppingSession.findMany({
      where: {
        ...(status && { status }),
        ...(hostId && { hostId }),
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          }
        }
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
    console.error('Error fetching live shopping sessions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// POST /api/live-shopping - Create new live shopping session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      hostId,
      products,
      startTime,
      endTime,
      holographicConfig,
      quantumFeatures,
      dnaMatching,
    } = body;

    // Validate host exists
    const host = await prisma.user.findUnique({
      where: { id: hostId },
    });

    if (!host) {
      return NextResponse.json(
        { success: false, error: 'Host not found' },
        { status: 404 }
      );
    }

    // Generate holographic URL if enabled
    let holographicUrl;
    if (holographicConfig?.enabled) {
      const showroom = await holographicSystem.createShowroom(
        `live-${Date.now()}`,
        {
          name: `${title} Showroom`,
          environment: holographicConfig.environment || 'luxury',
          products: products || [],
        }
      );
      holographicUrl = `/holographic/${showroom.id}`;
    }

    // Create live shopping session
    const session = await prisma.liveShoppingSession.create({
      data: {
        title,
        description,
        hostId,
        products: products || [],
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        holographicUrl,
        quantumFeatures: quantumFeatures || false,
        dnaMatching: dnaMatching || false,
        status: 'upcoming',
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

    // Initialize quantum features if enabled
    if (quantumFeatures) {
      await quantumComputing.createQuantumPrediction('demand', {
        sessionId: session.id,
        expectedViewers: 1000,
        products: products,
      }, 'session-duration');
    }

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('Error creating live shopping session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
