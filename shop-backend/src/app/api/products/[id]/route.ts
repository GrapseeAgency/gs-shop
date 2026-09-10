import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        seller: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Compute discount percentage
    const discountPercentage =
      product.comparePrice && product.comparePrice > product.price
        ? Math.round(
            ((product.comparePrice - product.price) / product.comparePrice) *
              100,
          )
        : 0;

    // Computed fields
    const isOnSale = discountPercentage > 0;
    const isFlashDeal = product.isFlashDeal;

    // Average rating from reviews
    const allReviews = await prisma.review.findMany({
      where: { productId: id },
      select: { rating: true },
    });
    const averageRating =
      allReviews.length > 0
        ? Math.round(
            (allReviews.reduce((sum, r) => sum + r.rating, 0) /
              allReviews.length) *
              10,
          ) / 10
        : product.rating;

    // Related products (same category, limit 4, exclude current)
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        isActive: true,
        id: { not: id },
      },
      take: 4,
      orderBy: { rating: "desc" },
      include: {
        category: true,
        seller: { select: { id: true, name: true, slug: true, icon: true } },
      },
    });

    // Auto-record today's price (fire-and-forget, non-blocking)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    prisma.priceHistory
      .findFirst({
        where: {
          productId: id,
          recordedAt: { gte: todayStart, lte: todayEnd },
        },
      })
      .then((existing) => {
        if (!existing) {
          return prisma.priceHistory.create({
            data: { productId: id, price: product.price },
          });
        } else if (existing.price !== product.price) {
          return prisma.priceHistory.update({
            where: { id: existing.id },
            data: { price: product.price },
          });
        }
      })
      .catch(() => {
        /* silent don't break the response */
      });

    // Real data from DB
    const [videoCountResult, questionsCountResult, priceHistory] =
      await Promise.all([
        prisma.productVideo.count({ where: { productId: id } }),
        prisma.productQuestion.count({ where: { productId: id } }),
        prisma.priceHistory.findMany({
          where: { productId: id },
          orderBy: { recordedAt: "asc" },
          select: { price: true, recordedAt: true },
        }),
      ]);

    return NextResponse.json({
      ...product,
      discountPercentage,
      isOnSale,
      isFlashDeal,
      averageRating,
      questionsCount: questionsCountResult,
      videoCount: videoCountResult,
      priceHistory,
      relatedProducts,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}

// PATCH /api/products/[id] Update product visibility (Phase VIII)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { isPubliclyVisible } = body;

    if (typeof isPubliclyVisible !== "boolean") {
      return NextResponse.json(
        { error: "isPubliclyVisible (boolean) is required" },
        { status: 400 },
      );
    }

    // Get product and verify buyer ownership
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, isSold: true, soldTo: true, name: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 },
      );
    }

    if (!product.isSold) {
      return NextResponse.json(
        { error: "Cannot modify visibility of unsold product" },
        { status: 400 },
      );
    }

    if (product.soldTo !== userId) {
      return NextResponse.json(
        { error: "Only the buyer can change product visibility" },
        { status: 403 },
      );
    }

    // Update visibility
    const updated = await prisma.product.update({
      where: { id },
      data: { isPubliclyVisible },
      select: {
        id: true,
        name: true,
        isSold: true,
        isPubliclyVisible: true,
        soldTo: true,
      },
    });

    return NextResponse.json({
      success: true,
      product: updated,
      message: isPubliclyVisible
        ? "Product is now visible on the public shop"
        : "Product has been hidden from the public shop",
    });
  } catch (error) {
    console.error("Error updating product visibility:", error);
    return NextResponse.json(
      { error: "Failed to update product visibility" },
      { status: 500 },
    );
  }
}
