import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/chat/sessions - List all chat sessions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // 'general' | 'paid' | null (all)
    const status = searchParams.get("status"); // 'active' | 'closed' | 'waiting' | null (all)

    // Build where clause
    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;

    // Get chat sessions with relations
    const sessions = await prisma.chatSession.findMany({
      where,
      orderBy: { lastMessageAt: "desc" },
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
          orderBy: { timestamp: "desc" },
          take: 1
        },
        _count: {
          select: { messages: true }
        }
      }
    });

    // Transform to match frontend structure
    const transformedSessions = sessions.map((session) => {
      const lastMessage = session.messages[0];
      const user = session.user;
      
      // Determine if user is paid customer
      const isPaidCustomer = session.type === "paid" || (user?._count.orders || 0) > 0;
      
      // Build user object
      const chatUser = user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || user.image,
        isOnline: false, // TODO: Implement online status tracking
        lastSeen: null, // TODO: Implement last seen tracking
        isPaidCustomer,
        orderCount: user._count.orders || 0
      } : {
        id: session.customerEmail, // Use email as ID for guest users
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

      return {
        id: session.id,
        user: chatUser,
        messages,
        unreadCount: session.unreadCount,
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          senderId: lastMessage.sender === "AGENT" ? "admin" : (lastMessage.userId || "customer"),
          content: lastMessage.message,
          type: "text" as const,
          timestamp: lastMessage.timestamp.toISOString(),
          isRead: lastMessage.read
        } : undefined,
        createdAt: session.createdAt.toISOString(),
        status: session.status as "active" | "closed" | "pending"
      };
    });

    return NextResponse.json({
      success: true,
      sessions: transformedSessions
    });

  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch chat sessions" },
      { status: 500 }
    );
  }
}
