import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import { join } from "path";
import crypto from "crypto";

// POST /api/admin/products/[id]/upload-zip - Upload ZIP file for product
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith(".zip")) {
      return NextResponse.json(
        { error: "Only ZIP files allowed" },
        { status: 400 }
      );
    }

    // Max file size 500MB
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large (max 500MB)" },
        { status: 400 }
      );
    }

    // Generate safe filename
    const timestamp = Date.now();
    const safeName = product.name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const fileName = `${safeName}_${timestamp}.zip`;

    // In production, upload to S3/cloud storage
    // For now, save locally in public/uploads
    const uploadsDir = join(process.cwd(), "public", "uploads", "products");
    const filePath = join(uploadsDir, fileName);
    const publicUrl = `/uploads/products/${fileName}`;

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Update or create DigitalDelivery record
    const digitalDelivery = await prisma.digitalDelivery.upsert({
      where: { productId },
      update: {
        zipFileUrl: publicUrl,
        zipFileSize: file.size,
        zipUploadedAt: new Date(),
        updatedAt: new Date()
      },
      create: {
        productId,
        zipFileUrl: publicUrl,
        zipFileSize: file.size,
        zipUploadedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: "ZIP file uploaded successfully",
      productId,
      fileName,
      fileSize: file.size,
      downloadUrl: publicUrl,
      uploadedAt: digitalDelivery.zipUploadedAt
    });

  } catch (error) {
    console.error("Error uploading ZIP:", error);
    return NextResponse.json(
      { error: "Failed to upload ZIP file" },
      { status: 500 }
    );
  }
}
