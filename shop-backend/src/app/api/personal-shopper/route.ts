import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/personal-shopper - Get user's personal shopper
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    const personalShopper = await prisma.personalShopper.findUnique({
      where: { userId },
    });

    if (!personalShopper) {
      return NextResponse.json(
        { success: false, error: 'Personal shopper not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: personalShopper,
    });
  } catch (error) {
    console.error('Error fetching personal shopper:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch personal shopper' },
      { status: 500 }
    );
  }
}

// POST /api/personal-shopper - Initialize personal shopper
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, aiPersonality, learningData, predictions, budgetOptimizer, styleEvolution, lifePlanning } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const existingShopper = await prisma.personalShopper.findUnique({
      where: { userId },
    });

    if (existingShopper) {
      return NextResponse.json({
        success: false,
        error: 'Personal shopper already exists',
        data: existingShopper,
      });
    }

    const personalShopper = await prisma.personalShopper.create({
      data: {
        userId,
        aiPersonality: aiPersonality || null,
        learningData: learningData || null,
        predictions: predictions || null,
        budgetOptimizer: budgetOptimizer || null,
        styleEvolution: styleEvolution || null,
        lifePlanning: lifePlanning || null,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: personalShopper,
      message: 'Personal shopper initialized successfully',
    });
  } catch (error) {
    console.error('Error creating personal shopper:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create personal shopper' },
      { status: 500 }
    );
  }
}

// PUT /api/personal-shopper - Update personal shopper
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      aiPersonality,
      learningData,
      predictions,
      budgetOptimizer,
      styleEvolution,
      lifePlanning,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    const personalShopper = await prisma.personalShopper.update({
      where: { userId },
      data: {
        ...(aiPersonality && { aiPersonality }),
        ...(learningData && { learningData }),
        ...(predictions && { predictions }),
        ...(budgetOptimizer && { budgetOptimizer }),
        ...(styleEvolution && { styleEvolution }),
        ...(lifePlanning && { lifePlanning }),
        lastInteraction: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: personalShopper,
    });
  } catch (error) {
    console.error('Error updating personal shopper:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update personal shopper' },
      { status: 500 }
    );
  }
}
