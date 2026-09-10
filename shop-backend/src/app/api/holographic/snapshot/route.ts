import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { holographicSystem } from '@/lib/holographic-system';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, settings } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Check if holographic product exists
    const holographicProduct = await prisma.holographicProduct.findFirst({
      where: { productId }
    });

    if (!holographicProduct) {
      return NextResponse.json(
        { success: false, error: 'Holographic product not found' },
        { status: 404 }
      );
    }

    // Capture snapshot using holographic system
    const snapshotUrl = await holographicSystem.captureSnapshot(productId, settings || {});

    if (!snapshotUrl) {
      return NextResponse.json(
        { success: false, error: 'Failed to capture snapshot' },
        { status: 500 }
      );
    }

    // Generate snapshot metadata
    const snapshotMetadata = {
      productId,
      snapshotUrl,
      settings: settings || {
        resolution: '1920x1080',
        format: 'png',
        quality: 'high',
        angle: 'default',
        lighting: 'studio'
      },
      capturedAt: new Date(),
      dimensions: {
        width: 1920,
        height: 1080
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        ...snapshotMetadata,
        message: 'Holographic snapshot captured successfully'
      }
    });

  } catch (error) {
    console.error('Error capturing holographic snapshot:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const holographicProduct = await prisma.holographicProduct.findFirst({
      where: { productId }
    });

    if (!holographicProduct) {
      return NextResponse.json(
        { success: false, error: 'Holographic product not found' },
        { status: 404 }
      );
    }

    // Return available snapshot settings and recent snapshots
    return NextResponse.json({
      success: true,
      data: {
        productId,
        availableSettings: {
          resolutions: ['1280x720', '1920x1080', '2560x1440', '3840x2160'],
          formats: ['png', 'jpg', 'webp'],
          qualities: ['low', 'medium', 'high', 'ultra'],
          angles: ['default', 'front', 'side', 'top', 'bottom', 'isometric'],
          lighting: ['studio', 'outdoor', 'dramatic', 'soft', 'neon']
        },
        recentSnapshots: [], // In a real implementation, this would fetch from database
        productInfo: {
          modelUrl: holographicProduct.modelUrl,
          scale: holographicProduct.scale,
          position: holographicProduct.position,
          rotation: holographicProduct.rotation
        }
      }
    });

  } catch (error) {
    console.error('Error fetching holographic snapshot info:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
