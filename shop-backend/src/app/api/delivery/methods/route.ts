import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/delivery/methods?orderId=xxx - Get available delivery methods for an order
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID required" },
        { status: 400 }
      );
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } }
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Check if order is completed/paid
    if (order.status !== "completed" && order.status !== "confirmed" && order.status !== "paid") {
      return NextResponse.json(
        { error: "Order not ready for delivery", currentStatus: order.status },
        { status: 400 }
      );
    }

    // Get first product to determine delivery options
    const product = order.items[0]?.product;
    
    if (!product) {
      return NextResponse.json(
        { error: "No products in order" },
        { status: 400 }
      );
    }

    // Determine available delivery methods based on product type
    const methods = [
      {
        id: "zip",
        name: "ZIP File Download",
        description: "Download complete project as compressed archive",
        icon: "archive",
        available: true,
        features: ["Single file download", "Compressed archive", "Instant access"]
      },
      {
        id: "folder",
        name: "Folder Download",
        description: "Download structured files with proper organization",
        icon: "folder",
        available: true,
        features: ["Structured files", "Organized folders", "Instant access"]
      },
      {
        id: "github",
        name: "GitHub Repository",
        description: "Get private access to GitHub repository",
        icon: "github",
        available: true,
        features: ["Private repo access", "Version control", "Collaboration ready"]
      },
      {
        id: "chat",
        name: "Chat with Engineer",
        description: "Direct support and custom delivery with engineer",
        icon: "chat",
        available: true,
        features: ["Direct support", "Custom delivery", "Real-time chat"]
      }
    ];

    // Get delivery status if any method already selected (handle missing table gracefully)
    let delivery = null;
    try {
      delivery = await prisma.digitalDelivery.findFirst({
        where: { orderId }
      });
    } catch (e) {
      console.log("[Delivery API] digitalDelivery table not found, skipping...");
    }

    return NextResponse.json({
      success: true,
      orderId,
      product: {
        id: product.id,
        name: product.name,
        type: product.productType || "digital"
      },
      methods,
      selectedMethod: delivery?.method || null,
      deliveryStatus: delivery?.status || "pending",
      deliveredAt: delivery?.deliveredAt
    });

  } catch (error) {
    console.error("Error fetching delivery methods:", error);
    return NextResponse.json(
      { error: "Failed to fetch delivery methods" },
      { status: 500 }
    );
  }
}
