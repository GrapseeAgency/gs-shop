import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/delivery/github/status?orderId=xxx
 * Check GitHub access status for an order
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing orderId" },
        { status: 400 }
      );
    }

    const githubAccess = await prisma.gitHubAccess.findUnique({
      where: { orderId }
    });

    if (!githubAccess) {
      return NextResponse.json({
        success: true,
        status: "not_requested",
        message: "No GitHub access request found"
      });
    }

    return NextResponse.json({
      success: true,
      status: githubAccess.status, // "not_requested", "pending", "invitation_sent", "granted", "revoked"
      username: githubAccess.username,
      repoUrl: githubAccess.repoUrl,
      grantedAt: githubAccess.grantedAt,
      createdAt: githubAccess.createdAt,
      message: getStatusMessage(githubAccess.status)
    });

  } catch (error) {
    console.error("[GITHUB_STATUS] Error:", error);
    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 }
    );
  }
}

function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    not_requested: "No GitHub access requested yet",
    pending: "GitHub access request pending",
    invitation_sent: "GitHub invitation sent! Check your email",
    granted: "GitHub access granted",
    revoked: "GitHub access revoked"
  };
  return messages[status] || "Unknown status";
}
