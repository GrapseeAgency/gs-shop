import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/delivery/chat-sessions - List all chat sessions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status") || undefined;
    const type = searchParams.get("type") || undefined; // 'general' | 'paid'
    const hasNoRoom = searchParams.get("hasNoRoom") === "true";
    const unassigned = searchParams.get("unassigned") === "true";
    const priority = searchParams.get("priority") || undefined; // 'low' | 'normal' | 'high'

    // Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (hasNoRoom) where.roomId = null;
    if (unassigned) where.assignedTo = null;
    if (priority) where.priority = priority;

    // Get chat sessions
    const sessions = await prisma.chatSession.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { lastMessageAt: "desc" },
      include: {
        _count: { select: { messages: true } },
        messages: {
          orderBy: { timestamp: "desc" },
          take: 1
        }
      }
    });

    // Enrich with order/product details
    const enrichedSessions = await Promise.all(
      sessions.map(async (session) => {
        let order = null;
        let product = null;

        // Only fetch order for paid chats
        if (session.type === "paid" && session.orderId) {
          order = await prisma.order.findUnique({
            where: { id: session.orderId },
            include: {
              items: { include: { product: true }, take: 1 }
            }
          });
        }

        // Fetch product for general chats
        if (session.type === "general" && session.productId) {
          product = await prisma.product.findUnique({
            where: { id: session.productId }
          });
        }

        const lastMessage = session.messages[0];

        return {
          id: session.id,
          type: session.type,
          orderId: session.orderId,
          productId: session.productId,
          roomId: session.roomId,
          customerEmail: session.customerEmail,
          customerName: session.customerName,
          productName: session.productName,
          status: session.status,
          priority: session.priority,
          assignedTo: session.assignedTo,
          messageCount: session._count.messages,
          lastMessageAt: lastMessage?.timestamp || session.lastMessageAt,
          lastMessagePreview: lastMessage?.message?.substring(0, 100) || null,
          lastMessageSender: lastMessage?.sender || null,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          needsGrapseeRoom: !session.roomId && session.status === "active",
          order: order ? {
            id: order.id,
            status: order.status,
            total: order.total,
            productName: order.items[0]?.product?.name
          } : null,
          product: product ? {
            id: product.id,
            name: product.name,
            slug: product.slug
          } : null
        };
      })
    );

    // Get stats by type
    const totalSessions = await prisma.chatSession.count({ where });
    const generalCount = await prisma.chatSession.count({ where: { type: "general" } });
    const paidCount = await prisma.chatSession.count({ where: { type: "paid" } });
    const activeSessions = await prisma.chatSession.count({ where: { ...where, status: "active" } });
    const waitingCount = await prisma.chatSession.count({ where: { status: "waiting", assignedTo: null } });
    const highPriority = await prisma.chatSession.count({ where: { priority: "high", status: "active" } });
    const needsRoom = await prisma.chatSession.count({ where: { roomId: null, status: "active" } });

    return NextResponse.json({
      success: true,
      filter: { type, status, unassigned },
      pagination: {
        page,
        limit,
        total: enrichedSessions.length,
        hasMore: enrichedSessions.length === limit
      },
      stats: {
        totalSessions,
        generalCount,
        paidCount,
        activeSessions,
        waitingForAgent: waitingCount,
        highPriority,
        needsGrapseeRoom: needsRoom
      },
      sessions: enrichedSessions
    });

  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat sessions" },
      { status: 500 }
    );
  }
}
