import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/products/delivery-status - List all products with delivery status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const hasDelivery = searchParams.get("hasDelivery"); // "zip", "github", "any", "none"

    // Get all products with their delivery info
    const products = await prisma.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        digitalDelivery: true,
        _count: {
          select: {
            digitalPurchases: true
          }
        }
      }
    });

    // Filter if requested
    let filteredProducts = products;
    if (hasDelivery === "zip") {
      filteredProducts = products.filter(p => p.digitalDelivery?.zipFileUrl);
    } else if (hasDelivery === "github") {
      filteredProducts = products.filter(p => p.digitalDelivery?.githubRepoUrl);
    } else if (hasDelivery === "any") {
      filteredProducts = products.filter(p => 
        p.digitalDelivery?.zipFileUrl || p.digitalDelivery?.githubRepoUrl
      );
    } else if (hasDelivery === "none") {
      filteredProducts = products.filter(p => !p.digitalDelivery);
    }

    const productStatuses = filteredProducts.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      isActive: product.isActive,
      hasZip: !!product.digitalDelivery?.zipFileUrl,
      hasGitHub: !!product.digitalDelivery?.githubRepoUrl,
      hasFolderStructure: !!product.digitalDelivery?.folderStructure,
      zipFileUrl: product.digitalDelivery?.zipFileUrl || null,
      zipFileSize: product.digitalDelivery?.zipFileSize || null,
      zipUploadedAt: product.digitalDelivery?.zipUploadedAt || null,
      githubRepoUrl: product.digitalDelivery?.githubRepoUrl || null,
      githubRepoName: product.digitalDelivery?.githubRepoName || null,
      totalPurchases: product._count.digitalPurchases,
      createdAt: product.createdAt,
      updatedAt: product.digitalDelivery?.updatedAt || product.updatedAt
    }));

    // Get totals
    const totalProducts = await prisma.product.count();
    const withZip = await prisma.digitalDelivery.count({ where: { zipFileUrl: { not: null } } });
    const withGitHub = await prisma.digitalDelivery.count({ where: { githubRepoUrl: { not: null } } });
    const withNoDelivery = totalProducts - await prisma.digitalDelivery.count();

    return NextResponse.json({
      success: true,
      pagination: {
        page,
        limit,
        total: filteredProducts.length,
        hasMore: filteredProducts.length === limit
      },
      summary: {
        totalProducts,
        withZip,
        withGitHub,
        withBoth: await prisma.digitalDelivery.count({
          where: {
            zipFileUrl: { not: null },
            githubRepoUrl: { not: null }
          }
        }),
        withNoDelivery
      },
      products: productStatuses
    });

  } catch (error) {
    console.error("Error fetching delivery status:", error);
    return NextResponse.json(
      { error: "Failed to fetch delivery status" },
      { status: 500 }
    );
  }
}
