import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/products/[id]/delivery - Get single product delivery details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        _count: {
          select: {
            digitalPurchases: true
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Get digital delivery info
    const digitalDelivery = await prisma.digitalDelivery.findUnique({
      where: { productId }
    });

    // Get GitHub access count for this product
    const githubAccessCount = await prisma.gitHubAccess.count({
      where: { productId }
    });

    const pendingAccess = await prisma.gitHubAccess.count({
      where: { productId, status: "pending" }
    });

    const grantedAccess = await prisma.gitHubAccess.count({
      where: { productId, status: "granted" }
    });

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        isActive: product.isActive,
        totalPurchases: product._count.digitalPurchases
      },
      delivery: {
        hasZip: !!digitalDelivery?.zipFileUrl,
        hasGitHub: !!digitalDelivery?.githubRepoUrl,
        hasFolderStructure: !!digitalDelivery?.folderStructure,
        zip: digitalDelivery?.zipFileUrl ? {
          fileUrl: digitalDelivery.zipFileUrl,
          fileSize: digitalDelivery.zipFileSize,
          uploadedAt: digitalDelivery.zipUploadedAt,
          fileName: digitalDelivery.zipFileUrl.split("/").pop()
        } : null,
        github: digitalDelivery?.githubRepoUrl ? {
          repoUrl: digitalDelivery.githubRepoUrl,
          repoName: digitalDelivery.githubRepoName,
          connectedAt: digitalDelivery.updatedAt
        } : null,
        folderStructure: digitalDelivery?.folderStructure 
          ? JSON.parse(digitalDelivery.folderStructure) 
          : null,
        updatedAt: digitalDelivery?.updatedAt || null
      },
      stats: {
        totalGithubAccessRequests: githubAccessCount,
        pendingAccess,
        grantedAccess,
        revokedAccess: githubAccessCount - pendingAccess - grantedAccess
      }
    });

  } catch (error) {
    console.error("Error fetching product delivery:", error);
    return NextResponse.json(
      { error: "Failed to fetch product delivery details" },
      { status: 500 }
    );
  }
}
