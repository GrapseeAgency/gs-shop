import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/admin/delivery/chat/[sessionId]/close - Close chat session
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const body = await request.json();
    const { reason, closedBy } = body;

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
      return NextResponse.json({
        success: true,
        message: "Chat session already closed",
        sessionId,
        closedAt: session.updatedAt
      });
    }

    // Update session status
    const updatedSession = await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        status: "closed",
        updatedAt: new Date()
      }
    });

    // Add system message about closure
    await prisma.chatMessage.create({
      data: {
        sessionId,
        sender: "system",
        agentId: closedBy || null,
        message: reason 
          ? `Chat closed: ${reason}`
          : "Chat session has been closed. Thank you for chatting with us!",
        timestamp: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: "Chat session closed",
      sessionId,
      type: session.type,
      status: "closed",
      closedAt: updatedSession.updatedAt,
      reason: reason || null
    });

  } catch (error) {
    console.error("Error closing chat session:", error);
    return NextResponse.json(
      { error: "Failed to close chat session" },
      { status: 500 }
    );
  }
}
