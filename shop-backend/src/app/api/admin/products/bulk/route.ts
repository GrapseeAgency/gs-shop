import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminApiKey } from '@/lib/admin-api-auth';

// POST - Bulk operations on products
export async function POST(request: NextRequest) {
  const admin = await verifyAdminApiKey(request, 'write');
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { operation, productIds, data } = body;

    if (!operation || !productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: 'Operation and productIds array required' }, { status: 400 });
    }

    let result: any;

    switch (operation) {
      case 'activate':
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { isActive: true },
        });
        break;

      case 'deactivate':
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { isActive: false },
        });
        break;

      case 'feature':
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { isFeatured: true },
        });
        break;

      case 'unfeature':
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { isFeatured: false },
        });
        break;

      case 'setBadge':
        if (!data?.badge) {
          return NextResponse.json({ error: 'Badge data required' }, { status: 400 });
        }
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { 
            badge: data.badge,
            badgeColor: data.badgeColor || null,
          },
        });
        break;

      case 'removeBadge':
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { badge: null, badgeColor: null },
        });
        break;

      case 'setCategory':
        if (!data?.categoryId) {
          return NextResponse.json({ error: 'categoryId required' }, { status: 400 });
        }
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { categoryId: data.categoryId },
        });
        break;

      case 'applyDiscount':
        if (data?.discount === undefined) {
          return NextResponse.json({ error: 'discount value required' }, { status: 400 });
        }
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { discount: Number(data.discount) },
        });
        break;

      case 'removeDiscount':
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { discount: 0 },
        });
        break;

      case 'setThumbnailType':
        if (!data?.thumbnailType) {
          return NextResponse.json({ error: 'thumbnailType required' }, { status: 400 });
        }
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { thumbnailType: data.thumbnailType },
        });
        break;

      case 'delete':
        result = await prisma.product.deleteMany({
          where: { id: { in: productIds } },
        });
        break;

      default:
        return NextResponse.json({ error: 'Unknown operation' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Bulk ${operation} completed`,
      affectedCount: result.count,
      operation,
    });
  } catch (error) {
    console.error('Bulk operation error:', error);
    return NextResponse.json({ error: 'Bulk operation failed' }, { status: 500 });
  }
}

// GET - Get bulk operation templates
export async function GET(request: NextRequest) {
  const admin = await verifyAdminApiKey(request, 'read');
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const operations = [
    { id: 'activate', name: 'Activate', description: 'Make products visible', icon: 'Eye' },
    { id: 'deactivate', name: 'Deactivate', description: 'Hide products', icon: 'EyeOff' },
    { id: 'feature', name: 'Feature', description: 'Add to featured section', icon: 'Star' },
    { id: 'unfeature', name: 'Unfeature', description: 'Remove from featured', icon: 'StarOff' },
    { id: 'setBadge', name: 'Set Badge', description: 'Add badge to products', icon: 'Tag', requiresData: true },
    { id: 'removeBadge', name: 'Remove Badge', description: 'Remove badges', icon: 'TagOff' },
    { id: 'setCategory', name: 'Change Category', description: 'Move to different category', icon: 'Folder', requiresData: true },
    { id: 'applyDiscount', name: 'Apply Discount', description: 'Set discount percentage', icon: 'Percent', requiresData: true },
    { id: 'removeDiscount', name: 'Remove Discount', description: 'Remove all discounts', icon: 'PercentOff' },
    { id: 'setThumbnailType', name: 'Set Thumbnail Type', description: 'Change thumbnail display', icon: 'Image', requiresData: true },
    { id: 'delete', name: 'Delete', description: 'Permanently delete products', icon: 'Trash', isDangerous: true },
  ];

  return NextResponse.json({
    success: true,
    operations,
  });
}
