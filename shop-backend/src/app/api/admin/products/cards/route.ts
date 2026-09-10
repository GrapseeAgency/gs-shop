import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminApiKey } from '@/lib/admin-api-auth';

// GET - List products in card format (optimized for card display)
export async function GET(request: NextRequest) {
  const admin = await verifyAdminApiKey(request, 'read');
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const isActive = searchParams.get('isActive');
    const badge = searchParams.get('badge');
    const productType = searchParams.get('productType');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24'); // More items for card view

    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (isActive !== null) where.isActive = isActive === 'true';
    if (badge) where.badge = badge;
    if (productType) where.productType = productType;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { shortDescription: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          shortDescription: true,
          price: true,
          comparePrice: true,
          discount: true,
          // Thumbnail options
          imageUrl: true,
          svgUrl: true,
          lottieUrl: true,
          thumbnailType: true,
          videoThumbnail: true,
          // Badges & display
          badge: true,
          badgeColor: true,
          isNew: true,
          isFeatured: true,
          isTrending: true,
          isFlashDeal: true,
          isActive: true,
          rating: true,
          reviewCount: true,
          // Animation support
          svgAnimation: true,
          illustrationCode: true,
          illustrationType: true,
          // Product info
          productType: true,
          inventory: true,
          categoryId: true,
          sellerId: true,
          createdAt: true,
          // Category relation
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              icon: true,
            },
          },
          // Seller relation
          seller: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          // For preview
          previewUrl: true,
        },
        orderBy: [
          { isFeatured: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Transform for card display
    const cardProducts = products.map(product => ({
      ...product,
      // Determine the best thumbnail to use
      thumbnail: product.thumbnailType === 'svg' && product.svgUrl 
        ? product.svgUrl 
        : product.thumbnailType === 'animation' && product.lottieUrl
        ? product.lottieUrl
        : product.thumbnailType === 'video' && product.videoThumbnail
        ? product.videoThumbnail
        : product.imageUrl,
      // Animation data if available
      animationData: product.svgAnimation || product.illustrationCode || null,
      animationType: product.illustrationType || (product.lottieUrl ? 'lottie' : null),
      // Price display
      displayPrice: product.discount > 0 
        ? (product.price * (1 - product.discount / 100)).toFixed(2)
        : product.price.toFixed(2),
      savings: product.discount > 0 && product.comparePrice
        ? (product.comparePrice - product.price * (1 - product.discount / 100)).toFixed(2)
        : null,
    }));

    return NextResponse.json({
      success: true,
      products: cardProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching card products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
