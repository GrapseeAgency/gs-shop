import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/delivery/chat/[sessionId] - Get single chat session details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { timestamp: "asc" },
          take: 50 // Last 50 messages
        },
        _count: { select: { messages: true } }
      }
    });

    if (!session) {
      return NextResponse.json(
        { error: "Chat session not found" },
        { status: 404 }
      );
    }

    // Get related order/product info based on type
    let order = null;
    let product = null;

    if (session.type === "paid" && session.orderId) {
      order = await prisma.order.findUnique({
        where: { id: session.orderId },
        include: {
          items: { include: { product: true }, take: 1 }
        }
      });
    }

    if (session.type === "general" && session.productId) {
      product = await prisma.product.findUnique({
        where: { id: session.productId }
      });
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        type: session.type,
        status: session.status,
        priority: session.priority,
        orderId: session.orderId,
        productId: session.productId,
        customerEmail: session.customerEmail,
        customerName: session.customerName,
        productName: session.productName,
        roomId: session.roomId,
        assignedTo: session.assignedTo,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        lastMessageAt: session.lastMessageAt,
        messageCount: session._count.messages,
        messages: session.messages.map(msg => ({
          id: msg.id,
          sender: msg.sender,
          agentId: msg.agentId,
          agentName: msg.agentName,
          message: msg.message,
          timestamp: msg.timestamp,
          isRead: msg.read
        })),
        order: order ? {
          id: order.id,
          status: order.status,
          total: order.total,
          productName: order.items[0]?.product?.name
        } : null,
        product: product ? {
          id: product.id,
          name: product.name,
          slug: product.slug
        } : null
      }
    });

  } catch (error) {
    console.error("Error fetching chat session:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat session" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/delivery/chat/[sessionId] - Update session (status, priority, etc)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const body = await request.json();
    const { status, priority, assignedTo, roomId } = body;

    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return NextResponse.json(
        { error: "Chat session not found" },
        { status: 404 }
      );
    }

    const updateData: any = {
      updatedAt: new Date()
    };

    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (roomId) updateData.roomId = roomId;

    const updatedSession = await prisma.chatSession.update({
      where: { id: sessionId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: "Session updated",
      session: {
        id: updatedSession.id,
        status: updatedSession.status,
        priority: updatedSession.priority,
        assignedTo: updatedSession.assignedTo,
        roomId: updatedSession.roomId,
        updatedAt: updatedSession.updatedAt
      }
    });

  } catch (error) {
    console.error("Error updating chat session:", error);
    return NextResponse.json(
      { error: "Failed to update chat session" },
      { status: 500 }
    );
  }
}
