import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminApiKey } from "@/lib/admin-api-auth";

// GET - List all products
export async function GET(request: NextRequest) {
  const admin = await verifyAdminApiKey(request, "read");
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const isActive = searchParams.get("isActive");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (isActive !== null) where.isActive = isActive === "true";
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          seller: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  const admin = await verifyAdminApiKey(request, "write");
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      name,
      slug,
      description,
      shortDescription,
      price,
      comparePrice,
      categoryId,
      imageUrl,
      images,
      features,
      techStack,
      deliveryTime,
      isFeatured,
      isActive,
      isNew,
      isTrending,
      isFlashDeal,
      discount,
      inventory,
      rating,
      tags,
      sellerId,
      // SVG & Animation
      svgUrl,
      svgAnimation,
      lottieUrl,
      illustrationCode,
      illustrationType,
      thumbnailType,
      previewUrl,
      videoThumbnail,
      // Display
      badge,
      badgeColor,
      // SEO
      metaTitle,
      metaDescription,
      keywords,
      altText,
      // Classification
      productType,
      sku,
      barcode,
      // Tax & Shipping
      taxClass,
      taxRate,
      shippingClass,
      // Digital
      downloadUrl,
      downloadLimit,
      fileSize,
      fileFormat,
      // Subscription
      subscriptionPeriod,
      subscriptionPrice,
      trialDays,
      // Gallery
      galleryType,
      galleryColumns,
      // Relations
      relatedProducts,
      crossSells,
      upsells,
      // Phase I: Architecture & One-of-a-kind
      architectureStyle,
      folderStructure,
      showOneOfAKind,
      isUnique,
    } = body;

    if (!name || !description || price === undefined || !categoryId) {
      return NextResponse.json(
        { error: "Name, description, price, and categoryId are required" },
        { status: 400 },
      );
    }

    // Generate a base slug and ensure uniqueness by appending a timestamp suffix if needed
    let baseSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    let finalSlug = baseSlug;
    const existing = await prisma.product.findUnique({
      where: { slug: baseSlug },
    });
    if (existing) {
      finalSlug = `${baseSlug}-${Date.now()}`;
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug: finalSlug,
        description,
        shortDescription: shortDescription || null,
        price: Number(price),
        comparePrice: comparePrice ? Number(comparePrice) : null,
        categoryId,
        imageUrl: imageUrl || "",
        images: images || "[]",
        features: features || "[]",
        techStack: techStack || "[]",
        deliveryTime: deliveryTime || "14 days",
        isFeatured: isFeatured || false,
        isActive: isActive !== undefined ? isActive : true,
        isNew: isNew !== undefined ? isNew : true,
        isTrending: isTrending || false,
        isFlashDeal: isFlashDeal || false,
        discount: discount || 0,
        inventory: inventory !== undefined ? Number(inventory) : 1,
        rating: rating || 0,
        tags: tags || "[]",
        sellerId: sellerId || null,
        // SVG & Animation
        svgUrl: svgUrl || null,
        svgAnimation: svgAnimation || null,
        lottieUrl: lottieUrl || null,
        illustrationCode: illustrationCode || null,
        illustrationType: illustrationType || null,
        thumbnailType: thumbnailType || "image",
        previewUrl: previewUrl || null,
        videoThumbnail: videoThumbnail || null,
        // Display
        badge: badge || null,
        badgeColor: badgeColor || null,
        // SEO
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        keywords: keywords || null,
        altText: altText || null,
        // Classification
        productType: productType || "physical",
        sku: sku || null,
        barcode: barcode || null,
        // Tax & Shipping
        taxClass: taxClass || null,
        taxRate: taxRate ? Number(taxRate) : null,
        shippingClass: shippingClass || null,
        // Digital
        downloadUrl: downloadUrl || null,
        downloadLimit: downloadLimit ? Number(downloadLimit) : null,
        fileSize: fileSize || null,
        fileFormat: fileFormat || null,
        // Subscription
        subscriptionPeriod: subscriptionPeriod || null,
        subscriptionPrice: subscriptionPrice ? Number(subscriptionPrice) : null,
        trialDays: trialDays ? Number(trialDays) : null,
        // Gallery
        galleryType: galleryType || "grid",
        galleryColumns: galleryColumns ? Number(galleryColumns) : 3,
        // Relations
        relatedProducts: relatedProducts || null,
        crossSells: crossSells || null,
        upsells: upsells || null,
        // Phase I: Architecture & One-of-a-kind
        architectureStyle: architectureStyle || null,
        folderStructure: folderStructure || null,
        showOneOfAKind: showOneOfAKind !== undefined ? showOneOfAKind : true,
        isUnique: isUnique !== undefined ? isUnique : true,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        seller: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}

