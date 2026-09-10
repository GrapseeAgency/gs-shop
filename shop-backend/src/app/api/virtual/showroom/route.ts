import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { holographicSystem } from '@/lib/holographic-system';
import { grapseeAI } from '@/lib/grapsee-ai';

// GET /api/virtual/showroom - Get virtual showrooms
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');
    const environment = searchParams.get('environment');
    const isActive = searchParams.get('isActive');

    const showrooms = await prisma.virtualShowroom.findMany({
      where: {
        ...(brandId && { brandId }),
        ...(environment && { environment }),
        ...(isActive !== undefined && { isActive: isActive === 'true' }),
      },
      orderBy: {
        visitorCount: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: showrooms,
    });
  } catch (error) {
    console.error('Error fetching virtual showrooms:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch virtual showrooms' },
      { status: 500 }
    );
  }
}

// POST /api/virtual/showroom - Create virtual showroom
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      brandId,
      name,
      environment = 'luxury',
      lighting,
      camera,
      products,
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Showroom name required' },
        { status: 400 }
      );
    }

    // Create showroom using holographic system
    const showroomId = `showroom-${Date.now()}`;
    const holographicShowroom = await holographicSystem.createShowroom(showroomId, {
      name,
      environment,
      lighting,
      camera,
      products,
    });

    // Store in database
    const showroom = await prisma.virtualShowroom.create({
      data: {
        id: showroomId,
        brandId,
        name,
        environment,
        lighting: lighting || holographicShowroom.lighting,
        camera: camera || holographicShowroom.camera,
        products: products || [],
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: showroom,
      message: 'Virtual showroom created successfully',
    });
  } catch (error) {
    console.error('Error creating virtual showroom:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create virtual showroom' },
      { status: 500 }
    );
  }
}

// PUT /api/virtual/showroom - Update virtual showroom
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      showroomId,
      name,
      environment,
      lighting,
      camera,
      products,
      isActive,
    } = body;

    if (!showroomId) {
      return NextResponse.json(
        { success: false, error: 'Showroom ID required' },
        { status: 400 }
      );
    }

    const showroom = await prisma.virtualShowroom.update({
      where: { id: showroomId },
      data: {
        ...(name && { name }),
        ...(environment && { environment }),
        ...(lighting && { lighting }),
        ...(camera && { camera }),
        ...(products && { products }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date(),
      },
    });

    if (!showroom) {
      return NextResponse.json(
        { success: false, error: 'Virtual showroom not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: showroom,
    });
  } catch (error) {
    console.error('Error updating virtual showroom:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update virtual showroom' },
      { status: 500 }
    );
  }
}

// DELETE /api/virtual/showroom - Delete virtual showroom
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const showroomId = searchParams.get('showroomId');

    if (!showroomId) {
      return NextResponse.json(
        { success: false, error: 'Showroom ID required' },
        { status: 400 }
      );
    }

    const result = await prisma.virtualShowroom.delete({
      where: { id: showroomId },
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Virtual showroom not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Virtual showroom deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting virtual showroom:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete virtual showroom' },
      { status: 500 }
    );
  }
}
