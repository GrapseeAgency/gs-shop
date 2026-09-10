import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/admin/products/[id]/connect-github - Connect GitHub repo to product
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const body = await request.json();
    const { githubRepoUrl, githubRepoName } = body;

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

    // Validate GitHub URL
    if (!githubRepoUrl || !githubRepoUrl.includes("github.com")) {
      return NextResponse.json(
        { error: "Valid GitHub repository URL required" },
        { status: 400 }
      );
    }

    // Extract repo name from URL if not provided
    const extractedName = githubRepoName || 
      githubRepoUrl.split("/").pop()?.replace(".git", "") || 
      product.name.replace(/[^a-z0-9]/gi, "-").toLowerCase();

    // Update or create DigitalDelivery record
    const digitalDelivery = await prisma.digitalDelivery.upsert({
      where: { productId },
      update: {
        githubRepoUrl,
        githubRepoName: extractedName,
        updatedAt: new Date()
      },
      create: {
        productId,
        githubRepoUrl,
        githubRepoName: extractedName
      }
    });

    return NextResponse.json({
      success: true,
      message: "GitHub repository connected successfully",
      productId,
      productName: product.name,
      githubRepoUrl,
      githubRepoName: extractedName,
      connectedAt: digitalDelivery.updatedAt
    });

  } catch (error) {
    console.error("Error connecting GitHub repo:", error);
    return NextResponse.json(
      { error: "Failed to connect GitHub repository" },
      { status: 500 }
    );
  }
}

// GET /api/admin/products/[id]/connect-github - Check GitHub connection status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    const digitalDelivery = await prisma.digitalDelivery.findUnique({
      where: { productId }
    });

    if (!digitalDelivery?.githubRepoUrl) {
      return NextResponse.json({
        success: true,
        connected: false,
        message: "No GitHub repository connected"
      });
    }

    return NextResponse.json({
      success: true,
      connected: true,
      githubRepoUrl: digitalDelivery.githubRepoUrl,
      githubRepoName: digitalDelivery.githubRepoName,
      connectedAt: digitalDelivery.updatedAt
    });

  } catch (error) {
    console.error("Error checking GitHub connection:", error);
    return NextResponse.json(
      { error: "Failed to check GitHub connection" },
      { status: 500 }
    );
  }
}
