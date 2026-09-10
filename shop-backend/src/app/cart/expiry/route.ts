import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Get cart expiry time
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get cart expiry for user
    const cartExpiry = await prisma.cartExpiry.findFirst({
      where: { userId },
    });

    if (!cartExpiry) {
      // Create new expiry (30 minutes from now)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30);

      const newExpiry = await prisma.cartExpiry.create({
        data: {
          cartId: `cart_${userId}`,
          userId,
          expiresAt,
        },
      });

      return NextResponse.json({
        expiry: newExpiry,
        remainingSeconds: 30 * 60,
        message: "Cart reserved for 30 minutes",
      });
    }

    // Check if expired
    const now = new Date();
    const remainingSeconds = Math.max(0, Math.floor((cartExpiry.expiresAt.getTime() - now.getTime()) / 1000));

    if (remainingSeconds === 0 && !cartExpiry.extendedAt) {
      // Auto-extend once
      const extendedAt = new Date();
      extendedAt.setMinutes(extendedAt.getMinutes() + 15);

      await prisma.cartExpiry.update({
        where: { id: cartExpiry.id },
        data: { extendedAt: new Date(), expiresAt: extendedAt },
      });

      return NextResponse.json({
        expiry: { ...cartExpiry, extendedAt: new Date(), expiresAt: extendedAt },
        remainingSeconds: 15 * 60,
        extended: true,
        message: "Cart extended by 15 minutes",
      });
    }

    return NextResponse.json({
      expiry: cartExpiry,
      remainingSeconds,
      extended: !!cartExpiry.extendedAt,
      expired: remainingSeconds === 0,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to get cart expiry" }, { status: 500 });
  }
}

// POST - Extend cart expiry
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cartExpiry = await prisma.cartExpiry.findFirst({
      where: { userId },
    });

    if (!cartExpiry) {
      return NextResponse.json({ error: "No active cart" }, { status: 404 });
    }

    // Extend by 15 minutes
    const newExpiry = new Date();
    newExpiry.setMinutes(newExpiry.getMinutes() + 15);

    await prisma.cartExpiry.update({
      where: { id: cartExpiry.id },
      data: { 
        extendedAt: new Date(),
        expiresAt: newExpiry,
      },
    });

    return NextResponse.json({
      success: true,
      newExpiry,
      message: "Cart extended by 15 minutes",
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to extend cart" }, { status: 500 });
  }
}
