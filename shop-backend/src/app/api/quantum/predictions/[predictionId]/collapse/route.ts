import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { quantumComputing } from '@/lib/quantum-computing';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ predictionId: string }> }
) {
  try {
    const { predictionId } = await params;
    const body = await request.json();
    const { desiredOutcome, manipulationStrength } = body;

    // Check if prediction exists
    const prediction = await prisma.quantumPrediction.findUnique({
      where: { id: predictionId }
    });

    if (!prediction) {
      return NextResponse.json(
        { success: false, error: 'Quantum prediction not found' },
        { status: 404 }
      );
    }

    if (prediction.isCollapsed) {
      return NextResponse.json(
        { success: false, error: 'Prediction already collapsed' },
        { status: 400 }
      );
    }

    // Perform quantum collapse
    const collapseResult = await quantumComputing.collapseSuperposition(predictionId);

    // Update prediction status
    await prisma.quantumPrediction.update({
      where: { id: predictionId },
      data: {
        isCollapsed: true,
        collapsedAt: new Date(),
        outcomes: JSON.stringify({
          collapsed: collapseResult,
          collapsedAt: new Date().toISOString()
        })
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: predictionId,
        collapsed: true,
        result: collapseResult,
        collapsedAt: new Date(),
        message: 'Quantum superposition collapsed successfully'
      }
    });

  } catch (error) {
    console.error('Error collapsing quantum prediction:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ predictionId: string }> }
) {
  try {
    const { predictionId } = await params;

    const prediction = await prisma.quantumPrediction.findUnique({
      where: { id: predictionId }
    });

    if (!prediction) {
      return NextResponse.json(
        { success: false, error: 'Quantum prediction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: prediction.id,
        type: prediction.type,
        confidence: prediction.confidence,
        timeline: prediction.timeline,
        outcomes: prediction.outcomes,
        isCollapsed: prediction.isCollapsed,
        collapsedAt: prediction.collapsedAt,
        createdAt: prediction.createdAt
      }
    });

  } catch (error) {
    console.error('Error fetching quantum prediction:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
