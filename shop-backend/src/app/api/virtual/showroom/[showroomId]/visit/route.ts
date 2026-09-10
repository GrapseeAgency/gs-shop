import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/virtual/showroom/[showroomId]/visit - Record showroom visit
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ showroomId: string }> }
) {
  try {
    const { showroomId } = await params;
    
    // Increment visitor count
    const showroom = await prisma.virtualShowroom.update({
      where: { id: showroomId },
      data: {
        visitorCount: {
          increment: 1,
        },
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
      data: {
        visitorCount: showroom.visitorCount,
      },
    });
  } catch (error) {
    console.error('Error recording showroom visit:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record showroom visit' },
      { status: 500 }
    );
  }
}
