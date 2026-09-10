import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Phase II: Checkout inventory verification API
// Verifies all items in cart are still available before payment

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body as { items: Array<{ productId: string; quantity: number }> };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "No items provided for verification" },
        { status: 400 }
      );
    }

    const verificationResults = await Promise.all(
      items.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            name: true,
            inventory: true,
            isSold: true,
          },
        });

        if (!product) {
          return {
            productId: item.productId,
            isAvailable: false,
            reason: "Product not found",
          };
        }

        if (product.isSold) {
          return {
            productId: item.productId,
            name: product.name,
            isAvailable: false,
            reason: "Product has been sold",
          };
        }

        if (product.inventory < item.quantity) {
          return {
            productId: item.productId,
            name: product.name,
            isAvailable: false,
            requested: item.quantity,
            available: product.inventory,
            reason: `Only ${product.inventory} items available (requested ${item.quantity})`,
          };
        }

        return {
          productId: item.productId,
          name: product.name,
          isAvailable: true,
          available: product.inventory,
        };
      })
    );

    const allAvailable = verificationResults.every((r) => r.isAvailable);
    const unavailableItems = verificationResults.filter((r) => !r.isAvailable);

    return NextResponse.json({
      success: allAvailable,
      allAvailable,
      items: verificationResults,
      unavailableItems,
      message: allAvailable
        ? "All items are available"
        : `${unavailableItems.length} item(s) are no longer available`,
    });
  } catch (error) {
    console.error("Error verifying inventory:", error);
    return NextResponse.json(
      { error: "Failed to verify inventory" },
      { status: 500 }
    );
  }
}
