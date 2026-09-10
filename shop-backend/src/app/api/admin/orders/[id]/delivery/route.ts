import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/orders/[id]/delivery - Get full delivery details for an order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;

    // Get order with all related data
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true }
        },
        user: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const product = order.items[0]?.product;
    const productId = product?.id;

    // Get digital delivery info
    const digitalDelivery = productId ? await prisma.digitalDelivery.findUnique({
      where: { productId }
    }) : null;

    // Get GitHub access status
    const githubAccess = await prisma.gitHubAccess.findFirst({
      where: { orderId }
    });

    // Get chat session
    const chatSession = await prisma.chatSession.findFirst({
      where: { orderId },
      include: { _count: { select: { messages: true } } }
    });

    // Get download count (from DigitalPurchase or custom tracking)
    const downloadCount = await prisma.digitalPurchase.count({
      where: { orderId }
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        customerEmail: order.customerEmail,
        customerName: order.customerName,
        total: order.total,
        createdAt: order.createdAt,
        paidAt: order.status === "completed" || order.status === "paid" ? order.updatedAt : null
      },
      product: product ? {
        id: product.id,
        name: product.name,
        slug: product.slug
      } : null,
      delivery: {
        methods: ["zip", "github", "chat"],
        zip: {
          available: !!digitalDelivery?.zipFileUrl,
          fileUrl: digitalDelivery?.zipFileUrl || null,
          fileSize: digitalDelivery?.zipFileSize || null,
          uploadedAt: digitalDelivery?.zipUploadedAt || null
        },
        github: {
          configured: !!digitalDelivery?.githubRepoUrl,
          repoUrl: digitalDelivery?.githubRepoUrl || null,
          repoName: digitalDelivery?.githubRepoName || null,
          accessStatus: githubAccess?.status || "not_requested",
          username: githubAccess?.username || null,
          requestedAt: githubAccess?.createdAt || null,
          grantedAt: githubAccess?.grantedAt || null
        },
        chat: {
          hasSession: !!chatSession,
          sessionId: chatSession?.id || null,
          roomId: chatSession?.roomId || null,
          status: chatSession?.status || "none",
          messageCount: chatSession?._count.messages || 0,
          createdAt: chatSession?.createdAt || null
        },
        stats: {
          downloadCount,
          lastDownloadAt: null // Would track in DigitalPurchase
        }
      }
    });

  } catch (error) {
    console.error("Error fetching order delivery:", error);
    return NextResponse.json(
      { error: "Failed to fetch order delivery details" },
      { status: 500 }
    );
  }
}
