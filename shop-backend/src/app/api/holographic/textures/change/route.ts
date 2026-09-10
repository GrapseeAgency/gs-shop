import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { holographicSystem } from '@/lib/holographic-system';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, texture, materialProperties } = body;

    if (!productId || !texture) {
      return NextResponse.json(
        { success: false, error: 'Product ID and texture name are required' },
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

    // Change texture using holographic system
    const textureResult = await holographicSystem.changeTexture(productId, texture);

    if (!textureResult) {
      return NextResponse.json(
        { success: false, error: 'Failed to change texture' },
        { status: 500 }
      );
    }

    // Update product with new texture and material properties
    const existingMaterials = holographicProduct.materials ? JSON.parse(holographicProduct.materials as string) : {}
    const updatedMaterials = {
      ...existingMaterials,
      currentTexture: texture,
      materialProperties: materialProperties || {
        roughness: 0.5,
        metalness: 0.1,
        opacity: 1.0,
        emissive: 0.0,
        normalScale: 1.0
      },
      changedAt: new Date()
    };

    await prisma.holographicProduct.update({
      where: { id: holographicProduct.id },
      data: {
        materials: updatedMaterials
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        productId,
        texture,
        materials: updatedMaterials,
        changed: true,
        message: 'Texture changed successfully'
      }
    });

  } catch (error) {
    console.error('Error changing holographic texture:', error);
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
        currentTexture: (holographicProduct.materials ? JSON.parse(holographicProduct.materials as string).currentTexture : null) || 'default',
        materials: holographicProduct.materials || '{}',
        availableTextures: [
          'default', 'metallic', 'glass', 'wood', 'fabric', 'plastic',
          'carbon_fiber', 'marble', 'granite', 'leather', 'rubber',
          'ceramic', 'concrete', 'ice', 'lava', 'holographic'
        ]
      }
    });

  } catch (error) {
    console.error('Error fetching holographic textures:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
