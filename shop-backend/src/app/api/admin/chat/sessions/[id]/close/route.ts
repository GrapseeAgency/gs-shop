import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/admin/chat/sessions/:id/close - Close a chat session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Update session status to closed
    const updatedSession = await prisma.chatSession.update({
      where: { id },
      data: {
        status: "closed",
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: "Chat session closed successfully",
      session: {
        id: updatedSession.id,
        status: updatedSession.status,
        updatedAt: updatedSession.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error("Error closing chat session:", error);
    return NextResponse.json(
      { success: false, error: "Failed to close chat session" },
      { status: 500 }
    );
  }
}
