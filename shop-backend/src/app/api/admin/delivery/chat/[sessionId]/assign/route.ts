import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/admin/delivery/chat/[sessionId]/assign - Assign agent to chat
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
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
        agentName,
        message: agentName 
          ? `Agent ${agentName} has joined the chat.`
          : "An agent has joined the chat.",
        timestamp: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: "Agent assigned successfully",
      sessionId,
      assignedTo: agentId,
      agentName: agentName || null,
      type: session.type,
      customerEmail: session.customerEmail,
      previousStatus: session.status
    });

  } catch (error) {
    console.error("Error assigning agent:", error);
    return NextResponse.json(
      { error: "Failed to assign agent" },
      { status: 500 }
    );
  }
}
