import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Phase III: Order Preview API
// Calculates order summary with Base/Fee/Total breakdown

interface PreviewItem {
  productId: string;
  name: string;
  quantity: number;
  basePrice: number; // Price per item
}

interface PreviewRequest {
  items: PreviewItem[];
  couponCode?: string;
}

interface FeeBreakdown {
  platformFee: number;
  transactionFee: number;
  shippingFee: number;
  taxAmount: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as PreviewRequest;
    const { items, couponCode } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "No items provided for preview" },
        { status: 400 }
      );
    }

    // Verify all products exist and get real prices
    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        price: true,
        isSold: true,
        inventory: true,
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Validate items and calculate base total
    let baseTotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = productMap.get(item.productId);

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        );
      }

      if (product.isSold) {
        return NextResponse.json(
          { error: `Product "${product.name}" has been sold` },
          { status: 400 }
        );
      }

      // Validate quantity (must be a positive number)
      const quantity = typeof item.quantity === 'number' && !isNaN(item.quantity) && item.quantity > 0
        ? item.quantity
        : 1;

      if (product.inventory < quantity) {
        return NextResponse.json(
          { error: `Insufficient inventory for "${product.name}". Available: ${product.inventory}, Requested: ${quantity}` },
          { status: 400 }
        );
      }

      const itemTotal = product.price * quantity;
      baseTotal += itemTotal;

      validatedItems.push({
        productId: item.productId,
        name: product.name,
        quantity: quantity,
        unitPrice: product.price,
        totalPrice: itemTotal,
      });
    }

    // Phase III: Calculate fees based on real business logic
    const feeBreakdown: FeeBreakdown = calculateFees(baseTotal);

    // Apply coupon discount if provided
    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
      });

      if (coupon && coupon.isActive) {
        const now = new Date();
        if (coupon.expiresAt && coupon.expiresAt < now) {
          // Coupon expired
        } else if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
          // Coupon usage limit reached
        } else {
          // Apply discount
          if (coupon.discountType === "percentage") {
            discountAmount = (baseTotal * coupon.discountValue) / 100;
          } else {
            discountAmount = coupon.discountValue;
          }
          appliedCoupon = {
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
          };
        }
      }
    }

    // Calculate final total
    const feesTotal =
      feeBreakdown.platformFee +
      feeBreakdown.transactionFee +
      feeBreakdown.shippingFee +
      feeBreakdown.taxAmount;

    const total = baseTotal + feesTotal - discountAmount;

    // Phase III: Response matches flowchart format
    const preview = {
      // Product Summary
      items: validatedItems,
      itemCount: validatedItems.reduce((sum, item) => sum + item.quantity, 0),

      // Price Chart (Base/Fee/Total format as per flowchart)
      priceChart: {
        base: baseTotal, // Base price of products
        fees: {
          platform: feeBreakdown.platformFee,
          transaction: feeBreakdown.transactionFee,
          shipping: feeBreakdown.shippingFee,
          tax: feeBreakdown.taxAmount,
          total: feesTotal,
        },
        discount: discountAmount > 0 ? discountAmount : null,
        total: Math.max(0, total), // Ensure non-negative
      },

      // Coupon info
      coupon: appliedCoupon,

      // Final confirmation data
      confirmation: {
        canProceed: true,
        warnings: [],
        requiresConfirmation: true,
      },

      // Metadata
      currency: "USD",
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min expiry
    };

    return NextResponse.json(preview);
  } catch (error) {
    console.error("Order preview error:", error);
    return NextResponse.json(
      { error: "Failed to generate order preview" },
      { status: 500 }
    );
  }
}

// FREE everything - only pay for product price
// No platform fee, no transaction fee, free delivery, no tax
function calculateFees(baseTotal: number): FeeBreakdown {
  return {
    platformFee: 0,
    transactionFee: 0,
    shippingFee: 0,
    taxAmount: 0,
  };
}