// PUT - Update product
export async function PUT(request: NextRequest) {
  const admin = await verifyAdminApiKey(request, "write");
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    // Get current product to check if price is changing
    const currentProduct = await prisma.product.findUnique({
      where: { id },
      select: { price: true },
    });

    if (!currentProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const data: any = {};
    if (updateData.name !== undefined) data.name = updateData.name;
    if (updateData.slug !== undefined) data.slug = updateData.slug;
    if (updateData.description !== undefined)
      data.description = updateData.description;
    if (updateData.shortDescription !== undefined)
      data.shortDescription = updateData.shortDescription;
    if (updateData.price !== undefined) data.price = Number(updateData.price);
    if (updateData.comparePrice !== undefined)
      data.comparePrice = updateData.comparePrice
        ? Number(updateData.comparePrice)
        : null;
    if (updateData.categoryId !== undefined)
      data.categoryId = updateData.categoryId;
    if (updateData.imageUrl !== undefined) data.imageUrl = updateData.imageUrl;
    if (updateData.images !== undefined) data.images = updateData.images;
    if (updateData.features !== undefined) data.features = updateData.features;
    if (updateData.techStack !== undefined)
      data.techStack = updateData.techStack;
    if (updateData.deliveryTime !== undefined)
      data.deliveryTime = updateData.deliveryTime;
    if (updateData.isFeatured !== undefined)
      data.isFeatured = updateData.isFeatured;
    if (updateData.isActive !== undefined) data.isActive = updateData.isActive;
    if (updateData.isNew !== undefined) data.isNew = updateData.isNew;
    if (updateData.isTrending !== undefined)
      data.isTrending = updateData.isTrending;
    if (updateData.isFlashDeal !== undefined)
      data.isFlashDeal = updateData.isFlashDeal;
    if (updateData.discount !== undefined)
      data.discount = Number(updateData.discount);
    if (updateData.inventory !== undefined)
      data.inventory = Number(updateData.inventory);
    if (updateData.rating !== undefined)
      data.rating = Number(updateData.rating);
    if (updateData.tags !== undefined) data.tags = updateData.tags;
    if (updateData.sellerId !== undefined) data.sellerId = updateData.sellerId;
    // SVG & Animation
    if (updateData.svgUrl !== undefined) data.svgUrl = updateData.svgUrl;
    if (updateData.svgAnimation !== undefined)
      data.svgAnimation = updateData.svgAnimation;
    if (updateData.lottieUrl !== undefined)
      data.lottieUrl = updateData.lottieUrl;
    if (updateData.illustrationCode !== undefined)
      data.illustrationCode = updateData.illustrationCode;
    if (updateData.illustrationType !== undefined)
      data.illustrationType = updateData.illustrationType;
    if (updateData.thumbnailType !== undefined)
      data.thumbnailType = updateData.thumbnailType;
    if (updateData.previewUrl !== undefined)
      data.previewUrl = updateData.previewUrl;
    if (updateData.videoThumbnail !== undefined)
      data.videoThumbnail = updateData.videoThumbnail;
    // Display
    if (updateData.badge !== undefined) data.badge = updateData.badge;
    if (updateData.badgeColor !== undefined)
      data.badgeColor = updateData.badgeColor;
    // SEO
    if (updateData.metaTitle !== undefined)
      data.metaTitle = updateData.metaTitle;
    if (updateData.metaDescription !== undefined)
      data.metaDescription = updateData.metaDescription;
    if (updateData.keywords !== undefined) data.keywords = updateData.keywords;
    if (updateData.altText !== undefined) data.altText = updateData.altText;
    // Classification
    if (updateData.productType !== undefined)
      data.productType = updateData.productType;
    if (updateData.sku !== undefined) data.sku = updateData.sku;
    if (updateData.barcode !== undefined) data.barcode = updateData.barcode;
    // Tax & Shipping
    if (updateData.taxClass !== undefined) data.taxClass = updateData.taxClass;
    if (updateData.taxRate !== undefined)
      data.taxRate = updateData.taxRate ? Number(updateData.taxRate) : null;
    if (updateData.shippingClass !== undefined)
      data.shippingClass = updateData.shippingClass;
    // Digital
    if (updateData.downloadUrl !== undefined)
      data.downloadUrl = updateData.downloadUrl;
    if (updateData.downloadLimit !== undefined)
      data.downloadLimit = updateData.downloadLimit
        ? Number(updateData.downloadLimit)
        : null;
    if (updateData.fileSize !== undefined) data.fileSize = updateData.fileSize;
    if (updateData.fileFormat !== undefined)
      data.fileFormat = updateData.fileFormat;
    // Subscription
    if (updateData.subscriptionPeriod !== undefined)
      data.subscriptionPeriod = updateData.subscriptionPeriod;
    if (updateData.subscriptionPrice !== undefined)
      data.subscriptionPrice = updateData.subscriptionPrice
        ? Number(updateData.subscriptionPrice)
        : null;
    if (updateData.trialDays !== undefined)
      data.trialDays = updateData.trialDays
        ? Number(updateData.trialDays)
        : null;
    // Gallery
    if (updateData.galleryType !== undefined)
      data.galleryType = updateData.galleryType;
    if (updateData.galleryColumns !== undefined)
      data.galleryColumns = updateData.galleryColumns
        ? Number(updateData.galleryColumns)
        : null;
    // Relations
    if (updateData.relatedProducts !== undefined)
      data.relatedProducts = updateData.relatedProducts;
    if (updateData.crossSells !== undefined)
      data.crossSells = updateData.crossSells;
    if (updateData.upsells !== undefined) data.upsells = updateData.upsells;
    // Phase I: Architecture & One-of-a-kind
    if (updateData.architectureStyle !== undefined)
      data.architectureStyle = updateData.architectureStyle || null;
    if (updateData.folderStructure !== undefined)
      data.folderStructure = updateData.folderStructure || null;
    if (updateData.showOneOfAKind !== undefined)
      data.showOneOfAKind = updateData.showOneOfAKind;
    if (updateData.isUnique !== undefined)
      data.isUnique = updateData.isUnique;

    // Record price history if price is changing
    if (
      updateData.price !== undefined &&
      updateData.price !== currentProduct.price
    ) {
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

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 },
    );
  }
}

// DELETE - Delete product
export async function DELETE(request: NextRequest) {
  const admin = await verifyAdminApiKey(request, "write");
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
