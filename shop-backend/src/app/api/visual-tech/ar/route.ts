import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth-options";

// GET /api/visual-tech/ar - Get visual tech AR
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || session?.user?.id;
    const arType = searchParams.get('arType');
    const status = searchParams.get('status');
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'));

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User authentication required' },
        { status: 401 }
      );
    }

    // Build where clause
    const whereClause: any = { userId };
    if (arType) whereClause.arType = arType;
    if (status) whereClause.status = status;

    // Get AR experiences from database
    const arExperiences = await prisma.aRExperience.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    const total = await prisma.aRExperience.count({
      where: whereClause
    });

    return NextResponse.json({
      success: true,
      data: arExperiences,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching visual tech AR:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch AR experiences' },
      { status: 500 }
    );
  }
}

// POST /api/visual-tech/ar - Create visual tech AR
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const {
      userId,
      arType,
      content,
      productId,
      priority = 'medium',
      metadata
    } = body;

    const targetUserId = userId || session?.user?.id;

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: 'User authentication required' },
        { status: 401 }
      );
    }

    if (!arType || !content) {
      return NextResponse.json(
        { success: false, error: 'AR type and content are required' },
        { status: 400 }
      );
    }

    // Validate AR type
    const validArTypes = ['product_preview', 'virtual_try_on', 'room_placement', 'interactive_demo'];
    if (!validArTypes.includes(arType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid AR type' },
        { status: 400 }
      );
    }

    // Validate product if provided
    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId, isActive: true }
      });
      
      if (!product) {
        return NextResponse.json(
          { success: false, error: 'Product not found or inactive' },
          { status: 404 }
        );
      }
    }

    // Create AR experience
    const arExperience = await prisma.aRExperience.create({
      data: {
        userId: targetUserId,
        productId: productId || ''
      }
    });

    return NextResponse.json({
      success: true,
      data: arExperience,
      message: 'AR experience created successfully',
    });
  } catch (error) {
    console.error('Error creating visual tech AR:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create AR experience' },
      { status: 500 }
    );
  }
}
