import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyNewChatSession, notifyNewChatMessage } from "@/lib/grapsee-webhook";

// GET /api/chat/general?productId=xxx - Get or create general chat session
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const customerEmail = searchParams.get("email");
    const customerName = searchParams.get("name") || "Visitor";
    const sessionId = searchParams.get("sessionId");

    // If sessionId provided, return existing session
    if (sessionId) {
      const session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: { 
          messages: { 
            orderBy: { timestamp: "asc" } 
          } 
        }
      });

      if (!session || session.type !== "general") {
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        type: "general",
        chatSession: {
          id: session.id,
          productId: session.productId,
          customerEmail: session.customerEmail,
          customerName: session.customerName,
          productName: session.productName,
          status: session.status,
          priority: session.priority,
          assignedTo: session.assignedTo,
          roomId: session.roomId,
          messages: session.messages.map(msg => ({
            id: msg.id,
            sender: msg.sender,
            message: msg.message,
            timestamp: msg.timestamp,
            isRead: msg.read
          }))
        }
      });
    }

    // Need productId for new general chat
    if (!productId) {
      return NextResponse.json(
        { error: "Product ID required for new chat" },
        { status: 400 }
      );
    }

    // Get product info
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check for existing general chat for this product + email
    let chatSession = null;
    if (customerEmail) {
      chatSession = await prisma.chatSession.findFirst({
        where: { 
          type: "general",
          productId,
          customerEmail,
          status: { not: "closed" }
        },
        include: { messages: { orderBy: { timestamp: "asc" } } }
      });
    }

    // Create new session if not found
    if (!chatSession) {
      chatSession = await prisma.chatSession.create({
        data: {
          type: "general",
          productId,
          customerEmail: customerEmail || "anonymous@visitor.com",
          customerName,
          productName: product.name,
          status: "waiting", // Waiting for agent assignment
          priority: "normal",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        include: { messages: true }
      });

      // Add welcome message
      await prisma.chatMessage.create({
        data: {
          sessionId: chatSession.id,
          sender: "system",
          message: `Welcome! Ask us anything about ${product.name}. An agent will be with you shortly.`,
          timestamp: new Date()
        }
      });

      // Notify Grapsee about new general chat (for agent assignment)
      notifyNewChatSession({
        id: chatSession.id,
        type: "general",
        productId: chatSession.productId,
        customerEmail: chatSession.customerEmail,
        customerName: chatSession.customerName,
        productName: chatSession.productName,
        status: chatSession.status,
        priority: chatSession.priority,
        createdAt: chatSession.createdAt
      }).catch(err => console.error("[WEBHOOK_ERROR] Failed to notify new chat:", err));
    }

    return NextResponse.json({
      success: true,
      type: "general",
      isNew: true,
      chatSession: {
        id: chatSession.id,
        productId: chatSession.productId,
        customerEmail: chatSession.customerEmail,
        customerName: chatSession.customerName,
        productName: chatSession.productName,
        status: chatSession.status,
        priority: chatSession.priority,
        assignedTo: chatSession.assignedTo,
        roomId: chatSession.roomId,
        messages: [] // Welcome message added above
      }
    });

  } catch (error) {
    console.error("Error in general chat:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}

// POST /api/chat/general - Send message in general chat
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, message, sender, agentId, action } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 400 }
      );
    }

    const chatSession = await prisma.chatSession.findFirst({
      where: { id: sessionId, type: "general" }
    });

    if (!chatSession) {
      return NextResponse.json(
        { error: "Chat session not found" },
        { status: 404 }
      );
    }

    // Close chat
    if (action === "close") {
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { 
          status: "closed",
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: "Chat closed"
      });
    }

    // Assign agent
    if (action === "assign" && agentId) {
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { 
          assignedTo: agentId,
          status: "active",
          updatedAt: new Date()
        }
      });

      // Add system message
      await prisma.chatMessage.create({
        data: {
          sessionId,
          sender: "system",
          message: "An agent has joined the chat.",
          timestamp: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: "Agent assigned",
        assignedTo: agentId
      });
    }

    // Send message
    if (message) {
      const newMessage = await prisma.chatMessage.create({
        data: {
          sessionId,
          sender: sender || "customer",
          agentId: sender === "agent" ? agentId : null,
          message,
          timestamp: new Date()
        }
      });

      // Update last message time
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { 
          lastMessageAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Notify Grapsee (for real-time delivery to agent if assigned, or for queue)
      notifyNewChatMessage({
        sessionId,
        sessionType: "general",
        messageId: newMessage.id,
        sender: sender || "customer",
        message,
        timestamp: newMessage.timestamp,
        assignedTo: chatSession.assignedTo,
        customerEmail: chatSession.customerEmail
      }).catch(err => console.error("[WEBHOOK_ERROR] Failed to notify message:", err));

      return NextResponse.json({
        success: true,
        message: "Message sent",
        messageId: newMessage.id
      });
    }

    return NextResponse.json({
      success: true,
      chatSession: {
        id: chatSession.id,
        status: chatSession.status,
        assignedTo: chatSession.assignedTo
      }
    });

  } catch (error) {
    console.error("Error in general chat:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
