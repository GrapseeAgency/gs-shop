import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Get saved for later items
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const savedItems = await prisma.savedCartItem.findMany({
      where: { userId },
      orderBy: { savedAt: "desc" },
    });

    return NextResponse.json({ items: savedItems });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch saved items" }, { status: 500 });
  }
}

// POST - Save item for later
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, quantity, options, notes } = await req.json();

    const savedItem = await prisma.savedCartItem.create({
      data: {
        userId,
        productId,
        quantity,
        options: options ? JSON.stringify(options) : null,
        notes,
      },
    });

    return NextResponse.json({ item: savedItem });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save item" }, { status: 500 });
  }
}

// DELETE - Remove from saved for later
export async function DELETE(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Item ID required" }, { status: 400 });
    }

    await prisma.savedCartItem.deleteMany({
      where: { id, userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
  }
}

// PUT - Move saved item back to cart
export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();

    const savedItem = await prisma.savedCartItem.findFirst({
      where: { id, userId },
    });

    if (!savedItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Delete from saved
    await prisma.savedCartItem.delete({
      where: { id },
    });

    return NextResponse.json({ 
      success: true, 
      item: savedItem,
      message: "Item moved back to cart" 
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to move item" }, { status: 500 });
  }
}
