import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyNewChatSession, notifyNewChatMessage } from "@/lib/grapsee-webhook";

// GET /api/delivery/chat?orderId=xxx - Get chat messages and status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID required" },
        { status: 400 }
      );
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } }
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Get or create PAID chat session
    let chatSession = await prisma.chatSession.findFirst({
      where: { orderId, type: "paid" },
      include: { messages: { orderBy: { timestamp: "asc" } } }
    });

    if (!chatSession) {
      chatSession = await prisma.chatSession.create({
        data: {
          type: "paid",
          orderId,
          customerEmail: order.customerEmail,
          customerName: order.customerName,
          productName: order.items[0]?.product?.name || "Unknown",
          status: "active",
          priority: "high", // Paid chats are high priority
          createdAt: new Date(),
          updatedAt: new Date()
        },
        include: { messages: true }
      });

      // Add welcome message from engineer
      await prisma.chatMessage.create({
        data: {
          sessionId: chatSession.id,
          sender: "engineer",
          message: `Hi ${order.customerName || "there"}! I'm your assigned engineer for the ${order.items[0]?.product?.name} project. How would you like to receive your delivery?`,
          timestamp: new Date()
        }
      });

      // Notify Grapsee about new paid chat session
      notifyNewChatSession({
        id: chatSession.id,
        type: "paid",
        orderId: chatSession.orderId,
        customerEmail: chatSession.customerEmail,
        customerName: chatSession.customerName,
        productName: chatSession.productName,
        status: chatSession.status,
        priority: chatSession.priority,
        createdAt: chatSession.createdAt
      }).catch(err => console.error("[WEBHOOK_ERROR] Failed to notify paid chat:", err));
    }

    return NextResponse.json({
      success: true,
      orderId,
      chatSession: {
        id: chatSession.id,
        status: chatSession.status,
        engineerName: "Senior Engineer",
        engineerAvatar: "/avatars/engineer.png",
        messages: chatSession.messages.map(msg => ({
          id: msg.id,
          sender: msg.sender,
          message: msg.message,
          timestamp: msg.timestamp,
          attachments: []
        }))
      }
    });

  } catch (error) {
    console.error("Error fetching chat:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat" },
      { status: 500 }
    );
  }
}

// POST /api/delivery/chat - Send message or create chat
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, message, action } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID required" },
        { status: 400 }
      );
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } }
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Get or create PAID chat session
    let chatSession = await prisma.chatSession.findFirst({
      where: { orderId, type: "paid" }
    });

    if (!chatSession) {
      chatSession = await prisma.chatSession.create({
        data: {
          type: "paid",
          orderId,
          customerEmail: order.customerEmail,
          customerName: order.customerName,
          productName: order.items[0]?.product?.name || "Unknown",
          status: "active",
          priority: "high",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    if (action === "send" && message) {
      // Store customer message
      await prisma.chatMessage.create({
        data: {
          sessionId: chatSession.id,
          sender: "customer",
          message,
          timestamp: new Date()
        }
      });

      // Generate engineer response (in production, this would notify real engineer)
      const responses = [
        "I'll prepare the files for you right away. What format do you prefer?",
        "Thanks for your message! I'm working on your delivery now.",
        "I can help you with that. Let me check the project requirements.",
        "Perfect! I'll make sure you get exactly what you need.",
        "Got it! I'll send you the files within the next few hours."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      // Simulate engineer response after short delay
      // Note: In production, this would call Grapsee chat API
      setTimeout(async () => {
        try {
          await prisma.chatMessage.create({
            data: {
              sessionId: chatSession.id,
              sender: "engineer",
              message: randomResponse,
              timestamp: new Date()
            }
          });
          console.log(`[CHAT_AUTO_REPLY] Order: ${orderId}, Session: ${chatSession.id}`);

      // Notify Grapsee about customer message
      notifyNewChatMessage({
        sessionId: chatSession.id,
        sessionType: "paid",
        messageId: newMessage.id,
        sender: "customer",
        message,
        timestamp: newMessage.timestamp,
        assignedTo: chatSession.assignedTo,
        customerEmail: chatSession.customerEmail
      }).catch(err => console.error("[WEBHOOK_ERROR] Failed to notify message:", err));
        } catch (err) {
          console.error("[CHAT_AUTO_REPLY_ERROR]", err);
        }
      }, 1000);

      return NextResponse.json({
        success: true,
        message: "Message sent",
        chatSessionId: chatSession.id
      });
    }

    if (action === "close") {
      await prisma.chatSession.update({
        where: { id: chatSession.id },
        data: { 
          status: "closed",
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: "Chat session closed"
      });
    }

    return NextResponse.json({
      success: true,
      chatSession: {
        id: chatSession.id,
        status: chatSession.status,
        engineerName: "Senior Engineer",
        product: order.items[0]?.product?.name
      }
    });

  } catch (error) {
    console.error("Error in chat:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
