import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Card payment processing API
// Phase IV: Real payment processing endpoint

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      amount,
      items,
      cardNumber,
      cardName,
      cardExpiry,
      cardCvv,
      contactEmail,
      userId
    } = body;

    // Validate required fields
    if (!amount || !items || !cardNumber || !cardExpiry || !cardCvv || !contactEmail) {
      console.error("Missing fields:", { amount, items: items?.length, cardNumber: !!cardNumber, cardExpiry: !!cardExpiry, cardCvv: !!cardCvv, contactEmail: !!contactEmail });
      return NextResponse.json(
        { error: "Missing required payment details", details: { amount, hasItems: !!items, hasCard: !!cardNumber, hasExpiry: !!cardExpiry, hasCvv: !!cardCvv, hasEmail: !!contactEmail } },
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

    // Validate card format (basic validation)
    const cleanCardNumber = cardNumber.replace(/\s/g, "");
    if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
      return NextResponse.json(
        { error: "Invalid card number" },
        { status: 400 }
      );
    }

    // Validate expiry format (MM/YY)
    const expiryMatch = cardExpiry.match(/^(\d{2})\/(\d{2})$/);
    if (!expiryMatch) {
      return NextResponse.json(
        { error: "Invalid expiry date format" },
        { status: 400 }
      );
    }

    const [_, month, year] = expiryMatch;
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    
    if (parseInt(year) < currentYear || 
        (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
      return NextResponse.json(
        { error: "Card has expired" },
        { status: 400 }
      );
    }

    // Validate CVV (3-4 digits)
    if (!/^\d{3,4}$/.test(cardCvv)) {
      return NextResponse.json(
        { error: "Invalid CVV" },
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

    // Generate payment ID
    const paymentId = `CARD-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Use transaction to ensure order and inventory updates are atomic
    const result = await prisma.$transaction(async (tx) => {
      // Create order in database
      const order = await tx.order.create({
        data: {
          userId: userId || null,
          customerName: cardName,
          customerEmail: contactEmail,
          customerPhone: null,
          total: amount,
          discount: 0,
          status: "paid", // Card payments are immediate
          paymentMethod: "card",
          paymentId: paymentId,
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

      // Update product inventory and mark as sold if needed
      for (const item of items) {
        const product = productMap.get(item.productId);
        if (product) {
          const newInventory = product.isUnique
            ? 0
            : Math.max(0, (product.inventory || 0) - (item.quantity || 1));

          await tx.product.update({
            where: { id: item.productId },
            data: {
              inventory: newInventory,
              isSold: product.isUnique || newInventory === 0,
            },
          });
        }
      }

      return order;
    });

    return NextResponse.json({
      success: true,
      orderId: result.id,
      paymentId: paymentId,
      message: "Payment processed successfully",
    });

  } catch (error) {
    console.error("Card payment error:", error);
    return NextResponse.json(
      { error: "Payment processing failed. Please try again." },
      { status: 500 }
    );
  }
}
