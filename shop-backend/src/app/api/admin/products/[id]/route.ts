import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminApiKey } from "@/lib/admin-api-auth";

// GET - Single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdminApiKey(request, "read");
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        seller: { select: { id: true, name: true, email: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

// PUT - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdminApiKey(request, "write");
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const currentProduct = await prisma.product.findUnique({
      where: { id },
      select: { price: true },
    });

    if (!currentProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const data: any = {};
    const fields = [
      "name", "slug", "description", "shortDescription", "price", "comparePrice",
      "categoryId", "imageUrl", "images", "features", "techStack", "deliveryTime",
      "isFeatured", "isActive", "isNew", "isTrending", "isFlashDeal", "discount",
      "inventory", "rating", "tags", "sellerId", "svgUrl", "svgAnimation", "lottieUrl",
      "illustrationCode", "illustrationType", "thumbnailType", "previewUrl",
      "videoThumbnail", "badge", "badgeColor", "metaTitle", "metaDescription",
      "keywords", "altText", "productType", "sku", "barcode", "taxClass", "taxRate",
      "shippingClass", "downloadUrl", "downloadLimit", "fileSize", "fileFormat",
      "subscriptionPeriod", "subscriptionPrice", "trialDays", "galleryType",
      "galleryColumns", "relatedProducts", "crossSells", "upsells", "architectureStyle",
      "folderStructure", "showOneOfAKind", "isUnique",
    ];

    fields.forEach((field) => {
      if (body[field] !== undefined) data[field] = body[field];
    });

    // Record price history if price changed
    if (body.price !== undefined && body.price !== currentProduct.price) {
      await prisma.priceHistory.create({
        data: {
          productId: id,
          price: currentProduct.price,
          recordedAt: new Date(),
        },
      });
    }

    const product = await prisma.product.update({
      where: { id },
      data,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        seller: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, message: "Product updated", product });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// DELETE - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdminApiKey(request, "write");
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
