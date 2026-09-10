import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// DELETE /api/admin/products/[id]/zip - Delete ZIP file
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    // Get current digital delivery
    const digitalDelivery = await prisma.digitalDelivery.findUnique({
      where: { productId }
    });

    if (!digitalDelivery?.zipFileUrl) {
      return NextResponse.json(
        { error: "No ZIP file found for this product" },
        { status: 404 }
      );
    }

    const zipFileUrl = digitalDelivery.zipFileUrl;

    // Delete physical file if it exists locally
    if (!zipFileUrl.startsWith("http")) {
      const filePath = join(process.cwd(), "public", zipFileUrl);
      if (existsSync(filePath)) {
        await unlink(filePath);
      }
    }
    // If it's a cloud URL (S3, etc), would delete from cloud storage here

    // Update database - remove ZIP info but keep GitHub if exists
    await prisma.digitalDelivery.update({
      where: { productId },
      data: {
        zipFileUrl: null,
        zipFileSize: null,
        zipUploadedAt: null,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: "ZIP file deleted successfully",
      productId,
      deletedFile: zipFileUrl,
      hasGitHub: !!digitalDelivery.githubRepoUrl
    });

  } catch (error) {
    console.error("Error deleting ZIP:", error);
    return NextResponse.json(
      { error: "Failed to delete ZIP file" },
      { status: 500 }
    );
  }
}

// GET /api/admin/products/[id]/zip - Get ZIP file info
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    const digitalDelivery = await prisma.digitalDelivery.findUnique({
      where: { productId }
    });

    if (!digitalDelivery?.zipFileUrl) {
      return NextResponse.json({
        success: true,
        hasZip: false,
        zip: null
      });
    }

    return NextResponse.json({
      success: true,
      hasZip: true,
      zip: {
        fileUrl: digitalDelivery.zipFileUrl,
        fileSize: digitalDelivery.zipFileSize,
        uploadedAt: digitalDelivery.zipUploadedAt,
        fileName: digitalDelivery.zipFileUrl.split("/").pop()
      }
    });

  } catch (error) {
    console.error("Error fetching ZIP info:", error);
    return NextResponse.json(
      { error: "Failed to fetch ZIP info" },
      { status: 500 }
    );
  }
}
