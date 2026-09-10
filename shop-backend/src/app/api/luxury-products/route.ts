import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/luxury-products - Get luxury products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const rarity = searchParams.get('rarity');
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');
    const available = searchParams.get('available');
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'));

    // Build where clause
    const where: any = {
      isActive: true,
      isLuxury: true,
    };

    if (category) {
      where.category = { slug: category };
    }
    if (rarity) {
      where.rarity = rarity;
    }
    if (priceMin || priceMax) {
      where.price = {};
      if (priceMin) where.price.gte = parseFloat(priceMin);
      if (priceMax) where.price.lte = parseFloat(priceMax);
    }
    if (available !== undefined) {
      where.available = available === 'true';
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        seller: {
          select: { id: true, name: true, avatar: true, isVerified: true }
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { rating: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      skip: offset,
    });

    const total = await prisma.product.count({ where });

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching luxury products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch luxury products' },
      { status: 500 }
    );
  }
}

// POST /api/luxury-products - Create luxury product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sellerId,
      name,
      description,
      categoryId,
      price,
      rarity = 'premium',
      authenticity,
      blockchain,
      features,
      imageUrl,
      comparePrice,
    } = body;

    if (!sellerId || !name || !categoryId || !price) {
      return NextResponse.json(
        { success: false, error: 'Seller ID, name, category ID, and price required' },
        { status: 400 }
      );
    }

    // Verify seller exists and is authorized
    const seller = await prisma.user.findUnique({
      where: { id: sellerId },
      select: { id: true, name: true, role: true }
    });

    if (!seller || seller.role !== 'seller') {
      return NextResponse.json(
        { success: false, error: 'Invalid or unauthorized seller' },
        { status: 403 }
      );
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Create luxury product
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        imageUrl,
        category: { connect: { id: categoryId } },
        isLuxury: true,
        features: features ? JSON.stringify(features) : null,
        isActive: true,
        isFeatured: rarity === 'legendary' || rarity === 'rare'
      } as any
    });

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Luxury product created successfully',
    });
  } catch (error) {
    console.error('Error creating luxury product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create luxury product' },
      { status: 500 }
    );
  }
}

// PUT /api/luxury-products - Update luxury product
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productId,
      name,
      description,
      price,
      comparePrice,
      rarity,
      available,
      features,
      imageUrl,
    } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID required' },
        { status: 400 }
      );
    }

    // Verify product exists and belongs to seller
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, sellerId: true, isLuxury: true }
    });

    if (!existingProduct || !existingProduct.isLuxury) {
      return NextResponse.json(
        { success: false, error: 'Luxury product not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (comparePrice !== undefined) updateData.comparePrice = comparePrice ? parseFloat(comparePrice) : null;
    if (rarity !== undefined) updateData.rarity = rarity;
    if (available !== undefined) updateData.available = available;
    if (features !== undefined) updateData.features = features;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    updateData.updatedAt = new Date();

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        seller: {
          select: { id: true, name: true, avatar: true, isVerified: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating luxury product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update luxury product' },
      { status: 500 }
    );
  }
}

