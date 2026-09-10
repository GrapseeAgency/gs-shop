import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { holographicSystem } from '@/lib/holographic-system';
import { grapseeAI } from '@/lib/grapsee-ai';

// GET /api/holographic/products - Get holographic products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const quality = searchParams.get('quality') || 'high';

    if (productId) {
      // Get specific holographic product
      const holographicProduct = await prisma.holographicProduct.findFirst({
        where: {
          productId,
          isActive: true,
        },
      });

      if (!holographicProduct) {
        return NextResponse.json({
          success: false,
          error: 'Holographic product not found',
        });
      }

      return NextResponse.json({
        success: true,
        data: holographicProduct,
      });
    } else {
      // Get all holographic products
      const holographicProducts = await prisma.holographicProduct.findMany({
        where: {
          isActive: true,
          ...(quality && { renderQuality: quality }),
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return NextResponse.json({
        success: true,
        data: holographicProducts,
      });
    }
  } catch (error) {
    console.error('Error fetching holographic products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch holographic products' },
      { status: 500 }
    );
  }
}

// POST /api/holographic/products - Generate holographic product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productId,
      customizations,
      quality = 'high',
      scale = 1.0,
      position = [0, 0, 0],
      rotation = [0, 0, 0],
    } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID required' },
        { status: 400 }
      );
    }

    // Check if holographic product already exists
    const existingProduct = await prisma.holographicProduct.findFirst({
      where: { productId },
    });

    if (existingProduct) {
      return NextResponse.json({
        success: false,
        error: 'Holographic product already exists',
        data: existingProduct,
      });
    }

    // Generate holographic model using the holographic system
    const holographicModel = await holographicSystem.generateHolographicModel(
      productId,
      customizations
    );

    // Store in database
    const holographicProduct = await prisma.holographicProduct.create({
      data: {
        productId,
        modelUrl: holographicModel.modelUrl,
        scale: scale || holographicModel.scale || 1,
        position: JSON.stringify(position || [0, 0, 0]),
        rotation: JSON.stringify(rotation || [0, 0, 0]),
        animations: holographicModel.animations ? JSON.stringify(holographicModel.animations) : null,
        materials: holographicModel.materials ? JSON.stringify(holographicModel.materials) : null,
        interactiveZones: holographicModel.interactiveZones ? JSON.stringify(holographicModel.interactiveZones) : null,
        renderQuality: quality || 'high'
      },
    });

    return NextResponse.json({
      success: true,
      data: holographicProduct,
      message: 'Holographic product generated successfully',
    });
  } catch (error) {
    console.error('Error generating holographic product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate holographic product' },
      { status: 500 }
    );
  }
}

// PUT /api/holographic/products - Update holographic product
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productId,
      scale,
      position,
      rotation,
      animations,
      materials,
      interactiveZones,
      renderQuality,
      isActive,
    } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID required' },
        { status: 400 }
      );
    }

    const holographicProduct = await prisma.holographicProduct.updateMany({
      where: { productId },
      data: {
        ...(scale !== undefined && { scale }),
        ...(position && { position }),
        ...(rotation && { rotation }),
        ...(animations && { animations }),
        ...(materials && { materials }),
        ...(interactiveZones && { interactiveZones }),
        ...(renderQuality && { renderQuality }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date(),
      },
    });

    if (holographicProduct.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Holographic product not found' },
        { status: 404 }
      );
    }

    // Get updated product
    const updatedProduct = await prisma.holographicProduct.findFirst({
      where: { productId },
    });

    return NextResponse.json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating holographic product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update holographic product' },
      { status: 500 }
    );
  }
}

// DELETE /api/holographic/products - Delete holographic product
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID required' },
        { status: 400 }
      );
    }

    const result = await prisma.holographicProduct.deleteMany({
      where: { productId },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Holographic product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Holographic product deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting holographic product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete holographic product' },
      { status: 500 }
    );
  }
}
