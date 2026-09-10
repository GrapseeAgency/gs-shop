import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/delivery/pending-github - List pending GitHub access requests
export async function GET(request: NextRequest) {
  try {
    // Get all pending GitHub access requests
    const pendingRequests = await prisma.gitHubAccess.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "asc" },
      take: 50
    });

    // Enrich with order and product details
    const enrichedRequests = await Promise.all(
      pendingRequests.map(async (request) => {
        // Get order details
        const order = await prisma.order.findUnique({
          where: { id: request.orderId },
          include: {
            items: {
              include: { product: true },
              take: 1
            }
          }
        });

        return {
          id: request.id,
          orderId: request.orderId,
          productId: request.productId,
          productName: order?.items[0]?.product?.name || "Unknown Product",
          username: request.username,
          repoUrl: request.repoUrl,
          status: request.status,
          requestedAt: request.createdAt,
          customerEmail: order?.customerEmail,
          customerName: order?.customerName
        };
      })
    );

    return NextResponse.json({
      success: true,
      count: enrichedRequests.length,
      requests: enrichedRequests
    });

  } catch (error) {
    console.error("Error fetching pending GitHub requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending requests" },
      { status: 500 }
    );
  }
}
