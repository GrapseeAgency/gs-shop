import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/admin/products/[id]/upload-folder-structure - Upload folder structure JSON
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const body = await request.json();
    const { folderStructure } = body;

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

    // Validate folder structure
    if (!folderStructure || typeof folderStructure !== "object") {
      return NextResponse.json(
        { error: "Invalid folder structure" },
        { status: 400 }
      );
    }

    // Convert to JSON string
    const folderStructureJson = JSON.stringify(folderStructure);

    // Update or create DigitalDelivery record
    const digitalDelivery = await prisma.digitalDelivery.upsert({
      where: { productId },
      update: {
        folderStructure: folderStructureJson,
        updatedAt: new Date()
      },
      create: {
        productId,
        folderStructure: folderStructureJson
      }
    });

    return NextResponse.json({
      success: true,
      message: "Folder structure uploaded successfully",
      productId,
      folderCount: folderStructure.folders?.length || 0,
      fileCount: folderStructure.root?.files?.length || 0,
      updatedAt: digitalDelivery.updatedAt
    });

  } catch (error) {
    console.error("Error uploading folder structure:", error);
    return NextResponse.json(
      { error: "Failed to upload folder structure" },
      { status: 500 }
    );
  }
}

// GET /api/admin/products/[id]/upload-folder-structure - Get folder structure
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    const digitalDelivery = await prisma.digitalDelivery.findUnique({
      where: { productId }
    });

    if (!digitalDelivery?.folderStructure) {
      return NextResponse.json({
        success: true,
        hasStructure: false,
        structure: null
      });
    }

    return NextResponse.json({
      success: true,
      hasStructure: true,
      structure: JSON.parse(digitalDelivery.folderStructure),
      updatedAt: digitalDelivery.updatedAt
    });

  } catch (error) {
    console.error("Error fetching folder structure:", error);
    return NextResponse.json(
      { error: "Failed to fetch folder structure" },
      { status: 500 }
    );
  }
}
