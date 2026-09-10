import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/reviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const userId = searchParams.get('userId');

    const reviews = await prisma.review.findMany({
      where: {
        ...(productId && { productId }),
        ...(userId && { userId }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: reviews,
      });
  } catch (error) {
    console.error('Error fetching reviews 2.0:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST /api/reviews
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productId,
      userId,
      rating,
      author,
      comment,
    } = body;

    if (!productId || !userId || !rating || !comment) {
      return NextResponse.json(
        { success: false, error: 'Product ID, user ID, rating, and comment required' },
        { status: 400 }
      );
    }

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Validate product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        productId,
        userId,
      },
    });

    if (existingReview) {
      return NextResponse.json({
        success: false,
        error: 'User has already reviewed this product',
        data: existingReview,
      });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        productId,
        userId,
        rating,
        author: author || user.name || 'Anonymous',
        comment,
      },
    });

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Review created successfully',
    });
  } catch (error) {
    console.error('Error creating review 2.0:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create review 2.0' },
      { status: 500 }
    );
  }
}

// PUT /api/reviews
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, rating, comment } = body;

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: 'Review ID required' },
        { status: 400 }
      );
    }

    const existing = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    const data: any = {};
    if (rating !== undefined) data.rating = rating;
    if (comment !== undefined) data.comment = comment;

    const review = await prisma.review.update({
      where: { id: reviewId },
      data,
    });

    return NextResponse.json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error('Error updating review 2.0:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update review 2.0' },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: 'Review ID required' },
        { status: 400 }
      );
    }

    await prisma.review.delete({ where: { id: reviewId } });

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting review 2.0:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete review 2.0' },
      { status: 500 }
    );
  }
}
