import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/delivery/chat/[sessionId]/messages - Get all messages for a session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { timestamp: "asc" },
          skip: (page - 1) * limit,
          take: limit
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

    // Mark unread messages as read
    await prisma.chatMessage.updateMany({
      where: {
        sessionId,
        sender: { not: "agent" },
        read: false
      },
      data: { read: true }
    });

    return NextResponse.json({
      success: true,
      sessionId,
      type: session.type,
      status: session.status,
      customerEmail: session.customerEmail,
      customerName: session.customerName,
      productName: session.productName,
      assignedTo: session.assignedTo,
      pagination: {
        page,
        limit,
        total: session._count.messages,
        hasMore: session.messages.length === limit
      },
      messages: session.messages.map(msg => ({
        id: msg.id,
        sender: msg.sender,
        agentId: msg.agentId,
        agentName: msg.agentName,
        message: msg.message,
        timestamp: msg.timestamp,
        isRead: msg.read
      }))
    });

  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
