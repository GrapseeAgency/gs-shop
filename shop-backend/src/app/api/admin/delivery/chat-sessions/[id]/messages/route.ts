import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/delivery/chat-sessions/[id]/messages - Get chat messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
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
        }
      }
    });

    if (!session) {
      return NextResponse.json(
        { error: "Chat session not found" },
        { status: 404 }
      );
    }

    // Mark messages as read
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
        total: session.messages.length
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

// POST /api/admin/delivery/chat-sessions/[id]/messages - Admin sends message
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    const body = await request.json();
    const { message, agentId, agentName } = body;

    if (!message || !agentId) {
      return NextResponse.json(
        { error: "Message and agentId required" },
        { status: 400 }
      );
    }

    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return NextResponse.json(
        { error: "Chat session not found" },
        { status: 404 }
      );
    }

    const newMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        sender: "agent",
        agentId,
        agentName,
        message,
        timestamp: new Date()
      }
    });

    // Update last message time
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        lastMessageAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Notify customer (placeholder for notification system)
    console.log(`[AGENT_MESSAGE] Session: ${sessionId}, Agent: ${agentName || agentId}`);

    return NextResponse.json({
      success: true,
      messageId: newMessage.id,
      sessionId,
      sentAt: newMessage.timestamp
    });

  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
