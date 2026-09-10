import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminApiKey } from '@/lib/admin-api-auth';

/**
 * PUT /api/admin/products/luxury
 * Mark/unmark product as luxury with optional expiry date
 */
export async function PUT(request: NextRequest) {
  const admin = await verifyAdminApiKey(request, 'write');
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { productId, isLuxury, luxuryExpiresAt } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Update luxury status
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        isLuxury: isLuxury ?? false,
        luxuryExpiresAt: luxuryExpiresAt ? new Date(luxuryExpiresAt) : null
      }
    });

    return NextResponse.json({
      success: true,
      product: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        isLuxury: updatedProduct.isLuxury,
        luxuryExpiresAt: updatedProduct.luxuryExpiresAt
      },
      message: isLuxury ? 'Product marked as luxury' : 'Product removed from luxury zone'
    });

  } catch (error) {
    console.error('Error updating luxury status:', error);
    return NextResponse.json({ error: 'Failed to update luxury status' }, { status: 500 });
  }
}

/**
 * GET /api/admin/products/luxury
 * Get all luxury products for admin
 */
export async function GET(request: NextRequest) {
  const admin = await verifyAdminApiKey(request, 'read');
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();

    const luxuryProducts = await prisma.product.findMany({
      where: {
        isLuxury: true
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        imageUrl: true,
        isLuxury: true,
        luxuryExpiresAt: true,
        isActive: true,
        createdAt: true,
        category: {
          select: { id: true, name: true }
        }
      }
    });

    // Add status info
    const formattedProducts = luxuryProducts.map(product => {
      const isExpired = product.luxuryExpiresAt && product.luxuryExpiresAt < now;
      return {
        ...product,
        status: isExpired ? 'expired' : 'active'
      };
    });

    return NextResponse.json({
      success: true,
      products: formattedProducts,
      meta: {
        total: formattedProducts.length,
        active: formattedProducts.filter(p => p.status === 'active').length,
        expired: formattedProducts.filter(p => p.status === 'expired').length
      }
    });

  } catch (error) {
    console.error('Error fetching luxury products:', error);
    return NextResponse.json({ error: 'Failed to fetch luxury products' }, { status: 500 });
  }
}
