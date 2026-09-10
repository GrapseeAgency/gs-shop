import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Lock price for 24 hours
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, lockedPrice } = await req.json();

    // Check for existing active lock
    const existingLock = await prisma.priceLock.findFirst({
      where: {
        userId,
        productId,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingLock) {
      return NextResponse.json({ 
        error: "Price already locked for this product",
        lock: existingLock
      }, { status: 400 });
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const priceLock = await prisma.priceLock.create({
      data: {
        userId,
        productId,
        lockedPrice,
        expiresAt,
      },
    });

    return NextResponse.json({ 
      lock: priceLock,
      message: "Price locked for 24 hours"
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to lock price" }, { status: 500 });
  }
}

// GET - Get active price locks for user
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const locks = await prisma.priceLock.findMany({
      where: {
        userId,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ locks });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch price locks" }, { status: 500 });
  }
}

// DELETE - Release price lock
export async function DELETE(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Lock ID required" }, { status: 400 });
    }

    await prisma.priceLock.deleteMany({
      where: { id, userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to release lock" }, { status: 500 });
  }
}
