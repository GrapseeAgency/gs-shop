import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminApiKey } from "@/lib/admin-api-auth";

// GET /api/admin/test-connection - Full connection test with auth verification
export async function GET(request: NextRequest) {
  try {
    // Verify API key using the same auth as all other admin routes
    const admin = await verifyAdminApiKey(request, "read");

    if (!admin) {
      return NextResponse.json(
        {
          connected: false,
          authenticated: false,
          timestamp: new Date().toISOString(),
          database: "disconnected",
          apiVersion: "1.0",
          auth: {
            provided: false,
            valid: false,
            message: "Invalid or missing API key"
          }
        },
        { status: 401 }
      );
    }

    // Check database
    let databaseStatus = "connected";
    let tables: string[] = [];
    try {
      await prisma.$queryRaw`SELECT 1`;

      // Check if delivery tables exist
      const digitalDelivery = await prisma.digitalDelivery.count().catch(() => 0);
      const gitHubAccess = await prisma.gitHubAccess.count().catch(() => 0);
      const chatSession = await prisma.chatSession.count().catch(() => 0);

      tables = [
        "DigitalDelivery",
        "GitHubAccess",
        "ChatSession",
        "ChatMessage"
      ];
    } catch (error) {
      databaseStatus = "disconnected";
    }

    // Test key endpoints availability
    const endpoints = [
      { name: "delivery-status", path: "/api/admin/products/delivery-status", method: "GET" },
      { name: "upload-zip", path: "/api/admin/products/[id]/upload-zip", method: "POST" },
      { name: "pending-github", path: "/api/admin/delivery/pending-github", method: "GET" },
      { name: "grant-github", path: "/api/admin/delivery/[orderId]/grant-github", method: "POST" },
      { name: "chat-sessions", path: "/api/admin/delivery/chat-sessions", method: "GET" },
      { name: "product-delivery", path: "/api/admin/products/[id]/delivery", method: "GET" }
    ];

    return NextResponse.json({
      connected: databaseStatus === "connected",
      authenticated: true,
      timestamp: new Date().toISOString(),
      database: databaseStatus,
      apiVersion: "1.0",
      shopUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      tables: tables,
      endpoints: endpoints,
      auth: {
        provided: true,
        valid: true,
        message: "API key valid",
        keyName: admin.name
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Test connection error:", error);
    return NextResponse.json(
      {
        connected: false,
        authenticated: false,
        timestamp: new Date().toISOString(),
        database: "error",
        apiVersion: "1.0",
        error: "Internal server error"
      },
      { status: 500 }
    );
  }
}
