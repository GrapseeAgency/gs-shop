import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/digital-twin - Get user's digital twin
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

    const digitalTwin = await prisma.digitalTwin.findUnique({
      where: { userId },
    });

    if (!digitalTwin) {
      return NextResponse.json({
        success: false,
        error: 'Digital twin not found',
        needsCreation: true,
      });
    }

    return NextResponse.json({
      success: true,
      data: digitalTwin,
    });
  } catch (error) {
    console.error('Error fetching digital twin:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch digital twin' },
      { status: 500 }
    );
  }
}

// POST /api/digital-twin - Create digital twin
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      photos,
      bodyMeasurements,
      stylePreferences,
      lifestyleData,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
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

    // Check if digital twin already exists
    const existingTwin = await prisma.digitalTwin.findUnique({
      where: { userId },
    });

    if (existingTwin) {
      return NextResponse.json({
        success: false,
        error: 'Digital twin already exists',
        data: existingTwin,
      });
    }

    // Create digital twin with provided data
    const digitalTwin = await prisma.digitalTwin.create({
      data: {
        userId,
        avatarUrl: photos?.[0] || null,
        bodyMeasurements: bodyMeasurements || null,
        styleProfile: stylePreferences || null,
        wardrobe: null,
        lifestyleData: lifestyleData || null,
        evolutionData: null,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: digitalTwin,
      message: 'Digital twin created successfully',
    });
  } catch (error) {
    console.error('Error creating digital twin:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create digital twin' },
      { status: 500 }
    );
  }
}

// PUT /api/digital-twin - Update digital twin
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      avatarUrl,
      bodyMeasurements,
      styleProfile,
      wardrobe,
      lifestyleData,
      evolutionData,
      isActive,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    const digitalTwin = await prisma.digitalTwin.update({
      where: { userId },
      data: {
        ...(avatarUrl && { avatarUrl }),
        ...(bodyMeasurements && { bodyMeasurements }),
        ...(styleProfile && { styleProfile }),
        ...(wardrobe && { wardrobe }),
        ...(lifestyleData && { lifestyleData }),
        ...(evolutionData && { evolutionData }),
        ...(isActive !== undefined && { isActive }),
        lastUpdated: new Date(),
      },
    });

    if (!digitalTwin) {
      return NextResponse.json(
        { success: false, error: 'Digital twin not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: digitalTwin,
    });
  } catch (error) {
    console.error('Error updating digital twin:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update digital twin' },
      { status: 500 }
    );
  }
}

// DELETE /api/digital-twin - Delete digital twin
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    const result = await prisma.digitalTwin.delete({
      where: { userId },
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Digital twin not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Digital twin deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting digital twin:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete digital twin' },
      { status: 500 }
    );
  }
}
