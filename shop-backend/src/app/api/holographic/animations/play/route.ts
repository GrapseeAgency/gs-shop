import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { holographicSystem } from '@/lib/holographic-system';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, animation, settings } = body;

    if (!productId || !animation) {
      return NextResponse.json(
        { success: false, error: 'Product ID and animation name are required' },
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

    // Play animation using holographic system
    const animationResult = await holographicSystem.playAnimation(productId, animation);

    if (!animationResult) {
      return NextResponse.json(
        { success: false, error: 'Failed to play animation' },
        { status: 500 }
      );
    }

    // Update product with animation data
    const updatedAnimations = Array.isArray(holographicProduct.animations) 
      ? [...holographicProduct.animations, { name: animation, playedAt: new Date(), settings }]
      : [{ name: animation, playedAt: new Date(), settings }];

    await prisma.holographicProduct.update({
      where: { id: holographicProduct.id },
      data: {
        animations: updatedAnimations
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        productId,
        animation,
        playing: true,
        settings: settings || {},
        playedAt: new Date(),
        message: 'Animation started successfully'
      }
    });

  } catch (error) {
    console.error('Error playing holographic animation:', error);
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

    return NextResponse.json({
      success: true,
      data: {
        productId,
        animations: holographicProduct.animations || [],
        availableAnimations: [
          'rotate', 'pulse', 'bounce', 'fade', 'slide', 'zoom', 
          'morph', 'explode', 'implode', 'wave', 'spiral', 'orbit'
        ]
      }
    });

  } catch (error) {
    console.error('Error fetching holographic animations:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
