import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Bank transfer payment processing API
// Phase IV: Real bank transfer initiation endpoint

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      amount,
      items,
      accountNumber,
      swiftCode,
      bankName,
      accountHolder,
      contactEmail,
      userId
    } = body;

    // Validate required fields
    if (!amount || !items || !accountNumber || !swiftCode || !bankName || !accountHolder || !contactEmail) {
      console.error("Missing fields:", { amount, items: items?.length, accountNumber: !!accountNumber, swiftCode: !!swiftCode, bankName: !!bankName, accountHolder: !!accountHolder, contactEmail: !!contactEmail });
      return NextResponse.json(
        { error: "Missing required bank transfer details", details: { amount, hasItems: !!items, hasAccount: !!accountNumber, hasSwift: !!swiftCode, hasBank: !!bankName, hasHolder: !!accountHolder, hasEmail: !!contactEmail } },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(contactEmail)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Validate account number (minimum 8 digits)
    const cleanAccountNumber = accountNumber.replace(/\s/g, "");
    if (cleanAccountNumber.length < 8) {
      return NextResponse.json(
        { error: "Invalid account number" },
        { status: 400 }
      );
    }

    // Validate SWIFT code (8 or 11 characters)
    const cleanSwiftCode = swiftCode.replace(/\s/g, "").toUpperCase();
    if (!/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(cleanSwiftCode)) {
      return NextResponse.json(
        { error: "Invalid SWIFT/BIC code format" },
        { status: 400 }
      );
    }

    // Verify inventory availability before creating order
    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        inventory: true,
        isSold: true,
        isUnique: true,
        price: true,
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Check availability
    for (const item of items) {
      const product = productMap.get(item.productId);
      
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.name} no longer exists` },
          { status: 400 }
        );
      }

      if (product.isSold) {
        return NextResponse.json(
          { error: `Product "${product.name}" has already been sold` },
          { status: 400 }
        );
      }

      const requestedQty = item.quantity || 1;
      const availableQty = product.isUnique ? 1 : (product.inventory || 0);

      if (requestedQty > availableQty) {
        return NextResponse.json(
          { 
            error: `Insufficient inventory for "${product.name}". ` +
                   `Requested: ${requestedQty}, Available: ${availableQty}`
          },
          { status: 400 }
        );
      }
    }

    // Generate transfer reference ID
    const transferId = `BANK-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Use transaction to ensure order and inventory updates are atomic
    const result = await prisma.$transaction(async (tx) => {
      // Create order in database (status: pending until transfer confirmed)
      const order = await tx.order.create({
        data: {
          userId: userId || null,
          customerName: accountHolder,
          customerEmail: contactEmail,
          customerPhone: null,
          total: amount,
          discount: 0,
          status: "pending", // Bank transfers need confirmation
          paymentMethod: "bank_transfer",
          paymentId: transferId,
          notes: `Bank: ${bankName}, Account: ${cleanAccountNumber.slice(-4)}, SWIFT: ${cleanSwiftCode}`,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              productName: item.name,
              price: item.unitPrice,
              quantity: item.quantity || 1,
              imageUrl: item.imageUrl || null,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Reserve inventory (don't mark as sold yet - wait for transfer confirmation)
      for (const item of items) {
        const product = productMap.get(item.productId);
        if (product && !product.isUnique) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              inventory: Math.max(0, (product.inventory || 0) - (item.quantity || 1)),
            },
          });
        }
      }

      return order;
    });

    return NextResponse.json({
      success: true,
      orderId: result.id,
      transferId: transferId,
      message: "Bank transfer initiated. Please check your email for transfer instructions.",
      instructions: {
        bankName: "Our Bank: Example Bank Ltd",
        accountNumber: "XXXX-XXXX-XXXX-1234",
        swiftCode: "EXAMUS33",
        reference: transferId,
        amount: amount,
        deadline: "48 hours",
      },
    });

  } catch (error) {
    console.error("Bank transfer error:", error);
    return NextResponse.json(
      { error: "Failed to initiate bank transfer. Please try again." },
      { status: 500 }
    );
  }
}
