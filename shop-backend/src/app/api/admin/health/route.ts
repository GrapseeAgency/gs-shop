import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/health - Basic health check (no auth required)
export async function GET(request: NextRequest) {
  try {
    // Check database connection
    let databaseStatus = "connected";
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      databaseStatus = "disconnected";
    }

    return NextResponse.json({
      status: databaseStatus === "connected" ? "ok" : "error",
      service: "shop-backend",
      timestamp: new Date().toISOString(),
      database: databaseStatus,
      version: "1.0.0",
      uptime: process.uptime()
    });

  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json(
      { 
        status: "error",
        service: "shop-backend",
        timestamp: new Date().toISOString(),
        database: "error",
        version: "1.0.0",
        error: "Internal error"
      },
      { status: 500 }
    );
  }
}
