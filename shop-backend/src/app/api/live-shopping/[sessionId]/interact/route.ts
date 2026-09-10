import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { grapseeAI } from '@/lib/grapsee-ai';
import { neuralInterface } from '@/lib/neural-interface';
import { quantumComputing } from '@/lib/quantum-computing';

// POST /api/live-shopping/[sessionId]/interact - Handle user interactions
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const body = await request.json();
    const {
      userId,
      type,
      data,
      neuralData,
      emotionalState,
    } = body;

    // Validate session exists and is active
    const session = await prisma.liveShoppingSession.findUnique({
      where: { id: (await params).sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.status !== 'live') {
      return NextResponse.json(
        { success: false, error: 'Session is not active' },
        { status: 400 }
      );
    }

    // Process neural data if provided
    let neuralConfidence = null;
    let processedNeuralData = null;

    if (neuralData && type === 'neural_intent') {
      // Analyze neural intent using Grapsee AI
      const neuralResponse = await grapseeAI.analyzeNeuralIntent({
        userId,
        sessionId: (await params).sessionId,
        neuralSignals: neuralData,
        context: 'live-shopping',
      });

      neuralConfidence = neuralResponse.confidence;
      processedNeuralData = neuralResponse;

      // If high purchase intent detected, create purchase interaction
      if (neuralResponse.intent === 'purchase' && neuralResponse.confidence > 0.8) {
        await handleNeuralPurchase(userId, (await params).sessionId, neuralResponse, data);
      }
    }

    // Process emotional state if provided
    let processedEmotionalState = emotionalState;
    if (emotionalState && session.quantumFeatures) {
      // Use emotional data for quantum price optimization
      const priceOptimization = await grapseeAI.optimizePrice(
        data?.productData || {},
        { sessionViewers: session.viewers },
        { emotionalState, collectiveMood: session.emotionalData }
      );

      processedEmotionalState = {
        ...emotionalState,
        priceOptimization,
      };
    }

    // Create interaction record
    const interaction = await prisma.liveShoppingInteraction.create({
      data: {
        sessionId: (await params).sessionId,
        userId,
        type,
        data: {
          ...data,
          ...(processedNeuralData && { neuralData: processedNeuralData }),
        },
        neuralConfidence,
        emotionalState: processedEmotionalState,
        timestamp: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Update session emotional data
    if (emotionalState) {
      const updatedEmotionalData = {
        ...(session.emotionalData as any || {}),
        [userId]: {
          state: emotionalState,
          timestamp: new Date(),
        },
      };

      await prisma.liveShoppingSession.update({
        where: { id: (await params).sessionId },
        data: {
          emotionalData: updatedEmotionalData,
        },
      });
    }

    // Handle specific interaction types
    switch (type) {
      case 'purchase':
        await handlePurchase(userId, (await params).sessionId, data);
        break;
      case 'bid':
        await handleBid(userId, (await params).sessionId, data, neuralConfidence);
        break;
      case 'neural_bid':
        await handleNeuralBid(userId, (await params).sessionId, data, neuralConfidence);
        break;
      case 'reaction':
        await handleReaction(userId, (await params).sessionId, data);
        break;
      case 'comment':
        await handleComment(userId, (await params).sessionId, data);
        break;
    }

    return NextResponse.json({
      success: true,
      data: interaction,
    });
  } catch (error) {
    console.error('Error processing live shopping interaction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process interaction' },
      { status: 500 }
    );
  }
}

// Handle neural purchase intent
async function handleNeuralPurchase(
  userId: string,
  sessionId: string,
  neuralResponse: any,
  data: any
) {
  try {
    // Create a high-priority purchase interaction
    await prisma.liveShoppingInteraction.create({
      data: {
        sessionId,
        userId,
        type: 'purchase',
        data: {
          productId: data.productId,
          neuralIntent: neuralResponse.intent,
          confidence: neuralResponse.confidence,
          autoTriggered: true,
        },
        neuralConfidence: neuralResponse.confidence,
        emotionalState: neuralResponse.emotionalState,
        timestamp: new Date(),
      },
    });

    console.log(`Neural purchase triggered for user ${userId} in session ${sessionId}`);
  } catch (error) {
    console.error('Error handling neural purchase:', error);
  }
}

// Handle regular purchase
async function handlePurchase(userId: string, sessionId: string, data: any) {
  try {
    // Process purchase logic
    console.log(`Purchase processed for user ${userId} in session ${sessionId}`);
  } catch (error) {
    console.error('Error handling purchase:', error);
  }
}

// Handle bid with neural confidence
async function handleBid(
  userId: string,
  sessionId: string,
  data: any,
  neuralConfidence: number | null
) {
  try {
    // Create bid with enhanced confidence if neural data available
    const bidData = {
      ...data,
      ...(neuralConfidence && { neuralEnhanced: true, confidence: neuralConfidence }),
    };

    // Store bid in session neural biddings
    const session = await prisma.liveShoppingSession.findUnique({
      where: { id: sessionId },
    });

    if (session) {
      const updatedNeuralBiddings = [
        ...(session.neuralBiddings as any || []),
        {
          userId,
          bid: bidData,
          timestamp: new Date(),
          neuralConfidence,
        },
      ];

      await prisma.liveShoppingSession.update({
        where: { id: sessionId },
        data: {
          neuralBiddings: updatedNeuralBiddings,
        },
      });
    }

    console.log(`Bid processed for user ${userId} in session ${sessionId}`);
  } catch (error) {
    console.error('Error handling bid:', error);
  }
}

// Handle neural-only bid
async function handleNeuralBid(
  userId: string,
  sessionId: string,
  data: any,
  neuralConfidence: number | null
) {
  try {
    // Process neural bid with highest priority
    await handleBid(userId, sessionId, data, neuralConfidence);
    console.log(`Neural bid processed for user ${userId} in session ${sessionId}`);
  } catch (error) {
    console.error('Error handling neural bid:', error);
  }
}

// Handle reaction
async function handleReaction(userId: string, sessionId: string, data: any) {
  try {
    // Process reaction (like, love, laugh, etc.)
    console.log(`Reaction processed for user ${userId} in session ${sessionId}`);
  } catch (error) {
    console.error('Error handling reaction:', error);
  }
}

// Handle comment
async function handleComment(userId: string, sessionId: string, data: any) {
  try {
    // Process comment with emotional analysis
    if (data.text) {
      const emotionalAnalysis = await grapseeAI.detectEmotionalState(
        data.facialData,
        data.voiceData
      );

      // Store comment with emotional analysis
      await prisma.liveShoppingInteraction.create({
        data: {
          sessionId,
          userId,
          type: 'comment',
          data: {
            ...data,
            emotionalAnalysis,
          },
          emotionalState: emotionalAnalysis,
          timestamp: new Date(),
        },
      });
    }

    console.log(`Comment processed for user ${userId} in session ${sessionId}`);
  } catch (error) {
    console.error('Error handling comment:', error);
  }
}

// GET /api/live-shopping/[sessionId]/interact - Get session interactions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const interactions = await prisma.liveShoppingInteraction.findMany({
      where: {
        sessionId: (await params).sessionId,
        ...(type && { type }),
      },
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
      take: limit,
      skip: offset,
    });

    return NextResponse.json({
      success: true,
      data: interactions,
      pagination: {
        limit,
        offset,
        hasMore: interactions.length === limit,
      },
    });
  } catch (error) {
    console.error('Error fetching interactions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch interactions' },
      { status: 500 }
    );
  }
}
