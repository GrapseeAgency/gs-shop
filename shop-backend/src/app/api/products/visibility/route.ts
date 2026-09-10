import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/products/visibility - Update product visibility after purchase
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, productId, isVisible, customerUsername } = body;

    if (!orderId || !productId) {
      return NextResponse.json(
        { error: "Order ID and Product ID required" },
        { status: 400 }
      );
    }

    // Verify order exists and is completed
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Verify order status allows visibility change
    if (order.status !== "completed" && order.status !== "confirmed" && order.status !== "paid") {
      return NextResponse.json(
        { error: "Order not ready for visibility update", currentStatus: order.status },
        { status: 400 }
      );
    }

    // Verify the product belongs to this order
    const orderItem = order.items.find(item => item.productId === productId);
    if (!orderItem) {
      return NextResponse.json(
        { error: "Product not found in this order" },
        { status: 400 }
      );
    }

    // Get current product
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Update product based on visibility choice
    if (isVisible) {
      // YES: Product stays live, shows 'Out of Stock', displays username
      await prisma.product.update({
        where: { id: productId },
        data: {
          inventory: 0,          // Mark as sold out
          isSold: true,          // Mark as sold
          soldTo: order.customerEmail,
          buyerUsername: customerUsername || order.customerName || "Anonymous",
          isPubliclyVisible: true,        // Keep visible in shop
          updatedAt: new Date()
        }
      });

      // Record visibility decision (skip if table doesn't exist)
      try {
        await prisma.productVisibility.upsert({
          where: { 
            orderId_productId: {
              orderId,
              productId
            }
          },
          update: {
            isVisible: true,
            customerUsername: customerUsername || order.customerName || "Anonymous",
            updatedAt: new Date()
          },
          create: {
            orderId,
            productId,
            isVisible: true,
            customerUsername: customerUsername || order.customerName || "Anonymous",
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
      } catch (e) {
        console.log("[Visibility API] productVisibility table not found, skipping...");
      }

      return NextResponse.json({
        success: true,
        message: "Product will remain visible in the shop",
        visibility: {
          isVisible: true,
          showsAs: "Out of Stock",
          buyerUsername: customerUsername || order.customerName || "Anonymous",
          productUrl: `/product/${product.slug}`
        }
      });

    } else {
      // NO: Remove from public shop, hide from search, only in private profile
      await prisma.product.update({
        where: { id: productId },
        data: {
          inventory: 0,          // Mark as sold out
          isSold: true,          // Mark as sold
          soldTo: order.customerEmail,
          buyerUsername: customerUsername || order.customerName || "Anonymous",
          isPubliclyVisible: false,       // Hide from public shop
          isFeatured: false,     // Remove from featured
          isTrending: false,     // Remove from trending
          updatedAt: new Date()
        }
      });

      // Record visibility decision (skip if table doesn't exist)
      try {
        await prisma.productVisibility.upsert({
          where: { 
            orderId_productId: {
              orderId,
              productId
            }
          },
          update: {
            isVisible: false,
            customerUsername: customerUsername || order.customerName || "Anonymous",
            updatedAt: new Date()
          },
          create: {
            orderId,
            productId,
            isVisible: false,
            customerUsername: customerUsername || order.customerName || "Anonymous",
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
      } catch (e) {
        console.log("[Visibility API] productVisibility table not found, skipping...");
      }

      return NextResponse.json({
        success: true,
        message: "Product will be hidden from public shop",
        visibility: {
          isVisible: false,
          showsAs: "Private",
          buyerUsername: customerUsername || order.customerName || "Anonymous",
          accessibleIn: "Your private profile only"
        }
      });
    }

  } catch (error) {
    console.error("Error updating product visibility:", error);
    return NextResponse.json(
      { error: "Failed to update product visibility" },
      { status: 500 }
    );
  }
}

// GET /api/products/visibility?orderId=xxx&productId=yyy - Get current visibility status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    const productId = searchParams.get("productId");

    if (!orderId || !productId) {
      return NextResponse.json(
        { error: "Order ID and Product ID required" },
        { status: 400 }
      );
    }

    // Get visibility record (null if table doesn't exist)
    let visibility = null;
    try {
      visibility = await prisma.productVisibility.findUnique({
        where: { 
          orderId_productId: {
            orderId,
            productId
          }
        }
      });
    } catch (e) {
      console.log("[Visibility API] productVisibility table not found, returning null...");
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        isPubliclyVisible: true,
        isSold: true,
        buyerUsername: true
      }
    });

    return NextResponse.json({
      success: true,
      visibility: visibility || null,
      product: product || null,
      decisionMade: !!visibility
    });

  } catch (error) {
    console.error("Error fetching visibility:", error);
    return NextResponse.json(
      { error: "Failed to fetch visibility status" },
      { status: 500 }
    );
  }
}
