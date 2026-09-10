import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/admin/chat/sessions/:id/messages - Send a message as admin
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content, type = "text" } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: "Message content is required" },
        { status: 400 }
      );
    }

    // Verify session exists
    const session = await prisma.chatSession.findUnique({
      where: { id }
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Chat session not found" },
        { status: 404 }
      );
    }

    // Create message
    const message = await prisma.chatMessage.create({
      data: {
        sessionId: id,
        message: content.trim(),
        sender: "AGENT",
        agentId: "admin", // TODO: Get actual admin ID from auth
        agentName: "Grapsee Support",
        read: true,
        timestamp: new Date()
      }
    });

    // Update session lastMessageAt
    await prisma.chatSession.update({
      where: { id },
      data: {
        lastMessageAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: message.id,
        senderId: "admin",
        content: message.message,
        type,
        timestamp: message.timestamp.toISOString(),
        isRead: message.read
      }
    });

  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    );
  }
}
