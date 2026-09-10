import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/chat/sessions/:id - Get single chat session with all messages
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await prisma.chatSession.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            image: true,
            _count: {
              select: { orders: true }
            }
          }
        },
        order: {
          select: {
            id: true,
            status: true,
            total: true,
            items: {
              include: { product: true },
              take: 1
            }
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            imageUrl: true
          }
        },
        messages: {
          orderBy: { timestamp: "asc" }
        },
        _count: {
          select: { messages: true }
        }
      }
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Chat session not found" },
        { status: 404 }
      );
    }

    const user = session.user;
    
    // Determine if user is paid customer
    const isPaidCustomer = session.type === "paid" || (user?._count.orders || 0) > 0;
    
    // Build user object
    const chatUser = user ? {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || user.image,
      isOnline: false,
      lastSeen: null,
      isPaidCustomer,
      orderCount: user._count.orders || 0
    } : {
      id: session.customerEmail,
      name: session.customerName || "Guest",
      email: session.customerEmail,
      avatar: null,
      isOnline: false,
      lastSeen: null,
      isPaidCustomer: session.type === "paid",
      orderCount: session.order ? 1 : 0
    };

    // Build messages array
    const messages = session.messages.map((msg) => ({
      id: msg.id,
      senderId: msg.sender === "AGENT" ? "admin" : (msg.userId || "customer"),
      content: msg.message,
      type: "text" as const,
      timestamp: msg.timestamp.toISOString(),
      isRead: msg.read
    }));

    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : undefined;

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        user: chatUser,
        messages,
        unreadCount: session.unreadCount,
        lastMessage,
        createdAt: session.createdAt.toISOString(),
        status: session.status as "active" | "closed" | "pending"
      }
    });

  } catch (error) {
    console.error("Error fetching chat session:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch chat session" },
      { status: 500 }
    );
  }
}
