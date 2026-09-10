import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/admin/delivery/chat/[sessionId]/room - Update Grapsee room ID
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const body = await request.json();
    const { roomId, websocketUrl } = body;

    if (!roomId) {
      return NextResponse.json(
        { error: "roomId is required" },
        { status: 400 }
      );
    }

    // Verify session exists
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return NextResponse.json(
        { error: "Chat session not found" },
        { status: 404 }
      );
    }

    // Update room ID
    const updatedSession = await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        roomId,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: "Chat room linked successfully",
      sessionId,
      orderId: updatedSession.orderId,
      roomId: updatedSession.roomId,
      websocketUrl: websocketUrl || null,
      customerEmail: updatedSession.customerEmail
    });

  } catch (error) {
    console.error("Error updating chat room:", error);
    return NextResponse.json(
      { error: "Failed to update chat room" },
      { status: 500 }
    );
  }
}

// GET /api/admin/delivery/chat/[sessionId]/room - Get room details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return NextResponse.json(
        { error: "Chat session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      sessionId,
      orderId: session.orderId,
      roomId: session.roomId,
      hasRoom: !!session.roomId,
      customerEmail: session.customerEmail,
      productName: session.productName,
      status: session.status
    });

  } catch (error) {
    console.error("Error fetching chat room:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat room" },
      { status: 500 }
    );
  }
}
