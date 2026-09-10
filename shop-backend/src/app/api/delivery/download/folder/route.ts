import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/delivery/download/folder - Get structured folder download links
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID required" },
        { status: 400 }
      );
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        items: { include: { product: true } }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Verify order is paid/completed
    if (order.status !== "completed" && order.status !== "confirmed" && order.status !== "paid") {
      return NextResponse.json(
        { error: "Order not ready for delivery", status: order.status },
        { status: 400 }
      );
    }

    const product = order.items[0]?.product;
    if (!product) {
      return NextResponse.json(
        { error: "No products in order" },
        { status: 400 }
      );
    }

    const projectName = product.name.replace(/[^a-z0-9]/gi, "_").toLowerCase();

    // Check for DigitalDelivery with folder structure
    const digitalDelivery = await prisma.digitalDelivery.findUnique({
      where: { productId: product.id }
    });

    // If folder structure exists, use it
    if (digitalDelivery?.folderStructure) {
      try {
        const folderStructure = JSON.parse(digitalDelivery.folderStructure);
        return NextResponse.json({
          success: true,
          orderId,
          product: {
            id: product.id,
            name: product.name
          },
          structure: folderStructure,
          downloadLinks: {
            all: `/api/delivery/download/zip`,
            message: "Folder structure ready for download"
          },
          status: "ready"
        });
      } catch {
        // Invalid JSON, fall through to coming soon
      }
    }

    // Return "Coming Soon" structure
    return NextResponse.json({
      success: true,
      orderId,
      product: {
        id: product.id,
        name: product.name
      },
      structure: {
        root: {
          name: projectName,
          files: []
        },
        folders: []
      },
      downloadLinks: {
        all: null
      },
      status: "coming_soon",
      message: "Folder download coming soon. Please use ZIP download for now."
    });

  } catch (error) {
    console.error("Error preparing folder download:", error);
    return NextResponse.json(
      { error: "Failed to prepare folder download" },
      { status: 500 }
    );
  }
}
