import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/admin/delivery/chat/[sessionId]/reply - Agent sends reply (alias for messages)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
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

    if (session.status === "closed") {
      return NextResponse.json(
        { error: "Cannot reply to closed chat session" },
        { status: 400 }
      );
    }

    // Create the reply message
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

    // If session was waiting, mark it active
    if (session.status === "waiting") {
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { status: "active" }
      });
    }

    return NextResponse.json({
      success: true,
      message: "Reply sent successfully",
      messageId: newMessage.id,
      sessionId,
      type: session.type,
      customerEmail: session.customerEmail,
      sentAt: newMessage.timestamp
    });

  } catch (error) {
    console.error("Error sending reply:", error);
    return NextResponse.json(
      { error: "Failed to send reply" },
      { status: 500 }
    );
  }
}
