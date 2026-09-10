import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/neural/profile - Get user's neural profile
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

    const profile = await prisma.neuralProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Neural profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching neural profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch neural profile' },
      { status: 500 }
    );
  }
}

// POST /api/neural/profile - Create or update neural profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      baselinePatterns,
      intentRecognition,
      emotionalSignatures,
      biometricBaseline,
      calibrationData,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    const existing = await prisma.neuralProfile.findUnique({
      where: { userId }
    });

    const data: any = {
      baselinePatterns: baselinePatterns || undefined,
      intentRecognition: intentRecognition || undefined,
      emotionalSignatures: emotionalSignatures || undefined,
      biometricBaseline: biometricBaseline || undefined,
      calibrationData: calibrationData || undefined,
      isActive: true,
      lastCalibration: new Date(),
    };

    const profile = existing
      ? await prisma.neuralProfile.update({ where: { userId }, data })
      : await prisma.neuralProfile.create({ data: { userId, ...data } });

    return NextResponse.json({
      success: true,
      data: profile,
      message: existing ? 'Neural profile updated' : 'Neural profile created successfully',
    });
  } catch (error) {
    console.error('Error creating neural profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create neural profile' },
      { status: 500 }
    );
  }
}

// PUT /api/neural/profile - Update neural profile settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      baselinePatterns,
      intentRecognition,
      emotionalSignatures,
      biometricBaseline,
      calibrationData,
      isActive,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    const existing = await prisma.neuralProfile.findUnique({ where: { userId } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Neural profile not found' },
        { status: 404 }
      );
    }

    const data: any = {};
    if (baselinePatterns !== undefined) data.baselinePatterns = baselinePatterns;
    if (intentRecognition !== undefined) data.intentRecognition = intentRecognition;
    if (emotionalSignatures !== undefined) data.emotionalSignatures = emotionalSignatures;
    if (biometricBaseline !== undefined) data.biometricBaseline = biometricBaseline;
    if (calibrationData !== undefined) data.calibrationData = calibrationData;
    if (isActive !== undefined) data.isActive = isActive;

    const profile = await prisma.neuralProfile.update({
      where: { userId },
      data,
    });

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Error updating neural profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update neural profile' },
      { status: 500 }
    );
  }
}

// DELETE /api/neural/profile - Deactivate neural profile
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

    const existing = await prisma.neuralProfile.findUnique({ where: { userId } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Neural profile not found' },
        { status: 404 }
      );
    }

    const profile = await prisma.neuralProfile.update({
      where: { userId },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      data: profile,
      message: 'Neural profile deactivated successfully',
    });
  } catch (error) {
    console.error('Error deactivating neural profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to deactivate neural profile' },
      { status: 500 }
    );
  }
}
