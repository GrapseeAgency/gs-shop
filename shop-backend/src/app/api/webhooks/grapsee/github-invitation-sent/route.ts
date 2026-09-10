import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Webhook endpoint for Grapsee to notify when GitHub invitation is sent
 * POST /api/webhooks/grapsee/github-invitation-sent
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, username, repoUrl, invitedAt, success } = body;

    console.log("[WEBHOOK] GitHub invitation sent notification:", {
      orderId,
      username,
      repoUrl,
      invitedAt,
      success
    });

    if (!orderId || !username) {
      return NextResponse.json(
        { error: "Missing required fields: orderId, username" },
        { status: 400 }
      );
    }

    // Update GitHubAccess record to mark invitation as sent
    const githubAccess = await prisma.gitHubAccess.upsert({
      where: { orderId },
      update: {
        status: "invitation_sent", // New status: invitation emailed
        username,
        repoUrl,
        updatedAt: new Date()
      },
      create: {
        orderId,
        username,
        repoUrl: repoUrl || "",
        productId: body.productId || "",
        status: "invitation_sent"
      }
    });

    console.log("[WEBHOOK] Updated GitHubAccess:", {
      id: githubAccess.id,
      orderId: githubAccess.orderId,
      status: githubAccess.status
    });

    return NextResponse.json({
      success: true,
      message: "Invitation status updated",
      orderId,
      status: "invitation_sent"
    });

  } catch (error) {
    console.error("[WEBHOOK] Error processing invitation notification:", error);
    return NextResponse.json(
      { error: "Failed to process webhook", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Allow CORS for Grapsee backend
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
