import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/inventory/[productId] Return real inventory data for a product
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    const { productId } = await params;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        inventory: true,
        isSold: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    const inventory = product.inventory;
    const isSoldOut = inventory <= 0 || product.isSold;
    const isAvailable = !isSoldOut;

    return NextResponse.json({
      success: true,
      productId,
      inventory,
      isAvailable,
      isSoldOut,
    });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch inventory" },
      { status: 500 },
    );
  }
}

// POST /api/inventory/[productId] Update inventory for a product (admin use)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    const { productId } = await params;
    const body = await request.json();
    const { inventory } = body;

    if (inventory === undefined || typeof inventory !== "number") {
      return NextResponse.json(
        { success: false, error: "inventory (number) is required" },
        { status: 400 },
      );
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        inventory,
        isSold: inventory <= 0,
      },
      select: { id: true, inventory: true, isSold: true },
    });

    return NextResponse.json({
      success: true,
      productId,
      inventory: product.inventory,
      isAvailable: !product.isSold,
      isSoldOut: product.isSold,
    });
  } catch (error) {
    console.error("Error updating inventory:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update inventory" },
      { status: 500 },
    );
  }
}
