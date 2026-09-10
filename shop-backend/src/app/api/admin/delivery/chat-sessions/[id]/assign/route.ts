import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/admin/delivery/chat-sessions/[id]/assign - Assign agent to chat
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const body = await request.json();
    const { agentId, agentName } = body;

    if (!agentId) {
      return NextResponse.json(
        { error: "Agent ID required" },
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

    // Update session with assigned agent
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        assignedTo: agentId,
        status: "active",
        updatedAt: new Date()
      }
    });

    // Add system message about assignment
    await prisma.chatMessage.create({
      data: {
        sessionId,
        sender: "system",
        agentId,
        message: `Agent ${agentName || "has"} joined the chat.`,
        timestamp: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: "Agent assigned successfully",
      sessionId,
      assignedTo: agentId,
      type: session.type,
      customerEmail: session.customerEmail
    });

  } catch (error) {
    console.error("Error assigning agent:", error);
    return NextResponse.json(
      { error: "Failed to assign agent" },
      { status: 500 }
    );
  }
}
